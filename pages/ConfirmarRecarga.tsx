import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';

interface RechargeResponse {
  success: boolean;
  message: string;
}

export default function ConfirmarRecarga() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const rechargeId = searchParams.get('id');
  const amount = searchParams.get('amount');
  const bankId = searchParams.get('bankId');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [proofFile, setProofFile] = useState<File | Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBank() {
      if (!bankId) return;
      const { data, error } = await supabase
        .rpc('get_collection_bank_details_mcpn', { p_bank_id: bankId });
      
      if (!error && data && data.length > 0) {
        setBankDetails(data[0]);
      }
    }
    fetchBank();
  }, [bankId]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    showToast('Copiad!', 'success');
  };

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Falha, tente novamente'));
            },
            'image/jpeg',
            0.8
          );
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsOptimizing(true);
      try {
        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result as string);
        reader.readAsDataURL(file);

        const optimizedBlob = await compressImage(file);
        setProofFile(optimizedBlob);
      } catch (err) {
        setProofFile(file);
      } finally {
        setIsOptimizing(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofFile) {
      showToast('Por favor, voucher de depósito.', 'error');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(10);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilizador não autenticado');

      const fileName = `${user.id}/${rechargeId}_${Date.now()}.jpg`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('recargas')
        .upload(fileName, proofFile, { 
          upsert: true,
          contentType: 'image/jpeg'
        });

      if (uploadError) throw uploadError;
      setUploadProgress(60);

      const { data, error: rpcError } = await supabase.rpc('confirm_recharge_mcpn', {
        p_recharge_id: rechargeId || '',
        p_bank_name: bankDetails?.nome_banco || 'Depósito Bancário',
        p_image_path: uploadData.path
      }) as { data: RechargeResponse | null; error: any };

      if (rpcError) throw rpcError;
      setUploadProgress(100);

      if (data && data.success) {
        showToast(data.message, 'success');
        setTimeout(() => navigate('/registro-transnacionais?tab=recarga'), 1500);
      } else {
        showToast(data?.message || 'Falha, tente novamente.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Falha.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center sticky top-0 z-50 bg-white/80 backdrop-blur-md">
        <button 
          onClick={() => navigate('/recarregar')} 
          className="w-10 h-10 flex items-center justify-start text-[#333333]"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-[16px] font-medium text-[#333333] ml-2">{t('recharge_confirm.title')}</h1>
      </header>

      <div className="flex-1 px-6 pb-10">
        <div className="mt-8 mb-8 text-center">
          <p className="text-[14px] text-gray-400 font-light mb-1">{t('recharge_confirm.amount_deposit')}</p>
          <div className="flex items-center justify-center space-x-2">
            <h2 className="text-[36px] font-light text-[#1A237E]">
              {Number(amount).toLocaleString()} <span className="text-[14px] font-light opacity-60">Kz</span>
            </h2>
            <button 
              onClick={() => copyToClipboard(amount || '', 'amount')}
              className="p-2 text-gray-400 hover:text-[#1A237E] transition-colors"
            >
              {copiedField === 'amount' ? (
                <svg className="w-5 h-5 text-[#C62828]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {bankDetails && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#F5F5F5] rounded-[24px] p-6 mb-8 space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[11px] text-gray-400 tracking-wider">{t('recharge_confirm.bank_label')}</p>
                <p className="text-[14px] font-medium text-[#333333]">{bankDetails.nome_banco}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] text-gray-400 tracking-wider">{t('recharge_confirm.beneficiary_label')}</p>
                <p className="text-[14px] font-medium text-[#333333]">{bankDetails.nome_proprietario}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] text-gray-400 tracking-wider">{t('recharge_confirm.iban_label')}</p>
              <div className="flex items-center justify-between bg-white rounded-[16px] p-4 border border-gray-100">
                <p className="text-[13px] font-medium text-[#1A237E] flex-1 break-all mr-3">{bankDetails.iban}</p>
                <button 
                  onClick={() => copyToClipboard(bankDetails.iban, 'iban')}
                  className="w-10 h-10 flex items-center justify-center bg-[#1A237E] rounded-[12px] text-white active:scale-95 transition-transform"
                >
                  {copiedField === 'iban' ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[14px] text-[#333333] mb-4 font-normal">{t('recharge_confirm.proof_label')}</label>
            <input 
              type="file" id="proofInput" className="hidden" accept="image/*"
              onChange={handleFileChange}
            />
            <div 
              onClick={() => !isSubmitting && document.getElementById('proofInput')?.click()}
              className={cn(
                "h-[140px] rounded-[24px] border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer",
                previewUrl 
                  ? "border-red-400 bg-red-50/30" 
                  : "border-gray-200 bg-gray-50 hover:border-[#1A237E] hover:bg-white"
              )}
            >
              {previewUrl ? (
                <div className="flex flex-col items-center">
                  <img src={previewUrl} className="w-12 h-12 object-cover rounded-[10px] mb-2 border border-red-200" alt="preview" />
                  <p className="text-[13px] text-[#C62828] font-medium">{t('recharge_confirm.proof_selected')}</p>
                  <p className="text-[11px] text-[#C62828]/60">{t('recharge_confirm.click_change')}</p>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-[14px] text-gray-500 font-light text-center">{t('recharge_confirm.click_upload')}<br/><span className="text-[11px] opacity-60">{t('recharge_confirm.photo_file')}</span></p>
                </>
              )}
            </div>
          </div>

          <div className="pt-4 relative">
            <AnimatePresence>
              {isSubmitting && (
                <div className="absolute -top-4 left-0 right-0">
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-[#1A237E]"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#1A237E] mt-1 text-center font-medium">{t('recharge_confirm.sending')} {uploadProgress}%</p>
                </div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isSubmitting || !proofFile}
              className="w-full h-[55px] rounded-[27.5px] bg-gradient-to-r from-[#C62828] to-[#1A237E] text-white font-medium text-[16px] transition-all hover:opacity-90 disabled:opacity-50 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  {t('recharge_confirm.confirming')}
                </span>
              ) : (
                t('recharge_confirm.confirm_deposit')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
