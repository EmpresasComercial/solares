import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface HeaderBannerProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
}

export const HeaderBanner: React.FC<HeaderBannerProps> = ({
  title,
  subtitle,
  showBack = true
}) => {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-[480px] relative overflow-hidden select-none" style={{ height: '130px' }}>
      <img
        src="/header.jpg"
        alt="Header Banner 1888"
        className="w-full h-full object-cover"
        style={{
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 35%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 35%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0) 100%)'
        }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      {/* Overlay escuro superior para contraste dos botões e logo */}
      <div 
        className="absolute inset-0 bg-black/25 pointer-events-none" 
        style={{
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 90%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 90%)'
        }}
      />

      {/* Gradiente de fade na parte inferior fundindo com o fundo branco */}
      <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-b from-transparent via-white/60 to-white pointer-events-none" />

      {/* Barra de Navegação Superior */}
      <div className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between z-10">
        {showBack ? (
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 bg-black/60 text-white flex items-center justify-center cursor-pointer hover:bg-black/80 transition-colors"
            title="Voltar"
            aria-label="Voltar"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
        ) : <div />}

        <div className="text-white text-[12px] font-bold drop-shadow-sm">
          <span className="text-[#FF5000] italic font-black text-[15px]">1888</span> • 官方直供
        </div>
      </div>

      {/* Título da Página no Banner */}
      {title && (
        <div className="absolute bottom-2 left-3 z-10">
          <h1 className="text-[16px] font-bold tracking-tight leading-tight text-gray-900 drop-shadow-xs">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] text-gray-600 font-medium mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
