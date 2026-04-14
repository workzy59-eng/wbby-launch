import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, onAuthStateChanged, FirebaseUser, db, doc, onSnapshot } from '../firebase';
import { UserProfile } from '../types';
import { getUserProfile, createUserProfile } from '../services/database';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  sendOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const profileUnsubscribe = onSnapshot(doc(db, 'users', firebaseUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          }
          setLoading(false);
        });
        return () => profileUnsubscribe();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const sendOTP = async (email: string) => {
    const response = await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error('Server returned an invalid response. Please try again later.');
    }

    if (!response.ok) throw new Error(data.error || 'Failed to send OTP');
  };

  const verifyOTP = async (email: string, code: string) => {
    const response = await fetch('/api/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error('Server returned an invalid response. Please try again later.');
    }

    if (!response.ok) throw new Error(data.error || 'Invalid code');
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, sendOTP, verifyOTP }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
