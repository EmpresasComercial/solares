import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  Wallet, 
  PlusCircle, 
  Volume2,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { usePopup } from '../hooks/usePopup';
import { APP_CONFIG } from '../constants/config';
import { supabase } from '../lib/supabase';
import { HeroSection } from './Home/components/HeroSection';
import { AnnouncementPopup } from './Home/components/AnnouncementPopup';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [communityLink, setCommunityLink] = useState<string | undefined>(undefined);
  const [telegramLink, setTelegramLink] = useState<string>('https://t.me');

  useEffect(() => {
    supabase.from('atendimento_links').select('whatsapp_grupo_vendas_url, telegram_url').limit(1).maybeSingle()
      .then(({ data }) => {
        if (data?.whatsapp_grupo_vendas_url) setCommunityLink(data.whatsapp_grupo_vendas_url);
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

      <div className="w-full max-w-[480px] flex flex-col bg-white">
        {/* ─── MANTER INTACTO: 1. Carrossel / HeroSection ─── */}
        <HeroSection />

        {/* ─── MANTER INTACTO: 2. Barra de Ajuda + WhatsApp + Telegram ─── */}
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
            {/* WhatsApp */}
            <a 
              href={communityLink || APP_CONFIG.WHATSAPP_COMMUNITY_LINK} 
              target="_blank" 
              rel="noreferrer"
              className="w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center text-white hover:opacity-90 active:scale-95 transition-transform"
              title="WhatsApp"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </a>

            {/* Telegram */}
            <a 
              href={telegramLink} 
              target="_blank" 
              rel="noreferrer"
              className="w-7 h-7 rounded-full bg-[#0088cc] flex items-center justify-center text-white hover:opacity-90 active:scale-95 transition-transform"
              title="Telegram"
            >
              <svg className="w-3.5 h-3.5 fill-current ml-[-1px]" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.949z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            A PARTIR DAQUI: Replicar design da imagem de referência AliExpress
        ════════════════════════════════════════════════════════════════ */}

        {/* ─── 3. Botões de Ação ─── */}
        <div className="px-3 pt-3 pb-2 space-y-2.5">
          {/* Botão Convide Amigos */}
          <button
            onClick={() => navigate('/convite')}
            className="w-full h-[48px] bg-[#FF2442] hover:bg-[#E02038] active:scale-[0.99] text-white rounded-[8px] font-semibold text-[15px] flex items-center justify-center gap-2.5 transition-all"
          >
            <UserPlus className="w-5 h-5 text-white" strokeWidth={2.2} />
            <span>Convidar amigos</span>
          </button>

          {/* Grid: Retirar + Recarregar */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => navigate('/retirada')}
              className="h-[48px] bg-[#FF2442] hover:bg-[#E02038] active:scale-[0.99] text-white rounded-[8px] font-semibold text-[15px] flex items-center justify-center gap-2 transition-all"
            >
              <Wallet className="w-5 h-5 text-white" strokeWidth={2.2} />
              <span>Retirar</span>
            </button>
            <button
              onClick={() => navigate('/recarregar')}
              className="h-[48px] bg-[#FF2442] hover:bg-[#E02038] active:scale-[0.99] text-white rounded-[8px] font-semibold text-[15px] flex items-center justify-center gap-2 transition-all"
            >
              <PlusCircle className="w-5 h-5 text-white" strokeWidth={2.2} />
              <span>Recarregar</span>
            </button>
          </div>
        </div>

        {/* ─── 4. Ícones de Categorias (Moedas | SuperOfertas | Jardim Premiado) ─── */}
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-2">
            {[
              { emoji: '🪙', label: 'Moedas', route: '/perfil' },
              { emoji: '⚡', label: 'SuperOfertas', route: '/produtos' },
              { emoji: '🌿', label: 'Jardim Premiado', route: '/produtos' },
            ].map(({ emoji, label, route }) => (
              <button
                key={label}
                onClick={() => navigate(route)}
                className="flex flex-col items-center gap-1.5 py-2 active:opacity-70 transition-opacity"
              >
                <div className="w-14 h-14 rounded-full bg-[#FFF5F5] flex items-center justify-center text-2xl shadow-[0_2px_8px_rgba(255,36,66,0.10)]">
                  {emoji}
                </div>
                <span className="text-[11.5px] text-[#1A1A1A] font-normal text-center leading-tight">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ─── 5. Combos de Ofertas (título + grid de 3 produtos com foto, preço, vendas) ─── */}
        <div className="border-t border-gray-100">
          <div className="px-3 pt-3 pb-2 flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-[#1A1A1A]">Combos de ofertas</h2>
            <button
              onClick={() => navigate('/produtos')}
              className="flex items-center gap-0.5 text-[#FF6600] text-[12px] font-medium"
            >
              <span>3+ a partir de US $2.99</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Grid de 3 mini-cards de produto horizontal */}
          <div className="px-3 pb-4 flex gap-2 overflow-x-auto no-scrollbar">
            {[
              { emoji: '🛡️', price: 'AOA 2.379,33', sales: '100k+ vendidos', color: 'from-gray-900 to-gray-700' },
              { emoji: '🔌', price: 'AOA 2.596,62', sales: '100k+ vendidos', color: 'from-gray-200 to-white' },
              { emoji: '⚙️', price: 'AOA 4.552,00', sales: '50.000+ vendidos', color: 'from-zinc-300 to-zinc-100' },
            ].map(({ emoji, price, sales, color }, i) => (
              <button
                key={i}
                onClick={() => navigate('/produtos')}
                className="flex-shrink-0 w-[110px] active:opacity-70 transition-opacity"
              >
                <div className={`w-full h-[100px] rounded-[8px] bg-gradient-to-br ${color} flex items-center justify-center text-3xl mb-1.5`}>
                  {emoji}
                </div>
                <p className="text-[13px] font-bold text-[#FF2442] leading-tight">{price}</p>
                <p className="text-[10.5px] text-[#888888] mt-0.5">{sales}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ─── 6. Três Banners de Secção (SuperOfertas | Ofertas em Marc... | Viva) ─── */}
        <div className="border-t border-gray-100 px-3 py-3 grid grid-cols-3 gap-2">
          {[
            { title: 'SuperOfertas', subtitle: 'Termina: 20:53:44 ›', bg: '#FFF5F5', titleColor: '#FF2442' },
            { title: 'Ofertas em marc...', subtitle: '750+ marcas ›', bg: '#F5F5FF', titleColor: '#3B3BFF' },
            { title: 'Viva', subtitle: 'Ofertas em ›', bg: '#F5FFF5', titleColor: '#00A058' },
          ].map(({ title, subtitle, bg, titleColor }) => (
            <button
              key={title}
              onClick={() => navigate('/produtos')}
              className="rounded-[10px] flex flex-col items-start p-2.5 active:opacity-70 transition-opacity text-left"
              style={{ backgroundColor: bg }}
            >
              <span className="text-[12.5px] font-bold leading-tight" style={{ color: titleColor }}>
                {title}
              </span>
              <span className="text-[10px] text-[#888888] mt-0.5 leading-tight">{subtitle}</span>
            </button>
          ))}
        </div>

        {/* ─── 7. Vídeo do Produto ─── */}
        <div className="mt-2 px-3 pb-4 flex flex-col items-center border-t border-gray-100 pt-3">
          <div className="w-full flex items-center justify-between mb-2">
            <h2 className="text-[15px] font-bold text-[#1A1A1A]">Meu produto</h2>
            <button
              onClick={() => navigate('/produtos')}
              className="flex items-center gap-0.5 text-[#FF6600] text-[12px] font-medium"
            >
              <span>Ver todos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="w-full bg-black rounded-[10px] overflow-hidden border border-gray-100 shadow-sm relative aspect-video flex items-center justify-center">
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

      </div>
    </div>
  );
}
