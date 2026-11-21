import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


const firebaseConfig = {
    apiKey: "AIzaSyDSU1B9xoux9ztZc8wgpFv8N4EPV5o2zJI",
    authDomain: "aura-girls25.firebaseapp.com",
    projectId: "aura-girls25",
    storageBucket: "aura-girls25.firebasestorage.app",
    messagingSenderId: "466814982987",
    appId: "1:466814982987:web:d4438d01a5ad11775be6ce",
    measurementId: "G-SMMKGPEZ5Q"
};


const app = initializeApp(firebaseConfig);


const db = getFirestore(app);

const auth = getAuth(app);


export {
    db,
    auth
};