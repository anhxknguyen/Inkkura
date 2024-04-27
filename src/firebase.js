// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDyJXcR_61JcNrkiSvhdzB2orwd6lO5Uww",
  authDomain: "inkkura-6ec66.firebaseapp.com",
  projectId: "inkkura-6ec66",
  storageBucket: "inkkura-6ec66.appspot.com",
  messagingSenderId: "761193399188",
  appId: "1:761193399188:web:bde1d862b21b89e809c581",
  measurementId: "G-GG052NMW4S",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
