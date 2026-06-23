import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initializeFirestore } from './firebaseInit'

// Expose initialization function to global scope for easy access
window.initFirebaseData = async () => {
  try {
    console.log('🔄 Starting Firestore initialization...');
    await initializeFirestore();
    console.log('✅ Firestore initialized successfully! Refresh the page to see the data.');
  } catch (error) {
    console.error('❌ Initialization failed:', error);
  }
};

console.log('💡 TIP: Run window.initFirebaseData() in the console to populate Firestore with sample data');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
