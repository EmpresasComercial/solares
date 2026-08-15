import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { 
  ChevronLeft, 
  Activity, 
  Loader2
} from 'lucide-react';
import { OperationsPageSkeleton } from '../components/Skeleton';

interface OpsStatusResponse {
  success: boolean;
  estimated_income?: number;
  has_servers?: boolean;
  is_collected_today?: boolean;
  message?: string;
}

export default function Operations() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [isOperating, setIsOperating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [estimatedIncome, setEstimatedIncome] = useState(0);
  const [hasServers, setHasServers] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      try {
        const { data, error } = await supabase.rpc('get_daily_ops_status_mcpn');
        if (error) throw error;
        
        const response = data as unknown as OpsStatusResponse;
        if (response?.success) {
          setEstimatedIncome(Number(response.estimated_income || 0));
          setHasServers(response.has_servers || false);
          
          if (response.is_collected_today) {
            setIsCompleted(true);
            setProgress(100);
          }
        }
      } catch (err: any) {
        console.error('Falhou, recarregue a pagina', err.message);
      } finally {
        setLoading(false);
      }
    }
    checkStatus();
  }, []);

  const startTask = async () => {
    if (isCompleted || !hasServers) {
      if (!hasServers) showToast('Invista para coletar rendimentos.', 'error');
      return;
    }
    
    setIsOperating(true);
    setProgress(0);

    const duration = 3000;
    const interval = 50;
    const steps = duration / interval;
    const increment = 100 / steps;
    
    let currentProgress = 0;
    const timer = setInterval(async () => {
      currentProgress += increment;
      if (currentProgress >= 100) {
        setProgress(100);
        clearInterval(timer);
        
        try {
          const { data, error } = await supabase.rpc('collect_daily_earnings');
          if (error) throw error;
          
          const response = data as unknown as OpsStatusResponse;
          if (response?.success) {
            setIsCompleted(true);
            setIsOperating(false);
            showToast(response.message || 'Ganhos coletados!', 'success');
          } else {
            setIsOperating(false);
            setProgress(0);
            showToast(response?.message || 'Coleta excedida', 'error');
          }
        } catch (err: any) {
          setIsOperating(false);
          setProgress(0);
          showToast(err.message || 'Falha, recarregue a pagina.', 'error');
        }
      } else {
        setProgress(Math.floor(currentProgress));
      }
    }, interval);
  };

  if (loading) {
    return <OperationsPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* Header Premium Flat */}
      <header className="w-full px-6 py-4 flex items-center justify-between bg-white sticky top-0 z-50 border-b border-gray-50">
        <button 
          onClick={() => navigate('/perfil')} 
          className="w-10 h-10 flex items-center justify-start text-[#333333] active:opacity-50 transition-opacity"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[16px] font-medium text-[#333333] absolute left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
          Iniciar Operações
        </h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 w-full max-w-[450px] px-6 pb-20 pt-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-10"
        >
          {/* Status e Progresso */}
          <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
              <div className="flex items-center space-x-3">
                <Activity className="w-4 h-4 text-gray-300" />
                <span className="text-[14px] font-normal text-[#333333]">{t('ops.system_status')}</span>
              </div>
              <div className={cn(
                "px-3 py-0.5 rounded-full text-[9px] font-bold tracking-widest",
                isOperating ? "bg-[#1A237E] text-white" : 
                isCompleted ? "bg-[#107c10] text-white" : "bg-gray-50 text-gray-400"
              )}>
                {isOperating ? t('ops.processing') : isCompleted ? t('ops.completed') : t('ops.waiting')}
              </div>
            </div>

            <div className="space-y-3">
              <div className="h-[4px] bg-gray-50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className={cn(
                    "h-full transition-all duration-300 ease-out",
                    isCompleted ? "bg-[#107c10]" : "bg-gradient-to-r from-[#C62828] to-[#1A237E]"
                  )}
                />
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-[13px] font-light text-gray-400 italic">
                  {isOperating ? t('ops.synchronized') : (isCompleted ? "Sincro finalizada" : "Aguardando link")}
                </span>
                <span className={cn(
                  "text-[14px] font-medium",
                  isCompleted ? "text-[#C62828]" : "text-[#1A237E]"
                )}>{progress}%</span>
              </div>
            </div>
          </div>

          {/* Large Central Action Button - Sized Down */}
          <div className="flex justify-center py-6">
            <button 
              onClick={startTask}
              disabled={isCompleted || loading}
              className={cn(
                "w-32 h-32 rounded-full flex flex-col items-center justify-center space-y-3 transition-all active:scale-[0.95] relative overflow-hidden",
                isCompleted 
                  ? "bg-[#107c10] text-white shadow-sm" 
                  : "bg-gradient-to-r from-[#C62828] to-[#1A237E] text-white shadow-md shadow-blue-900/10"
              )}
            >
              <AnimatePresence mode="wait">
                {isOperating ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Loader2 className="w-10 h-10 animate-spin" />
                  </motion.div>
                ) : (
                  <motion.div key="icon" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden p-1.5 shadow-sm">
                      <img src="/icone_power_exe.tarefas.png" alt="tarefa" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[14px] font-medium tracking-wide">
                      {isCompleted ? "Concluído" : "Iniciar"}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* Metrics - Clean Style */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-gray-50 rounded-[25px] p-5 text-center">
              <p className="text-[13px] text-gray-400 mb-1 font-normal">Concluídas</p>
              <p className="text-[16px] font-semibold text-[#C62828]">
                {isCompleted ? "1" : "0"}
              </p>
            </div>
            <div className="bg-white border border-gray-50 rounded-[25px] p-5 text-center">
              <p className="text-[13px] text-gray-400 mb-1 font-normal">Não Concluídas</p>
              <p className="text-[16px] font-semibold text-[#C62828]">
                {isCompleted ? "0" : (hasServers ? "1" : "0")}
              </p>
            </div>
          </div>
          
          {/* Estimated Income Info */}
          {!isCompleted && estimatedIncome > 0 && (
            <div className="text-center pt-2">
              <p className="text-[12px] text-gray-300 font-light tracking-wide">
                Rendimento estimado: <span className="text-gray-400 font-medium">{estimatedIncome.toLocaleString('pt-BR')},00 Kz</span>
              </p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
