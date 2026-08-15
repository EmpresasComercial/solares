import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { supabase } from '../lib/supabase';
import { 
  ChevronLeft, 
  ChevronRight, 
  LogOut,
  Key,
  HelpCircle,
  Globe,
  Smartphone
} from 'lucide-react';
import { AccountSettingsSkeleton } from '../components/Skeleton';

export default function AccountSettings() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data, error } = await supabase.rpc('get_my_settings_data_mcpn');
        if (error) throw error;
        if (data && data.length > 0) {
          setProfile(data[0]);
        }
      } catch (err: any) {
        console.error('Falhou, recarregue a pagina', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return <AccountSettingsSkeleton />;
  }

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] pb-28 font-sans antialiased text-[#1A1C1E] select-none">
      
      {/* 1. HEADER VERMELHO #C62828 */}
      <div className="relative bg-gradient-to-br from-[#D32F2F] via-[#C62828] to-[#B71C1C] pt-7 pb-16 px-5 text-white overflow-hidden">
        
        {/* Veios geométricos orgânicos de folha */}
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

        {/* Barra superior de navegação */}
        <div className="relative z-10 flex items-center justify-between max-w-[430px] mx-auto w-full">
          <button
            onClick={() => navigate('/perfil')}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white active:scale-95 transition-transform"
            aria-label={t('common.back')}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <h1 className="text-[17px] font-semibold text-white tracking-tight">
            {t('settings.title')}
          </h1>

          <div className="w-9" />
        </div>
      </div>

      {/* 2. CONTEÚDO DOS CARDS */}
      <div className="max-w-[430px] mx-auto px-4 -mt-8 relative z-20 space-y-3.5">
        
        {/* CARD 1: DADOS DA CONTA (ID) */}
        <div className="bg-white rounded-[8px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100/60 overflow-hidden divide-y divide-gray-100">
          <div className="flex items-center py-3.5 px-4.5 space-x-3.5">
            <div className="w-[30px] h-[30px] rounded-[7px] bg-red-50 flex items-center justify-center text-[#C62828] shrink-0 p-1">
              <Smartphone className="w-4 h-4" />
            </div>
            <span className="text-[14px] font-semibold text-[#1A1C1E] tracking-tight">
              ID: {loading ? '...' : (profile?.codigo_meu_refferal || profile?.invite_code || '---')}
            </span>
          </div>
        </div>

        {/* CARD 2: PREFERÊNCIAS E SEGURANÇA */}
        <div className="bg-white rounded-[8px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100/60 overflow-hidden divide-y divide-gray-100">
          
          {/* Idioma */}
          <div className="flex items-center justify-between py-3.5 px-4.5">
            <div className="flex items-center space-x-3.5">
              <div className="w-[30px] h-[30px] rounded-[7px] bg-red-50 flex items-center justify-center text-[#C62828] shrink-0 p-1">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-[14px] font-semibold text-[#1A1C1E] tracking-tight">
                {t('settings.language')}
              </span>
            </div>
            <div className="flex items-center">
              <LanguageSelector variant="minimal" className="scale-90" />
            </div>
          </div>

          {/* Alterar Senha */}
          <div
            onClick={() => navigate('/alterar-senha')}
            className="flex items-center justify-between py-3.5 px-4.5 hover:bg-gray-50/60 active:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-[30px] h-[30px] rounded-[7px] bg-red-50 flex items-center justify-center text-[#C62828] shrink-0 p-1">
                <Key className="w-4 h-4" />
              </div>
              <span className="text-[14px] font-semibold text-[#1A1C1E] tracking-tight">
                {t('settings.change_password')}
              </span>
            </div>
            <svg className="w-3.5 h-3.5 text-[#C4C8CC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>

          {/* Sobre AliExpress24 */}
          <div
            onClick={() => navigate('/sobre-microsoft')}
            className="flex items-center justify-between py-3.5 px-4.5 hover:bg-gray-50/60 active:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-[30px] h-[30px] rounded-[7px] bg-red-50 flex items-center justify-center text-[#C62828] shrink-0 p-1">
                <HelpCircle className="w-4 h-4" />
              </div>
              <span className="text-[14px] font-semibold text-[#1A1C1E] tracking-tight">
                {t('profile.about')}
              </span>
            </div>
            <svg className="w-3.5 h-3.5 text-[#C4C8CC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>

        </div>

        {/* CARD 3: TERMINAR SESSÃO (LOGOUT) */}
        <div className="bg-white rounded-[8px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100/60 overflow-hidden">
          <div
            onClick={handleLogout}
            className="flex items-center justify-between py-3.5 px-4.5 hover:bg-red-50/50 active:bg-red-100/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-[30px] h-[30px] rounded-[7px] bg-red-50 flex items-center justify-center text-red-500 shrink-0 p-1">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="text-[14px] font-semibold text-red-600 tracking-tight">
                {t('settings.logout')}
              </span>
            </div>
            <svg className="w-3.5 h-3.5 text-red-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
}
