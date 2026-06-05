// ============================================================
//  firebase.js  –  Firebase v10 Modular SDK (CDN / ES Modules)
//  All imports come directly from the gstatic CDN.
//  No npm, no build tools required.
//
//  This module initializes the Firebase app and exports the
//  Firestore and Auth service instances for use throughout
//  the application.
// ============================================================

// --- Core SDK ---
import { initializeApp }  from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

// --- Firestore ---
import { getFirestore }   from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --- Authentication ---
import { getAuth, setPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ---------------------------------------------------------------
//  Firebase project configuration
//  These values are specific to the OMEGA COMPETENCE Helpdesk
//  Firebase project and should not be changed without updating
//  the project reference.
// ---------------------------------------------------------------

/**
 * @type {import('firebase/app').FirebaseOptions}
 */
const firebaseConfig = {
  apiKey:            "AIzaSyDT7w49CJ2enAT4PEd-DtL44T891AkWE2U",
  authDomain:        "helpdesk-omegacompetence.firebaseapp.com",
  projectId:         "helpdesk-omegacompetence",
  storageBucket:     "helpdesk-omegacompetence.firebasestorage.app",
  messagingSenderId: "1070592652801",
  appId:             "1:1070592652801:web:fead383c2eb48740ef7200"
};

// ---------------------------------------------------------------
//  Initialize Firebase
// ---------------------------------------------------------------
const app = initializeApp(firebaseConfig);

// ---------------------------------------------------------------
//  Initialize & export services
// ---------------------------------------------------------------

/**
 * Firestore database instance for data persistence.
 * @type {import('firebase/firestore').Firestore}
 */
export const db   = getFirestore(app);

/**
 * Firebase Authentication instance for user management.
 * @type {import('firebase/auth').Auth}
 */
export const auth = getAuth(app);

// Set session persistence - user logs out when browser is closed
setPersistence(auth, browserSessionPersistence).catch((err) => {
  console.warn("Failed to set auth persistence:", err);
});
