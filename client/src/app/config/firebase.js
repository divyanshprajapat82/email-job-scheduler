// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAtlnu90tIvxwRPWf-eMp-juz9_xKzeCMM",
  authDomain: "email-job-scheduler-c0911.firebaseapp.com",
  projectId: "email-job-scheduler-c0911",
  storageBucket: "email-job-scheduler-c0911.firebasestorage.app",
  messagingSenderId: "1022113700030",
  appId: "1:1022113700030:web:730549790da296d5dba6ef",
  measurementId: "G-ETJ65KSE3F"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);