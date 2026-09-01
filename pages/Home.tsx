import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Award,
  UserPlus,
  Wallet,
  PlusCircle
} from 'lucide-react';
import { usePopup } from '../hooks/usePopup';
import { APP_CONFIG } from '../constants/config';
import { supabase } from '../lib/supabase';

// Componentes Oficiais do Layout 1688 / 1888
import { AliLeftWorkbench1688 } from './Home/components/AliLeftWorkbench1688';
import { AliTopBar1688 } from './Home/components/AliTopBar1688';
import { AliSearchBox1688 } from './Home/components/AliSearchBox1688';
import { AliCategorySidebar1688 } from './Home/components/AliCategorySidebar1688';
import { AliCentralDoor1688 } from './Home/components/AliCentralDoor1688';
import { AliUserCard1688 } from './Home/components/AliUserCard1688';
import { AliActivityRibbon1688 } from './Home/components/AliActivityRibbon1688';
import { AliRecommendFeed1688 } from './Home/components/AliRecommendFeed1688';
import { HeroSection } from './Home/components/HeroSection';
import { TradeTicker1688 } from './Home/components/TradeTicker1688';
import { AnnouncementPopup } from './Home/components/AnnouncementPopup';
import { SocialProofFeed } from './Home/components/SocialProofFeed';
import { SupportModal } from './Home/components/SupportModal';

export default function Home() {
  const navigate = useNavigate();

  const [communityLink, setCommunityLink] = useState<string | undefined>(undefined);
  const [telegramLink, setTelegramLink] = useState<string>('https://t.me');
  const [managerWaLink, setManagerWaLink] = useState<string | undefined>(undefined);
  const [showSupportModal, setShowSupportModal] = useState(false);

  useEffect(() => {
    supabase
      .from('atendimento_links')
      .select('whatsapp_grupo_vendas_url, whatsapp_gerente_url, telegram_url')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.whatsapp_grupo_vendas_url) setCommunityLink(data.whatsapp_grupo_vendas_url);
        if (data?.whatsapp_gerente_url) setManagerWaLink(data.whatsapp_gerente_url);
        if (data?.telegram_url) setTelegramLink(data.telegram_url);
      });
  }, []);

  const { isOpen: showPopup, close: closePopup } = usePopup({
    initialDelay: APP_CONFIG.POPUP_INITIAL_DELAY,
    autoCloseTime: APP_CONFIG.POPUP_AUTO_CLOSE_TIME
  });

  return (
    <div className="bg-[#F3F4F6] min-h-screen pb-24 overflow-x-hidden flex flex-col items-center font-sans antialiased text-[#191919] xl:pl-[72px]">
      
      {/* 0. Barra Lateral Fixa de Trabalho (AliBar Left Workbench) */}
      <AliLeftWorkbench1688 />

      {/* Popups e Modais de Suporte */}
      <AnnouncementPopup 
        isOpen={showPopup} 
        onClose={closePopup} 
        communityLink={communityLink}
      />

      <SupportModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        whatsappManagerUrl={managerWaLink}
        whatsappGroupUrl={communityLink || APP_CONFIG.WHATSAPP_COMMUNITY_LINK}
        telegramUrl={telegramLink}
      />

      {/* 1. Barra de Topo Oficial 1688 (AliBar SSR) */}
      <AliTopBar1688 onOpenSupport={() => setShowSupportModal(true)} />

      {/* 2. Barra de Busca Gigante Oficial 1688 (SearchBox com Abas) */}
      <AliSearchBox1688 onSearch={() => navigate('/produtos')} />

      {/* Container Principal Centralizado (Largura Máxima Adaptada) */}
      <main className="w-full max-w-[1440px] px-3 sm:px-6 pt-3 space-y-3">
        
        {/* Ticker de Notícias e Transações em Tempo Real */}
        <TradeTicker1688 />

        {/* 3. Grid Principal 1688 (Layout de 3 Colunas no Desktop / Empilhado no Mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
          
          {/* Coluna Esquerda: Mega Menu de Categorias 1688 (3 cols no Desktop) */}
          <div className="lg:col-span-3">
            <AliCategorySidebar1688 />
          </div>

          {/* Coluna Central: Banner Hero + 8 Portas Centrais 1688 (6 cols no Desktop) */}
          <div className="lg:col-span-6 space-y-3">
            {/* Banner Carousel de Fábrica */}
            <HeroSection />

            {/* As 8 Portas Centrais Oficiais 1688 (Dropshipping, Cross-Border, Amostras 50%, etc.) */}
            <AliCentralDoor1688 />
          </div>

          {/* Coluna Direita: Cartão do Usuário VIP 1688 (3 cols no Desktop) */}
          <div className="lg:col-span-3 space-y-3">
            <AliUserCard1688 />
          </div>

        </div>

        {/* 4. Faixa Horizontal de Atividades e Garantias Oficiais 1688 (Activity Ribbon) */}
        <AliActivityRibbon1688 />

        {/* 5. Ações Rápidas de Parceiro (Convidar, Recarregar, Retirar) */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-xs border border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => navigate('/convite')}
            className="h-[46px] bg-gradient-to-r from-[#FF6A00] via-[#FF5000] to-[#FF2A00] hover:opacity-95 active:scale-[0.99] text-white rounded-xl font-bold text-[13.5px] flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <UserPlus className="w-4.5 h-4.5 text-white" />
            <span>Convidar Parceiros & Bônus</span>
          </button>

          <button
            onClick={() => navigate('/recarregar')}
            className="h-[46px] bg-[#FFF3EB] border border-orange-200 hover:bg-[#FFE8DA] active:scale-[0.99] text-[#FF5000] rounded-xl font-bold text-[13.5px] flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
          >
            <PlusCircle className="w-4.5 h-4.5 text-[#FF5000]" />
            <span>Recarregar Saldo</span>
          </button>

          <button
            onClick={() => navigate('/retirada')}
            className="h-[46px] bg-white border border-gray-200 hover:border-[#FF5000] active:scale-[0.99] text-gray-800 hover:text-[#FF5000] rounded-xl font-semibold text-[13.5px] flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
          >
            <Wallet className="w-4.5 h-4.5 text-[#FF5000]" />
            <span>Solicitar Retirada</span>
          </button>
        </div>

        {/* 6. Feed Recomendado de Lotes de Fábrica 1688 (recommend-index-list) */}
        <AliRecommendFeed1688 />

        {/* 7. Vídeo Institucional / Tour de Fábrica */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#FF5000] rounded-full" />
              <h2 className="text-[15px] font-black text-[#191919]">
                1888 工厂实拍 • Tour da Fábrica em Produção
              </h2>
            </div>
            <span className="text-[11.5px] text-gray-400 font-medium">Shenzhen • Yiwu Industrial Base</span>
          </div>
          <div className="w-full max-w-[960px] bg-black rounded-2xl overflow-hidden border border-gray-100 relative aspect-video flex items-center justify-center shadow-xs">
            <video
              src="https://www.canadiansolar.com/wp-content/uploads/2019/12/Low-Bitrate-6.09mb.mp4"
              autoPlay
              loop
              muted
              playsInline
              controls
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* 8. Feed Social de Pagamentos e Comprovantes */}
        <SocialProofFeed />

      </main>

    </div>
  );
}
