import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { ChevronLeft, History, Landmark, Loader2 } from 'lucide-react';

interface RechargeResponse {
  success: boolean;
  recharge_id?: string;
  message?: string;
}

export default function Recharge() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const selectRef = useRef<HTMLSelectElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState('');
  const [banks, setBanks] = useState<any[]>([]);
  const [selectedBankId, setSelectedBankId] = useState('');
  const [showBankField, setShowBankField] = useState(false);

  const MIN_RECHARGE = 9000;
  const MAX_RECHARGE = 3000000;
  const isAmountValid = parseInt(amount || '0') >= MIN_RECHARGE && parseInt(amount || '0') <= MAX_RECHARGE;

  useEffect(() => {
    async function fetchBanks() {
      const { data, error } = await supabase
        .from('bancos_arrecadacao_mcpn')
        .select('*');
      if (!error && data) setBanks(data);
    }
    fetchBanks();
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setAmount(val);
    if (parseInt(val || '0') < MIN_RECHARGE) {
      setShowBankField(false);
      setSelectedBankId('');
    }
  };

  const handleMainAction = async () => {
    if (parseInt(amount || '0') < MIN_RECHARGE) {
      showToast(`Valor mínimo de recarga é ${MIN_RECHARGE.toLocaleString()} Kz.`, 'error');
      return;
    }

    if (parseInt(amount || '0') > MAX_RECHARGE) {
      showToast(`Valor máximo de recarga é ${MAX_RECHARGE.toLocaleString()} Kz.`, 'error');
      return;
    }

    if (!showBankField) {
      setShowBankField(true);
      return;
    }

    if (!selectedBankId) {
      showToast('Por favor, selecione o banco de depósito.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('request_recharge_kz_mcpn', {
        p_amount: parseInt(amount),
        p_bank_id: selectedBankId
      }) as { data: RechargeResponse | null; error: any };

      if (error) throw error;

      if (data && data.success) {
        navigate(`/confirmar-recarga?id=${data.recharge_id}&amount=${amount}&bankId=${selectedBankId}`);
      } else {
        showToast(data?.message || 'Falhou, tente novamente', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Falha no servidor', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] pb-28 font-sans antialiased text-[#1A1C1E] select-none">
      
      {/* 1. HEADER VERDE ORGÂNICO */}
      <div className="relative bg-gradient-to-br from-[#D32F2F] via-[#C62828] to-[#B71C1C] pt-7 pb-16 px-5 text-white overflow-hidden">
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

        <div className="relative z-10 flex items-center justify-between max-w-[430px] mx-auto w-full">
          <button
            onClick={() => navigate('/perfil')}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white active:scale-95 transition-transform"
            aria-label={t('common.back')}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <h1 className="text-[17px] font-semibold text-white tracking-tight">
            {t('recharge.title') || 'Recarregar'}
          </h1>

          <button 
            onClick={() => navigate('/registro-recarga?tab=recarga')}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/90 hover:text-white active:scale-95 transition-transform"
            title="Histórico"
          >
            <History className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. CONTEÚDO DOS CARDS */}
      <div className="max-w-[430px] mx-auto px-4 -mt-8 relative z-20 space-y-3.5">
        
        {/* CARD PRINCIPAL */}
        <div className="bg-white rounded-[8px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100/60 p-5 space-y-5">
          
          {/* Campo de Valor */}
          <div>
            <label className="block text-[13px] font-semibold text-[#1A1C1E] mb-2">{t('recharge.amount')}</label>
            <div className="relative">
              <input
                type="text"
                className={cn(
                  "w-full h-[52px] bg-[#F8FAFC] border border-gray-200/80 rounded-[8px] px-4 text-[20px] font-semibold outline-none transition-all placeholder:text-[#94A3B8] placeholder:font-normal focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20",
                  amount && !isAmountValid ? "text-red-600 border-red-300 ring-1 ring-red-200" : "text-[#1A1C1E]"
                )}
                placeholder={t('recharge.placeholder')}
                value={amount}
                onChange={handleAmountChange}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] text-[14px] font-semibold">Kz</span>
            </div>
            
            {/* Mensagens de Limite */}
            <AnimatePresence>
              {amount && parseInt(amount) < MIN_RECHARGE && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-[12px] text-red-500 mt-2 ml-1 font-medium"
                >
                  {t('recharge.min_limit')} {MIN_RECHARGE.toLocaleString()} Kz
                </motion.p>
              )}
              {amount && parseInt(amount) > MAX_RECHARGE && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-[12px] text-red-500 mt-2 ml-1 font-medium"
                >
                  {t('recharge.max_limit')} {MAX_RECHARGE.toLocaleString()} Kz
                </motion.p>
              )}
            </AnimatePresence>

            {/* Sugestões de Valor */}
            <div className="grid grid-cols-3 gap-2.5 mt-4">
              {[9000, 25000, 72000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  className={cn(
                    "h-[40px] rounded-[8px] text-[13px] font-semibold transition-all border",
                    amount === val.toString()
                      ? "bg-red-50 text-[#C62828] border-[#C62828]/30 shadow-xs"
                      : "bg-[#F8FAFC] text-[#475569] border-gray-200/80 hover:bg-gray-50 active:scale-95"
                  )}
                >
                  {val.toLocaleString()} Kz
                </button>
              ))}
            </div>
          </div>

          {/* Seleção de Banco (Step 2) */}
          <AnimatePresence mode="wait">
            {showBankField && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 pt-3 border-t border-gray-100"
              >
                <label className="block text-[13px] font-semibold text-[#1A1C1E]">{t('recharge.bank_institution')}</label>
                <div className="relative">
                  <select 
                    ref={selectRef}
                    className="w-full h-[46px] bg-[#F8FAFC] rounded-[8px] border border-gray-200/80 px-4 appearance-none outline-none text-[14px] text-[#1A1C1E] font-medium cursor-pointer focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20"
                    value={selectedBankId}
                    onChange={(e) => setSelectedBankId(e.target.value)}
                  >
                    <option value="">{t('recharge.select_bank')}</option>
                    {banks.map((bank) => (
                      <option key={bank.id} value={bank.id}>
                        {bank.nome_banco}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#94A3B8]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <p className="text-[12px] text-[#94A3B8] ml-1">
                  {t('recharge.bank_desc')}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botão de Ação */}
          <div className="pt-2">
            <button
              onClick={handleMainAction}
              disabled={isSubmitting || !amount}
              className="w-full h-[46px] rounded-[8px] bg-gradient-to-r from-[#D32F2F] to-[#B71C1C] text-white font-semibold text-[15px] transition-all active:scale-[0.99] disabled:opacity-40 shadow-sm flex items-center justify-center cursor-pointer"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center text-white">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  {t('common.processing')}
                </span>
              ) : (
                selectedBankId ? t('recharge.generate_data') : (t('recharge.submit_btn') || 'Recarregar')
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
