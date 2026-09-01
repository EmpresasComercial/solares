import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/currency';
import { useLanguage } from '../contexts/LanguageContext';
import { Skeleton } from '../components/Skeleton';
import { HeaderBanner } from '../components/HeaderBanner';

const MIN_WITHDRAW = 100;
const MAX_WITHDRAW = 100000;

const isWithdrawAllowed = () => {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  return day >= 1 && day <= 5 && hour >= 9 && hour < 18;
};

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
  const [bankId, setBankId] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [hasPending, setHasPending] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_withdraw_info_mcpn');
      if (error) throw error;
      if (data?.length > 0) {
        const d = data[0];
        setBalance(Number(d.balance));
        setHasBank(d.has_bank);
        setBankId(d.bank_id || null);
        setIsVerified(d.is_verified);
        setHasPending(d.has_pending);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel('withdraw_balance_sync')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'account_user' }, fetchData)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setAmount(val);
  };

  const handleAllIn = () => {
    setAmount(Math.floor(balance).toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isWithdrawAllowed()) {
      showToast('Retiradas são permitidas apenas de Segunda a Sexta, das 09:00 às 18:00.', 'error');
      return;
    }

    if (!hasBank) {
      showToast('Por favor, adicione uma conta bancária primeiro.', 'error');
      navigate('/adicionar-banco?redirect=/retirada');
      return;
    }

    if (hasPending) {
      showToast('Você já possui uma retirada pendente em análise.', 'error');
      return;
    }

    const withdrawAmount = Number(amount);
    if (!withdrawAmount || withdrawAmount < MIN_WITHDRAW) {
      showToast(`Valor mínimo para retirada é ${formatCurrency(MIN_WITHDRAW, 'KZ')}`, 'error');
      return;
    }

    if (withdrawAmount > MAX_WITHDRAW) {
      showToast(`Valor máximo para retirada é ${formatCurrency(MAX_WITHDRAW, 'KZ')}`, 'error');
      return;
    }

    if (withdrawAmount > balance) {
      showToast('Saldo insuficiente para esta retirada.', 'error');
      return;
    }

    if (!password) {
      showToast(t('auth.password_placeholder') || 'Insira sua senha de login', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('Sessão expirada.');

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password,
      });
      if (authError) { showToast(t('auth.password_error_wrong'), 'error'); return; }

      const { data, error } = await supabase.rpc('process_withdrawal_request', {
        p_amount: withdrawAmount,
        p_bank_id: bankId || '',
        p_password: password
      }) as { data: { success: boolean; message: string } | null; error: any };

      if (error) throw error;

      if (data?.success) {
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

  const guideItems = [
    t('withdraw.guide_time'),
    t('withdraw.guide_limits'),
    t('withdraw.guide_tax'),
    t('withdraw.guide_support'),
  ];

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#F7F8FA] pb-32 font-sans select-none flex flex-col items-center">
        <HeaderBanner title="Retirar" />
        <main className="w-full max-w-[480px] px-4 pt-4 space-y-3">
          <Skeleton className="w-full h-14 rounded-none" />
          <Skeleton className="w-full h-14 rounded-none" />
          <Skeleton className="w-full h-14 rounded-none" />
        </main>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F7F8FA] pb-32 font-sans antialiased text-[#202020] select-none flex flex-col items-center">
      {/* Header Banner com título padronizado */}
      <HeaderBanner title="Retirar" />

      <main className="w-full max-w-[480px] px-4 pt-4 space-y-3">
        <div className="bg-white rounded-none h-[48px] px-4 flex items-center justify-between border border-gray-200">
          <span className="text-[13px] text-gray-500 font-medium">Saldo disponível:</span>
          <span className="text-[15px] font-bold text-[#FF5000]">{formatCurrency(balance, 'KZ')}</span>
        </div>

        <form onSubmit={handleSubmit} id="withdraw-form" className="space-y-2.5">
          <div className="bg-white rounded-none h-[46px] px-4 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <input
              type="tel"
              placeholder="Valor a retirar (mín. 100 Kz)"
              className="w-full h-full bg-transparent outline-none text-[13.5px] text-[#202020] placeholder:text-[#AAAAAA] font-normal pr-2"
              value={amount}
              onChange={handleAmountChange}
            />
            <span className="text-[12px] font-medium text-[#FE384F] shrink-0">KZ</span>
          </div>

          <div className="bg-white rounded-none h-[46px] px-4 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha de login"
              className="w-full h-full bg-transparent outline-none text-[13.5px] text-[#202020] placeholder:text-[#AAAAAA] font-normal pr-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="p-1 text-[#AAAAAA] hover:text-[#202020] active:scale-90 transition-transform"
            >
              {showPassword ? <EyeOff className="w-4 h-4 stroke-[1.6]" /> : <Eye className="w-4 h-4 stroke-[1.6]" />}
            </button>
          </div>
        </form>

        <div className="bg-white rounded-none p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-2">
          <p className="text-[12px] font-medium text-[#FE384F]">Instruções de Retirada</p>
          <div className="space-y-1.5 text-[11.5px] text-[#666666] leading-relaxed">
            {guideItems.map((text, idx) => (
              <div key={idx} className="flex items-start gap-1.5">
                <span className="text-[#FE384F] mt-px">•</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-[#F2F2F2] p-3.5 z-40 flex justify-center border-t border-gray-200/50">
        <div className="w-full max-w-[480px]">
          <button
            type="submit"
            form="withdraw-form"
            disabled={isSubmitting || hasPending || !amount || parseInt(amount) < MIN_WITHDRAW}
            className="w-full h-[40px] rounded-none bg-[#FE384F] hover:bg-[#E02E44] active:scale-[0.99] text-white font-normal text-[13.5px] transition-all disabled:opacity-40 shadow-none flex items-center justify-center cursor-pointer"
          >
            {isSubmitting
              ? <Loader2 className="animate-spin h-4 w-4 text-white" />
              : 'Confirmar'
            }
          </button>
        </div>
      </div>
    </div>
  );
}
