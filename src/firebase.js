// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA2e9PfpnWk7wfewBMmq0v5E6Q9dg1J-pU",
  authDomain: "inkurra.firebaseapp.com",
  projectId: "inkurra",
  storageBucket: "inkurra.appspot.com",
  messagingSenderId: "709906150479",
  appId: "1:709906150479:web:49ad3d6102ab956da8663a",
  measurementId: "G-WTPY628CVW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
