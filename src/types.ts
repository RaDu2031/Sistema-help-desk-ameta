export type TipoUsuario = 'admin' | 'usuario';

export interface Usuario {
  email: string;
  senha?: string;
  tipo: TipoUsuario;
}

export type StatusChamado = 'Aberto' | 'Em andamento' | 'Fechado';

export interface Chamado {
  Numero: number;
  'Aberto por': string;
  Assunto: string;
  Descricao: string;
  Plataforma: string;
  Celular: string;
  'E-mail': string;
  Status: StatusChamado;
}

export const DOMINIO_PERMITIDO = '@ametaservicos.com.br';

export function emailValido(email: string): boolean {
  return email.trim().toLowerCase().endsWith(DOMINIO_PERMITIDO);
}
