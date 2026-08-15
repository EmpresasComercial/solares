import React from 'react';
import { motion } from 'motion/react';
import { formatCurrency } from '../../../lib/currency';
import { SmartImage } from '../../../components/SmartImage';

export interface Product {
  id: string;
  nome: string;
  descricao: string;
  priceValue: number;
  durationDays: number;
  size?: string;
  imagem_url?: string;
  renda_diaria: string | number;
  comprados_count?: number;
}

interface ProductCardProps {
  product: Product;
  index: number;
  onBuy: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index, onBuy }) => {
  const priceAOA = formatCurrency(product.priceValue, 'KZ');
  const promoAOA = formatCurrency(product.priceValue * 0.982, 'KZ');
  const dailyAOA = formatCurrency(Number(product.renda_diaria), 'KZ');

  const salesRaw = product.comprados_count ?? (1000 + (index * 2731) % 11000);
  const salesLabel = salesRaw >= 1000
    ? `${Math.floor(salesRaw / 1000)}.000+ vendido(s)`
    : `${salesRaw}+ vendido(s)`;
  const rating = (4.6 + ((index * 0.07) % 0.4)).toFixed(1);

  const hasPromo = index % 3 !== 1;
  const hasChoice = index % 4 !== 3;
  const hasFrete = index % 2 === 0;
  const isAnuncio = index % 5 === 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.18 }}
      onClick={() => onBuy(product.id)}
      className="bg-white flex flex-col cursor-pointer select-none active:opacity-80 transition-opacity"
    >
      {/* Imagem — Full bleed, sem padding, proporção ~1:1 */}
      <div className="w-full aspect-square bg-[#F2F2F2] relative overflow-hidden flex-shrink-0">
        {product.imagem_url ? (
          <SmartImage
            src={product.imagem_url}
            alt={product.nome}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
            <span className="text-5xl">☀️</span>
          </div>
        )}

        {/* Badge "Anúncio" canto superior direito */}
        {isAnuncio && (
          <div className="absolute top-1.5 right-1.5 bg-[#1A1A1A]/70 text-white text-[9px] font-medium px-1.5 py-[2px] rounded-[3px]">
            Anúncio
          </div>
        )}
      </div>

      {/* Info abaixo da imagem */}
      <div className="px-1.5 pt-1.5 pb-2 flex flex-col gap-[3px] flex-1">

        {/* Preço Principal — Vermelho coral grande */}
        <div className="text-[15px] font-bold text-[#FF2442] leading-tight">
          {priceAOA}
        </div>

        {/* Linha "Em breve" com raio (promoção) */}
        {hasPromo && (
          <div className="flex items-center gap-0.5 text-[10.5px] text-[#FF2442] font-medium leading-tight">
            <span>⚡</span>
            <span>Em breve {promoAOA}</span>
          </div>
        )}

        {/* Badges Choice + Promo */}
        <div className="flex items-center gap-1 flex-wrap">
          {hasChoice && (
            <span className="bg-[#1A1A1A] text-white text-[9px] font-bold px-[5px] py-[1.5px] rounded-[3px] leading-none">
              Choice
            </span>
          )}
          {hasPromo && (
            <span className="bg-[#FF2442] text-white text-[9px] font-bold px-[5px] py-[1.5px] rounded-[3px] leading-none">
              Promo
            </span>
          )}
        </div>

        {/* Vendidos + Estrela + Avaliação */}
        <div className="flex items-center gap-1 text-[10.5px] text-[#666666] leading-tight">
          <span>{salesLabel}</span>
          <span className="text-amber-400">★</span>
          <span>{rating}</span>
        </div>

        {/* Título / Descrição do produto (2 linhas) */}
        <p className="text-[11.5px] text-[#1A1A1A] font-normal leading-snug line-clamp-2">
          {product.descricao || product.nome}
        </p>

        {/* Frete grátis / Renda diária em verde */}
        {hasFrete && (
          <div className="flex items-center gap-1 text-[10.5px] text-[#00A058] font-medium leading-tight">
            <span>🚚</span>
            <span>Renda: {dailyAOA}/dia</span>
          </div>
        )}

      </div>
    </motion.div>
  );
};
