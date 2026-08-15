import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { ChevronLeft, ShieldCheck, Loader2 } from 'lucide-react';

export default function RedeemCoupon() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coupon, setCoupon] = useState('');

  const handleCouponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setCoupon(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!coupon || coupon.length < 5) {
      showToast(t('coupons.error_invalid') || 'Código de cupom inválido.', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.rpc('redeem_coupon_mcpn', {
        p_code: coupon
      });

      if (error) throw error;

      const result = data as { success: boolean; message: string } | null;

      if (result && result.success) {
        showToast(result.message, 'success');
        navigate('/perfil');
      } else if (result) {
        showToast(result.message, 'error');
      } else {
        showToast(t('common.error'), 'error');
      }
    } catch (err: any) {
      showToast(err.message || t('common.error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F2F2F2] pb-32 font-sans antialiased text-[#202020] select-none flex flex-col items-center">
      
      {/* 1. HEADER (Design AddBank) */}
      <header className="w-full max-w-[480px] bg-[#FFFFFF] px-4 pt-4 pb-3 sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/perfil')}
            className="p-1 -ml-1 text-[#202020] active:scale-95 transition-transform"
            aria-label={t('common.back')}
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
          </button>
          
          <h1 className="text-[18px] font-bold text-[#202020] tracking-tight">
            {t('coupons.title') || 'Resgatar Cupom'}
          </h1>
        </div>

        {/* Subtítulo verde com ícone de escudo */}
        <div className="flex items-center gap-1.5 mt-1.5 ml-8 text-[13px] text-[#38A98B] font-medium">
          <ShieldCheck className="w-4 h-4 text-[#38A98B] shrink-0" />
          <span>Insira o seu código promocional para resgatar bônus.</span>
        </div>
      </header>

      {/* 2. CONTEÚDO PRINCIPAL (CAMPO BRANCO LIMPO) */}
      <main className="w-full max-w-[480px] px-4 pt-4 space-y-3">
        <form onSubmit={handleSubmit} id="redeem-coupon-form" className="space-y-3">
          
          {/* Campo: Código de Cupom */}
          <div className="bg-[#FFFFFF] rounded-[10px] h-[54px] px-4 flex items-center shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <input
              type="text"
              className="w-full h-full bg-transparent outline-none text-[15px] text-[#202020] placeholder:text-[#A6A6A6] font-medium tracking-wider uppercase"
              placeholder={t('coupons.label') || 'Introduza o código do cupom'}
              value={coupon}
              onChange={handleCouponChange}
              maxLength={20}
            />
          </div>

        </form>
      </main>

      {/* 3. BARRA INFERIOR FIXA COM BOTÃO "Salvar e confirmar" (#FE384F) */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#F2F2F2] p-4 z-40 flex justify-center border-t border-gray-200/50">
        <div className="w-full max-w-[480px]">
          <button
            type="submit"
            form="redeem-coupon-form"
            disabled={isSubmitting || !coupon || coupon.length < 5}
            className="w-full h-[48px] rounded-full bg-[#FE384F] hover:bg-[#E02E44] active:scale-[0.99] text-[#FFFFFF] font-bold text-[16px] transition-all disabled:opacity-40 shadow-sm flex items-center justify-center cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin h-5 w-5 text-[#FFFFFF]" />
            ) : (
              t('coupons.btn') || "Resgatar Agora"
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
