# Firestore Setup & Initialization

## Authentication Removed ✓

The app no longer requires login. It will directly load the dashboard and pull data from Firestore.

## Initialize Firestore with Sample Data

Two methods are available:

### Method 1: Browser UI (Recommended for testing)

1. Add the InitFirebase route temporarily to your `src/main.jsx`:

```jsx
import InitFirebase from './pages/InitFirebase';

// In your router or App rendering:
// <Route path="/init" element={<InitFirebase />} />
```

2. Navigate to `http://localhost:5173/init`
3. Click "Initialize Firestore"
4. Once successful, remove the route or comment it out
5. Go to `http://localhost:5173` to see the dashboard

### Method 2: Browser Console (Quick)

1. Open browser DevTools (F12)
2. Go to Console tab
3. Paste this code:

```javascript
import { initializeFirestore } from './firebaseInit.js';
await initializeFirestore();
```

4. Refresh the page

### Method 3: Node Script (Programmatic)

Create `scripts/init-firestore.js`:

```javascript
import { initializeFirestore } from '../src/firebaseInit.js';

initializeFirestore()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed:', err);
    process.exit(1);
  });
```

Then run:
```bash
node --loader @babel/node scripts/init-firestore.js
```

## Firestore Collections

The initialization creates three collections:

### `devices`
- device_id (string, unique)
- name
- type: "vehicle" or "personnel"
- owner_name
- phone
- email
- last_lat, last_lng
- last_seen (timestamp)
- status: "inside", "outside", or "unknown"

### `geofences`
- name
- description
- shape: "circle" or "polygon"
- center_lat, center_lng
- radius_m (for circle)
- polygon (for polygon shape)
- is_active (boolean)

### `alerts`
- device_id
- device_name
- geofence_id
- geofence_name
- alert_type: "ENTRY" or "EXIT"
- priority: "critical", "high", "medium", "low"
- lat, lng
- message
- notified_via: "email" or "none"
- triggered_at (timestamp)
- is_read (boolean)

## Real-time Updates

The dashboard listens to these collections in real-time via `onSnapshot` in `App.jsx`:

```javascript
useEffect(() => {
  const unsubDevices = onSnapshot(
    collection(db, 'devices'),
    snap => setDevices(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
  // ... same for geofences and alerts
}, []);
```

Any changes in Firestore will update the UI instantly.

## Next Steps

1. Run the frontend: `npm run dev`
2. Initialize Firestore data (use Method 1 above)
3. View dashboard at `http://localhost:5173`
4. (Optional) Start backend at `http://localhost:4000` to test notifications

## Troubleshooting

**"Collection not found" error:**
- Make sure you ran the initialization step
- Check Firestore Rules allow read/write (development mode)

**"Auth missing" error:**
- Verify Firebase config in `src/firebase.js`
- Check browser console for connectivity issues

**No data showing:**
- Open browser DevTools
- Go to Network tab and reload
- Check Firestore console for data presence
