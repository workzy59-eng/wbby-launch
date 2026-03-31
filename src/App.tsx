import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { auth, onAuthStateChanged, FirebaseUser } from './firebase';
import { UserProfile } from './types';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import OnboardingFlow from './pages/OnboardingFlow';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import VanguardRealty from './pages/VanguardRealty';
import GlobalAutos from './pages/GlobalAutos';
import FitPulse from './pages/FitPulse';
import MercedesStarMarketing from './pages/MercedesStarMarketing';
import Microchips from './pages/Microchips';
import { AnimatePresence } from 'motion/react';
import { createUserProfile, getUserProfile } from './services/database';

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
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<LandingPage user={user} profile={profile} />} />
          <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <AuthPage />} />
          <Route 
            path="/onboarding" 
            element={<OnboardingFlow user={user} profile={profile} />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} profile={profile} /> : <Navigate to="/auth" />} 
          />
          <Route 
            path="/admin" 
            element={user && profile?.role === 'admin' ? <AdminPanel user={user} profile={profile} /> : <Navigate to="/auth" />} 
          />
          <Route path="/portfolio/vanguard" element={<VanguardRealty />} />
          <Route path="/portfolio/autos" element={<GlobalAutos />} />
          <Route path="/portfolio/fitpulse" element={<FitPulse />} />
          <Route path="/portfolio/mercedes" element={<MercedesStarMarketing />} />
          <Route path="/portfolio/microchips" element={<Microchips />} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
}
