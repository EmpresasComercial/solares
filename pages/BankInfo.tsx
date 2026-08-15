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
  ShieldCheck
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
      } catch {
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
    <div className="w-full min-h-screen bg-[#F2F2F2] pb-28 font-sans antialiased text-[#202020] select-none flex flex-col items-center">
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

      <header className="w-full max-w-[480px] bg-white px-4 pt-4 pb-3 sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(redirectPath || '/perfil')}
            className="p-1 -ml-1 text-[#202020] active:scale-95 transition-transform"
            aria-label={t('common.back')}
          >
            <ChevronLeft className="w-5 h-5 stroke-[1.8]" />
          </button>
          
          <h1 className="text-[14.5px] font-medium text-[#202020] tracking-normal">
            Minhas Contas
          </h1>
        </div>
      </header>

      <main className="w-full max-w-[480px] px-4 pt-4 space-y-3">
        {loading ? (
          <div className="space-y-2.5">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-none p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-2.5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-8 h-8 rounded-none" />
                    <div className="space-y-1.5">
                      <Skeleton className="w-24 h-3.5 rounded-none" />
                      <Skeleton className="w-32 h-3 rounded-none" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : linkedBanks.length === 0 ? (
          <div className="bg-white rounded-none p-8 text-center shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col items-center space-y-2">
            <Landmark className="w-8 h-8 text-gray-300" />
            <p className="text-[13px] text-[#777777] font-normal leading-relaxed">
              Ainda não tens nenhuma conta bancária vinculada.
            </p>
          </div>
        ) : (
          linkedBanks.map((bank) => (
            <motion.div
              key={bank.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-none p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-none bg-red-50 flex items-center justify-center text-[#FE384F] shrink-0">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-[13.5px] font-medium text-[#202020]">{bank.bank_name}</h3>
                    <p className="text-[12px] font-mono text-[#777777]">{maskIban(bank.iban)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-none text-[10.5px]">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Ativa</span>
                </div>
              </div>
            </motion.div>
          ))
        )}

        <div>
          {hasBanks ? (
            <button
              onClick={() => setDeleteDialog({ isOpen: true, id: linkedBanks[0].id })}
              className="w-full h-[44px] rounded-none bg-red-50 hover:bg-red-100 text-[#FE384F] font-normal text-[13.5px] transition active:scale-[0.99] flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar Conta</span>
            </button>
          ) : (
            <button
              onClick={() => navigate(`/adicionar-banco${redirectPath ? `?redirect=${redirectPath}` : ''}`)}
              className="w-full h-[44px] rounded-none bg-[#FE384F] hover:bg-[#E02E44] text-white font-normal text-[13.5px] transition active:scale-[0.99] shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Vincular Nova Conta</span>
            </button>
          )}
        </div>

        <div className="bg-white rounded-none p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-1.5">
          <div className="flex items-center space-x-2 text-[#FE384F]">
            <ShieldCheck className="w-4 h-4" />
            <h4 className="text-[12.5px] font-medium">Segurança Garantida</h4>
          </div>
          <p className="text-[11.5px] text-[#777777] font-normal leading-relaxed">
            As suas informações bancárias estão protegidas por criptografia de ponta a ponta e são utilizadas exclusivamente para processamento seguro dos seus levantamentos.
          </p>
        </div>
      </main>
    </div>
  );
}
