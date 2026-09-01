import React from 'react';
import { motion } from 'motion/react';
import { formatCurrency } from '../../../lib/currency';
import { SmartImage } from '../../../components/SmartImage';
import { Building2, ShieldCheck, Truck, Star, Sparkles, Award } from 'lucide-react';

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

  // Fábricas simuladas de origem 1688
  const factoryLocations = ['Shenzhen SolarTech', 'Guangdong Energy Co.', 'Yiwu Direct Supply', 'Zhejiang Power Ltd.'];
  const factoryLoc = factoryLocations[index % factoryLocations.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      onClick={() => onBuy(product.id)}
      className="bg-white flex flex-col cursor-pointer select-none active:scale-[0.99] transition-colors rounded-none border border-gray-200 hover:border-[#FF5000] overflow-hidden"
    >
      {/* Imagem do Produto com Badges 1688 */}
      <div className="w-full h-[190px] bg-[#FAF8F5] relative overflow-hidden flex-shrink-0 flex items-center justify-center border-b border-gray-200">
        {product.imagem_url ? (
          <SmartImage
            src={product.imagem_url}
            alt={product.nome}
            className="w-full h-full object-contain p-3 transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 text-3xl">
            📦
          </div>
        )}

        {/* Badge 1688 Super Factory */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#FF5000] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-none">
          <Building2 className="w-3 h-3 stroke-[2.2]" />
          <span>超级工厂 • SUPER FÁBRICA</span>
        </div>

        {/* Localização da Fábrica */}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[9.5px] font-medium px-1.5 py-0.5 rounded-none flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-emerald-400" />
          <span>{factoryLoc}</span>
        </div>

        {/* Badge de Recompra */}
        <div className="absolute top-2 right-2 bg-amber-500 text-white text-[9.5px] font-bold px-1.5 py-0.5 rounded-none">
          98.9% Recompra
        </div>
      </div>

      {/* Detalhes e Preços no Estilo 1688 */}
      <div className="p-3.5 flex flex-col gap-2 flex-1">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-bold text-[#FF5000] bg-orange-50 border border-orange-200 px-1.5 py-0.2 rounded-none">
              Preço de Fábrica
            </span>
            <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-none flex items-center gap-0.5">
              <Truck className="w-2.5 h-2.5" /> 48h Envio
            </span>
          </div>

          <h3 className="text-[14px] font-bold text-gray-900 leading-snug line-clamp-1">
            {product.nome}
          </h3>
        </div>

        {/* Preço de Atacado em Destaque Laranja 1688 */}
        <div className="flex items-baseline justify-between pt-1 border-t border-gray-100">
          <div className="flex items-baseline gap-1">
            <span className="text-[11px] font-bold text-[#FF5000]">KZ</span>
            <span className="text-[19px] font-black text-[#FF5000] tracking-tight">
              {priceAOA.replace('KZ', '').replace('Kz', '').trim()}
            </span>
            <span className="text-[11px] text-gray-400 font-normal">/ unidade</span>
          </div>

          <div className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-none border border-emerald-200">
            + {dailyAOA}/dia
          </div>
        </div>

        {/* Especificações de Rendimento */}
        <div className="grid grid-cols-2 gap-1.5 py-2 px-2.5 bg-[#FFF9F5] border border-orange-100 rounded-none text-[11.5px]">
          <div>
            <span className="text-gray-500 block text-[10.5px]">Ciclo Total:</span>
            <span className="font-bold text-gray-800">{daysNum} dias</span>
          </div>
          <div>
            <span className="text-gray-500 block text-[10.5px]">Lucro Total:</span>
            <span className="font-bold text-emerald-600">{totalProfitAOA}</span>
          </div>
        </div>

        {/* Botão de Compra no estilo 1688 */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onBuy(product.id);
          }}
          className="w-full h-[38px] mt-1 bg-[#FF5000] hover:bg-[#E04400] active:scale-[0.99] text-white font-bold text-[13px] rounded-none transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Building2 className="w-4 h-4" />
          <span>Encomendar Lote da Fábrica</span>
        </button>
      </div>
    </motion.div>
  );
};
