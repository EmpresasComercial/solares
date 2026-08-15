import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';
import { ChevronLeft, Landmark, User, CreditCard, Loader2 } from 'lucide-react';

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

  const [formData, setFormData] = useState({
    bankName: '',
    holderName: '',
    iban: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let sanitized = value;

    if (name === 'iban') {
      sanitized = value.replace(/[^0-9]/g, '');
    } else if (name === 'holderName') {
      sanitized = value.replace(/[^a-zA-Z\s]/g, '').replace(/\s\s+/g, ' ');
    }

    setFormData(prev => ({ ...prev, [name]: sanitized }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.bankName) {
      showToast('Por favor, selecione o banco.', 'error');
      return;
    }
    if (formData.holderName.length < 5) {
      showToast('Nome do titular muito curto.', 'error');
      return;
    }
    if (formData.iban.length < 21) {
      showToast('O IBAN deve ter 21 dígitos.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const fullIban = `AO06${formData.iban}`;
      const { data, error } = await supabase.rpc('save_bank_data_mcpn', {
        p_bank_name: formData.bankName,
        p_holder_name: formData.holderName,
        p_iban: fullIban
      }) as { data: BankResponse | null; error: any };

      if (error) throw error;

      if (data && data.success) {
        showToast('Banco vinculado com sucesso!', 'success');
        navigate(redirectPath || '/informacao-bancaria');
      } else {
        showToast(data?.message || 'Falha.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Falha, tente novamente', 'error');
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
            onClick={() => navigate(redirectPath || '/perfil')}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white active:scale-95 transition-transform"
            aria-label={t('common.back')}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <h1 className="text-[17px] font-semibold text-white tracking-tight">
            Adicionar Banco
          </h1>

          <div className="w-9" />
        </div>
      </div>

      {/* 2. CONTEÚDO DOS CARDS */}
      <div className="max-w-[430px] mx-auto px-4 -mt-8 relative z-20 space-y-3.5">
        
        <div className="bg-white rounded-[8px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100/60 p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Banco Select */}
            <div>
              <label className="block text-[13px] font-semibold text-[#1A1C1E] mb-1.5">Banco</label>
              <div className="relative flex items-center h-[54px] rounded-[8px] border border-[#F4F4F4] bg-[#FFFFFF] px-4 shadow-[0_8px_20px_rgba(242,240,242,0.55)] focus-within:border-[#C62828] focus-within:ring-2 focus-within:ring-[#C62828]/10 transition-all">
                <div className="w-[26px] h-[26px] rounded-[6px] bg-red-50 flex items-center justify-center text-[#C62828] mr-2.5 shrink-0">
                  <Landmark className="w-4 h-4" />
                </div>
                <select
                  name="bankName"
                  className="flex-1 h-full bg-transparent outline-none text-[15px] text-[#2D2324] font-medium cursor-pointer appearance-none"
                  value={formData.bankName}
                  onChange={handleChange}
                >
                  <option value="">Selecionar banco</option>
                  {BANKS.map(bank => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
                <div className="pointer-events-none text-[#94A3B8] pr-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Nome do Titular */}
            <div>
              <label className="block text-[13px] font-semibold text-[#1A1C1E] mb-1.5">Nome do Titular</label>
              <div className="flex items-center h-[54px] rounded-[8px] border border-[#F4F4F4] bg-[#FFFFFF] px-4 shadow-[0_8px_20px_rgba(242,240,242,0.55)] focus-within:border-[#C62828] focus-within:ring-2 focus-within:ring-[#C62828]/10 transition-all">
                <div className="w-[26px] h-[26px] rounded-[6px] bg-red-50 flex items-center justify-center text-[#C62828] mr-2.5 shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <input
                  name="holderName"
                  type="text"
                  className="flex-1 h-full bg-transparent outline-none text-[15px] text-[#2D2324] placeholder:text-[#A09AA5] font-medium"
                  placeholder="Seu nome completo"
                  value={formData.holderName}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* IBAN */}
            <div>
              <label className="block text-[13px] font-semibold text-[#1A1C1E] mb-1.5">Número do IBAN</label>
              <div className="flex items-center h-[54px] rounded-[8px] border border-[#F4F4F4] bg-[#FFFFFF] px-4 shadow-[0_8px_20px_rgba(242,240,242,0.55)] focus-within:border-[#C62828] focus-within:ring-2 focus-within:ring-[#C62828]/10 transition-all">
                <div className="w-[26px] h-[26px] rounded-[6px] bg-red-50 flex items-center justify-center text-[#C62828] mr-2.5 shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="text-[15px] font-mono font-semibold text-[#2D2324] mr-1.5">AO06</span>
                <input
                  name="iban"
                  type="text"
                  className="flex-1 h-full bg-transparent outline-none text-[15px] text-[#2D2324] placeholder:text-[#A09AA5] font-mono font-medium"
                  placeholder="0040 XXXX XXXX XXXX XXXX X"
                  value={formData.iban}
                  onChange={handleChange}
                  maxLength={21}
                />
              </div>
              <p className="text-[11.5px] text-[#94A3B8] mt-1 ml-1">
                Introduza os 21 dígitos numéricos do seu IBAN
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting || !formData.bankName || formData.holderName.length < 5 || formData.iban.length < 21}
                className="w-full h-[46px] rounded-[8px] bg-gradient-to-r from-[#D32F2F] to-[#B71C1C] text-white font-semibold text-[15px] transition-all active:scale-[0.99] disabled:opacity-40 shadow-sm flex items-center justify-center cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin h-5 w-5 text-white" />
                ) : (
                  "Vincular Banco"
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
