import React, { useRef } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';

interface TicketPhotoFieldProps {
  fotoErro: string;
  nomeFotoErro: string;
  onSelectPhoto: (dataUrl: string, fileName: string) => void;
  onClearPhoto: () => void;
}

export function TicketPhotoField({
  fotoErro,
  nomeFotoErro,
  onSelectPhoto,
  onClearPhoto,
}: TicketPhotoFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onSelectPhoto(reader.result, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="block text-xs font-semibold text-slate-800">
            Carregar Foto do Erro (Print / Imagem)
          </span>
          <span className="text-[11px] text-slate-500">
            Anexe um print da tela ou foto demonstrando o problema técnico.
          </span>
        </div>
        {fotoErro && (
          <button
            type="button"
            onClick={() => {
              onClearPhoto();
              if (inputRef.current) inputRef.current.value = '';
            }}
            className="px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 rounded-md inline-flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remover</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {!fotoErro ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full py-5 px-4 border border-dashed border-slate-300 hover:border-[#191E5A] rounded-lg bg-white hover:bg-blue-50/30 transition-colors flex flex-col items-center justify-center gap-1.5 cursor-pointer"
        >
          <ImagePlus className="w-5 h-5 text-[#191E5A]" />
          <span className="text-xs font-semibold text-[#191E5A]">
            Clique para selecionar a foto do erro
          </span>
          <span className="text-[11px] text-slate-400">
            PNG, JPG ou WEBP
          </span>
        </button>
      ) : (
        <div className="space-y-2">
          <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-white max-h-52 flex items-center justify-center">
            <img
              src={fotoErro}
              alt={nomeFotoErro || 'Foto do erro anexada'}
              className="max-h-52 w-auto object-contain"
            />
          </div>
          <div className="text-[11px] font-mono text-slate-600 truncate">
            Arquivo: {nomeFotoErro || 'imagem_erro.png'}
          </div>
        </div>
      )}
    </div>
  );
}
