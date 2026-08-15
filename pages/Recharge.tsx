import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { 
  ChevronLeft, 
  Check, 
  Loader2 
} from 'lucide-react';

interface RechargeResponse {
  success: boolean;
  recharge_id?: string;
  message?: string;
}

export default function Recharge() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState('');
  const [banks, setBanks] = useState<any[]>([]);
  const [selectedBankId, setSelectedBankId] = useState('');

  const MIN_RECHARGE = 3000;
  const MAX_RECHARGE = 500000;

  useEffect(() => {
    async function fetchBanks() {
      const { data, error } = await supabase
        .from('bancos_arrecadacao_mcpn')
        .select('*');
      if (!error && data) {
        setBanks(data);
        if (data.length > 0) {
          setSelectedBankId(data[0].id);
        }
      }
    }
    fetchBanks();
  }, []);

  const isDepositTimeValid = () => {
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour >= 9 && currentHour < 21;
  };

  const numAmount = parseInt(amount || '0', 10);
  const isStep1Valid = numAmount >= MIN_RECHARGE && numAmount <= MAX_RECHARGE;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setAmount(val);
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      navigate('/perfil');
    }
  };

  const handleNextStep1 = () => {
    if (!isDepositTimeValid()) {
      showToast('Recarregue sua conta apenas no horário das 09:00 às 21:00.', 'error');
      return;
    }

    if (numAmount < MIN_RECHARGE) {
      showToast(`Valor mínimo de recarga é ${MIN_RECHARGE.toLocaleString()} Kz.`, 'error');
      return;
    }
    if (numAmount > MAX_RECHARGE) {
      showToast(`Valor máximo de recarga é ${MAX_RECHARGE.toLocaleString()} Kz.`, 'error');
      return;
    }
    setCurrentStep(2);
  };

  const handleFinalSubmit = async () => {
    if (!isDepositTimeValid()) {
      showToast('Recarregue sua conta apenas no horário das 09:00 às 21:00.', 'error');
      return;
    }

    if (!selectedBankId) {
      showToast('Por favor, selecione um banco.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('request_recharge_kz_mcpn', {
        p_amount: numAmount,
        p_bank_id: selectedBankId
      }) as { data: RechargeResponse | null; error: any };

      if (error) throw error;

      if (data && data.success) {
        navigate(`/confirmar-recarga?id=${data.recharge_id}&amount=${numAmount}&bankId=${selectedBankId}`);
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
    <div className="w-full min-h-screen bg-[#F2F2F2] pb-28 font-sans antialiased text-[#202020] select-none flex flex-col items-center">
      
      {/* ═════════════════════════════════════════════════════
          1. HEADER COM PROGRESSO EM 3 ETAPAS
      ══════════════════════════════════════════════════════ */}
      <header className="w-full max-w-[480px] bg-[#FFFFFF] px-4 pt-3.5 pb-3 sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        
        {/* Topo: Seta voltar + Título com fonte suave */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleBack}
            className="p-1 -ml-1 text-[#202020] active:scale-95 transition-transform"
            aria-label={t('common.back')}
          >
            <ChevronLeft className="w-5 h-5 stroke-[1.8]" />
          </button>
          
          <h1 className="text-[14.5px] font-medium text-[#222222] tracking-normal">
            Recarregue em 3 etapas
          </h1>
        </div>

        {/* ════ BARRA DE PROGRESSO EM 3 ETAPAS ════ */}
        <div className="mt-3.5 px-3">
          <div className="relative flex items-center justify-between">
            
            {/* Linha de Conexão Fundo (Cinza Fina) */}
            <div className="absolute left-3 right-3 top-2 h-[1.5px] bg-[#E5E7EB] -translate-y-1/2 z-0" />
            
            {/* Linha de Conexão Ativa (Vermelha) */}
            <div 
              className="absolute left-3 top-2 h-[1.5px] bg-[#FE384F] -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: currentStep >= 2 ? '50%' : '0%' }}
            />

            {/* Passo 1: Add valor */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-[17px] h-[17px] rounded-full bg-[#FE384F] text-white flex items-center justify-center text-[9.5px] font-normal">
                {currentStep >= 2 || isStep1Valid ? <Check className="w-2.5 h-2.5 stroke-[2.5]" /> : '1'}
              </div>
              <span className="text-[10px] font-normal text-[#FE384F] mt-1 whitespace-nowrap">
                Add valor
              </span>
            </div>

            {/* Passo 2: Selecionar banco */}
            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-[17px] h-[17px] rounded-full flex items-center justify-center text-[9.5px] font-normal transition-colors ${
                currentStep >= 2
                  ? 'bg-[#FE384F] text-white'
                  : 'bg-[#E5E7EB] text-[#888888]'
              }`}>
                2
              </div>
              <span className={`text-[10px] font-normal mt-1 whitespace-nowrap ${
                currentStep >= 2 ? 'text-[#FE384F]' : 'text-[#888888]'
              }`}>
                Selecionar banco
              </span>
            </div>

            {/* Passo 3: Pagar */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-[17px] h-[17px] rounded-full bg-[#E5E7EB] text-[#888888] flex items-center justify-center text-[9.5px] font-normal">
                3
              </div>
              <span className="text-[10px] font-normal text-[#888888] mt-1 whitespace-nowrap">
                Pagar
              </span>
            </div>

          </div>
        </div>

      </header>

      {/* ═════════════════════════════════════════════════════
          2. CONTEÚDO PRINCIPAL (Arredondamento 4px em todos elementos)
      ══════════════════════════════════════════════════════ */}
      <main className="w-full max-w-[480px] px-3.5 pt-3 space-y-3">
        
        {/* ── ETAPA 1: DIGITAR VALOR ── */}
        {currentStep === 1 && (
          <div className="space-y-3">
            
            {/* Campo de Entrada (rounded-[4px]) */}
            <div className="bg-[#FFFFFF] rounded-[4px] h-[42px] px-3.5 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)] border border-gray-100/60">
              <input
                type="tel"
                inputMode="numeric"
                autoFocus
                className="w-full h-full bg-transparent outline-none text-[13.5px] text-[#222222] placeholder:text-[#AAAAAA] font-normal pr-2 rounded-[4px]"
                placeholder="Digite o valor (mín. 3.000 Kz)"
                value={amount}
                onChange={handleAmountChange}
              />
              <span className="text-[12px] font-medium text-[#FE384F] shrink-0">KZ</span>
            </div>

            {/* Sugestões de Valor com Arredondamento 4px e Visto no Canto Interno do Quadrado */}
            <div className="grid grid-cols-4 gap-1.5">
              {[3000, 10000, 50000, 100000].map(val => {
                const isSelected = amount === val.toString();
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val.toString())}
                    className={`h-[35px] rounded-[4px] text-[11.5px] font-normal transition-all border flex items-center justify-center relative overflow-hidden ${
                      isSelected
                        ? "bg-white text-[#FE384F] border-[#FE384F] shadow-xs"
                        : "bg-white text-[#444444] border-gray-200 hover:border-[#FE384F]"
                    }`}
                  >
                    <span>{val.toLocaleString()}</span>

                    {/* Visto no canto inferior dentro do quadrado */}
                    {isSelected && (
                      <div className="absolute bottom-0 right-0 bg-[#FE384F] text-white w-3 h-3 flex items-center justify-center rounded-tl-[3px]">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Botão "Continuar" com arredondamento de 4px */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleNextStep1}
                disabled={!amount}
                className="w-full h-[40px] rounded-[4px] bg-[#FE384F] hover:bg-[#E02E44] active:scale-[0.99] text-[#FFFFFF] font-normal text-[13.5px] tracking-normal transition-all disabled:opacity-40 shadow-none flex items-center justify-center cursor-pointer"
              >
                <span>Continuar</span>
              </button>
            </div>

            {/* Bloco de Informações / Regras da Recarga com Destaques Vermelhos */}
            <div className="bg-[#FFFFFF] rounded-[4px] p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-2 text-[#666666] text-[11.5px] leading-relaxed">
              <p>
                • Recarregue sua conta no horário das <span className="text-[#FE384F] font-medium">09:00 às 21:00</span>.
              </p>
              <p>
                • O valor mínimo de depósito é <span className="text-[#FE384F] font-medium">3.000</span> e o valor máximo é <span className="text-[#FE384F] font-medium">500.000</span>.
              </p>
              <p>
                • Depósitos feitos com <span className="text-[#FE384F] font-medium">bancos iguais</span> chegam à conta na plataforma <span className="text-[#FE384F] font-medium">em 5 a 10 minutos</span>.
              </p>
              <p>
                • Se o seu valor não for creditado dentro desse prazo, entre em contato com o <span className="text-[#FE384F] font-medium">suporte da plataforma</span>.
              </p>
            </div>

          </div>
        )}

        {/* ── ETAPA 2: SELECIONAR BANCO (rounded-[4px]) ── */}
        {currentStep === 2 && (
          <div className="space-y-3">
            <div className="bg-[#FFFFFF] rounded-[4px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] divide-y divide-gray-100 overflow-hidden">
              {banks.length > 0 ? (
                banks.map((bank) => {
                  const isSelected = selectedBankId === bank.id;
                  return (
                    <div
                      key={bank.id}
                      onClick={() => setSelectedBankId(bank.id)}
                      className="flex items-center justify-between py-2.5 px-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
                    >
                      {/* Nome do Banco */}
                      <span className={`text-[13px] ${isSelected ? 'font-medium text-[#202020]' : 'font-normal text-[#555555]'}`}>
                        {bank.nome_banco}
                      </span>

                      {/* Visto vermelho direto */}
                      <div className="w-4 h-4 flex items-center justify-center">
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-[#FE384F] stroke-[2.2]" />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-4 text-center text-[11.5px] text-gray-400">
                  Carregando bancos disponíveis...
                </div>
              )}
            </div>

            {/* Botão "Continuar" para Etapa 2 (rounded-[4px]) */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting || !selectedBankId}
                className="w-full h-[40px] rounded-[4px] bg-[#FE384F] hover:bg-[#E02E44] active:scale-[0.99] text-[#FFFFFF] font-normal text-[13.5px] tracking-normal transition-all disabled:opacity-40 shadow-none flex items-center justify-center cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="animate-spin h-3.5 w-3.5 text-white" />
                    <span>Processando...</span>
                  </span>
                ) : (
                  <span>Continuar</span>
                )}
              </button>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
