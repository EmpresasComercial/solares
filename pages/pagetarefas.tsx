import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  ChevronLeft, 
  Package, 
  Building2, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SmartImage } from '../components/SmartImage';
import { useToast } from '../components/Toast';

interface OrderItem {
  id: string;
  produto_nome: string;
  produto_imagem?: string;
  preco_pago: number;
  renda_diaria?: number;
  data_inicio: string;
  data_fim: string;
  ativo: boolean;
  duracao_dias?: number;
  storage_size?: string;
  url_download_setup?: string;
}

export default function PageTarefas() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase.rpc('get_my_purchased_products_mcpn');
      if (error) throw error;
      if (data) {
        setOrders((data as any[]).map(item => ({
          id: String(item.id),
          produto_nome: item.produto_nome || 'Lote de Fábrica',
          produto_imagem: item.produto_imagem,
          preco_pago: Number(item.preco_pago || 0),
          renda_diaria: Number(item.renda_diaria || item.rendimento_diario || 0),
          data_inicio: item.data_inicio || new Date().toISOString(),
          data_fim: item.data_fim || new Date().toISOString(),
          ativo: Boolean(item.ativo),
          duracao_dias: Number(item.duracao_dias || 30),
          storage_size: item.storage_size,
          url_download_setup: item.url_download_setup
        })));
      }
    } catch (err: any) {
      console.error(err);
      showToast('Erro ao carregar pedidos de fábrica.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  // Filtragem
  const filteredOrders = orders.filter(item => {
    const matchesSearch = item.produto_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(item.id).toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'active') return matchesSearch && item.ativo;
    if (activeTab === 'completed') return matchesSearch && !item.ativo;
    return matchesSearch;
  });

  const totalInvested = orders.reduce((acc, curr) => acc + (Number(curr.preco_pago) || 0), 0);
  const totalDaily = orders
    .filter(o => o.ativo)
    .reduce((acc, curr) => acc + (Number(curr.renda_diaria) || 0), 0);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '---';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('pt-AO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-24 font-sans text-[#191919] select-none flex flex-col items-center">
      
      {/* ── 1. HEADER OFICIAL 1688 (已买到的货品 - Pedidos Comprados) ── */}
      <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-[1280px] mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="p-1 -ml-1 text-gray-700 hover:text-[#FF5000] active:scale-95 transition-transform cursor-pointer"
              aria-label="Voltar"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[15px] sm:text-[16px] font-bold text-gray-900">
                  已买到的货品 · Meus Pedidos & Tarefas
                </span>
                <span className="bg-[#FF5000] text-white text-[8.5px] font-bold px-1 py-0.2">
                  1888 官方
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-normal">
                Gestão de Lotes de Fábrica e Produção Diária
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-1 text-[12px] text-gray-600 hover:text-[#FF5000] border border-gray-200 px-2.5 py-1 transition-colors cursor-pointer bg-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#FF5000]' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
        </div>
      </header>

      {/* ── CONTEÚDO PRINCIPAL ── */}
      <main className="w-full max-w-[1280px] px-2.5 sm:px-4 pt-3 space-y-3 flex-1">
        
        {/* ── 2. DASHBOARD DE RESUMO FLAT ── */}
        <div className="bg-white border border-gray-200 p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px]">
          <div className="border-r border-gray-100 pr-2">
            <span className="text-gray-500 block text-[11px]">Total de Lotes Comprados:</span>
            <span className="text-[17px] font-bold text-gray-900 leading-tight">
              {orders.length} <span className="text-[11px] font-normal text-gray-500">pedidos</span>
            </span>
          </div>

          <div className="border-r border-gray-100 pr-2">
            <span className="text-gray-500 block text-[11px]">Lotes em Produção Ativa:</span>
            <span className="text-[17px] font-bold text-[#FF5000] leading-tight">
              {orders.filter(o => o.ativo).length} <span className="text-[11px] font-normal text-gray-500">ativos</span>
            </span>
          </div>

          <div className="border-r border-gray-100 pr-2">
            <span className="text-gray-500 block text-[11px]">Total Investido em Lotes:</span>
            <span className="text-[15px] sm:text-[16px] font-black text-gray-900 leading-tight">
              KZ {totalInvested.toLocaleString('pt-AO')}
            </span>
          </div>

          <div>
            <span className="text-gray-500 block text-[11px]">Rendimento Diário Total:</span>
            <span className="text-[15px] sm:text-[16px] font-black text-emerald-600 leading-tight flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              +KZ {totalDaily.toLocaleString('pt-AO')}/dia
            </span>
          </div>
        </div>

        {/* ── 3. BARRA DE FILTROS E PESQUISA ── */}
        <div className="bg-white border border-gray-200 p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          
          {/* Abas no padrão 1688 */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
            {[
              { key: 'all', label: '全部 · Todos', count: orders.length },
              { key: 'active', label: '生产中 · Em Produção', count: orders.filter(o => o.ativo).length },
              { key: 'completed', label: '已完成 · Concluídos', count: orders.filter(o => !o.ativo).length }
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-3 py-1.5 text-[12px] font-bold transition-colors cursor-pointer border whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-[#FF5000] text-[#FF5000] bg-[#FFF3EB]'
                    : 'border-transparent text-gray-600 hover:text-gray-900 bg-transparent'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Busca de Pedido */}
          <div className="relative flex items-center sm:w-[260px]">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por lote ou ID..."
              className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-[#f9f9f9] border border-gray-200 focus:border-[#FF5000] outline-none"
            />
          </div>
        </div>

        {/* ── 4. LISTAGEM DE PEDIDOS (Formato Tabela Flat 1688) ── */}
        {loading ? (
          <div className="bg-white border border-gray-200 p-8 text-center text-gray-400 text-[12.5px] animate-pulse">
            Sincronizando pedidos de atacado com a fábrica...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white border border-gray-200 p-12 text-center flex flex-col items-center justify-center space-y-3">
            <Package className="w-12 h-12 text-gray-300 stroke-[1.5]" />
            <div>
              <p className="text-[13.5px] font-medium text-gray-700">
                Nenhum pedido de lote encontrado
              </p>
              <p className="text-[11.5px] text-gray-400 mt-0.5">
                Você ainda não possui lotes cadastrados nesta categoria.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/produtos')}
              className="mt-2 px-5 py-2 bg-[#FF5000] hover:bg-[#E04400] text-white text-[12.5px] font-bold transition-colors cursor-pointer"
            >
              Explorar Lotes de Fábrica
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredOrders.map((order) => {
              const orderId = String(order.id).substring(0, 8).toUpperCase();

              return (
                <div
                  key={order.id}
                  className="bg-white border border-gray-200 flex flex-col text-[12px]"
                >
                  {/* Cabeçalho do Card de Pedido */}
                  <div className="bg-[#FAFAFA] px-3 sm:px-4 py-2 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2 text-[11.5px]">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-[#FF5000]" />
                      <span className="font-bold text-gray-800">
                        1888 直供超级工厂 · Fornecedor Auditado
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-500 font-mono">ID: {orderId}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">Data: {formatDate(order.data_inicio)}</span>
                      <span className={`px-1.5 py-0.2 text-[10px] font-bold ${
                        order.ativo 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {order.ativo ? '● EM PRODUÇÃO' : 'FINALIZADO'}
                      </span>
                    </div>
                  </div>

                  {/* Corpo do Pedido */}
                  <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    
                    {/* Informações do Produto */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-[64px] h-[64px] bg-[#f8f8f8] border border-gray-200 shrink-0 overflow-hidden flex items-center justify-center">
                        <SmartImage
                          src={order.produto_imagem}
                          alt={order.produto_nome}
                          className="w-full h-full object-contain p-1"
                        />
                      </div>

                      <div className="min-w-0 space-y-1">
                        <h3 className="text-[13px] font-bold text-gray-900 truncate">
                          {order.produto_nome}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                          <span>Início: {formatDate(order.data_inicio)}</span>
                          <span>•</span>
                          <span>Término: {formatDate(order.data_fim)}</span>
                          {order.storage_size && (
                            <>
                              <span>•</span>
                              <span>Capacidade: {order.storage_size}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Preço e Rendimento */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
                      
                      <div className="text-left sm:text-right">
                        <span className="text-[10.5px] text-gray-400 block">Valor Investido</span>
                        <span className="text-[14px] font-bold text-gray-900">
                          KZ {Number(order.preco_pago).toLocaleString('pt-AO')}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10.5px] text-gray-400 block">Renda Diária</span>
                        <span className="text-[14px] font-bold text-emerald-600">
                          +KZ {Number(order.renda_diaria).toLocaleString('pt-AO')}/dia
                        </span>
                      </div>

                    </div>

                  </div>

                  {/* Rodapé e Ações do Pedido */}
                  <div className="bg-[#FDFDFD] px-3 sm:px-4 py-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Garantia de Rendimento Ativa e Assegurada</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate('/suporte')}
                        className="px-3 py-1 bg-white border border-gray-200 hover:border-gray-400 text-gray-700 text-[11.5px] font-medium transition-colors cursor-pointer"
                      >
                        Suporte do Pedido
                      </button>

                      {order.url_download_setup && (
                        <button
                          type="button"
                          onClick={() => window.open(order.url_download_setup, '_blank')}
                          className="px-3 py-1 bg-[#FF5000] hover:bg-[#E04400] text-white text-[11.5px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Contrato / Arquivo</span>
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>

    </div>
  );
}
