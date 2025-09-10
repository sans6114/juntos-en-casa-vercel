// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
//para auth:
import { getAuth } from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCUQEdj0O3HhD0WWXBUK9GgPfr2uidf2Ec",
  authDomain: "astro-probe-auth.firebaseapp.com",
  projectId: "astro-probe-auth",
  storageBucket: "astro-probe-auth.firebasestorage.app",
  messagingSenderId: "777060828863",
  appId: "1:777060828863:web:d25fcd1848d88ee82a680a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


const auth = getAuth(app);
auth.languageCode = 'es'; // cambiar el idioma a español

export const firebase = {
  app,
  auth
};