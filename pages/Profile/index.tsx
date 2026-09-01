import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../components/Toast';
import { formatCurrency, CurrencyType } from '../../lib/currency';
import { supabase } from '../../lib/supabase';
import { 
  CreditCard,
  Package,
  Truck,
  MessageSquare,
  FileText,
  Gift,
  Award,
  DollarSign,
  Zap,
  MapPin,
  HelpCircle,
  LogOut,
  Users,
  Edit2,
  ChevronRight
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

  const userPhone = accountData.telefone
    ? `+244 ${accountData.telefone}`
    : '请完善您的身份';

  return (
    <div className="w-full min-h-screen bg-[#F7F8FA] pb-24 font-sans text-[#111111] select-none flex flex-col items-center">
      
      {/* ── 1. TOPO: AVATAR + MINHA ASSINATURA VIP ── */}
      <div className="w-full max-w-[480px] px-4 pt-5 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Avatar com imagem real */}
          <div className="w-12 h-12 border-2 border-white overflow-hidden shrink-0" style={{borderRadius:0}}>
            <img
              src="/avatar.jpg"
              alt="Avatar"
              className="w-full h-full object-cover"
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                t.style.display = 'none';
                t.parentElement!.innerHTML = '<span class="w-full h-full flex items-center justify-center text-xl bg-orange-100">🐮</span>';
              }}
            />
          </div>
          
          {/* Badge dourada 我的会员权益 */}
          <button
            type="button"
            onClick={() => navigate('/produtos')}
            className="bg-[#EAD0A8] text-[#7A4B1A] text-[11px] font-bold px-2.5 py-1 cursor-pointer hover:opacity-90"
          >
            我的会员权益
          </button>
        </div>
      </div>

      {/* ── 2. CARD DO USUÁRIO (请完善您的身份 / Saldo) ── */}
      <div className="w-full max-w-[480px] px-3.5 mt-1">
        <div className="bg-white border border-gray-200/80 p-3.5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] font-bold text-gray-900">
                {userPhone}
              </span>
              <Edit2 className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
              <span className="bg-[#2E3341] text-[#E0B880] text-[9.5px] font-bold px-1.5 py-0.2">
                买家
              </span>
            </div>
            
            <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">
              <MapPin className="w-3 h-3 text-gray-400" />
              <span>杭州滨江区 • Luanda (ID: {userId || '1888'})</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[17px] font-black text-gray-900 block leading-tight">
              {Number(accountData.saldo_disponivel || 0).toFixed(2)}
            </span>
            <span className="text-[10px] text-gray-400">总红包金额 (Kz)</span>
          </div>
        </div>
      </div>

      {/* ── 3. BANNER DE BENEFÍCIOS (开通月卡解锁超级权益) ── */}
      <div className="w-full max-w-[480px] px-3.5 mt-2.5">
        <div 
          onClick={() => navigate('/produtos')}
          className="bg-[#FFF4EA] border border-[#FFD8B8] px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-[#FFEBD9] transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <span className="bg-[#FF5000] text-white text-[9.5px] font-bold px-1.5 py-0.2">
              月卡
            </span>
            <span className="text-[12px] font-bold text-gray-800">
              开通月卡解锁超级权益 &gt;
            </span>
          </div>

          <div className="flex items-center gap-1 text-[#FF5000] font-bold text-[12px]">
            <span>开通领188元红包</span>
            <span className="text-[15px]">🧧</span>
          </div>
        </div>
      </div>

      {/* ── 4. SEÇÃO: 常用工具 (Ferramentas Úteis - Grid Flat Oficial) ── */}
      <div className="w-full max-w-[480px] px-3.5 mt-3">
        <div className="bg-white border border-gray-200/80 p-4">
          <h2 className="text-[14px] font-bold text-gray-900 mb-4">常用工具</h2>

          {/* Grid de 4 Colunas Idêntico à Foto */}
          <div className="grid grid-cols-4 gap-y-4 gap-x-2 text-center">
            
            {/* 1. 免费赊账 (Recarregar) */}
            <button
              type="button"
              onClick={() => navigate('/recarregar')}
              className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80"
            >
              <div className="w-10 h-10 bg-[#FF5000] text-white flex items-center justify-center">
                <span className="text-[18px]">💳</span>
              </div>
              <span className="text-[11.5px] text-gray-800 font-medium">免费赊账</span>
              <span className="text-[9.5px] text-gray-400 -mt-1">Recarregar</span>
            </button>

            {/* 2. 我的展会 (Convites) */}
            <button
              type="button"
              onClick={() => navigate('/convite')}
              className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80"
            >
              <div className="w-10 h-10 bg-[#FF6A00] text-white flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-[11.5px] text-gray-800 font-medium">我的展会</span>
              <span className="text-[9.5px] text-gray-400 -mt-1">Convites</span>
            </button>

            {/* 3. 我的红包 (Resgatar) */}
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

            {/* 4. 新人特权 (Privilégios) */}
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

            {/* 5. 我的优惠 (Descontos) */}
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

            {/* 6. 累计返利 (Retirar Saldo) */}
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

            {/* 7. 免息大派送 (Extrato) */}
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

            {/* 8. 支付工具 (Conta Bancária) */}
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

            {/* 9. 收货地址 (Suporte) */}
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
      </div>

      {/* ── 5. CARD RESUMO DE SALDOS (可用余额 · Saldo | 充值总额 · Recargas | 累计提现 · Sacado) ── */}
      <div className="w-full max-w-[480px] px-3.5 mt-3">
        <div className="bg-white border border-gray-200/80 p-3 grid grid-cols-3 gap-2 text-center">
          <div onClick={() => navigate('/retirada')} className="cursor-pointer">
            <span className="text-[11px] text-gray-400 block">可用余额 · Saldo</span>
            <span className="text-[13.5px] font-black text-gray-900 mt-0.5 block">
              {formatCurrency(accountData.saldo_disponivel || 0, currency)}
            </span>
          </div>
          <div onClick={() => navigate('/recarregar')} className="cursor-pointer border-x border-gray-100">
            <span className="text-[11px] text-gray-400 block">充值总额 · Recargas</span>
            <span className="text-[13.5px] font-black text-[#FF5000] mt-0.5 block">
              {formatCurrency(accountData.total_recarregado || 0, currency)}
            </span>
          </div>
          <div onClick={() => navigate('/registro-retirada')} className="cursor-pointer">
            <span className="text-[11px] text-gray-400 block">累计提现 · Sacado</span>
            <span className="text-[13.5px] font-black text-gray-900 mt-0.5 block">
              {formatCurrency(accountData.total_retirado || 0, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* ── 6. BOTÃO DE LOGOUT ([-> 退出登录 · Encerrar Sessão) ── */}
      <div className="w-full max-w-[480px] px-3.5 mt-3">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full h-[42px] bg-white border border-gray-300 hover:border-red-400 hover:text-red-600 text-gray-700 font-bold text-[13px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-gray-500" />
          <span>[→ 退出登录 · Encerrar Sessão</span>
        </button>
      </div>

    </div>
  );
}
