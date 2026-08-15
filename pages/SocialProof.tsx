import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { EmptyState } from '../components/EmptyState';
import { SmartImage } from '../components/SmartImage';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';
import { Loader2, Plus, X, Camera, MessageSquare } from 'lucide-react';

interface Proof {
  id: string;
  user: string;
  amount: string;
  comment: string;
  image: string;
  timestamp: string;
}

export default function SocialProof() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [proofs, setProofs] = useState<Proof[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [comment, setComment] = useState('');
  const [amount, setAmount] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchProofs() {
      try {
        const { data, error } = await supabase.rpc('get_approved_social_proofs_mcpn');
        if (error) throw error;
        if (data) {
          const mapped: Proof[] = data
            .filter((item: any) => item && item.id && item.user_id)
            .map((item: any) => ({
              id: item.id,
              user: `M-E ***${String(item.user_id).substring(0, 4)}`,
              amount: `${Number(item.valor || 0).toLocaleString()},00 Kz`,
              comment: item.comentario || '',
              image: item.imagem_url || '',
              timestamp: item.created_at ? new Date(item.created_at).toLocaleString('pt-AO') : '---'
            }));
          setProofs(mapped);
        }
      } catch (err: any) {
        console.error('Falhou, carregue a pagina', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProofs();

    const channel = supabase
      .channel('social_proofs_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'social_proofs_mcpn',
          filter: 'status=eq.aprovado'
        },
        (payload) => {
          const newItem = payload.new;
          if (!newItem || !newItem.id || !newItem.user_id) return;
          const mapped: Proof = {
            id: newItem.id,
            user: `M-E ***${String(newItem.user_id).substring(0, 4)}`,
            amount: `${Number(newItem.valor || 0).toLocaleString()},00 Kz`,
            comment: newItem.comentario || '',
            image: newItem.imagem_url || '',
            timestamp: newItem.created_at ? new Date(newItem.created_at).toLocaleString('pt-AO') : '---'
          };
          setProofs(prev => [mapped, ...prev]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setAmount(val);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.replace(/[<>]/g, '').slice(0, 200);
    setComment(val);
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const max_size = 1200;
          if (width > height) {
            if (width > max_size) { height *= max_size / width; width = max_size; }
          } else {
            if (height > max_size) { width *= max_size / height; height = max_size; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast('Tamanho enorme. Tente uma menor.', 'error');
        return;
      }
      setIsProcessingImage(true);
      try {
        const compressed = await compressImage(file);
        setImage(compressed);
      } catch (err) {
        showToast('Falha no servidor.', 'error');
      } finally {
        setIsProcessingImage(false);
        e.target.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !comment || !image) {
      showToast('Preencha todos os campos e anexe a foto.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Sessão expirada.');

      let finalImageUrl = image;

      if (image && image.startsWith('data:')) {
        const response = await fetch(image);
        const blob = await response.blob();
        const fileName = `${userData.user.id}-${Date.now()}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from('provas-sociais')
          .upload(fileName, blob, {
            contentType: 'image/jpeg',
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('provas-sociais')
          .getPublicUrl(fileName);

        finalImageUrl = urlData.publicUrl;
      }

      const { data, error } = await supabase.rpc('submit_social_proof_mcpn', {
        p_valor: Number(amount),
        p_comentario: comment,
        p_imagem_url: finalImageUrl
      });

      if (error) throw error;

      const result = data as any;

      if (data && result.success) {
        showToast(result.message || 'Prova enviada!', 'success');
        setShowForm(false);
        setAmount('');
        setComment('');
        setImage(null);

        const { data: newData } = await supabase.rpc('get_approved_social_proofs_mcpn');
        if (newData) {
          const mapped: Proof[] = newData
            .filter((item: any) => item && item.id && item.user_id)
            .map((item: any) => ({
              id: item.id,
              user: `M-E ***${String(item.user_id).substring(0, 4)}`,
              amount: `${Number(item.valor || 0).toLocaleString()},00 Kz`,
              comment: item.comentario || '',
              image: item.imagem_url || '',
              timestamp: item.created_at ? new Date(item.created_at).toLocaleString('pt-AO') : '---'
            }));
          setProofs(mapped);
        }
      } else {
        showToast(result?.message || 'Falhou, tente novamente.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Falha no servidor.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between sticky top-0 z-50 bg-white/80 backdrop-blur-md">
        <button
          onClick={() => showForm ? setShowForm(false) : navigate('/home')}
          className="w-10 h-10 flex items-center justify-start text-[#333333]"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h1 className="text-[16px] font-medium text-[#333333] absolute left-1/2 -translate-x-1/2">
          {showForm ? 'Partilhar Sucesso' : t('social.proof_title')}
        </h1>

        <button
          onClick={() => setShowForm(!showForm)}
          className={cn(
            "w-10 h-10 flex items-center justify-center rounded-full transition-all",
            showForm ? "bg-red-50 text-red-500" : "bg-[#F5F5F5] text-[#1A237E]"
          )}
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </header>

      <div className="flex-1 px-6 pb-24 mt-4 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          {showForm ? (
            /* ── FORMULÁRIO ── */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 pt-2"
            >
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Upload */}
                <div>
                  <label className="block text-[14px] text-[#333333] mb-2 font-normal">Foto do Comprovativo</label>
                  <input
                    id="social-proof-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  {!image ? (
                    <label
                      htmlFor="social-proof-upload"
                      className={cn(
                        "w-full h-[120px] bg-[#F5F5F5] rounded-[20px] flex flex-col items-center justify-center text-gray-400 cursor-pointer transition-all hover:bg-gray-100",
                        isProcessingImage && "opacity-50 cursor-wait"
                      )}
                    >
                      <Camera className="w-8 h-8 mb-2 text-gray-300" />
                      <span className="text-[13px] font-light text-gray-400">
                        {isProcessingImage ? 'A processar...' : 'Toque para carregar foto'}
                      </span>
                    </label>
                  ) : (
                    <div className="relative rounded-[20px] overflow-hidden border border-gray-100">
                      <SmartImage src={image} alt="Preview" className="w-full h-auto max-h-[280px] object-contain bg-[#F9F9F9]" />
                      <button
                        type="button"
                        onClick={() => setImage(null)}
                        className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-500 shadow-sm"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Valor */}
                <div>
                  <label className="block text-[14px] text-[#333333] mb-2 font-normal">Valor Recebido (Kz)</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ex: 15000"
                      className="w-full h-[50px] bg-[#F5F5F5] rounded-[25px] px-6 outline-none text-[15px] text-[#1A237E] placeholder-gray-400 font-medium"
                      value={amount}
                      onChange={handleAmountChange}
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[12px] text-gray-400 font-light">Kz</span>
                  </div>
                </div>

                {/* Comentário */}
                <div>
                  <label className="block text-[14px] text-[#333333] mb-2 font-normal">O Seu Comentário</label>
                  <textarea
                    placeholder="Partilhe a sua experiência..."
                    className="w-full bg-[#F5F5F5] rounded-[20px] px-6 py-4 outline-none text-[15px] text-[#333333] placeholder-gray-400 resize-none min-h-[100px] font-light"
                    value={comment}
                    onChange={handleCommentChange}
                  />
                  <p className="text-[11px] text-gray-400 font-light ml-2 mt-1">{comment.length}/200</p>
                </div>

                {/* Botão */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-[50px] rounded-[25px] bg-gradient-to-r from-[#C62828] to-[#1A237E] text-white font-medium text-[16px] transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Enviar Comprovativo'}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            /* ── LISTA ── */
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 pt-2"
            >

              {/* Conteúdo */}
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#1A237E] opacity-30" />
                  <p className="text-[13px] text-gray-400 font-light">A carregar...</p>
                </div>
              ) : proofs.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-3">
                  <MessageSquare className="w-12 h-12 text-gray-200" />
                  <p className="text-[14px] text-gray-400 font-light text-center">Ainda não existem comprovativos aprovados.</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-2 text-[13px] text-[#1A237E] font-medium hover:underline"
                  >
                    Seja o primeiro a partilhar
                  </button>
                </div>
              ) : (
                proofs.map(proof => (
                  <motion.div
                    key={proof.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-100 rounded-[20px] overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className="px-5 py-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-[#C62828] to-[#1A237E] rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                          MS
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-[#333333]">{proof.user}</p>
                          <p className="text-[10px] text-gray-400 font-light">{proof.timestamp}</p>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-red-50 rounded-full">
                        <p className="text-[12px] font-medium text-[#C62828]">+{proof.amount}</p>
                      </div>
                    </div>

                    {/* Imagem */}
                    <SmartImage
                      src={proof.image}
                      alt="Comprovativo"
                      className="w-full h-auto max-h-[450px] object-contain bg-[#F9F9F9]"
                    />

                    {/* Comentário */}
                    {proof.comment && (
                      <div className="px-5 py-4 flex items-start space-x-2">
                        <MessageSquare className="w-3.5 h-3.5 text-gray-300 mt-0.5 shrink-0" />
                        <p className="text-[13px] text-gray-500 font-light italic">"{proof.comment}"</p>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
