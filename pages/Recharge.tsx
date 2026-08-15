import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { ChevronLeft, ShieldCheck, ChevronDown, History, Loader2 } from 'lucide-react';

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
    <div className="w-full min-h-screen bg-[#F2F2F2] pb-32 font-sans antialiased text-[#202020] select-none flex flex-col items-center">
      
      {/* 1. HEADER (Design AddBank) */}
      <header className="w-full max-w-[480px] bg-[#FFFFFF] px-4 pt-4 pb-3 sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/perfil')}
              className="p-1 -ml-1 text-[#202020] active:scale-95 transition-transform"
              aria-label={t('common.back')}
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
            </button>
            
            <h1 className="text-[18px] font-bold text-[#202020] tracking-tight">
              {t('recharge.title') || 'Recarregar Conta'}
            </h1>
          </div>

          <button 
            onClick={() => navigate('/registro-recarga?tab=recarga')}
            className="p-2 text-[#202020] hover:bg-gray-100 rounded-full transition-colors"
            title="Histórico"
          >
            <History className="w-5 h-5 stroke-[1.8]" />
          </button>
        </div>

        {/* Subtítulo verde com ícone de escudo */}
        <div className="flex items-center gap-1.5 mt-1.5 ml-8 text-[13px] text-[#38A98B] font-medium">
          <ShieldCheck className="w-4 h-4 text-[#38A98B] shrink-0" />
          <span>Transações seguras e processamento instantâneo.</span>
        </div>
      </header>

      {/* 2. CONTEÚDO PRINCIPAL (CAMPOS BRANCOS LIMPOS) */}
      <main className="w-full max-w-[480px] px-4 pt-4 space-y-3">
        
        {/* Campo 1: Valor de Recarga */}
        <div className="bg-[#FFFFFF] rounded-[10px] h-[54px] px-4 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <input
            type="text"
            className="w-full h-full bg-transparent outline-none text-[15px] text-[#202020] placeholder:text-[#A6A6A6] font-medium pr-2"
            placeholder={t('recharge.placeholder') || 'Valor da recarga'}
            value={amount}
            onChange={handleAmountChange}
          />
          <span className="text-[14px] font-bold text-[#FE384F] shrink-0">KZ</span>
        </div>

        {/* Botões de Sugestão de Valor */}
        <div className="grid grid-cols-3 gap-2">
          {[9000, 25000, 72000].map(val => (
            <button
              key={val}
              type="button"
              onClick={() => {
                setAmount(val.toString());
                setShowBankField(true);
              }}
              className={`h-[40px] rounded-full text-[13px] font-semibold transition-all border ${
                amount === val.toString()
                  ? "bg-[#FE384F] text-white border-[#FE384F] shadow-xs"
                  : "bg-white text-[#202020] border-gray-200 hover:border-[#FE384F]"
              }`}
            >
              {val.toLocaleString()} Kz
            </button>
          ))}
        </div>

        {/* Campo 2: Seleção de Banco (Step 2) */}
        {showBankField && (
          <div className="bg-[#FFFFFF] rounded-[10px] h-[54px] px-4 flex items-center shadow-[0_1px_2px_rgba(0,0,0,0.03)] relative">
            <select 
              ref={selectRef}
              className={`w-full h-full bg-transparent appearance-none outline-none text-[15px] font-medium cursor-pointer pr-8 ${
                selectedBankId ? 'text-[#202020]' : 'text-[#A6A6A6]'
              }`}
              value={selectedBankId}
              onChange={(e) => setSelectedBankId(e.target.value)}
            >
              <option value="" disabled>{t('recharge.select_bank') || 'Selecionar banco de depósito'}</option>
              {banks.map((bank) => (
                <option key={bank.id} value={bank.id} className="text-[#202020]">
                  {bank.nome_banco}
                </option>
              ))}
            </select>
            <ChevronDown className="w-5 h-5 text-[#A6A6A6] absolute right-4 pointer-events-none stroke-[1.8]" />
          </div>
        )}

      </main>

      {/* 3. BARRA INFERIOR FIXA COM BOTÃO "Salvar e confirmar" (#FE384F) */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#F2F2F2] p-4 z-40 flex justify-center border-t border-gray-200/50">
        <div className="w-full max-w-[480px]">
          <button
            type="button"
            onClick={handleMainAction}
            disabled={isSubmitting || !amount}
            className="w-full h-[48px] rounded-full bg-[#FE384F] hover:bg-[#E02E44] active:scale-[0.99] text-[#FFFFFF] font-bold text-[16px] transition-all disabled:opacity-40 shadow-sm flex items-center justify-center cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin h-5 w-5 text-[#FFFFFF]" />
            ) : (
              selectedBankId ? t('recharge.generate_data') || 'Gerar Dados de Pagamento' : (t('recharge.submit_btn') || 'Continuar Recarga')
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
