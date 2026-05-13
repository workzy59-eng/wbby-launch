import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';

// Global fallbacks for potential ReferenceErrors in production chunks
// These prevent app crashes if certain variables are undefined in async chunks
(window as any).default_profiles = (window as any).default_profiles || [];
(window as any).defaultProfiles = (window as any).defaultProfiles || [];

import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <App />
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </HelmetProvider>
  </StrictMode>,
);
