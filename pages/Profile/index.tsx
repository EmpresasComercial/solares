import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatCurrency, CurrencyType } from '../../lib/currency';
import { supabase } from '../../lib/supabase';
import { Settings, Wallet, PlusCircle, TrendingUp, Landmark, UserPlus } from 'lucide-react';

/* ─── Skeleton atom ─────────────────────────────────────────── */
function Sk({ w = 'w-full', h = 'h-4', rounded = 'rounded-md', extra = '' }) {
  return (
    <div
      className={`${w} ${h} ${rounded} ${extra} bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.4s_ease-in-out_infinite]`}
    />
  );
}

/* ─── Skeleton para uma linha do card principal ─────────────── */
function SkRow() {
  return (
    <div className="flex items-center justify-between py-3.5 px-4">
      <div className="flex items-center space-x-3.5">
        <Sk w="w-[30px]" h="h-[30px]" rounded="rounded-[7px]" />
        <div className="space-y-1.5">
          <Sk w="w-24" h="h-3.5" />
          <Sk w="w-16" h="h-3" />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Sk w="w-16" h="h-3.5" />
        <Sk w="w-3" h="h-3" rounded="rounded-full" />
      </div>
    </div>
  );
}

/* ─── Skeleton do Header ────────────────────────────────────── */
function SkHeader() {
  return (
    <div className="relative bg-gradient-to-br from-[#D32F2F] via-[#C62828] to-[#B71C1C] pt-7 pb-20 px-5 overflow-hidden">
      <div className="relative z-10 flex flex-col items-center justify-center text-center mt-5 mb-2 space-y-2.5">
        <Sk w="w-24" h="h-4" rounded="rounded-full" extra="opacity-40" />
        <Sk w="w-40" h="h-6" rounded="rounded-full" extra="opacity-40" />
      </div>
    </div>
  );
}

/* ─── Skeleton completo da página Profile ───────────────────── */
function ProfileSkeleton() {
  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] pb-28 font-sans antialiased select-none">
      <SkHeader />
      <div className="max-w-[430px] mx-auto px-4 -mt-12 relative z-20 space-y-3.5">
        {/* Card principal */}
        <div className="bg-white rounded-[8px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100/60 overflow-hidden divide-y divide-gray-100">
          {[...Array(6)].map((_, i) => <SkRow key={i} />)}
        </div>
        {/* Card path to 1M */}
        <div className="bg-white rounded-[8px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-gray-100/60 p-6 pt-5 text-center">
          <div className="flex flex-col items-center space-y-3 mt-1">
            <Sk w="w-36" h="h-5" rounded="rounded-full" />
            <Sk w="w-56" h="h-3.5" />
            <Sk w="w-48" h="h-3.5" />
            <Sk w="w-52" h="h-24" rounded="rounded-[8px]" extra="mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Componente principal ──────────────────────────────────── */
