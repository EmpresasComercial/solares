import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, TrendingUp } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

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

// Abas exatas do 1688 (猜选货源, etc.)
const TABS = [
  { key: 'featured',     cn: '猜选货源',   pt: 'Seleção'      },
  { key: 'hat',          cn: '帽子/头巾',   pt: 'Chapéus'      },
  { key: 'accessories',  cn: '手饰',        pt: 'Acessórios'   },
  { key: 'toys',         cn: '公仔玩偶',   pt: 'Bonecos'      },
  { key: 'kitchen',      cn: '厨房工具',   pt: 'Cozinha'      },
  { key: 'home',         cn: '居家日用',   pt: 'Casa'         },
  { key: 'clothing',     cn: '家居服',     pt: 'Roupas'       },
  { key: 'food',         cn: '爆款点心',   pt: 'Snacks'       },
  { key: 'jewelry',      cn: '饰品配件',   pt: 'Joias'        },
  { key: 'desk',         cn: '桌面用品',   pt: 'Mesa'         },
  { key: 'cleaning',     cn: '身体清洁',   pt: 'Limpeza'      },
  { key: 'paper',        cn: '纸品湿巾',   pt: 'Papel'        },
  { key: 'shoes',        cn: '女鞋',       pt: 'Sapatos'      },
  { key: 'hair',         cn: '发饰头饰',   pt: 'Cabelo'       },
  { key: 'storage',      cn: '收纳防尘',   pt: 'Organização'  },
  { key: 'hot',          cn: '爆品推荐',   pt: 'Mais Vendidos' },
  { key: 'profit',       cn: '高收益',     pt: 'Alta Renda'   },
  { key: 'fast',         cn: '短周期',     pt: 'Ciclo Rápido' },
];

const FACTORY_ORIGINS = [
  '义乌市锦豪饰品有限公司',
  '深圳市思展科技有限公司',
  '广州大宇铝业有限公司',
  '浙江省义乌市思网商行',
  '广州市洛浦家居服饰有限公司',
  '湛江市梦思家具配件有限公司',
  '义乌市鹦鹉电子商务商行',
];

const PRICES_MOCK = [35.81, 68, 13, 0.48, 9.65, 800, 5, 6, 28.9, 2, 240, 9.49];

