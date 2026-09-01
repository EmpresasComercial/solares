import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Camera,
  Volume2,
  ChevronRight,
  UserPlus,
  Wallet,
  PlusCircle,
  TrendingUp,
  User,
  Headphones,
  Flame,
  Truck
} from 'lucide-react';
import { usePopup } from '../hooks/usePopup';
import { APP_CONFIG } from '../constants/config';
import { supabase } from '../lib/supabase';
import { SmartImage } from '../components/SmartImage';
import { AnnouncementPopup } from './Home/components/AnnouncementPopup';
import { SupportModal } from './Home/components/SupportModal';
import { SocialProofFeed } from './Home/components/SocialProofFeed';

export interface WholesaleProduct {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  duracao_dias?: number;
  ciclo_dias?: number;
  imagem_url?: string;
  renda_diaria?: number;
  rendimento_diario?: number;
}

const CATEGORY_TABS = [
  { key: 'featured',     cn: '猜选货源',   pt: 'Seleção'      },
  { key: 'solar',        cn: '光伏新能源', pt: 'Solar & Baterias' },
  { key: 'industrial',   cn: '工业设备',   pt: 'Industrial'   },
  { key: 'hat',          cn: '帽子/头巾',   pt: 'Chapéus'      },
  { key: 'accessories',  cn: '手饰配件',   pt: 'Acessórios'   },
  { key: 'toys',         cn: '公仔玩偶',   pt: 'Bonecos'      },
  { key: 'kitchen',      cn: '厨房工具',   pt: 'Cozinha'      },
  { key: 'home',         cn: '居家日用',   pt: 'Casa'         },
  { key: 'clothing',     cn: '家居服饰',   pt: 'Roupas'       },
  { key: 'hot',          cn: '爆品推荐',   pt: 'Mais Vendidos' },
  { key: 'profit',       cn: '高收益',     pt: 'Alta Renda'   },
];

const FACTORY_ORIGINS = [
  '义乌市锦豪新能源有限公司',
  '深圳市思展光伏科技有限公司',
  '广州大宇智能设备有限公司',
  '浙江省义乌市思网商行',
  '湛江市梦思工业配件有限公司',
];

const TICKER_MESSAGES = [
  { title: '1888 Atacado', text: 'Super Fábrica despachou 500 kits fotovoltaicos para Angola' },
  { title: 'Transação VIP', text: 'Parceiro ***3120 recebeu rendimento diário de KZ 35.000' },
  { title: 'Garantia B2B', text: 'Proteção de pagamento 1888 ativa em todos os pedidos' },
  { title: 'Novo Lote', text: 'Módulos solares de alta eficiência com desconto por volume' }
];

const HOT_KEYWORDS = [
  'Painéis Solares',
  'Inversores 5kW',
  'Baterias Lítio',
  'Super Fábrica',
  'Geradores',
  'Kits Fotovoltaicos'
];

