import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronLeft, ChevronDown, Sparkles, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

export default function HelpFAQ() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First one open by default

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqData: FAQItem[] = [
    {
      question: t('faq.q1'),
      answer: (
        <div className="space-y-4 text-gray-500 font-light text-[14px]">
          <p>{t('faq.a1_p1')}</p>
          <div className="bg-[#F5F5F5] rounded-2xl p-5 italic border-l-4 border-[#C62828] text-[13px] text-[#333333]">
            {t('faq.a1_note')}
          </div>
          <ol className="list-decimal ml-6 space-y-3">
            <li>{t('faq.a1_li1')}</li>
            <li>{t('faq.a1_li2')}</li>
            <li>{t('faq.a1_li3')}</li>
            <li>{t('faq.a1_li4')}</li>
            <li>{t('faq.a1_li5')}</li>
            <li>{t('faq.a1_li6')}</li>
          </ol>
          <div className="pt-2">
            <Link to="/recarregar" className="inline-flex items-center text-[#1A237E] font-medium hover:underline decoration-2 underline-offset-4">
              {t('faq.a1_link')} <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
            </Link>
          </div>
        </div>
      )
    },
    {
      question: t('faq.q2'),
      answer: (
        <div className="space-y-4 text-gray-500 font-light text-[14px]">
          <p>{t('faq.a2_p1')}</p>
          <ul className="list-disc ml-6 space-y-3">
            <li>{t('faq.a2_li1')}</li>
            <li>{t('faq.a2_li2')}</li>
            <li>{t('faq.a2_li3')}</li>
            <li>{t('faq.a2_li4')}</li>
            <li>{t('faq.a2_li5')}</li>
          </ul>
          <div className="pt-2">
            <Link to="/retirada" className="inline-flex items-center text-[#1A237E] font-medium hover:underline decoration-2 underline-offset-4">
              {t('faq.a2_link')} <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
            </Link>
          </div>
        </div>
      )
    },
    {
      question: t('faq.q3'),
      answer: (
        <div className="space-y-4 text-gray-500 font-light text-[14px]">
          <p>{t('faq.a3_p1')}</p>
          <ol className="list-decimal ml-6 space-y-3">
            <li>{t('faq.a3_li1')}</li>
            <li>{t('faq.a3_li2')}</li>
            <li>{t('faq.a3_li3')}</li>
            <li>{t('faq.a3_li4')}</li>
          </ol>
          <Link to="/operacoes" className="inline-flex items-center text-[#1A237E] font-medium hover:underline decoration-2 underline-offset-4">
            {t('faq.a3_link')} <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
          </Link>
        </div>
      )
    },
    {
      question: t('faq.q4'),
      answer: (
        <div className="space-y-4 text-gray-500 font-light text-[14px]">
          <p>{t('faq.a4_p1')}</p>
          <p>{t('faq.a4_p2')}</p>
          <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50 text-[13px] text-[#1A237E]">
            <strong>{t('faq.a4_note')}</strong>
          </div>
          <Link to="/produtos" className="inline-flex items-center text-[#1A237E] font-medium hover:underline decoration-2 underline-offset-4">
            {t('faq.a4_link')} <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
          </Link>
        </div>
      )
    },
    {
      question: t('faq.q5'),
      answer: (
        <div className="space-y-4 text-gray-500 font-light text-[14px]">
          <p>{t('faq.a5_p1')}</p>
          <p>{t('faq.a5_p2')}</p>
          <Link to="/sobre-microsoft" className="inline-flex items-center text-[#1A237E] font-medium hover:underline decoration-2 underline-offset-4">
            {t('faq.a5_link')} <ChevronLeft className="w-4 h-4 ml-2 rotate-180" />
          </Link>
        </div>
      )
    },
    {
      question: "Quanto ganho se a minha equipa investir?",
      answer: (
        <div className="space-y-4 text-gray-500 font-light text-[14px]">
          <p>A plataforma recompensa você pelo desenvolvimento da sua equipa através do <strong>Bônus de Investimento</strong>, distribuído em 3 níveis.</p>
          
          <ul className="list-none space-y-3 mt-4 border-l-2 border-[#1A237E] pl-6 py-2 bg-[#F5F5F5] rounded-r-2xl">
            <li>
              <span className="font-medium text-[#333333]">Nível 1 (Diretos):</span> <span className="text-[#C62828] font-bold ml-2">10%</span>
            </li>
            <li>
              <span className="font-medium text-[#333333]">Nível 2 (indiretos):</span> <span className="text-[#C62828] font-bold ml-2">6%</span>
            </li>
            <li>
              <span className="font-medium text-[#333333]">Nível 3(Subindiretos):</span> <span className="text-[#C62828] font-bold ml-2">2%</span>
            </li>
          </ul>

          <div className="text-[12px] text-gray-400 italic">
            * Comissões pagas na primeira compra (min. 10.000 Kz)
          </div>
        </div>
      )
    },
    {
      question: "O sistema é seguro?",
      answer: (
        <div className="space-y-3 text-gray-500 font-light text-[14px]">
          <p>Sim. A segurança dos nossos utilizadores é a nossa prioridade número um:</p>
          <div className="grid grid-cols-1 gap-3 mt-4">
            <div className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-gray-50">
              <div className="w-2 h-2 rounded-full bg-[#1A237E]" />
              <span className="text-[#333333]">Encriptação de nível bancário</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-gray-50">
              <div className="w-2 h-2 rounded-full bg-[#C62828]" />
              <span className="text-[#333333]">Verificação de identidade robusta</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between sticky top-0 z-50 bg-white/80 backdrop-blur-md">
        <button 
          onClick={() => navigate('/suporte')} 
          className="w-10 h-10 flex items-center justify-start text-[#333333]"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[16px] font-medium text-[#333333] absolute left-1/2 -translate-x-1/2 text-center">
          Centro de Ajuda
        </h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 w-full max-w-[600px] px-6 pb-20 pt-6">
        <div className="space-y-3">
          {faqData.map((item, idx) => (
            <div key={idx} className="bg-[#F5F5F5] rounded-[24px] overflow-hidden transition-all duration-300 border border-gray-50">
              <button 
                onClick={() => toggleFAQ(idx)}
                className="w-full px-6 py-6 flex items-center justify-between text-left group"
              >
                <span className={cn(
                  "text-[15px] font-medium transition-colors pr-6",
                  openIndex === idx ? "text-[#1A237E]" : "text-[#333333]"
                )}>
                  {item.question}
                </span>
                <ChevronDown className={cn(
                  "w-5 h-5 transition-transform duration-300",
                  openIndex === idx ? "rotate-180 text-[#1A237E]" : "text-gray-300"
                )} />
              </button>
              
              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-8 pt-0 border-t border-white/50">
                      <div className="mt-6">
                        {item.answer}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Feedback Section */}
        <div className="mt-20 p-8 bg-[#F5F5F5] rounded-[32px] text-center space-y-6 border border-gray-50">
          <p className="text-[14px] font-medium text-[#333333]">{t('faq.feedback_useful')}</p>
          <div className="flex justify-center space-x-3">
            <button 
              onClick={() => showToast(t('faq.feedback_thanks'), 'success')}
              className="px-8 py-3 bg-white rounded-full text-[13px] font-medium text-[#333333] border border-gray-100 active:scale-95 transition-all"
            >
              {t('faq.yes')}
            </button>
            <button 
              onClick={() => navigate('/suporte')}
              className="px-8 py-3 bg-white rounded-full text-[13px] font-medium text-[#333333] border border-gray-100 active:scale-95 transition-all"
            >
              {t('faq.no')}
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
