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

      </div>
    </div>
  );
};
