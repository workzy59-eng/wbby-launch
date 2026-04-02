import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { auth, onAuthStateChanged, FirebaseUser } from './firebase';
import { UserProfile } from './types';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import OnboardingFlow from './pages/OnboardingFlow';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import DeveloperDashboard from './pages/DeveloperDashboard';
import GlobalAutos from './pages/GlobalAutos';
import FoodCourt from './pages/FoodCourt';
import Clothing from './pages/Clothing';
import Gym from './pages/Gym';
import Cargo from './pages/Cargo';
import School from './pages/School';
import Autos from './pages/Autos';
import { AnimatePresence, motion } from 'motion/react';
import { createUserProfile, getUserProfile } from './services/database';
import { Smartphone, Download, X } from 'lucide-react';

function MobileRestriction({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      setIsMobile(mobileRegex.test(userAgent.toLowerCase()));
    };
    checkMobile();
  }, []);

  // Allow Landing Page and Auth Page (with restrictions inside AuthPage)
  const isPublicPage = location.pathname === '/' || location.pathname === '/auth' || location.pathname.startsWith('/portfolio');

  if (isMobile && !isPublicPage) {
    return (
      <div className="min-h-screen bg-[#4A5D4E] flex items-center justify-center p-10 text-center font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 p-12 rounded-[3rem] max-w-md shadow-2xl"
        >
          <div className="w-24 h-24 bg-[#E6FF00] rounded-full flex items-center justify-center mx-auto mb-8 text-black shadow-[0_0_40px_rgba(230,255,0,0.3)]">
            <Smartphone size={48} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic mb-4">Mobile Browser Restricted</h1>
          <p className="text-white/60 font-medium mb-10 leading-relaxed">
            Sorry, you can't use the webapp on your device's browser. Please download our official app for the best experience.
          </p>
          <button className="w-full bg-[#E6FF00] text-black py-5 rounded-2xl font-black uppercase italic text-lg flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-2xl">
            <Download size={24} /> Download App
          </button>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          let userProfile = await getUserProfile(firebaseUser.uid);
          if (!userProfile) {
            await createUserProfile(firebaseUser);
            userProfile = await getUserProfile(firebaseUser.uid);
          }
          setProfile(userProfile as UserProfile);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#4A5D4E]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E6FF00]"></div>
      </div>
    );
  }

  return (
    <Router>
      <MobileRestriction>
        <AnimatePresence mode="wait">
          <Routes>
            <Route 
              path="/" 
              element={
                user && profile?.role === 'client' ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <LandingPage user={user} profile={profile} />
                )
              } 
            />
            <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <AuthPage />} />
            <Route 
              path="/onboarding" 
              element={<OnboardingFlow user={user} profile={profile} />} 
            />
            <Route 
              path="/dashboard" 
              element={
                user ? (
                  profile?.role === 'admin' ? (
                    <AdminDashboard user={user} profile={profile} />
                  ) : profile?.role === 'developer' ? (
                    <Navigate to="/developer" />
                  ) : (
                    <Dashboard user={user} profile={profile} />
                  )
                ) : (
                  <Navigate to="/auth" />
                )
              } 
            />
            <Route 
              path="/developer" 
              element={user && profile?.role === 'developer' ? <DeveloperDashboard user={user} profile={profile} /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/admin" 
              element={user && profile?.role === 'admin' ? <AdminDashboard user={user} profile={profile} /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/portfolio/autos" 
              element={user && profile?.role === 'client' ? <Navigate to="/dashboard" /> : <Autos />} 
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
      </MobileRestriction>
    </Router>
  );
}
