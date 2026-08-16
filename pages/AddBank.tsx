import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronDown, Loader2 } from 'lucide-react';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

const CARD_NAMES = [
  'Banco BAI',
  'Banco BFA',
  'Banco BIC',
  'Banco SOL',
  'Banco Atlântico'
];

interface BankResponse {
  success: boolean;
  message: string;
}

export default function AddBank() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect');
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    cardNumber: '',
    holderName: '',
    cardName: ''
  });

  useEffect(() => {
    const stateBank = (location.state as any)?.bank;
    if (stateBank) {
      const cleanIban = (stateBank.iban || '').replace(/^AO06/i, '');
      setFormData({
        cardNumber: cleanIban,
        holderName: stateBank.owner_name || stateBank.holder_name || '',
        cardName: stateBank.bank_name || ''
      });
      return;
    }

    async function loadExistingBank() {
      try {
        const { data, error } = await supabase.rpc('get_my_bank_accounts_mcpn');
        if (!error && data && data.length > 0) {
          const bank = data[0];
          const cleanIban = (bank.iban || '').replace(/^AO06/i, '');
          setFormData({
            cardNumber: cleanIban,
            holderName: bank.owner_name || (bank as any).holder_name || '',
            cardName: bank.bank_name || ''
          });
        }
      } catch {
      }
    }
    loadExistingBank();
  }, [location.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let sanitized = value;

    if (name === 'cardNumber') {
      sanitized = value.replace(/\D/g, '');
    } else if (name === 'holderName') {
      sanitized = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').replace(/\s\s+/g, ' ');
    }

    setFormData(prev => ({ ...prev, [name]: sanitized }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.cardNumber || formData.cardNumber.length < 5) {
      showToast('Por favor, insira o número do cartão válido.', 'error');
      return;
    }

    if (!formData.holderName.trim() || formData.holderName.trim().length < 3) {
      showToast('Por favor, preencha o nome do titular.', 'error');
      return;
    }

    if (!formData.cardName) {
      showToast('Por favor, selecione o nome do cartão.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const fullIban = formData.cardNumber.startsWith('AO06') ? formData.cardNumber : `AO06${formData.cardNumber}`;
      const { data, error } = await supabase.rpc('save_bank_data_mcpn', {
        p_bank_name: formData.cardName,
        p_holder_name: formData.holderName.trim(),
        p_iban: fullIban
      }) as { data: BankResponse | null; error: any };

      if (error) throw error;

      if (data && data.success) {
        showToast(data.message || 'Cartão salvo com sucesso!', 'success');
        navigate(redirectPath || '/informacao-bancaria');
      } else {
        showToast(data?.message || 'Falha ao salvar cartão.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Erro ao salvar cartão.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F2F2F2] pb-32 font-sans antialiased text-[#202020] select-none flex flex-col items-center">
      
      <header className="w-full max-w-[480px] bg-[#FFFFFF] px-4 pt-4 pb-3 sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(redirectPath || '/perfil')}
            className="p-1 -ml-1 text-[#202020] active:scale-95 transition-transform"
            aria-label={t('common.back')}
          >
            <ChevronLeft className="w-5 h-5 stroke-[1.8]" />
          </button>
          
          <h1 className="text-[14.5px] font-medium text-[#202020] tracking-normal">
            Cartão
          </h1>
        </div>
      </header>

      <main className="w-full max-w-[480px] px-4 pt-4 space-y-2.5">
        <form onSubmit={handleSubmit} id="add-card-form" className="space-y-2.5">
          
          <div className="bg-[#FFFFFF] rounded-none h-[46px] px-4 flex items-center shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <input
              name="cardNumber"
              type="tel"
              inputMode="numeric"
              className="w-full h-full bg-transparent outline-none text-[13.5px] text-[#202020] placeholder:text-[#AAAAAA] font-normal"
              placeholder="Número do cartão"
              value={formData.cardNumber}
              onChange={handleChange}
            />
          </div>

          <div className="bg-[#FFFFFF] rounded-none h-[46px] px-4 flex items-center shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <input
              name="holderName"
              type="text"
              inputMode="text"
              className="w-full h-full bg-transparent outline-none text-[13.5px] text-[#202020] placeholder:text-[#AAAAAA] font-normal"
              placeholder="Nome do titular"
              value={formData.holderName}
              onChange={handleChange}
            />
          </div>

          <div className="bg-[#FFFFFF] rounded-none h-[46px] px-4 flex items-center shadow-[0_1px_2px_rgba(0,0,0,0.03)] relative">
            <select
              name="cardName"
              className={`w-full h-full bg-transparent outline-none text-[13.5px] font-normal cursor-pointer appearance-none pr-8 ${
                formData.cardName ? 'text-[#202020]' : 'text-[#AAAAAA]'
              }`}
              value={formData.cardName}
              onChange={handleChange}
            >
              <option value="" disabled className="text-[#AAAAAA]">Nome do cartão</option>
              {CARD_NAMES.map(bank => (
                <option key={bank} value={bank} className="text-[#202020]">{bank}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#AAAAAA] absolute right-4 pointer-events-none stroke-[1.8]" />
          </div>



        </form>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-[#F2F2F2] p-3.5 z-40 flex justify-center border-t border-gray-200/50">
        <div className="w-full max-w-[480px]">
          <button
            type="submit"
            form="add-card-form"
            disabled={isSubmitting || !formData.cardNumber || !formData.holderName || !formData.cardName}
            className="w-full h-[40px] rounded-none bg-[#FE384F] hover:bg-[#E02E44] active:scale-[0.99] text-[#FFFFFF] font-normal text-[13.5px] transition-all disabled:opacity-40 shadow-none flex items-center justify-center cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin h-4 w-4 text-[#FFFFFF]" />
            ) : (
              "Enviar"
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
