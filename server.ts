import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const ARQUIVO_USUARIOS = path.resolve(process.cwd(), 'usuarios.json');
const ARQUIVO_CHAMADOS = path.resolve(process.cwd(), 'chamados.json');
const DOMINIO_PERMITIDO = '@ametaservicos.com.br';

interface UsuarioRecord {
  email: string;
  senha: string;
  tipo: 'admin' | 'usuario';
}

interface ChamadoRecord {
  Numero: number;
  'Aberto por': string;
  Assunto: string;
  Descricao: string;
  Plataforma: string;
  Celular: string;
  'E-mail': string;
  Status: 'Aberto' | 'Em andamento' | 'Fechado';
  FotoErro?: string;
  NomeFotoErro?: string;
  RespostaAdmin?: string;
  RespondidoPor?: string;
  DataResposta?: string;
  ResolvidoPeloUsuario?: boolean | null;
}

const SEED_USUARIOS: UsuarioRecord[] = [
  {
    email: 'rafael.araujo@ametaservicos.com.br',
    senha: 'admin123',
    tipo: 'admin',
  },
  {
    email: 'helena.costa@ametaservicos.com.br',
    senha: 'admin123',
    tipo: 'admin',
  },
  {
    email: 'lucas.mendes@ametaservicos.com.br',
    senha: 'ameta2026',
    tipo: 'usuario',
  },
  {
    email: 'mariana.silva@ametaservicos.com.br',
    senha: 'ameta2026',
    tipo: 'usuario',
  },
  {
    email: 'carlos.ferreira@ametaservicos.com.br',
    senha: 'ameta2026',
    tipo: 'usuario',
  },
];

const SEED_CHAMADOS: ChamadoRecord[] = [
  {
    Numero: 1,
    'Aberto por': 'lucas.mendes@ametaservicos.com.br',
    Assunto: 'Falha de autenticação SSO no ERP Corporativo',
    Descricao:
      'Ao tentar autenticar no módulo financeiro do ERP via credencial corporativa, o token SAML expira imediatamente após o redirecionamento.',
    Plataforma: 'ERP Ameta Cloud / Windows 11',
    Celular: '(11) 98412-3390',
    'E-mail': 'lucas.mendes@ametaservicos.com.br',
    Status: 'Em andamento',
    RespostaAdmin:
      'Sincronizamos o relógio NTP do provedor de identidade SAML e renovamos a sessão do seu usuário no diretório. Por favor, teste novamente o acesso ao ERP e confirme no botão abaixo se resolveu.',
    RespondidoPor: 'rafael.araujo@ametaservicos.com.br',
    DataResposta: '26/09/2026 08:40',
    ResolvidoPeloUsuario: null,
  },
  {
    Numero: 2,
    'Aberto por': 'mariana.silva@ametaservicos.com.br',
    Assunto: 'Provisionamento de acesso VPN para auditoria externa',
    Descricao:
      'Solicito liberação de túnel VPN IPSec com perfil restrito de leitura para a equipe de fechamento contábil trimestral na filial São Paulo.',
    Plataforma: 'FortiClient VPN / macOS Sequoia',
    Celular: '(11) 97104-8821',
    'E-mail': 'mariana.silva@ametaservicos.com.br',
    Status: 'Aberto',
  },
  {
    Numero: 3,
    'Aberto por': 'carlos.ferreira@ametaservicos.com.br',
    Assunto: 'Latência elevada na sincronização de banco de dados em campo',
    Descricao:
      'Os coletores de ordens de serviço da operação logística estão levando mais de 45 segundos para confirmar o envio dos relatórios de vistoria.',
    Plataforma: 'Ameta Field Mobile / Android 15',
    Celular: '(21) 99631-4052',
    'E-mail': 'carlos.ferreira@ametaservicos.com.br',
    Status: 'Aberto',
  },
  {
    Numero: 4,
    'Aberto por': 'lucas.mendes@ametaservicos.com.br',
    Assunto: 'Substituição de certificado TLS no gateway de faturamento',
    Descricao:
      'Renovação preventiva concluída e validada nos servidores de homologação e produção sem indisponibilidade de emissão fiscal.',
    Plataforma: 'Infraestrutura Cloud / Linux Debian 12',
    Celular: '(11) 98412-3390',
    'E-mail': 'lucas.mendes@ametaservicos.com.br',
    Status: 'Fechado',
    RespostaAdmin:
      'Certificado TLS renovado e aplicado no balanceador de carga. Emissão de notas operando normalmente.',
    RespondidoPor: 'rafael.araujo@ametaservicos.com.br',
    DataResposta: '25/09/2026 17:15',
    ResolvidoPeloUsuario: true,
  },
  {
    Numero: 5,
    'Aberto por': 'mariana.silva@ametaservicos.com.br',
    Assunto: 'Permissão de leitura e exportação no diretório de contratos',
    Descricao:
      'Necessário vincular o grupo Jurídico-Operações à pasta compartilhada de aditivos contratuais de 2026 no servidor de arquivos.',
    Plataforma: 'Active Directory / SharePoint Corporativo',
    Celular: '(11) 97104-8821',
    'E-mail': 'mariana.silva@ametaservicos.com.br',
    Status: 'Em andamento',
    RespostaAdmin:
      'Permissão atribuída no grupo AD Jurídico-Operações. Faça logoff e login novamente na estação para atualizar o mapeamento de rede.',
    RespondidoPor: 'rafael.araujo@ametaservicos.com.br',
    DataResposta: '26/09/2026 09:10',
    ResolvidoPeloUsuario: null,
  },
];

