import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from './components/ProductCard';
import { supabase } from '../../lib/supabase';
import { ProductsPageSkeleton } from '../../components/Skeleton';
import { Header1688 } from '../../components/Header1688';
import { Building2, Sparkles, Flame, ShieldCheck, Filter } from 'lucide-react';

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'factory' | 'popular' | 'fast'>('all');
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase.rpc('get_available_products_mcpn');
        if (error) throw error;

        const mappedProducts = (data || []).map((p: any) => ({
          ...p,
          priceValue: parseFloat(p.preco),
          durationDays: p.duracao_dias,
        }));

        setProducts(mappedProducts);
        setFilteredProducts(mappedProducts);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleFilterChange = (filter: 'all' | 'factory' | 'popular' | 'fast') => {
    setActiveFilter(filter);
    if (filter === 'all') {
      setFilteredProducts(products);
    } else if (filter === 'factory') {
      setFilteredProducts([...products].sort((a, b) => b.priceValue - a.priceValue));
    } else if (filter === 'popular') {
      setFilteredProducts([...products].sort((a, b) => Number(b.renda_diaria) - Number(a.renda_diaria)));
    } else if (filter === 'fast') {
      setFilteredProducts([...products].sort((a, b) => a.durationDays - b.durationDays));
    }
  };

  const handleSearch = (query: string) => {
    setSearchFilter(query);
    if (!query) {
      setFilteredProducts(products);
      return;
    }
    const filtered = products.filter(p => 
      p.nome.toLowerCase().includes(query.toLowerCase()) || 
      (p.descricao && p.descricao.toLowerCase().includes(query.toLowerCase()))
    );
    setFilteredProducts(filtered);
  };

  if (loading) {
    return <ProductsPageSkeleton />;
  }

  return (
    <div className="w-full min-h-screen bg-[#F5F6F8] pb-24 font-sans antialiased text-[#1A1A1A] select-none flex flex-col items-center">
      {/* 1688 Header com Busca */}
      <Header1688 onSearch={handleSearch} activeTab="factories" />

      {/* Abas de Filtros no Estilo 1688 */}
      <div className="w-full max-w-[480px] bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => handleFilterChange('all')}
            className={`px-3 py-1.5 rounded-none text-[12px] font-bold transition-all shrink-0 cursor-pointer border ${
              activeFilter === 'all'
                ? 'bg-[#FF5000] text-white border-[#FF5000]'
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
            }`}
          >
            Todos os Lotes
          </button>

          <button
            type="button"
            onClick={() => handleFilterChange('factory')}
            className={`px-3 py-1.5 rounded-none text-[12px] font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 border ${
              activeFilter === 'factory'
                ? 'bg-[#FF5000] text-white border-[#FF5000]'
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
            }`}
          >
            <Building2 className="w-3 h-3" />
            Super Fábricas
          </button>

          <button
            type="button"
            onClick={() => handleFilterChange('popular')}
            className={`px-3 py-1.5 rounded-none text-[12px] font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 border ${
              activeFilter === 'popular'
                ? 'bg-[#FF5000] text-white border-[#FF5000]'
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
            }`}
          >
            <Flame className="w-3 h-3" />
            Mais Rentáveis
          </button>

          <button
            type="button"
            onClick={() => handleFilterChange('fast')}
            className={`px-3 py-1.5 rounded-none text-[12px] font-bold transition-all shrink-0 cursor-pointer border ${
              activeFilter === 'fast'
                ? 'bg-[#FF5000] text-white border-[#FF5000]'
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
            }`}
          >
            Ciclo Curto
          </button>
        </div>
      </div>

      {/* Banner Informativo de Atacado Direto */}
      <div className="w-full max-w-[480px] px-3 pt-3">
        <div className="bg-[#FFF4EB] border border-orange-200 rounded-none p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#FF5000]" />
            <div>
              <span className="text-[12px] font-bold text-gray-900 block">
                Garantia de Origem 1888
              </span>
              <span className="text-[10.5px] text-gray-600">
                Produtos auditados • Rendimentos creditados diariamente
              </span>
            </div>
          </div>
          <span className="text-[11px] font-bold text-[#FF5000] bg-white border border-orange-200 px-2 py-1 rounded-none">
            {filteredProducts.length} Lotes
          </span>
        </div>
      </div>

      {/* Lista de Produtos 1688 */}
      <main className="w-full max-w-[480px] px-3 pt-3">
        {filteredProducts.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filteredProducts.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                index={idx}
                onBuy={(id) => navigate(`/produtos/${id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-none p-6 mt-2 border border-gray-200">
            <span className="text-5xl mb-3">🏭</span>
            <p className="text-[15px] font-bold text-gray-700">Nenhum lote de fábrica encontrado</p>
            <p className="text-[12px] text-gray-400 mt-1">Tente buscar por outro termo ou categoria</p>
          </div>
        )}
      </main>
    </div>
  );
}
