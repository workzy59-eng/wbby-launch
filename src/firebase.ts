import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { initializeFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, orderBy, serverTimestamp, Timestamp, limit, getDocFromServer } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

// Log initialization for debugging
console.log("🔥 Initializing Firebase with Project ID:", firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Enable long polling to fix "Could not reach Firestore" errors in some network environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Connection test as per system instructions
async function testFirestoreConnection() {
  try {
    // Try to get a non-existent doc from a 'test' collection to verify connectivity
    await getDocFromServer(doc(db, '_system_', 'connectivity_test'));
    console.log("✅ Firestore connection verified");
  } catch (error: any) {
    if (error?.message?.includes('the client is offline')) {
      console.error("❌ Firestore Error: The client is offline. Check your Firebase configuration and authorized domains.");
    } else {
      console.warn("ℹ️ Firestore connectivity test note:", error?.message || error);
    }
  }
}

testFirestoreConnection();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logOut = () => signOut(auth);
export const signInWithEmail = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);
export const signUpWithEmail = (email: string, pass: string) => createUserWithEmailAndPassword(auth, email, pass);

export { 
  collection, doc, setDoc, getDoc, getDocs, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, orderBy, serverTimestamp, Timestamp, onAuthStateChanged, limit,
  ref, uploadBytes, getDownloadURL, uploadBytesResumable
};
export type { FirebaseUser };