let listaUsuarios: UsuarioRecord[] = [];
let listaChamados: ChamadoRecord[] = [];

function salvarUsuarios(): void {
  fs.writeFileSync(
    ARQUIVO_USUARIOS,
    JSON.stringify(listaUsuarios, null, 2),
    'utf-8'
  );
}

function carregarUsuarios(): void {
  if (fs.existsSync(ARQUIVO_USUARIOS)) {
    try {
      const raw = fs.readFileSync(ARQUIVO_USUARIOS, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        listaUsuarios = parsed;
        return;
      }
    } catch {
      // Fallback to seed
    }
  }
  listaUsuarios = [...SEED_USUARIOS];
  salvarUsuarios();
}

function salvarChamados(): void {
  fs.writeFileSync(
    ARQUIVO_CHAMADOS,
    JSON.stringify(listaChamados, null, 2),
    'utf-8'
  );
}

function carregarChamados(): void {
  if (fs.existsSync(ARQUIVO_CHAMADOS)) {
    try {
      const raw = fs.readFileSync(ARQUIVO_CHAMADOS, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        listaChamados = parsed;
        return;
      }
    } catch {
      // Fallback to seed
    }
  }
  listaChamados = [...SEED_CHAMADOS];
  salvarChamados();
}

function emailValido(email: string): boolean {
  return email.trim().toLowerCase().endsWith(DOMINIO_PERMITIDO);
}

