import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initClickSound } from './lib/clickSound';

// Ativa som de clique global (funciona no Chrome e na PWA instalada)
initClickSound();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
