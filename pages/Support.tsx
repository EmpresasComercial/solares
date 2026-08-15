import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { ChevronLeft, Search, Users, ChevronRight, Headphones, Clock } from 'lucide-react';

export default function Support() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [links, setLinks] = useState<any>(null);

  useEffect(() => {
    async function fetchLinks() {
      const { data } = await supabase
        .from('atendimento_links')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (data) setLinks(data);
    }
    fetchLinks();
  }, []);

  const openLink = (url: string | null) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      showToast('Suporte indisponível no momento.', 'error');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F2F2F2] pb-20 font-sans antialiased text-[#202020] select-none flex flex-col items-center">
      <header className="w-full max-w-[480px] bg-white px-4 pt-4 pb-3 sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/perfil')} 
            className="p-1 -ml-1 text-[#202020] active:scale-95 transition-transform"
            aria-label="Voltar"
          >
            <ChevronLeft className="w-5 h-5 stroke-[1.8]" />
          </button>
          <h1 className="text-[14.5px] font-medium text-[#202020] tracking-normal">
            Suporte AliExpress24
          </h1>
        </div>
      </header>

      <main className="w-full max-w-[480px] px-4 pt-4 space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-[#AAAAAA]" />
          </div>
          <button
            onClick={() => navigate('/help-faq')}
            className="w-full h-[46px] pl-11 pr-4 bg-white rounded-none text-[13.5px] text-[#AAAAAA] font-normal text-left outline-none shadow-[0_1px_2px_rgba(0,0,0,0.03)] cursor-pointer"
          >
            Procurar respostas...
          </button>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => openLink(links?.whatsapp_gerente_url)}
            className="w-full h-[46px] px-4 bg-white rounded-none text-[#202020] flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Headphones className="w-4.5 h-4.5 text-[#FE384F]" />
              <span className="text-[13.5px] font-normal">Contactar Gerente</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#CCCCCC]" />
          </button>

          <button
            onClick={() => openLink(links?.whatsapp_grupo_vendas_url)}
            className="w-full h-[46px] px-4 bg-white rounded-none text-[#202020] flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Users className="w-4.5 h-4.5 text-[#FE384F]" />
              <span className="text-[13.5px] font-normal">Entrar grupo WhatsApp</span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#CCCCCC]" />
          </button>
        </div>

        <div className="p-3.5 bg-white rounded-none flex items-start gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <Clock className="w-4.5 h-4.5 text-[#888888] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-[13px] font-medium text-[#202020]">Horário de Luanda</h4>
            <p className="text-[11.5px] text-[#777777] font-normal mt-0.5">Segunda a Sábado: 10h às 22h</p>
          </div>
        </div>
      </main>
    </div>
  );
}
