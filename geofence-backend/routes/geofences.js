const express = require('express');
const router  = express.Router();
const { db }  = require('../firebaseAdmin');

router.get('/', async (_, res) => {
  try {
    const snap = await db.collection('geofences').get();
    const geofences = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    geofences.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    res.json(geofences);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description, shape, center_lat, center_lng, radius_m, polygon } = req.body;
    const docRef = await db.collection('geofences').add({
      name,
      description: description || null,
      shape: shape || 'circle',
      center_lat: center_lat ? parseFloat(center_lat) : null,
      center_lng: center_lng ? parseFloat(center_lng) : null,
      radius_m: radius_m ? parseFloat(radius_m) : null,
      polygon: polygon || null,
      is_active: true,
      created_at: new Date()
    });
    res.status(201).json({
      id: docRef.id,
      name,
      description,
      shape,
      center_lat,
      center_lng,
      radius_m,
      polygon,
      is_active: true
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/toggle', async (req, res) => {
  try {
    const docRef = db.collection('geofences').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Geofence not found' });
    const currentActive = doc.data().is_active !== false;
    await docRef.update({ is_active: !currentActive });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;