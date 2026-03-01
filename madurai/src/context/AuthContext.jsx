import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/auth';
import { db } from '../firebase/firestore';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, onSnapshot, increment, updateDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // Full Firestore doc
  const [userRole, setUserRole] = useState(null);        // Shorthand role string
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubProfile = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (unsubProfile) unsubProfile();

      if (user) {
        setCurrentUser(user);

        const userDocRef = doc(db, 'users', user.uid);
        unsubProfile = onSnapshot(userDocRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setUserRole(data.role || 'citizen');
            setUserProfile({ uid: user.uid, ...data });
          } else {
            console.warn('⚠️ No Firestore user doc found for uid:', user.uid);
            setUserRole('citizen');
            setUserProfile({ uid: user.uid, name: user.email, role: 'citizen' });
          }
          setLoading(false);
        }, (err) => {
          console.error('❌ Firestore profile listen error:', err);
          setLoading(false);
        });
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const updatePoints = async (uid, amount) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        points: increment(amount),
        updated_at: serverTimestamp()
      });
    } catch (err) {
      console.error('❌ Update points error:', err);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (err) {
      const msg = getAuthErrorMessage(err.code);
      setError(msg);
      throw err;
    }
  };

  const register = async (email, password, name, role) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const uid = result.user.uid;

      const userData = {
        uid,
        name: name.trim(),
        email,
        role,
        points: 0,
        avatar_url: null,
        ward: null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', uid), userData);
      console.log('✅ Firestore user doc created with role:', role);

      return result;
    } catch (err) {
      const msg = getAuthErrorMessage(err.code);
      setError(msg);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setCurrentUser(null);
      setUserRole(null);
      setUserProfile(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getAuthErrorMessage = (code) => {
    const messages = {
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/email-already-in-use': 'Email is already registered.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/operation-not-allowed': 'Authentication is disabled.',
      'auth/too-many-requests': 'Too many attempts. Try again later.',
    };
    return messages[code] || 'Authentication failed. Please try again.';
  };

  const value = {
    currentUser,
    userProfile,     // Full Firestore profile: { uid, name, email, role, points, ... }
    userRole,        // Shorthand: 'citizen' | 'worker' | 'officer'
    loading,
    error,
    login,
    register,
    logout,
    updatePoints,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
