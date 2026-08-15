import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from './components/ProductCard';
import { supabase } from '../../lib/supabase';
import { Search, User, ShoppingCart, Home, LayoutGrid } from 'lucide-react';
import { ProductsPageSkeleton } from '../../components/Skeleton';

export default function Products() {
  const navigate = useNavigate();
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
        console.error('Falhou ao carregar produtos', err);
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

      {/* ═══════════════════════════════════════════════════
          CABEÇALHO — Idêntico ao da imagem de referência
          < ≡ AliExpress [Search] [User]
      ════════════════════════════════════════════════════ */}
      <header className="w-full max-w-[480px] bg-white h-[52px] px-4 flex items-center justify-between sticky top-0 z-30 border-b border-gray-100">
        {/* Esquerda: seta de voltar + logo */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="text-[#1A1A1A] p-1 -ml-1 active:opacity-60 transition-opacity"
            aria-label="Voltar"
          >
            {/* Ícone "<" simples como na imagem */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Ícone de menu hambúrguer "≡" */}
          <button className="text-[#1A1A1A] p-1 active:opacity-60 transition-opacity">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Logo texto "CanadianSolar" (estilo AliExpress) */}
          <span className="text-[17px] font-extrabold text-[#FF2442] tracking-tight ml-0.5">
            CanadianSolar
          </span>
        </div>

        {/* Direita: Pesquisa + Conta */}
        <div className="flex items-center gap-1">
          <button className="p-2 text-[#1A1A1A] active:opacity-60 transition-opacity">
            <Search className="w-5 h-5 stroke-[1.8]" />
          </button>
          <button
            onClick={() => navigate('/perfil')}
            className="p-2 text-[#1A1A1A] active:opacity-60 transition-opacity"
          >
            <User className="w-5 h-5 stroke-[1.8]" />
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════
          CONTEÚDO PRINCIPAL
      ════════════════════════════════════════════════════ */}
      <main className="w-full max-w-[480px] px-3 pt-3 bg-white">

        {/* Título da secção — "More to love" / "Mais para você" */}
        <h2 className="text-[15px] font-bold text-[#1A1A1A] mb-2.5">
          More to love
        </h2>

        {/* Grid de 2 colunas com separador cinza entre cards */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-[1px] bg-[#E8E8E8]">
            {products.map((product, idx) => (
              <div key={product.id} className="bg-white">
                <ProductCard
                  product={product}
                  index={idx}
                  onBuy={(id) => navigate(`/produtos/${id}`)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <span className="text-5xl mb-4">📦</span>
            <p className="text-[15px] font-medium">Nenhum produto disponível</p>
          </div>
        )}

      </main>



      {/* ═══════════════════════════════════════════════════
          BARRA DE NAVEGAÇÃO INFERIOR — Início | Categoria | Carrinho | Minha Conta
          (exatamente como na imagem)
      ════════════════════════════════════════════════════ */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 flex justify-center">
        <div className="w-full max-w-[480px] flex items-center justify-around py-2.5 px-2">
          
          <button
            onClick={() => navigate('/inicio')}
            className="flex flex-col items-center gap-0.5 text-[#888888] active:opacity-60 transition-opacity min-w-[60px]"
          >
            <Home className="w-5 h-5 stroke-[1.5]" />
            <span className="text-[10px] font-normal">Início</span>
          </button>

          <button
            onClick={() => navigate('/produtos')}
            className="flex flex-col items-center gap-0.5 text-[#888888] active:opacity-60 transition-opacity min-w-[60px]"
          >
            <LayoutGrid className="w-5 h-5 stroke-[1.5]" />
            <span className="text-[10px] font-normal">Categoria</span>
          </button>

          <button
            onClick={() => navigate('/produtos')}
            className="flex flex-col items-center gap-0.5 text-[#FF2442] active:opacity-60 transition-opacity min-w-[60px]"
          >
            {/* Ícone Carrinho ativo (vermelho com indicador) */}
            <div className="relative">
              <ShoppingCart className="w-5 h-5 stroke-[1.5]" />
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#FF2442] rounded-full border border-white" />
            </div>
            <span className="text-[10px] font-bold">Carrinho</span>
          </button>

          <button
            onClick={() => navigate('/perfil')}
            className="flex flex-col items-center gap-0.5 text-[#888888] active:opacity-60 transition-opacity min-w-[60px]"
          >
            <User className="w-5 h-5 stroke-[1.5]" />
            <span className="text-[10px] font-normal">Minha Conta</span>
          </button>

        </div>
      </nav>

    </div>
  );
}
