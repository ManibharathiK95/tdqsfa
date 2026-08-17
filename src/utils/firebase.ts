import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDRWg5hb3dVgEDhoGD-Jf5vTLb8i65h1XE",
  authDomain: "thulir-fa.firebaseapp.com",
  databaseURL: "https://thulir-fa-default-rtdb.firebaseio.com",
  projectId: "thulir-fa",
  storageBucket: "thulir-fa.firebasestorage.app",
  messagingSenderId: "322421499647",
  appId: "1:322421499647:web:e6cdd5941db36339d44eca"
  measurementId: "G-1KY8GLT8FK"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
