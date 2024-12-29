// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAvGczCkCB7V_ms6iKtEmogLvljin2bI6w",
    authDomain: "real-estate-project-14d32.firebaseapp.com",
    projectId: "real-estate-project-14d32",
    storageBucket: "real-estate-project-14d32.appspot.com", // Corrected
    messagingSenderId: "735689465452",
    appId: "1:735689465452:web:b1af0888f7c6e66d4bc249",
    measurementId: "G-HGPVYS7JV1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app }; // Ensure app is exported properly