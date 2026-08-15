import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { 
  ChevronLeft, 
  Search, 
  Users, 
  ChevronRight, 
  Headphones,
  Clock
} from 'lucide-react';

export default function Support() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [links, setLinks] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLinks() {
      const { data } = await supabase
        .from('atendimento_links')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (data) setLinks(data);
      setLoading(false);
    }
    fetchLinks();
  }, []);

  const openLink = (url: string | null) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      showToast('Suporte indisponível no momento.', 'error');
    }
  };

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
          Suporte CanadianSolar
        </h1>
        <div className="w-10" />
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] flex flex-col px-6 pb-20 pt-8"
      >
        {/* Search Bar - Estilo Login */}
        <div className="mb-8 relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <button
            onClick={() => navigate('/help-faq')}
            className="w-full h-[50px] pl-12 pr-6 bg-[#F5F5F5] rounded-[25px] text-[14px] text-gray-400 font-light text-left outline-none hover:bg-gray-200 transition-colors"
          >
            Procurar respostas...
          </button>
        </div>

        {/* Support Options */}
        <div className="space-y-4">
          {/* Contactar Gerente */}
          <button
            onClick={() => openLink(links?.whatsapp_gerente_url)}
            className="w-full h-[50px] px-6 bg-gradient-to-r from-[#C62828] to-[#1A237E] text-white flex items-center justify-between group active:scale-[0.98] transition-all rounded-[25px]"
          >
            <div className="flex items-center space-x-4">
              <Headphones className="w-5 h-5" />
              <span className="text-[15px] font-medium">Contactar Gerente</span>
            </div>
            <ChevronRight className="w-5 h-5 opacity-50 group-hover:opacity-100" />
          </button>

          {/* Entrar grupo WhatsApp */}
          <button
            onClick={() => openLink(links?.whatsapp_grupo_vendas_url)}
            className="w-full h-[50px] px-6 bg-gradient-to-r from-[#C62828] to-[#1A237E] text-white flex items-center justify-between group active:scale-[0.98] transition-all rounded-[25px]"
          >
            <div className="flex items-center space-x-4">
              <Users className="w-5 h-5" />
              <span className="text-[15px] font-medium">Entrar grupo WhatsApp</span>
            </div>
            <ChevronRight className="w-5 h-5 opacity-50 group-hover:opacity-100" />
          </button>
        </div>

        {/* Help Cards */}
        <div className="mt-12 space-y-4">
          <div className="p-5 bg-gray-50 rounded-[20px] flex items-start space-x-4 border border-gray-100">
            <Clock className="w-5 h-5 text-gray-400 shrink-0 mt-1" />
            <div>
              <h4 className="text-[14px] font-medium text-[#333333]">Horário de Luanda</h4>
              <p className="text-[12px] text-gray-500 font-light">Segunda a Sábado: 10h às 22h</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
