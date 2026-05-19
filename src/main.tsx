import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { RegionProvider } from './context/RegionContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <NotificationProvider>
          <RegionProvider>
            <Router>
              <App />
            </Router>
          </RegionProvider>
        </NotificationProvider>
      </AuthProvider>
    </HelmetProvider>
  </StrictMode>,
);
