import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';
import { SmartImage } from '../components/SmartImage';
import { formatCurrency } from '../lib/currency';
import { ChevronLeft, Loader2, Building2, ShieldCheck, Truck, Star, Sparkles } from 'lucide-react';

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
          nome: '1888 Super Fábrica VIP Package',
          descricao: 'Produto Oficial 1888 com alto rendimento diário e garantia de atacado direto de fábrica.',
          preco: 10000,
          renda_diaria: 500,
          duracao_dias: 365,
          imagem_url: '/gettyimages-2286930500-612x612.jpg',
          size: 'Standard'
        });
      } catch {
        setProduct({
          id: id || '1',
          nome: '1888 Super Fábrica VIP Package',
          descricao: 'Produto Oficial 1888 com alto rendimento diário e garantia de atacado direto de fábrica.',
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
        showToast(result.message || 'Lote encomendado com sucesso!', 'success');
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
      <div className="flex items-center justify-center min-h-screen bg-[#F5F6F8]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF5000]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#F5F6F8]">
        <div className="bg-white border border-gray-200 p-8 text-center max-w-sm w-full rounded-2xl shadow-xs">
          <h2 className="text-[15px] font-bold mb-4 text-[#1A1A1A]">{t('products.not_found') || 'Produto não encontrado'}</h2>
          <button
            onClick={() => navigate('/produtos')}
            className="w-full h-[44px] bg-[#FF5000] text-white font-bold text-[13.5px] rounded-xl"
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
  const originalPrice = formatCurrency(totalPrice * 1.45, 'KZ');
  const formattedDaily = formatCurrency(totalDaily, 'KZ');
  const formattedTotalProfit = formatCurrency(totalProfit, 'KZ');

  return (
    <div className="w-full min-h-screen bg-[#F5F6F8] pb-24 font-sans antialiased text-[#1A1A1A] select-none flex flex-col items-center">
      <main className="w-full max-w-[480px] bg-white flex flex-col relative shadow-sm">
        {/* Imagem do Produto */}
        <div className="w-full aspect-[4/2.6] bg-[#FAF8F5] relative overflow-hidden flex items-center justify-center border-b border-gray-100">
          {/* Botão voltar + título 1688 */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center px-3 pt-3 gap-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white active:opacity-75 transition-opacity flex-shrink-0 cursor-pointer"
              aria-label="Voltar"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2.5 py-0.5 rounded-full">
              <span className="text-[14px] font-black italic text-[#FF5000]">1888</span>
              <span className="text-[11px] font-semibold text-white">Super Fábrica</span>
            </div>
          </div>

          {product.imagem_url ? (
            <SmartImage 
              src={product.imagem_url} 
              alt={product.nome} 
              className="w-full h-full object-contain p-4"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              📦
            </div>
          )}

          <div className="absolute bottom-2.5 right-2.5 bg-black/60 text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full">
            1/1
          </div>
        </div>

        {/* Preço de Atacado 1888 */}
        <div className="bg-gradient-to-r from-[#FFF4EB] via-[#FFF9F5] to-[#FFF4EB] border-b border-orange-200/80 px-4 py-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10.5px] font-black text-white bg-[#FF5000] px-1.5 py-0.5 rounded-xs uppercase">
                Preço Fábrica 1888
              </span>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100/80 px-2 py-0.2 rounded-xs flex items-center gap-1">
                <Truck className="w-3 h-3" /> 48h Envio
              </span>
            </div>
            <div className="text-[11px] font-bold text-[#FF5000] bg-white px-2 py-0.5 rounded-md border border-orange-200 shadow-2xs">
              -31% Atacado
            </div>
          </div>

          <div className="flex items-baseline gap-2 flex-wrap">
            <div className="text-[24px] font-black text-[#FF5000] tracking-tight leading-none">
              {formattedPrice}
            </div>
            <span className="text-[12px] text-gray-400 line-through font-normal">{originalPrice}</span>
          </div>

          <div className="mt-1 flex items-center gap-2 text-[11.5px] text-gray-600">
            <span>Preço por lote: <strong className="text-gray-900">{formattedUnitPrice}</strong></span>
            {selectedQty > 1 && (
              <span className="text-[#FF5000] font-bold bg-orange-100 px-1.5 rounded">× {selectedQty}</span>
            )}
          </div>
        </div>

        {/* Nome do Produto */}
        <div className="px-4 pt-3 pb-1">
          <h1 className="text-[16px] font-bold text-gray-900 leading-snug">
            {product.nome}
          </h1>
          {product.descricao && (
            <p className="text-[12.5px] text-gray-500 mt-1 leading-relaxed">
              {product.descricao}
            </p>
          )}
        </div>

        {/* Seletor de Quantidade de Lotes */}
        <div className="px-4 pt-3 pb-2 space-y-2 border-t border-gray-100 mt-2">
          <div className="text-[13px] font-medium text-gray-800 flex items-center justify-between">
            <span>Quantidade de Lotes:</span>
            <span className="font-bold text-[#FF5000]">{selectedQty} Lote{selectedQty > 1 ? 's' : ''}</span>
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
                  className={`relative h-[40px] flex flex-col items-center justify-center transition-all rounded-xl font-sans cursor-pointer ${
                    isLocked
                      ? 'border border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed'
                      : isSelected
                        ? 'border-2 border-[#FF5000] bg-[#FFF5EE] text-[#FF5000] font-bold shadow-xs'
                        : 'border border-gray-200 bg-white hover:border-orange-300 text-gray-800'
                  }`}
                >
                  <span className="text-[14px] font-bold leading-none">{qty}</span>
                  <span className="text-[8.5px] text-gray-400 mt-0.5 leading-none">lote{qty > 1 ? 's' : ''}</span>
                  {qty === 1 && (
                    <span className="absolute -top-1 -right-1 text-[8px] bg-[#FF5000] text-white px-1 rounded-full">★</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Detalhes de Rendimento e Ciclo */}
        <div className="mx-4 my-3 bg-[#FAF8F5] border border-orange-100 rounded-2xl p-3.5 divide-y divide-orange-100/80">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[13px] text-gray-600 font-medium">Ciclo de Operação</span>
            <span className="text-[13.5px] font-bold text-gray-900">{ciclo} dias</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-[13px] text-gray-600 font-medium">Renda Diária Creditada</span>
            <div className="flex flex-col items-end">
              <span className="text-[13.5px] font-black text-[#FF5000]">{formattedDaily}</span>
              {selectedQty > 1 && (
                <span className="text-[10px] text-gray-400">{formatCurrency(dailyUnit,'KZ')} × {selectedQty}</span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-[13px] text-gray-600 font-medium">Lucro Total Acumulado</span>
            <div className="flex flex-col items-end">
              <span className="text-[14px] font-black text-emerald-600">{formattedTotalProfit}</span>
              <span className="text-[10px] text-gray-400">{formattedDaily}/dia × {ciclo}d</span>
            </div>
          </div>
        </div>

        {/* Garantias Oficiais 1888 */}
        <div className="px-4 pb-6 pt-1 flex items-center justify-around text-center text-gray-500 text-[11px]">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF5000]" />
            <span>Fábrica Auditada</span>
          </div>
          <div className="flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-[#FF5000]" />
            <span>Origem 1888</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#FF5000]" />
            <span>Rendimento 100%</span>
          </div>
        </div>
      </main>

      {/* Botão Fixo de Encomenda */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 p-3 z-50 flex justify-center shadow-[0_-3px_12px_rgba(0,0,0,0.06)]">
        <div className="w-full max-w-[480px]">
          <button
            onClick={handleBuy}
            disabled={isBuying}
            className="w-full h-[46px] bg-gradient-to-r from-[#FF6A00] via-[#FF5000] to-[#FF2200] hover:opacity-95 active:scale-[0.99] text-white font-bold text-[14px] rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            {isBuying ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Processando Lote...</span>
              </div>
            ) : (
              <>
                <Building2 className="w-4.5 h-4.5" />
                <span>Encomendar Lote da Fábrica ({formattedPrice})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
