import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { PlusCircle, MinusCircle, TrendingUp, Users, Ticket, History, Filter, ArrowUpRight, ArrowDownRight, Award } from 'lucide-react';

type HistoryType = 'recargas' | 'retiradas' | 'renda_diaria' | 'bonus_equipe' | 'cupom' | '';

interface HistoryItem {
  id: string;
  type: HistoryType;
  amount: number;
  date: string;
  description: string;
  status: 'completed' | 'pending' | 'failed' | 'confirmado' | 'pendente' | 'rejeitado';
}

export default function GeneralHistory() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [filter, setFilter] = useState<HistoryType>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_general_history_mcpn');

        if (error) throw error;

        if (data) {
          const mapped: HistoryItem[] = data.map((item: any) => ({
            id: item.id,
            type: item.type as any,
            amount: Number(item.amount),
            date: new Date(item.created_at).toLocaleString('pt-AO', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            }),
            description: item.description,
            status: item.status as any
          }));
          setHistory(mapped);
        }
      } catch (err: any) {
        showToast('Falha, recarregue a pagina', 'error');
        console.error('Erro:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const filteredData = history.filter(item => !filter || item.type === filter);

  const getIcon = (type: HistoryType) => {
    switch (type) {
      case 'recargas': return <ArrowUpRight size={18} />;
      case 'retiradas': return <ArrowDownRight size={18} />;
      case 'renda_diaria': return <TrendingUp size={18} />;
      case 'bonus_equipe': return <Users size={18} />;
      case 'cupom': return <Ticket size={18} />;
      default: return <History size={18} />;
    }
  };

  const getIconContainerStyle = (type: HistoryType) => {
    if (type === 'retiradas') return 'bg-red-50 border-red-100 text-[#e81123]';
    if (type === 'recargas') return 'bg-red-50 border-red-100 text-[#C62828]';
    if (type === 'renda_diaria') return 'bg-blue-50 border-blue-100 text-[#0067b8]';
    if (type === 'bonus_equipe') return 'bg-indigo-50 border-indigo-100 text-[#3f51b5]';
    return 'bg-purple-50 border-purple-100 text-[#9c27b0]';
  };

  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'aprovado' || s === 'confirmado' || s === 'completed' || s === 'completo') return 'text-[#C62828] bg-red-50 border border-red-100';
    if (s === 'pendente' || s === 'pending') return 'text-[#e1a32a] bg-yellow-50 border border-yellow-100';
    if (s === 'recarregando') return 'text-[#0067b8] bg-blue-50 border border-blue-100';
    return 'text-[#e81123] bg-red-50 border border-red-100';
  };

  const getStatusLabel = (status: string) => {
    return status;
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col relative overflow-hidden pb-10">
      <div className="absolute inset-x-0 top-0 h-[180px] bg-[#E9EDF6]" />

      <header className="relative z-20 w-full px-6 py-4 flex items-center justify-between sticky top-0 bg-transparent">
        <button 
          onClick={() => navigate('/perfil')} 
          className="w-10 h-10 flex items-center justify-start text-[#2D2324] active:opacity-50 transition-opacity"
          aria-label={t('common.back')}
          title={t('common.back')}
        >
          ‹
        </button>
        <h1 className="text-[16px] font-medium text-[#2D2324] absolute left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
          {t('history.general_title')}
        </h1>

        <div className="flex items-center space-x-2 bg-[#FFFFFF] border border-[#F4F4F4] rounded-[28px] px-3 py-2 shadow-[0_8px_20px_rgba(242,240,242,0.55)] relative z-10">
          <Filter size={14} className="text-[#5A1089]" />
          <select 
            className="bg-transparent text-[13px] font-medium text-[#2D2324] outline-none cursor-pointer appearance-none pr-6"
            value={filter}
            onChange={(e) => setFilter(e.target.value as HistoryType)}
            title="Filtrar Categoria"
          >
            <option value="">{t('history.filter_all').split(' ')[0]}</option>
            <option value="recargas">{t('history.filter_recharge')}</option>
            <option value="retiradas">{t('history.filter_withdraw')}</option>
            <option value="renda_diaria">{t('history.filter_income')}</option>
            <option value="bonus_equipe">{t('history.filter_team')}</option>
            <option value="cupom">{t('history.filter_coupon')}</option>
          </select>
          <div className="absolute right-3 pointer-events-none text-[#5A1089]">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </header>

      <main className="w-full max-w-[420px] px-6 pt-6 mx-auto relative z-10">
        {loading ? (
          <div className="text-center py-20 text-[#4E4B53] font-normal tracking-widest text-[10px] italic">
            {t('history.syncing')}
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-[#FFFFFF] rounded-[28px] p-16 text-center border border-[#F4F4F4] flex flex-col items-center shadow-[0_8px_20px_rgba(242,240,242,0.55)]">
             <History size={40} className="text-[#5A1089] mb-3" />
             <p className="text-[12px] text-[#4E4B53] font-light tracking-wider">
               {t('history.empty_cat')}
             </p>
          </div>
        ) : (
          <div className="space-y-4 pb-6">
            <AnimatePresence mode="popLayout">
              {filteredData.map((item, idx) => {
                const Icon = getIcon(item.type);
                return (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="bg-[#FFFFFF] border border-[#F4F4F4] rounded-[28px] p-5 shadow-[0_8px_20px_rgba(242,240,242,0.55)] space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center border",
                          getIconContainerStyle(item.type)
                        )}>
                          {Icon}
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-[#2D2324] leading-tight">
                            {item.description}
                          </p>
                          <p className="text-[11px] text-[#4E4B53] font-light mt-0.5">
                            {item.date}
                          </p>
                        </div>
                      </div>
                      <div className={cn(
                        "px-2 py-0.5 rounded-[4px] text-[8px] font-bold tracking-wider",
                        getStatusStyle(item.status)
                      )}>
                        {getStatusLabel(item.status)}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-[#F4F4F4] text-[12px]">
                      <span className="text-[#4E4B53] font-light">Valor</span>
                      <span className={cn(
                        "font-semibold text-[15px]",
                        item.type === 'retiradas' ? "text-[#e81123]" : "text-[#C62828]"
                      )}>
                        {item.type === 'retiradas' ? '-' : '+'}{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} Kz
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-[#4E4B53] font-light pt-1">
                      <span>Tipo: {item.type.replace('_', ' ').toUpperCase()}</span>
                      <span className="truncate max-w-[150px]">ID: {item.id.toString().toUpperCase()}</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <div className="text-center pt-8 pb-4 text-[12px] font-medium tracking-wide text-[#4E4B53]">
              <span className="text-[#5A1089] opacity-80">
                ~ Sem mais dados ~
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
