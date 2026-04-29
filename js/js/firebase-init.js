import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

// ============================================
// CONFIGURATION
// Replace the config below with your actual Firebase Web SDK details
// ============================================
export const firebaseConfig = {
  apiKey: "AIzaSyA7muUhSiZayLr68WW-AxCkuqxp_hw2lIQ",
  authDomain: "power-outlet-5465c.firebaseapp.com",
  databaseURL: "https://power-outlet-5465c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "power-outlet-5465c",
  storageBucket: "power-outlet-5465c.firebasestorage.app",
  messagingSenderId: "523246709275",
  appId: "1:523246709275:web:05d7f6ae5c275c8a8866be"
};

// Initialize Firebase Export Variables
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
