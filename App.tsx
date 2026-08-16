/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import Layout from './components/Layout';
import { ToastProvider } from './components/Toast';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Products from './pages/Products';
import Invite from './pages/Invite';
import Profile from './pages/Profile';
import AddBank from './pages/AddBank';
import ChangePassword from './pages/ChangePassword';
import Recharge from './pages/Recharge';
import Support from './pages/Support';
import Withdraw from './pages/Withdraw';
import BankInfo from './pages/BankInfo';
import WithdrawalHistory from './pages/WithdrawalHistory';
import GeneralHistory from './pages/GeneralHistory';
import RedeemCoupon from './pages/RedeemCoupon';
import PurchaseHistory from './pages/PurchaseHistory';
import Operations from './pages/Operations';
import ProductDetails from './pages/ProductDetails';
import AboutUs from './pages/AboutMicrosoft';
import HelpFAQ from './pages/HelpFAQ';
import SupportFeedback from './pages/SupportFeedback';
import ConfirmarRecarga from './pages/ConfirmarRecarga';
import SupportTickets from './pages/SupportTickets';
import { ConnectivityOverlay } from './components/ConnectivityOverlay';

function RootRedirect() {
  const { session, ready } = useAuth();
  const [searchParams] = useSearchParams();
  const joinCode = searchParams.get('join');

  if (!ready) return null;

  if (session) {
    return <Navigate to="/home" replace />;
  }

  if (joinCode) {
    return <Navigate to={`/cadastro?join=${joinCode}`} replace />;
  }

  return <Navigate to="/cadastro" replace />;
}

export default function App() {
  React.useEffect(() => {
    document.title = 'AliExpress24';
    
    // Forçar atualização do Favicon
    const iconUrl = '/aliexpress24_logo_icon_167892.webp?v=2';
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.type = 'image/png';
    link.href = iconUrl;

    let appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
    if (!appleLink) {
      appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      document.head.appendChild(appleLink);
    }
    appleLink.href = iconUrl;
  }, []);

  return (
    <LanguageProvider>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <ConnectivityOverlay />
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Signup />} />

              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="home" element={<Home />} />
                <Route path="produtos" element={<Products />} />
                <Route path="produtos/:id" element={<ProductDetails />} />
                <Route path="convite" element={<Invite />} />
                <Route path="perfil" element={<Profile />} />
                <Route path="adicionar-banco" element={<AddBank />} />
                <Route path="alterar-senha" element={<ChangePassword />} />
                <Route path="configuracoes-conta" element={<Navigate to="/perfil" replace />} />
                <Route path="recarregar" element={<Recharge />} />
                <Route path="suporte" element={<Support />} />
                <Route path="retirada" element={<Withdraw />} />
                <Route path="informacao-bancaria" element={<BankInfo />} />
                <Route path="registro-retirada" element={<WithdrawalHistory />} />
                <Route path="registro-recarga" element={<WithdrawalHistory />} />
                <Route path="registro-transnacionais" element={<WithdrawalHistory />} />
                <Route path="registro-transacoes" element={<WithdrawalHistory />} />
                <Route path="historico-atividades" element={<GeneralHistory />} />
                <Route path="historico-geral" element={<GeneralHistory />} />
                <Route path="resgate" element={<RedeemCoupon />} />
                <Route path="minhas-compras" element={<PurchaseHistory />} />
                <Route path="operacoes" element={<Operations />} />
                <Route path="sobre-aliexpress24" element={<AboutUs />} />
                <Route path="help-faq" element={<HelpFAQ />} />
                <Route path="suporte/feedback" element={<SupportFeedback />} />
                <Route path="provas-social" element={<Navigate to="/home?postarProva=true" replace />} />
                <Route path="confirmar-recarga" element={<ConfirmarRecarga />} />
                <Route path="chat-comunidade" element={<SupportTickets />} />
                <Route path="comunidade-chat" element={<SupportTickets />} />
              </Route>


              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </LanguageProvider>
  );
}

