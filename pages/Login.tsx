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
    <div className="w-full min-h-screen bg-[#F2F2F2] pb-12 font-sans antialiased text-[#202020] select-none flex flex-col items-center">
      <main className="w-full max-w-[480px] px-4 pt-4 space-y-2.5 flex flex-col">
        <div className="relative w-full overflow-hidden">
          <img
            src="/gettyimages-2286930500-612x612.jpg"
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            loading="eager"
            className="w-full h-[200px] object-cover object-center block"
          />
          <div className="absolute top-3 right-3 z-10">
            <LanguageSelector />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2.5 flex flex-col">
          <div className="bg-white rounded-none h-[46px] px-4 flex items-center shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <span className="text-[13.5px] text-[#202020] font-normal pr-3 border-r border-[#E8E8E8] mr-3">+244</span>
            <input
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder={t('auth.phone_placeholder')}
              className="flex-1 h-full bg-transparent outline-none text-[13.5px] text-[#202020] placeholder:text-[#AAAAAA] font-normal"
              value={formData.phone}
              onChange={handleChange}
              maxLength={9}
            />
          </div>

          <div className="bg-white rounded-none h-[46px] px-4 flex items-center shadow-[0_1px_2px_rgba(0,0,0,0.03)] relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder={t('auth.password_placeholder')}
              className="flex-1 h-full bg-transparent outline-none text-[13.5px] text-[#202020] placeholder:text-[#AAAAAA] font-normal pr-10"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={togglePassword}
              className="absolute right-4 text-[#AAAAAA] active:scale-95 transition-transform"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[44px] rounded-none bg-[#FE384F] hover:bg-[#E02E44] active:scale-[0.99] text-white font-normal text-[13.5px] transition-all disabled:opacity-40 shadow-sm flex items-center justify-center cursor-pointer mt-1"
          >
            {isSubmitting
              ? <Loader2 className="animate-spin h-4 w-4 text-white" />
              : t('auth.login')
            }
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-[13px] text-[#777777]">
            {t('auth.no_account')}{' '}
            <Link to="/cadastro" className="text-[#FE384F] font-normal hover:underline">
              {t('auth.signup_button')}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
