import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronLeft, Loader2 } from 'lucide-react';
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
      showToast('Enviado!', 'success');
      setFeedback('');
      setTimeout(() => navigate('/suporte'), 1500);
    } catch (err: any) {
      showToast(t('common.error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* Header Compacto */}
      <header className="w-full px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-50">
        <button onClick={() => navigate('/suporte')} className="w-10 h-10 flex items-center justify-start text-[#333333] active:opacity-50 transition-opacity">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[16px] font-medium text-[#333333] absolute left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
          Comentarios
        </h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 w-full max-w-[400px] px-6 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="flex flex-col"
        >
          <form onSubmit={handleSubmit} className="w-full">
            <div className="mb-8">
              <label className="block text-[14px] text-[#333333] mb-3 font-normal ml-1">
                Escreva o seu comentário
              </label>
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  className="w-full min-h-[42px] px-5 py-[10px] bg-[#F5F5F5] rounded-[21px] text-[15px] text-[#333333] font-normal placeholder-gray-400 border-none outline-none focus:ring-0 transition-all resize-none overflow-hidden"
                  placeholder="Escreva aqui..."
                  value={feedback}
                  onChange={handleFeedbackChange}
                  disabled={isSubmitting}
                  rows={1}
                />
                <div className="flex justify-end mt-2 px-1">
                  <span className={cn("text-[10px] font-medium", feedback.length >= 480 ? "text-[#C62828]" : "text-gray-300")}>
                    {feedback.length} / 500
                  </span>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting || feedback.length < 10}
              className="w-full h-[50px] rounded-[25px] bg-gradient-to-r from-[#C62828] to-[#1A237E] text-white font-medium text-[16px] transition-opacity hover:opacity-90 disabled:opacity-30 flex items-center justify-center shadow-lg shadow-blue-900/10"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Enviar'
              )}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
