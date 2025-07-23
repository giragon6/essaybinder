// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDlirqrAb_4V5XuXhmVCugOUToDZRRQFgA",
  authDomain: "essaybook-c08f6.firebaseapp.com",
  projectId: "essaybook-c08f6",
  storageBucket: "essaybook-c08f6.firebasestorage.app",
  messagingSenderId: "1071227608763",
  appId: "1:1071227608763:web:b14ad5041a17b9f2b2939e",
  measurementId: "G-G3TVCZJZH2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { app, analytics, auth, provider };