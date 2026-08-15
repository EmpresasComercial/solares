import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { supabase } from '../lib/supabase';
import { getDeviceId } from '../lib/device';

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    phone: '',
    inviteCode: '',
    password: ''
  });


  useEffect(() => {
    const code = searchParams.get('join');
    if (code) {
      setFormData(prev => ({ ...prev, inviteCode: code.toUpperCase() }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let sanitized = value;

    if (name === 'phone' || name === 'inviteCode') {
      sanitized = value.replace(/\D/g, '').slice(0, name === 'phone' ? 9 : 10);
    } else {
      sanitized = value.trim();
    }

    setFormData(prev => ({ ...prev, [name]: sanitized }));
  };

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
      // 1. Validar convite, telefone e DEVICE ID via RPC antes de criar conta no Auth
      const { data: rpcData, error: vError } = await supabase.rpc('secure_registration_mcpn', {
        p_phone: formData.phone,
        p_invite_code: formData.inviteCode.toUpperCase(),
        p_device_id: getDeviceId()
      });

      if (vError) throw vError;

      const validation = rpcData as { success: boolean; message: string } | null;
      if (validation && !validation.success) {
        showToast(validation.message || 'Códgo de convite inválido', 'error');
        setIsSubmitting(false);
        return;
      }

      // 2. Prosseguir com o cadastro no Supabase Auth
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
        if (data.session) {
          showToast(t('auth.signup_success') || 'Registrado!', 'success');
          navigate('/home');
        } else {
          // Se não houver sessão imediata (ex: aguardando confirmação), envia para login
          showToast(t('auth.signup_success') || 'Conta criada! Por favor, faça login.', 'success');
          navigate('/login');
        }
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      let errorMessage = err.message || 'Falhou, tente novamente';

      // Traduzir erros técnicos do Supabase para mensagens amigáveis
      if (errorMessage.includes('email rate limit exceeded')) {
        errorMessage = 'Limite de tentativas excedido, tente outra hora';
      }

      showToast(errorMessage, 'error');
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

            <input
              name="password"
              type="password"
              placeholder={t('auth.password_placeholder')}
              className="w-full h-[54px] rounded-[8px] border border-[#F4F4F4] bg-[#FFFFFF] px-5 outline-none text-[15px] text-[#2D2324] placeholder:text-[#A09AA5] shadow-[0_8px_20px_rgba(242,240,242,0.55)]"
              value={formData.password}
              onChange={handleChange}
            />

            <input
              name="inviteCode"
              type="text"
              placeholder={t('auth.invite_placeholder')}
              className="w-full h-[54px] rounded-[8px] border border-[#F4F4F4] bg-[#FFFFFF] px-5 outline-none text-[15px] text-[#2D2324] placeholder:text-[#A09AA5] shadow-[0_8px_20px_rgba(242,240,242,0.55)]"
              value={formData.inviteCode}
              onChange={handleChange}
              maxLength={10}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 w-full h-[54px] rounded-[8px] bg-[#C62828] hover:bg-[#B71C1C] text-white font-normal text-[16px] transition disabled:opacity-70"
          >
            {isSubmitting ? t('common.loading') : t('auth.signup_button')}
          </button>

          <div className="text-center mt-6">
            <p className="text-[14px] text-[#777777] font-light">
              {t('auth.has_account')} <Link to="/login" className="text-[#5A1089] font-medium hover:underline ml-1">{t('auth.login')}</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
