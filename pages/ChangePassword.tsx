import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronLeft, ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react';

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) {
        throw new Error('Sessão inválida. Faça login novamente.');
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: formData.currentPassword
      });

      if (signInError) {
        throw new Error('A senha atual está incorreta.');
      }

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
    <div className="w-full min-h-screen bg-[#F2F2F2] pb-32 font-sans antialiased text-[#202020] select-none flex flex-col items-center">
      
      {/* 1. HEADER (Design AddBank) */}
      <header className="w-full max-w-[480px] bg-[#FFFFFF] px-4 pt-4 pb-3 sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/configuracoes-conta')}
            className="p-1 -ml-1 text-[#202020] active:scale-95 transition-transform"
            aria-label={t('common.back')}
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.2]" />
          </button>
          
          <h1 className="text-[18px] font-bold text-[#202020] tracking-tight">
            {t('password.security') || 'Alterar Senha'}
          </h1>
        </div>

        {/* Subtítulo verde com ícone de escudo */}
        <div className="flex items-center gap-1.5 mt-1.5 ml-8 text-[13px] text-[#38A98B] font-medium">
          <ShieldCheck className="w-4 h-4 text-[#38A98B] shrink-0" />
          <span>Sua informação de segurança está protegida conosco.</span>
        </div>
      </header>

      {/* 2. CONTEÚDO PRINCIPAL (CAMPOS BRANCOS LIMPOS) */}
      <main className="w-full max-w-[480px] px-4 pt-4 space-y-3">
        <form onSubmit={handleSubmit} id="change-pass-form" className="space-y-3">
          
          {/* Campo 1: Senha Atual */}
          <div className="bg-[#FFFFFF] rounded-[10px] h-[54px] px-4 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <input
              name="currentPassword"
              type={showCurrentPass ? "text" : "password"}
              className="w-full h-full bg-transparent outline-none text-[15px] text-[#202020] placeholder:text-[#A6A6A6] font-medium pr-2"
              placeholder={t('password.old_placeholder') || 'Senha Atual'}
              value={formData.currentPassword}
              onChange={handleChange}
            />
            <button 
              type="button" 
              onClick={() => setShowCurrentPass(!showCurrentPass)} 
              className="p-1 text-[#A6A6A6] hover:text-[#202020] active:scale-90 transition-transform"
            >
              {showCurrentPass ? <EyeOff className="w-5 h-5 stroke-[1.8]" /> : <Eye className="w-5 h-5 stroke-[1.8]" />}
            </button>
          </div>

          {/* Campo 2: Nova Senha */}
          <div className="bg-[#FFFFFF] rounded-[10px] h-[54px] px-4 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <input
              name="newPassword"
              type={showNewPass ? "text" : "password"}
              className="w-full h-full bg-transparent outline-none text-[15px] text-[#202020] placeholder:text-[#A6A6A6] font-medium pr-2"
              placeholder={t('password.new_placeholder') || 'Nova Senha (mínimo 8 caracteres)'}
              value={formData.newPassword}
              onChange={handleChange}
            />
            <button 
              type="button" 
              onClick={() => setShowNewPass(!showNewPass)} 
              className="p-1 text-[#A6A6A6] hover:text-[#202020] active:scale-90 transition-transform"
            >
              {showNewPass ? <EyeOff className="w-5 h-5 stroke-[1.8]" /> : <Eye className="w-5 h-5 stroke-[1.8]" />}
            </button>
          </div>

          {/* Campo 3: Confirmar Nova Senha */}
          <div className="bg-[#FFFFFF] rounded-[10px] h-[54px] px-4 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <input
              name="confirmPassword"
              type={showConfirmPass ? "text" : "password"}
              className="w-full h-full bg-transparent outline-none text-[15px] text-[#202020] placeholder:text-[#A6A6A6] font-medium pr-2"
              placeholder={t('password.confirm_placeholder') || 'Confirmar Nova Senha'}
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <button 
              type="button" 
              onClick={() => setShowConfirmPass(!showConfirmPass)} 
              className="p-1 text-[#A6A6A6] hover:text-[#202020] active:scale-90 transition-transform"
            >
              {showConfirmPass ? <EyeOff className="w-5 h-5 stroke-[1.8]" /> : <Eye className="w-5 h-5 stroke-[1.8]" />}
            </button>
          </div>

        </form>
      </main>

      {/* 3. BARRA INFERIOR FIXA COM BOTÃO "Salvar e confirmar" (#FE384F) */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#F2F2F2] p-4 z-40 flex justify-center border-t border-gray-200/50">
        <div className="w-full max-w-[480px]">
          <button
            type="submit"
            form="change-pass-form"
            disabled={isSubmitting || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
            className="w-full h-[48px] rounded-full bg-[#FE384F] hover:bg-[#E02E44] active:scale-[0.99] text-[#FFFFFF] font-bold text-[16px] transition-all disabled:opacity-40 shadow-sm flex items-center justify-center cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin h-5 w-5 text-[#FFFFFF]" />
            ) : (
              "Salvar e confirmar"
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
