// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCyO3N0lFQDHHDjlkYwhTcGXdThd4sRano",
  authDomain: "qrcodemaker-19c40.firebaseapp.com",
  projectId: "qrcodemaker-19c40",
  storageBucket: "qrcodemaker-19c40.firebasestorage.app",
  messagingSenderId: "916621596057",
  appId: "1:916621596057:web:21167638856faf7722ef08",
  measurementId: "G-FJEYQ1KR56"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);