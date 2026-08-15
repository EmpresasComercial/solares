import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { Ticket } from 'lucide-react';

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
      showToast(t('coupons.error_invalid'), 'error');
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
    <div className="min-h-screen bg-white flex flex-col relative">
      {/* Header com Título */}
      <div className="w-full absolute top-0 left-0 h-16 flex items-center justify-between px-4 z-50 bg-white">
        <button 
          onClick={() => navigate('/perfil')} 
          className="w-10 h-10 flex items-center justify-center -ml-2 text-[#333333] hover:bg-[#F5F5F5] rounded-full transition-colors relative z-10"
          aria-label={t('common.back')}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-[15px] font-medium text-[#333333] absolute w-full text-center left-0 pointer-events-none">
          {t('coupons.title')}
        </h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[400px] mx-auto flex flex-col px-6 pt-32 pb-12"
      >

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8">
          <div>
            <label className="block text-[14px] text-[#333333] mb-2 font-normal text-left">{t('coupons.label')}</label>
            <div className="relative">
              <input
                type="text"
                className="w-full h-[54px] rounded-[8px] border border-[#F4F4F4] bg-[#FFFFFF] px-5 outline-none text-[15px] text-[#2D2324] placeholder:text-[#A09AA5] shadow-[0_8px_20px_rgba(242,240,242,0.55)] focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/10 transition-all"
                placeholder="Introduza o código"
                value={coupon}
                onChange={handleCouponChange}
                maxLength={20}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[50px] rounded-[25px] bg-gradient-to-r from-[#C62828] to-[#1A237E] text-white font-medium text-[16px] transition-opacity hover:opacity-90 disabled:opacity-70"
          >
            {isSubmitting ? 'Aguarde...' : t('coupons.btn')}
          </button>
        </form>

      </motion.div>
    </div>
  );
}