export const AliRecommendFeed1688: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('featured');
  const [products, setProducts] = useState<WholesaleProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
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
        setLoading(false);
      }
    }
    load();
  }, []);

  const formatKZ = (v: number) =>
    new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 })
      .format(v).replace('AOA', 'Kz');

  return (
    <div className="w-full bg-white mt-3 font-sans" style={{ fontFamily: "'PingFang SC', 'Microsoft YaHei', Arial, sans-serif" }}>

      {/* ── TABS BAR — exato do 1688 ── */}
      <div className="w-full border-b border-gray-200 bg-white sticky top-0 z-20 overflow-x-auto no-scrollbar">
        <div className="flex items-center min-w-max px-3">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex flex-col items-center px-3 py-3 cursor-pointer transition-colors whitespace-nowrap ${
                  isActive ? 'text-[#FF5000]' : 'text-[#444] hover:text-[#FF5000]'
                }`}
                style={{ fontSize: 13, fontWeight: isActive ? 700 : 400 }}
              >
                {tab.cn}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF5000]" />
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => navigate('/produtos')}
            className="flex items-center gap-0.5 text-[12px] text-gray-400 hover:text-[#FF5000] cursor-pointer ml-2 shrink-0 py-3 pr-2"
          >
            <span>更多</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── PRICE LISTING HEADER ROW — estilo 1688 ── */}
      <div className="w-full overflow-x-auto no-scrollbar border-b border-gray-100">
        <div className="flex items-end gap-6 px-4 py-2 min-w-max">
          {PRICES_MOCK.map((p, i) => {
            const factory = FACTORY_ORIGINS[i % FACTORY_ORIGINS.length];
            const unit = i % 3 === 0 ? '1件起批' : i % 3 === 1 ? '100+件' : '50+件';
            const repurchase = 46 + (i * 7) % 20;
            const isHot = i % 4 === 1;
            const isNew = i % 5 === 0;
            return (
              <div
                key={i}
                onClick={() => navigate('/produtos')}
                className="flex flex-col items-start cursor-pointer group shrink-0 min-w-[80px]"
              >
                <div className="flex items-baseline gap-0.5">
                  {isHot && (
                    <span className="text-[9px] font-black text-white bg-[#FF5000] px-1 rounded-sm mr-0.5 leading-tight">包邮</span>
                  )}
                  <span className="text-[9px] text-gray-400">¥</span>
                  <span className="text-[16px] font-black text-[#FF5000] leading-none" style={{ fontSize: p < 10 ? 18 : 16 }}>
                    {p}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 mt-0.5">{unit}</span>
                {isNew && <span className="text-[9px] text-blue-500">首单减5元</span>}
                <span className="text-[9px] text-gray-400 mt-0.5">回头率{repurchase}%</span>
                <span className="text-[10px] text-gray-500 truncate max-w-[90px] mt-0.5 group-hover:text-[#FF5000]">{factory}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── PRODUCT GRID — estilo 1688 (3 cols desktop, 2 cols mobile) ── */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-0 border-l border-t border-gray-100">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="border-r border-b border-gray-100 bg-white animate-pulse">
              <div className="bg-gray-100 aspect-square w-full" />
              <div className="p-2 space-y-1.5">
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-1/2 mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-[13px]">
          Nenhum produto disponível.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-l border-t border-gray-100">
          {products.map((product, index) => {
            const origin = FACTORY_ORIGINS[index % FACTORY_ORIGINS.length];
            const repurchase = 46 + (index * 7) % 24;
            const isTopSeller = index % 4 === 0;
            const dailyIncome = product.rendimento_diario || product.renda_diaria || 0;
            const imgSrc = product.imagem_url ||
              `https://images.unsplash.com/photo-150939136${4560 + index * 3}?w=400&auto=format&fit=crop&q=60`;

            return (
              <div
                key={product.id}
                onClick={() => navigate(`/produtos/${product.id}`)}
                className="border-r border-b border-gray-100 bg-white cursor-pointer group overflow-hidden hover:z-10 hover:shadow-lg hover:border-[#FF5000] transition-all duration-150 relative"
              >
                {/* Imagem */}
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <img
                    src={imgSrc}
                    alt={product.nome}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=60';
                    }}
                  />

                  {/* Badge 跨境 */}
                  {index % 3 === 0 && (
                    <div className="absolute top-1.5 left-1.5 bg-[#FF5000] text-white text-[8.5px] font-black px-1.5 py-0.5 leading-tight">
                      跨境
                    </div>
                  )}
                  {/* Badge JOESHIER (brand) */}
                  {index % 5 === 3 && (
                    <div className="absolute top-1.5 left-1.5 bg-black text-white text-[8.5px] font-bold px-1.5 py-0.5 tracking-wider leading-tight">
                      MARCA
                    </div>
                  )}
                  {/* 20+国家 badge */}
                  {isTopSeller && (
                    <div className="absolute bottom-1 right-1 bg-amber-500 text-white text-[7.5px] font-black px-1 py-0.5 leading-tight">
                      20+国家
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-2">
                  {/* Title */}
                  <h3 className="text-[12px] text-gray-900 line-clamp-2 leading-snug group-hover:text-[#FF5000] transition-colors min-h-[32px]">
                    {product.nome}
                  </h3>

                  {/* Price Row — ¥ price + 件起批 */}
                  <div className="mt-1.5 flex items-baseline gap-1">
                    {isTopSeller && (
                      <span className="text-[9px] bg-[#FF5000] text-white px-1 font-bold shrink-0">首单</span>
                    )}
                    <span className="text-[10px] text-[#FF5000]">¥</span>
                    <span className="text-[16px] font-black text-[#FF5000] leading-none">
                      {(product.preco / 650).toFixed(2)}
                    </span>
                  </div>

                  {/* Unit info */}
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[10px] text-gray-500">
                      1件起批
                    </span>
                    {dailyIncome > 0 && (
                      <span className="text-[9.5px] text-gray-400 flex items-center gap-0.5">
                        <TrendingUp className="w-2.5 h-2.5 text-green-500" />
                        +{formatKZ(dailyIncome)}/d
                      </span>
                    )}
                  </div>

                  {/* Factory + Repurchase */}
                  <div className="mt-1 flex flex-col gap-0.5">
                    {index % 4 === 1 && (
                      <span className="text-[9.5px] text-blue-500">
                        首单减5元
                        <span className="text-gray-400 ml-1">先采后付</span>
                      </span>
                    )}
                    <span className="text-[9.5px] text-gray-400">回头率{repurchase}%</span>
                    <span className="text-[9.5px] text-gray-500 truncate">{origin}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ver Mais */}
      <div className="flex items-center justify-center py-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => navigate('/produtos')}
          className="flex items-center gap-1.5 text-[13px] text-[#FF5000] font-bold border border-[#FF5000] px-6 py-2 hover:bg-orange-50 cursor-pointer transition-colors"
        >
          <span>查看全部商品 · Ver Catálogo Completo</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
