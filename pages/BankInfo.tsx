import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  ChevronLeft, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Landmark,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { Skeleton } from '../components/Skeleton';

export default function BankInfo() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect');
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [linkedBanks, setLinkedBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });

  useEffect(() => {
    async function fetchBanks() {
      try {
        const { data, error } = await supabase.rpc('get_my_bank_accounts_mcpn');
        if (error) throw error;
        if (data) setLinkedBanks(data);
      } catch (err) {
        console.error('Falha, recarregue a pagina:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBanks();
  }, []);

  const maskIban = (iban: string) => {
    if (!iban || iban.length < 15) return iban;
    return `${iban.slice(0, 8)}*****${iban.slice(-8)}`;
  };

  const handleDelete = async (id: string) => {
    try {
      const { data, error } = await supabase.rpc('remove_bank_account_mcpn', {
        p_id: id
      });
      
      if (error) throw error;

      const result = data as { success: boolean; message: string } | null;
      if (!result?.success) throw new Error(result?.message || 'Falha, tente novamente');
      
      setLinkedBanks(prev => prev.filter(b => b.id !== id));
      showToast('Conta excluída com sucesso!', 'success');
    } catch (err: any) {
      showToast('Falha: ' + err.message, 'error');
    } finally {
      setDeleteDialog({ isOpen: false, id: null });
    }
  };

  const hasBanks = linkedBanks.length > 0;

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] pb-28 font-sans antialiased text-[#1A1C1E] select-none">
      
      <ConfirmDialog 
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null })}
        onConfirm={() => deleteDialog.id && handleDelete(deleteDialog.id)}
        title="Dicas"
        message="Tem certeza que deseja excluir esta conta bancária?"
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
        variant="danger"
      />

      {/* 1. HEADER VERDE ORGÂNICO */}
      <div className="relative bg-gradient-to-br from-[#D32F2F] via-[#C62828] to-[#B71C1C] pt-7 pb-16 px-5 text-white overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
          viewBox="0 0 380 260"
          preserveAspectRatio="none"
        >
          <path d="M190,0 Q185,130 190,260" stroke="#FFFFFF" strokeWidth="1.8" fill="none" opacity="0.6" />
          <path d="M190,40 C140,70 70,110 0,130" stroke="#FFFFFF" strokeWidth="1.2" fill="none" opacity="0.4" />
          <path d="M190,40 C240,70 310,110 380,130" stroke="#FFFFFF" strokeWidth="1.2" fill="none" opacity="0.4" />
          <path d="M190,140 C140,170 80,210 0,230" stroke="#FFFFFF" strokeWidth="1.2" fill="none" opacity="0.4" />
          <path d="M190,140 C240,170 300,210 380,230" stroke="#FFFFFF" strokeWidth="1.2" fill="none" opacity="0.4" />
        </svg>

        <div className="relative z-10 flex items-center justify-between max-w-[430px] mx-auto w-full">
          <button
            onClick={() => navigate(redirectPath || '/perfil')}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white active:scale-95 transition-transform"
            aria-label={t('common.back')}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <h1 className="text-[17px] font-semibold text-white tracking-tight">
            Minhas Contas
          </h1>

          <div className="w-9" />
        </div>
      </div>

      {/* 2. CONTEÚDO DOS CARDS */}
      <div className="max-w-[430px] mx-auto px-4 -mt-8 relative z-20 space-y-3.5">
        
        {loading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-[8px] p-4.5 border border-gray-100/60 shadow-[0_4px_24px_rgba(0,0,0,0.06)] space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-[30px] h-[30px]" rounded="rounded-[7px]" />
                    <div className="space-y-1.5">
                      <Skeleton className="w-24 h-3.5" />
                      <Skeleton className="w-32 h-3" />
                    </div>
                  </div>
                  <Skeleton className="w-12 h-5" rounded="rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : linkedBanks.length === 0 ? (
          <div className="bg-white rounded-[8px] p-8 text-center border border-gray-100/60 shadow-[0_4px_24px_rgba(0,0,0,0.06)] flex flex-col items-center space-y-3">
            <div className="w-12 h-12 rounded-[10px] bg-red-50 flex items-center justify-center text-[#C62828]">
              <Landmark className="w-6 h-6" />
            </div>
            <p className="text-[14px] text-[#64748B] font-medium leading-relaxed">
              Ainda não tens nenhuma conta bancária vinculada.
            </p>
          </div>
        ) : (
          linkedBanks.map((bank) => (
            <motion.div
              key={bank.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[8px] p-4.5 border border-gray-100/60 shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-[30px] h-[30px] rounded-[7px] bg-red-50 flex items-center justify-center text-[#C62828] shrink-0 p-1">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold text-[#1A1C1E]">{bank.bank_name}</h3>
                    <p className="text-[12px] font-mono text-[#64748B]">{maskIban(bank.iban)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-100">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] text-emerald-600 font-semibold">Ativa</span>
                </div>
              </div>
            </motion.div>
          ))
        )}

        {/* Botões de Ação */}
        <div className="pt-2">
          {hasBanks ? (
            <button
              onClick={() => setDeleteDialog({ isOpen: true, id: linkedBanks[0].id })}
              className="w-full h-[46px] rounded-[8px] bg-red-50 hover:bg-red-100/70 text-red-600 font-semibold text-[14px] transition active:scale-[0.99] flex items-center justify-center space-x-2 border border-red-100 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
              <span>Eliminar Conta</span>
            </button>
          ) : (
            <button
              onClick={() => navigate(`/adicionar-banco${redirectPath ? `?redirect=${redirectPath}` : ''}`)}
              className="w-full h-[46px] rounded-[8px] bg-gradient-to-r from-[#D32F2F] to-[#B71C1C] text-white font-semibold text-[15px] transition active:scale-[0.99] shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Vincular Nova Conta</span>
            </button>
          )}
        </div>

        {/* Segurança Garantida */}
        <div className="bg-white rounded-[8px] p-4.5 border border-gray-100/60 shadow-xs space-y-2 mt-4">
          <div className="flex items-center space-x-2 text-[#C62828]">
            <ShieldCheck className="w-4 h-4" />
            <h4 className="text-[13px] font-semibold tracking-tight">Segurança Garantida</h4>
          </div>
          <p className="text-[12px] text-[#64748B] leading-relaxed">
            As suas informações bancárias estão protegidas por criptografia de ponta a ponta e são utilizadas exclusivamente para processamento seguro dos seus levantamentos.
          </p>
        </div>

      </div>
    </div>
  );
}
