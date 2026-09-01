import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PackageCheck, 
  Globe, 
  Zap, 
  Percent, 
  ShieldCheck, 
  Building2, 
  Store, 
  Cpu 
} from 'lucide-react';

interface ChannelDoor {
  id: string;
  chineseTitle: string;
  title: string;
  subTitle: string;
  badge: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}

export const AliCentralDoor1688: React.FC = () => {
  const navigate = useNavigate();

  const doors: ChannelDoor[] = [
    {
      id: 'yjdf',
      chineseTitle: '一件代发',
      title: 'Dropshipping',
      subTitle: 'Envio Direto Unitário',
      badge: 'Sem Estoque',
      color: '#0072FD',
      bgColor: '#F0F6FF',
      icon: <PackageCheck className="w-5 h-5 text-[#0072FD]" />
    },
    {
      id: 'kjzg',
      chineseTitle: '跨境专供',
      title: 'Cross-Border',
      subTitle: 'Exportação & Comércio',
      badge: 'Tendência',
      color: '#8F56ED',
      bgColor: '#F8F3FF',
      icon: <Globe className="w-5 h-5 text-[#8F56ED]" />
    },
    {
      id: 'xdjh',
      chineseTitle: '闪购直供',
      title: 'Envio 48h',
      subTitle: 'Estoque Pronta Entrega',
      badge: 'Frete Grátis',
      color: '#86521B',
      bgColor: '#FFF7EE',
      icon: <Zap className="w-5 h-5 text-[#E07A00]" />
    },
    {
      id: 'sdny',
      chineseTitle: '闪电拿样',
      title: 'Amostras',
      subTitle: 'Até 50% de Desconto',
      badge: '50% OFF',
      color: '#FF5B00',
      bgColor: '#FFF4EB',
      icon: <Percent className="w-5 h-5 text-[#FF5B00]" />
    },
    {
      id: 'yxhw',
      chineseTitle: '严选好物',
      title: 'Seleção Ouro',
      subTitle: 'Qualidade Inspecionada',
      badge: 'Garantia',
      color: '#BC8136',
      bgColor: '#FDF7EB',
      icon: <ShieldCheck className="w-5 h-5 text-[#BC8136]" />
    },
    {
      id: 'bchd',
      chineseTitle: '必采好店',
      title: 'Super Fábricas',
      subTitle: 'Fornecedores Ouro VIP',
      badge: 'Certificado',
      color: '#E53E3E',
      bgColor: '#FFF0F0',
      icon: <Building2 className="w-5 h-5 text-[#E53E3E]" />
    },
    {
      id: 'qycg',
      chineseTitle: '企业采购',
      title: 'Empresarial',
      subTitle: 'Faturamento & Lotes B2B',
      badge: 'Atacado',
      color: '#D97706',
      bgColor: '#FFFBEB',
      icon: <Store className="w-5 h-5 text-[#D97706]" />
    },
    {
      id: 'wodz',
      chineseTitle: '哇噢定制',
      title: 'Sob Medida',
      subTitle: 'Personalização OEM/ODM',
      badge: 'Custom',
      color: '#059669',
      bgColor: '#ECFDF5',
      icon: <Cpu className="w-5 h-5 text-[#059669]" />
    }
  ];

  return (
    <div className="w-full bg-white rounded-2xl p-3 sm:p-4 shadow-xs border border-gray-100 font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 bg-[#FF5000] rounded-full" />
          <h2 className="text-[15px] font-black text-gray-900 tracking-tight">
            1888 核心业务 • Canais Centrais de Atacado
          </h2>
        </div>
        <span className="text-[11px] font-bold text-[#FF5000] bg-orange-50 px-2 py-0.5 rounded-full">
          Preços de Fábrica
        </span>
      </div>

      {/* Grade de 8 Portas Centrais estilo 1688 Central Door */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3">
        {doors.map((door) => (
          <div
            key={door.id}
            onClick={() => navigate('/produtos')}
            className="flex flex-col justify-between p-3 rounded-xl border border-gray-100 hover:border-orange-300 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer group relative overflow-hidden"
            style={{ backgroundColor: door.bgColor }}
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-[13px] font-black text-gray-900 group-hover:text-[#FF5000] transition-colors leading-tight">
                  {door.chineseTitle}
                </span>
                <span className="text-[11.5px] font-bold text-gray-700 mt-0.5">
                  {door.title}
                </span>
                <span className="text-[10px] text-gray-500 line-clamp-1 mt-0.5 font-medium">
                  {door.subTitle}
                </span>
              </div>

              <div className="w-8 h-8 rounded-lg bg-white/90 shadow-2xs flex items-center justify-center shrink-0 ml-1 group-hover:scale-110 transition-transform">
                {door.icon}
              </div>
            </div>

            <div className="mt-2.5 flex items-center justify-between">
              <span 
                className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-full text-white"
                style={{ backgroundColor: door.color }}
              >
                {door.badge}
              </span>
              <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#FF5000] transition-colors">
                Ver Lotes →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
