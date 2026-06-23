// src/firebaseInit.js
// Run this once to populate Firestore with sample data

import { db } from './firebase';
import {
  collection, addDoc, serverTimestamp, writeBatch, doc, setDoc
} from 'firebase/firestore';

// Sample data
const SAMPLE_DEVICES = [
  {
    device_id: "TRUCK-001",
    name: "Alpha Hauler",
    type: "vehicle",
    owner_name: "Ravi Kumar",
    phone: "+919876543210",
    email: "ksrisri97@gmail.com",
    last_lat: 17.385,
    last_lng: 78.486,
    last_seen: new Date().toISOString(),
    status: "inside"
  },
  {
    device_id: "TRUCK-002",
    name: "Beta Carrier",
    type: "vehicle",
    owner_name: "Suresh Babu",
    phone: "+919876543211",
    email: "ksrisri97@gmail.com",
    last_lat: 17.361,
    last_lng: 78.474,
    last_seen: new Date(Date.now() - 340000).toISOString(),
    status: "outside"
  },
  {
    device_id: "VAN-001",
    name: "Delta Van",
    type: "vehicle",
    owner_name: "Priya Rao",
    phone: "+919876543212",
    email: "ksrisri97@gmail.com",
    last_lat: 17.390,
    last_lng: 78.490,
    last_seen: new Date(Date.now() - 45000).toISOString(),
    status: "inside"
  },
  {
    device_id: "PERS-001",
    name: "Site Guard A",
    type: "personnel",
    owner_name: "Anand Singh",
    phone: "+919876543213",
    email: "ksrisri97@gmail.com",
    last_lat: 17.388,
    last_lng: 78.492,
    last_seen: new Date(Date.now() - 80000).toISOString(),
    status: "inside"
  },
];

const SAMPLE_GEOFENCES = [
  {
    name: "Main Depot",
    description: "Central distribution hub",
    shape: "circle",
    center_lat: 17.385,
    center_lng: 78.486,
    radius_m: 500,
    is_active: true
  },
  {
    name: "Client Site A",
    description: "Primary client location",
    shape: "circle",
    center_lat: 17.361,
    center_lng: 78.474,
    radius_m: 300,
    is_active: true
  },
  {
    name: "Restricted Zone",
    description: "No unauthorized entry",
    shape: "circle",
    center_lat: 17.400,
    center_lng: 78.500,
    radius_m: 200,
    is_active: true
  },
];

const SAMPLE_ALERTS = [
  {
    device_id: "TRUCK-001",
    device_name: "Alpha Hauler",
    geofence_id: "Main Depot",
    geofence_name: "Main Depot",
    alert_type: "ENTRY",
    priority: "medium",
    lat: 17.385,
    lng: 78.486,
    message: "Alpha Hauler entered Main Depot",
    notified_via: "email",
    triggered_at: new Date(Date.now() - 120000),
    is_read: false
  },
  {
    device_id: "TRUCK-002",
    device_name: "Beta Carrier",
    geofence_id: "Client Site A",
    geofence_name: "Client Site A",
    alert_type: "EXIT",
    priority: "high",
    lat: 17.361,
    lng: 78.474,
    message: "Beta Carrier exited Client Site A",
    notified_via: "email",
    triggered_at: new Date(Date.now() - 340000),
    is_read: false
  },
  {
    device_id: "VAN-001",
    device_name: "Delta Van",
    geofence_id: "Main Depot",
    geofence_name: "Main Depot",
    alert_type: "ENTRY",
    priority: "medium",
    lat: 17.390,
    lng: 78.490,
    message: "Delta Van entered Main Depot",
    notified_via: "email",
    triggered_at: new Date(Date.now() - 900000),
    is_read: true
  },
  {
    device_id: "PERS-001",
    device_name: "Site Guard A",
    geofence_id: "Main Depot",
    geofence_name: "Main Depot",
    alert_type: "EXIT",
    priority: "critical",
    lat: 17.388,
    lng: 78.492,
    message: "Site Guard A exited Main Depot",
    notified_via: "email",
    triggered_at: new Date(Date.now() - 1800000),
    is_read: false
  },
];

export async function initializeFirestore() {
  try {
    console.log('Starting Firestore initialization...');

    const batch = writeBatch(db);

    // Add Devices
    console.log('Adding devices...');
    for (const device of SAMPLE_DEVICES) {
      const deviceRef = doc(collection(db, 'devices'));
      batch.set(deviceRef, { ...device, created_at: serverTimestamp() });
    }

    // Add Geofences
    console.log('Adding geofences...');
    for (const geofence of SAMPLE_GEOFENCES) {
      const geofenceRef = doc(collection(db, 'geofences'));
      batch.set(geofenceRef, { ...geofence, created_at: serverTimestamp() });
    }

    // Add Alerts
    console.log('Adding alerts...');
    for (const alert of SAMPLE_ALERTS) {
      const alertRef = doc(collection(db, 'alerts'));
      batch.set(alertRef, { ...alert, created_at: serverTimestamp() });
    }

    // Commit batch
    await batch.commit();
    console.log('✅ Firestore initialized successfully with sample data!');
    return true;
  } catch (error) {
    console.error('❌ Error initializing Firestore:', error);
    throw error;
  }
}
