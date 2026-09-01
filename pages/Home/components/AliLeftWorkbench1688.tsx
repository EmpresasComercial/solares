import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Building2, 
  Globe, 
  Cpu, 
  User, 
  ChevronRight,
  Sparkles,
  Zap,
  Bot
} from 'lucide-react';

interface MenuItem {
  id: string;
  chineseTitle: string;
  title: string;
  icon: React.ReactNode;
  route: string;
  badge?: string;
  children?: { label: string; route: string }[];
}

export const AliLeftWorkbench1688: React.FC = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState<string>('home');
  const [hoveredItem, setHoveredItem] = useState<MenuItem | null>(null);

  const menuItems: MenuItem[] = [
    {
      id: 'home',
      chineseTitle: '首页',
      title: 'Início',
      icon: <Home className="w-5 h-5" />,
      route: '/home'
    },
    {
      id: 'orders',
      chineseTitle: '订单管理',
      title: 'Pedidos',
      icon: <Package className="w-5 h-5" />,
      route: '/meus-produtos',
      children: [
        { label: 'Todos os Pedidos', route: '/meus-produtos' },
        { label: 'Aguardando Pagamento', route: '/meus-produtos' },
        { label: 'Em Produção', route: '/meus-produtos' },
        { label: 'Rendimentos Creditados', route: '/historico-compras' }
      ]
    },
    {
      id: 'sourcing',
      chineseTitle: '商品采购',
      title: 'Atacado',
      icon: <ShoppingCart className="w-5 h-5" />,
      route: '/produtos',
      badge: 'Lotes',
      children: [
        { label: 'Catálogo de Fábrica', route: '/produtos' },
        { label: 'Super Fábricas Ouro', route: '/produtos' },
        { label: 'Lotes de Alta Renda', route: '/produtos' },
        { label: 'Histórico de Compras', route: '/historico-compras' }
      ]
    },
    {
      id: 'suppliers',
      chineseTitle: '供应商',
      title: 'Fábricas',
      icon: <Building2 className="w-5 h-5" />,
      route: '/produtos',
      children: [
        { label: 'Fábricas Certificadas', route: '/produtos' },
        { label: 'Origem Shenzhen & Yiwu', route: '/produtos' },
        { label: 'Contratos e Garantias', route: '/sobre-aliexpress24' }
      ]
    },
    {
      id: 'crossborder',
      chineseTitle: '跨境服务',
      title: 'Cross-Border',
      icon: <Globe className="w-5 h-5" />,
      route: '/produtos',
      children: [
        { label: 'Logística Internacional', route: '/produtos' },
        { label: 'Faturamento em KZ / USDT', route: '/recarregar' },
        { label: 'Desembaraço 48h', route: '/produtos' }
      ]
    },
    {
      id: 'ai_distribution',
      chineseTitle: '分销AI',
      title: 'IA B2B',
      icon: <Bot className="w-5 h-5" />,
      route: '/convite',
      badge: 'AI',
      children: [
        { label: 'Comissão Multinível', route: '/convite' },
        { label: 'Painel de Afiliados', route: '/convite' },
        { label: 'Material de Divulgação', route: '/convite' }
      ]
    },
    {
      id: 'my_ali',
      chineseTitle: '我的阿里',
      title: 'Minha Conta',
      icon: <User className="w-5 h-5" />,
      route: '/perfil',
      children: [
        { label: 'Painel VIP', route: '/perfil' },
        { label: 'Recarregar Saldo', route: '/recarregar' },
        { label: 'Solicitar Retirada', route: '/retirada' },
        { label: 'Central de Ajuda', route: '/faq' }
      ]
    }
  ];

  return (
    <aside 
      className="hidden xl:flex fixed left-0 top-0 bottom-0 w-[72px] bg-white border-r border-gray-200 z-40 flex-col items-center py-3 select-none font-sans shadow-xs"
      onMouseLeave={() => setHoveredItem(null)}
    >
      {/* Brand Logo 1888 */}
      <div 
        onClick={() => navigate('/home')}
        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6A00] to-[#FF2500] flex flex-col items-center justify-center text-white cursor-pointer shadow-xs mb-4 group hover:scale-105 transition-transform"
      >
        <span className="text-[15px] font-black italic tracking-tighter leading-none">1888</span>
        <span className="text-[8px] font-bold tracking-widest uppercase opacity-90">B2B</span>
      </div>

      {/* Navigation Icons */}
      <div className="flex-1 w-full flex flex-col items-center gap-1">
        {menuItems.map((item) => {
          const isActive = activeItem === item.id;

          return (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredItem(item)}
              onClick={() => {
                setActiveItem(item.id);
                navigate(item.route);
              }}
              className={`relative w-[60px] h-[54px] rounded-xl flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all ${
                isActive 
                  ? 'bg-orange-50 text-[#FF5000] font-bold' 
                  : 'text-gray-500 hover:text-[#FF5000] hover:bg-gray-50'
              }`}
            >
              {/* Badge */}
              {item.badge && (
                <span className="absolute top-1 right-1 bg-[#FF5000] text-white text-[8px] font-black px-1 py-0.2 rounded-full leading-none scale-90">
                  {item.badge}
                </span>
              )}

              <div className="w-5 h-5 flex items-center justify-center">
                {item.icon}
              </div>
              <span className="text-[10px] tracking-tight leading-none text-center">
                {item.chineseTitle}
              </span>
            </div>
          );
        })}
      </div>

      {/* Flyout Submenu Drawer on Hover */}
      {hoveredItem && hoveredItem.children && (
        <div 
          className="absolute left-[72px] top-16 w-[200px] bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50 animate-in fade-in zoom-in-95 duration-150"
          onMouseEnter={() => setHoveredItem(hoveredItem)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-2">
            <span className="text-[13px] font-extrabold text-gray-900">
              {hoveredItem.chineseTitle} • {hoveredItem.title}
            </span>
          </div>

          <div className="space-y-1">
            {hoveredItem.children.map((sub, sIdx) => (
              <button
                key={sIdx}
                type="button"
                onClick={() => {
                  setHoveredItem(null);
                  navigate(sub.route);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-gray-700 hover:text-[#FF5000] hover:bg-orange-50 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <span>{sub.label}</span>
                <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-[#FF5000] transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Service Help Icon */}
      <div 
        onClick={() => navigate('/sobre-aliexpress24')}
        className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-orange-50 text-gray-400 hover:text-[#FF5000] flex items-center justify-center cursor-pointer transition-colors"
        title="Ajuda e Certificações 1888"
      >
        <Sparkles className="w-4 h-4" />
      </div>
    </aside>
  );
};
