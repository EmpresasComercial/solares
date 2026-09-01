import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../components/Toast';
import { formatCurrency, CurrencyType } from '../../lib/currency';
import { supabase } from '../../lib/supabase';
import { 
  LogOut, 
  Key, 
  Globe, 
  CreditCard, 
  Headphones, 
  HelpCircle, 
  Bell, 
  Building2, 
  ShieldCheck, 
  Wallet, 
  PlusCircle, 
  Gift, 
  Camera, 
  ChevronRight, 
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { subscribeToPushNotifications, sendLocalTestNotification } from '../../lib/pushNotifications';

function ProfileSkeleton() {
  return (
    <div className="w-full min-h-screen bg-[#F5F6F8] pb-24 font-sans antialiased select-none flex flex-col items-center px-3.5 pt-3.5">
      <div className="w-full max-w-[480px] bg-white rounded-2xl p-4 space-y-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
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
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );

  const handleEnableNotifications = async () => {
    const result = await subscribeToPushNotifications();
    if (result.success) {
      setNotifPermission('granted');
      await sendLocalTestNotification(
        '1888 Atacado',
        'Notificações ativadas! Você receberá alertas sobre depósitos e rendimentos de fábrica.',
        '/perfil'
      );
      showToast('Notificações ativadas com sucesso!', 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

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

  if (loading) return <ProfileSkeleton />;

  return (
    <div className="w-full min-h-screen bg-[#F5F6F8] pb-24 font-sans antialiased text-[#191919] select-none flex flex-col items-center px-3.5 pt-3.5">
      
      {/* BLOCO 1: Cabeçalho 1888 VIP & Saldos */}
      <div className="w-full max-w-[480px] bg-gradient-to-br from-[#FF6A00] via-[#FF5000] to-[#FF2500] rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xs border-2 border-white/40 flex items-center justify-center text-white font-black text-[18px] italic shadow-xs">
                1888
              </div>

              <div className="flex flex-col justify-center leading-tight">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-[17px] font-bold text-white tracking-tight">
                    {accountData.telefone ? `+244 ${accountData.telefone.slice(0, 3)} ${accountData.telefone.slice(3)}` : '+244 943 142132'}
                  </h1>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[11px] font-bold text-orange-950 bg-amber-300 px-2 py-0.2 rounded-full shadow-2xs">
                    VIP PARCEIRO
                  </span>
                  <span className="text-[11px] text-white/80 font-mono">
                    ID: {userId || (accountData.telefone ? accountData.telefone.slice(-5) : '1888')}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/sobre-aliexpress24')}
              className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 transition-colors"
              title="Sobre o 1888"
            >
              <HelpCircle className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Grid de Saldos em Cartão Branco Semi-Transparente */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/20 text-center">
            <div
              onClick={() => navigate('/retirada')}
              className="flex flex-col items-center cursor-pointer active:opacity-75 transition-opacity"
            >
              <span className="text-[11.5px] text-white/80 font-medium">Saldo Disponível</span>
              <span className="text-[14px] text-white font-black mt-0.5">
                {formatCurrency(accountData.saldo_disponivel || 0, currency)}
              </span>
            </div>

            <div
              onClick={() => navigate('/recarregar')}
              className="flex flex-col items-center cursor-pointer active:opacity-75 transition-opacity border-x border-white/20"
            >
              <span className="text-[11.5px] text-white/80 font-medium">Total Recargas</span>
              <span className="text-[14px] text-white font-black mt-0.5">
                {formatCurrency(accountData.total_recarregado || 0, currency)}
              </span>
            </div>

            <div
              onClick={() => navigate('/registro-retirada')}
              className="flex flex-col items-center cursor-pointer active:opacity-75 transition-opacity"
            >
              <span className="text-[11.5px] text-white/80 font-medium">Total Sacado</span>
              <span className="text-[14px] text-white font-black mt-0.5">
                {formatCurrency(accountData.total_retirado || 0, currency)}
              </span>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-xl" />
      </div>

      {/* BLOCO 2: Painel de Ações Rápidas */}
      <div className="w-full max-w-[480px] mt-3 bg-white rounded-2xl p-4 shadow-2xs border border-gray-100 space-y-3">
        <div
          onClick={() => navigate('/minhas-compras')}
          className="flex items-center justify-between cursor-pointer active:opacity-60 transition-opacity pb-2 border-b border-gray-100"
        >
          <div className="flex items-center gap-2">
            <Building2 className="w-4.5 h-4.5 text-[#FF5000]" />
            <h2 className="text-[15px] font-bold text-gray-900">Meus Lotes & Encomendas</h2>
          </div>
          <div className="flex items-center gap-1 text-[12px] text-[#FF5000] font-bold">
            <span>Ver todos</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center items-start pt-1">
          <button
            type="button"
            onClick={() => navigate('/retirada')}
            className="flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-xs">
              <Wallet className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11.5px] text-gray-800 font-semibold">
              Retirar
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/recarregar')}
            className="flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white shadow-xs">
              <PlusCircle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11.5px] text-gray-800 font-semibold">
              Recarregar
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/resgate')}
            className="flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Gift className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11.5px] text-gray-800 font-semibold">
              Cupons
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/home?postarProva=true')}
            className="flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xs">
              <Camera className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[11.5px] text-gray-800 font-semibold">
              Provas
            </span>
          </button>
        </div>

        {/* Atividade Geral */}
        <div className="border-t border-gray-100 pt-3">
          <div
            onClick={() => navigate('/historico-geral')}
            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <TrendingUp className="w-4.5 h-4.5 text-[#FF5000]" />
              <span className="text-[13.5px] text-gray-800 font-medium">
                Extrato Financeiro & Atividades
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* BLOCO 3: Menu de Configurações */}
      <div className="w-full max-w-[480px] mt-3 bg-white rounded-2xl shadow-2xs border border-gray-100 divide-y divide-gray-100 overflow-hidden">
        <div
          onClick={() => navigate(hasBank ? '/informacao-bancaria' : '/adicionar-banco')}
          className="flex items-center justify-between py-3.5 px-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <CreditCard className="w-4.5 h-4.5 text-gray-500" />
            <span className="text-[14px] font-medium text-gray-800">
              Conta Bancária (IBAN)
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>

        <div
          onClick={() => navigate('/suporte')}
          className="flex items-center justify-between py-3.5 px-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Headphones className="w-4.5 h-4.5 text-gray-500" />
            <span className="text-[14px] font-medium text-gray-800">
              Central de Atendimento Oficial
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>

        <div
          onClick={() => navigate('/sobre-aliexpress24')}
          className="flex items-center justify-between py-3.5 px-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Building2 className="w-4.5 h-4.5 text-gray-500" />
            <span className="text-[14px] font-medium text-gray-800">
              Sobre a Plataforma 1888
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>

        <div className="relative flex items-center justify-between py-3.5 px-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <Globe className="w-4.5 h-4.5 text-gray-500" />
            <span className="text-[14px] font-medium text-gray-800">
              {t('settings.language')}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-gray-500 font-bold uppercase">
              {language}
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
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
          className="flex items-center justify-between py-3.5 px-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Key className="w-4.5 h-4.5 text-gray-500" />
            <span className="text-[14px] font-medium text-gray-800">
              {t('settings.change_password')}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>

        <div
          onClick={notifPermission !== 'granted' ? handleEnableNotifications : undefined}
          className={`flex items-center justify-between py-3.5 px-4 transition-colors ${
            notifPermission === 'granted'
              ? 'opacity-60 cursor-default'
              : 'hover:bg-gray-50 active:bg-gray-100 cursor-pointer'
          }`}
        >
          <div className="flex items-center gap-3">
            <Bell className="w-4.5 h-4.5 text-gray-500" />
            <span className="text-[14px] font-medium text-gray-800">
              Notificações Push
            </span>
          </div>
          <span className={`text-[11.5px] font-bold px-2 py-0.5 rounded-full ${
            notifPermission === 'granted'
              ? 'bg-green-100 text-green-700'
              : notifPermission === 'denied'
              ? 'bg-red-100 text-[#FF5000]'
              : 'bg-orange-100 text-orange-700'
          }`}>
            {notifPermission === 'granted' ? 'Ativo' : notifPermission === 'denied' ? 'Bloqueado' : 'Ativar'}
          </span>
        </div>
      </div>

      {/* BOTÃO LOGOUT */}
      <div className="w-full max-w-[480px] pt-4 pb-2">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full h-[44px] rounded-xl bg-white border border-gray-200 hover:border-red-300 hover:text-red-600 active:scale-[0.99] text-gray-700 font-bold text-[13.5px] transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4 stroke-[2]" />
          <span>{t('settings.logout') || 'Encerrar Sessão'}</span>
        </button>
      </div>

    </div>
  );
}
