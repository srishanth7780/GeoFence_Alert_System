// src/pages/InitFirebase.jsx
// Navigate to this page once to populate Firestore with sample data
// Then you can comment it out or delete it

import { useState } from 'react';
import { initializeFirestore } from '../firebaseInit';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export default function InitFirebase() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  async function handleInit() {
    setLoading(true);
    setError(null);
    try {
      await initializeFirestore();
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <h1 className="text-2xl font-bold text-white mb-4">Initialize Firestore</h1>
        <p className="text-slate-400 mb-6">
          Click the button below to populate Firestore with sample devices, geofences, and alerts.
        </p>

        {success ? (
          <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-emerald-400">Success!</p>
              <p className="text-sm text-emerald-300">Sample data added to Firestore</p>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-400">Error</p>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        ) : null}

        <button
          onClick={handleInit}
          disabled={loading || success}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {loading ? 'Initializing...' : success ? 'Initialized ✓' : 'Initialize Firestore'}
        </button>

        <p className="text-xs text-slate-500 mt-4">
          After initialization, you can remove this page and use the main dashboard.
        </p>
      </div>
    </div>
  );
}
