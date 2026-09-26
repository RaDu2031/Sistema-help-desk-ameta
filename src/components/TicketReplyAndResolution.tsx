import React, { useState } from 'react';
import {
  CheckCircle2,
  Eye,
  MessageSquareReply,
  RotateCcw,
  Send,
  X,
} from 'lucide-react';
import { Chamado, StatusChamado } from '../types';

interface ErrorPhotoPreviewProps {
  fotoErro?: string;
  nomeFotoErro?: string;
}

export function ErrorPhotoPreview({
  fotoErro,
  nomeFotoErro,
}: ErrorPhotoPreviewProps) {
  const [openModal, setOpenModal] = useState(false);

  if (!fotoErro) return null;

  return (
    <div className="pt-3 border-t border-slate-100 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600">
          Foto do Erro Anexada
        </span>
        <button
          type="button"
          onClick={() => setOpenModal(true)}
          className="text-xs font-semibold text-[#191E5A] hover:underline inline-flex items-center gap-1 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Ampliar imagem</span>
        </button>
      </div>

      <div
        onClick={() => setOpenModal(true)}
        className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50 max-h-44 flex items-center justify-center cursor-pointer"
      >
        <img
          src={fotoErro}
          alt={nomeFotoErro || 'Foto do erro'}
          className="max-h-44 w-auto object-contain"
        />
      </div>

      {openModal && (
        <div
          onClick={() => setOpenModal(false)}
          className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl max-w-3xl w-full p-4 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-mono font-semibold text-slate-800">
                {nomeFotoErro || 'Foto do Erro'}
              </span>
              <button
                type="button"
                onClick={() => setOpenModal(false)}
                className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto flex justify-center bg-slate-950 rounded-lg p-2">
              <img
                src={fotoErro}
                alt={nomeFotoErro || 'Foto do erro'}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface UserResolutionSectionProps {
  chamado: Chamado;
  onResolver: (numero: number, resolvido: boolean) => void;
}

export function UserResolutionSection({
  chamado,
  onResolver,
}: UserResolutionSectionProps) {
  return (
    <div className="pt-4 border-t border-slate-200 space-y-4">
      {/* Resposta do Suporte Técnico (Admin) */}
      <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-[#191E5A]">
          <span className="font-semibold">Resposta do Suporte TI Ameta</span>
          {chamado.DataResposta && <span>{chamado.DataResposta}</span>}
        </div>
        {chamado.RespostaAdmin ? (
          <>
            <p className="text-xs text-slate-800 leading-relaxed">
              {chamado.RespostaAdmin}
            </p>
            {chamado.RespondidoPor && (
              <div className="text-[11px] font-mono text-slate-500 pt-1">
                Atendido por: {chamado.RespondidoPor}
              </div>
            )}
          </>
        ) : (
          <p className="text-xs text-slate-500">
            Aguardando resposta técnica do administrador.
          </p>
        )}
      </div>

      {/* Botão para o usuário confirmar se resolveu o problema */}
      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
        <div className="text-xs font-semibold text-slate-800">
          O seu problema foi resolvido?
        </div>

        {chamado.ResolvidoPeloUsuario === true &&
        chamado.Status === 'Fechado' ? (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-emerald-700 inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Você confirmou que o problema foi resolvido.</span>
            </span>
            <button
              type="button"
              onClick={() => onResolver(chamado.Numero, false)}
              className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:text-slate-950 border border-slate-300 rounded-md hover:bg-white cursor-pointer"
            >
              Reabrir
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onResolver(chamado.Numero, true)}
              className="flex-1 py-2.5 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Sim, Resolveu o Problema</span>
            </button>

            <button
              type="button"
              onClick={() => onResolver(chamado.Numero, false)}
              className="py-2.5 px-3 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-white border border-slate-300 hover:border-slate-400 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ainda Não Resolveu</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface AdminResponderTabProps {
  chamados: Chamado[];
  selectedNumero: number;
  onSelectNumero: (num: number) => void;
  onEnviarResposta: (
    numero: number,
    resposta: string,
    novoStatus: StatusChamado
  ) => Promise<void>;
}

export function AdminResponderTab({
  chamados,
  selectedNumero,
  onSelectNumero,
  onEnviarResposta,
}: AdminResponderTabProps) {
  const chamadoAtual =
    chamados.find((c) => c.Numero === selectedNumero) || chamados[0] || null;

  const [textoResposta, setTextoResposta] = useState<string>(
    chamadoAtual?.RespostaAdmin || ''
  );
  const [statusResposta, setStatusResposta] = useState<StatusChamado>(
    chamadoAtual?.Status === 'Aberto'
      ? 'Em andamento'
      : chamadoAtual?.Status || 'Em andamento'
  );

  const handleTrocarChamado = (c: Chamado) => {
    onSelectNumero(c.Numero);
    setTextoResposta(c.RespostaAdmin || '');
    setStatusResposta(c.Status === 'Aberto' ? 'Em andamento' : c.Status);
  };

  if (!chamadoAtual) {
    return (
      <div className="p-8 bg-white border border-slate-200 rounded-xl text-sm text-slate-500">
        Nenhum chamado cadastrado para responder.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onEnviarResposta(chamadoAtual.Numero, textoResposta, statusResposta);
  };

  return (
    <div className="max-w-3xl bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
      <div>
        <div className="text-xs font-mono text-[#191E5A] font-semibold">
          Atendimento ao Usuário
        </div>
        <h2 className="font-display text-xl font-bold text-slate-950 mt-0.5">
          Responder Solicitante
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Selecione o chamado, visualize a descrição e a foto do erro anexada, e
          envie a resposta técnica para o usuário.
        </p>
      </div>

      {/* Seletor de Chamado */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-2">
          Selecione o chamado para responder
        </label>
        <div className="flex flex-wrap gap-2">
          {chamados.map((c) => (
            <button
              key={c.Numero}
              type="button"
              onClick={() => handleTrocarChamado(c)}
              className={`px-3 py-2 text-xs font-mono font-semibold rounded-lg border transition-colors cursor-pointer tabular-nums ${
                chamadoAtual.Numero === c.Numero
                  ? 'bg-[#191E5A] text-white border-[#191E5A]'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400'
              }`}
            >
              #{String(c.Numero).padStart(3, '0')} · {c['Aberto por'].split('@')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Resumo do Chamado do Solicitante + Foto do Erro */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
          <div>
            <span className="font-mono text-xs font-bold text-[#191E5A]">
              Chamado #{String(chamadoAtual.Numero).padStart(3, '0')}
            </span>
            <span className="mx-2 text-slate-400">·</span>
            <span className="text-xs font-mono text-slate-600">
              Solicitante: {chamadoAtual['Aberto por']}
            </span>
          </div>
          <span className="text-xs font-mono text-slate-600">
            Plataforma: {chamadoAtual.Plataforma}
          </span>
        </div>

        <div>
          <div className="text-sm font-bold text-slate-950">
            {chamadoAtual.Assunto}
          </div>
          <p className="text-xs text-slate-700 mt-1 leading-relaxed">
            {chamadoAtual.Descricao}
          </p>
        </div>

        {chamadoAtual.ResolvidoPeloUsuario !== null &&
          chamadoAtual.ResolvidoPeloUsuario !== undefined && (
            <div className="text-xs font-semibold pt-1">
              Status informado pelo usuário:{' '}
              {chamadoAtual.ResolvidoPeloUsuario ? (
                <span className="text-emerald-700">
                  Problema Resolvido pelo Solicitante
                </span>
              ) : (
                <span className="text-amber-700">
                  Solicitante informou que ainda não resolveu
                </span>
              )}
            </div>
          )}

        <ErrorPhotoPreview
          fotoErro={chamadoAtual.FotoErro}
          nomeFotoErro={chamadoAtual.NomeFotoErro}
        />
      </div>

      {/* Formulário de Resposta */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Mensagem / Solução para o Solicitante *
          </label>
          <textarea
            rows={4}
            required
            value={textoResposta}
            onChange={(e) => setTextoResposta(e.target.value)}
            placeholder="Descreva a orientação técnica ou confirmação do reparo para o usuário..."
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-950 focus:outline-none focus:border-[#191E5A] focus:bg-white"
          />
        </div>

        <div className="max-w-xs">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Atualizar Status ao Responder
          </label>
          <select
            value={statusResposta}
            onChange={(e) => setStatusResposta(e.target.value as StatusChamado)}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-950 focus:outline-none focus:border-[#191E5A] focus:bg-white"
          >
            <option value="Em andamento">Em andamento</option>
            <option value="Fechado">Fechado</option>
            <option value="Aberto">Aberto</option>
          </select>
        </div>

        <div className="pt-3 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-semibold text-white bg-[#191E5A] hover:bg-[#111542] rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Enviar Resposta ao Solicitante</span>
          </button>
        </div>
      </form>
    </div>
  );
}
