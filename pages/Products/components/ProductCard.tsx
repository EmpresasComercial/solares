import React from 'react';
import { motion } from 'motion/react';
import { Button } from '../../../components/Button';
import { useLanguage } from '../../../contexts/LanguageContext';
import { formatCurrency } from '../../../lib/currency';
import { SmartImage } from '../../../components/SmartImage';
import { ChevronRight, Clock, ShieldCheck } from 'lucide-react';

export interface Product {
  id: string;
  nome: string;
  descricao: string;
  priceValue: number;
  durationDays: number;
  size: string;
  icon?: React.ReactNode;
  imagem_url?: string;
  renda_diaria: string | number;
}

interface ProductCardProps {
  product: Product;
  index: number;
  onBuy: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index, onBuy }) => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group bg-white rounded-[24px] p-5 flex flex-col border border-[#F1F5F9] hover:border-[#0067b8]/20 transition-all hover:shadow-sm"
    >
      <div className="flex items-start gap-5">
        {/* Product Image / Icon - Elevated & Clean */}
        <div className="w-20 h-20 shrink-0 flex items-center justify-center transition-transform group-hover:scale-105 duration-500">
          {product.imagem_url ? (
            <SmartImage 
              src={product.imagem_url} 
              alt={product.nome} 
              className="w-full h-full object-contain !bg-transparent"
              style={{ background: 'transparent' }}
            />
          ) : (
            <div className="text-[#0067b8]/30">
              <ShieldCheck size={32} strokeWidth={1} />
            </div>
          )}
        </div>

        {/* Product Details - Light Typography */}
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-[16px] font-medium text-[#111827] tracking-tight truncate">
              {product.nome}
            </h3>
          </div>
          
          <p className="text-[12px] text-[#94A3B8] font-light leading-snug line-clamp-2">
            {product.descricao}
          </p>

          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[18px] font-normal bg-gradient-to-r from-[#C62828] to-[#1A237E] bg-clip-text text-transparent">
                  {formatCurrency(product.priceValue, 'KZ')}
                </span>
                <span className="text-[11px] text-[#94A3B8] font-light tracking-tighter">
                  Kz
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-medium text-[#C62828] tracking-wide">
                  +{formatCurrency(Number(product.renda_diaria), 'KZ')}
                </span>
                <span className="text-[9px] text-[#94A3B8] font-light">Diários</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F9]">
              <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-[#94A3B8]" />
                <span className="text-[11px] text-[#94A3B8] font-light">
                  Duração: {product.durationDays}/Dias
                </span>
              </div>
              <button 
                onClick={() => onBuy(product.id)}
                className="h-7 px-5 rounded-full bg-gradient-to-r from-[#C62828] to-[#1A237E] flex items-center justify-center text-white text-[11px] font-medium shadow-sm transition-all hover:shadow-md active:scale-95"
              >
                Comprar
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
