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
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      {/* Overlay escuro */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Barra de Navegação Superior */}
      <div className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between z-10">
        {showBack ? (
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 bg-black/50 text-white flex items-center justify-center cursor-pointer hover:bg-black/70 transition-colors"
            title="Voltar"
            aria-label="Voltar"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
        ) : <div />}

        <div className="text-white text-[12px] font-bold">
          <span className="text-[#FF5000] italic font-black text-[15px]">1888</span> • 官方直供
        </div>
      </div>

      {/* Título da Página no Banner */}
      {title && (
        <div className="absolute bottom-3 left-3 text-white">
          <h1 className="text-[17px] font-bold tracking-tight leading-tight drop-shadow-sm">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] text-gray-200 opacity-90 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
