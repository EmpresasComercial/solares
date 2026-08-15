import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../components/Toast';
import { cn } from '../lib/utils';
import { SmartImage } from '../components/SmartImage';
import { History } from 'lucide-react';

export default function PurchaseHistory() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPurchases() {
      try {
        const { data, error } = await supabase.rpc('get_my_purchased_products_mcpn');
        if (error) throw error;
        if (data) setPurchases(data);
      } catch (err: any) {
        console.error('Falhou, recarregue a pagina', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPurchases();
  }, []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : 'pt-AO'
    );
  };

  return (
    <div className="min-h-screen bg-white pb-24 flex flex-col items-center">
      {/* Header Minimalist Premium Flat */}
      <header className="w-full px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-50 border-b border-gray-50">
        <button 
          onClick={() => navigate('/perfil')} 
          className="w-10 h-10 flex items-center justify-start text-[#333333] active:opacity-50 transition-opacity text-2xl font-light"
          aria-label={t('common.back')}
          title={t('common.back')}
        >
          ‹
        </button>
        <h1 className="text-[16px] font-medium text-[#333333] absolute left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
          {t('history.title')}
        </h1>
      </header>

      <main className="w-full max-w-[400px] px-6 py-6 flex-1">
        {loading ? (
          <div className="text-center py-20 text-gray-400 font-normal tracking-widest text-[10px] italic">
            Sincronizando licenças...
          </div>
        ) : purchases.length === 0 ? (
          <div className="bg-[#F9F9F9] rounded-[24px] p-16 text-center border border-gray-100/80 flex flex-col items-center">
             <History size={40} className="text-gray-300 mb-3" />
             <p className="text-[12px] text-gray-400 font-light tracking-wider">
               Nenhuma licença ativa
             </p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {purchases.map((item, idx) => {
                const dailyIncome = item.renda_diaria;
                return (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="group bg-[#F9F9F9] border border-gray-100/80 rounded-[24px] p-5 flex flex-col hover:border-gray-200/80 transition-all"
                  >
                    <div className="flex gap-4 items-start">
                      {/* Product Image - Square rounded */}
                      <div className="w-[76px] h-[76px] shrink-0 bg-white rounded-xl border border-gray-100 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 duration-500">
                        <SmartImage 
                          src={item.produto_imagem} 
                          className="w-full h-full object-cover" 
                          style={{ background: 'transparent' }}
                          alt={item.produto_nome}
                        />
                      </div>

                      {/* Title & License ID */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="text-[15px] font-medium text-[#333333] leading-tight truncate max-w-[150px]" title={item.produto_nome}>
                              {item.produto_nome}
                            </h3>
                            <span className={cn(
                              "px-2 py-0.5 rounded-[4px] text-[8px] font-medium tracking-wider border shrink-0",
                              item.ativo 
                                ? "text-[#C62828] bg-red-50/60 border-red-100" 
                                : "text-[#e81123] bg-red-50/60 border-red-100"
                            )}>
                              {item.ativo ? t('history.status_active') : t('history.status_expired')}
                            </span>
                          </div>
                          
                          <p className="text-[9px] text-gray-400 font-light tracking-wider">
                            {t('history.license_id')}: {item.id.toString().substring(0, 8).toUpperCase()}
                          </p>
                        </div>

                        {/* Invested & Daily Income inside details grid */}
                        <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-200/20">
                          <div className="flex flex-col">
                            <span className="text-[9px] text-[#94A3B8] font-light tracking-wider">
                              Investido
                            </span>
                            <span className="text-[13px] font-light text-[#333333]">
                              {Number(item.preco_pago).toLocaleString(undefined, { minimumFractionDigits: 2 })} Kz
                            </span>
                          </div>
                          
                          <div className="flex flex-col items-end">
                            <span className="text-[9px] text-[#94A3B8] font-light tracking-wider">
                              Renda Diária
                            </span>
                            <span className="text-[13px] font-light text-[#C62828]">
                              +{Number(dailyIncome).toLocaleString(undefined, { minimumFractionDigits: 2 })} Kz
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Table below the main layout */}
                    <div className="space-y-1.5 py-3 border-t border-gray-200/40 text-[11px] text-gray-500 font-light mt-3">
                      <div className="flex justify-between items-center">
                        <span>Data da compra</span>
                        <span className="font-light text-gray-700">{formatDate(item.data_inicio)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Data de expiração</span>
                        <span className="font-light text-gray-700">{formatDate(item.data_fim)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Armazenamento SSD</span>
                        <span className="font-light text-gray-700">{item.storage_size || '---'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-200/20">
                      <span className="text-[9px] text-[#94A3B8] font-light tracking-wider">
                        LICENÇA COMPRADA
                      </span>
                      
                      <button 
                        onClick={() => {
                          if (item.url_download_setup) {
                            window.open(item.url_download_setup, '_blank');
                          } else {
                            showToast('Download indisponível', 'error');
                          }
                        }}
                        className="h-7 px-5 rounded-full bg-gradient-to-r from-[#C62828] to-[#1A237E] flex items-center justify-center text-white text-[11px] font-light transition-all active:scale-95"
                      >
                        Download
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* End of list indicator */}
            <div className="text-center pt-8 pb-4 text-[12px] font-medium tracking-wide">
              <span className="bg-gradient-to-r from-[#C62828] to-[#1A237E] bg-clip-text text-transparent opacity-80">
                ~ Sem mais dados ~
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
