import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';
import { Button } from '../components/Button';
import { SmartImage } from '../components/SmartImage';
import { cn } from '../lib/utils';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [isBuying, setIsBuying] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
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
        console.error('Falhou, recarregue a pagina', err);
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
      showToast(error.message || 'Falha, recarregue a pagina', 'error');
    } finally {
      setIsBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f2f2f2]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ms-blue"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#f2f2f2]">
        <div className="bg-white border border-[#e1e1e1] p-10 rounded-sm text-center max-w-sm w-full">
          <h2 className="text-xl font-bold mb-6 text-[#1b1b1b]">{t('products.not_found')}</h2>
          <Button onClick={() => navigate('/produtos')} className="w-full rounded-sm shadow-none">
            {t('products.back_to_list')}
          </Button>
        </div>
      </div>
    );
  }

  const today = new Date();
  const expirationDate = new Date();
  expirationDate.setDate(today.getDate() + (product.duracao_dias || product.duration_dias));

  const features = [
    t('products.feature_security'),
    t('products.feature_support'),
    t('products.feature_updates'),
    t('products.feature_performance'),
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center relative">
      <div className="w-full absolute top-0 left-0 p-6 flex justify-between items-center z-50">
        <button 
          onClick={() => navigate('/produtos')} 
          className="w-10 h-10 flex items-center justify-center -ml-2 text-[#333333] hover:bg-[#F5F5F5] rounded-full transition-colors"
          aria-label="Voltar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[400px] flex flex-col px-6 py-12"
      >
        {/* Header Section: Compact Image + Title */}
        <div className="flex items-center gap-4 mb-8 mt-4">
          <div className="w-16 h-16 shrink-0 flex items-center justify-center">
            {product.imagem_url ? (
              <SmartImage 
                src={product.imagem_url} 
                alt={product.nome} 
                className="w-full h-full object-contain !bg-transparent"
                style={{ background: 'transparent' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#F5F5F5] rounded-xl">
                <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.4 24h-11.4v-11.4h11.4v11.4zm12.6 0h-11.4v-11.4h11.4v11.4zm-12.6-12.6h-11.4v-11.4h11.4v11.4zm12.6 0h-11.4v-11.4h11.4v11.4z"/>
                </svg>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-[24px] font-semibold text-[#333333] mb-2">{product.nome}</h1>
            <p className="text-[14px] text-gray-500 font-light">{t('products.available_now')}</p>
          </div>
        </div>

        {/* Compact Specs Grid */}
        <div className="bg-white rounded-2xl p-5 mb-8 grid grid-cols-2 gap-y-5 gap-x-4 border border-[#E5E7EB]">
          <div className="flex flex-col">
            <span className="text-[12px] font-light text-gray-500 mb-0.5 capitalize">{t('products.daily_income')}</span>
            <span className="text-[14px] font-normal text-[#C62828]">+{Number(product.renda_diaria).toLocaleString('pt-BR')} Kz</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-light text-gray-500 mb-0.5 capitalize">{t('products.duration')}</span>
            <span className="text-[14px] font-normal text-[#333333]">{product.duracao_dias} {product.duracao_dias === 1 ? t('product.unit.day') : t('product.unit.days')}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-light text-gray-500 mb-0.5 capitalize">{t('products.activation')}</span>
            <span className="text-[14px] font-normal text-[#333333]">{today.toLocaleDateString('pt-AO')}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-light text-gray-500 mb-0.5 capitalize">{t('products.expiration')}</span>
            <span className="text-[14px] font-normal text-[#e81123]">{expirationDate.toLocaleDateString('pt-AO')}</span>
          </div>
        </div>



        {/* Price and Buy Action */}
        <div className="mt-auto flex flex-col gap-5">
          <div className="flex items-center justify-between py-3 border-t border-[#F5F5F5]">
            <span className="text-[13px] font-light text-gray-500 capitalize">{t('products.total_price')}</span>
            <span className="text-[20px] font-semibold bg-gradient-to-r from-[#C62828] to-[#1A237E] bg-clip-text text-transparent">
              {Number(product.preco).toLocaleString('pt-AO')} <span className="text-[13px] text-gray-500 font-light">Kz</span>
            </span>
          </div>

          <button 
            onClick={handleBuy}
            disabled={isBuying}
            className="w-full h-[50px] rounded-[25px] bg-gradient-to-r from-[#C62828] to-[#1A237E] text-white font-medium text-[16px] transition-opacity hover:opacity-90 disabled:opacity-70"
          >
            {isBuying ? 'Aguarde...' : t('products.btn_buy')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
