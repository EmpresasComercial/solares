import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface HeaderBannerProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  children?: React.ReactNode;
}

export const HeaderBanner: React.FC<HeaderBannerProps> = ({
  title,
  subtitle,
  showBack = true,
  onBack,
  children
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="w-full max-w-[480px] relative overflow-hidden select-none bg-white" style={{ minHeight: children ? '140px' : '110px' }}>
      {/* Imagem de Fundo com Gradient Fade */}
      <img
        src="/header.jpg"
        alt="Header Banner 1888"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0.4) 75%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0.4) 75%, rgba(0,0,0,0) 100%)'
        }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      
      {/* Overlay escuro superior para contraste nítido */}
      <div 
        className="absolute inset-0 bg-black/35 pointer-events-none" 
        style={{
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 90%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 90%)'
        }}
      />

      {/* Gradiente de fade na parte inferior fundindo 100% com o fundo branco */}
      <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-b from-transparent via-white/70 to-white pointer-events-none" />

      {/* Conteúdo do Header: Ícone de Voltar e Título na Mesma Linha */}
      <div className="relative z-10 p-3 flex flex-col justify-between h-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {showBack && (
              <button
                type="button"
                onClick={handleBack}
                className="w-8 h-8 bg-black/50 hover:bg-black/70 text-white flex items-center justify-center cursor-pointer transition-colors"
                title="Voltar"
                aria-label="Voltar"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
            )}
            
            {/* Título Imediatamente ao lado do botão de voltar */}
            <h1 className="text-[16px] font-bold text-white tracking-tight drop-shadow-md">
              {title}
            </h1>
          </div>

          <div className="text-white text-[11px] font-bold drop-shadow-sm pr-1">
            <span className="text-[#FF5000] italic font-black text-[14px]">1888</span>
          </div>
        </div>

        {/* Subtítulo ou Elemento Customizado (ex: Indicador de Etapas) */}
        {children ? (
          <div className="mt-3 relative z-10">
            {children}
          </div>
        ) : subtitle ? (
          <p className="text-[11.5px] text-gray-700 font-medium pl-10 mt-1">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
};
