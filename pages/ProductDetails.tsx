import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';
import { SmartImage } from '../components/SmartImage';
import { formatCurrency } from '../lib/currency';
import { 
  ChevronLeft, 
  Search, 
  User, 
  ShoppingCart, 
  X, 
  Loader2,
  Flame
} from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [isBuying, setIsBuying] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedSpec, setSelectedSpec] = useState(0);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data, error } = await supabase.rpc('get_product_details_mcpn', {
          p_id: id as string
        });
        if (error) throw error;
        if (data && data.length > 0) {
          setProduct(data[0]);
        }
      } catch (err) {
        console.error('Falhou ao carregar produto', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const handleBuy = async () => {
    setIsBuying(true);
    try {
      const { data, error } = await supabase.rpc('buy_product_mcpn', {
        p_product_id: id as string
      });

      if (error) throw error;

      const result = data as { success: boolean; message: string };

      if (result && result.success) {
        showToast(result.message, 'success');
        navigate('/minhas-compras');
      } else {
        showToast(result?.message || 'Falhou, tente novamente', 'error');
      }
    } catch (error: any) {
      showToast(error.message || 'Falha ao processar compra', 'error');
    } finally {
      setIsBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F2F2F2]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF2442]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#F2F2F2]">
        <div className="bg-white border border-gray-200 p-8 rounded-[12px] text-center max-w-sm w-full shadow-sm">
          <h2 className="text-[17px] font-bold mb-4 text-[#1A1A1A]">{t('products.not_found') || 'Produto não encontrado'}</h2>
          <button 
            onClick={() => navigate('/produtos')} 
            className="w-full h-[44px] rounded-full bg-[#FF2442] text-white font-bold text-[14px]"
          >
            {t('products.back_to_list') || 'Voltar para a lista'}
          </button>
        </div>
      </div>
    );
  }

  const priceValue = Number(product.preco);
  const formattedPrice = formatCurrency(priceValue, 'KZ');
  const originalPrice = formatCurrency(priceValue * 1.41, 'KZ');
  const discountAmount = formatCurrency(priceValue * 0.41, 'KZ');
  const formattedDaily = formatCurrency(Number(product.renda_diaria), 'KZ');

  const variants = [
    { name: product.nome, img: product.imagem_url, hot: true },
    { name: `${product.nome} Pro`, img: product.imagem_url, hot: true },
    { name: `${product.nome} Plus`, img: product.imagem_url, hot: false },
    { name: `${product.nome} Max`, img: product.imagem_url, hot: true },
    { name: `${product.nome} Ultra`, img: product.imagem_url, hot: false },
    { name: `${product.nome} Silver`, img: product.imagem_url, hot: false },
    { name: `${product.nome} Gold`, img: product.imagem_url, hot: false },
    { name: `${product.nome} Titanium`, img: product.imagem_url, hot: false },
    { name: `${product.nome} Solar Eco`, img: product.imagem_url, hot: false },
    { name: `${product.nome} Master`, img: product.imagem_url, hot: false },
  ];

  const specs = [
    `Ciclo ${product.duracao_dias || 30} Dias`,
    `Renda ${formattedDaily}/dia`,
    `Garantia AliExpress24`,
    `Ativação Imediata`
  ];

  return (
    <div className="w-full min-h-screen bg-white pb-24 font-sans antialiased text-[#1A1A1A] select-none flex flex-col items-center">
      
      {/* ═══════════════════════════════════════════════════
          1. CABEÇALHO (Estilo AliExpress / AliExpress24)
      ════════════════════════════════════════════════════ */}
      <header className="w-full max-w-[480px] bg-white h-[50px] px-3.5 flex items-center justify-between sticky top-0 z-30 border-b border-gray-100">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigate(-1)}
            className="text-[#1A1A1A] p-1 active:opacity-60 transition-opacity"
            aria-label="Voltar"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
          </button>

          <button className="text-[#1A1A1A] p-1 active:opacity-60 transition-opacity">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <span className="text-[17px] font-extrabold text-[#1A1A1A] tracking-tight ml-0.5">
            AliExpress24
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-1.5 text-[#1A1A1A] active:opacity-60 transition-opacity">
            <Search className="w-5 h-5 stroke-[1.8]" />
          </button>
          <button
            onClick={() => navigate('/perfil')}
            className="p-1.5 text-[#1A1A1A] active:opacity-60 transition-opacity"
          >
            <User className="w-5 h-5 stroke-[1.8]" />
          </button>
          <button
            onClick={() => navigate('/produtos')}
            className="p-1.5 text-[#1A1A1A] active:opacity-60 transition-opacity"
          >
            <ShoppingCart className="w-5 h-5 stroke-[1.8]" />
          </button>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════
          2. CONTEÚDO PRINCIPAL DO PRODUTO (Modal / View 1:1)
      ════════════════════════════════════════════════════ */}
      <main className="w-full max-w-[480px] bg-white flex flex-col relative px-4 pt-2">
        
        {/* Botão Fechar X no canto superior direito */}
        <button
          onClick={() => navigate('/produtos')}
          className="absolute top-2 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-full active:bg-gray-100 z-20"
        >
          <X className="w-5 h-5 stroke-[2]" />
        </button>

        {/* Imagem Principal do Produto com Badge 1/1 */}
        <div className="w-full aspect-[4/3.8] bg-[#F8FAFC] rounded-[12px] relative overflow-hidden flex items-center justify-center p-4 my-2 border border-gray-100/60">
          {product.imagem_url ? (
            <SmartImage 
              src={product.imagem_url} 
              alt={product.nome} 
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl">
              <span className="text-6xl">☀️</span>
            </div>
          )}

          {/* Badge 1/1 no canto inferior direito */}
          <div className="absolute bottom-2.5 right-2.5 bg-black/60 text-white text-[11px] font-medium px-2 py-0.5 rounded-full">
            1/1
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            3. BANNER DE OFERTA ("Oferta 1ª compra")
        ════════════════════════════════════════════════════ */}
        <div className="border border-[#FFD0D6] bg-gradient-to-r from-[#FFF5F6] via-[#FFF8F8] to-[#FFF0F2] rounded-[8px] p-3 mb-4 relative overflow-hidden">
          
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-[#E50027] tracking-tight">
              Oferta 1ª compra
            </h3>
            {/* Ícone de Seta sutil decorativa */}
            <svg className="w-6 h-6 text-[#FFB6C1] opacity-60" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
            </svg>
          </div>

          <div className="mt-1 flex items-baseline justify-between flex-wrap gap-1">
            <div className="text-[26px] font-black text-[#1A1A1A] tracking-tight leading-none">
              {formattedPrice}
            </div>

            <div className="flex items-center gap-1 text-[#E50027] text-[11.5px] font-bold bg-[#FFE8EB] px-2 py-0.5 rounded">
              <span>🏷️</span>
              <span>Novo usuário - {discountAmount}</span>
            </div>
          </div>

          <div className="mt-1.5 text-[11px] text-gray-400">
            <span className="line-through mr-1.5">{originalPrice}</span>
            <span>| Preço sem impostos</span>
          </div>

        </div>

        {/* ═══════════════════════════════════════════════════
            4. SELEÇÃO DE MODELO / COR (Grid de Miniaturas)
        ════════════════════════════════════════════════════ */}
        <div className="mb-4 space-y-2">
          <div className="text-[13px] font-normal text-[#1A1A1A]">
            <span className="text-gray-500">cor : </span>
            <span className="font-bold">{variants[selectedVariant]?.name}</span>
          </div>

          {/* Grid de miniaturas em 5 colunas */}
          <div className="grid grid-cols-5 gap-2">
            {variants.slice(0, 10).map((v, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedVariant(idx)}
                className={`relative aspect-square rounded-[6px] p-1 bg-[#F9FAFB] flex items-center justify-center transition-all ${
                  selectedVariant === idx 
                    ? "border-2 border-[#FF2442] shadow-xs" 
                    : "border border-gray-200 hover:border-gray-300"
                }`}
              >
                {v.img ? (
                  <SmartImage 
                    src={v.img} 
                    alt={v.name} 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-base">☀️</span>
                )}

                {/* Badge Flame nos populares */}
                {v.hot && (
                  <span className="absolute -top-1.5 -right-1 text-[11px]">
                    🔥
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            5. SELEÇÃO DE ESPECIFICAÇÃO / CICLO (Pills)
        ════════════════════════════════════════════════════ */}
        <div className="mb-6 space-y-2">
          <div className="text-[13px] font-normal text-[#1A1A1A]">
            <span className="text-gray-500">Material : </span>
            <span className="font-bold">{specs[selectedSpec]}</span>
          </div>

          {/* Botões de Pílula */}
          <div className="flex flex-wrap gap-2">
            {specs.map((spec, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedSpec(idx)}
                className={`h-[36px] px-3.5 rounded-[8px] text-[12.5px] transition-all cursor-pointer ${
                  selectedSpec === idx
                    ? "border-2 border-[#1A1A1A] font-bold text-[#1A1A1A] bg-white shadow-2xs"
                    : "border border-gray-200 text-[#555555] bg-white hover:border-gray-300"
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

      </main>

      {/* ═══════════════════════════════════════════════════
          6. BARRA INFERIOR FIXA COM BOTÃO "Comprar" (#FF2442)
      ════════════════════════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 z-50 flex justify-center shadow-[0_-2px_12px_rgba(0,0,0,0.05)]">
        <div className="w-full max-w-[480px]">
          <button 
            onClick={handleBuy}
            disabled={isBuying}
            className="w-full h-[48px] rounded-full bg-[#FF2442] hover:bg-[#E02038] active:scale-[0.99] text-white font-bold text-[16px] transition-all disabled:opacity-50 shadow-sm flex items-center justify-center cursor-pointer"
          >
            {isBuying ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Processando...</span>
              </div>
            ) : (
              "Comprar"
            )}
          </button>
        </div>
      </div>

    </div>
  );
}

