// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const apiKey = import.meta?.env?.VITE_FIREBASE_API_KEY ?? 'REDACTED_FIREBASE_API_KEY';

const firebaseConfig = {
  apiKey,
  authDomain: 'geofence-alert-system-488b8.firebaseapp.com',
  databaseURL: 'https://geofence-alert-system-488b8-default-rtdb.firebaseio.com',
  projectId: 'geofence-alert-system-488b8',
  storageBucket: 'geofence-alert-system-488b8.firebasestorage.app',
  messagingSenderId: '1085963374383',
  appId: '1:1085963374383:web:5c3d2bb8e2e15532e29bda',
  measurementId: 'G-L1DR9YGQY4',
};

const app = initializeApp(firebaseConfig);

let analytics = null;
let db = null;
let auth = null;

try { analytics = getAnalytics(app); } catch (e) { /* optional */ }
try { db = getFirestore(app); } catch (e) { db = null; }
try { auth = getAuth(app); } catch (e) { /* optional */ }

export { analytics, db, auth };