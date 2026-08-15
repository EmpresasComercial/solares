import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const sanitized = name === 'phone'
      ? value.replace(/\D/g, '').slice(0, 9)
      : value.trim();
    setFormData(prev => ({ ...prev, [name]: sanitized }));
  };

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
        console.error('Login error:', error);
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
        return;
      }

      if (data.user && !data.session) {
        showToast('Conta encontrada, mas nao foi possivel efetuar login.', 'error');
        return;
      }

      showToast('Nao foi possivel iniciar sessao. Verifique os seus dados.', 'error');
    } catch (err: any) {
      console.error('Unexpected login error:', err);
      showToast('Falhou, verifique a conexao.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col relative">
      <div className="absolute top-4 right-4 z-[100]">
        <LanguageSelector />
      </div>

      <div className="flex-1 flex flex-col justify-center px-5 py-8">
        <form onSubmit={handleSubmit} className="w-full max-w-[400px] mx-auto">
          <div className="flex justify-center mb-6">
            <img
              src="/update_logo_canadianSolar.png"
              alt="CanadianSolar"
              className="h-16 w-auto object-contain mix-blend-multiply"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center h-[54px] rounded-[8px] border border-[#F4F4F4] bg-[#FFFFFF] px-4 shadow-[0_8px_20px_rgba(242,240,242,0.55)]">
              <span className="text-[15px] text-[#2D2324]">+244</span>
              <input
                name="phone"
                type="tel"
                placeholder={t('auth.phone_placeholder')}
                className="flex-1 h-full ml-3 bg-transparent outline-none text-[15px] text-[#2D2324] placeholder:text-[#A09AA5]"
                value={formData.phone}
                onChange={handleChange}
                maxLength={9}
              />
            </div>

            <div>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('auth.password_placeholder')}
                  className="w-full h-[54px] rounded-[8px] border border-[#F4F4F4] bg-[#FFFFFF] px-5 outline-none text-[15px] text-[#2D2324] placeholder:text-[#A09AA5] shadow-[0_8px_20px_rgba(242,240,242,0.55)] pr-12"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A09AA5] hover:text-[#2D2324]"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <Link to="/forgot-password" className="text-[#C51B18] text-[12px] hover:underline">
                  {t('auth.forgot_password')}
                </Link>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 w-full h-[54px] rounded-[8px] bg-[#C62828] hover:bg-[#B71C1C] text-white font-normal text-[16px] transition disabled:opacity-70"
          >
            {isSubmitting ? t('common.loading') : t('auth.login')}
          </button>

          <div className="text-center mt-6">
            <p className="text-[14px] text-[#777777] font-light">
              {t('auth.no_account')} <Link to="/cadastro" className="text-[#5A1089] font-medium hover:underline ml-1">{t('auth.signup_button')}</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
