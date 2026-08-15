import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ChevronLeft, 
  Copy, 
  Check, 
  Camera, 
  Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { formatCurrency } from '../lib/currency';

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
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [proofFile, setProofFile] = useState<File | Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBank() {
      if (!bankId) return;
      try {
        const { data, error } = await supabase
          .rpc('get_collection_bank_details_mcpn', { p_bank_id: bankId });
        
        if (!error && data && data.length > 0) {
          setBankDetails(data[0]);
        }
      } catch (err) {
        console.error('Erro ao buscar dados bancários:', err);
      }
    }
    fetchBank();
  }, [bankId]);

  const copyToClipboard = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    showToast('Copiado com sucesso!', 'success');
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
              else reject(new Error('Falha ao processar imagem'));
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
      } catch {
        setProofFile(file);
      } finally {
        setIsOptimizing(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofFile) {
      showToast('Por favor, anexe a foto do comprovativo.', 'error');
      return;
    }

    setIsSubmitting(true);

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

      const { data, error: rpcError } = await supabase.rpc('confirm_recharge_mcpn', {
        p_recharge_id: rechargeId || '',
        p_bank_name: bankDetails?.nome_banco || 'Depósito Bancário',
        p_image_path: uploadData.path
      }) as { data: RechargeResponse | null; error: any };

      if (rpcError) throw rpcError;

      if (data && data.success) {
        showToast(data.message || 'Enviado com sucesso!', 'success');
        navigate('/registro-transacoes?tab=recarga');
      } else {
        showToast(data?.message || 'Falha ao enviar, tente novamente.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Falha na conexão.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedAmount = amount ? formatCurrency(Number(amount), 'KZ') : '0,00 Kz';

  return (
    <div className="w-full min-h-screen bg-[#F2F2F2] pb-28 font-sans antialiased text-[#202020] select-none flex flex-col items-center">
      
      {/* ═════════════════════════════════════════════════════
          1. HEADER COM PROGRESSO EM 3 ETAPAS (Refinado & Sem ícone)
      ══════════════════════════════════════════════════════ */}
      <header className="w-full max-w-[480px] bg-[#FFFFFF] px-4 pt-3.5 pb-3 sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        
        {/* Topo do Header: Seta voltar + Título */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/recarregar')}
              className="p-1 -ml-1 text-[#202020] active:scale-95 transition-transform"
              aria-label={t('common.back')}
            >
              <ChevronLeft className="w-5 h-5 stroke-[1.8]" />
            </button>
            
            <h1 className="text-[14.5px] font-medium text-[#222222] tracking-normal">
              Recarregue em 3 etapas
            </h1>
          </div>
          <div className="w-6" />
        </div>

        {/* ════ BARRA DE PROGRESSO EM 3 ETAPAS ════ */}
        <div className="mt-3.5 px-3">
          <div className="relative flex items-center justify-between">
            
            {/* Linha de Conexão Ativa Total (Vermelha Fina) */}
            <div className="absolute left-3 right-3 top-2 h-[1.5px] bg-[#FE384F] -translate-y-1/2 z-0" />

            {/* Passo 1: Add valor (Completo) */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-[17px] h-[17px] rounded-full bg-[#FE384F] text-white flex items-center justify-center text-[9.5px] font-normal">
                <Check className="w-2.5 h-2.5 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-normal text-[#FE384F] mt-1 whitespace-nowrap">
                Add valor
              </span>
            </div>

            {/* Passo 2: Selecionar banco (Completo) */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-[17px] h-[17px] rounded-full bg-[#FE384F] text-white flex items-center justify-center text-[9.5px] font-normal">
                <Check className="w-2.5 h-2.5 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-normal text-[#FE384F] mt-1 whitespace-nowrap">
                Selecionar banco
              </span>
            </div>

            {/* Passo 3: Pagar (Ativo) */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-[17px] h-[17px] rounded-full bg-[#FE384F] text-white flex items-center justify-center text-[9.5px] font-normal">
                3
              </div>
              <span className="text-[10px] font-normal text-[#FE384F] mt-1 whitespace-nowrap">
                Pagar
              </span>
            </div>

          </div>
        </div>

      </header>

      {/* ═════════════════════════════════════════════════════
          2. CONTEÚDO PRINCIPAL (Arredondamento 4px / rounded-[4px])
      ══════════════════════════════════════════════════════ */}
      <main className="w-full max-w-[480px] px-3.5 pt-3 space-y-2.5">
        
        {/* CARD UNIFICADO DE DADOS BANCÁRIOS (rounded-[4px]) */}
        <div className="bg-[#FFFFFF] rounded-[4px] shadow-[0_1px_2px_rgba(0,0,0,0.03)] divide-y divide-gray-100 overflow-hidden">
          
          {/* 1. IBAN com ícone de copiar */}
          <div className="flex items-center justify-between py-2.5 px-3.5">
            <span className="text-[12.5px] text-[#666666] font-normal">
              IBAN
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] font-mono font-normal text-[#222222]">
                {bankDetails?.iban || 'Carregando...'}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(bankDetails?.iban || '', 'iban')}
                className="p-1 text-[#888888] hover:text-[#FE384F] active:scale-90 transition-transform"
                title="Copiar IBAN"
              >
                {copiedField === 'iban' ? (
                  <Check className="w-3.5 h-3.5 text-[#38A98B]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* 2. Nome do Banco com ícone de copiar */}
          <div className="flex items-center justify-between py-2.5 px-3.5">
            <span className="text-[12.5px] text-[#666666] font-normal">
              Banco
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[12.5px] font-normal text-[#222222]">
                {bankDetails?.nome_banco || '---'}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(bankDetails?.nome_banco || '', 'banco')}
                className="p-1 text-[#888888] hover:text-[#FE384F] active:scale-90 transition-transform"
                title="Copiar Nome do Banco"
              >
                {copiedField === 'banco' ? (
                  <Check className="w-3.5 h-3.5 text-[#38A98B]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* 3. Beneficiário com ícone de copiar */}
          <div className="flex items-center justify-between py-2.5 px-3.5">
            <span className="text-[12.5px] text-[#666666] font-normal">
              Beneficiário
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[12.5px] font-normal text-[#222222] truncate max-w-[160px] text-right">
                {bankDetails?.nome_proprietario || '---'}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(bankDetails?.nome_proprietario || '', 'beneficiario')}
                className="p-1 text-[#888888] hover:text-[#FE384F] active:scale-90 transition-transform"
                title="Copiar Beneficiário"
              >
                {copiedField === 'beneficiario' ? (
                  <Check className="w-3.5 h-3.5 text-[#38A98B]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* 4. Valor a Depositar com ícone de copiar */}
          <div className="flex items-center justify-between py-2.5 px-3.5">
            <span className="text-[12.5px] text-[#666666] font-normal">
              Valor a depositar
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-normal text-[#FE384F]">
                {formattedAmount}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(amount || '', 'amount')}
                className="p-1 text-[#888888] hover:text-[#FE384F] active:scale-90 transition-transform"
                title="Copiar Valor"
              >
                {copiedField === 'amount' ? (
                  <Check className="w-3.5 h-3.5 text-[#38A98B]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

        </div>

        {/* 5. ÁREA COMPACTA PARA SUBMETER COMPROVATIVO (rounded-[4px]) */}
        <form onSubmit={handleSubmit} id="confirm-recharge-form">
          <input 
            type="file" 
            id="proofInput" 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />

          <div 
            onClick={() => !isSubmitting && document.getElementById('proofInput')?.click()}
            className="bg-[#FFFFFF] rounded-[4px] px-3.5 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex items-center justify-between cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  className="w-5 h-5 object-cover rounded-[2px] border border-gray-200" 
                  alt="preview" 
                />
              ) : null}
              <span className="text-[12.5px] text-[#333333] font-normal">
                {previewUrl ? 'Comprovativo anexado' : 'Comprovativo de pagamento'}
              </span>
            </div>

            {/* Ícone de Câmera no canto direito */}
            <div className="flex items-center gap-1 text-[#FE384F]">
              <span className="text-[11px] font-normal">
                {isOptimizing ? '...' : previewUrl ? 'Alterar' : 'Anexar'}
              </span>
              <Camera className="w-3.5 h-3.5 stroke-[1.6]" />
            </div>
          </div>
        </form>

      </main>

      {/* ═════════════════════════════════════════════════════
          3. BARRA INFERIOR FIXA COM BOTÃO "Enviar" (rounded-[4px])
      ══════════════════════════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#F2F2F2] p-3.5 z-40 flex justify-center border-t border-gray-200/50">
        <div className="w-full max-w-[480px]">
          <button
            type="submit"
            form="confirm-recharge-form"
            disabled={isSubmitting || !proofFile || isOptimizing}
            className="w-full h-[40px] rounded-[4px] bg-[#FE384F] hover:bg-[#E02E44] active:scale-[0.99] text-[#FFFFFF] font-normal text-[13.5px] tracking-normal transition-all disabled:opacity-40 shadow-none flex items-center justify-center cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="animate-spin h-3.5 w-3.5 text-white" />
                <span>Enviando...</span>
              </span>
            ) : (
              <span>Enviar</span>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
