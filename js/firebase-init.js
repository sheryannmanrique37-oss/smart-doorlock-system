import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

// ============================================
// CONFIGURATION
// Replace the config below with your actual Firebase Web SDK details
// ============================================
export const firebaseConfig = {
  apiKey: "AIzaSyBPo6816mnmSG9T3fvx5rRa9w2o5EO1m4I",
  authDomain: "water-level-monitoring-12caa.firebaseapp.com",
  databaseURL: "https://water-level-monitoring-12caa-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "water-level-monitoring-12caa",
  storageBucket: "water-level-monitoring-12caa.firebasestorage.app",
  messagingSenderId: "26182334762",
  appId: "1:26182334762:web:f363d3f51a879be3eb4653"
};

// Initialize Firebase Export Variables
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
