import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { Copy, Users, UserCheck, TrendingUp, Award, ShieldCheck, Share2, Sparkles, Building2 } from 'lucide-react';
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
    <div className="w-full min-h-screen bg-[#F5F6F8] pb-32 font-sans antialiased text-[#202020] select-none flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-[480px] bg-white px-4 pt-4 pb-3 sticky top-0 z-30 shadow-2xs border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[20px] font-black italic text-[#FF5000]">1888</span>
          <h1 className="text-[15px] font-bold text-gray-900 tracking-tight">
            Programa de Parceiros & Comissões
          </h1>
        </div>
        <span className="text-[10.5px] font-bold bg-orange-100 text-[#FF5000] px-2 py-0.5 rounded-full">
          B2B VIP
        </span>
      </header>

      <main className="w-full max-w-[480px] px-3.5 pt-3 space-y-3">
        {/* Banner do Programa */}
        <div className="bg-gradient-to-br from-[#FF6A00] via-[#FF5000] to-[#FF2500] rounded-2xl p-5 text-white shadow-sm relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-1.5 bg-white/20 px-2.5 py-0.5 rounded-full w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Comissão Multinível 1888</span>
            </div>
            <h2 className="text-[18px] font-black leading-tight">
              Indique novos compradores e ganhe bônus diários
            </h2>
            <p className="text-[12px] text-white/90 font-normal">
              Receba comissões automáticas sempre que sua equipe encomendar lotes de fábrica.
            </p>
          </div>
          <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-white/10 rounded-full blur-xl" />
        </div>

        {/* Caixa de Código e Link de Convite */}
        <div className="bg-white rounded-2xl p-4 shadow-2xs border border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-gray-500 font-medium">Seu Código de Convite</span>
            <div className="flex items-center gap-2">
              <span className="text-[16px] font-mono font-bold text-[#FF5000] tracking-wider bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                {inviteCode}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(inviteCode)}
                className="p-1.5 text-gray-500 hover:text-[#FF5000] active:scale-90 transition-transform cursor-pointer bg-gray-50 rounded-md"
                title="Copiar código"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-[#FAF8F5] p-3 rounded-xl flex items-center justify-between border border-orange-100">
            <span className="text-[12px] text-gray-600 font-mono truncate mr-2">{inviteLink}</span>
            <button
              type="button"
              onClick={() => copyToClipboard(inviteLink)}
              className="text-[12px] text-white font-bold bg-[#FF5000] hover:bg-[#E03E00] px-3 py-1 rounded-lg shrink-0 transition-colors shadow-2xs cursor-pointer"
            >
              Copiar Link
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="bg-orange-50/60 p-2 rounded-xl border border-orange-100">
              <span className="text-[10.5px] text-gray-500 block">Nível 1</span>
              <span className="text-[13px] font-bold text-[#FF5000]">8%</span>
            </div>
            <div className="bg-orange-50/60 p-2 rounded-xl border border-orange-100">
              <span className="text-[10.5px] text-gray-500 block">Nível 2</span>
              <span className="text-[13px] font-bold text-[#FF5000]">3%</span>
            </div>
            <div className="bg-orange-50/60 p-2 rounded-xl border border-orange-100">
              <span className="text-[10.5px] text-gray-500 block">Nível 3</span>
              <span className="text-[13px] font-bold text-[#FF5000]">1%</span>
            </div>
          </div>
        </div>

        {/* Membros da Equipe */}
        <div className="bg-white rounded-2xl p-4 shadow-2xs border border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-[#FF5000]" />
              <span className="text-[14px] font-bold text-gray-900">Membros da Equipe</span>
            </div>
            <span className="text-[12px] font-bold text-[#FF5000] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
              Total: {totalMembers}
            </span>
          </div>

          {/* Abas dos Níveis */}
          <div className="grid grid-cols-3 gap-1.5 bg-[#F5F6F8] p-1 rounded-xl">
            {(['level1', 'level2', 'level3'] as const).map((lvl, idx) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setActiveLevel(lvl)}
                className={cn(
                  'py-2 text-[12px] font-bold transition-all rounded-lg flex items-center justify-center gap-1 cursor-pointer',
                  activeLevel === lvl
                    ? 'bg-white text-[#FF5000] shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
                )}
              >
                <span>Nível {idx + 1}</span>
                <span className="text-[11px] opacity-80">({teamData[lvl]?.length || 0})</span>
              </button>
            ))}
          </div>

          {/* Lista de Membros */}
          <div className="space-y-2 pt-1">
            {teamData[activeLevel].length > 0 ? (
              teamData[activeLevel].map((member, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 bg-[#FAFAFA] rounded-xl border border-gray-100 text-[12.5px]"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-orange-100 text-[#FF5000] flex items-center justify-center font-bold text-[11px]">
                      {i + 1}
                    </div>
                    <span className="font-mono font-medium text-gray-800">
                      {maskPhone(member.telefone || member.phone)}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400">
                    {member.created_at ? new Date(member.created_at).toLocaleDateString('pt-AO') : 'Ativo'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400 text-[13px]">
                <p>Nenhum membro ativo neste nível</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Compartilhe seu link para começar a expandir</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
