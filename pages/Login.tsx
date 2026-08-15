import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ phone: '', password: '' });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const sanitized = name === 'phone'
      ? value.replace(/\D/g, '').slice(0, 9)
      : value.trim();
    setFormData(prev => ({ ...prev, [name]: sanitized }));
  }, []);

  const togglePassword = useCallback(() => setShowPassword(v => !v), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.phone || formData.phone.length !== 9) {
      showToast(t('auth.phone_error_length'), 'error');
      return;
    }
    if (!formData.password) {
      showToast(t('auth.password_error_empty'), 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${formData.phone}@user.com`,
        password: formData.password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          showToast('Celular ou senha incorretos.', 'error');
        } else if (error.message.includes('Email not confirmed')) {
          showToast('Por favor, confirme sua conta antes de fazer login.', 'error');
        } else {
          showToast(error.message, 'error');
        }
        return;
      }

      if (data.session) {
        showToast('Login realizado com sucesso!', 'success');
        navigate('/home');
      } else {
        showToast('Nao foi possivel iniciar sessao. Verifique os seus dados.', 'error');
      }
    } catch {
      showToast('Falhou, verifique a conexao.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F2F2F2] pb-32 font-sans antialiased text-[#202020] select-none flex flex-col items-center">
      <div className="relative w-full">
        <img
          src="/gettyimages-2286930500-612x612.jpg"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          loading="eager"
          className="w-full h-[220px] object-cover object-center block"
        />
        <div className="absolute top-4 right-4 z-10">
          <LanguageSelector />
        </div>
      </div>

      <main className="w-full max-w-[480px] px-4 pt-5 space-y-3">
        <form onSubmit={handleSubmit} id="login-form" className="space-y-3">
          <div className="bg-[#FFFFFF] rounded-[10px] h-[54px] px-4 flex items-center shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <span className="text-[15px] text-[#202020] font-medium pr-3 border-r border-[#E8E8E8] mr-3">+244</span>
            <input
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder={t('auth.phone_placeholder')}
              className="flex-1 h-full bg-transparent outline-none text-[15px] text-[#202020] placeholder:text-[#A6A6A6] font-medium"
              value={formData.phone}
              onChange={handleChange}
              maxLength={9}
            />
          </div>

          <div className="bg-[#FFFFFF] rounded-[10px] h-[54px] px-4 flex items-center shadow-[0_1px_2px_rgba(0,0,0,0.03)] relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder={t('auth.password_placeholder')}
              className="flex-1 h-full bg-transparent outline-none text-[15px] text-[#202020] placeholder:text-[#A6A6A6] font-medium pr-10"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={togglePassword}
              className="absolute right-4 text-[#A6A6A6] active:scale-95 transition-transform"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </form>

        <div className="text-center pt-2">
          <p className="text-[14px] text-[#888888]">
            {t('auth.no_account')}{' '}
            <Link to="/cadastro" className="text-[#FE384F] font-semibold hover:underline">
              {t('auth.signup_button')}
            </Link>
          </p>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-[#F2F2F2] p-4 z-40 flex justify-center border-t border-gray-200/50">
        <div className="w-full max-w-[480px]">
          <button
            type="submit"
            form="login-form"
            disabled={isSubmitting}
            className="w-full h-[48px] rounded-full bg-[#FE384F] hover:bg-[#E02E44] active:scale-[0.99] text-[#FFFFFF] font-bold text-[16px] transition-all disabled:opacity-40 shadow-sm flex items-center justify-center cursor-pointer"
          >
            {isSubmitting
              ? <Loader2 className="animate-spin h-5 w-5 text-[#FFFFFF]" />
              : t('auth.login')
            }
          </button>
        </div>
      </div>
    </div>
  );
}
