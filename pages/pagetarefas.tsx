import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Building2, Package, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SmartImage } from '../components/SmartImage';

interface OrderItem {
  id: string;
  produto_nome: string;
  produto_imagem?: string;
  preco_pago: number;
  renda_diaria?: number;
  data_inicio: string;
  data_fim: string;
  ativo: boolean;
}

export default function PageTarefas() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'ongoing' | 'cooperation'>('all');
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data, error } = await supabase.rpc('get_my_purchased_products_mcpn');
        if (!error && data) {
          setOrders((data as any[]).map(item => ({
            id: String(item.id),
            produto_nome: item.produto_nome || 'Lote de Fábrica',
            produto_imagem: item.produto_imagem,
            preco_pago: Number(item.preco_pago || 0),
            renda_diaria: Number(item.renda_diaria || item.rendimento_diario || 0),
            data_inicio: item.data_inicio || new Date().toISOString(),
            data_fim: item.data_fim || new Date().toISOString(),
            ativo: Boolean(item.ativo),
          })));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeOrders = orders.filter(o => o.ativo);

  return (
    <div className="min-h-screen bg-[#FFFFFF] pb-24 font-sans text-[#191919] select-none flex flex-col items-center">
      
      {/* ── 1. ABAS SUPERIORES (todos() | em andamento() | Confirmar cooperação()) ── */}
      <div className="w-full max-w-[480px] bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="flex items-center justify-around h-[44px] text-[13.5px] px-2">
          
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`h-full flex items-center justify-center font-medium relative px-2 transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'text-[#3B7BFF] font-bold'
                : 'text-[#444444] hover:text-[#3B7BFF]'
            }`}
          >
            <span>todos({orders.length})</span>
            {activeTab === 'all' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#3B7BFF]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ongoing')}
            className={`h-full flex items-center justify-center font-medium relative px-2 transition-colors cursor-pointer ${
              activeTab === 'ongoing'
                ? 'text-[#3B7BFF] font-bold'
                : 'text-[#444444] hover:text-[#3B7BFF]'
            }`}
          >
            <span>em andamento({activeOrders.length})</span>
            {activeTab === 'ongoing' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#3B7BFF]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cooperation')}
            className={`h-full flex items-center justify-center font-medium relative px-2 transition-colors cursor-pointer ${
              activeTab === 'cooperation'
                ? 'text-[#3B7BFF] font-bold'
                : 'text-[#444444] hover:text-[#3B7BFF]'
            }`}
          >
            <span className="truncate max-w-[140px]">Confirmar cooperação(0)</span>
            {activeTab === 'cooperation' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#3B7BFF]" />
            )}
          </button>

        </div>
      </div>

      {/* ── 2. CARD CENTRAL IDÊNTICO À CAPTURA DE TELA DA 1688 ── */}
      <main className="w-full max-w-[480px] p-4 flex flex-col items-center">
        
        {/* Bloco Central de Cotação de Fábrica */}
        <div className="w-full bg-[#FFFFFF] border border-gray-200 p-6 flex flex-col items-center text-center space-y-4">
          
          {/* Título Principal */}
          <h1 className="text-[17px] font-bold text-[#191919] tracking-tight">
            发询价单，官方为你找厂！
          </h1>

          {/* Subtítulo */}
          <p className="text-[12px] text-[#777777] leading-relaxed max-w-[340px]">
            询价单是帮助买家快速批量找厂的询价工具！
            <br />
            免费发布询价单可以获得以下服务
          </p>

          {/* Lista de Vantagens com Check Dourado */}
          <div className="w-full max-w-[280px] space-y-2.5 text-left pt-2 pb-2">
            
            <div className="flex items-center gap-2 text-[13px] text-[#A06B27]">
              <div className="w-4 h-4 border border-[#A06B27] flex items-center justify-center text-[10px] font-bold shrink-0">
                ✓
              </div>
              <span className="font-medium">官方为你推荐优质工厂</span>
            </div>

            <div className="flex items-center gap-2 text-[13px] text-[#A06B27]">
              <div className="w-4 h-4 border border-[#A06B27] flex items-center justify-center text-[10px] font-bold shrink-0">
                ✓
              </div>
              <span className="font-medium">工厂收到询价快速报价</span>
            </div>

            <div className="flex items-center gap-2 text-[13px] text-[#A06B27]">
              <div className="w-4 h-4 border border-[#A06B27] flex items-center justify-center text-[10px] font-bold shrink-0">
                ✓
              </div>
              <span className="font-medium">找到真实工厂达成合作</span>
            </div>

          </div>

          {/* Botão Azul Oficial 1688 (发布询价单) */}
          <button
            type="button"
            onClick={() => navigate('/produtos')}
            className="w-full max-w-[220px] h-[40px] bg-[#4A7AFF] hover:bg-[#3B6BF0] active:scale-[0.99] text-white font-bold text-[14px] transition-colors cursor-pointer flex items-center justify-center"
          >
            发布询价单
          </button>

        </div>

        {/* ── 3. LISTA DE TAREFAS / LOTES ATIVOS SE HOUVER ── */}
        {orders.length > 0 && (
          <div className="w-full mt-4 space-y-2">
            <h2 className="text-[13px] font-bold text-gray-800 px-1">
              {activeTab === 'ongoing' ? '生产中订单 · Lotes em Andamento' : '全部订单 · Todos os Lotes'}
            </h2>

            {(activeTab === 'ongoing' ? activeOrders : orders).map(order => (
              <div
                key={order.id}
                onClick={() => navigate('/minhas-compras')}
                className="bg-white border border-gray-200 p-3 flex items-center justify-between cursor-pointer hover:border-[#4A7AFF] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center">
                    <SmartImage
                      src={order.produto_imagem}
                      alt={order.produto_nome}
                      className="w-full h-full object-contain p-0.5"
                    />
                  </div>
                  <div>
                    <h3 className="text-[12.5px] font-bold text-gray-900 line-clamp-1">{order.produto_nome}</h3>
                    <p className="text-[10.5px] text-gray-500">ID: {order.id.slice(0, 8)}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10.5px] font-bold px-1 py-0.2 border ${
                    order.ativo ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-gray-500 bg-gray-50 border-gray-200'
                  }`}>
                    {order.ativo ? '● 生产中' : '已完成'}
                  </span>
                  <span className="text-[12px] font-bold text-[#FF5000] block mt-1">
                    KZ {Number(order.preco_pago).toLocaleString('pt-AO')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

    </div>
  );
}
