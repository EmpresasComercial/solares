import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, AlertTriangle, RefreshCw, X } from 'lucide-react';

export const ConnectivityOverlay: React.FC = () => {
  const [errorType, setErrorType] = useState<'offline' | 'timeout' | null>(null);
  const [activeRequests, setActiveRequests] = useState(0);

  useEffect(() => {
    const handleOffline = () => setErrorType('offline');
    const handleTimeout = () => setErrorType('timeout');
    const handleOnline = () => {
      if (errorType === 'offline') setErrorType(null);
    };

    const handleLoadingStart = () => setActiveRequests(prev => prev + 1);
    const handleLoadingEnd = () => setActiveRequests(prev => Math.max(0, prev - 1));

    window.addEventListener('app:offline', handleOffline);
    window.addEventListener('app:timeout', handleTimeout);
    window.addEventListener('online', handleOnline);
    window.addEventListener('app:loading-start', handleLoadingStart);
    window.addEventListener('app:loading-end', handleLoadingEnd);

    return () => {
      window.removeEventListener('app:offline', handleOffline);
      window.removeEventListener('app:timeout', handleTimeout);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('app:loading-start', handleLoadingStart);
      window.removeEventListener('app:loading-end', handleLoadingEnd);
    };
  }, [errorType]);

  const handleRetry = () => {
    setErrorType(null);
    window.location.reload();
  };

  return (
    <>
      {/* Global Loading Bar in corporate gradient */}
      <AnimatePresence>
        {activeRequests > 0 && !errorType && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 h-0.5 z-[10000] overflow-hidden bg-transparent"
          >
            <motion.div 
              className="h-full bg-gradient-to-r from-[#C62828] to-[#1A237E]"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {errorType && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[10001] p-3 flex justify-center pointer-events-none"
          >
            <div className="bg-white border border-gray-100/80 shadow-none rounded-[20px] p-4 flex items-center gap-3.5 pointer-events-auto max-w-[90%] md:max-w-md">
              {/* Icon Status */}
              <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center shrink-0 border border-gray-50">
                {errorType === 'offline' ? (
                  <WifiOff className="w-5 h-5 text-[#C62828]" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                )}
              </div>
              
              {/* Text detail */}
              <div className="flex-1 min-w-0 flex flex-col">
                <p className="text-[13px] font-medium text-[#333333] leading-tight">
                  {errorType === 'offline' ? 'Sem Conexão' : 'Instabilidade de Rede'}
                </p>
                <p className="text-[11px] text-gray-400 font-light leading-snug mt-0.5">
                  {errorType === 'offline' 
                    ? 'Verifique a sua rede de internet.' 
                    : 'A ligação está lenta ou instável.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 pl-3 border-l border-gray-100">
                <button 
                  onClick={handleRetry}
                  className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-all text-[#1A237E]"
                  title="Atualizar"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setErrorType(null)}
                  className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-all text-gray-400"
                  title="Fechar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
