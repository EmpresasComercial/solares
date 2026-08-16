import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';
import { SmartImage } from '../components/SmartImage';
import { formatCurrency } from '../lib/currency';
import { ChevronLeft, Loader2 } from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [isBuying, setIsBuying] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQty, setSelectedQty] = useState(1);

  useEffect(() => {
    async function fetchProduct() {
      try {
        if (id) {
          const { data, error } = await supabase.rpc('get_product_details_mcpn', {
            p_id: id as string
          });
          if (!error && data && data.length > 0) {
            setProduct(data[0]);
            setLoading(false);
            return;
          }
        }

        const { data: allProds, error: allErr } = await supabase.rpc('get_available_products_mcpn');
        if (!allErr && allProds && allProds.length > 0) {
          const found = allProds.find((p: any) => String(p.id) === String(id));
          if (found) {
            setProduct(found);
            setLoading(false);
            return;
          }
          setProduct(allProds[0]);
          setLoading(false);
          return;
        }

        setProduct({
          id: id || '1',
          nome: 'AliExpress24 VIP Package',
          descricao: 'Produto Oficial AliExpress24 com alto rendimento diário e garantia estendida.',
          preco: 10000,
          renda_diaria: 500,
          duracao_dias: 365,
          imagem_url: '/gettyimages-2286930500-612x612.jpg',
          size: 'Standard'
        });
      } catch {
        setProduct({
          id: id || '1',
          nome: 'AliExpress24 VIP Package',
          descricao: 'Produto Oficial AliExpress24 com alto rendimento diário e garantia estendida.',
          preco: 10000,
          renda_diaria: 500,
          duracao_dias: 365,
          imagem_url: '/gettyimages-2286930500-612x612.jpg',
          size: 'Standard'
        });
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
        const rawMsg = result?.message || 'Falhou, tente novamente';
        const msg = /saldo\s+insuficiente/i.test(rawMsg)
          ? 'Saldo insuficiente, por favor recarregue primeiro'
          : rawMsg;
        showToast(msg, 'error');
      }
    } catch (error: any) {
      const rawMsg = error.message || 'Falha ao processar compra';
      const msg = /saldo\s+insuficiente/i.test(rawMsg)
        ? 'Saldo insuficiente, por favor recarregue primeiro'
        : rawMsg;
      showToast(msg, 'error');
    } finally {
      setIsBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F2F2F2]">
        <div className="animate-spin rounded-none h-8 w-8 border-b-2 border-[#FE384F]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#F2F2F2]">
        <div className="bg-white border border-gray-200 p-8 text-center max-w-sm w-full">
          <h2 className="text-[15px] font-medium mb-4 text-[#1A1A1A]">{t('products.not_found') || 'Produto não encontrado'}</h2>
          <button
            onClick={() => navigate('/produtos')}
            className="w-full h-[44px] bg-[#FE384F] text-white font-normal text-[13.5px]"
          >
            {t('products.back_to_list') || 'Voltar para a lista'}
          </button>
        </div>
      </div>
    );
  }

  const priceUnit = Number(product.preco);
  const isFree = priceUnit <= 0;
  const dailyUnit = Number(product.renda_diaria);
  const ciclo = Number(product.duracao_dias) || 30;

  const totalPrice = priceUnit * selectedQty;
  const totalDaily = dailyUnit * selectedQty;
  const totalProfit = totalDaily * ciclo;

  const formattedPrice = formatCurrency(totalPrice, 'KZ');
  const formattedUnitPrice = formatCurrency(priceUnit, 'KZ');
  const originalPrice = formatCurrency(totalPrice * 1.41, 'KZ');
  const discountAmount = formatCurrency(priceUnit * 0.41, 'KZ');
  const formattedDaily = formatCurrency(totalDaily, 'KZ');
  const formattedTotalProfit = formatCurrency(totalProfit, 'KZ');

  return (
    <div className="w-full min-h-screen bg-white pb-24 font-sans antialiased text-[#1A1A1A] select-none flex flex-col items-center">


      <main className="w-full max-w-[480px] bg-white flex flex-col relative">
        <div className="w-full aspect-[4/2.2] bg-[#F8FAFC] relative overflow-hidden flex items-center justify-center border-b border-gray-100/60">

          {/* Botão voltar + título sobreposto */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center px-2 pt-2 gap-1.5">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm text-white active:opacity-60 transition-opacity flex-shrink-0"
              aria-label="Voltar"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <span className="text-[15px] font-extrabold text-[#FE384F] tracking-tight" style={{textShadow:'0 1px 6px rgba(0,0,0,0.5)'}}>
              AliExpress24
            </span>
          </div>
          {product.imagem_url ? (
            <SmartImage 
              src={product.imagem_url} 
              alt={product.nome} 
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
              <span className="text-6xl">☀️</span>
            </div>
          )}

          <div className="absolute bottom-2.5 right-2.5 bg-black/60 text-white text-[11px] font-medium px-2 py-0.5 rounded-full">
            1/1
          </div>
        </div>

        {/* Preço card */}
        <div className="border-b border-[#FFD0D6] bg-gradient-to-r from-[#FFF5F6] via-[#FFF8F8] to-[#FFF0F2] px-4 py-3 mb-2">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-[13.5px] font-medium text-[#E50027] tracking-tight">
              Preço Unitário
            </h3>
            <div className="flex items-center gap-1 text-[#E50027] text-[11px] font-medium bg-[#FFE8EB] px-2 py-0.5">
              <span>🏷️</span>
              <span>Desconto especial incluído</span>
            </div>
          </div>

          <div className="flex items-baseline gap-2 flex-wrap">
            <div className="text-[22px] font-bold text-[#1A1A1A] tracking-tight leading-none">
              {formattedPrice}
            </div>
            <span className="text-[11px] text-gray-400 line-through">{originalPrice}</span>
          </div>

          <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-500">
            <span className="text-gray-400">Por unidade:</span>
            <span className="font-medium text-[#1A1A1A]">{formattedUnitPrice}</span>
            {selectedQty > 1 && (
              <span className="text-[#E50027] font-medium">× {selectedQty}</span>
            )}
          </div>
        </div>

        {/* Seletor de quantidade */}
        <div className="mb-3 px-4 pt-3 space-y-2">
          <div className="text-[13px] font-normal text-[#1A1A1A] flex items-center gap-1">
            <span className="text-gray-500">Quantidade :</span>
            <span className="font-semibold text-[#FE384F]">{selectedQty}×</span>
            <span className="text-gray-400 text-[11px]">({selectedQty === 1 ? '1 ativação' : `${selectedQty} ativações`})</span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {[1,2,3,4,5,6,7,8,9,10].map((qty) => {
              const isLocked = isFree && qty > 1;
              const isSelected = selectedQty === qty;
              return (
                <button
                  key={qty}
                  onClick={() => !isLocked && setSelectedQty(qty)}
                  disabled={isLocked}
                  className={`relative h-[38px] flex flex-col items-center justify-center transition-all font-sans ${
                    isLocked
                      ? 'border border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed'
                      : isSelected
                        ? 'border-2 border-[#FE384F] bg-[#FFF5F6]'
                        : 'border border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className={`text-[14px] font-bold leading-none ${
                    isLocked ? 'text-gray-300' : isSelected ? 'text-[#FE384F]' : 'text-[#1A1A1A]'
                  }`}>{qty}</span>
                  <span className="text-[8px] text-gray-400 mt-0.5 leading-none">vez{qty > 1 ? 'es' : ''}</span>
                  {qty === 1 && (
                    <span className="absolute -top-1.5 -right-1 text-[9px]">⭐</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Detalhes da ativação — estilo lista do perfil */}
        <div className="mb-6 divide-y divide-[#F5F5F5]">
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-[13.5px] font-normal text-[#222222]">Ciclo</span>
            <span className="text-[13.5px] font-medium text-[#1A1A1A]">{ciclo} dias</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-[13.5px] font-normal text-[#222222]">Renda diária</span>
            <div className="flex flex-col items-end">
              <span className="text-[13.5px] font-semibold text-[#FE384F]">{formattedDaily}</span>
              {selectedQty > 1 && (
                <span className="text-[10px] text-gray-400">{formatCurrency(dailyUnit,'KZ')} × {selectedQty}</span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-[13.5px] font-normal text-[#222222]">Lucro total</span>
            <div className="flex flex-col items-end">
              <span className="text-[13.5px] font-semibold text-[#16A34A]">{formattedTotalProfit}</span>
              <span className="text-[10px] text-gray-400">{formattedDaily}/dia × {ciclo}d</span>
            </div>
          </div>

        </div>

      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 z-50 flex justify-center shadow-[0_-2px_12px_rgba(0,0,0,0.05)]">
        <div className="w-full max-w-[480px]">
          <button
            onClick={handleBuy}
            disabled={isBuying}
            className="w-full h-[44px] bg-[#FE384F] hover:bg-[#E02038] active:scale-[0.99] text-white font-normal text-[13.5px] transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer"
          >
            {isBuying ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Processando...</span>
              </div>
            ) : (
              'Comprar'
            )}
          </button>
        </div>
      </div>

    </div>
  );
}

