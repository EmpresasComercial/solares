import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ShieldCheck,
  Info,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';

import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/currency';
import { useLanguage } from '../contexts/LanguageContext';
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
      <div className="w-full min-h-screen bg-[#F2F2F2] pb-32 font-sans select-none flex flex-col items-center">
        <header className="w-full max-w-[480px] bg-[#FFFFFF] px-4 pt-4 pb-3 sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            <Skeleton className="w-6 h-6 rounded-full opacity-40" />
            <Skeleton className="w-32 h-5 opacity-40" />
          </div>
        </header>
        <main className="w-full max-w-[480px] px-4 pt-4 space-y-3">
          <Skeleton className="w-full h-14 rounded-[10px]" />
          <Skeleton className="w-full h-14 rounded-[10px]" />
          <Skeleton className="w-full h-14 rounded-[10px]" />
        </main>
      </div>
    );
  }

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
            {t('withdraw.title') || 'Retirar Saldo'}
          </h1>
        </div>

        {/* Subtítulo verde com ícone de escudo */}
        <div className="flex items-center gap-1.5 mt-1.5 ml-8 text-[13px] text-[#38A98B] font-medium">
          <ShieldCheck className="w-4 h-4 text-[#38A98B] shrink-0" />
          <span>Sua transação bancária é protegida e criptografada.</span>
        </div>
      </header>

      {/* 2. CONTEÚDO PRINCIPAL (CAMPOS BRANCOS LIMPOS) */}
      <main className="w-full max-w-[480px] px-4 pt-4 space-y-3">
        
        {/* CARD: Saldo Disponível */}
        <div className="bg-[#FFFFFF] rounded-[10px] h-[54px] px-4 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <span className="text-[14px] text-[#A6A6A6] font-medium">
            {t('withdraw.balance_label') || 'Saldo Disponível'}
          </span>
          <span className="text-[16px] font-bold text-[#202020]">
            {formatCurrency(balance, 'KZ')}
          </span>
        </div>

        {/* FORMULÁRIO DE RETIRADA */}
        <form onSubmit={handleSubmit} id="withdraw-form" className="space-y-3">
          
          {/* Campo: Valor de Retirada */}
          <div className="bg-[#FFFFFF] rounded-[10px] h-[54px] px-4 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <input
              type="tel"
              placeholder={t('withdraw.amount_placeholder') || 'Valor a retirar'}
              className="w-full h-full bg-transparent outline-none text-[15px] text-[#202020] placeholder:text-[#A6A6A6] font-medium pr-2"
              value={amount}
              onChange={handleAmountChange}
            />
            <span className="text-[14px] font-bold text-[#FE384F] shrink-0">KZ</span>
          </div>

          {/* Campo: Senha de Segurança */}
          <div className="bg-[#FFFFFF] rounded-[10px] h-[54px] px-4 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={t('withdraw.security_pass_placeholder') || 'Senha de Segurança'}
              className="w-full h-full bg-transparent outline-none text-[15px] text-[#202020] placeholder:text-[#A6A6A6] font-medium pr-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 text-[#A6A6A6] hover:text-[#202020] active:scale-90 transition-transform"
            >
              {showPassword ? <EyeOff className="w-5 h-5 stroke-[1.8]" /> : <Eye className="w-5 h-5 stroke-[1.8]" />}
            </button>
          </div>

        </form>

        {/* CARD: Instruções e Regras */}
        <div className="bg-[#FFFFFF] rounded-[14px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-2.5">
          <div className="flex items-center gap-2 text-[#202020]">
            <Info className="w-4 h-4 text-[#A6A6A6]" />
            <p className="text-[13px] font-bold tracking-tight">{t('withdraw.guide_title') || 'Instruções de Retirada'}</p>
          </div>

          <div className="space-y-1.5 text-[12px] text-[#707070] leading-relaxed pl-1">
            {[
              t('withdraw.guide_time'),
              t('withdraw.guide_limits'),
              t('withdraw.guide_tax'),
              t('withdraw.guide_support')
            ].map((text, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-[#FE384F] font-bold">•</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* 3. BARRA INFERIOR FIXA COM BOTÃO "Salvar e confirmar" (#FE384F) */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#F2F2F2] p-4 z-40 flex justify-center border-t border-gray-200/50">
        <div className="w-full max-w-[480px]">
          <button
            type="submit"
            form="withdraw-form"
            disabled={isSubmitting || hasPending || !amount || parseInt(amount) < 400}
            className="w-full h-[48px] rounded-full bg-[#FE384F] hover:bg-[#E02E44] active:scale-[0.99] text-[#FFFFFF] font-bold text-[16px] transition-all disabled:opacity-40 shadow-sm flex items-center justify-center cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin h-5 w-5 text-[#FFFFFF]" />
            ) : (
              "Confirmar Retirada"
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
