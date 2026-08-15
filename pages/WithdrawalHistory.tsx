import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowDownRight, ArrowUpRight, History, Clock } from 'lucide-react';
import { Skeleton } from '../components/Skeleton';

export default function WithdrawalHistory() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // Set default active tab based on query params or window path
  const [activeTab, setActiveTab] = useState<'recarga' | 'retirada'>(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'recarga' || tabParam === 'retirada') return tabParam;
    return window.location.pathname.includes('registro-recarga') ? 'recarga' : 'retirada';
  });

  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [recharges, setRecharges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllData() {
      try {
        setLoading(true);
        
        // Fetch Withdrawals
        const { data: withdrawData, error: withdrawError } = await supabase.rpc('get_my_withdrawals_mcpn');
        if (withdrawError) throw withdrawError;
        if (withdrawData) setWithdrawals(withdrawData);
        
        // Fetch Standard Bank Recharges
        const { data: rechargeData, error: rechargeError } = await supabase
          .from('recargas_mcpn')
          .select('*');
        if (rechargeError) throw rechargeError;

        // Fetch USDT Recharges
        const { data: usdtData, error: usdtError } = await supabase
          .from('recharges_usdt_mcpn')
          .select('*');
        if (usdtError) throw usdtError;

        // Unify and sort recharges
        const unifiedRecharges = [
          ...(rechargeData || []).map((item: any) => ({ ...item, isUsdt: false })),
          ...(usdtData || []).map((item: any) => ({ ...item, isUsdt: true }))
        ];
        
        // Sort recharges by date descending
        unifiedRecharges.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setRecharges(unifiedRecharges);
        
      } catch (err: any) {
        console.error('Erro ao buscar históricos:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAllData();
  }, []);

  const formatFullDateWithSeconds = (dateStr: string | Date) => {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return date.toLocaleString('pt-AO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getApprovalDate = (createdAtStr: string) => {
    const date = new Date(createdAtStr);
    // Add 1 hour and 15 minutes to simulate bank validation delay
    date.setHours(date.getHours() + 1);
    date.setMinutes(date.getMinutes() + 15);
    return formatFullDateWithSeconds(date);
  };

  const getWithdrawStatusStyle = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'text-[#e1a32a] bg-amber-50 border border-amber-100';
      case 'aprovado':
        return 'text-[#C62828] bg-red-50 border border-red-100';
      default:
        return 'text-[#e81123] bg-red-50 border border-red-100';
    }
  };

  const getRechargeStatusStyle = (status: string) => {
    switch (status) {
      case 'completo':
        return 'text-[#C62828] bg-red-50 border border-red-100';
      case 'rejeitado':
        return 'text-[#e81123] bg-red-50 border border-red-100';
      case 'recarregando':
      default:
        return 'text-[#0067b8] bg-blue-50 border border-blue-100';
    }
  };

  const currentList = activeTab === 'recarga' ? recharges : withdrawals;

  return (
    <div className="min-h-screen bg-white pb-24 flex flex-col items-center">
      {/* Header Minimalist Premium Flat */}
      <header className="w-full px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-50 border-b border-gray-50">
        <button 
          onClick={() => navigate('/perfil')} 
          className="w-10 h-10 flex items-center justify-start text-[#333333] active:opacity-50 transition-opacity text-2xl font-light"
          title="Voltar"
        >
          ‹
        </button>
        <h1 className="text-[16px] font-medium text-[#333333] absolute left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
          {t('history.general_title')}
        </h1>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <main className="w-full max-w-[400px] px-6 py-6">
        {/* Beautiful Premium Pill Switcher */}
        <div className="flex w-full bg-[#F5F5F5] rounded-[25px] p-1 mb-8">
          <button
            onClick={() => setActiveTab('recarga')}
            className={cn(
              "flex-1 py-2.5 text-[13px] font-medium rounded-[20px] transition-all text-center outline-none",
              activeTab === 'recarga' 
                ? "bg-white text-[#1A237E] shadow-sm font-semibold" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {t('history.filter_recharge')}
          </button>
          <button
            onClick={() => setActiveTab('retirada')}
            className={cn(
              "flex-1 py-2.5 text-[13px] font-medium rounded-[20px] transition-all text-center outline-none",
              activeTab === 'retirada' 
                ? "bg-white text-[#1A237E] shadow-sm font-semibold" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {t('history.filter_withdraw')}
          </button>
        </div>

        {/* List Content */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#F9F9F9] border border-gray-100/80 rounded-[12px] p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="w-24 h-3.5" />
                      <Skeleton className="w-28 h-2.5" />
                    </div>
                  </div>
                  <Skeleton className="w-14 h-4 rounded-md" />
                </div>
                <div className="pt-2 border-t border-gray-200/40 flex justify-between items-center">
                  <Skeleton className="w-20 h-3" />
                  <Skeleton className="w-24 h-4" />
                </div>
              </div>
            ))}
          </div>
        ) : currentList.length === 0 ? (
          <div className="bg-[#F9F9F9] rounded-[20px] p-16 text-center border border-gray-100 flex flex-col items-center">
             <History size={40} className="text-gray-300 mb-3" />
             <p className="text-[12px] text-gray-400 font-light tracking-wider">
               {activeTab === 'recarga' ? t('history.empty_recharge') : t('history.empty_withdraw')}
             </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {currentList.map((item, idx) => {
                if (activeTab === 'recarga') {
                  // Render Recharge Card (Unified Bank and USDT)
                  return (
                    <motion.div
                      key={`recharge-${item.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="bg-[#F9F9F9] border border-gray-100/80 rounded-[20px] p-5 space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center border",
                            item.isUsdt 
                              ? "bg-blue-50 border-blue-100 text-[#0067b8]"
                              : "bg-red-50 border-red-100 text-[#C62828]"
                          )}>
                            <ArrowUpRight size={18} />
                          </div>
                          <div>
                            <p className="text-[14px] font-semibold text-[#333333] leading-tight">
                              {item.isUsdt ? 'Play Usdt' : 'Play bancário'}
                            </p>
                            <p className="text-[10px] text-gray-400 font-light mt-0.5">
                              Solicitado em: {formatFullDateWithSeconds(item.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className={cn(
                          "px-2 py-0.5 rounded-[4px] text-[9px] font-semibold tracking-wider",
                          getRechargeStatusStyle(item.status)
                        )}>
                          {item.status}
                        </div>
                      </div>

                      <div className="space-y-2 py-3 border-y border-gray-200/40 text-[12px]">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-light">{t('history.recharge_amount')}</span>
                          <span className={cn(
                            "font-semibold",
                            item.isUsdt ? "text-[#0067b8]" : "text-[#C62828]"
                          )}>
                            {item.isUsdt 
                              ? `+${Number(item.valor_usdt).toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT`
                              : `+${Number(item.valor).toLocaleString(undefined, { minimumFractionDigits: 2 })} Kz`
                            }
                          </span>
                        </div>
                        {!item.isUsdt && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 font-light">{t('history.origin_bank')}</span>
                            <span className="font-normal text-gray-600">
                              {item.banco_origem || 'Depósito Bancário'}
                            </span>
                          </div>
                        )}
                        {item.isUsdt && item.tx_hash && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 font-light">Tx Hash</span>
                            <span className="font-normal text-gray-500 truncate max-w-[180px]" title={item.tx_hash}>
                              {item.tx_hash}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-gray-400 font-light">
                        <span className="flex items-center">
                          <Clock size={11} className="mr-1 text-gray-400" />
                          {t('history.validation_time')}
                        </span>
                        <span className="truncate max-w-[150px]">ID: {item.id.toString().toUpperCase()}</span>
                      </div>
                    </motion.div>
                  );
                } else {
                  // Render Withdrawal Card
                  return (
                    <motion.div
                      key={`withdraw-${item.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="bg-[#F9F9F9] border border-gray-100/80 rounded-[20px] p-5 space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 bg-red-50 rounded-full flex items-center justify-center border border-red-100">
                            <ArrowDownRight size={18} className="text-[#e81123]" />
                          </div>
                          <div>
                            <p className="text-[14px] font-semibold text-[#333333] leading-tight">
                              {(item.banco_destino || 'Banco').split(' - ')[0]}
                            </p>
                            <p className="text-[10px] text-gray-400 font-light mt-0.5">
                              Solicitado em: {formatFullDateWithSeconds(item.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className={cn(
                          "px-2 py-0.5 rounded-[4px] text-[9px] font-semibold tracking-wider",
                          getWithdrawStatusStyle(item.status)
                        )}>
                          {item.status}
                        </div>
                      </div>

                      <div className="space-y-2 py-3 border-y border-gray-200/40 text-[12px]">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-light">{t('history.net_value')}</span>
                          <span className="font-semibold text-[#e81123]">
                            {Number(item.valor_liquido).toLocaleString(undefined, { minimumFractionDigits: 2 })} Kz
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-light">{t('history.tax_applied')}</span>
                          <span className="font-normal text-gray-500">
                            {Number(item.taxa_14).toLocaleString(undefined, { minimumFractionDigits: 2 })} Kz
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-light">{t('history.dest_iban')}</span>
                          <span className="font-normal text-gray-600 tracking-tight">
                            {item.iban_snapshot || t('common.not_informed')}
                          </span>
                        </div>
                        {item.status === 'aprovado' && (
                          <div className="flex justify-between items-center pt-1 border-t border-dashed border-gray-200/50">
                            <span className="text-gray-400 font-light">{t('history.approval_date')}</span>
                            <span className="font-medium text-[#C62828]">
                              {getApprovalDate(item.created_at)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-gray-400 font-light">
                        <span>{t('history.beneficiary')}: {item.nome_beneficiario || 'N/A'}</span>
                        <span className="truncate max-w-[150px]">ID: {item.id.toString().toUpperCase()}</span>
                      </div>
                    </motion.div>
                  );
                }
              })}
            </AnimatePresence>

            {/* End of list indicator */}
            <div className="text-center pt-8 pb-4 text-[12px] font-medium tracking-wide">
              <span className="bg-gradient-to-r from-[#C62828] to-[#1A237E] bg-clip-text text-transparent opacity-80">
                ~ {t('settings.no_more_data')} ~
              </span>
            </div>
          </div>
        )}
      </main>

    </div>
  );
}
