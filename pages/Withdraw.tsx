import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ChevronLeft,
  Wallet,
  Lock,
  Banknote,
  Info,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Landmark
} from 'lucide-react';

import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/currency';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';
import { Skeleton } from '../components/Skeleton';

export default function Withdraw() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hasBank, setHasBank] = useState(false);
  const [bankName, setBankName] = useState('');
  const [bankId, setBankId] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [hasPending, setHasPending] = useState(false);
  const [iban, setIban] = useState('');

  const fetchData = async () => {
    try {
      const { data, error } = await supabase.rpc('get_withdraw_info_mcpn');
      if (error) throw error;
      if (data && data.length > 0) {
        setBalance(Number(data[0].balance));
        setHasBank(data[0].has_bank);
        setBankName(data[0].bank_name || '');
        setBankId(data[0].bank_id || null);
        setIsVerified(data[0].is_verified);
        setIban(data[0].iban || '');
        setHasPending(data[0].has_pending);
      }
    } catch (err: any) {
      console.error('Falhou, recarregue a pagina', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('withdraw_balance_sync')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'account_user' },
        () => { fetchData(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setAmount(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasPending) {
      showToast(t('withdraw.pending_wait'), 'error');
      return;
    }

    const withdrawAmount = parseInt(amount);
    const now = new Date();
    const hour = now.getHours();

    if (hour < 10 || hour >= 16) {
      showToast(t('withdraw.time_error'), 'error');
      return;
    }

    if (!isVerified) {
      showToast(t('withdraw.verify_required'), 'error');
      navigate('/autenticacao');
      return;
    }

    if (!hasBank) {
      showToast(t('withdraw.bank_required'), 'error');
      navigate('/informacao-bancaria?redirect=/retirada');
      return;
    }

    if (!password) {
      showToast(t('auth.password_error_empty'), 'error');
      return;
    }

    if (!amount || withdrawAmount < 400) {
      showToast(t('withdraw.min_amount'), 'error');
      return;
    }

    if (withdrawAmount > 100000) {
      showToast(t('withdraw.max_amount'), 'error');
      return;
    }

    if (withdrawAmount > balance) {
      showToast(t('withdraw.insufficient'), 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user?.email) throw new Error('Sessão expirada.');

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: userData.user.email,
        password: password,
      });

      if (authError) {
        showToast(t('auth.password_error_wrong'), 'error');
        setIsSubmitting(false);
        return;
      }

      const { data, error } = await supabase.rpc('process_withdrawal_request', {
        p_amount: withdrawAmount,
        p_bank_id: bankId || '',
        p_password: password
      }) as { data: { success: boolean; message: string } | null; error: any };

      if (error) throw error;

      if (data && data.success) {
        showToast(data.message, 'success');
        navigate('/perfil');
      } else {
        showToast(data?.message || t('common.error'), 'error');
      }
    } catch (err: any) {
      showToast(err.message || t('common.error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#FAFAFA] pb-28 font-sans select-none">
        <div className="relative bg-gradient-to-br from-[#D32F2F] via-[#C62828] to-[#B71C1C] pt-7 pb-16 px-5">
          <div className="flex items-center justify-between max-w-[430px] mx-auto">
            <Skeleton className="w-8 h-8 opacity-40" rounded="rounded-full" />
            <Skeleton className="w-28 h-5 opacity-40" />
            <div className="w-8" />
          </div>
        </div>
        <div className="max-w-[430px] mx-auto px-4 -mt-8 space-y-3.5">
          <div className="bg-white rounded-[8px] p-5 shadow-sm space-y-4">
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-full h-12" rounded="rounded-[8px]" />
            <Skeleton className="w-full h-12" rounded="rounded-[8px]" />
            <Skeleton className="w-full h-12" rounded="rounded-[8px]" />
            <Skeleton className="w-full h-12" rounded="rounded-[8px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] pb-28 font-sans antialiased text-[#1A1C1E] select-none">

      {/* 1. HEADER VERDE ORGÂNICO */}
      <div className="relative bg-gradient-to-br from-[#D32F2F] via-[#C62828] to-[#B71C1C] pt-7 pb-16 px-5 text-white overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
          viewBox="0 0 380 260"
          preserveAspectRatio="none"
        >
          <path d="M190,0 Q185,130 190,260" stroke="#FFFFFF" strokeWidth="1.8" fill="none" opacity="0.6" />
          <path d="M190,40 C140,70 70,110 0,130" stroke="#FFFFFF" strokeWidth="1.2" fill="none" opacity="0.4" />
          <path d="M190,40 C240,70 310,110 380,130" stroke="#FFFFFF" strokeWidth="1.2" fill="none" opacity="0.4" />
          <path d="M190,140 C140,170 80,210 0,230" stroke="#FFFFFF" strokeWidth="1.2" fill="none" opacity="0.4" />
          <path d="M190,140 C240,170 300,210 380,230" stroke="#FFFFFF" strokeWidth="1.2" fill="none" opacity="0.4" />
        </svg>

        <div className="relative z-10 flex items-center justify-between max-w-[430px] mx-auto w-full">
          <button
            onClick={() => navigate('/perfil')}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white active:scale-95 transition-transform"
            aria-label={t('common.back')}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <h1 className="text-[17px] font-semibold text-white tracking-tight">
            {t('withdraw.title')}
          </h1>

          <div className="w-9" />
        </div>
      </div>

      {/* 2. CONTEÚDO DOS CARDS */}
      <div className="max-w-[430px] mx-auto px-4 -mt-8 relative z-20 space-y-3.5">

        {/* CARD DO FORMULÁRIO */}
        <div className="bg-white rounded-[8px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100/60 p-5">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Saldo Disponível Info */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-[13px] text-[#8A929A]">{t('withdraw.balance_label') || 'Saldo Disponível'}</span>
              <span className="text-[15px] font-bold text-[#1A1C1E]">
                {formatCurrency(balance, 'KZ')}
              </span>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-[13px] font-semibold text-[#1A1C1E] mb-1.5">{t('withdraw.amount')}</label>
              <div className="flex items-center h-[54px] rounded-[8px] border border-[#F4F4F4] bg-[#FFFFFF] px-4 shadow-[0_8px_20px_rgba(242,240,242,0.55)] focus-within:border-[#C62828] focus-within:ring-2 focus-within:ring-[#C62828]/10 transition-all">
                <div className="w-[26px] h-[26px] rounded-[6px] bg-red-50 flex items-center justify-center text-[#C62828] mr-2.5 shrink-0">
                  <Banknote className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  placeholder={t('withdraw.amount_placeholder')}
                  className="flex-1 h-full bg-transparent outline-none text-[15px] text-[#2D2324] placeholder:text-[#A09AA5] font-medium"
                  value={amount}
                  onChange={handleAmountChange}
                />
                <span className="text-[14px] font-semibold text-[#64748B] ml-2">KZ</span>
              </div>
            </div>


            {/* Security Password */}
            <div>
              <label className="block text-[13px] font-semibold text-[#1A1C1E] mb-1.5">{t('withdraw.password')}</label>
              <div className="relative flex items-center h-[54px] rounded-[8px] border border-[#F4F4F4] bg-[#FFFFFF] px-4 shadow-[0_8px_20px_rgba(242,240,242,0.55)] focus-within:border-[#C62828] focus-within:ring-2 focus-within:ring-[#C62828]/10 transition-all">
                <div className="w-[26px] h-[26px] rounded-[6px] bg-red-50 flex items-center justify-center text-[#C62828] mr-2.5 shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={t('withdraw.security_pass_placeholder')}
                  className="flex-1 h-full bg-transparent outline-none text-[15px] text-[#2D2324] placeholder:text-[#A09AA5] font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#A09AA5] hover:text-[#C62828] p-1 active:scale-90 transition-transform"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || hasPending || !amount || parseInt(amount) < 400}
              className="w-full h-[46px] rounded-[8px] bg-gradient-to-r from-[#D32F2F] to-[#B71C1C] text-white font-semibold text-[15px] transition-all active:scale-[0.99] disabled:opacity-40 shadow-sm flex items-center justify-center mt-4 cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : 'Sacar'}
            </button>
          </form>
        </div>

        {/* CARD DE INSTRUÇÕES / GUIA */}
        <div className="bg-white rounded-[8px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100/60 p-5 space-y-3">
          <div className="flex items-center space-x-2 text-[#C62828]">
            <Info className="w-4 h-4" />
            <p className="text-[13px] font-semibold tracking-tight">{t('withdraw.guide_title')}</p>
          </div>

          <div className="space-y-2 text-[12.5px] text-[#64748B] leading-relaxed">
            {[
              t('withdraw.guide_time'),
              t('withdraw.guide_limits'),
              t('withdraw.guide_tax'),
              t('withdraw.guide_support')
            ].map((text, idx) => (
              <div key={idx} className="flex items-start space-x-2">
                <span className="text-[#C62828] font-bold">•</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
