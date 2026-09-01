import React, { useState, useEffect } from 'react';
import { Volume2, ChevronRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TradeTicker1688: React.FC = () => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);

  const messages = [
    { title: '1888 Atacado', text: 'Super Fábrica despachou 500 kits fotovoltaicos para Angola' },
    { title: 'Transação VIP', text: 'Parceiro ***3120 recebeu rendimento diário de KZ 35.000' },
    { title: 'Garantia B2B', text: 'Proteção de pagamento 1888 ativa em todos os pedidos' },
    { title: 'Novo Lote', text: 'Módulos solares de alta eficiência com desconto por volume' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [messages.length]);

  return (
    <div className="w-full bg-[#FFF7F0] border-y border-orange-100/80 px-3.5 py-2 flex items-center justify-between select-none">
      <div 
        onClick={() => navigate('/suporte')}
        className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
      >
        <div className="flex items-center gap-1 bg-[#FF5000] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm shrink-0">
          <Volume2 className="w-3 h-3 stroke-[2.5]" />
          <span>1888 NOTÍCIAS</span>
        </div>

        <div className="flex-1 min-w-0 overflow-hidden">
          <p className="text-[12px] text-gray-700 font-medium truncate animate-fadeIn">
            {messages[index].text}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate('/produtos')}
        className="text-[#FF5000] hover:text-[#E03E00] flex items-center text-[11.5px] font-bold shrink-0 ml-1"
      >
        <span>Ver mais</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
