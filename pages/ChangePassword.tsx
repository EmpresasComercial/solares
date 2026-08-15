import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronLeft, Key, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function ChangePassword() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\s/g, '');
    setFormData({ ...formData, [e.target.name]: val });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword.length < 8) {
      showToast(t('auth.password_error_length'), 'error');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showToast(t('password.match_error'), 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 1. Obter utilizador atual para saber o email
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) {
        throw new Error('Sessão inválida. Faça login novamente.');
      }

      // 2. Re-autenticar com a senha atual (valida a senha e renova a sessão)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: formData.currentPassword
      });

      if (signInError) {
        throw new Error('A senha atual está incorreta.');
      }

      // 3. Atualizar para a nova senha via API direta (Evita que o JS client bloqueie o campo current_password)
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          password: formData.newPassword,
          current_password: formData.currentPassword
        })
      });

      const responseData = await res.json();
      if (!res.ok) {
        throw new Error(responseData.msg || responseData.message || 'Erro ao atualizar a senha');
      }

      showToast(t('password.success'), 'success');
      setTimeout(() => navigate('/configuracoes-conta'), 1500);
    } catch (err: any) {
      showToast(err.message || t('common.error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA] pb-28 font-sans antialiased text-[#1A1C1E] select-none">
      
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
            onClick={() => navigate('/configuracoes-conta')}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white active:scale-95 transition-transform"
            aria-label={t('common.back')}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <h1 className="text-[17px] font-semibold text-white tracking-tight">
            {t('password.security') || 'Alterar Senha'}
          </h1>

          <div className="w-9" />
        </div>
      </div>

      {/* 2. CONTEÚDO DOS CARDS */}
      <div className="max-w-[430px] mx-auto px-4 -mt-8 relative z-20 space-y-3.5">
        
        <div className="bg-white rounded-[8px] shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100/60 p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Senha Atual */}
            <div>
              <label className="block text-[13px] font-semibold text-[#1A1C1E] mb-1.5">{t('password.old_label')}</label>
              <div className="relative flex items-center h-[46px] rounded-[8px] bg-[#F8FAFC] border border-gray-200/80 px-3.5 focus-within:border-[#C62828] focus-within:ring-2 focus-within:ring-[#C62828]/20 transition-all">
                <div className="w-[26px] h-[26px] rounded-[6px] bg-red-50 flex items-center justify-center text-[#C62828] mr-2.5 shrink-0">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  name="currentPassword"
                  type={showCurrentPass ? "text" : "password"}
                  className="flex-1 h-full bg-transparent outline-none text-[14px] text-[#1A1C1E] placeholder:text-[#94A3B8] font-medium"
                  placeholder={t('password.old_placeholder')}
                  value={formData.currentPassword}
                  onChange={handleChange}
                />
                <button 
                  type="button" 
                  onClick={() => setShowCurrentPass(!showCurrentPass)} 
                  className="p-1 text-[#94A3B8] hover:text-[#C62828] active:scale-90 transition-transform"
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Nova Senha */}
            <div>
              <label className="block text-[13px] font-semibold text-[#1A1C1E] mb-1.5">{t('password.new_label')}</label>
              <div className="relative flex items-center h-[46px] rounded-[8px] bg-[#F8FAFC] border border-gray-200/80 px-3.5 focus-within:border-[#C62828] focus-within:ring-2 focus-within:ring-[#C62828]/20 transition-all">
                <div className="w-[26px] h-[26px] rounded-[6px] bg-red-50 flex items-center justify-center text-[#C62828] mr-2.5 shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  name="newPassword"
                  type={showNewPass ? "text" : "password"}
                  className="flex-1 h-full bg-transparent outline-none text-[14px] text-[#1A1C1E] placeholder:text-[#94A3B8] font-medium"
                  placeholder={t('password.new_placeholder')}
                  value={formData.newPassword}
                  onChange={handleChange}
                />
                <button 
                  type="button" 
                  onClick={() => setShowNewPass(!showNewPass)} 
                  className="p-1 text-[#94A3B8] hover:text-[#C62828] active:scale-90 transition-transform"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirmar Nova Senha */}
            <div>
              <label className="block text-[13px] font-semibold text-[#1A1C1E] mb-1.5">{t('password.confirm_label')}</label>
              <div className="relative flex items-center h-[46px] rounded-[8px] bg-[#F8FAFC] border border-gray-200/80 px-3.5 focus-within:border-[#C62828] focus-within:ring-2 focus-within:ring-[#C62828]/20 transition-all">
                <div className="w-[26px] h-[26px] rounded-[6px] bg-red-50 flex items-center justify-center text-[#C62828] mr-2.5 shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  name="confirmPassword"
                  type={showConfirmPass ? "text" : "password"}
                  className="flex-1 h-full bg-transparent outline-none text-[14px] text-[#1A1C1E] placeholder:text-[#94A3B8] font-medium"
                  placeholder={t('password.confirm_placeholder')}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPass(!showConfirmPass)} 
                  className="p-1 text-[#94A3B8] hover:text-[#C62828] active:scale-90 transition-transform"
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                className="w-full h-[46px] rounded-[8px] bg-gradient-to-r from-[#D32F2F] to-[#B71C1C] text-white font-semibold text-[15px] transition-all active:scale-[0.99] disabled:opacity-40 shadow-sm flex items-center justify-center cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin h-5 w-5 text-white" />
                ) : (
                  t('password.btn_update')
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
