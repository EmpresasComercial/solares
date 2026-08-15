import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronLeft, ShieldCheck, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function SupportFeedback() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.replace(/[<>]/g, '').slice(0, 500);
    setFeedback(val);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.length < 10) {
      showToast('Por favor, escreva pelo menos 10 caracteres.', 'error');
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      showToast(t('common.error'), 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('feedback_suporte_mcpn').insert({
        user_id: session.user.id,
        mensagem: feedback
      });
      if (error) throw error;
      showToast('Enviado com sucesso!', 'success');
      setFeedback('');
      setTimeout(() => navigate('/suporte'), 1500);
    } catch (err: any) {
      showToast(t('common.error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F2F2F2] pb-32 font-sans antialiased text-[#202020] select-none flex flex-col items-center">
      
      {/* 1. HEADER (Design AddBank) */}
      <header className="w-full max-w-[480px] bg-[#FFFFFF] px-4 pt-4 pb-3 sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/suporte')} 
            className="p-1 -ml-1 text-[#202020] active:scale-95 transition-transform"
            aria-label={t('common.back')}
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
          </button>
          <h1 className="text-[18px] font-bold text-[#202020] tracking-tight">
            Comentários e Sugestões
          </h1>
        </div>

        {/* Subtítulo verde com ícone de escudo */}
        <div className="flex items-center gap-1.5 mt-1.5 ml-8 text-[13px] text-[#38A98B] font-medium">
          <ShieldCheck className="w-4 h-4 text-[#38A98B] shrink-0" />
          <span>Sua opinião nos ajuda a melhorar a plataforma.</span>
        </div>
      </header>

      {/* 2. CONTEÚDO PRINCIPAL (CAMPO TEXTAREA BRANCO ELEVADO) */}
      <main className="w-full max-w-[480px] px-4 pt-4 space-y-3">
        <form onSubmit={handleSubmit} id="feedback-form" className="space-y-3">
          <div className="bg-[#FFFFFF] rounded-[10px] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-2">
            <label className="block text-[12px] font-normal text-[#A6A6A6]">
              Escreva o seu comentário ou sugestão
            </label>
            <textarea
              ref={textareaRef}
              className="w-full min-h-[120px] bg-transparent outline-none text-[15px] text-[#202020] placeholder:text-[#A6A6A6] font-medium border-none resize-none"
              placeholder="Digite aqui o que você gostaria de nos dizer..."
              value={feedback}
              onChange={handleFeedbackChange}
              disabled={isSubmitting}
              rows={4}
            />
            <div className="flex justify-end pt-1 border-t border-gray-100">
              <span className={cn("text-[11px] font-medium", feedback.length >= 480 ? "text-[#FE384F]" : "text-[#A6A6A6]")}>
                {feedback.length} / 500
              </span>
            </div>
          </div>
        </form>
      </main>

      {/* 3. BARRA INFERIOR FIXA COM BOTÃO "Salvar e confirmar" (#FE384F) */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#F2F2F2] p-4 z-40 flex justify-center border-t border-gray-200/50">
        <div className="w-full max-w-[480px]">
          <button
            type="submit"
            form="feedback-form"
            disabled={isSubmitting || feedback.length < 10}
            className="w-full h-[48px] rounded-full bg-[#FE384F] hover:bg-[#E02E44] active:scale-[0.99] text-[#FFFFFF] font-bold text-[16px] transition-all disabled:opacity-40 shadow-sm flex items-center justify-center cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin h-5 w-5 text-[#FFFFFF]" />
            ) : (
              "Enviar Comentário"
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
