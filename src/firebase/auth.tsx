import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !db) {
      console.log('Firebase not available');
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    if (!auth || !db) {
      console.log('Firebase not available - DEV MODE');
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser as User || null);
      if (firebaseUser) {
        try {
          const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (profileDoc.exists()) {
            setProfile(profileDoc.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'User',
              role: 'staff',
              photoURL: firebaseUser.photoURL || undefined,
              createdAt: new Date().toISOString(),
            };
            if (firebaseUser.email === 'gustavo13470@gmail.com') {
              newProfile.role = 'admin';
            }
            await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          console.error('Profile error:', error);
          // DEV mock fallback
          setProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'User',
            role: 'staff',
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    // Timeout safety
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signIn = async () => {
    if (!auth) {
      console.warn('Auth not available - add Firebase keys to .env.local');
      return;
    }
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

