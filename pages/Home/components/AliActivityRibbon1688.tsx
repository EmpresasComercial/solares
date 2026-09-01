import React from 'react';
import { 
  ShieldCheck, 
  Truck, 
  Coins, 
  Headphones, 
  FileCheck, 
  Award, 
  BadgePercent, 
  TrendingUp 
} from 'lucide-react';

export const AliActivityRibbon1688: React.FC = () => {
  const ribbons = [
    { title: '48h Despacho', subtitle: 'Envio Imediato', icon: <Truck className="w-4 h-4 text-[#FF5000]" /> },
    { title: 'Preço de Fábrica', subtitle: 'Sem Intermediários', icon: <Coins className="w-4 h-4 text-amber-500" /> },
    { title: 'Origem Certificada', subtitle: 'Fábricas Auditadas', icon: <ShieldCheck className="w-4 h-4 text-emerald-500" /> },
    { title: 'Rendimento Diário', subtitle: 'Lucro Creditado', icon: <TrendingUp className="w-4 h-4 text-blue-500" /> },
    { title: 'Contrato Digital', subtitle: 'Garantia 1888', icon: <FileCheck className="w-4 h-4 text-purple-500" /> },
    { title: 'Atacado Direto', subtitle: 'Lotes Escaláveis', icon: <BadgePercent className="w-4 h-4 text-rose-500" /> },
    { title: 'Suporte VIP 24/7', subtitle: 'Atendimento Ágil', icon: <Headphones className="w-4 h-4 text-cyan-600" /> },
    { title: 'Padrão Alibaba', subtitle: 'B2B Internacional', icon: <Award className="w-4 h-4 text-[#FF5000]" /> },
  ];

  return (
    <div className="w-full bg-white rounded-2xl p-3 shadow-xs border border-gray-100 font-sans overflow-x-auto no-scrollbar">
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 min-w-[680px] sm:min-w-0">
        {ribbons.map((item, idx) => (
          <div 
            key={idx} 
            className="flex items-center gap-2 p-2 rounded-xl bg-[#FAFAFA] border border-gray-100 hover:border-orange-200 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-white shadow-2xs flex items-center justify-center shrink-0">
              {item.icon}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-gray-900 truncate">
                {item.title}
              </span>
              <span className="text-[9.5px] text-gray-400 truncate">
                {item.subtitle}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
