import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Wallet, 
  Gift, 
  Ticket, 
  CreditCard, 
  ShoppingCart, 
  Heart, 
  Building, 
  Clock, 
  PlusCircle, 
  ArrowUpRight,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export const AliUserCard1688: React.FC = () => {
  const navigate = useNavigate();
  const [accountData, setAccountData] = useState({
    saldo_disponivel: 0,
    lucro_acumulado: 0,
    telefone: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAccount() {
      try {
        const { data, error } = await supabase.rpc('get_my_account_data');
        if (!error && data && data.length > 0) {
          setAccountData(data[0]);
        }
      } catch (err) {
        console.error('Erro ao carregar cartão de usuário:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAccount();
  }, []);

  const formatKZ = (val: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      maximumFractionDigits: 0
    }).format(val || 0).replace('AOA', 'Kz');
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-xs border border-gray-100 p-3.5 sm:p-4 flex flex-col font-sans relative overflow-hidden">
      
      {/* Top: Saudação Oficial 1688 */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6A00] to-[#FF2500] flex items-center justify-center text-white font-black italic shadow-xs">
            1888
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-500 font-medium">
              欢迎来到1888 • Bem-vindo ao 1888
            </span>
            <span className="text-[13px] font-extrabold text-gray-900 leading-tight">
              {accountData.telefone ? `+244 ${accountData.telefone}` : '尊贵的1888买家 (Comprador VIP)'}
            </span>
          </div>
        </div>

        <span className="text-[10px] font-bold text-orange-950 bg-amber-300 px-2 py-0.5 rounded-full shadow-2xs">
          VIP GOLD
        </span>
      </div>

      {/* 3 Ativos 1688: 红包 (Bônus), 优惠券 (Cupons), 先采后付 (Crédito) */}
      <div className="grid grid-cols-3 gap-1.5 py-2.5 my-1 bg-[#FAFAFA] rounded-xl border border-gray-100 text-center">
        <div 
          onClick={() => navigate('/convite')}
          className="flex flex-col items-center cursor-pointer hover:text-[#FF5000] transition-colors"
        >
          <div className="flex items-center gap-1 text-[11px] font-bold text-red-500">
            <Gift className="w-3.5 h-3.5" />
            <span>红包 Bônus</span>
          </div>
          <span className="text-[10px] text-gray-400 font-medium mt-0.5">Comissões</span>
        </div>

        <div 
          onClick={() => navigate('/produtos')}
          className="flex flex-col items-center border-x border-gray-200 cursor-pointer hover:text-[#FF5000] transition-colors"
        >
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
            <Ticket className="w-3.5 h-3.5" />
            <span>优惠券 Cupons</span>
          </div>
          <span className="text-[10px] text-gray-400 font-medium mt-0.5">Atacado</span>
        </div>

        <div 
          onClick={() => navigate('/produtos')}
          className="flex flex-col items-center cursor-pointer hover:text-[#FF5000] transition-colors"
        >
          <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600">
            <CreditCard className="w-3.5 h-3.5" />
            <span>先采后付</span>
          </div>
          <span className="text-[10px] text-gray-400 font-medium mt-0.5">Crédito B2B</span>
        </div>
      </div>

      {/* Saldos em Destaque */}
      <div className="py-2.5 px-3 bg-gradient-to-r from-[#FFF5EE] to-[#FFF9F5] border border-orange-200 rounded-xl my-1 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[11px] text-gray-500 font-medium">Saldo Disponível</span>
          <span className="text-[17px] font-black text-[#FF5000] tracking-tight">
            {formatKZ(accountData.saldo_disponivel)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => navigate('/recarregar')}
            className="text-[11.5px] font-bold text-white bg-[#FF5000] hover:bg-[#E03E00] px-3 py-1.5 rounded-lg shadow-2xs transition-all cursor-pointer"
          >
            Recarregar
          </button>
          <button
            type="button"
            onClick={() => navigate('/retirada')}
            className="text-[11.5px] font-bold text-gray-700 hover:text-[#FF5000] bg-white border border-gray-200 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
          >
            Retirar
          </button>
        </div>
      </div>

      {/* 4 Atalhos Rápidos Oficiais 1688 */}
      <div className="grid grid-cols-4 gap-1 pt-2.5 text-center">
        <div 
          onClick={() => navigate('/produtos')}
          className="flex flex-col items-center p-1.5 rounded-lg hover:bg-orange-50/70 transition-colors cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4 text-gray-600 mb-1" />
          <span className="text-[10.5px] font-semibold text-gray-700">采购车</span>
          <span className="text-[9px] text-gray-400">Carrinho</span>
        </div>

        <div 
          onClick={() => navigate('/meus-produtos')}
          className="flex flex-col items-center p-1.5 rounded-lg hover:bg-orange-50/70 transition-colors cursor-pointer"
        >
          <Heart className="w-4 h-4 text-gray-600 mb-1" />
          <span className="text-[10.5px] font-semibold text-gray-700">收藏的品</span>
          <span className="text-[9px] text-gray-400">Favoritos</span>
        </div>

        <div 
          onClick={() => navigate('/produtos')}
          className="flex flex-col items-center p-1.5 rounded-lg hover:bg-orange-50/70 transition-colors cursor-pointer"
        >
          <Building className="w-4 h-4 text-gray-600 mb-1" />
          <span className="text-[10.5px] font-semibold text-gray-700">关注的店</span>
          <span className="text-[9px] text-gray-400">Fábricas</span>
        </div>

        <div 
          onClick={() => navigate('/perfil')}
          className="flex flex-col items-center p-1.5 rounded-lg hover:bg-orange-50/70 transition-colors cursor-pointer"
        >
          <Clock className="w-4 h-4 text-gray-600 mb-1" />
          <span className="text-[10.5px] font-semibold text-gray-700">我的足迹</span>
          <span className="text-[9px] text-gray-400">Histórico</span>
        </div>
      </div>

      {/* Banner de Garantia Oficial */}
      <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-gray-500 text-[11px]">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#FF5000]" /> 1888 官方保障
        </span>
        <button 
          type="button" 
          onClick={() => navigate('/perfil')}
          className="text-[#FF5000] font-bold hover:underline"
        >
          Painel VIP →
        </button>
      </div>

    </div>
  );
};
