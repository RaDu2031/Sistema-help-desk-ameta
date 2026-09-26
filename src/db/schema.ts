import { relations } from 'drizzle-orm';
import { boolean, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull().unique(),
  senha: text('senha').notNull().default('ameta2026'),
  tipo: text('tipo').notNull().default('usuario'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const chamados = pgTable('chamados', {
  numero: serial('numero').primaryKey(),
  abertoPor: text('aberto_por').notNull(),
  assunto: text('assunto').notNull(),
  descricao: text('descricao').notNull(),
  plataforma: text('plataforma').notNull(),
  celular: text('celular').notNull(),
  email: text('email').notNull(),
  status: text('status').notNull().default('Aberto'),
  fotoErro: text('foto_erro'),
  nomeFotoErro: text('nome_foto_erro'),
  respostaAdmin: text('resposta_admin'),
  respondidoPor: text('respondido_por'),
  dataResposta: text('data_resposta'),
  resolvidoPeloUsuario: boolean('resolvido_pelo_usuario'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  chamados: many(chamados),
}));

export const chamadosRelations = relations(chamados, ({ one }) => ({
  autor: one(users, {
    fields: [chamados.abertoPor],
    references: [users.email],
  }),
}));
