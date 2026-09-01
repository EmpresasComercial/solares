import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  Headphones, 
  Download, 
  User
} from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface AliTopBar1688Props {
  onOpenSupport?: () => void;
}

export const AliTopBar1688: React.FC<AliTopBar1688Props> = ({ onOpenSupport }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="w-full bg-[#FAFAFA] border-b border-gray-200 text-gray-600 text-[12px] font-sans">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 h-[34px] flex items-center justify-between">
        {/* Lado Esquerdo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[#FF5000] font-black italic text-[15px]">
            <span>1888</span>
            <span className="text-[11px] font-normal not-italic text-gray-500 hidden sm:inline ml-1">
              阿里巴巴旗下 • Atacado Global Direto da Fábrica
            </span>
          </div>
        </div>

        {/* Lado Direito - Ações Rápidas */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button 
            type="button"
            onClick={() => navigate('/registro')} 
            className="flex items-center gap-1 hover:text-[#FF5000] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-gray-400" />
            <span className="hidden sm:inline">Baixar App (PWA)</span>
            <span className="sm:hidden">App</span>
          </button>

          <button 
            type="button"
            onClick={() => navigate('/meus-produtos')} 
            className="flex items-center gap-1 hover:text-[#FF5000] transition-colors cursor-pointer"
          >
            <Package className="w-3.5 h-3.5 text-gray-400" />
            <span>Meus Pedidos</span>
          </button>

          <button 
            type="button"
            onClick={() => navigate('/produtos')} 
            className="flex items-center gap-1 hover:text-[#FF5000] transition-colors cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-gray-400" />
            <span>Lotes & Carrinho</span>
          </button>

          <button 
            type="button"
            onClick={() => onOpenSupport ? onOpenSupport() : navigate('/suporte-tickets')} 
            className="flex items-center gap-1 hover:text-[#FF5000] transition-colors cursor-pointer"
          >
            <Headphones className="w-3.5 h-3.5 text-gray-400" />
            <span>Serviço Oficial</span>
          </button>

          <div 
            onClick={() => navigate('/perfil')}
            className="w-6 h-6 rounded-full bg-[#FF5000]/10 flex items-center justify-center text-[#FF5000] cursor-pointer hover:bg-[#FF5000]/20 transition-colors ml-1"
            title="Meu Perfil"
          >
            <User className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
