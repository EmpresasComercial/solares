import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Building2, Sparkles, Globe, HeartHandshake, Award } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function AboutMicrosoft() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="w-full min-h-screen bg-[#F2F2F2] pb-20 font-sans antialiased text-[#202020] select-none flex flex-col items-center">
      <header className="w-full max-w-[480px] bg-white px-4 pt-4 pb-3 sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/perfil')}
            className="p-1 -ml-1 text-[#202020] active:scale-95 transition-transform"
            aria-label={t('common.back')}
          >
            <ChevronLeft className="w-5 h-5 stroke-[1.8]" />
          </button>
          
          <h1 className="text-[14.5px] font-medium text-[#202020] tracking-normal">
            {t('about.title') || 'Sobre o AliExpress24'}
          </h1>
        </div>
      </header>

      <main className="w-full max-w-[480px] px-4 pt-4 space-y-2.5">
        <div className="bg-white rounded-none shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-none bg-red-50 flex items-center justify-center text-[#FE384F]">
              <Building2 className="w-4 h-4" />
            </div>
            <h2 className="text-[13.5px] font-medium text-[#202020]">{t('about.who_we_are_title')}</h2>
          </div>
          <div className="text-[12.5px] text-[#666666] leading-relaxed space-y-1.5">
            <p>{t('about.who_we_are_p1')}</p>
            <p>{t('about.who_we_are_p2')}</p>
            <p>{t('about.who_we_are_p3')}</p>
          </div>
        </div>

        <div className="bg-white rounded-none shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-none bg-red-50 flex items-center justify-center text-[#FE384F]">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <h2 className="text-[13.5px] font-medium text-[#202020]">{t('about.values_title')}</h2>
          </div>
          <div className="text-[12.5px] text-[#666666] leading-relaxed">
            <p>{t('about.values_list')}</p>
          </div>
        </div>

        <div className="bg-white rounded-none shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-none bg-red-50 flex items-center justify-center text-[#FE384F]">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-[13.5px] font-medium text-[#202020]">{t('about.ai_title')}</h2>
          </div>
          <div className="text-[12.5px] text-[#666666] leading-relaxed">
            <p>{t('about.ai_content')}</p>
          </div>
        </div>

        <div className="bg-white rounded-none shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-none bg-red-50 flex items-center justify-center text-[#FE384F]">
              <Globe className="w-4 h-4" />
            </div>
            <h2 className="text-[13.5px] font-medium text-[#202020]">{t('about.africa_title')}</h2>
          </div>
          <div className="text-[12.5px] text-[#666666] leading-relaxed space-y-1.5">
            <p>{t('about.africa_p1')}</p>
            <p>{t('about.africa_p2')}</p>
            <p>{t('about.africa_p3')}</p>
            <p>{t('about.africa_p4')}</p>
            <p>{t('about.africa_p5')}</p>
          </div>
        </div>

        <div className="bg-white rounded-none shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-none bg-red-50 flex items-center justify-center text-[#FE384F]">
              <Award className="w-4 h-4" />
            </div>
            <h2 className="text-[13.5px] font-medium text-[#202020]">{t('about.global_impact_title')}</h2>
          </div>
          <div className="text-[12.5px] text-[#666666] leading-relaxed space-y-1.5">
            <p>{t('about.dominance_p1')}</p>
            <p>{t('about.dominance_p2')}</p>
            <p>{t('about.modernization')}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