async function startServer() {
  carregarUsuarios();
  carregarChamados();

  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // GET /api/state -> retorna chamados filtrados pelo perfil do usuário logado
  app.get('/api/state', (req, res) => {
    const email = String(req.query.email ?? '').trim().toLowerCase();
    const tipo = String(req.query.tipo ?? '').trim().toLowerCase();

    const chamadosVisiveis =
      tipo === 'admin'
        ? listaChamados
        : email
        ? listaChamados.filter((c) => c['Aberto por'].toLowerCase() === email)
        : [];

    res.json({
      usuarios:
        tipo === 'admin'
          ? listaUsuarios.map(({ senha: _s, ...u }) => u)
          : [],
      chamados: chamadosVisiveis,
      dominioPermitido: DOMINIO_PERMITIDO,
    });
  });

  // POST /api/login -> autentica usuario
  app.post('/api/login', (req, res) => {
    const { email, senha } = req.body ?? {};
    const cleanEmail = String(email ?? '').trim().toLowerCase();
    const cleanSenha = String(senha ?? '');

    const usuario = listaUsuarios.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.senha === cleanSenha
    );

    if (!usuario) {
      res.status(401).json({ error: 'Usuário ou senha incorretos.' });
      return;
    }

    const chamadosVisiveis =
      usuario.tipo === 'admin'
        ? listaChamados
        : listaChamados.filter(
            (c) => c['Aberto por'].toLowerCase() === usuario.email.toLowerCase()
          );

    res.json({
      usuario: { email: usuario.email, tipo: usuario.tipo },
      chamados: chamadosVisiveis,
      usuarios:
        usuario.tipo === 'admin'
          ? listaUsuarios.map(({ senha: _s, ...u }) => u)
          : [],
    });
  });

  // POST /api/usuarios -> cadastrar_usuario()
  app.post('/api/usuarios', (req, res) => {
    const { email, senha, tipo } = req.body ?? {};
    const cleanEmail = String(email ?? '').trim().toLowerCase();
    const cleanSenha = String(senha ?? '').trim();
    const cleanTipo = String(tipo ?? '').trim().toLowerCase();

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

    const existente = listaUsuarios.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );
    if (existente) {
      res.status(409).json({
        error: 'Já existe um usuário cadastrado com este e-mail corporativo.',
      });
      return;
    }

    const novoUsuario: UsuarioRecord = {
      email: cleanEmail,
      senha: cleanSenha,
      tipo: cleanTipo as 'admin' | 'usuario',
    };

    listaUsuarios.push(novoUsuario);
    salvarUsuarios();

    res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      usuario: novoUsuario,
      usuarios: listaUsuarios,
    });
  });

  // PATCH /api/usuarios/tipo -> permite ao admin definir quem é admin ou usuario
  app.patch('/api/usuarios/tipo', (req, res) => {
    const { email, tipo } = req.body ?? {};
    const cleanEmail = String(email ?? '').trim().toLowerCase();
    const cleanTipo = String(tipo ?? '').trim().toLowerCase();

    if (cleanTipo !== 'admin' && cleanTipo !== 'usuario') {
      res.status(400).json({
        error: 'Tipo inválido. Use admin ou usuario.',
      });
      return;
    }

    const usuario = listaUsuarios.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );
    if (!usuario) {
      res.status(404).json({ error: 'Usuário não encontrado!' });
      return;
    }

    usuario.tipo = cleanTipo as 'admin' | 'usuario';
    salvarUsuarios();

    res.json({
      message: `Perfil de ${usuario.email} atualizado para ${usuario.tipo}.`,
      usuario,
      usuarios: listaUsuarios,
    });
  });

  // POST /api/chamados -> abrir_chamado(email_usuario) com suporte a FotoErro
  app.post('/api/chamados', (req, res) => {
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

    const cleanAbertoPor = String(abertoPor ?? '').trim();
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
        error: 'Todos os campos obrigatórios do chamado devem ser preenchidos.',
      });
      return;
    }

    const numero =
      listaChamados.length > 0
        ? Math.max(...listaChamados.map((c) => c.Numero)) + 1
        : 1;

    const novoChamado: ChamadoRecord = {
      Numero: numero,
      'Aberto por': cleanAbertoPor,
      Assunto: cleanAssunto,
      Descricao: cleanDescricao,
      Plataforma: cleanPlataforma,
      Celular: cleanCelular,
      'E-mail': cleanEmail,
      Status: 'Aberto',
      ...(FotoErro ? { FotoErro: String(FotoErro) } : {}),
      ...(NomeFotoErro ? { NomeFotoErro: String(NomeFotoErro) } : {}),
      ResolvidoPeloUsuario: null,
    };

    listaChamados.push(novoChamado);
    salvarChamados();

    const usuarioAutor = listaUsuarios.find(
      (u) => u.email.toLowerCase() === cleanAbertoPor.toLowerCase()
    );
    const isAdmin = usuarioAutor?.tipo === 'admin';
    const chamadosVisiveis = isAdmin
      ? listaChamados
      : listaChamados.filter(
          (c) => c['Aberto por'].toLowerCase() === cleanAbertoPor.toLowerCase()
        );

    res.status(201).json({
      message: `Chamado criado! Número do chamado: ${numero}`,
      chamado: novoChamado,
      chamados: chamadosVisiveis,
    });
  });

  // POST /api/chamados/:numero/responder -> Admin responde ao solicitante
  app.post('/api/chamados/:numero/responder', (req, res) => {
    const numero = Number(req.params.numero);
    const chamado = listaChamados.find((c) => c.Numero === numero);
    if (!chamado) {
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

    chamado.RespostaAdmin = cleanResposta;
    chamado.RespondidoPor = String(
      RespondidoPor ?? 'rafael.araujo@ametaservicos.com.br'
    ).trim();
    chamado.DataResposta = dataFormatada;

    if (
      Status === 'Aberto' ||
      Status === 'Em andamento' ||
      Status === 'Fechado'
    ) {
      chamado.Status = Status;
    } else if (chamado.Status === 'Aberto') {
      chamado.Status = 'Em andamento';
    }

    salvarChamados();

    res.json({
      message: `Resposta enviada ao solicitante ${chamado['Aberto por']}!`,
      chamado,
      chamados: listaChamados,
    });
  });

  // POST /api/chamados/:numero/resolver -> Usuário informa se resolveu o problema
  app.post('/api/chamados/:numero/resolver', (req, res) => {
    const numero = Number(req.params.numero);
    const chamado = listaChamados.find((c) => c.Numero === numero);
    if (!chamado) {
      res.status(404).json({ error: 'Chamado não encontrado!' });
      return;
    }

    const { resolvido } = req.body ?? {};
    const foiResolvido = Boolean(resolvido);

    chamado.ResolvidoPeloUsuario = foiResolvido;
    chamado.Status = foiResolvido ? 'Fechado' : 'Em andamento';
    salvarChamados();

    res.json({
      message: foiResolvido
        ? `Problema marcado como resolvido! Chamado #${numero} fechado.`
        : `Sinalizado que o problema persiste. O chamado #${numero} segue em andamento.`,
      chamado,
      chamados: listaChamados,
    });
  });

  // GET /api/chamados/:numero -> consultar_chamado()
  app.get('/api/chamados/:numero', (req, res) => {
    const numero = Number(req.params.numero);
    const email = String(req.query.email ?? '').trim().toLowerCase();
    const tipo = String(req.query.tipo ?? '').trim().toLowerCase();

    const chamado = listaChamados.find((c) => c.Numero === numero);
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
  });

  // PUT /api/chamados/:numero -> alterar_chamado()
  app.put('/api/chamados/:numero', (req, res) => {
    const numero = Number(req.params.numero);
    const chamado = listaChamados.find((c) => c.Numero === numero);
    if (!chamado) {
      res.status(404).json({ error: 'Chamado não encontrado!' });
      return;
    }

    const campos: Array<
      keyof Pick<
        ChamadoRecord,
        'Assunto' | 'Descricao' | 'Plataforma' | 'Celular' | 'E-mail'
      >
    > = ['Assunto', 'Descricao', 'Plataforma', 'Celular', 'E-mail'];

    for (const campo of campos) {
      const novoValor = req.body?.[campo];
      if (typeof novoValor === 'string' && novoValor.trim() !== '') {
        chamado[campo] = novoValor.trim();
      }
    }

    salvarChamados();
    res.json({
      message: 'Chamado atualizado com sucesso!',
      chamado,
      chamados: listaChamados,
    });
  });

  // PATCH /api/chamados/:numero/status -> alterar_status()
  app.patch('/api/chamados/:numero/status', (req, res) => {
    const numero = Number(req.params.numero);
    const chamado = listaChamados.find((c) => c.Numero === numero);
    if (!chamado) {
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

    chamado.Status = novoStatus;
    salvarChamados();

    res.json({
      message: 'Status atualizado com sucesso!',
      chamado,
      chamados: listaChamados,
    });
  });

  // POST /api/chamados/:numero/fechar -> fechar_chamado()
  app.post('/api/chamados/:numero/fechar', (req, res) => {
    const numero = Number(req.params.numero);
    const chamado = listaChamados.find((c) => c.Numero === numero);
    if (!chamado) {
      res.status(404).json({ error: 'Chamado não encontrado!' });
      return;
    }

    chamado.Status = 'Fechado';
    salvarChamados();

    res.json({
      message: 'Chamado fechado com sucesso!',
      chamado,
      chamados: listaChamados,
    });
  });

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
