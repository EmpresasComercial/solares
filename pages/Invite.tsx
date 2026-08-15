import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { Copy, Users, UserCheck, TrendingUp } from 'lucide-react';
import { InvitePageSkeleton } from '../components/Skeleton';

export default function Invite() {
  const { showToast } = useToast();
  const [activeLevel, setActiveLevel] = useState<'level1' | 'level2' | 'level3'>('level1');
  const [teamData, setTeamData] = useState<{ level1: any[]; level2: any[]; level3: any[] }>({
    level1: [],
    level2: [],
    level3: []
  });
  const [inviteCode, setInviteCode] = useState<string>('---');
  const [baseUrl, setBaseUrl] = useState<string>(window.location.origin);
  const [loading, setLoading] = useState(true);

  const inviteLink = `${baseUrl}/cadastro?join=${inviteCode}`;

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [settingsRes, teamRes, linksRes] = await Promise.all([
          supabase.rpc('get_my_settings_data_mcpn'),
          supabase.rpc('get_my_team_detailed'),
          supabase.from('atendimento_links').select('link_app_atualizado').maybeSingle()
        ]);

        if (settingsRes.data && settingsRes.data.length > 0) {
          setInviteCode(settingsRes.data[0].invite_code || '---');
        }

        if (teamRes.data && Array.isArray(teamRes.data)) {
          setTeamData({
            level1: teamRes.data.filter((m: any) => m.nivel === 1),
            level2: teamRes.data.filter((m: any) => m.nivel === 2),
            level3: teamRes.data.filter((m: any) => m.nivel === 3),
          });
        }

        if (linksRes.data?.link_app_atualizado) {
          setBaseUrl(linksRes.data.link_app_atualizado.replace(/\/$/, ''));
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copiado com sucesso!', 'success');
  }, [showToast]);

  const maskPhone = (phone: string) => {
    if (!phone) return '*** *** ***';
    const clean = phone.replace(/\D/g, '');
    const target = clean.length >= 9 ? clean.slice(-9) : clean;
    return `${target.substring(0, 3)} *** ${target.substring(6)}`;
  };

  const totalMembers = teamData.level1.length + teamData.level2.length + teamData.level3.length;

  if (loading) {
    return <InvitePageSkeleton />;
  }

  return (
    <div className="w-full min-h-screen bg-[#F2F2F2] pb-32 font-sans antialiased text-[#202020] select-none flex flex-col items-center">
      
      <header className="w-full max-w-[480px] bg-[#FFFFFF] px-4 pt-4 pb-3 sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <h1 className="text-[14.5px] font-medium text-[#202020] tracking-normal text-center">
          Equipe
        </h1>
      </header>

      <main className="w-full max-w-[480px] px-4 pt-4 space-y-3">
        
        <div className="bg-[#FFFFFF] rounded-none p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-[#666666] font-normal">Código de Convite</span>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-mono font-medium text-[#202020] tracking-wide">{inviteCode}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(inviteCode)}
                className="p-1 text-[#888888] hover:text-[#FE384F] active:scale-90 transition-transform"
                title="Copiar código"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-[#F8F9FA] p-2.5 rounded-none flex items-center justify-between border border-gray-100">
            <span className="text-[12px] text-[#777777] font-normal truncate mr-2">{inviteLink}</span>
            <button
              type="button"
              onClick={() => copyToClipboard(inviteLink)}
              className="text-[12px] text-[#FE384F] font-medium shrink-0 hover:underline"
            >
              Copiar
            </button>
          </div>

          <p className="text-[11.5px] text-[#888888] leading-relaxed">
            Partilhe o seu link exclusivo para construir a sua equipa e acumular comissões diárias.
          </p>
        </div>

        <div className="bg-[#FFFFFF] rounded-none p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[#202020]">
              <Users className="w-4 h-4 text-[#FE384F]" />
              <span className="text-[13.5px] font-medium">Membros da Equipe</span>
            </div>
            <span className="text-[12px] text-[#777777] font-normal">Total: {totalMembers}</span>
          </div>

          <div className="grid grid-cols-3 gap-1 bg-[#F2F2F2] p-0.5 rounded-none">
            {(['level1', 'level2', 'level3'] as const).map((lvl, idx) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setActiveLevel(lvl)}
                className={cn(
                  'py-2 text-[12px] font-normal transition-all rounded-none flex items-center justify-center gap-1 cursor-pointer',
                  activeLevel === lvl
                    ? 'bg-white text-[#FE384F] shadow-xs'
                    : 'text-[#666666] hover:text-[#202020]'
                )}
              >
                <span>Nível {idx + 1}</span>
                <span className="text-[10.5px] opacity-75">({teamData[lvl]?.length || 0})</span>
              </button>
            ))}
          </div>

          <div className="space-y-2 min-h-[140px] pt-1">
            {teamData[activeLevel].length > 0 ? (
              teamData[activeLevel].map((person: any, i: number) => (
                <div
                  key={i}
                  className="bg-[#FAFAFA] border border-gray-100 rounded-none p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-none bg-red-50 flex items-center justify-center text-[#FE384F]">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12.5px] font-medium text-[#202020]">
                        {maskPhone(person.telefone)}
                      </span>
                      <span className="text-[11px] text-[#888888]">
                        {new Date(person.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-0.5">
                    <span className="text-[12.5px] font-medium text-[#202020]">
                      {Number(person.total_investido || 0).toLocaleString()} Kz
                    </span>
                    <span
                      className={cn(
                        'text-[10px] px-1.5 py-0.5 font-normal rounded-none',
                        Number(person.total_investido) > 0
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-gray-100 text-gray-400'
                      )}
                    >
                      {Number(person.total_investido) > 0 ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 flex flex-col items-center justify-center text-center space-y-2 text-[#888888]">
                <TrendingUp className="w-5 h-5 text-gray-300" />
                <p className="text-[12px] font-normal">Nenhum membro registrado neste nível.</p>
              </div>
            )}
          </div>
        </div>

      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-[#F2F2F2] p-3.5 z-40 flex justify-center border-t border-gray-200/50">
        <div className="w-full max-w-[480px]">
          <button
            type="button"
            onClick={() => copyToClipboard(inviteLink)}
            className="w-full h-[40px] rounded-none bg-[#FE384F] hover:bg-[#E02E44] active:scale-[0.99] text-[#FFFFFF] font-normal text-[13.5px] transition-all shadow-none flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copiar link de convite</span>
          </button>
        </div>
      </div>

    </div>
  );
}