export default function Home() {
  const navigate = useNavigate();

  // Estados de Atendimento & Links
  const [communityLink, setCommunityLink] = useState<string | undefined>(undefined);
  const [telegramLink, setTelegramLink] = useState<string>('https://t.me');
  const [managerWaLink, setManagerWaLink] = useState<string | undefined>(undefined);
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Estados de Busca e Categorias
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchTab, setActiveSearchTab] = useState<'products' | 'factories' | 'industrial'>('products');
  const [activeCategoryTab, setActiveCategoryTab] = useState('featured');

  // Estados de Produtos e Ticker
  const [products, setProducts] = useState<WholesaleProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [tickerIndex, setTickerIndex] = useState(0);

  // Popup de Notificações
  const { isOpen: showPopup, close: closePopup } = usePopup({
    initialDelay: APP_CONFIG.POPUP_INITIAL_DELAY,
    autoCloseTime: APP_CONFIG.POPUP_AUTO_CLOSE_TIME
  });

  // Carregar Links de Suporte
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

  // Timer do Ticker de Notícias
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % TICKER_MESSAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Carregar Produtos
  useEffect(() => {
    async function loadProducts() {
      setLoadingProducts(true);
      try {
        const { data: rpcData } = await (supabase.rpc as any)('get_available_products_mcpn');
        if (rpcData?.length) {
          setProducts(rpcData.map((item: any) => ({
            id: String(item.id),
            nome: item.nome,
            descricao: item.descricao,
            preco: Number(item.preco || 0),
            duracao_dias: Number(item.duracao_dias || 30),
            ciclo_dias: Number(item.ciclo_dias || item.duracao_dias || 30),
            imagem_url: item.imagem_url,
            renda_diaria: Number(item.renda_diaria || 0),
            rendimento_diario: Number(item.rendimento_diario || item.renda_diaria || 0),
          })));
        } else {
          const { data } = await supabase.from('produtos').select('*').eq('ativo', true);
          if (data?.length) {
            setProducts(data.map((item: any) => ({
              id: String(item.id),
              nome: item.nome,
              descricao: item.descricao,
              preco: Number(item.preco || 0),
              duracao_dias: Number(item.duracao_dias || 30),
              ciclo_dias: Number(item.duracao_dias || 30),
              imagem_url: item.imagem_url,
              renda_diaria: Number(item.renda_diaria || 0),
              rendimento_diario: Number(item.renda_diaria || 0),
            })));
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingProducts(false);
      }
    }
    loadProducts();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(searchTerm ? `/produtos?busca=${encodeURIComponent(searchTerm)}` : '/produtos');
  };

  const formatKZ = (v: number) =>
    new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 })
      .format(v).replace('AOA', 'Kz');

  return (
    <div className="bg-[#F3F4F6] min-h-screen pb-24 overflow-x-hidden flex flex-col items-center font-sans antialiased text-[#191919]">

      {/* Modais de Popups & Suporte */}
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

      {/* ── 1. HEADER (Visível e Adaptado no Celular e PC) ── */}
      <header className="w-full bg-white border-b border-gray-200 select-none">
        
        {/* Barra Superior */}
        <div className="w-full bg-[#f8f8f8] border-b border-gray-200">
          <div className="max-w-[1280px] mx-auto px-3 sm:px-4 h-[28px] sm:h-[30px] flex items-center justify-between text-[11px] sm:text-[11.5px] text-gray-500">
            <div className="flex items-center gap-2 sm:gap-3 truncate">
              <span className="font-bold text-[#FF5000] cursor-pointer hover:underline" onClick={() => navigate('/home')}>
                1888.com
              </span>
              <span className="text-gray-300">|</span>
              <span className="truncate">阿里巴巴旗下 • Atacado Global Direto da Fábrica</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <button onClick={() => navigate('/perfil')} className="hover:text-[#FF5000] flex items-center gap-1 cursor-pointer">
                <User className="w-3 h-3 text-gray-400" />
                <span>Conta</span>
              </button>
              <button onClick={() => setShowSupportModal(true)} className="hover:text-[#FF5000] flex items-center gap-1 cursor-pointer">
                <Headphones className="w-3 h-3 text-gray-400" />
                <span>Suporte</span>
              </button>
            </div>
          </div>
        </div>

        {/* Linha Principal de Busca */}
        <div className="w-full max-w-[1280px] mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex flex-col gap-2">
            
            {/* Abas de Busca (Visíveis no Celular e PC com Scroll Horizontal) */}
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar text-[12px] sm:text-[13px] font-bold">
              {[
                { key: 'products', label: '挑好货 · Produtos' },
                { key: 'factories', label: '找工厂 · Super Fábricas' },
                { key: 'industrial', label: '工业品 · Industrial' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveSearchTab(tab.key as any)}
                  className={`cursor-pointer whitespace-nowrap pb-0.5 transition-colors ${
                    activeSearchTab === tab.key
                      ? 'text-[#FF5000] border-b-2 border-[#FF5000]'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Form de Busca */}
            <form onSubmit={handleSearchSubmit} className="flex items-stretch h-[38px] sm:h-[40px] border-2 border-[#FF5000] rounded-none overflow-hidden w-full bg-white">
              <div className="pl-3 flex items-center text-gray-400">
                <Search className="w-4 h-4 text-[#FF5000]" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar lotes de fábrica, kits ou equipamentos..."
                className="flex-1 px-2 text-[12px] sm:text-[13px] text-gray-800 placeholder:text-gray-400 outline-none bg-transparent min-w-0"
              />
              <button
                type="button"
                onClick={() => navigate('/produtos')}
                className="flex items-center gap-1 px-2.5 text-[11px] font-medium bg-[#FFF3EB] text-[#FF5000] border-l border-orange-200 hover:bg-[#FFE8DA] cursor-pointer transition-colors shrink-0"
                title="Busca por Imagem"
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Foto</span>
              </button>
              <button
                type="submit"
                className="bg-[#FF5000] hover:bg-[#E04400] active:scale-[0.99] text-white font-bold text-[12.5px] sm:text-[14px] px-3.5 sm:px-6 cursor-pointer transition-colors shrink-0"
              >
                Buscar
              </button>
            </form>

            {/* Palavras-Chave em Alta */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-0.5">
              <div className="flex items-center gap-0.5 text-[10.5px] font-bold text-[#FF5000] shrink-0">
                <Flame className="w-3 h-3 fill-current" />
                <span>Em Alta:</span>
              </div>
              {HOT_KEYWORDS.map((kw, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setSearchTerm(kw);
                    navigate(`/produtos?busca=${encodeURIComponent(kw)}`);
                  }}
                  className="text-[11px] text-gray-500 hover:text-[#FF5000] whitespace-nowrap cursor-pointer transition-colors shrink-0"
                >
                  {kw}
                </button>
              ))}
            </div>

          </div>
        </div>
      </header>

      {/* ── CONTEÚDO PRINCIPAL (100% Responsivo no Celular e PC) ── */}
      <main className="w-full max-w-[1280px] px-2.5 sm:px-4 pt-2.5 space-y-2.5">

        {/* ── 2. TICKER DE NOTÍCIAS ── */}
        <div className="w-full bg-[#FFF7F0] border border-orange-200/80 px-3 py-2 flex items-center justify-between select-none">
          <div
            onClick={() => navigate('/suporte')}
            className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
          >
            <div className="flex items-center gap-1 bg-[#FF5000] text-white text-[9.5px] font-bold px-1.5 py-0.5 rounded-none shrink-0">
              <Volume2 className="w-3 h-3 stroke-[2.5]" />
              <span>1888 NOTÍCIAS</span>
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-[12px] text-gray-700 font-medium truncate">
                {TICKER_MESSAGES[tickerIndex].text}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/produtos')}
            className="text-[#FF5000] hover:text-[#E03E00] flex items-center text-[11px] font-bold shrink-0 ml-2"
          >
            <span>Ver mais</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* ── 3. AÇÕES RÁPIDAS FLAT (Convidar, Recarregar, Retirar) ── */}
        <div className="bg-white rounded-none p-2 sm:p-3 border border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => navigate('/convite')}
            className="h-[42px] bg-[#FF5000] hover:bg-[#E04400] active:scale-[0.99] text-white rounded-none font-bold text-[13px] flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[#FF5000]"
          >
            <UserPlus className="w-4 h-4 text-white" />
            <span>Convidar Parceiros & Bônus</span>
          </button>

          <button
            onClick={() => navigate('/recarregar')}
            className="h-[42px] bg-[#FFF3EB] border border-orange-200 hover:bg-[#FFE8DA] active:scale-[0.99] text-[#FF5000] rounded-none font-bold text-[13px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#FF5000]" />
            <span>Recarregar Saldo</span>
          </button>

          <button
            onClick={() => navigate('/retirada')}
            className="h-[42px] bg-white border border-gray-300 hover:border-[#FF5000] active:scale-[0.99] text-gray-800 hover:text-[#FF5000] rounded-none font-medium text-[13px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Wallet className="w-4 h-4 text-[#FF5000]" />
            <span>Solicitar Retirada</span>
          </button>
        </div>

        {/* ── 4. VÍDEO INSTITUCIONAL / TOUR DE FÁBRICA ── */}
        <section className="bg-white border border-gray-200 flex flex-col items-center">
          <div className="w-full flex items-center justify-between px-3 pt-3 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-[#FF5000]" />
              <h2 className="text-[13.5px] sm:text-[14px] font-bold text-[#191919]">
                1888 工厂实拍 • Tour da Fábrica em Produção
              </h2>
            </div>
            <span className="text-[11px] text-gray-400">Shenzhen • Yiwu Industrial Base</span>
          </div>
          <div className="w-full bg-black overflow-hidden border-t border-gray-200 relative aspect-video flex items-center justify-center">
            <video
              src="https://cloud.video.taobao.com/vod/IjWQQvJiBcsdzLUK--iliZu5j-bOev4FGAOBZsRBVUc.mp4"
              autoPlay
              loop
              muted
              playsInline
              controls
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* ── 5. FEED DE PRODUTOS 1688 (Flat & 100% Responsivo) ── */}
        <section className="w-full bg-white border border-gray-200">
          
          {/* Barra de Abas de Categorias */}
          <div className="w-full border-b border-gray-200 bg-white overflow-x-auto no-scrollbar sticky top-0 z-10">
            <div className="flex items-center min-w-max px-2">
              {CATEGORY_TABS.map((tab) => {
                const isActive = activeCategoryTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveCategoryTab(tab.key)}
                    className={`relative flex flex-col items-center px-3 py-2 cursor-pointer transition-colors whitespace-nowrap text-[12px] sm:text-[12.5px] ${
                      isActive ? 'text-[#FF5000] font-bold' : 'text-[#555] hover:text-[#FF5000] font-normal'
                    }`}
                  >
                    <span>{tab.cn}</span>
                    <span className="text-[9.5px] opacity-75">{tab.pt}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF5000]" />
                    )}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => navigate('/produtos')}
                className="flex items-center gap-0.5 text-[11px] text-gray-400 hover:text-[#FF5000] cursor-pointer ml-2 shrink-0 py-2 pr-2"
              >
                <span>更多 Catálogo</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Grid de Produtos com Imagens Nítidas */}
          {loadingProducts ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 border-t border-gray-100">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border-r border-b border-gray-100 bg-white p-2 animate-pulse space-y-2">
                  <div className="bg-gray-100 aspect-square w-full" />
                  <div className="h-3 bg-gray-100 rounded-none w-full" />
                  <div className="h-3 bg-gray-100 rounded-none w-3/4" />
                  <div className="h-4 bg-gray-100 rounded-none w-1/2 mt-1" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-[13px]">
              Nenhum produto de fábrica disponível no momento.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {products.map((product, index) => {
                const origin = FACTORY_ORIGINS[index % FACTORY_ORIGINS.length];
                const repurchase = 48 + (index * 7) % 20;
                const dailyIncome = product.rendimento_diario || product.renda_diaria || 0;
                const imgSrc = product.imagem_url ||
                  `https://images.unsplash.com/photo-150939136${4560 + index * 3}?w=400&auto=format&fit=crop&q=60`;

                return (
                  <div
                    key={product.id}
                    onClick={() => navigate(`/produtos/${product.id}`)}
                    className="border-r border-b border-gray-200 bg-white cursor-pointer group overflow-hidden hover:border-[#FF5000] transition-colors relative flex flex-col justify-between"
                  >
                    <div>
                      {/* Foto do Produto com SmartImage */}
                      <div className="relative aspect-square overflow-hidden bg-[#FAF8F5] border-b border-gray-100">
                        <SmartImage
                          src={imgSrc}
                          alt={product.nome}
                          className="w-full h-full object-contain p-2 group-hover:scale-102 transition-transform duration-200"
                        />

                        {/* Tag Direto de Fábrica */}
                        <div className="absolute top-1 left-1 bg-[#FF5000] text-white text-[8px] font-bold px-1 py-0.2 leading-tight">
                          直供 FÁBRICA
                        </div>

                        {/* Tag Envio Rápido */}
                        <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[7.5px] font-medium px-1 py-0.2">
                          48h Envio
                        </div>
                      </div>

                      {/* Informações do Produto */}
                      <div className="p-2">
                        <h3 className="text-[12px] text-gray-900 font-medium line-clamp-2 leading-snug group-hover:text-[#FF5000] transition-colors min-h-[30px]">
                          {product.nome}
                        </h3>

                        {/* Linha de Preço */}
                        <div className="mt-1 flex items-baseline gap-1">
                          <span className="text-[10px] text-[#FF5000] font-bold">KZ</span>
                          <span className="text-[15px] sm:text-[16px] font-black text-[#FF5000] leading-none">
                            {product.preco.toLocaleString('pt-AO')}
                          </span>
                        </div>

                        {/* Rendimento Diário */}
                        {dailyIncome > 0 && (
                          <div className="flex items-center gap-0.5 text-[9.5px] text-emerald-600 font-medium mt-0.5">
                            <TrendingUp className="w-2.5 h-2.5" />
                            <span>+{formatKZ(dailyIncome)}/dia</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rodapé do Card */}
                    <div className="px-2 pb-2 pt-0.5 text-[9px] text-gray-400 flex flex-col border-t border-gray-50">
                      <span>Taxa Recompra: {repurchase}%</span>
                      <span className="truncate text-gray-500">{origin}</span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* Botão Ver Catálogo Completo */}
          <div className="flex items-center justify-center py-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/produtos')}
              className="flex items-center gap-1 text-[12.5px] text-[#FF5000] font-bold border border-[#FF5000] px-5 py-1.5 hover:bg-orange-50 cursor-pointer transition-colors"
            >
              <span>查看全部商品 · Ver Todos os Lotes</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </section>



        {/* ── 6. PROVA SOCIAL ── */}
        <SocialProofFeed />

      </main>

    </div>
  );
}
