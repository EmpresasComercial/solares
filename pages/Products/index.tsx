import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { ProductCard } from './components/ProductCard';
import { supabase } from '../../lib/supabase';
import { LayoutGrid, History, ChevronRight } from 'lucide-react';
import { ProductsPageSkeleton } from '../../components/Skeleton';


export default function Products() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
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
      } catch (err) {
        console.error('Falhou, recarregue a pagina', err);
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
    <div className="w-full bg-white min-h-screen pb-24">
      <header className="bg-white px-6 h-16 flex items-center border-b border-[#F1F5F9] sticky top-0 z-50">
        <div className="flex-1 flex items-center gap-3">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" 
            alt="MS" 
            className="h-4"
            referrerPolicy="no-referrer"
          />
          <span className="w-px h-3 bg-gray-200"></span>
          <h1 className="text-[14px] font-normal text-[#111827] tracking-tight">
            {t('products.title')}
          </h1>
        </div>
        
        <button 
          onClick={() => navigate('/minhas-compras')}
          className="w-10 h-10 flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] rounded-full transition-colors"
          title={t('profile.history')}
        >
          <History size={20} strokeWidth={1.5} />
        </button>
      </header>

      <div className="px-6 mt-4">

        <div className="grid grid-cols-1 gap-6">
          {products.map((product, idx) => (
            <ProductCard 
              key={product.id}
              product={product}
              index={idx}
              onBuy={(id) => navigate(`/produtos/${id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

