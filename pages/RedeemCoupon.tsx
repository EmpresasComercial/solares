import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { ChevronLeft, Loader2 } from 'lucide-react';

import { HeaderBanner } from '../components/HeaderBanner';

export default function RedeemCoupon() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coupon, setCoupon] = useState('');

  const handleCouponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setCoupon(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!coupon || coupon.length < 5) {
      showToast('Código de cupom inválido.', 'error');
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
        showToast('Erro ao resgatar cupom', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Erro ao resgatar cupom', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F7F8FA] pb-32 font-sans antialiased text-[#202020] select-none flex flex-col items-center">
      {/* Header Banner com a imagem oficial */}
      <HeaderBanner title="我的红包 · Resgatar Bônus & Cupons" subtitle="Insira seu código promocional oficial 1888" />

      <main className="w-full max-w-[480px] px-4 pt-4 space-y-2.5">
        <form onSubmit={handleSubmit} id="redeem-coupon-form" className="space-y-2.5">
          <div className="bg-white rounded-none h-[46px] px-4 flex items-center border border-gray-200">
            <input
              type="text"
              className="w-full h-full bg-transparent outline-none text-[13.5px] text-[#202020] placeholder:text-[#AAAAAA] placeholder:text-[12.5px] placeholder:normal-case font-normal uppercase"
              placeholder="Por favor introduza o código"
              value={coupon}
              onChange={handleCouponChange}
              maxLength={20}
            />
          </div>
        </form>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 z-40 flex justify-center border-t border-gray-200">
        <div className="w-full max-w-[480px]">
          <button
            type="submit"
            form="redeem-coupon-form"
            disabled={isSubmitting || !coupon || coupon.length < 5}
            className="w-full h-[44px] rounded-none bg-[#FE384F] hover:bg-[#E02E44] active:scale-[0.99] text-white font-normal text-[13.5px] transition-all disabled:opacity-40 shadow-sm flex items-center justify-center cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin h-4 w-4 text-white" />
            ) : (
              'Resgatar'
            )}
          </button>
        </div>
      </div>

    </div>
  );
}

