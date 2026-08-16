import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

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
    setFormData(prev => ({ ...prev, [e.target.name]: val }));
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
      if (!user?.email) {
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
      setTimeout(() => navigate('/perfil'), 1500);
    } catch (err: any) {
      showToast(err.message || t('common.error'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F2F2F2] pb-32 font-sans antialiased text-[#202020] select-none flex flex-col items-center">
      
      <header className="w-full max-w-[480px] bg-[#FFFFFF] px-4 pt-4 pb-3 sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/perfil')}
            className="p-1 -ml-1 text-[#202020] active:scale-95 transition-transform cursor-pointer"
            aria-label={t('common.back')}
          >
            <ChevronLeft className="w-5 h-5 stroke-[1.8]" />
          </button>
          
          <h1 className="text-[14.5px] font-medium text-[#202020] tracking-normal">
            Redefinir Senha
          </h1>
        </div>
      </header>

      <main className="w-full max-w-[480px] px-4 pt-4 space-y-2.5">
        <form onSubmit={handleSubmit} id="change-pass-form" className="space-y-2.5">
          
          <div className="bg-[#FFFFFF] rounded-none h-[46px] px-4 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <input
              name="currentPassword"
              type={showCurrentPass ? "text" : "password"}
              className="w-full h-full bg-transparent outline-none text-[13.5px] text-[#202020] placeholder:text-[#AAAAAA] font-normal pr-2"
              placeholder={t('password.old_placeholder') || 'Senha atual'}
              value={formData.currentPassword}
              onChange={handleChange}
            />
            <button 
              type="button" 
              onClick={() => setShowCurrentPass(!showCurrentPass)} 
              className="p-1 text-[#AAAAAA] hover:text-[#202020] active:scale-90 transition-transform"
            >
              {showCurrentPass ? <EyeOff className="w-4 h-4 stroke-[1.6]" /> : <Eye className="w-4 h-4 stroke-[1.6]" />}
            </button>
          </div>

          <div className="bg-[#FFFFFF] rounded-none h-[46px] px-4 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <input
              name="newPassword"
              type={showNewPass ? "text" : "password"}
              className="w-full h-full bg-transparent outline-none text-[13.5px] text-[#202020] placeholder:text-[#AAAAAA] font-normal pr-2"
              placeholder={t('password.new_placeholder') || 'Nova senha (mínimo 8 caracteres)'}
              value={formData.newPassword}
              onChange={handleChange}
            />
            <button 
              type="button" 
              onClick={() => setShowNewPass(!showNewPass)} 
              className="p-1 text-[#AAAAAA] hover:text-[#202020] active:scale-90 transition-transform"
            >
              {showNewPass ? <EyeOff className="w-4 h-4 stroke-[1.6]" /> : <Eye className="w-4 h-4 stroke-[1.6]" />}
            </button>
          </div>

          <div className="bg-[#FFFFFF] rounded-none h-[46px] px-4 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <input
              name="confirmPassword"
              type={showConfirmPass ? "text" : "password"}
              className="w-full h-full bg-transparent outline-none text-[13.5px] text-[#202020] placeholder:text-[#AAAAAA] font-normal pr-2"
              placeholder={t('password.confirm_placeholder') || 'Confirmar nova senha'}
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <button 
              type="button" 
              onClick={() => setShowConfirmPass(!showConfirmPass)} 
              className="p-1 text-[#AAAAAA] hover:text-[#202020] active:scale-90 transition-transform"
            >
              {showConfirmPass ? <EyeOff className="w-4 h-4 stroke-[1.6]" /> : <Eye className="w-4 h-4 stroke-[1.6]" />}
            </button>
          </div>

        </form>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-[#F2F2F2] p-3.5 z-40 flex justify-center border-t border-gray-200/50">
        <div className="w-full max-w-[480px]">
          <button
            type="submit"
            form="change-pass-form"
            disabled={isSubmitting || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
            className="w-full h-[40px] rounded-none bg-[#FE384F] hover:bg-[#E02E44] active:scale-[0.99] text-[#FFFFFF] font-normal text-[13.5px] transition-all disabled:opacity-40 shadow-none flex items-center justify-center cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin h-4 w-4 text-[#FFFFFF]" />
            ) : (
              "Redefinir"
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
