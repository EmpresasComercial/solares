import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { 
  ChevronLeft, 
  Copy, 
  Users, 
  User, 
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { InvitePageSkeleton } from '../components/Skeleton';

export default function Invite() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [activeLevel, setActiveLevel] = useState<'level1' | 'level2' | 'level3'>('level1');
  const [teamData, setTeamData] = useState<any>({ level1: [], level2: [], level3: [] });
  const [inviteCode, setInviteCode] = useState<string>('---');
  const [baseUrl, setBaseUrl] = useState<string>(window.location.origin);
  const [loading, setLoading] = useState(true);
  
  const inviteLink = `${baseUrl}/cadastro?join=${inviteCode}`;

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: settingsData } = await supabase.rpc('get_my_settings_data_mcpn');
        if (settingsData && settingsData.length > 0) {
          setInviteCode(settingsData[0].invite_code || '---');
        }

        const { data: teamList } = await supabase.rpc('get_my_team_detailed');
        if (teamList && Array.isArray(teamList)) {
          setTeamData({
            level1: teamList.filter((m: any) => m.nivel === 1),
            level2: teamList.filter((m: any) => m.nivel === 2),
            level3: teamList.filter((m: any) => m.nivel === 3),
          });
        }

        const { data: linksData } = await supabase.from('atendimento_links').select('link_app_atualizado').maybeSingle();
        if (linksData?.link_app_atualizado) {
          setBaseUrl(linksData.link_app_atualizado.replace(/\/$/, ''));
        }
      } catch (err: any) {
        console.error('Falhou, recarregue a pagina', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast(t('invite.copy_toast') || 'Copiado com sucesso!', 'success');
  };

  const maskPhone = (phone: string) => {
    if (!phone) return '*** *** ***';
    const clean = phone.replace(/\D/g, '');
    const target = clean.length >= 9 ? clean.slice(-9) : clean;
    return `${target.substring(0, 3)} *** ${target.substring(6)}`;
  };

  if (loading) {
    return <InvitePageSkeleton />;
  }

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
            {t('invite.title') || 'Convide Amigos'}
          </h1>

          <div className="w-9" />
        </div>
      </div>

      {/* 2. CONTEÚDO DOS CARDS */}
      <div className="max-w-[430px] mx-auto px-4 -mt-8 relative z-20 space-y-3.5">
        
        {/* CARD DO CÓDIGO DE CONVITE */}
        <div className="bg-white rounded-[8px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100/60 p-5 text-center space-y-4">
          <div>
            <p className="text-[13px] text-[#64748B] font-medium">Código de Convite</p>
            <h2 className="text-[26px] font-bold text-[#1A1C1E] tracking-tight mt-0.5">{inviteCode}</h2>
          </div>
          
          <button
            onClick={() => copyToClipboard(inviteLink)}
            className="w-full h-[46px] rounded-[8px] bg-gradient-to-r from-[#D32F2F] to-[#B71C1C] text-white font-semibold text-[15px] flex items-center justify-center gap-2 active:scale-[0.99] transition-all shadow-sm cursor-pointer"
          >
            <Copy className="w-4 h-4 text-white" />
            <span>Copiar Link de Convite</span>
          </button>
          
          <p className="text-[12.5px] text-[#64748B] max-w-[280px] mx-auto leading-relaxed">
            Partilhe o seu link exclusivo para construir a sua equipa e acumular comissões diárias.
          </p>
        </div>

        {/* SEÇÃO DA EQUIPA */}
        <div className="space-y-3 pt-2">
          
          <div className="flex items-center space-x-2 px-1">
            <div className="w-[26px] h-[26px] rounded-[6px] bg-red-50 flex items-center justify-center text-[#C62828]">
              <Users className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-[14px] font-semibold text-[#1A1C1E]">Minha Equipa</h3>
          </div>

          {/* Tabs de Níveis */}
          <div className="flex bg-gray-100/80 p-1 rounded-[8px] gap-1">
            {['level1', 'level2', 'level3'].map((lvl, idx) => (
              <button
                key={lvl}
                onClick={() => setActiveLevel(lvl as any)}
                className={cn(
                  "flex-1 py-2 rounded-[6px] text-[13px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                  activeLevel === lvl 
                    ? "bg-white text-[#1A1C1E] shadow-xs" 
                    : "text-[#64748B] hover:text-[#1A1C1E]"
                )}
              >
                <span>Nível {idx + 1}</span>
                <span className="text-[11px] text-[#94A3B8]">({teamData[lvl]?.length || 0})</span>
              </button>
            ))}
          </div>

          {/* Lista de Membros */}
          <div className="space-y-2 min-h-[160px]">
            <AnimatePresence mode="wait">
              {teamData[activeLevel].length > 0 ? (
                <motion.div 
                  key={activeLevel}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="space-y-2"
                >
                  {teamData[activeLevel].map((person: any, i: number) => (
                    <div key={i} className="bg-white border border-gray-100/60 rounded-[8px] p-3.5 flex items-center justify-between shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                      <div className="flex items-center gap-3">
                        <div className="w-[34px] h-[34px] rounded-[7px] bg-red-50 flex items-center justify-center text-[#C62828]">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13.5px] font-semibold text-[#1A1C1E]">{maskPhone(person.telefone)}</span>
                          <span className="text-[11.5px] text-[#94A3B8]">
                            {new Date(person.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className="text-[14px] font-bold text-[#1A1C1E]">
                          {Number(person.total_investido).toLocaleString()} Kz
                        </span>
                        <div className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-semibold",
                          Number(person.total_investido) > 0 
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                            : "bg-gray-100 text-gray-400"
                        )}>
                          {Number(person.total_investido) > 0 ? 'Ativo' : 'Inativo'}
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-[8px] border border-gray-100/60 p-8 flex flex-col items-center justify-center text-center space-y-2.5 shadow-xs"
                >
                  <div className="w-10 h-10 rounded-[8px] bg-gray-100 flex items-center justify-center text-[#94A3B8]">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <p className="text-[#64748B] text-[13px] font-medium">Ainda não tens membros registados neste nível.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  );
}
