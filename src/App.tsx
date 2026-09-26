import React, { useMemo, useState } from 'react';
import {
  Check,
  Download,
  Edit3,
  FileJson,
  Lock,
  LogOut,
  Plus,
  Search,
  Ticket,
  UserPlus,
  X,
} from 'lucide-react';
import { AmetaLogo } from './components/AmetaLogo';
import {
  Chamado,
  DOMINIO_PERMITIDO,
  StatusChamado,
  TipoUsuario,
  Usuario,
  emailValido,
} from './types';

const INITIAL_USUARIOS: Usuario[] = [
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

const INITIAL_CHAMADOS: Chamado[] = [
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
  },
];

type AdminTab = 'visao_geral' | 'consultar' | 'alterar' | 'usuarios' | 'abrir';
type UsuarioTab = 'meus_chamados' | 'abrir' | 'consultar';
type AuthScreenMode = 'login' | 'cadastro';

export default function App() {
  const [todosUsuarios, setTodosUsuarios] =
    useState<Usuario[]>(INITIAL_USUARIOS);
  const [todosChamados, setTodosChamados] =
    useState<Chamado[]>(INITIAL_CHAMADOS);

  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const [authMode, setAuthMode] = useState<AuthScreenMode>('login');

  const [adminTab, setAdminTab] = useState<AdminTab>('visao_geral');
  const [usuarioTab, setUsuarioTab] = useState<UsuarioTab>('meus_chamados');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  const [authFeedback, setAuthFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [cadEmail, setCadEmail] = useState('');
  const [cadSenha, setCadSenha] = useState('');
  const [cadTipo, setCadTipo] = useState<TipoUsuario>('usuario');

  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [statusFilter, setStatusFilter] = useState<'Todos' | StatusChamado>(
    'Todos'
  );
  const [autorFilter, setAutorFilter] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [numeroConsultaInput, setNumeroConsultaInput] = useState<string>('');
  const [selectedNumero, setSelectedNumero] = useState<number | null>(null);

  const [novoAssunto, setNovoAssunto] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [novaPlataforma, setNovaPlataforma] = useState('');
  const [novoCelular, setNovoCelular] = useState('');
  const [novoEmailContato, setNovoEmailContato] = useState('');

  const [editNumero, setEditNumero] = useState<number>(1);
  const [editAssunto, setEditAssunto] = useState('');
  const [editDescricao, setEditDescricao] = useState('');
  const [editPlataforma, setEditPlataforma] = useState('');
  const [editCelular, setEditCelular] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editStatus, setEditStatus] = useState<StatusChamado>('Aberto');

  // Regra de visibilidade:
  // - admin: vê todos os chamados da empresa
  // - usuario: vê apenas os chamados abertos pelo seu próprio e-mail
  const chamadosVisiveis = useMemo(() => {
    if (!usuarioLogado) return [];
    if (usuarioLogado.tipo === 'admin') {
      return todosChamados;
    }
    return todosChamados.filter(
      (c) =>
        c['Aberto por'].trim().toLowerCase() ===
        usuarioLogado.email.trim().toLowerCase()
    );
  }, [todosChamados, usuarioLogado]);

  const chamadosFiltrados = useMemo(() => {
    return chamadosVisiveis.filter((c) => {
      const matchStatus =
        statusFilter === 'Todos' || c.Status === statusFilter;
      const matchAutor =
        usuarioLogado?.tipo !== 'admin' ||
        autorFilter === 'Todos' ||
        c['Aberto por'].toLowerCase() === autorFilter.toLowerCase();
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchStatus && matchAutor;
      const matchSearch =
        String(c.Numero).includes(q) ||
        c.Assunto.toLowerCase().includes(q) ||
        c.Descricao.toLowerCase().includes(q) ||
        c.Plataforma.toLowerCase().includes(q) ||
        c['Aberto por'].toLowerCase().includes(q);
      return matchStatus && matchAutor && matchSearch;
    });
  }, [chamadosVisiveis, statusFilter, autorFilter, searchQuery, usuarioLogado]);

  const chamadoSelecionado = useMemo(() => {
    if (chamadosVisiveis.length === 0) return null;
    if (selectedNumero !== null) {
      const found = chamadosVisiveis.find((c) => c.Numero === selectedNumero);
      if (found) return found;
    }
    return chamadosVisiveis[0];
  }, [chamadosVisiveis, selectedNumero]);

  const resultadoConsulta = useMemo(() => {
    const raw = numeroConsultaInput.trim();
    if (!raw) return { status: 'idle' as const, chamado: null };
    const num = Number(raw);
    if (!num || Number.isNaN(num)) {
      return { status: 'not_found' as const, chamado: null };
    }
    const foundInVisible = chamadosVisiveis.find((c) => c.Numero === num);
    if (foundInVisible) {
      return { status: 'found' as const, chamado: foundInVisible };
    }
    const existsGlobally = todosChamados.some((c) => c.Numero === num);
    if (existsGlobally && usuarioLogado?.tipo === 'usuario') {
      return { status: 'forbidden' as const, chamado: null };
    }
    return { status: 'not_found' as const, chamado: null };
  }, [numeroConsultaInput, chamadosVisiveis, todosChamados, usuarioLogado]);

  const metrics = useMemo(() => {
    const total = chamadosVisiveis.length;
    const abertos = chamadosVisiveis.filter((c) => c.Status === 'Aberto').length;
    const emAndamento = chamadosVisiveis.filter(
      (c) => c.Status === 'Em andamento'
    ).length;
    const fechados = chamadosVisiveis.filter(
      (c) => c.Status === 'Fechado'
    ).length;
    return { total, abertos, emAndamento, fechados };
  }, [chamadosVisiveis]);

  const populateEditForm = (c: Chamado) => {
    setEditNumero(c.Numero);
    setEditAssunto(c.Assunto);
    setEditDescricao(c.Descricao);
    setEditPlataforma(c.Plataforma);
    setEditCelular(c.Celular);
    setEditEmail(c['E-mail']);
    setEditStatus(c.Status);
  };

  const executarLogin = async (emailInput: string, senhaInput: string) => {
    setAuthFeedback(null);
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanSenha = senhaInput;

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, senha: cleanSenha }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthFeedback({
          type: 'error',
          text: data.error || 'Usuário ou senha incorretos.',
        });
        return;
      }

      const loggedUser: Usuario = data.usuario;
      setUsuarioLogado(loggedUser);
      setNovoEmailContato(loggedUser.email);
      setStatusFilter('Todos');
      setAutorFilter('Todos');
      setSearchQuery('');
      setFeedback(null);

      if (loggedUser.tipo === 'admin') {
        setAdminTab('visao_geral');
        if (Array.isArray(data.chamados) && data.chamados.length > 0) {
          setTodosChamados(data.chamados);
          setSelectedNumero(data.chamados[0].Numero);
          populateEditForm(data.chamados[0]);
        }
        if (Array.isArray(data.usuarios) && data.usuarios.length > 0) {
          setTodosUsuarios(data.usuarios);
        }
      } else {
        setUsuarioTab('meus_chamados');
        const meus = Array.isArray(data.chamados) ? data.chamados : [];
        setSelectedNumero(meus[0]?.Numero ?? null);
        setNumeroConsultaInput(meus[0] ? String(meus[0].Numero) : '');
      }
    } catch {
      const found = todosUsuarios.find(
        (u) => u.email.toLowerCase() === cleanEmail && u.senha === cleanSenha
      );
      if (!found) {
        setAuthFeedback({
          type: 'error',
          text: 'Usuário ou senha incorretos.',
        });
        return;
      }
      setUsuarioLogado(found);
      setNovoEmailContato(found.email);
      setStatusFilter('Todos');
      setAutorFilter('Todos');
      setSearchQuery('');
      setFeedback(null);

      if (found.tipo === 'admin') {
        setAdminTab('visao_geral');
        if (todosChamados.length > 0) {
          setSelectedNumero(todosChamados[0].Numero);
          populateEditForm(todosChamados[0]);
        }
      } else {
        setUsuarioTab('meus_chamados');
        const meus = todosChamados.filter(
          (c) => c['Aberto por'].toLowerCase() === found.email.toLowerCase()
        );
        setSelectedNumero(meus[0]?.Numero ?? null);
        setNumeroConsultaInput(meus[0] ? String(meus[0].Numero) : '');
      }
    }
  };

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await executarLogin(loginEmail, loginSenha);
  };

  const handleLogout = () => {
    setUsuarioLogado(null);
    setLoginEmail('');
    setLoginSenha('');
    setAuthFeedback(null);
    setFeedback(null);
    setNumeroConsultaInput('');
  };

  const handleCadastrarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = cadEmail.trim().toLowerCase();
    const cleanSenha = cadSenha.trim();

    if (!cleanEmail || !cleanSenha) {
      const msg = 'Este campo não pode ficar vazio.';
      if (usuarioLogado) setFeedback({ type: 'error', text: msg });
      else setAuthFeedback({ type: 'error', text: msg });
      return;
    }

    if (!emailValido(cleanEmail)) {
      const msg = `E-mail inválido. Use um e-mail terminado em ${DOMINIO_PERMITIDO}`;
      if (usuarioLogado) setFeedback({ type: 'error', text: msg });
      else setAuthFeedback({ type: 'error', text: msg });
      return;
    }

    const tipoFinal: TipoUsuario =
      usuarioLogado?.tipo === 'admin' ? cadTipo : 'usuario';

    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          senha: cleanSenha,
          tipo: tipoFinal,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error || 'Erro ao cadastrar usuário.';
        if (usuarioLogado) setFeedback({ type: 'error', text: msg });
        else setAuthFeedback({ type: 'error', text: msg });
        return;
      }
      setTodosUsuarios(data.usuarios);
      setCadEmail('');
      setCadSenha('');
      const successMsg = `Usuário ${cleanEmail} cadastrado com sucesso!`;
      if (usuarioLogado) {
        setFeedback({ type: 'success', text: successMsg });
      } else {
        setAuthMode('login');
        setLoginEmail(cleanEmail);
        setLoginSenha('');
        setAuthFeedback({
          type: 'success',
          text: `${successMsg} Faça login abaixo.`,
        });
      }
    } catch {
      if (todosUsuarios.some((u) => u.email.toLowerCase() === cleanEmail)) {
        const msg = 'Já existe um usuário cadastrado com este e-mail.';
        if (usuarioLogado) setFeedback({ type: 'error', text: msg });
        else setAuthFeedback({ type: 'error', text: msg });
        return;
      }
      const novo: Usuario = {
        email: cleanEmail,
        senha: cleanSenha,
        tipo: tipoFinal,
      };
      setTodosUsuarios((prev) => [...prev, novo]);
      setCadEmail('');
      setCadSenha('');
      const successMsg = `Usuário ${cleanEmail} cadastrado com sucesso!`;
      if (usuarioLogado) {
        setFeedback({ type: 'success', text: successMsg });
      } else {
        setAuthMode('login');
        setLoginEmail(cleanEmail);
        setAuthFeedback({
          type: 'success',
          text: `${successMsg} Faça login abaixo.`,
        });
      }
    }
  };

  const handleAlterarTipoUsuario = async (
    emailAlvo: string,
    novoTipo: TipoUsuario
  ) => {
    if (usuarioLogado?.tipo !== 'admin') return;
    try {
      const res = await fetch('/api/usuarios/tipo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailAlvo, tipo: novoTipo }),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.usuarios)) {
        setTodosUsuarios(data.usuarios);
      }
    } catch {
      setTodosUsuarios((prev) =>
        prev.map((u) =>
          u.email.toLowerCase() === emailAlvo.toLowerCase()
            ? { ...u, tipo: novoTipo }
            : u
        )
      );
    }
    setFeedback({
      type: 'success',
      text: `Permissão de ${emailAlvo} alterada para "${novoTipo}".`,
    });
  };

  const handleAbrirChamado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioLogado) return;

    if (
      !novoAssunto.trim() ||
      !novaDescricao.trim() ||
      !novaPlataforma.trim() ||
      !novoCelular.trim() ||
      !novoEmailContato.trim()
    ) {
      setFeedback({
        type: 'error',
        text: 'Este campo não pode ficar vazio. Preencha todos os dados do chamado.',
      });
      return;
    }

    try {
      const res = await fetch('/api/chamados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          abertoPor: usuarioLogado.email,
          Assunto: novoAssunto.trim(),
          Descricao: novaDescricao.trim(),
          Plataforma: novaPlataforma.trim(),
          Celular: novoCelular.trim(),
          EmailContato: novoEmailContato.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({
          type: 'error',
          text: data.error || 'Não foi possível criar o chamado.',
        });
        return;
      }

      const criado: Chamado = data.chamado;
      setTodosChamados((prev) => {
        const exists = prev.some((c) => c.Numero === criado.Numero);
        return exists ? prev : [...prev, criado];
      });
      setSelectedNumero(criado.Numero);
      setNumeroConsultaInput(String(criado.Numero));
      setNovoAssunto('');
      setNovaDescricao('');
      setNovaPlataforma('');
      setNovoCelular('');
      setFeedback({
        type: 'success',
        text: `Chamado criado! Número do chamado: #${String(
          criado.Numero
        ).padStart(3, '0')}`,
      });

      if (usuarioLogado.tipo === 'admin') {
        setAdminTab('visao_geral');
      } else {
        setUsuarioTab('meus_chamados');
      }
    } catch {
      const proximoNumero =
        todosChamados.length > 0
          ? Math.max(...todosChamados.map((c) => c.Numero)) + 1
          : 1;
      const criado: Chamado = {
        Numero: proximoNumero,
        'Aberto por': usuarioLogado.email,
        Assunto: novoAssunto.trim(),
        Descricao: novaDescricao.trim(),
        Plataforma: novaPlataforma.trim(),
        Celular: novoCelular.trim(),
        'E-mail': novoEmailContato.trim(),
        Status: 'Aberto',
      };
      setTodosChamados((prev) => [...prev, criado]);
      setSelectedNumero(criado.Numero);
      setNumeroConsultaInput(String(criado.Numero));
      setNovoAssunto('');
      setNovaDescricao('');
      setNovaPlataforma('');
      setNovoCelular('');
      setFeedback({
        type: 'success',
        text: `Chamado criado! Número do chamado: #${String(
          criado.Numero
        ).padStart(3, '0')}`,
      });
      if (usuarioLogado.tipo === 'admin') {
        setAdminTab('visao_geral');
      } else {
        setUsuarioTab('meus_chamados');
      }
    }
  };

  const handleAlterarChamado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usuarioLogado?.tipo !== 'admin') return;

    try {
      const res = await fetch(`/api/chamados/${editNumero}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Assunto: editAssunto,
          Descricao: editDescricao,
          Plataforma: editPlataforma,
          Celular: editCelular,
          'E-mail': editEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({
          type: 'error',
          text: data.error || 'Chamado não encontrado!',
        });
        return;
      }

      const statusRes = await fetch(`/api/chamados/${editNumero}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Status: editStatus }),
      });
      const statusData = await statusRes.json();
      if (statusRes.ok && Array.isArray(statusData.chamados)) {
        setTodosChamados(statusData.chamados);
      } else if (Array.isArray(data.chamados)) {
        setTodosChamados(data.chamados);
      }

      setFeedback({
        type: 'success',
        text: `Chamado #${String(editNumero).padStart(
          3,
          '0'
        )} atualizado com sucesso!`,
      });
      setAdminTab('visao_geral');
    } catch {
      setTodosChamados((prev) =>
        prev.map((c) =>
          c.Numero === editNumero
            ? {
                ...c,
                Assunto: editAssunto.trim() || c.Assunto,
                Descricao: editDescricao.trim() || c.Descricao,
                Plataforma: editPlataforma.trim() || c.Plataforma,
                Celular: editCelular.trim() || c.Celular,
                'E-mail': editEmail.trim() || c['E-mail'],
                Status: editStatus,
              }
            : c
        )
      );
      setFeedback({
        type: 'success',
        text: `Chamado #${String(editNumero).padStart(
          3,
          '0'
        )} atualizado com sucesso!`,
      });
      setAdminTab('visao_geral');
    }
  };

  const handleAlterarStatus = async (
    numero: number,
    novoStatus: StatusChamado
  ) => {
    if (usuarioLogado?.tipo !== 'admin') return;
    try {
      const res = await fetch(`/api/chamados/${numero}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Status: novoStatus }),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.chamados)) {
        setTodosChamados(data.chamados);
      }
    } catch {
      setTodosChamados((prev) =>
        prev.map((c) =>
          c.Numero === numero ? { ...c, Status: novoStatus } : c
        )
      );
    }
    if (editNumero === numero) setEditStatus(novoStatus);
    setFeedback({
      type: 'success',
      text: `Status atualizado com sucesso para "${novoStatus}" (Chamado #${String(
        numero
      ).padStart(3, '0')}).`,
    });
  };

  const handleFecharChamado = async (numero: number) => {
    if (usuarioLogado?.tipo !== 'admin') return;
    try {
      const res = await fetch(`/api/chamados/${numero}/fechar`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.chamados)) {
        setTodosChamados(data.chamados);
      }
    } catch {
      setTodosChamados((prev) =>
        prev.map((c) =>
          c.Numero === numero ? { ...c, Status: 'Fechado' } : c
        )
      );
    }
    if (editNumero === numero) setEditStatus('Fechado');
    setFeedback({
      type: 'success',
      text: `Chamado #${String(numero).padStart(
        3,
        '0'
      )} fechado com sucesso!`,
    });
  };

  const handleDownloadJson = (filename: string, payload: unknown) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderStatusIndicator = (status: StatusChamado) => {
    if (status === 'Aberto') {
      return (
        <span className="inline-flex items-center gap-2 font-semibold text-blue-700">
          <span className="h-2 w-2 bg-blue-700" aria-hidden="true" />
          <span>Aberto</span>
        </span>
      );
    }
    if (status === 'Em andamento') {
      return (
        <span className="inline-flex items-center gap-2 font-semibold text-amber-700">
          <span className="h-2 w-2 bg-amber-600" aria-hidden="true" />
          <span>Em andamento</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-2 font-semibold text-emerald-700">
        <span className="h-2 w-2 bg-emerald-600" aria-hidden="true" />
        <span>Fechado</span>
      </span>
    );
  };

  const renderFooter = () => (
    <footer className="py-5 px-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
      <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Sistema Helpe-Desk Ameta · Ameta Serviços Telecomunicações</span>
        <span className="font-mono font-semibold text-[#191E5A]">
          rafael araujo back-end
        </span>
      </div>
    </footer>
  );

  // ============================================================================
  // 1. TELA DE LOGIN LIMPA E PROFISSIONAL (APENAS LOGO E LOGIN/CADASTRO)
  // ============================================================================
  if (!usuarioLogado) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col justify-between">
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-8 sm:p-10 shadow-xs space-y-7">
            {/* Logo Oficial Ameta Serviços Telecomunicações */}
            <div className="flex flex-col items-center text-center">
              <AmetaLogo variant="stacked" />
              <h1 className="mt-5 font-display text-xl font-bold text-[#191E5A]">
                Sistema Helpe-Desk Ameta
              </h1>
            </div>

            {authFeedback && (
              <div
                role="alert"
                className={`p-3 rounded-lg border text-xs font-medium flex items-center justify-between ${
                  authFeedback.type === 'success'
                    ? 'bg-blue-50 border-blue-200 text-blue-950'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                <span>{authFeedback.text}</span>
                <button
                  type="button"
                  onClick={() => setAuthFeedback(null)}
                  className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {authMode === 'login' ? (
              <form onSubmit={handleFormLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    E-mail Corporativo
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder={`usuario${DOMINIO_PERMITIDO}`}
                    className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-950 focus:outline-none focus:border-[#191E5A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Senha
                  </label>
                  <input
                    type="password"
                    required
                    value={loginSenha}
                    onChange={(e) => setLoginSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-950 focus:outline-none focus:border-[#191E5A] focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 text-xs font-semibold text-white bg-[#191E5A] hover:bg-[#111542] rounded-lg transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Entrar</span>
                </button>

                <div className="pt-3 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('cadastro');
                      setAuthFeedback(null);
                    }}
                    className="text-xs font-medium text-slate-600 hover:text-[#191E5A] hover:underline cursor-pointer"
                  >
                    Cadastrar novo usuário ({DOMINIO_PERMITIDO})
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCadastrarUsuario} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Cadastre seu e-mail ({DOMINIO_PERMITIDO}) *
                  </label>
                  <input
                    type="email"
                    required
                    value={cadEmail}
                    onChange={(e) => setCadEmail(e.target.value)}
                    placeholder={`nome${DOMINIO_PERMITIDO}`}
                    className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-950 focus:outline-none focus:border-[#191E5A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Escolha sua senha *
                  </label>
                  <input
                    type="password"
                    required
                    value={cadSenha}
                    onChange={(e) => setCadSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-950 focus:outline-none focus:border-[#191E5A] focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 text-xs font-semibold text-white bg-[#191E5A] hover:bg-[#111542] rounded-lg transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Cadastrar</span>
                </button>

                <div className="pt-3 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setAuthFeedback(null);
                    }}
                    className="text-xs font-medium text-slate-600 hover:text-[#191E5A] hover:underline cursor-pointer"
                  >
                    Voltar para a tela de Login
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>

        {renderFooter()}
      </div>
    );
  }

  // ============================================================================
  // 2. VISÃO DO USUÁRIO PADRÃO ("usuario") -> VÊ APENAS OS PRÓPRIOS CHAMADOS
  // ============================================================================
  if (usuarioLogado.tipo === 'usuario') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col">
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-6 lg:px-12 flex items-center justify-between">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setUsuarioTab('meus_chamados');
            }}
            className="whitespace-nowrap"
          >
            <AmetaLogo variant="horizontal" />
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setUsuarioTab('meus_chamados')}
              className={`py-1 transition-colors whitespace-nowrap border-b-2 cursor-pointer ${
                usuarioTab === 'meus_chamados'
                  ? 'border-[#191E5A] text-slate-950 font-semibold'
                  : 'border-transparent hover:text-slate-950'
              }`}
            >
              Meus Chamados ({chamadosVisiveis.length})
            </button>
            <button
              type="button"
              onClick={() => setUsuarioTab('abrir')}
              className={`py-1 transition-colors whitespace-nowrap border-b-2 cursor-pointer ${
                usuarioTab === 'abrir'
                  ? 'border-[#191E5A] text-slate-950 font-semibold'
                  : 'border-transparent hover:text-slate-950'
              }`}
            >
              Abrir Chamado
            </button>
            <button
              type="button"
              onClick={() => setUsuarioTab('consultar')}
              className={`py-1 transition-colors whitespace-nowrap border-b-2 cursor-pointer ${
                usuarioTab === 'consultar'
                  ? 'border-[#191E5A] text-slate-950 font-semibold'
                  : 'border-transparent hover:text-slate-950'
              }`}
            >
              Consultar Chamado
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setUsuarioTab('abrir')}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-[#191E5A] hover:bg-[#111542] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              + Abrir Chamado
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-red-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </header>

        <section className="bg-[#191E5A] text-white border-b border-slate-800">
          <div className="max-w-[1360px] mx-auto px-6 lg:px-12 py-7 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-1">
              <div className="text-xs font-mono text-teal-300">
                Usuário: {usuarioLogado.email}
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Sistema Helpe-Desk Ameta
              </h1>
            </div>

            <div className="grid grid-cols-4 gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/15">
              <div>
                <div className="font-mono text-2xl font-bold text-white tabular-nums">
                  {String(metrics.total).padStart(2, '0')}
                </div>
                <div className="text-[11px] text-slate-300">Meus Chamados</div>
              </div>
              <div>
                <div className="font-mono text-2xl font-bold text-sky-300 tabular-nums">
                  {String(metrics.abertos).padStart(2, '0')}
                </div>
                <div className="text-[11px] text-slate-300">Abertos</div>
              </div>
              <div>
                <div className="font-mono text-2xl font-bold text-amber-300 tabular-nums">
                  {String(metrics.emAndamento).padStart(2, '0')}
                </div>
                <div className="text-[11px] text-slate-300">Em Andamento</div>
              </div>
              <div>
                <div className="font-mono text-2xl font-bold text-emerald-300 tabular-nums">
                  {String(metrics.fechados).padStart(2, '0')}
                </div>
                <div className="text-[11px] text-slate-300">Fechados</div>
              </div>
            </div>
          </div>
        </section>

        <main className="flex-1 max-w-[1360px] w-full mx-auto px-6 lg:px-12 py-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-1.5 p-1 bg-slate-200/75 rounded-lg">
              <button
                type="button"
                onClick={() => setUsuarioTab('meus_chamados')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  usuarioTab === 'meus_chamados'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                1. Meus Chamados
              </button>
              <button
                type="button"
                onClick={() => setUsuarioTab('abrir')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  usuarioTab === 'abrir'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                2. Abrir Chamado
              </button>
              <button
                type="button"
                onClick={() => setUsuarioTab('consultar')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  usuarioTab === 'consultar'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                3. Consultar Chamado
              </button>
            </div>
          </div>

          {feedback && (
            <div
              role="status"
              className={`px-4 py-3 rounded-lg border flex items-center justify-between text-sm ${
                feedback.type === 'success'
                  ? 'bg-blue-50 border-blue-200 text-slate-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              <span className="font-medium">{feedback.text}</span>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {usuarioTab === 'meus_chamados' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                    {(
                      ['Todos', 'Aberto', 'Em andamento', 'Fechado'] as const
                    ).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusFilter(st)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                          statusFilter === st
                            ? 'bg-white text-slate-950 shadow-xs'
                            : 'text-slate-600 hover:text-slate-950'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <div className="relative flex-1 max-w-xs">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar nos meus chamados..."
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#191E5A] focus:bg-white"
                    />
                  </div>
                </div>

                {chamadosFiltrados.length === 0 ? (
                  <div className="p-12 text-center space-y-3">
                    <Ticket className="w-8 h-8 text-slate-400 mx-auto" />
                    <div className="text-sm font-semibold text-slate-900">
                      Nenhum chamado encontrado.
                    </div>
                    <button
                      type="button"
                      onClick={() => setUsuarioTab('abrir')}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#191E5A] hover:bg-[#111542] rounded-lg transition-colors cursor-pointer"
                    >
                      Abrir Chamado
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
                          <th className="py-3 px-4 font-mono">Nº</th>
                          <th className="py-3 px-4">Assunto e Plataforma</th>
                          <th className="py-3 px-4">Contato</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-sm">
                        {chamadosFiltrados.map((c) => {
                          const isSelected =
                            chamadoSelecionado?.Numero === c.Numero;
                          return (
                            <tr
                              key={c.Numero}
                              onClick={() => setSelectedNumero(c.Numero)}
                              className={`transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-50/60'
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              <td className="py-3.5 px-4 font-mono text-xs font-semibold text-[#191E5A] tabular-nums whitespace-nowrap">
                                #{String(c.Numero).padStart(3, '0')}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-slate-900">
                                  {c.Assunto}
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                  {c.Plataforma}
                                </div>
                              </td>
                              <td className="py-3.5 px-4 font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                                {c.Celular}
                              </td>
                              <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                                {renderStatusIndicator(c.Status)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6">
                {chamadoSelecionado ? (
                  <div className="space-y-5">
                    <div className="pb-4 border-b border-slate-200 flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-mono text-slate-500 tabular-nums">
                          Chamado #
                          {String(chamadoSelecionado.Numero).padStart(3, '0')}
                        </div>
                        <h3 className="text-lg font-bold text-slate-950 mt-1">
                          {chamadoSelecionado.Assunto}
                        </h3>
                      </div>
                      <div className="text-xs shrink-0">
                        {renderStatusIndicator(chamadoSelecionado.Status)}
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div>
                        <div className="text-xs font-semibold text-slate-500">
                          Descrição
                        </div>
                        <p className="text-slate-800 mt-1 leading-relaxed">
                          {chamadoSelecionado.Descricao}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Aberto por</span>
                          <span className="font-mono text-slate-900">
                            {chamadoSelecionado['Aberto por']}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Plataforma</span>
                          <span className="font-medium text-slate-900">
                            {chamadoSelecionado.Plataforma}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Celular</span>
                          <span className="font-mono text-slate-900 tabular-nums">
                            {chamadoSelecionado.Celular}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">E-mail</span>
                          <span className="font-mono text-slate-900">
                            {chamadoSelecionado['E-mail']}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    Selecione um chamado para visualizar os detalhes.
                  </p>
                )}
              </div>
            </div>
          )}

          {usuarioTab === 'abrir' && (
            <div className="max-w-2xl bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
              <div className="pb-5 border-b border-slate-200">
                <div className="text-xs font-mono text-[#191E5A]">
                  Aberto por: {usuarioLogado.email}
                </div>
                <h2 className="font-display text-xl font-bold text-slate-950 mt-1">
                  Abrir Novo Chamado
                </h2>
              </div>

              <form onSubmit={handleAbrirChamado} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Assunto *
                  </label>
                  <input
                    type="text"
                    required
                    value={novoAssunto}
                    onChange={(e) => setNovoAssunto(e.target.value)}
                    placeholder="Assunto do chamado"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-950 focus:outline-none focus:border-[#191E5A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Descrição *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={novaDescricao}
                    onChange={(e) => setNovaDescricao(e.target.value)}
                    placeholder="Descreva sua solicitação..."
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-950 focus:outline-none focus:border-[#191E5A] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Plataforma *
                    </label>
                    <input
                      type="text"
                      required
                      value={novaPlataforma}
                      onChange={(e) => setNovaPlataforma(e.target.value)}
                      placeholder="Ex: ERP / Windows"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-950 focus:outline-none focus:border-[#191E5A] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Número para contato (Celular) *
                    </label>
                    <input
                      type="text"
                      required
                      value={novoCelular}
                      onChange={(e) => setNovoCelular(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-950 focus:outline-none focus:border-[#191E5A] focus:bg-white tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    E-mail para contato *
                  </label>
                  <input
                    type="email"
                    required
                    value={novoEmailContato}
                    onChange={(e) => setNovoEmailContato(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-950 focus:outline-none focus:border-[#191E5A] focus:bg-white"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setUsuarioTab('meus_chamados')}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-950 border border-slate-300 rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-[#191E5A] hover:bg-[#111542] rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Abrir Chamado</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {usuarioTab === 'consultar' && (
            <div className="max-w-2xl bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-950">
                  Consultar Chamado
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Digite o número do seu chamado.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Número do chamado
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={numeroConsultaInput}
                    onChange={(e) => setNumeroConsultaInput(e.target.value)}
                    placeholder="Ex: 1"
                    className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-950 focus:outline-none focus:border-[#191E5A] focus:bg-white tabular-nums"
                  />
                </div>

                {chamadosVisiveis.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {chamadosVisiveis.map((c) => (
                      <button
                        key={c.Numero}
                        type="button"
                        onClick={() => setNumeroConsultaInput(String(c.Numero))}
                        className={`px-3 py-2.5 text-xs font-mono font-semibold rounded-lg border transition-colors cursor-pointer tabular-nums ${
                          Number(numeroConsultaInput) === c.Numero
                            ? 'bg-[#191E5A] text-white border-[#191E5A]'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        #{String(c.Numero).padStart(3, '0')}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {resultadoConsulta.status === 'found' &&
                resultadoConsulta.chamado && (
                  <div className="pt-5 border-t border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#191E5A]">
                        Chamado #
                        {String(resultadoConsulta.chamado.Numero).padStart(
                          3,
                          '0'
                        )}
                      </span>
                      <span className="text-xs">
                        {renderStatusIndicator(
                          resultadoConsulta.chamado.Status
                        )}
                      </span>
                    </div>

                    <dl className="divide-y divide-slate-200 border-t border-b border-slate-200 text-sm">
                      {(
                        [
                          ['Numero', resultadoConsulta.chamado.Numero],
                          [
                            'Aberto por',
                            resultadoConsulta.chamado['Aberto por'],
                          ],
                          ['Assunto', resultadoConsulta.chamado.Assunto],
                          ['Descricao', resultadoConsulta.chamado.Descricao],
                          ['Plataforma', resultadoConsulta.chamado.Plataforma],
                          ['Celular', resultadoConsulta.chamado.Celular],
                          ['E-mail', resultadoConsulta.chamado['E-mail']],
                          ['Status', resultadoConsulta.chamado.Status],
                        ] as const
                      ).map(([k, v]) => (
                        <div
                          key={k}
                          className="py-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2"
                        >
                          <dt className="font-mono text-xs font-semibold text-slate-500">
                            {k}:
                          </dt>
                          <dd className="sm:col-span-2 text-slate-900 font-medium">
                            {String(v)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}

              {resultadoConsulta.status === 'forbidden' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900">
                  Acesso restrito: você só pode visualizar chamados abertos pelo
                  seu próprio usuário.
                </div>
              )}

              {resultadoConsulta.status === 'not_found' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                  Chamado não encontrado!
                </div>
              )}
            </div>
          )}
        </main>

        {renderFooter()}
      </div>
    );
  }

  // ============================================================================
  // 3. VISÃO DO ADMINISTRADOR ("admin") -> VISÃO GERAL DE TODOS OS CHAMADOS
  // ============================================================================
  const autoresUnicos = Array.from(
    new Set(todosChamados.map((c) => c['Aberto por']))
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col">
      <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-6 lg:px-12 flex items-center justify-between">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setAdminTab('visao_geral');
          }}
          className="whitespace-nowrap"
        >
          <AmetaLogo variant="horizontal" />
        </a>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setAdminTab('visao_geral')}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 cursor-pointer ${
              adminTab === 'visao_geral'
                ? 'border-[#191E5A] text-slate-950 font-semibold'
                : 'border-transparent hover:text-slate-950'
            }`}
          >
            Listar Chamados ({todosChamados.length})
          </button>
          <button
            type="button"
            onClick={() => setAdminTab('consultar')}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 cursor-pointer ${
              adminTab === 'consultar'
                ? 'border-[#191E5A] text-slate-950 font-semibold'
                : 'border-transparent hover:text-slate-950'
            }`}
          >
            Consultar Chamado
          </button>
          <button
            type="button"
            onClick={() => setAdminTab('alterar')}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 cursor-pointer ${
              adminTab === 'alterar'
                ? 'border-[#191E5A] text-slate-950 font-semibold'
                : 'border-transparent hover:text-slate-950'
            }`}
          >
            Alterar / Fechar
          </button>
          <button
            type="button"
            onClick={() => setAdminTab('usuarios')}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 cursor-pointer ${
              adminTab === 'usuarios'
                ? 'border-[#191E5A] text-slate-950 font-semibold'
                : 'border-transparent hover:text-slate-950'
            }`}
          >
            Cadastrar Usuário ({todosUsuarios.length})
          </button>
          <button
            type="button"
            onClick={() => setAdminTab('abrir')}
            className={`py-1 transition-colors whitespace-nowrap border-b-2 cursor-pointer ${
              adminTab === 'abrir'
                ? 'border-[#191E5A] text-slate-950 font-semibold'
                : 'border-transparent hover:text-slate-950'
            }`}
          >
            Abrir Chamado
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleDownloadJson('chamados.json', todosChamados)}
            className="hidden sm:inline-flex px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-950 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-red-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </header>

      <section className="bg-[#191E5A] text-white border-b border-slate-800">
        <div className="max-w-[1360px] mx-auto px-6 lg:px-12 py-7 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-1">
            <div className="text-xs font-mono text-teal-300">
              Administrador: {usuarioLogado.email} · Visão Geral
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Sistema Helpe-Desk Ameta
            </h1>
          </div>

          <div className="grid grid-cols-4 gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/15">
            <div>
              <div className="font-mono text-2xl font-bold text-white tabular-nums">
                {String(metrics.total).padStart(2, '0')}
              </div>
              <div className="text-[11px] text-slate-300">Total Geral</div>
            </div>
            <div>
              <div className="font-mono text-2xl font-bold text-sky-300 tabular-nums">
                {String(metrics.abertos).padStart(2, '0')}
              </div>
              <div className="text-[11px] text-slate-300">Abertos</div>
            </div>
            <div>
              <div className="font-mono text-2xl font-bold text-amber-300 tabular-nums">
                {String(metrics.emAndamento).padStart(2, '0')}
              </div>
              <div className="text-[11px] text-slate-300">Em Andamento</div>
            </div>
            <div>
              <div className="font-mono text-2xl font-bold text-emerald-300 tabular-nums">
                {String(metrics.fechados).padStart(2, '0')}
              </div>
              <div className="text-[11px] text-slate-300">Fechados</div>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-[1360px] w-full mx-auto px-6 lg:px-12 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-200/75 rounded-lg">
            <button
              type="button"
              onClick={() => setAdminTab('visao_geral')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                adminTab === 'visao_geral'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              1. Listar Chamados
            </button>
            <button
              type="button"
              onClick={() => setAdminTab('consultar')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                adminTab === 'consultar'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              2. Consultar Chamado
            </button>
            <button
              type="button"
              onClick={() => setAdminTab('alterar')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                adminTab === 'alterar'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              3/4/5. Alterar e Fechar
            </button>
            <button
              type="button"
              onClick={() => setAdminTab('usuarios')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                adminTab === 'usuarios'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              6. Cadastrar Usuário
            </button>
            <button
              type="button"
              onClick={() => setAdminTab('abrir')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                adminTab === 'abrir'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              + Abrir Chamado
            </button>
          </div>
        </div>

        {feedback && (
          <div
            role="status"
            className={`px-4 py-3 rounded-lg border flex items-center justify-between text-sm ${
              feedback.type === 'success'
                ? 'bg-blue-50 border-blue-200 text-slate-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <span className="font-medium">{feedback.text}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {adminTab === 'visao_geral' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                    {(
                      ['Todos', 'Aberto', 'Em andamento', 'Fechado'] as const
                    ).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusFilter(st)}
                        className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                          statusFilter === st
                            ? 'bg-white text-slate-950 shadow-xs'
                            : 'text-slate-600 hover:text-slate-950'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <select
                    value={autorFilter}
                    onChange={(e) => setAutorFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[#191E5A]"
                  >
                    <option value="Todos">Todos os Usuários</option>
                    {autoresUnicos.map((email) => (
                      <option key={email} value={email}>
                        {email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative flex-1 max-w-xs">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar chamado..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#191E5A] focus:bg-white"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500">
                      <th className="py-3 px-4 font-mono">Nº</th>
                      <th className="py-3 px-4">Assunto e Plataforma</th>
                      <th className="py-3 px-4">Aberto por</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm">
                    {chamadosFiltrados.map((c) => {
                      const isSelected =
                        chamadoSelecionado?.Numero === c.Numero;
                      return (
                        <tr
                          key={c.Numero}
                          onClick={() => {
                            setSelectedNumero(c.Numero);
                            populateEditForm(c);
                          }}
                          className={`transition-colors cursor-pointer ${
                            isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-3.5 px-4 font-mono text-xs font-semibold text-[#191E5A] tabular-nums whitespace-nowrap">
                            #{String(c.Numero).padStart(3, '0')}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">
                              {c.Assunto}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {c.Plataforma} · {c.Celular}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                            {c['Aberto por']}
                          </td>
                          <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                            {renderStatusIndicator(c.Status)}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedNumero(c.Numero);
                                populateEditForm(c);
                                setAdminTab('alterar');
                              }}
                              className="text-xs font-semibold text-[#191E5A] hover:underline cursor-pointer"
                            >
                              Alterar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6">
              {chamadoSelecionado ? (
                <div className="space-y-5">
                  <div className="pb-4 border-b border-slate-200 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-mono text-slate-500 tabular-nums">
                        Chamado #
                        {String(chamadoSelecionado.Numero).padStart(3, '0')}
                      </div>
                      <h3 className="text-lg font-bold text-slate-950 mt-1">
                        {chamadoSelecionado.Assunto}
                      </h3>
                    </div>
                    <div className="text-xs shrink-0">
                      {renderStatusIndicator(chamadoSelecionado.Status)}
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="text-xs font-semibold text-slate-500">
                        Descrição
                      </div>
                      <p className="text-slate-800 mt-1 leading-relaxed">
                        {chamadoSelecionado.Descricao}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Aberto por</span>
                        <span className="font-mono text-slate-900">
                          {chamadoSelecionado['Aberto por']}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Plataforma</span>
                        <span className="font-medium text-slate-900">
                          {chamadoSelecionado.Plataforma}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Celular</span>
                        <span className="font-mono text-slate-900 tabular-nums">
                          {chamadoSelecionado.Celular}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">E-mail</span>
                        <span className="font-mono text-slate-900">
                          {chamadoSelecionado['E-mail']}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 space-y-3">
                    <div className="text-xs font-semibold text-slate-700">
                      4. Alterar Status do Chamado
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        ['Aberto', 'Em andamento', 'Fechado'] as StatusChamado[]
                      ).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() =>
                            handleAlterarStatus(chamadoSelecionado.Numero, st)
                          }
                          className={`px-2.5 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                            chamadoSelecionado.Status === st
                              ? 'bg-[#191E5A] text-white border-[#191E5A]'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          populateEditForm(chamadoSelecionado);
                          setAdminTab('alterar');
                        }}
                        className="flex-1 px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>3. Alterar Chamado</span>
                      </button>

                      {chamadoSelecionado.Status !== 'Fechado' && (
                        <button
                          type="button"
                          onClick={() =>
                            handleFecharChamado(chamadoSelecionado.Numero)
                          }
                          className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>5. Fechar Chamado</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Selecione um chamado na lista.
                </p>
              )}
            </div>
          </div>
        )}

        {adminTab === 'consultar' && (
          <div className="max-w-3xl bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-950">
                2. Consultar Chamado por Número
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Digite o número do chamado
                </label>
                <input
                  type="number"
                  min={1}
                  value={numeroConsultaInput}
                  onChange={(e) => setNumeroConsultaInput(e.target.value)}
                  placeholder="Ex: 1"
                  className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-950 focus:outline-none focus:border-[#191E5A] focus:bg-white tabular-nums"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {todosChamados.map((c) => (
                  <button
                    key={c.Numero}
                    type="button"
                    onClick={() => setNumeroConsultaInput(String(c.Numero))}
                    className={`px-3 py-2.5 text-xs font-mono font-semibold rounded-lg border transition-colors cursor-pointer tabular-nums ${
                      Number(numeroConsultaInput) === c.Numero
                        ? 'bg-[#191E5A] text-white border-[#191E5A]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    #{String(c.Numero).padStart(3, '0')}
                  </button>
                ))}
              </div>
            </div>

            {resultadoConsulta.status === 'found' &&
              resultadoConsulta.chamado && (
                <div className="pt-5 border-t border-slate-200 space-y-4">
                  <dl className="divide-y divide-slate-200 border-t border-b border-slate-200 text-sm">
                    {(
                      [
                        ['Numero', resultadoConsulta.chamado.Numero],
                        ['Aberto por', resultadoConsulta.chamado['Aberto por']],
                        ['Assunto', resultadoConsulta.chamado.Assunto],
                        ['Descricao', resultadoConsulta.chamado.Descricao],
                        ['Plataforma', resultadoConsulta.chamado.Plataforma],
                        ['Celular', resultadoConsulta.chamado.Celular],
                        ['E-mail', resultadoConsulta.chamado['E-mail']],
                        ['Status', resultadoConsulta.chamado.Status],
                      ] as const
                    ).map(([k, v]) => (
                      <div
                        key={k}
                        className="py-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2"
                      >
                        <dt className="font-mono text-xs font-semibold text-slate-500">
                          {k}:
                        </dt>
                        <dd className="sm:col-span-2 text-slate-900 font-medium">
                          {String(v)}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <button
                    type="button"
                    onClick={() => {
                      populateEditForm(resultadoConsulta.chamado!);
                      setAdminTab('alterar');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#191E5A] hover:bg-[#111542] rounded-lg cursor-pointer"
                  >
                    Alterar este Chamado
                  </button>
                </div>
              )}

            {resultadoConsulta.status === 'not_found' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                Chamado não encontrado!
              </div>
            )}
          </div>
        )}

        {adminTab === 'alterar' && (
          <div className="max-w-3xl bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-950">
                3 / 4 / 5. Alterar Chamado, Alterar Status ou Fechar
              </h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Selecione o chamado
              </label>
              <div className="flex flex-wrap gap-2">
                {todosChamados.map((c) => (
                  <button
                    key={c.Numero}
                    type="button"
                    onClick={() => populateEditForm(c)}
                    className={`px-3 py-2 text-xs font-mono font-semibold rounded-lg border transition-colors cursor-pointer tabular-nums ${
                      editNumero === c.Numero
                        ? 'bg-[#191E5A] text-white border-[#191E5A]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    #{String(c.Numero).padStart(3, '0')} · {c.Status}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAlterarChamado} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Assunto
                  </label>
                  <input
                    type="text"
                    value={editAssunto}
                    onChange={(e) => setEditAssunto(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-950 focus:outline-none focus:border-[#191E5A] focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Descrição
                  </label>
                  <textarea
                    rows={3}
                    value={editDescricao}
                    onChange={(e) => setEditDescricao(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-950 focus:outline-none focus:border-[#191E5A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Plataforma
                  </label>
                  <input
                    type="text"
                    value={editPlataforma}
                    onChange={(e) => setEditPlataforma(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-950 focus:outline-none focus:border-[#191E5A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Celular
                  </label>
                  <input
                    type="text"
                    value={editCelular}
                    onChange={(e) => setEditCelular(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-950 focus:outline-none focus:border-[#191E5A] focus:bg-white tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-950 focus:outline-none focus:border-[#191E5A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Novo Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) =>
                      setEditStatus(e.target.value as StatusChamado)
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-950 focus:outline-none focus:border-[#191E5A] focus:bg-white"
                  >
                    <option value="Aberto">Aberto</option>
                    <option value="Em andamento">Em andamento</option>
                    <option value="Fechado">Fechado</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleFecharChamado(editNumero)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  5. Fechar Chamado #{String(editNumero).padStart(3, '0')}
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#191E5A] hover:bg-[#111542] rounded-lg cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        )}

        {adminTab === 'usuarios' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-5">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-950">
                  6. Cadastrar Usuário ({DOMINIO_PERMITIDO})
                </h2>
              </div>

              <form onSubmit={handleCadastrarUsuario} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={cadEmail}
                    onChange={(e) => setCadEmail(e.target.value)}
                    placeholder={`usuario${DOMINIO_PERMITIDO}`}
                    className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-950 focus:outline-none focus:border-[#191E5A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Senha *
                  </label>
                  <input
                    type="password"
                    required
                    value={cadSenha}
                    onChange={(e) => setCadSenha(e.target.value)}
                    placeholder="Senha de acesso"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-950 focus:outline-none focus:border-[#191E5A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Tipo de usuário (admin / usuario) *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCadTipo('usuario')}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                        cadTipo === 'usuario'
                          ? 'bg-[#191E5A] text-white border-[#191E5A]'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      usuario
                    </button>
                    <button
                      type="button"
                      onClick={() => setCadTipo('admin')}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                        cadTipo === 'admin'
                          ? 'bg-[#191E5A] text-white border-[#191E5A]'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      admin
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#191E5A] hover:bg-[#111542] rounded-lg inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Cadastrar Usuário</span>
                </button>
              </form>
            </div>

            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-950">
                  Usuários Cadastrados ({todosUsuarios.length})
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleDownloadJson('usuarios.json', todosUsuarios)
                  }
                  className="px-3 py-1.5 text-xs font-semibold text-[#191E5A] hover:bg-slate-100 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <FileJson className="w-3.5 h-3.5" />
                  <span>usuarios.json</span>
                </button>
              </div>
              <div className="divide-y divide-slate-200">
                {todosUsuarios.map((u) => (
                  <div
                    key={u.email}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-mono font-semibold text-slate-900">
                        {u.email}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Perfil atual: <strong className="font-mono text-slate-800">{u.tipo}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAlterarTipoUsuario(u.email, 'usuario')}
                        className={`px-3 py-1.5 rounded-md font-mono font-semibold border transition-colors cursor-pointer ${
                          u.tipo === 'usuario'
                            ? 'bg-[#191E5A] text-white border-[#191E5A]'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        usuario
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAlterarTipoUsuario(u.email, 'admin')}
                        className={`px-3 py-1.5 rounded-md font-mono font-semibold border transition-colors cursor-pointer ${
                          u.tipo === 'admin'
                            ? 'bg-[#191E5A] text-white border-[#191E5A]'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        admin
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {adminTab === 'abrir' && (
          <div className="max-w-2xl bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
            <div className="pb-5 border-b border-slate-200">
              <h2 className="font-display text-xl font-bold text-slate-950">
                Abrir Novo Chamado
              </h2>
            </div>

            <form onSubmit={handleAbrirChamado} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Assunto *
                </label>
                <input
                  type="text"
                  required
                  value={novoAssunto}
                  onChange={(e) => setNovoAssunto(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-950 focus:outline-none focus:border-[#191E5A] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Descrição *
                </label>
                <textarea
                  rows={4}
                  required
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-950 focus:outline-none focus:border-[#191E5A] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Plataforma *
                  </label>
                  <input
                    type="text"
                    required
                    value={novaPlataforma}
                    onChange={(e) => setNovaPlataforma(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-950 focus:outline-none focus:border-[#191E5A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Celular *
                  </label>
                  <input
                    type="text"
                    required
                    value={novoCelular}
                    onChange={(e) => setNovoCelular(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-950 focus:outline-none focus:border-[#191E5A] focus:bg-white tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  E-mail para contato *
                </label>
                <input
                  type="email"
                  required
                  value={novoEmailContato}
                  onChange={(e) => setNovoEmailContato(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-950 focus:outline-none focus:border-[#191E5A] focus:bg-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#191E5A] hover:bg-[#111542] rounded-lg cursor-pointer"
                >
                  Criar Chamado
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {renderFooter()}
    </div>
  );
}
