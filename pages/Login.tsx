import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, Loader2, ShieldCheck, Building2, Lock, Phone } from 'lucide-react';

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
        showToast('Bem-vindo à plataforma 1888!', 'success');
        navigate('/home');
      } else {
        showToast('Não foi possível iniciar sessão. Verifique os seus dados.', 'error');
      }
    } catch {
      showToast('Falhou, verifique a conexão.', 'error');
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
              ATACADO DIRETO DA FÁBRICA
            </span>
            <p className="text-[12px] text-white/90 font-medium mt-2">
              Plataforma B2B Líder em Suprimentos e Parcerias
            </p>
          </div>

          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        </div>

        {/* Login Form Box */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="text-center pb-1">
            <h2 className="text-[17px] font-bold text-gray-900">Entrar na Conta</h2>
            <p className="text-[12px] text-gray-500">Acesse seus rendimentos e lotes de atacado</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 flex flex-col">
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
                Senha de Acesso
              </label>
              <div className="bg-[#F8F9FA] border border-gray-200 rounded-xl h-[48px] px-3.5 flex items-center focus-within:border-[#FF5000] focus-within:bg-white transition-all relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[46px] rounded-xl bg-gradient-to-r from-[#FF6A00] via-[#FF5000] to-[#FF2500] hover:opacity-95 active:scale-[0.99] text-white font-bold text-[14px] transition-all disabled:opacity-40 shadow-sm flex items-center justify-center cursor-pointer mt-2"
            >
              {isSubmitting
                ? <Loader2 className="animate-spin h-4 w-4 text-white" />
                : 'Entrar no 1888'
              }
            </button>
          </form>

          <div className="text-center pt-2 border-t border-gray-100">
            <p className="text-[13px] text-gray-600">
              {t('auth.no_account')}{' '}
              <Link to="/cadastro" className="text-[#FF5000] font-bold hover:underline">
                {t('auth.signup_button')}
              </Link>
            </p>
          </div>
        </div>

        {/* Badges de Segurança */}
        <div className="flex items-center justify-center gap-4 text-gray-400 text-[11px] pt-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF5000]" /> Criptografia B2B
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-[#FF5000]" /> Super Fábricas
          </span>
        </div>
      </main>
    </div>
  );
}
