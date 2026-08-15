import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from './components/ProductCard';
import { supabase } from '../../lib/supabase';
import { ProductsPageSkeleton } from '../../components/Skeleton';

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) {
    return <ProductsPageSkeleton />;
  }

  return (
    <div className="w-full min-h-screen bg-white pb-20 font-sans antialiased text-[#1A1A1A] select-none flex flex-col items-center">
      <header className="w-full max-w-[480px] bg-white h-[52px] px-4 flex items-center justify-between sticky top-0 z-30 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button className="text-[#1A1A1A] p-1 active:opacity-60 transition-opacity" aria-label="Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <span className="text-[17px] font-extrabold text-[#FF2442] tracking-tight ml-0.5">
            AliExpress24
          </span>
        </div>
      </header>

      <main className="w-full max-w-[480px] px-3 pt-3 bg-white">
        <h2 className="text-[15px] font-bold text-[#1A1A1A] mb-2.5">
          More to love
        </h2>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {products.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                index={idx}
                onBuy={(id) => navigate(`/produtos/${id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <span className="text-5xl mb-4">📦</span>
            <p className="text-[15px] font-medium">Nenhum produto disponível</p>
          </div>
        )}
      </main>
    </div>
  );
}
