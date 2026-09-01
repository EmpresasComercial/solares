import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ChevronDown, Bell, ShoppingCart, MessageSquare, Headphones, Download, User } from 'lucide-react';

interface AliSearchBox1688Props {
  onSearch?: (term: string) => void;
}

export const AliSearchBox1688: React.FC<AliSearchBox1688Props> = ({ onSearch }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'products' | 'factories' | 'industrial'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Escolha bons itens');

  const dropdownCategories = [
    'Escolha bons itens', 'Encontrar fábricas', 'Produtos industriais',
    'Dropshipping direto', 'Cross-border export', 'Compra corporativa'
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(searchTerm);
    else navigate('/produtos');
  };

  const hotKeywords = [
    'Painéis Solares', 'Inversores 5kW', 'Bateria Lítio 48V',
    'Lote industrial', 'Super Fábrica Yiwu', 'LED Strip 5m', 'Gerador portátil'
  ];

  return (
    <div className="w-full bg-white border-b border-gray-200 select-none">
      
      {/* TOP MINI NAV BAR — idêntico ao 1688 AliBar */}
      <div className="w-full bg-[#f5f5f5] border-b border-gray-200 py-0">
        <div className="max-w-[1440px] mx-auto px-4 flex items-center justify-between h-[32px]">
          {/* Left: Site selector */}
          <div className="flex items-center gap-4 text-[12px] text-gray-600">
            <span
              className="font-bold text-[#FF5000] cursor-pointer hover:underline"
              onClick={() => navigate('/home')}
            >
              1888.com
            </span>
            <span className="text-gray-300">|</span>
            <span className="cursor-pointer hover:text-[#FF5000]">1888国际站</span>
            <span className="cursor-pointer hover:text-[#FF5000] hidden sm:inline">天猫</span>
            <span className="cursor-pointer hover:text-[#FF5000] hidden md:inline">淘宝</span>
          </div>

          {/* Right: Top Links */}
          <div className="flex items-center gap-4 text-[12px] text-gray-600">
            <button
              type="button"
              onClick={() => navigate('/perfil')}
              className="flex items-center gap-1 hover:text-[#FF5000] cursor-pointer transition-colors"
            >
              <User className="w-3 h-3" />
              <span>Minha Conta</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/meus-produtos')}
              className="flex items-center gap-1 hover:text-[#FF5000] cursor-pointer transition-colors hidden sm:flex"
            >
              <span>我的订单</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/convite')}
              className="flex items-center gap-1 hover:text-[#FF5000] cursor-pointer transition-colors hidden md:flex"
            >
              <span>合作伙伴</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1 hover:text-[#FF5000] cursor-pointer transition-colors hidden lg:flex"
            >
              <Download className="w-3 h-3" />
              <span>下载插件</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1 hover:text-[#FF5000] cursor-pointer transition-colors hidden lg:flex"
            >
              <Bell className="w-3 h-3" />
              <span>消息</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN SEARCH ROW — idêntico ao 1688 SearchBox */}
      <div className="max-w-[1440px] mx-auto px-4 py-3 flex items-center gap-4">

        {/* Logo 1888 — igual ao Alibaba 1688 */}
        <div
          onClick={() => navigate('/home')}
          className="shrink-0 cursor-pointer flex flex-col items-center leading-none mr-2"
        >
          <span className="text-[42px] font-black italic tracking-tighter text-[#FF5000] leading-none" style={{ fontFamily: 'Arial Black, sans-serif' }}>
            1888
          </span>
          <span className="text-[10px] text-gray-500 font-medium tracking-wider -mt-1">
            B2B 批发 · 直供
          </span>
        </div>

        {/* Mega Barra de Busca */}
        <div className="flex-1 flex flex-col gap-1">

          {/* Abas de Busca */}
          <div className="flex items-center gap-5 pl-1 mb-1">
            {[
              { key: 'products', cn: '挑好货', pt: 'Comprar Lotes' },
              { key: 'factories', cn: '找工厂', pt: 'Super Fábricas' },
              { key: 'industrial', cn: '工业品', pt: 'Industrial B2B' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`relative text-[14px] font-bold pb-1 cursor-pointer transition-colors ${
                  activeTab === tab.key ? 'text-[#FF5000]' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.cn}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF5000] rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Search Input Row */}
          <form onSubmit={handleSearchSubmit} className="flex items-stretch h-[40px] border-2 border-[#FF5000] rounded-none overflow-hidden">
            {/* Category Dropdown */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="h-full flex items-center gap-1 px-3 bg-[#f5f5f5] border-r border-gray-300 text-[12px] text-gray-700 font-medium hover:bg-gray-100 cursor-pointer whitespace-nowrap"
              >
                <span className="max-w-[110px] truncate">{selectedCategory}</span>
                <ChevronDown className="w-3 h-3 shrink-0" />
              </button>
              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-0 bg-white border border-gray-200 shadow-lg z-50 w-[180px]">
                  {dropdownCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => { setSelectedCategory(cat); setDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 text-[12px] text-gray-700 hover:bg-orange-50 hover:text-[#FF5000] cursor-pointer"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Text Input */}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Central de Ajuda · 找货源·找工厂·找服务"
              className="flex-1 px-3 text-[13px] text-gray-800 placeholder:text-gray-400 outline-none bg-white"
            />

            {/* Busca Visual Button */}
            <button
              type="button"
              onClick={() => navigate('/produtos')}
              className="flex items-center gap-1.5 px-3 text-[12px] font-medium bg-[#FFF2E8] text-[#FF5000] border-l border-orange-200 hover:bg-[#FFE8D6] cursor-pointer transition-colors shrink-0"
              title="以图搜款 - Busca Visual"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline whitespace-nowrap">Busca visual</span>
            </button>

            {/* Orange Search Button */}
            <button
              type="submit"
              className="bg-[#FF5000] hover:bg-[#E04400] text-white font-bold text-[15px] px-6 cursor-pointer transition-colors shrink-0"
            >
              Buscar
            </button>
          </form>

          {/* Hot Keywords Row */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar mt-0.5">
            {hotKeywords.map((kw, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { setSearchTerm(kw); navigate('/produtos'); }}
                className={`text-[11.5px] whitespace-nowrap cursor-pointer transition-colors ${
                  i === 0 ? 'text-[#FF5000] font-bold' : 'text-gray-500 hover:text-[#FF5000]'
                }`}
              >
                {i === 0 && <span className="mr-0.5">🔥</span>}{kw}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Quick Action Icons (1688 style) */}
        <div className="hidden lg:flex items-center gap-5 shrink-0 ml-4">
          <button
            type="button"
            onClick={() => navigate('/meus-produtos')}
            className="flex flex-col items-center gap-0.5 cursor-pointer hover:text-[#FF5000] text-gray-600 transition-colors"
          >
            <span className="text-[18px]">📋</span>
            <span className="text-[11px] whitespace-nowrap">我的订单</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/produtos')}
            className="flex flex-col items-center gap-0.5 cursor-pointer hover:text-[#FF5000] text-gray-600 transition-colors"
          >
            <span className="text-[18px]">🛒</span>
            <span className="text-[11px]">采购车</span>
          </button>
          <button
            type="button"
            className="flex flex-col items-center gap-0.5 cursor-pointer hover:text-[#FF5000] text-gray-600 transition-colors"
          >
            <span className="text-[18px]">💬</span>
            <span className="text-[11px]">消息</span>
          </button>
          <button
            type="button"
            className="flex flex-col items-center gap-0.5 cursor-pointer hover:text-[#FF5000] text-gray-600 transition-colors"
          >
            <Headphones className="w-5 h-5" />
            <span className="text-[11px]">官方服务</span>
          </button>
        </div>

      </div>
    </div>
  );
};
