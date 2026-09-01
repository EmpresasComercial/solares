import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Flame, 
  Tag, 
  Truck, 
  Award, 
  UserPlus, 
  PlusCircle, 
  Wallet,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const CategoryGrid1688: React.FC = () => {
  const navigate = useNavigate();

  const gridItems = [
    {
      title: 'Super Fábrica',
      chinese: '超级工厂',
      icon: Building2,
      color: 'from-amber-500 to-orange-500',
      badge: 'TOP 1',
      badgeColor: 'bg-red-500 text-white',
      onClick: () => navigate('/produtos')
    },
    {
      title: 'Novidades',
      chinese: '新品趋势',
      icon: Sparkles,
      color: 'from-orange-500 to-red-500',
      badge: 'NOVO',
      badgeColor: 'bg-orange-500 text-white',
      onClick: () => navigate('/produtos')
    },
    {
      title: 'Desconto Lote',
      chinese: '量大优惠',
      icon: Tag,
      color: 'from-rose-500 to-pink-600',
      badge: '-40%',
      badgeColor: 'bg-rose-600 text-white',
      onClick: () => navigate('/produtos')
    },
    {
      title: 'Envio 48h',
      chinese: '极速发货',
      icon: Truck,
      color: 'from-blue-500 to-cyan-600',
      badge: 'Rápido',
      badgeColor: 'bg-blue-600 text-white',
      onClick: () => navigate('/produtos')
    },
    {
      title: 'Fornecedor Ouro',
      chinese: '金牌认证',
      icon: Award,
      color: 'from-amber-400 to-yellow-600',
      badge: 'VIP',
      badgeColor: 'bg-amber-600 text-white',
      onClick: () => navigate('/produtos')
    },
    {
      title: 'Convidar Amigo',
      chinese: '邀请奖励',
      icon: UserPlus,
      color: 'from-emerald-500 to-green-600',
      badge: 'Bônus',
      badgeColor: 'bg-emerald-600 text-white',
      onClick: () => navigate('/convite')
    },
    {
      title: 'Recarregar',
      chinese: '在线充值',
      icon: PlusCircle,
      color: 'from-orange-500 to-amber-500',
      badge: 'PIX/IBAN',
      badgeColor: 'bg-orange-600 text-white',
      onClick: () => navigate('/recarregar')
    },
    {
      title: 'Retirar Lucro',
      chinese: '快速提现',
      icon: Wallet,
      color: 'from-violet-500 to-purple-600',
      badge: 'Instant',
      badgeColor: 'bg-violet-600 text-white',
      onClick: () => navigate('/retirada')
    }
  ];

  return (
    <div className="w-full bg-white px-3 py-3 select-none">
      <div className="grid grid-cols-4 gap-y-3 gap-x-2">
        {gridItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={item.onClick}
              className="flex flex-col items-center gap-1 group active:scale-95 transition-transform cursor-pointer relative"
            >
              <div className="relative">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-xs group-hover:shadow-md transition-shadow`}>
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                {item.badge && (
                  <span className={`absolute -top-1.5 -right-1.5 px-1 py-0.2 rounded-full text-[8.5px] font-bold ${item.badgeColor} shadow-xs scale-90`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11.5px] font-medium text-gray-800 tracking-tight leading-tight mt-0.5 group-hover:text-[#FF5000] transition-colors">
                {item.title}
              </span>
              <span className="text-[9px] font-normal text-gray-400 -mt-1 scale-90">
                {item.chinese}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
