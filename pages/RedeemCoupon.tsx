import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { ChevronLeft, Loader2 } from 'lucide-react';

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
    <div className="w-full min-h-screen bg-[#F2F2F2] pb-32 font-sans antialiased text-[#202020] select-none flex flex-col items-center">

      <header className="w-full max-w-[480px] bg-white px-4 pt-4 pb-3 sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/perfil')}
            className="p-1 -ml-1 text-[#202020] active:scale-95 transition-transform"
            aria-label="Voltar"
          >
            <ChevronLeft className="w-5 h-5 stroke-[1.8]" />
          </button>

          <h1 className="text-[14.5px] font-medium text-[#202020] tracking-normal">
            Resgate de Cupom
          </h1>
        </div>
      </header>

      <main className="w-full max-w-[480px] px-4 pt-4 space-y-2.5">
        <form onSubmit={handleSubmit} id="redeem-coupon-form" className="space-y-2.5">
          <div className="bg-white rounded-none h-[46px] px-4 flex items-center shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
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

      <div className="fixed bottom-0 left-0 right-0 bg-[#F2F2F2] p-4 z-40 flex justify-center border-t border-gray-200/50">
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

