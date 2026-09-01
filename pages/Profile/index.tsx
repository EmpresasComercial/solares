import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../components/Toast';
import { formatCurrency, CurrencyType } from '../../lib/currency';
import { supabase } from '../../lib/supabase';
import { 
  ChevronRight,
  CreditCard,
  Package,
  Truck,
  MessageSquare,
  BadgePercent,
  FileText,
  Gift,
  Award,
  DollarSign,
  Zap,
  MapPin,
  HelpCircle,
  LogOut,
  Users
} from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { showToast } = useToast();
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const userDisplayName = accountData.telefone
    ? `+244 ${accountData.telefone}`
    : '立即登录 · Entrar';

  return (
    <div className="w-full min-h-screen bg-[#FFFFFF] pb-24 font-sans text-[#111111] select-none flex flex-col items-center">
      
      {/* ── 1. TOPO OFICIAL 1688 (Background Escuro Corporativo com Avatar e Login/ID) ── */}
      <div className="w-full max-w-[480px] bg-[#2E3341] px-4 pt-6 pb-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar com ícone boi/touro da 1688 */}
          <div className="w-14 h-14 bg-white flex items-center justify-center text-gray-400 font-bold overflow-hidden">
            <svg viewBox="0 0 24 24" className="w-10 h-10 fill-gray-300">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="text-[15px] font-bold text-white border border-white/40 px-3 py-0.5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                {userDisplayName}
              </button>
            </div>

            {/* Badge de Bônus 1688 */}
            <div className="flex items-center gap-1 text-[11px] text-white/90">
              <span className="bg-[#FF5000] text-white text-[9px] font-bold px-1 py-0.2">
                🎁
              </span>
              <span>快来登陆 新人领100元红包 (Bônus de Boas-vindas)</span>
            </div>
          </div>
        </div>

        <div className="text-right text-[11px] text-gray-300 font-mono">
          {userId && <span>ID: {userId}</span>}
        </div>
      </div>

      {/* ── 2. SEÇÃO: 我的订单 (Meus Pedidos) ── */}
      <div className="w-full max-w-[480px] bg-white border-b border-gray-100 p-4">
        <div 
          onClick={() => navigate('/minhas-compras')}
          className="flex items-center justify-between cursor-pointer mb-3.5"
        >
          <span className="text-[14px] font-bold text-gray-900">我的订单 · Meus Pedidos</span>
          <div className="flex items-center text-[12px] text-gray-400 hover:text-[#FF5000]">
            <span>全部 · Todos</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Grid de 5 Ícones Oficiais 1688 */}
        <div className="grid grid-cols-5 gap-1 text-center">
          
          <button 
            type="button"
            onClick={() => navigate('/recarregar')}
            className="flex flex-col items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 flex items-center justify-center text-[#FF5000]">
              <CreditCard className="w-6 h-6 stroke-[1.8]" />
            </div>
            <span className="text-[11.5px] text-gray-700">待付款</span>
            <span className="text-[9px] text-gray-400 -mt-1">Pendente</span>
          </button>

          <button 
            type="button"
            onClick={() => navigate('/minhas-compras')}
            className="flex flex-col items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 flex items-center justify-center text-[#FF5000]">
              <Package className="w-6 h-6 stroke-[1.8]" />
            </div>
            <span className="text-[11.5px] text-gray-700">待发货</span>
            <span className="text-[9px] text-gray-400 -mt-1">Envio</span>
          </button>

          <button 
            type="button"
            onClick={() => navigate('/minhas-compras')}
            className="flex flex-col items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 flex items-center justify-center text-[#FF5000]">
              <Truck className="w-6 h-6 stroke-[1.8]" />
            </div>
            <span className="text-[11.5px] text-gray-700">待收货</span>
            <span className="text-[9px] text-gray-400 -mt-1">A caminho</span>
          </button>

          <button 
            type="button"
            onClick={() => navigate('/home?postarProva=true')}
            className="flex flex-col items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 flex items-center justify-center text-[#FF5000]">
              <MessageSquare className="w-6 h-6 stroke-[1.8]" />
            </div>
            <span className="text-[11.5px] text-gray-700">待评价</span>
            <span className="text-[9px] text-gray-400 -mt-1">Avaliações</span>
          </button>

          <button 
            type="button"
            onClick={() => navigate('/suporte')}
            className="flex flex-col items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 flex items-center justify-center text-[#FF5000]">
              <span className="font-bold text-[18px]">¥</span>
            </div>
            <span className="text-[11.5px] text-gray-700">退款中</span>
            <span className="text-[9px] text-gray-400 -mt-1">Reembolsos</span>
          </button>

        </div>
      </div>

      {/* ── 3. SEÇÃO: 常用工具 (Ferramentas Úteis 1688) ── */}
      <div className="w-full max-w-[480px] bg-white border-b border-gray-100 p-4">
        <h2 className="text-[14px] font-bold text-gray-900 mb-4">常用工具 · Ferramentas Úteis</h2>

        {/* Grid Oficial Flat com Ícones Coloridos 1688 */}
        <div className="grid grid-cols-4 gap-y-4 gap-x-2 text-center">
          
          {/* 1. 免费赊账 (Crédito / Recarga) */}
          <button
            type="button"
            onClick={() => navigate('/recarregar')}
            className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80"
          >
            <div className="w-10 h-10 bg-[#FF5000] text-white flex items-center justify-center">
              <span className="text-[18px]">✉️</span>
            </div>
            <span className="text-[11.5px] text-gray-800 font-medium">免费赊账</span>
            <span className="text-[9.5px] text-gray-400 -mt-1">Recarregar</span>
          </button>

          {/* 2. 我的展会 (Minhas Feiras / Convites) */}
          <button
            type="button"
            onClick={() => navigate('/convite')}
            className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80"
          >
            <div className="w-10 h-10 bg-[#FF6A00] text-white flex items-center justify-center font-black text-[16px]">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-[11.5px] text-gray-800 font-medium">我的展会</span>
            <span className="text-[9.5px] text-gray-400 -mt-1">Convites</span>
          </button>

          {/* 3. 我的红包 (Meus Bônus / Cupons) */}
          <button
            type="button"
            onClick={() => navigate('/resgate')}
            className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80"
          >
            <div className="w-10 h-10 bg-[#FE2B2B] text-white flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <span className="text-[11.5px] text-gray-800 font-medium">我的红包</span>
            <span className="text-[9.5px] text-gray-400 -mt-1">Resgatar</span>
          </button>

          {/* 4. 新人特权 (Privilégios Novos Membros) */}
          <button
            type="button"
            onClick={() => navigate('/produtos')}
            className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80"
          >
            <div className="w-10 h-10 bg-[#FFB800] text-white flex items-center justify-center font-black text-[15px]">
              新
            </div>
            <span className="text-[11.5px] text-gray-800 font-medium">新人特权</span>
            <span className="text-[9.5px] text-gray-400 -mt-1">Privilégios</span>
          </button>

          {/* 5. 我的优惠 (Meus Descontos) */}
          <button
            type="button"
            onClick={() => navigate('/produtos')}
            className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80"
          >
            <div className="w-10 h-10 bg-[#FF4444] text-white flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-[11.5px] text-gray-800 font-medium">我的优惠</span>
            <span className="text-[9.5px] text-gray-400 -mt-1">Descontos</span>
          </button>

          {/* 6. 累计返利 (Lucro Acumulado / Retirada) */}
          <button
            type="button"
            onClick={() => navigate('/retirada')}
            className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80"
          >
            <div className="w-10 h-10 bg-[#FFA800] text-white flex items-center justify-center font-bold text-[18px]">
              ¥
            </div>
            <span className="text-[11.5px] text-gray-800 font-medium">累计返利</span>
            <span className="text-[9.5px] text-gray-400 -mt-1">Retirar Saldo</span>
          </button>

          {/* 7. 免息大派送 (Bônus Sem Juros / Histórico) */}
          <button
            type="button"
            onClick={() => navigate('/historico-geral')}
            className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80"
          >
            <div className="w-10 h-10 bg-[#00C4B4] text-white flex items-center justify-center font-black text-[14px]">
              %
            </div>
            <span className="text-[11.5px] text-gray-800 font-medium">免息大派送</span>
            <span className="text-[9.5px] text-gray-400 -mt-1">Extrato</span>
          </button>

          {/* 8. 支付工具 (Métodos de Pagamento / IBAN) */}
          <button
            type="button"
            onClick={() => navigate(hasBank ? '/informacao-bancaria' : '/adicionar-banco')}
            className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80"
          >
            <div className="w-10 h-10 bg-[#FFA800] text-white flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <span className="text-[11.5px] text-gray-800 font-medium">支付工具</span>
            <span className="text-[9.5px] text-gray-400 -mt-1">Conta Bancária</span>
          </button>

          {/* 9. 收货地址 (Endereço / Suporte) */}
          <button
            type="button"
            onClick={() => navigate('/suporte')}
            className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80"
          >
            <div className="w-10 h-10 bg-[#00B480] text-white flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-[11.5px] text-gray-800 font-medium">收货地址</span>
            <span className="text-[9.5px] text-gray-400 -mt-1">Suporte</span>
          </button>

        </div>
      </div>

      {/* ── 4. RESUMO DE SALDOS E CRÉDITOS ── */}
      <div className="w-full max-w-[480px] bg-white border-b border-gray-100 p-4">
        <div className="border border-gray-200 p-3 grid grid-cols-3 gap-2 text-center">
          <div onClick={() => navigate('/retirada')} className="cursor-pointer">
            <span className="text-[11px] text-gray-400 block">可用余额 · Saldo</span>
            <span className="text-[14px] font-bold text-gray-900">
              {formatCurrency(accountData.saldo_disponivel || 0, currency)}
            </span>
          </div>
          <div onClick={() => navigate('/recarregar')} className="cursor-pointer border-x border-gray-100">
            <span className="text-[11px] text-gray-400 block">充值总额 · Recargas</span>
            <span className="text-[14px] font-bold text-[#FF5000]">
              {formatCurrency(accountData.total_recarregado || 0, currency)}
            </span>
          </div>
          <div onClick={() => navigate('/registro-retirada')} className="cursor-pointer">
            <span className="text-[11px] text-gray-400 block">累计提现 · Sacado</span>
            <span className="text-[14px] font-bold text-gray-900">
              {formatCurrency(accountData.total_retirado || 0, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* ── 5. BOTÃO LOGOUT ── */}
      <div className="w-full max-w-[480px] p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full h-[44px] bg-white border border-gray-300 hover:border-red-400 hover:text-red-600 text-gray-700 font-bold text-[13px] transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>退出登录 · Encerrar Sessão</span>
        </button>
      </div>

    </div>
  );
}
