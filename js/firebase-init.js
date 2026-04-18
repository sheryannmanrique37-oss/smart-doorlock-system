import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

// ============================================
// CONFIGURATION
// Replace the config below with your actual Firebase Web SDK details
// ============================================
export const firebaseConfig = {
  apiKey: "AIzaSyDCg7yfWQJcEO1RWFfOelTPrZmIojn1v7w",
  authDomain: "smart-doorlock-system.firebaseapp.com",
  projectId: "smart-doorlock-system",
  storageBucket: "smart-doorlock-system.firebasestorage.app",
  messagingSenderId: "566488612508",
  appId: "1:566488612508:web:41c810eced6e23670fb759"
};

// Initialize Firebase Export Variables
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
