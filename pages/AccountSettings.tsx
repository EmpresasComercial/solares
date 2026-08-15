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

function AccountSettingsSkeleton() {
  return (
    <div className="w-full min-h-screen bg-[#F2F2F2] pb-32 font-sans antialiased select-none flex flex-col items-center">
      <header className="w-full max-w-[480px] bg-white px-4 pt-4 pb-3 sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)] space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-none bg-gray-200 animate-pulse" />
          <div className="h-4 w-44 bg-gray-200 rounded-none animate-pulse" />
        </div>
      </header>

      <main className="w-full max-w-[480px] px-4 pt-4 space-y-2.5">
        <div className="bg-white rounded-none p-4 h-16 animate-pulse" />
        <div className="bg-white rounded-none p-4 h-40 animate-pulse" />
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
      } catch {
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
            {t('settings.title') || 'Configurações de Conta'}
          </h1>
        </div>
      </header>

      <main className="w-full max-w-[480px] px-4 pt-4 space-y-2.5">
        <div className="bg-white rounded-none p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-none bg-red-50 flex items-center justify-center text-[#FE384F] shrink-0">
                <Smartphone className="w-4 h-4 stroke-[1.8]" />
              </div>
              <div>
                <span className="text-[11px] text-[#888888] font-normal block leading-tight">
                  Código de Identificação
                </span>
                <span className="text-[13.5px] font-medium text-[#202020]">
                  ID: {profile?.invite_code || profile?.codigo_meu_refferal || '---'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-normal bg-emerald-50 px-2 py-0.5 rounded-none">
              <UserCheck className="w-3 h-3" />
              <span>Ativo</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-none shadow-[0_1px_2px_rgba(0,0,0,0.03)] divide-y divide-gray-100 overflow-hidden">
          <div className="flex items-center justify-between py-3 px-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-none bg-red-50 flex items-center justify-center text-[#FE384F] shrink-0">
                <Globe className="w-4 h-4 stroke-[1.8]" />
              </div>
              <span className="text-[13.5px] font-normal text-[#202020]">
                {t('settings.language')}
              </span>
            </div>
            <div className="flex items-center">
              <LanguageSelector variant="minimal" className="scale-90" />
            </div>
          </div>

          <div
            onClick={() => navigate('/alterar-senha')}
            className="flex items-center justify-between py-3 px-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-none bg-red-50 flex items-center justify-center text-[#FE384F] shrink-0">
                <Key className="w-4 h-4 stroke-[1.8]" />
              </div>
              <span className="text-[13.5px] font-normal text-[#202020]">
                {t('settings.change_password')}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#AAAAAA] stroke-[1.8]" />
          </div>

          <div
            onClick={() => navigate('/sobre-microsoft')}
            className="flex items-center justify-between py-3 px-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-none bg-red-50 flex items-center justify-center text-[#FE384F] shrink-0">
                <HelpCircle className="w-4 h-4 stroke-[1.8]" />
              </div>
              <span className="text-[13.5px] font-normal text-[#202020]">
                {t('profile.about') || 'Sobre AliExpress24'}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#AAAAAA] stroke-[1.8]" />
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-[#F2F2F2] p-3.5 z-40 flex justify-center border-t border-gray-200/50">
        <div className="w-full max-w-[480px]">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full h-[40px] rounded-none bg-[#FE384F] hover:bg-[#E02E44] active:scale-[0.99] text-white font-normal text-[13.5px] transition-all shadow-none flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4 stroke-[1.8]" />
            <span>{t('settings.logout') || 'Encerrar Sessão'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
