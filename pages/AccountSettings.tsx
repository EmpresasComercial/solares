import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { supabase } from '../lib/supabase';
import { 
  ChevronLeft, 
  ChevronRight, 
  Key, 
  HelpCircle, 
  Globe, 
  Smartphone, 
  LogOut,
  UserCheck
} from 'lucide-react';

/* ─── Skeleton Loading ─────────────────────────────────────── */
function AccountSettingsSkeleton() {
  return (
    <div className="w-full min-h-screen bg-[#F2F2F2] pb-32 font-sans antialiased select-none flex flex-col items-center">
      <header className="w-full max-w-[480px] bg-[#FFFFFF] px-4 pt-4 pb-3 sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-gray-200 animate-pulse" />
          <div className="h-5 w-44 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-3.5 w-60 bg-gray-200 rounded animate-pulse ml-8" />
      </header>

      <main className="w-full max-w-[480px] px-4 pt-4 space-y-3">
        <div className="bg-[#FFFFFF] rounded-[10px] p-4 h-20 animate-pulse" />
        <div className="bg-[#FFFFFF] rounded-[10px] p-4 h-48 animate-pulse" />
      </main>
    </div>
  );
}

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
    <div className="w-full min-h-screen bg-[#F2F2F2] pb-32 font-sans antialiased text-[#202020] select-none flex flex-col items-center">
      
      {/* ═════════════════════════════════════════════════════
          1. HEADER (Design System AddBank)
      ══════════════════════════════════════════════════════ */}
      <header className="w-full max-w-[480px] bg-[#FFFFFF] px-4 pt-4 pb-3 sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/perfil')}
            className="p-1 -ml-1 text-[#202020] active:scale-95 transition-transform"
            aria-label={t('common.back')}
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
          </button>
          
          <h1 className="text-[18px] font-bold text-[#202020] tracking-tight">
            {t('settings.title') || 'Configurações de Conta'}
          </h1>
        </div>
      </header>

      {/* ═════════════════════════════════════════════════════
          2. CONTEÚDO PRINCIPAL (Cards estilo AddBank)
      ══════════════════════════════════════════════════════ */}
      <main className="w-full max-w-[480px] px-4 pt-4 space-y-3">
        
        {/* CARD 1: DADOS DA CONTA */}
        <div className="bg-[#FFFFFF] rounded-[10px] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-[34px] h-[34px] rounded-[8px] bg-red-50 flex items-center justify-center text-[#FE384F] shrink-0">
                <Smartphone className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <span className="text-[12px] text-[#8A929A] font-medium block leading-tight">
                  Código de Identificação
                </span>
                <span className="text-[15px] font-bold text-[#202020] tracking-tight">
                  ID: {profile?.invite_code || profile?.codigo_meu_refferal || '---'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-[12px] text-[#38A98B] font-semibold bg-emerald-50 px-2 py-1 rounded-full">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Ativo</span>
            </div>
          </div>
        </div>

        {/* CARD 2: PREFERÊNCIAS E SEGURANÇA */}
        <div className="bg-[#FFFFFF] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] divide-y divide-gray-100 overflow-hidden">
          
          {/* Idioma */}
          <div className="flex items-center justify-between py-3.5 px-4">
            <div className="flex items-center gap-3">
              <div className="w-[34px] h-[34px] rounded-[8px] bg-red-50 flex items-center justify-center text-[#FE384F] shrink-0">
                <Globe className="w-4 h-4 stroke-[2]" />
              </div>
              <span className="text-[14.5px] font-semibold text-[#202020] tracking-tight">
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
            className="flex items-center justify-between py-3.5 px-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-[34px] h-[34px] rounded-[8px] bg-red-50 flex items-center justify-center text-[#FE384F] shrink-0">
                <Key className="w-4 h-4 stroke-[2]" />
              </div>
              <span className="text-[14.5px] font-semibold text-[#202020] tracking-tight">
                {t('settings.change_password')}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#A6A6A6] stroke-[2]" />
          </div>

          {/* Sobre AliExpress24 */}
          <div
            onClick={() => navigate('/sobre-microsoft')}
            className="flex items-center justify-between py-3.5 px-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-[34px] h-[34px] rounded-[8px] bg-red-50 flex items-center justify-center text-[#FE384F] shrink-0">
                <HelpCircle className="w-4 h-4 stroke-[2]" />
              </div>
              <span className="text-[14.5px] font-semibold text-[#202020] tracking-tight">
                {t('profile.about') || 'Sobre AliExpress24'}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#A6A6A6] stroke-[2]" />
          </div>

        </div>

      </main>

      {/* ═════════════════════════════════════════════════════
          3. BARRA INFERIOR FIXA COM BOTÃO VERMELHO "Encerrar Sessão"
      ══════════════════════════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#F2F2F2] p-4 z-40 flex justify-center border-t border-gray-200/50">
        <div className="w-full max-w-[480px]">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full h-[48px] rounded-full bg-[#FE384F] hover:bg-[#E02E44] active:scale-[0.99] text-[#FFFFFF] font-bold text-[16px] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4 stroke-[2.2]" />
            <span>{t('settings.logout') || 'Encerrar Sessão'}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
