import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { auth, onAuthStateChanged, FirebaseUser, db, collection, getDocs, addDoc, serverTimestamp, onSnapshot, doc, query, where } from './firebase';
import { Toaster, toast } from 'react-hot-toast';
import { UserProfile } from './types';
import { AnimatePresence, motion } from 'framer-motion';
import { createUserProfile, getUserProfile, updateUserStatus } from './services/database';
import { ADMIN_EMAIL } from './constants';
import { Smartphone } from 'lucide-react';
import { Loader } from './components/ui/loader';

const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const AuthPage = React.lazy(() => import('./pages/AuthPage'));
const OnboardingFlow = React.lazy(() => import('./pages/OnboardingFlow'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const AdminPanel = React.lazy(() => import('./pages/AdminPanel'));
const DeveloperDashboard = React.lazy(() => import('./pages/DeveloperDashboard'));
const SalesDashboard = React.lazy(() => import('./pages/SalesDashboard'));
const GlobalAutos = React.lazy(() => import('./pages/GlobalAutos'));
const Gym = React.lazy(() => import('./pages/Gym'));
const Cargo = React.lazy(() => import('./pages/Cargo'));
const Autos = React.lazy(() => import('./pages/Autos'));
const About = React.lazy(() => import('./pages/About'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Services = React.lazy(() => import('./pages/Services'));
const Pricing = React.lazy(() => import('./pages/Pricing'));
const Blog = React.lazy(() => import('./pages/Blog'));
const BlogPost = React.lazy(() => import('./pages/BlogPost'));
const Testimonials = React.lazy(() => import('./pages/Testimonials'));
const HowItWorks = React.lazy(() => import('./pages/HowItWorks'));
const JoinDeveloper = React.lazy(() => import('./pages/JoinDeveloper'));
const JoinSales = React.lazy(() => import('./pages/JoinSales'));
const Privacy = React.lazy(() => import('./pages/Privacy'));
const Terms = React.lazy(() => import('./pages/Terms'));
const Settings = React.lazy(() => import('./pages/Settings'));
const ComponentShowcase = React.lazy(() => import('./pages/ComponentShowcase'));
const Layout = React.lazy(() => import('./components/Layout'));
const LocationPage = React.lazy(() => import('./pages/LocationPage'));
const Careers = React.lazy(() => import('./pages/Careers'));
const Docs = React.lazy(() => import('./pages/Docs'));
const PreviewBuilder = React.lazy(() => import('./pages/PreviewBuilder'));

import { useAuth } from './context/AuthContext';

export default function App() {
  const { user, profile, loading } = useAuth();
  const notificationSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    notificationSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
  }, []);

  useEffect(() => {
    if (user) {
      // Set online status
      updateUserStatus(user.uid, 'online');
      
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          updateUserStatus(user.uid, 'online');
        } else {
          updateUserStatus(user.uid, 'away');
        }
      };

      const handleBeforeUnload = () => {
        updateUserStatus(user.uid, 'offline');
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);
        updateUserStatus(user.uid, 'offline');
      };
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader size={48} />
      </div>
    );
  }

  return (
    <Router>
      <React.Suspense fallback={<div className="flex items-center justify-center h-screen bg-black"><Loader size={48} /></div>}>
          <Layout user={user} profile={profile}>
            <Toaster 
              position="top-right"
              toastOptions={{
                style: {
                  background: '#000000',
                  color: '#c7c42a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '1rem',
                  fontSize: '12px',
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontStyle: 'italic'
                },
              }}
            />
            <AnimatePresence mode="wait">
              <Routes>
                <Route 
                  path="/" 
                  element={
                    user ? (
                      (profile?.role === 'admin' || user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) ? (
                        <Navigate to="/admin" />
                      ) : (
                        <Navigate to="/dashboard" />
                      )
                    ) : (
                      <LandingPage user={user} profile={profile} />
                    )
                  } 
                />
                <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <AuthPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/services" element={<Services />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/docs" element={<Docs />} />
                <Route path="/preview-builder" element={<PreviewBuilder />} />
                <Route path="/testimonials" element={<Testimonials />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/join-developer" element={<JoinDeveloper />} />
                <Route path="/join-sales" element={<JoinSales />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/privacy-policy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/showcase" element={<ComponentShowcase />} />
                <Route path="/web-development-:city" element={<LocationPage />} />
                <Route 
                  path="/onboarding" 
                  element={<OnboardingFlow user={user} profile={profile} />} 
                />
                <Route 
                  path="/settings" 
                  element={user ? <Settings user={user} profile={profile} /> : <Navigate to="/auth" />} 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    user ? (
                      (profile?.role === 'admin' || user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) ? (
                        <AdminPanel user={user} profile={profile} />
                      ) : profile?.role === 'developer' ? (
                        <DeveloperDashboard user={user} profile={profile} />
                      ) : profile?.role === 'sales' ? (
                        <SalesDashboard user={user} profile={profile} />
                      ) : (
                        <Dashboard user={user} profile={profile} />
                      )
                    ) : (
                      <Navigate to="/auth" />
                    )
                  } 
                />
                <Route 
                  path="/admin" 
                  element={user && (profile?.role === 'admin' || user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) ? <AdminPanel user={user} profile={profile} /> : <Navigate to="/auth" />} 
                />
                <Route 
                  path="/portfolio/autos" 
                  element={user && profile?.role === 'client' ? <Navigate to="/dashboard" /> : <Autos />} 
                />
                <Route 
                  path="/portfolio/global-autos" 
                  element={user && profile?.role === 'client' ? <Navigate to="/dashboard" /> : <GlobalAutos />} 
                />
                <Route 
                  path="/portfolio/gym" 
                  element={user && profile?.role === 'client' ? <Navigate to="/dashboard" /> : <Gym />} 
                />
                <Route 
                  path="/portfolio/cargo" 
                  element={user && profile?.role === 'client' ? <Navigate to="/dashboard" /> : <Cargo />} 
                />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </AnimatePresence>
          </Layout>
        </React.Suspense>
    </Router>
  );
}
