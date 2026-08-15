import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Building2, Sparkles, Globe, HeartHandshake, Award } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function AboutMicrosoft() {
  const navigate = useNavigate();
  const { t } = useLanguage();

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
            {t('about.title') || 'Sobre o AliExpress24'}
          </h1>

          <div className="w-9" />
        </div>
      </div>

      {/* 2. CONTEÚDO DOS CARDS */}
      <div className="max-w-[430px] mx-auto px-4 -mt-8 relative z-20 space-y-3.5">
        
        {/* Quem Somos */}
        <div className="bg-white rounded-[8px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100/60 p-5 space-y-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-[30px] h-[30px] rounded-[7px] bg-red-50 flex items-center justify-center text-[#C62828]">
              <Building2 className="w-4 h-4" />
            </div>
            <h2 className="text-[15px] font-semibold text-[#1A1C1E]">{t('about.who_we_are_title')}</h2>
          </div>
          <div className="text-[13px] text-[#475569] leading-relaxed space-y-2">
            <p>{t('about.who_we_are_p1')}</p>
            <p>{t('about.who_we_are_p2')}</p>
            <p>{t('about.who_we_are_p3')}</p>
          </div>
        </div>

        {/* Nossos Valores */}
        <div className="bg-white rounded-[8px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100/60 p-5 space-y-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-[30px] h-[30px] rounded-[7px] bg-red-50 flex items-center justify-center text-[#C62828]">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <h2 className="text-[15px] font-semibold text-[#1A1C1E]">{t('about.values_title')}</h2>
          </div>
          <div className="text-[13px] text-[#475569] leading-relaxed">
            <p>{t('about.values_list')}</p>
          </div>
        </div>

        {/* Liderança e Inovação */}
        <div className="bg-white rounded-[8px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100/60 p-5 space-y-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-[30px] h-[30px] rounded-[7px] bg-red-50 flex items-center justify-center text-[#C62828]">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-[15px] font-semibold text-[#1A1C1E]">{t('about.ai_title')}</h2>
          </div>
          <div className="text-[13px] text-[#475569] leading-relaxed">
            <p>{t('about.ai_content')}</p>
          </div>
        </div>

        {/* Em África */}
        <div className="bg-white rounded-[8px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100/60 p-5 space-y-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-[30px] h-[30px] rounded-[7px] bg-red-50 flex items-center justify-center text-[#C62828]">
              <Globe className="w-4 h-4" />
            </div>
            <h2 className="text-[15px] font-semibold text-[#1A1C1E]">{t('about.africa_title')}</h2>
          </div>
          <div className="text-[13px] text-[#475569] leading-relaxed space-y-2">
            <p>{t('about.africa_p1')}</p>
            <p>{t('about.africa_p2')}</p>
            <p>{t('about.africa_p3')}</p>
            <p>{t('about.africa_p4')}</p>
            <p>{t('about.africa_p5')}</p>
          </div>
        </div>

        {/* Impacto Global */}
        <div className="bg-white rounded-[8px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100/60 p-5 space-y-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-[30px] h-[30px] rounded-[7px] bg-red-50 flex items-center justify-center text-[#C62828]">
              <Award className="w-4 h-4" />
            </div>
            <h2 className="text-[15px] font-semibold text-[#1A1C1E]">{t('about.global_impact_title')}</h2>
          </div>
          <div className="text-[13px] text-[#475569] leading-relaxed space-y-2">
            <p>{t('about.dominance_p1')}</p>
            <p>{t('about.dominance_p2')}</p>
            <p>{t('about.modernization')}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
