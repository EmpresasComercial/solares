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
          <span className="text-[17px] font-extrabold text-[#FF2442] tracking-tight">
            AliExpress24
          </span>
        </div>
      </header>

      <main className="w-full max-w-[480px] px-3 pt-3 bg-white">
        {products.length > 0 ? (
          <div className="flex flex-col gap-3">
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