export default function Profile() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);

  const [currency, setCurrencyState] = useState<CurrencyType>(() => {
    const saved = localStorage.getItem('app_currency') as CurrencyType;
    return (saved === 'KZ' || saved === 'USDT') ? saved : 'KZ';
  });

  const setCurrency = (c: CurrencyType) => {
    setCurrencyState(c);
    localStorage.setItem('app_currency', c);
  };

  const [accountData, setAccountData] = useState({
    saldo_disponivel: 0,
    lucro_acumulado: 0,
    total_recarregado: 0,
    total_retirado: 0,
    total_comissao_equipe: 0,
    telefone: ''
  });

  const [dailyIncome, setDailyIncome] = useState(0);
  const [bankName, setBankName] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data, error } = await supabase.rpc('get_my_account_data');
        if (error) throw error;
        if (data && data.length > 0) {
          setAccountData(data[0]);
        }

        const { data: opsData } = await supabase.rpc('get_daily_ops_status_mcpn');
        if (opsData && (opsData as any).estimated_income) {
          setDailyIncome(Number((opsData as any).estimated_income));
        }

        const { data: banksData } = await supabase.rpc('get_my_bank_accounts_mcpn');
        if (banksData && Array.isArray(banksData) && banksData.length > 0) {
          setBankName(banksData[0].bank_name || null);
        } else {
          setBankName(null);
        }
      } catch (error: any) {
        console.error('Erro ao carregar perfil:', error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();

    const channel = supabase
      .channel('account_user_realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'account_user' },
        () => { fetchProfile(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('greeting.morning');
    if (hour < 18) return t('greeting.afternoon');
    return t('greeting.evening');
  };

  const displayName = accountData.telefone 
    ? `+244 ${accountData.telefone.slice(0, 3)} ${accountData.telefone.slice(3)}` 
    : 'Jane!';

  /* Enquanto carrega, mostra o skeleton */
  if (loading) return <ProfileSkeleton />;

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] pb-28 font-sans antialiased text-[#1A1C1E] select-none">
      
      {/* 1. HEADER VERMELHO #C62828 */}
      <div className="relative bg-gradient-to-br from-[#D32F2F] via-[#C62828] to-[#B71C1C] pt-7 pb-20 px-5 text-white overflow-hidden">
        
        {/* Veios geométricos orgânicos */}
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

        {/* Saudação */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center mt-5 mb-2">
          <p className="text-[20px] font-normal text-white/95 tracking-normal">
            {getGreeting()}
          </p>
          <h1 className="text-[24px] font-bold text-white tracking-tight mt-0.5">
            {displayName}
          </h1>
        </div>
      </div>

      {/* 2. CARDS */}
      <div className="max-w-[430px] mx-auto px-4 -mt-12 relative z-20 space-y-3.5">
        
        {/* CARD PRINCIPAL */}
        <div className="bg-white rounded-[8px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100/60 overflow-hidden divide-y divide-gray-100">

          {/* Saldo */}
          <div
            onClick={() => navigate('/retirada')}
            className="flex items-center justify-between py-3.5 px-4.5 hover:bg-gray-50/60 active:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-[30px] h-[30px] rounded-[7px] bg-red-50 flex items-center justify-center text-[#C62828] shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-[15px] font-semibold text-[#1A1C1E] tracking-tight">{t('profile.earn_title')}</span>
                <span className="text-[14px] font-normal text-[#8A929A]">{t('profile.earn_sub')}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className="text-[15px] font-bold text-[#1A1C1E] tracking-tight">
                {formatCurrency(accountData.saldo_disponivel || 0, currency)}
              </span>
              <svg className="w-3.5 h-3.5 text-[#C4C8CC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>

          {/* Recargas */}
          <div 
            onClick={() => navigate('/recarregar')}
            className="flex items-center justify-between py-3.5 px-4.5 hover:bg-gray-50/60 active:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-[30px] h-[30px] rounded-[7px] bg-red-50 flex items-center justify-center text-[#C62828] shrink-0">
                <PlusCircle className="w-4 h-4" />
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-[15px] font-semibold text-[#1A1C1E] tracking-tight">{t('profile.invest_title')}</span>
                <span className="text-[14px] font-normal text-[#8A929A]">{t('profile.invest_sub')}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className="text-[15px] font-bold text-[#1A1C1E] tracking-tight">
                {formatCurrency(accountData.total_recarregado || 0, currency)}
              </span>
              <svg className="w-3.5 h-3.5 text-[#C4C8CC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>

          {/* Renda diária */}
          <div 
            onClick={() => navigate('/operacoes')}
            className="flex items-center justify-between py-3.5 px-4.5 hover:bg-gray-50/60 active:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-[30px] h-[30px] rounded-[7px] bg-red-50 flex items-center justify-center text-[#C62828] shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-[15px] font-semibold text-[#1A1C1E] tracking-tight">{t('profile.later_title')}</span>
                <span className="text-[14px] font-normal text-[#8A929A]">{t('profile.later_sub')}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className="text-[15px] font-bold text-[#1A1C1E] tracking-tight">
                {formatCurrency(dailyIncome > 0 ? dailyIncome : (accountData.lucro_acumulado || 0), currency)}
              </span>
              <svg className="w-3.5 h-3.5 text-[#C4C8CC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>

          {/* Banco */}
          <div 
            onClick={() => navigate(bankName ? '/informacao-bancaria' : '/adicionar-banco')}
            className="flex items-center justify-between py-3.5 px-4.5 hover:bg-gray-50/60 active:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-[30px] h-[30px] rounded-[7px] bg-red-50 flex items-center justify-center text-[#C62828] shrink-0">
                <Landmark className="w-4 h-4" />
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-[15px] font-semibold text-[#1A1C1E] tracking-tight">{t('profile.bank_title')}</span>
                <span className="text-[14px] font-normal text-[#8A929A]">{t('profile.bank_sub')}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className={`text-[14px] font-semibold tracking-tight ${bankName ? 'text-[#1A1C1E]' : 'text-[#8A929A]'}`}>
                {bankName ? bankName : 'N/A'}
              </span>
              <svg className="w-3.5 h-3.5 text-[#C4C8CC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>

          {/* Convidar */}
          <div 
            onClick={() => navigate('/convite')}
            className="flex items-center justify-between py-3.5 px-4.5 hover:bg-gray-50/60 active:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-[30px] h-[30px] rounded-[7px] bg-red-50 flex items-center justify-center text-[#C62828] shrink-0">
                <UserPlus className="w-4 h-4" />
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-[15px] font-semibold text-[#1A1C1E] tracking-tight">{t('profile.early_title')}</span>
                <span className="text-[14px] font-normal text-[#8A929A]">{t('profile.early_sub')}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className="text-[15px] font-bold text-[#1A1C1E] tracking-tight">
                {formatCurrency(accountData.total_comissao_equipe || 0, currency)}
              </span>
              <svg className="w-3.5 h-3.5 text-[#C4C8CC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>

          {/* Definições */}
          <div
            onClick={() => navigate('/configuracoes-conta')}
            className="flex items-center justify-between py-3.5 px-4.5 hover:bg-gray-50/60 active:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-[30px] h-[30px] rounded-[7px] bg-red-50 flex items-center justify-center text-[#C62828] shrink-0">
                <Settings className="w-4 h-4" />
              </div>
              <span className="text-[15px] font-semibold text-[#1A1C1E] tracking-tight">
                {t('profile.settings_row')}
              </span>
            </div>
            <svg className="w-3.5 h-3.5 text-[#C4C8CC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>

        </div>

        {/* CARD Path to $1M */}
        <div className="bg-white rounded-[8px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-gray-100/60 p-6 pt-5 text-center relative overflow-hidden">
          
          <div 
            onClick={() => navigate('/operacoes')}
            className="absolute top-4 right-4 text-[#D0D5DD] hover:text-gray-500 cursor-pointer p-1 transition-colors"
          >
            <div className="w-[18px] h-[18px] rounded-[5px] bg-[#F2F4F7] flex items-center justify-center">
              <svg className="w-3 h-3 text-[#98A2B3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            </div>
          </div>

          <h2 className="text-[20px] font-bold text-[#111315] tracking-tight mt-1">
            {t('profile.path_title')}
          </h2>
          <p className="text-[13.5px] text-[#4B5563] max-w-[290px] mx-auto mt-2 mb-6 font-normal leading-[1.45]">
            {t('profile.path_sub')}
          </p>

          <div className="relative flex flex-col items-center justify-center mt-1 -mb-3">
            <svg className="w-52 h-26 overflow-visible" viewBox="0 0 160 80">
              <path
                d="M 15,80 A 65,65 0 0,1 145,80"
                fill="none"
                stroke="#F2F4F7"
                strokeWidth="18"
                strokeLinecap="round"
              />
              <circle cx="80" cy="22" r="8.5" fill="#B0B6BC" />
              <circle cx="80" cy="22" r="3.5" fill="#FFFFFF" />
            </svg>

            <div className="flex items-center justify-center space-x-[-10px] mt-[-14px]">
              <div className="w-7 h-7 rounded-full bg-[#EF9A9A] border-2 border-white shadow-sm"></div>
              <div className="w-7 h-7 rounded-full bg-[#C62828] border-2 border-white shadow-sm"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
