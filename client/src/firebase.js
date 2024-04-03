// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-ed0dd.firebaseapp.com",
  projectId: "mern-estate-ed0dd",
  storageBucket: "mern-estate-ed0dd.appspot.com",
  messagingSenderId: "832546528379",
  appId: "1:832546528379:web:04a007dbda7d09e473d6de"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);