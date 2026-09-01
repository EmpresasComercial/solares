import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { supabase } from '../lib/supabase';
import { getDeviceId } from '../lib/device';
import { subscribeToPushNotifications } from '../lib/pushNotifications';
import { Eye, EyeOff, Loader2, Download, Bell, X, ShieldCheck, ArrowRight, Building2, Phone, KeyRound, UserCheck } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ phone: '', inviteCode: '', password: '' });
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).deferredPwaPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', handler);

    if ((window as any).deferredPwaPrompt) {
      setDeferredPrompt((window as any).deferredPwaPrompt);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallPWA = async () => {
    const promptEvent = deferredPrompt || (window as any).deferredPwaPrompt;
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult?.outcome === 'accepted') {
          showToast('Instalando aplicativo 1888...', 'success');
        }
        setDeferredPrompt(null);
        (window as any).deferredPwaPrompt = null;
      } catch (err) {
        console.error('Erro ao acionar prompt PWA:', err);
      }
    } else {
      if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
        showToast('Aplicativo já instalado no dispositivo!', 'success');
      } else {
        showToast('Iniciando instalação do aplicativo 1888...', 'info');
      }
    }
  };

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

  const validateForm = () => {
    if (!formData.phone || !formData.phone.startsWith('9') || formData.phone.length !== 9) {
      showToast(t('auth.phone_error_length'), 'error');
      return false;
    }
    if (formData.password.length < 8) {
      showToast(t('auth.password_error_length'), 'error');
      return false;
    }
    if (!formData.inviteCode || formData.inviteCode.length !== 10) {
      showToast(t('auth.invite_error_length'), 'error');
      return false;
    }
    return true;
  };

  const handleRegisterClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setShowNotificationModal(true);
  };

  const executeRegistration = async (withNotifications = false) => {
    setShowNotificationModal(false);

    if (withNotifications) {
      try {
        await subscribeToPushNotifications();
      } catch (err) {
        console.debug('Erro ao solicitar push:', err);
      }
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
        if (withNotifications || Notification.permission === 'granted') {
          subscribeToPushNotifications().catch(() => {});
        }
        showToast(t('auth.signup_success') || (data.session ? 'Registrado com sucesso no 1888!' : 'Conta criada! Faça login.'), 'success');
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
    <div className="w-full min-h-screen bg-[#F5F6F8] pb-12 font-sans antialiased text-[#202020] select-none flex flex-col items-center justify-center px-4">
      <main className="w-full max-w-[440px] space-y-4 flex flex-col">
        {/* Top 1888 Brand Hero */}
        <div className="relative w-full bg-gradient-to-br from-[#FF6A00] via-[#FF5000] to-[#FF2500] rounded-3xl p-6 text-white shadow-md overflow-hidden">
          <div className="absolute top-3 right-3 z-10">
            <LanguageSelector />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center pt-2">
            <div className="flex items-center gap-1">
              <span className="text-[38px] font-black italic tracking-tighter drop-shadow-sm">
                1888
              </span>
            </div>
            <span className="text-[12px] font-bold tracking-wider uppercase bg-white/20 px-2.5 py-0.5 rounded-full mt-0.5">
              CADASTRO DE PARCEIRO
            </span>
            <p className="text-[12px] text-white/90 font-medium mt-2">
              Junte-se à maior rede de atacado direto de fábricas
            </p>
          </div>

          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        </div>

        {/* Signup Form Box */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="text-center pb-1">
            <h2 className="text-[17px] font-bold text-gray-900">Criar Nova Conta</h2>
            <p className="text-[12px] text-gray-500">Cadastre-se para liberar os preços de atacado</p>
          </div>

          <form onSubmit={handleRegisterClick} className="space-y-3.5 flex flex-col">
            <div>
              <label className="text-[11.5px] font-semibold text-gray-700 block mb-1">
                Número de Celular
              </label>
              <div className="bg-[#F8F9FA] border border-gray-200 rounded-xl h-[48px] px-3.5 flex items-center focus-within:border-[#FF5000] focus-within:bg-white transition-all">
                <span className="text-[13.5px] text-gray-700 font-bold pr-2.5 border-r border-gray-300 mr-2.5">
                  +244
                </span>
                <input
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder={t('auth.phone_placeholder')}
                  className="flex-1 h-full bg-transparent outline-none text-[13.5px] text-gray-900 placeholder:text-gray-400 font-medium"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={9}
                />
                <Phone className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="text-[11.5px] font-semibold text-gray-700 block mb-1">
                Senha (mínimo 8 dígitos)
              </label>
              <div className="bg-[#F8F9FA] border border-gray-200 rounded-xl h-[48px] px-3.5 flex items-center focus-within:border-[#FF5000] focus-within:bg-white transition-all relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder={t('auth.password_placeholder')}
                  className="flex-1 h-full bg-transparent outline-none text-[13.5px] text-gray-900 placeholder:text-gray-400 font-medium pr-8"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="text-gray-400 hover:text-gray-600 active:scale-95 transition-transform"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5 text-gray-400" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11.5px] font-semibold text-gray-700 block mb-1">
                Código de Convite
              </label>
              <div className="bg-[#F8F9FA] border border-gray-200 rounded-xl h-[48px] px-3.5 flex items-center focus-within:border-[#FF5000] focus-within:bg-white transition-all">
                <input
                  name="inviteCode"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder={t('auth.invite_placeholder')}
                  className="w-full h-full bg-transparent outline-none text-[13.5px] text-gray-900 placeholder:text-gray-400 font-bold tracking-wider uppercase"
                  value={formData.inviteCode}
                  onChange={handleChange}
                  maxLength={10}
                />
                <UserCheck className="w-4 h-4 text-[#FF5000]" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[46px] rounded-xl bg-gradient-to-r from-[#FF6A00] via-[#FF5000] to-[#FF2500] hover:opacity-95 active:scale-[0.99] text-white font-bold text-[14px] transition-all disabled:opacity-40 shadow-sm flex items-center justify-center cursor-pointer mt-1"
            >
              {isSubmitting
                ? <Loader2 className="animate-spin h-4 w-4 text-white" />
                : 'Registrar no 1888'
              }
            </button>

            <button
              type="button"
              onClick={handleInstallPWA}
              className="w-full h-[44px] rounded-xl bg-[#FFF3EB] border border-orange-200 hover:bg-[#FFE6D6] active:scale-[0.99] text-[#FF5000] font-bold text-[13.5px] transition-all shadow-2xs flex items-center justify-center cursor-pointer gap-2"
            >
              <Download className="w-4 h-4 stroke-[2.2]" />
              <span>Baixar App 1888 (PWA)</span>
            </button>
          </form>

          <div className="text-center pt-2 border-t border-gray-100">
            <p className="text-[13px] text-gray-600">
              {t('auth.has_account')}{' '}
              <Link to="/login" className="text-[#FF5000] font-bold hover:underline">
                {t('auth.login')}
              </Link>
            </p>
          </div>
        </div>

        {/* Badges de Segurança */}
        <div className="flex items-center justify-center gap-4 text-gray-400 text-[11px] pt-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF5000]" /> Origem Certificada
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-[#FF5000]" /> 1888 Alibaba Group
          </span>
        </div>
      </main>

      {/* MODAL DE PERMISSÕES DE NOTIFICAÇÕES (Estilo 1888 Bottom Sheet) */}
      <AnimatePresence>
        {showNotificationModal && (
          <div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-xs"
            onClick={(e) => e.target === e.currentTarget && setShowNotificationModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 80 }}
              transition={{ type: 'tween', ease: 'easeOut', duration: 0.25 }}
              className="bg-white w-full max-w-[440px] rounded-t-3xl relative overflow-hidden select-none font-sans p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#FFF3EB] flex items-center justify-center text-[#FF5000] shrink-0">
                    <Bell className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <h3 className="text-[15px] font-bold text-gray-900">
                    Notificações 1888
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNotificationModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-700 active:scale-95 transition-transform cursor-pointer"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-[13px] text-gray-600 leading-relaxed font-medium">
                  Ative as notificações para receber avisos instantâneos de novos lotes de fábrica, rendimentos creditados e bônus de equipe.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => executeRegistration(true)}
                  className="w-full h-[46px] rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF4400] text-white font-bold text-[14px] flex items-center justify-center gap-2 shadow-sm"
                >
                  <Bell className="w-4 h-4" />
                  <span>Permitir e Criar Conta</span>
                </button>

                <button
                  type="button"
                  onClick={() => executeRegistration(false)}
                  className="w-full h-[42px] rounded-xl bg-gray-100 text-gray-600 font-semibold text-[13px]"
                >
                  Continuar sem notificações
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
