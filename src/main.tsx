import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './App.css';
import App from './App';
import { AstriaReturnButton } from './AstriaReturnButton';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <AstriaReturnButton />
  </StrictMode>,
);
