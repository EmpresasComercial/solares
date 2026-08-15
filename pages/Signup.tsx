import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { supabase } from '../lib/supabase';
import { getDeviceId } from '../lib/device';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ phone: '', inviteCode: '', password: '' });

  useEffect(() => {
    const code = searchParams.get('join');
    if (code) setFormData(prev => ({ ...prev, inviteCode: code.toUpperCase() }));
  }, [searchParams]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let sanitized = value;
    if (name === 'phone' || name === 'inviteCode') {
      sanitized = value.replace(/\D/g, '').slice(0, name === 'phone' ? 9 : 10);
    } else {
      sanitized = value.trim();
    }
    setFormData(prev => ({ ...prev, [name]: sanitized }));
  }, []);

  const togglePassword = useCallback(() => setShowPassword(v => !v), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.phone || !formData.phone.startsWith('9') || formData.phone.length !== 9) {
      showToast(t('auth.phone_error_length'), 'error');
      return;
    }
    if (formData.password.length < 8) {
      showToast(t('auth.password_error_length'), 'error');
      return;
    }
    if (!formData.inviteCode || formData.inviteCode.length !== 10) {
      showToast(t('auth.invite_error_length'), 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: rpcData, error: vError } = await supabase.rpc('secure_registration_mcpn', {
        p_phone: formData.phone,
        p_invite_code: formData.inviteCode.toUpperCase(),
        p_device_id: getDeviceId()
      });

      if (vError) throw vError;

      const validation = rpcData as { success: boolean; message: string } | null;
      if (validation && !validation.success) {
        showToast(validation.message || 'Código de convite inválido', 'error');
        setIsSubmitting(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: `${formData.phone}@user.com`,
        password: formData.password,
        options: {
          data: {
            phone: formData.phone,
            referred_by: formData.inviteCode.toUpperCase(),
            device_id: getDeviceId()
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          showToast(t('auth.phone_error_exists') || 'Celular registrado.', 'error');
        } else {
          throw error;
        }
        return;
      }

      if (data.user) {
        showToast(t('auth.signup_success') || (data.session ? 'Registrado!' : 'Conta criada! Faça login.'), 'success');
        navigate(data.session ? '/home' : '/login');
      }
    } catch (err: any) {
      let msg = err.message || 'Falhou, tente novamente';
      if (msg.includes('email rate limit exceeded')) msg = 'Limite de tentativas excedido, tente outra hora';
      showToast(msg, 'error');
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
        <form onSubmit={handleSubmit} id="signup-form" className="space-y-3">
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
              autoComplete="new-password"
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

          <div className="bg-[#FFFFFF] rounded-[10px] h-[54px] px-4 flex items-center shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <input
              name="inviteCode"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder={t('auth.invite_placeholder')}
              className="w-full h-full bg-transparent outline-none text-[15px] text-[#202020] placeholder:text-[#A6A6A6] font-medium"
              value={formData.inviteCode}
              onChange={handleChange}
              maxLength={10}
            />
          </div>
        </form>

        <div className="text-center pt-2">
          <p className="text-[14px] text-[#888888]">
            {t('auth.has_account')}{' '}
            <Link to="/login" className="text-[#FE384F] font-semibold hover:underline">
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-[#F2F2F2] p-4 z-40 flex justify-center border-t border-gray-200/50">
        <div className="w-full max-w-[480px]">
          <button
            type="submit"
            form="signup-form"
            disabled={isSubmitting}
            className="w-full h-[48px] rounded-full bg-[#FE384F] hover:bg-[#E02E44] active:scale-[0.99] text-[#FFFFFF] font-bold text-[16px] transition-all disabled:opacity-40 shadow-sm flex items-center justify-center cursor-pointer"
          >
            {isSubmitting
              ? <Loader2 className="animate-spin h-5 w-5 text-[#FFFFFF]" />
              : t('auth.signup_button')
            }
          </button>
        </div>
      </div>
    </div>
  );
}
