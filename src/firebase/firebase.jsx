// Import necessary functions from the Firebase SDK
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // Import the authentication module
import { getFirestore } from 'firebase/firestore'; // Import Firestore module

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDKB3TLWmbpIUUTzdnJFFRfjLBLdkrBFwU",
  authDomain: "ai-chess-game-ada5d.firebaseapp.com",
  projectId: "ai-chess-game-ada5d",
  storageBucket: "ai-chess-game-ada5d.firebasestorage.app",
  messagingSenderId: "1029388177392",
  appId: "1:1029388177392:web:d2292187cf50d9e1d59735",
  measurementId: "G-KWXMHTES9X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

// Export the auth and db objects for use in your app
export { auth, db, app };
