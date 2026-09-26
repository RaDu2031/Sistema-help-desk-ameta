import { asc, eq } from 'drizzle-orm';
import { db } from './index.ts';
import { chamados, users } from './schema.ts';

export interface ChamadoDTO {
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

export function mapChamadoRowToDTO(row: typeof chamados.$inferSelect): ChamadoDTO {
  return {
    Numero: row.numero,
    'Aberto por': row.abertoPor,
    Assunto: row.assunto,
    Descricao: row.descricao,
    Plataforma: row.plataforma,
    Celular: row.celular,
    'E-mail': row.email,
    Status: (row.status as 'Aberto' | 'Em andamento' | 'Fechado') || 'Aberto',
    ...(row.fotoErro ? { FotoErro: row.fotoErro } : {}),
    ...(row.nomeFotoErro ? { NomeFotoErro: row.nomeFotoErro } : {}),
    ...(row.respostaAdmin ? { RespostaAdmin: row.respostaAdmin } : {}),
    ...(row.respondidoPor ? { RespondidoPor: row.respondidoPor } : {}),
    ...(row.dataResposta ? { DataResposta: row.dataResposta } : {}),
    ResolvidoPeloUsuario: row.resolvidoPeloUsuario ?? null,
  };
}

export async function getOrCreateUser(uid: string, email: string) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const isDefaultAdmin =
      cleanEmail === 'rafael.araujo@ametaservicos.com.br' ||
      cleanEmail === 'rafael.araujo0797@gmail.com' ||
      cleanEmail === 'helena.costa@ametaservicos.com.br';

    const existingByEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, cleanEmail));

    if (existingByEmail.length > 0) {
      const updated = await db
        .update(users)
        .set({ uid })
        .where(eq(users.email, cleanEmail))
        .returning();
      return updated[0];
    }

    const result = await db
      .insert(users)
      .values({
        uid,
        email: cleanEmail,
        senha: isDefaultAdmin ? 'admin123' : 'ameta2026',
        tipo: isDefaultAdmin ? 'admin' : 'usuario',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: cleanEmail,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database query failed in getOrCreateUser:', error);
    throw new Error('Database query failed. Please try again later.', {
      cause: error,
    });
  }
}

export async function getAllUsers() {
  try {
    return await db.select().from(users).orderBy(asc(users.id));
  } catch (error) {
    console.error('Database query failed in getAllUsers:', error);
    throw new Error('Database query failed. Please try again later.', {
      cause: error,
    });
  }
}

export async function getUserByEmail(email: string) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, cleanEmail));
    return rows[0] || null;
  } catch (error) {
    console.error('Database query failed in getUserByEmail:', error);
    throw new Error('Database query failed. Please try again later.', {
      cause: error,
    });
  }
}

export async function createUserWithCredentials(
  email: string,
  senha: string,
  tipo: 'admin' | 'usuario'
) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const uid = `local_${cleanEmail}`;
    const result = await db
      .insert(users)
      .values({
        uid,
        email: cleanEmail,
        senha,
        tipo,
      })
      .onConflictDoNothing()
      .returning();
    return result[0] || null;
  } catch (error) {
    console.error('Database query failed in createUserWithCredentials:', error);
    throw new Error('Database query failed. Please try again later.', {
      cause: error,
    });
  }
}

export async function updateUserRole(email: string, tipo: 'admin' | 'usuario') {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const result = await db
      .update(users)
      .set({ tipo })
      .where(eq(users.email, cleanEmail))
      .returning();
    return result[0] || null;
  } catch (error) {
    console.error('Database query failed in updateUserRole:', error);
    throw new Error('Database query failed. Please try again later.', {
      cause: error,
    });
  }
}

export async function getAllChamados(): Promise<ChamadoDTO[]> {
  try {
    const rows = await db.select().from(chamados).orderBy(asc(chamados.numero));
    return rows.map(mapChamadoRowToDTO);
  } catch (error) {
    console.error('Database query failed in getAllChamados:', error);
    throw new Error('Database query failed. Please try again later.', {
      cause: error,
    });
  }
}

export async function getChamadoByNumero(numero: number): Promise<ChamadoDTO | null> {
  try {
    const rows = await db
      .select()
      .from(chamados)
      .where(eq(chamados.numero, numero));
    return rows[0] ? mapChamadoRowToDTO(rows[0]) : null;
  } catch (error) {
    console.error('Database query failed in getChamadoByNumero:', error);
    throw new Error('Database query failed. Please try again later.', {
      cause: error,
    });
  }
}

export async function createChamadoRecord(input: {
  abertoPor: string;
  assunto: string;
  descricao: string;
  plataforma: string;
  celular: string;
  email: string;
  fotoErro?: string;
  nomeFotoErro?: string;
}): Promise<ChamadoDTO> {
  try {
    const inserted = await db
      .insert(chamados)
      .values({
        abertoPor: input.abertoPor,
        assunto: input.assunto,
        descricao: input.descricao,
        plataforma: input.plataforma,
        celular: input.celular,
        email: input.email,
        status: 'Aberto',
        fotoErro: input.fotoErro || null,
        nomeFotoErro: input.nomeFotoErro || null,
        resolvidoPeloUsuario: null,
      })
      .returning();
    return mapChamadoRowToDTO(inserted[0]);
  } catch (error) {
    console.error('Database query failed in createChamadoRecord:', error);
    throw new Error('Database query failed. Please try again later.', {
      cause: error,
    });
  }
}

export async function updateChamadoFields(
  numero: number,
  updates: Partial<{
    assunto: string;
    descricao: string;
    plataforma: string;
    celular: string;
    email: string;
    status: string;
    respostaAdmin: string;
    respondidoPor: string;
    dataResposta: string;
    resolvidoPeloUsuario: boolean | null;
  }>
): Promise<ChamadoDTO | null> {
  try {
    const updated = await db
      .update(chamados)
      .set(updates)
      .where(eq(chamados.numero, numero))
      .returning();
    return updated[0] ? mapChamadoRowToDTO(updated[0]) : null;
  } catch (error) {
    console.error('Database query failed in updateChamadoFields:', error);
    throw new Error('Database query failed. Please try again later.', {
      cause: error,
    });
  }
}
