import React from 'react';
import { motion } from 'motion/react';
import { formatCurrency } from '../../../lib/currency';
import { SmartImage } from '../../../components/SmartImage';

export interface Product {
  id: string;
  nome: string;
  descricao?: string;
  preco?: number;
  priceValue: number;
  duracao_dias?: number;
  durationDays: number;
  imagem_url?: string;
  renda_diaria: string | number;
  limite_compra?: number;
}

interface ProductCardProps {
  product: Product;
  index: number;
  onBuy: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index, onBuy }) => {
  const priceAOA = formatCurrency(product.priceValue, 'KZ');
  const dailyNum = Number(product.renda_diaria) || 0;
  const daysNum = Number(product.durationDays || product.duracao_dias) || 1;
  const dailyAOA = formatCurrency(dailyNum, 'KZ');
  const totalProfitAOA = formatCurrency(dailyNum * daysNum, 'KZ');
  const purchaseLimit = product.limite_compra ?? 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.18 }}
      onClick={() => onBuy(product.id)}
      className="bg-white flex flex-col cursor-pointer select-none active:opacity-80 transition-opacity rounded-none border border-gray-100"
    >
      <div className="w-full h-[120px] bg-[#FAFAFA] relative overflow-hidden flex-shrink-0 flex items-center justify-center">
        {product.imagem_url ? (
          <SmartImage
            src={product.imagem_url}
            alt={product.nome}
            className="w-full h-full object-contain p-2"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 text-3xl">
            📦
          </div>
        )}
      </div>

      <div className="p-2.5 flex flex-col gap-1.5 flex-1">
        <h3 className="text-[12.5px] font-medium text-[#202020] leading-snug line-clamp-1">
          {product.nome}
        </h3>

        <div className="text-[14.5px] font-bold text-[#FE384F] leading-tight">
          {priceAOA}
        </div>

        <div className="flex flex-col gap-1 pt-1.5 border-t border-[#F5F5F5] text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-[#888888]">Renda diária:</span>
            <span className="font-medium text-[#202020]">{dailyAOA}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#888888]">Duração:</span>
            <span className="font-medium text-[#202020]">{daysNum} dias</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#888888]">Lucro total:</span>
            <span className="font-medium text-[#16a34a]">{totalProfitAOA}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#888888]">Qtd. de compra:</span>
            <span className="font-medium text-[#202020]">{purchaseLimit}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
