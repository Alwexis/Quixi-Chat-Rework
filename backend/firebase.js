// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB3VtQZPn1i1paLbg28BXb6m_3ruPYHv0M",
  authDomain: "quixichat.firebaseapp.com",
  projectId: "quixichat",
  storageBucket: "quixichat.firebasestorage.app",
  messagingSenderId: "422739320385",
  appId: "1:422739320385:web:cf6792f8d1cc5351dcf0c0",
  measurementId: "G-1C40XEQTXF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);