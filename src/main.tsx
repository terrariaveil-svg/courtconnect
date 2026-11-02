import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import LoginGate from './LoginGate';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LoginGate />
  </StrictMode>,
);