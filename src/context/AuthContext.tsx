import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, onAuthStateChanged, FirebaseUser, db, doc, onSnapshot } from '../firebase';
import { UserProfile } from '../types';
import { getUserProfile, createUserProfile } from '../services/database';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  sendOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, code: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
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
        }, (error) => {
          console.error("Auth Profile Snapshot Error:", error);
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

  const signInWithGoogle = async () => {
    const { signInWithGoogle: firebaseSignIn } = await import('../firebase');
    await firebaseSignIn();
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const { signInWithEmail: firebaseSignIn } = await import('../firebase');
    await firebaseSignIn(email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    const { signUpWithEmail: firebaseSignUp } = await import('../firebase');
    await firebaseSignUp(email, pass);
  };

  const sendOTP = async (email: string) => {
    console.log("🚀 AuthContext: sendOTP triggered via backend for", email);
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send OTP');
      toast.success(data.message || "OTP sent successfully!");
    } catch (err: any) {
      console.error("OTP Error:", err);
      toast.error(err.message || "Failed to send OTP");
      throw err;
    }
  };

  const verifyOTP = async (email: string, code: string) => {
    console.log("🔐 AuthContext: verifyOTP triggered via backend for", email);
    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Invalid OTP');
      
      // Update profile in Firebase
      if (auth.currentUser) {
        await createUserProfile(auth.currentUser, { isOtpVerified: true });
      }
      
      toast.success("Verification successful!");
    } catch (err: any) {
      console.error("Verification Error:", err);
      toast.error(err.message || "Verification failed");
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, sendOTP, verifyOTP, signInWithGoogle, signInWithEmail, signUpWithEmail }}>
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
