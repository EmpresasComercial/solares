import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatCurrency, CurrencyType } from '../../lib/currency';
import { supabase } from '../../lib/supabase';
import { LogOut, Key, Globe, CreditCard, Headphones, HelpCircle } from 'lucide-react';

function ProfileSkeleton() {
  return (
    <div className="w-full min-h-screen bg-[#F2F2F2] pb-24 font-sans antialiased select-none flex flex-col items-center">
      <div className="w-full max-w-[480px] bg-white px-4 pt-5 pb-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-5 w-52 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-3 gap-2 pt-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-3 bg-gray-200 rounded animate-pulse" />
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-[480px] mt-2.5 bg-white p-4 space-y-4">
        <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-9 h-9 bg-gray-200 rounded-[8px] animate-pulse" />
              <div className="w-14 h-3 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };
  const { t, language, setLanguage } = useLanguage();
  const [loading, setLoading] = useState(true);

  const [currency] = useState<CurrencyType>(() => {
    const saved = localStorage.getItem('app_currency') as CurrencyType;
    return (saved === 'KZ' || saved === 'USDT') ? saved : 'KZ';
  });
  const [accountData, setAccountData] = useState({
    saldo_disponivel: 0,
    lucro_acumulado: 0,
    total_recarregado: 0,
    total_retirado: 0,
    total_comissao_equipe: 0,
    telefone: ''
  });
  const [userId, setUserId] = useState<string>('');
  const [hasBank, setHasBank] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data, error } = await supabase.rpc('get_my_account_data');
        if (error) throw error;
        if (data && data.length > 0) {
          setAccountData(data[0]);
        }

        const { data: settingsData } = await supabase.rpc('get_my_settings_data_mcpn');
        if (settingsData && settingsData.length > 0) {
          setUserId(settingsData[0].invite_code || '');
        }

        const { data: banksData } = await supabase.rpc('get_my_bank_accounts_mcpn');
        if (banksData && Array.isArray(banksData) && banksData.length > 0) {
          setHasBank(true);
        } else {
          setHasBank(false);
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

  const displayName = accountData.telefone 
    ? `AliExpress24 (+244 ${accountData.telefone.slice(0, 3)} ${accountData.telefone.slice(3)})` 
    : 'AliExpress24 Usuário Oficial';

  if (loading) return <ProfileSkeleton />;

  return (
    <div className="w-full min-h-screen bg-[#F2F2F2] pb-24 font-sans antialiased text-[#191919] select-none flex flex-col items-center">

      <div className="w-full max-w-[480px] bg-white px-4 pt-4 pb-4">

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full overflow-hidden border border-[#E8E8E8] bg-white flex-shrink-0 flex items-center justify-center p-1">
            <img
              src="/aliexpress24_logo_icon_167892.webp?v=2"
              alt="Avatar"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex flex-col justify-center leading-tight flex-1">
            <span className="text-[14px] font-medium text-[#444444]">
              ID:{userId || (accountData.telefone ? accountData.telefone.slice(-5) : 'h3fls')}
            </span>
            <h1 className="text-[17px] font-bold text-[#191919] tracking-tight mt-0.5">
              {accountData.telefone ? `+244 ${accountData.telefone.slice(0, 3)} ${accountData.telefone.slice(3)}` : '+244 943 142132'}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-5 pt-1 text-center">

          <div
            onClick={() => navigate('/retirada')}
            className="flex flex-col items-center cursor-pointer active:opacity-60 transition-opacity"
          >
            <span className="text-[12.5px] text-[#555555] font-normal">Saldo</span>
            <span className="text-[13.5px] text-[#191919] font-medium mt-0.5">
              {formatCurrency(accountData.saldo_disponivel || 0, currency)}
            </span>
          </div>

          <div
            onClick={() => navigate('/recarregar')}
            className="flex flex-col items-center cursor-pointer active:opacity-60 transition-opacity"
          >
            <span className="text-[12.5px] text-[#555555] font-normal">Recargas</span>
            <span className="text-[13.5px] text-[#191919] font-medium mt-0.5">
              {formatCurrency(accountData.total_recarregado || 0, currency)}
            </span>
          </div>

          <div
            onClick={() => navigate('/registro-retirada')}
            className="flex flex-col items-center cursor-pointer active:opacity-60 transition-opacity"
          >
            <span className="text-[12.5px] text-[#555555] font-normal">Retiradas</span>
            <span className="text-[13.5px] text-[#191919] font-medium mt-0.5">
              {formatCurrency(accountData.total_retirado || 0, currency)}
            </span>
          </div>

        </div>

      </div>

      <div className="w-full max-w-[480px] mt-2.5 bg-white px-4 pt-4 pb-3.5">
        
        <div
          onClick={() => navigate('/minhas-compras')}
          className="flex items-center justify-between cursor-pointer active:opacity-60 transition-opacity"
        >
          <h2 className="text-[16px] font-bold text-[#191919]">Pedidos</h2>
          <div className="flex items-center gap-0.5 text-[13px] text-[#999999] font-normal">
            <span>Ver tudo</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999999" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1 mt-4 text-center items-start">

          <div
            onClick={() => navigate('/retirada')}
            className="flex flex-col items-center gap-1.5 cursor-pointer active:opacity-60 transition-opacity"
          >
            <div className="w-9 h-9 rounded-[8px] bg-gradient-to-b from-[#FF6B4A] to-[#FF4E27] flex items-center justify-center text-white shadow-xs">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                <circle cx="18" cy="14" r="1" fill="currentColor" />
              </svg>
            </div>
            <span className="text-[11.5px] text-[#222222] font-normal leading-[1.25] text-center px-0.5">
              Retirar
            </span>
          </div>

          <div
            onClick={() => navigate('/recarregar')}
            className="flex flex-col items-center gap-1.5 cursor-pointer active:opacity-60 transition-opacity"
          >
            <div className="w-9 h-9 rounded-[8px] bg-gradient-to-b from-[#FF6B4A] to-[#FF4E27] flex items-center justify-center text-white shadow-xs">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                <path d="m3.3 7 8.7 5 8.7-5" />
                <path d="M12 22V12" />
              </svg>
            </div>
            <span className="text-[11.5px] text-[#222222] font-normal leading-[1.25] text-center">
              Recarregar
            </span>
          </div>

          <div
            onClick={() => navigate('/resgate')}
            className="flex flex-col items-center gap-1.5 cursor-pointer active:opacity-60 transition-opacity"
          >
            <div className="w-9 h-9 rounded-[8px] bg-gradient-to-b from-[#FF6B4A] to-[#FF4E27] flex items-center justify-center text-white shadow-xs">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                <path d="M15 18H9" />
                <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                <circle cx="17" cy="18.5" r="2.5" />
                <circle cx="7" cy="18.5" r="2.5" />
              </svg>
            </div>
            <span className="text-[11.5px] text-[#222222] font-normal leading-[1.25] text-center">
              Resgatar
            </span>
          </div>

          <div
            onClick={() => navigate('/home?postarProva=true')}
            className="flex flex-col items-center gap-1.5 cursor-pointer active:opacity-60 transition-opacity"
          >
            <div className="w-9 h-9 rounded-[8px] bg-gradient-to-b from-[#FF6B4A] to-[#FF4E27] flex items-center justify-center text-white shadow-xs">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="14" x="3" y="5" rx="3" />
                <path d="m8 12 3 3 5-5" />
              </svg>
            </div>
            <span className="text-[11.5px] text-[#222222] font-normal leading-[1.25] text-center">
              Postar Prova
            </span>
          </div>

        </div>

        <div className="border-t border-[#F2F2F2] mt-4 pt-3.5">
          <div
            onClick={() => navigate('/historico-geral')}
            className="flex items-center justify-between cursor-pointer active:opacity-60 transition-opacity"
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border border-[#222222] flex items-center justify-center text-[10px] font-bold text-[#222222] leading-none">
                $
              </div>
              <span className="text-[13.5px] text-[#222222] font-normal">
                Atividade Geral da Conta
              </span>
            </div>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999999" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>

      </div>

      <div className="w-full max-w-[480px] mt-2.5 bg-white divide-y divide-[#F5F5F5]">

        <div
          onClick={() => navigate(hasBank ? '/informacao-bancaria' : '/adicionar-banco')}
          className="flex items-center justify-between py-4 px-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#999999] stroke-[1.8]" />
            <span className="text-[15px] font-normal text-[#222222]">
              Cartão do banco
            </span>
          </div>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999999" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>

        <div
          onClick={() => navigate('/suporte')}
          className="flex items-center justify-between py-4 px-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-[#999999] stroke-[1.8]" />
            <span className="text-[15px] font-normal text-[#222222]">
              Central de ajuda
            </span>
          </div>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999999" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>

        <div
          onClick={() => navigate('/sobre-aliexpress24')}
          className="flex items-center justify-between py-4 px-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#999999] stroke-[1.8]" />
            <span className="text-[15px] font-normal text-[#222222]">
              Sobre AliExpress24
            </span>
          </div>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999999" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>

        <div className="relative flex items-center justify-between py-4 px-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#999999] stroke-[1.8]" />
            <span className="text-[15px] font-normal text-[#222222]">
              {t('settings.language')}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] text-[#888888] font-normal uppercase">
              {language}
            </span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999999" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            title="Selecionar idioma"
            aria-label="Selecionar idioma"
          >
            <option value="pt">Português</option>
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </div>

        <div
          onClick={() => navigate('/alterar-senha')}
          className="flex items-center justify-between py-4 px-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-[#999999] stroke-[1.8]" />
            <span className="text-[15px] font-normal text-[#222222]">
              {t('settings.change_password')}
            </span>
          </div>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999999" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>

      </div>


      <div className="w-full max-w-[480px] pt-2 pb-2">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full h-[40px] rounded-none bg-[#FE384F] hover:bg-[#E02E44] active:scale-[0.99] text-white font-normal text-[13.5px] transition-all shadow-none flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4 stroke-[1.8]" />
          <span>{t('settings.logout') || 'Encerrar Sessão'}</span>
        </button>
      </div>

    </div>
  );
}
