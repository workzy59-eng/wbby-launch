import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, onAuthStateChanged, FirebaseUser, db, doc, onSnapshot } from '../firebase';
import { UserProfile } from '../types';
import { getUserProfile, createUserProfile } from '../services/database';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<any>;
  signInWithEmail: (email: string, pass: string) => Promise<any>;
  signUpWithEmail: (email: string, pass: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let profileUnsubscribe: (() => void) | null = null;

    const authUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      
      // Cleanup previous profile listener
      if (profileUnsubscribe) {
        profileUnsubscribe();
        profileUnsubscribe = null;
      }

      if (firebaseUser) {
        // Automatically create/sync profile on login
        createUserProfile(firebaseUser).catch(err => {
          console.error("Profile sync error on login:", err);
        });

        profileUnsubscribe = onSnapshot(doc(db, 'users', firebaseUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            setProfile({ uid: docSnap.id, ...docSnap.data() } as UserProfile);
          }
          setLoading(false);
        }, (error) => {
          if (error.message?.includes('Quota') || error.message?.includes('resource-exhausted')) {
            console.warn("Auth Profile listener failed due to quota. Attempting fallback...");
            // Try a one-time fetch as fallback if snapshot fails
            getUserProfile(firebaseUser.uid).then(p => {
              if (p) setProfile(p);
              setLoading(false);
            }).catch(() => setLoading(false));
          } else {
            console.error("Auth Profile Snapshot Error:", error);
            setLoading(false);
          }
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (profileUnsubscribe) {
        profileUnsubscribe();
      }
    };
  }, []);

  const signInWithGoogle = async () => {
    const { signInWithGoogle: firebaseSignIn } = await import('../firebase');
    return await firebaseSignIn();
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const { signInWithEmail: firebaseSignIn } = await import('../firebase');
    return await firebaseSignIn(email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    const { signUpWithEmail: firebaseSignUp } = await import('../firebase');
    return await firebaseSignUp(email, pass);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, signInWithEmail, signUpWithEmail }}>
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
