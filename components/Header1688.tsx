import React, { useState } from 'react';
import { Search, Camera, Sparkles, Building2, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Header1688Props {
  onSearch?: (query: string) => void;
  activeTab?: 'products' | 'factories';
}

export const Header1688: React.FC<Header1688Props> = ({ onSearch, activeTab: initialTab = 'products' }) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'products' | 'factories'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  const hotKeywords = [
    'Super Fábrica',
    'Painéis Solares',
    'Baterias Lítio',
    'Inversores Industriais',
    'Geradores'
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      navigate('/produtos');
    }
  };

  return (
    <header className="w-full bg-gradient-to-b from-[#FFF5EE] via-[#FFF9F5] to-white border-b border-orange-100/70 select-none">
      <div className="w-full max-w-[480px] mx-auto px-3.5 pt-3 pb-2.5 flex flex-col gap-2">
        {/* Top Brand Line */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/home')}>
            <div className="flex items-center">
              <span className="text-[26px] font-black italic tracking-tighter bg-gradient-to-r from-[#FF6A00] via-[#FF5000] to-[#FF2200] bg-clip-text text-transparent drop-shadow-xs">
                1888
              </span>
              <div className="ml-1.5 flex flex-col -space-y-0.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-[#FF5000] bg-orange-100 px-1 py-0.2 rounded-xs">
                  FÁBRICAS B2B
                </span>
                <span className="text-[8px] font-semibold text-gray-500">
                  源头好货 • 直供
                </span>
              </div>
            </div>
          </div>

          {/* Search Tabs */}
          <div className="flex items-center bg-orange-100/80 p-0.5 rounded-full text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setTab('products')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                tab === 'products'
                  ? 'bg-gradient-to-r from-[#FF6A00] to-[#FF5000] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Produtos
            </button>
            <button
              type="button"
              onClick={() => setTab('factories')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                tab === 'factories'
                  ? 'bg-gradient-to-r from-[#FF6A00] to-[#FF5000] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Fábricas
            </button>
          </div>
        </div>

        {/* 1888 Search Bar */}
        <form onSubmit={handleSearch} className="relative flex items-center">
          <div className="relative w-full flex items-center bg-white border-2 border-[#FF5000] rounded-full overflow-hidden shadow-xs hover:border-[#FF4000] transition-colors h-[40px]">
            <div className="pl-3.5 pr-1.5 text-[#FF5000]">
              <Search className="w-4 h-4 stroke-[2.4]" />
            </div>
            
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tab === 'products' ? 'Buscar produtos de atacado 1888...' : 'Buscar super fábricas de origem...'}
              className="w-full h-full bg-transparent text-[13px] text-gray-800 placeholder-gray-400 focus:outline-none pr-12 font-medium"
            />

            <button
              type="button"
              title="Busca por Imagem (1888)"
              onClick={() => navigate('/produtos')}
              className="absolute right-[82px] text-gray-400 hover:text-[#FF5000] transition-colors p-1"
            >
              <Camera className="w-4 h-4 stroke-[2]" />
            </button>

            <button
              type="submit"
              className="h-[34px] px-4 mr-[3px] rounded-full bg-gradient-to-r from-[#FF6A00] to-[#FF4400] hover:from-[#FF5500] hover:to-[#E03300] active:scale-98 text-white text-[12.5px] font-bold transition-all flex items-center justify-center cursor-pointer shadow-xs"
            >
              Buscar
            </button>
          </div>
        </form>

        {/* Hot Keywords Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5 pb-1">
          <div className="flex items-center gap-1 text-[10.5px] font-bold text-[#FF5000] shrink-0">
            <Flame className="w-3 h-3 fill-current" />
            <span>Em Alta:</span>
          </div>
          {hotKeywords.map((kw, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setSearchQuery(kw);
                if (onSearch) onSearch(kw);
                else navigate('/produtos');
              }}
              className="shrink-0 px-2 py-0.5 bg-white border border-orange-100 hover:border-orange-300 text-gray-600 hover:text-[#FF5000] text-[11px] rounded-full transition-all cursor-pointer shadow-2xs"
            >
              {kw}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
