import type { ServiceAccount } from 'firebase-admin';
import {
  cert,
  getApps,
  initializeApp,
} from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const activeApps = getApps();


let serviceAccount;

if (import.meta.env.FIREBASE_ADMIN_CREDENTIALS) {
    // Si la variable de Netlify existe, úsala
    serviceAccount = JSON.parse(import.meta.env.FIREBASE_ADMIN_CREDENTIALS);
} else {
    // De lo contrario, usa las variables locales para desarrollo
    serviceAccount = {
        project_id: import.meta.env.FIREBASE_PROJECT_ID,
        private_key_id: import.meta.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: import.meta.env.FIREBASE_PRIVATE_KEY,
        client_email: import.meta.env.FIREBASE_CLIENT_EMAIL,
        client_id: import.meta.env.FIREBASE_CLIENT_ID,
        auth_uri: import.meta.env.FIREBASE_AUTH_URI,
        token_uri: import.meta.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: import.meta.env.FIREBASE_AUTH_CERT_URL,
        client_x509_cert_url: import.meta.env.FIREBASE_CLIENT_CERT_URL,
    };
}


const initApp = () => {
  return initializeApp({
    credential: cert(serviceAccount as ServiceAccount)
  })
}

// 1. Exporta la aplicación principal
export const app = activeApps.length === 0 ? initApp() : activeApps[0];

// 2. Exporta cada servicio de forma individual
export const authAdmin = getAuth(app);
export const firestoreAdmin = getFirestore(app);