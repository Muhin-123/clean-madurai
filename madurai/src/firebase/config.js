import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBFfJfhA8z_URZZdnFIKmcwM0G36lVPXHA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "clean-madurai-b7c74.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "clean-madurai-b7c74",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "clean-madurai-b7c74.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "558002254868",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:558002254868:web:26dfd6224978d9a3016301",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-7P9YLWS6MN"
};

const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
