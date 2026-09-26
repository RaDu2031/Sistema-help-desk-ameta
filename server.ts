import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import {
  createChamadoRecord,
  createUserWithCredentials,
  getAllChamados,
  getAllUsers,
  getChamadoByNumero,
  getOrCreateUser,
  getUserByEmail,
  updateChamadoFields,
  updateUserRole,
} from './src/db/users.ts';

const DOMINIO_PERMITIDO = '@ametaservicos.com.br';

function emailValido(email: string): boolean {
  return email.trim().toLowerCase().endsWith(DOMINIO_PERMITIDO);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // POST /api/auth/google -> Sincroniza usuário autenticado via Firebase Google Sign-In no Cloud SQL
  app.post('/api/auth/google', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email;
      if (!uid || !email) {
        res.status(400).json({ error: 'Dados de autenticação Google ausentes.' });
        return;
      }

      const dbUser = await getOrCreateUser(uid, email);
      const todosChamados = await getAllChamados();
      const todosUsuarios = await getAllUsers();

      const tipo = (dbUser.tipo === 'admin' ? 'admin' : 'usuario') as
        | 'admin'
        | 'usuario';
      const chamadosVisiveis =
        tipo === 'admin'
          ? todosChamados
          : todosChamados.filter(
              (c) => c['Aberto por'].toLowerCase() === dbUser.email.toLowerCase()
            );

      res.json({
        usuario: { email: dbUser.email, tipo },
        chamados: chamadosVisiveis,
        usuarios:
          tipo === 'admin'
            ? todosUsuarios.map((u) => ({
                email: u.email,
                tipo: (u.tipo === 'admin' ? 'admin' : 'usuario') as
                  | 'admin'
                  | 'usuario',
              }))
            : [],
      });
    } catch (error: any) {
      console.error('Failed to authenticate Google user:', error);
      res
        .status(500)
        .json({ error: error.message || 'Falha ao autenticar usuário.' });
    }
  });

  // POST /api/login -> Autentica usuário corporativo no Cloud SQL
  app.post('/api/login', async (req, res) => {
    try {
      const { email, senha } = req.body ?? {};
      const cleanEmail = String(email ?? '').trim().toLowerCase();
      const cleanSenha = String(senha ?? '');

      const usuario = await getUserByEmail(cleanEmail);
      if (!usuario || usuario.senha !== cleanSenha) {
        res.status(401).json({ error: 'Usuário ou senha incorretos.' });
        return;
      }

      const tipo = (usuario.tipo === 'admin' ? 'admin' : 'usuario') as
        | 'admin'
        | 'usuario';
      const todosChamados = await getAllChamados();
      const todosUsuarios = await getAllUsers();

      const chamadosVisiveis =
        tipo === 'admin'
          ? todosChamados
          : todosChamados.filter(
              (c) =>
                c['Aberto por'].toLowerCase() === usuario.email.toLowerCase()
            );

      const sessionToken = `ameta_corp_${Buffer.from(
        usuario.email,
        'utf-8'
      ).toString('base64')}`;

      res.json({
        token: sessionToken,
        usuario: { email: usuario.email, tipo },
        chamados: chamadosVisiveis,
        usuarios:
          tipo === 'admin'
            ? todosUsuarios.map((u) => ({
                email: u.email,
                tipo: (u.tipo === 'admin' ? 'admin' : 'usuario') as
                  | 'admin'
                  | 'usuario',
              }))
            : [],
      });
    } catch (error: any) {
      console.error('Failed to login user:', error);
      res
        .status(500)
        .json({ error: error.message || 'Erro ao realizar login.' });
    }
  });

  // POST /api/register -> Cadastro público restrito ao perfil "usuario" no Cloud SQL
  app.post('/api/register', async (req, res) => {
    try {
      const { email, senha } = req.body ?? {};
      const cleanEmail = String(email ?? '').trim().toLowerCase();
      const cleanSenha = String(senha ?? '').trim();

      if (!cleanEmail || !cleanSenha) {
        res.status(400).json({ error: 'Este campo não pode ficar vazio.' });
        return;
      }

      if (!emailValido(cleanEmail)) {
        res.status(400).json({
          error: `E-mail inválido. Use um e-mail terminado em ${DOMINIO_PERMITIDO}`,
        });
        return;
      }

      const existente = await getUserByEmail(cleanEmail);
      if (existente) {
        res.status(409).json({
          error: 'Já existe um usuário cadastrado com este e-mail corporativo.',
        });
        return;
      }

      const criado = await createUserWithCredentials(
        cleanEmail,
        cleanSenha,
        'usuario'
      );

      res.status(201).json({
        message: 'Usuário cadastrado com sucesso!',
        usuario: criado
          ? { email: criado.email, tipo: 'usuario' }
          : { email: cleanEmail, tipo: 'usuario' },
      });
    } catch (error: any) {
      console.error('Failed to register user:', error);
      res
        .status(500)
        .json({ error: error.message || 'Erro ao cadastrar usuário.' });
    }
  });

  // GET /api/state -> Retorna chamados e usuários do Cloud SQL filtrados pelo usuário autenticado
  app.get('/api/state', requireAuth, async (req: AuthRequest, res) => {
    try {
      const email = String(req.user?.email ?? req.query.email ?? '')
        .trim()
        .toLowerCase();
      const dbUser = email ? await getUserByEmail(email) : null;
      const tipo = dbUser?.tipo === 'admin' ? 'admin' : 'usuario';

      const todosChamados = await getAllChamados();
      const todosUsuarios = await getAllUsers();

      const chamadosVisiveis =
        tipo === 'admin'
          ? todosChamados
          : todosChamados.filter(
              (c) => c['Aberto por'].toLowerCase() === email
            );

      res.json({
        usuarios:
          tipo === 'admin'
            ? todosUsuarios.map((u) => ({
                email: u.email,
                tipo: (u.tipo === 'admin' ? 'admin' : 'usuario') as
                  | 'admin'
                  | 'usuario',
              }))
            : [],
        chamados: chamadosVisiveis,
        dominioPermitido: DOMINIO_PERMITIDO,
      });
    } catch (error: any) {
      console.error('Failed to fetch state:', error);
      res
        .status(500)
        .json({ error: error.message || 'Erro ao carregar dados.' });
    }
  });

  // POST /api/usuarios -> Cadastrar usuário (autenticado)
  app.post('/api/usuarios', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { email, senha, tipo } = req.body ?? {};
      const cleanEmail = String(email ?? '').trim().toLowerCase();
      const cleanSenha = String(senha ?? '').trim();
      const cleanTipo = String(tipo ?? 'usuario').trim().toLowerCase();

      if (!cleanEmail || !cleanSenha) {
        res.status(400).json({ error: 'Este campo não pode ficar vazio.' });
        return;
      }

      if (!emailValido(cleanEmail)) {
        res.status(400).json({
          error: `E-mail inválido. Use um e-mail terminado em ${DOMINIO_PERMITIDO}`,
        });
        return;
      }

      if (cleanTipo !== 'admin' && cleanTipo !== 'usuario') {
        res.status(400).json({
          error: 'Tipo de usuário inválido. Escolha entre admin ou usuario.',
        });
        return;
      }

      const existente = await getUserByEmail(cleanEmail);
      if (existente) {
        res.status(409).json({
          error: 'Já existe um usuário cadastrado com este e-mail corporativo.',
        });
        return;
      }

      const novoUsuario = await createUserWithCredentials(
        cleanEmail,
        cleanSenha,
        cleanTipo as 'admin' | 'usuario'
      );

      const todosUsuarios = await getAllUsers();

      res.status(201).json({
        message: 'Usuário cadastrado com sucesso!',
        usuario: novoUsuario
          ? { email: novoUsuario.email, tipo: novoUsuario.tipo }
          : { email: cleanEmail, tipo: cleanTipo },
        usuarios: todosUsuarios.map((u) => ({
          email: u.email,
          tipo: u.tipo as 'admin' | 'usuario',
        })),
      });
    } catch (error: any) {
      console.error('Failed to create user:', error);
      res
        .status(500)
        .json({ error: error.message || 'Erro ao cadastrar usuário.' });
    }
  });

  // PATCH /api/usuarios/tipo -> Permite ao admin definir quem é admin ou usuario
  app.patch('/api/usuarios/tipo', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { email, tipo } = req.body ?? {};
      const cleanEmail = String(email ?? '').trim().toLowerCase();
      const cleanTipo = String(tipo ?? '').trim().toLowerCase();

      if (cleanTipo !== 'admin' && cleanTipo !== 'usuario') {
        res.status(400).json({
          error: 'Tipo inválido. Use admin ou usuario.',
        });
        return;
      }

      const atualizado = await updateUserRole(
        cleanEmail,
        cleanTipo as 'admin' | 'usuario'
      );
      if (!atualizado) {
        res.status(404).json({ error: 'Usuário não encontrado!' });
        return;
      }

      const todosUsuarios = await getAllUsers();

      res.json({
        message: `Perfil de ${atualizado.email} atualizado para ${atualizado.tipo}.`,
        usuario: { email: atualizado.email, tipo: atualizado.tipo },
        usuarios: todosUsuarios.map((u) => ({
          email: u.email,
          tipo: u.tipo as 'admin' | 'usuario',
        })),
      });
    } catch (error: any) {
      console.error('Failed to update user role:', error);
      res
        .status(500)
        .json({ error: error.message || 'Erro ao atualizar perfil.' });
    }
  });

  // POST /api/chamados -> Abrir chamado no Cloud SQL com suporte a FotoErro
  app.post('/api/chamados', requireAuth, async (req: AuthRequest, res) => {
    try {
      const {
        abertoPor,
        Assunto,
        Descricao,
        Plataforma,
        Celular,
        EmailContato,
        FotoErro,
        NomeFotoErro,
      } = req.body ?? {};

      const cleanAbertoPor = String(
        abertoPor ?? req.user?.email ?? ''
      ).trim();
      const cleanAssunto = String(Assunto ?? '').trim();
      const cleanDescricao = String(Descricao ?? '').trim();
      const cleanPlataforma = String(Plataforma ?? '').trim();
      const cleanCelular = String(Celular ?? '').trim();
      const cleanEmail = String(EmailContato ?? '').trim();

      if (
        !cleanAbertoPor ||
        !cleanAssunto ||
        !cleanDescricao ||
        !cleanPlataforma ||
        !cleanCelular ||
        !cleanEmail
      ) {
        res.status(400).json({
          error:
            'Todos os campos obrigatórios do chamado devem ser preenchidos.',
        });
        return;
      }

      const novoChamado = await createChamadoRecord({
        abertoPor: cleanAbertoPor,
        assunto: cleanAssunto,
        descricao: cleanDescricao,
        plataforma: cleanPlataforma,
        celular: cleanCelular,
        email: cleanEmail,
        fotoErro: FotoErro ? String(FotoErro) : undefined,
        nomeFotoErro: NomeFotoErro ? String(NomeFotoErro) : undefined,
      });

      const usuarioAutor = await getUserByEmail(cleanAbertoPor);
      const isAdmin = usuarioAutor?.tipo === 'admin';
      const todosChamados = await getAllChamados();
      const chamadosVisiveis = isAdmin
        ? todosChamados
        : todosChamados.filter(
            (c) =>
              c['Aberto por'].toLowerCase() === cleanAbertoPor.toLowerCase()
          );

      res.status(201).json({
        message: `Chamado criado! Número do chamado: ${novoChamado.Numero}`,
        chamado: novoChamado,
        chamados: chamadosVisiveis,
      });
    } catch (error: any) {
      console.error('Failed to create ticket:', error);
      res
        .status(500)
        .json({ error: error.message || 'Erro ao abrir chamado.' });
    }
  });

  // POST /api/chamados/:numero/responder -> Admin responde ao solicitante
  app.post(
    '/api/chamados/:numero/responder',
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const numero = Number(req.params.numero);
        const existente = await getChamadoByNumero(numero);
        if (!existente) {
          res.status(404).json({ error: 'Chamado não encontrado!' });
          return;
        }

        const { RespostaAdmin, RespondidoPor, Status } = req.body ?? {};
        const cleanResposta = String(RespostaAdmin ?? '').trim();
        if (!cleanResposta) {
          res.status(400).json({
            error: 'Digite a resposta técnica para o solicitante.',
          });
          return;
        }

        const agora = new Date();
        const dataFormatada = agora.toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        const novoStatus =
          Status === 'Aberto' ||
          Status === 'Em andamento' ||
          Status === 'Fechado'
            ? Status
            : existente.Status === 'Aberto'
            ? 'Em andamento'
            : existente.Status;

        const atualizado = await updateChamadoFields(numero, {
          respostaAdmin: cleanResposta,
          respondidoPor: String(
            RespondidoPor ??
              req.user?.email ??
              'rafael.araujo@ametaservicos.com.br'
          ).trim(),
          dataResposta: dataFormatada,
          status: novoStatus,
        });

        const todosChamados = await getAllChamados();

        res.json({
          message: `Resposta enviada ao solicitante ${existente['Aberto por']}!`,
          chamado: atualizado,
          chamados: todosChamados,
        });
      } catch (error: any) {
        console.error('Failed to reply to ticket:', error);
        res
          .status(500)
          .json({ error: error.message || 'Erro ao responder chamado.' });
      }
    }
  );

  // POST /api/chamados/:numero/resolver -> Usuário informa se resolveu o problema
  app.post(
    '/api/chamados/:numero/resolver',
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const numero = Number(req.params.numero);
        const existente = await getChamadoByNumero(numero);
        if (!existente) {
          res.status(404).json({ error: 'Chamado não encontrado!' });
          return;
        }

        const { resolvido } = req.body ?? {};
        const foiResolvido = Boolean(resolvido);

        const atualizado = await updateChamadoFields(numero, {
          resolvidoPeloUsuario: foiResolvido,
          status: foiResolvido ? 'Fechado' : 'Em andamento',
        });

        const todosChamados = await getAllChamados();

        res.json({
          message: foiResolvido
            ? `Problema marcado como resolvido! Chamado #${numero} fechado.`
            : `Sinalizado que o problema persiste. O chamado #${numero} segue em andamento.`,
          chamado: atualizado,
          chamados: todosChamados,
        });
      } catch (error: any) {
        console.error('Failed to resolve ticket:', error);
        res
          .status(500)
          .json({ error: error.message || 'Erro ao atualizar resolução.' });
      }
    }
  );

  // GET /api/chamados/:numero -> Consultar chamado por número
  app.get(
    '/api/chamados/:numero',
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const numero = Number(req.params.numero);
        const email = String(req.user?.email ?? req.query.email ?? '')
          .trim()
          .toLowerCase();
        const dbUser = email ? await getUserByEmail(email) : null;
        const tipo = dbUser?.tipo === 'admin' ? 'admin' : 'usuario';

        const chamado = await getChamadoByNumero(numero);
        if (!chamado) {
          res.status(404).json({ error: 'Chamado não encontrado!' });
          return;
        }

        if (tipo !== 'admin' && chamado['Aberto por'].toLowerCase() !== email) {
          res.status(403).json({
            error:
              'Acesso restrito: você só pode consultar chamados abertos pelo seu próprio e-mail.',
          });
          return;
        }

        res.json({ chamado });
      } catch (error: any) {
        console.error('Failed to fetch ticket:', error);
        res
          .status(500)
          .json({ error: error.message || 'Erro ao consultar chamado.' });
      }
    }
  );

  // PUT /api/chamados/:numero -> Alterar dados do chamado
  app.put(
    '/api/chamados/:numero',
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const numero = Number(req.params.numero);
        const existente = await getChamadoByNumero(numero);
        if (!existente) {
          res.status(404).json({ error: 'Chamado não encontrado!' });
          return;
        }

        const updates: Record<string, string> = {};
        if (
          typeof req.body?.Assunto === 'string' &&
          req.body.Assunto.trim() !== ''
        ) {
          updates.assunto = req.body.Assunto.trim();
        }
        if (
          typeof req.body?.Descricao === 'string' &&
          req.body.Descricao.trim() !== ''
        ) {
          updates.descricao = req.body.Descricao.trim();
        }
        if (
          typeof req.body?.Plataforma === 'string' &&
          req.body.Plataforma.trim() !== ''
        ) {
          updates.plataforma = req.body.Plataforma.trim();
        }
        if (
          typeof req.body?.Celular === 'string' &&
          req.body.Celular.trim() !== ''
        ) {
          updates.celular = req.body.Celular.trim();
        }
        if (
          typeof req.body?.['E-mail'] === 'string' &&
          req.body['E-mail'].trim() !== ''
        ) {
          updates.email = req.body['E-mail'].trim();
        }

        const atualizado = await updateChamadoFields(numero, updates);
        const todosChamados = await getAllChamados();

        res.json({
          message: 'Chamado atualizado com sucesso!',
          chamado: atualizado,
          chamados: todosChamados,
        });
      } catch (error: any) {
        console.error('Failed to update ticket:', error);
        res
          .status(500)
          .json({ error: error.message || 'Erro ao atualizar chamado.' });
      }
    }
  );

  // PATCH /api/chamados/:numero/status -> Alterar status do chamado
  app.patch(
    '/api/chamados/:numero/status',
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const numero = Number(req.params.numero);
        const existente = await getChamadoByNumero(numero);
        if (!existente) {
          res.status(404).json({ error: 'Chamado não encontrado!' });
          return;
        }

        const novoStatus = String(req.body?.Status ?? '').trim();
        if (
          novoStatus !== 'Aberto' &&
          novoStatus !== 'Em andamento' &&
          novoStatus !== 'Fechado'
        ) {
          res.status(400).json({
            error: 'Status inválido. Use Aberto, Em andamento ou Fechado.',
          });
          return;
        }

        const atualizado = await updateChamadoFields(numero, {
          status: novoStatus,
        });
        const todosChamados = await getAllChamados();

        res.json({
          message: 'Status atualizado com sucesso!',
          chamado: atualizado,
          chamados: todosChamados,
        });
      } catch (error: any) {
        console.error('Failed to update ticket status:', error);
        res
          .status(500)
          .json({ error: error.message || 'Erro ao atualizar status.' });
      }
    }
  );

  // POST /api/chamados/:numero/fechar -> Fechar chamado
  app.post(
    '/api/chamados/:numero/fechar',
    requireAuth,
    async (req: AuthRequest, res) => {
      try {
        const numero = Number(req.params.numero);
        const existente = await getChamadoByNumero(numero);
        if (!existente) {
          res.status(404).json({ error: 'Chamado não encontrado!' });
          return;
        }

        const atualizado = await updateChamadoFields(numero, {
          status: 'Fechado',
        });
        const todosChamados = await getAllChamados();

        res.json({
          message: 'Chamado fechado com sucesso!',
          chamado: atualizado,
          chamados: todosChamados,
        });
      } catch (error: any) {
        console.error('Failed to close ticket:', error);
        res
          .status(500)
          .json({ error: error.message || 'Erro ao fechar chamado.' });
      }
    }
  );

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ameta HelpDesk TI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
