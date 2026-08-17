// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDRWg5hb3dVgEDhoGD-Jf5vTLb8i65h1XE",
  authDomain: "thulir-fa.firebaseapp.com",
  databaseURL: "https://thulir-fa-default-rtdb.firebaseio.com",
  projectId: "thulir-fa",
  storageBucket: "thulir-fa.firebasestorage.app",
  messagingSenderId: "322421499647",
  appId: "1:322421499647:web:e6cdd5941db36339d44eca",
  measurementId: "G-1KY8GLT8FK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
