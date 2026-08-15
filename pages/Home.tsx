import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  Wallet, 
  PlusCircle, 
  Volume2
} from 'lucide-react';
import { usePopup } from '../hooks/usePopup';
import { APP_CONFIG } from '../constants/config';
import { supabase } from '../lib/supabase';
import { HeroSection } from './Home/components/HeroSection';
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
    <div className="bg-[#FFFFFF] min-h-screen pb-24 overflow-x-hidden flex flex-col items-center font-sans">
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

      <div className="w-full max-w-[480px] flex flex-col bg-white">
        <HeroSection />

        <div className="px-3.5 py-2.5 bg-white border-b border-gray-100 flex items-center justify-between">
          <div 
            onClick={() => navigate('/suporte')}
            className="flex items-center gap-2 cursor-pointer text-[#222222] hover:text-[#C62828] transition-colors"
          >
            <Volume2 className="w-[18px] h-[18px] text-[#C62828] stroke-[2.2]" />
            <span className="text-[13px] font-normal tracking-tight text-[#222222]">
              Se precisar de ajuda, por favor clique &rarr;
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSupportModal(true)}
              className="w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center text-white hover:opacity-90 active:scale-95 transition-transform cursor-pointer"
              title="Suporte WhatsApp"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </button>

            <button
              type="button"
              onClick={() => navigate('/chat-comunidade')}
              className="w-7 h-7 rounded-full bg-[#0088cc] flex items-center justify-center text-white hover:opacity-90 active:scale-95 transition-transform cursor-pointer"
              title="Telegram AliExpress24"
            >
              <svg className="w-3.5 h-3.5 fill-current ml-[-1px]" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.949z"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="px-3 pt-3 pb-2 space-y-2.5">
          <button
            onClick={() => navigate('/convite')}
            className="w-full h-[44px] bg-[#FE384F] hover:bg-[#E02E44] active:scale-[0.99] text-white rounded-none font-normal text-[14px] flex items-center justify-center gap-2 transition-all shadow-none cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-white" />
            <span>Convidar amigos</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => navigate('/retirada')}
              className="h-[42px] bg-[#FE384F] hover:bg-[#E02E44] active:scale-[0.99] text-white rounded-none font-normal text-[13.5px] flex items-center justify-center gap-1.5 transition-all shadow-none cursor-pointer"
            >
              <Wallet className="w-4 h-4 text-white" />
              <span>Retirar</span>
            </button>
            <button
              onClick={() => navigate('/recarregar')}
              className="h-[42px] bg-[#FE384F] hover:bg-[#E02E44] active:scale-[0.99] text-white rounded-none font-normal text-[13.5px] flex items-center justify-center gap-1.5 transition-all shadow-none cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>Recarregar</span>
            </button>
          </div>
        </div>

        <div className="px-3 pb-4 flex flex-col items-center border-t border-gray-100 pt-3">
          <div className="w-full flex items-center justify-between mb-2">
            <h2 className="text-[14px] font-medium text-[#202020]">Tutoriais</h2>
          </div>
          <div className="w-full bg-black rounded-none overflow-hidden border border-gray-100 relative aspect-video flex items-center justify-center">
            <video
              src="https://www.canadiansolar.com/wp-content/uploads/2019/12/Low-Bitrate-6.09mb.mp4"
              autoPlay
              loop
              muted
              playsInline
              controls
              className="w-full h-full object-cover rounded-none"
            />
          </div>
        </div>

        <SocialProofFeed />
      </div>
    </div>
  );
}
