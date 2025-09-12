// src/scripts/setAdmin.ts
// 1. Importa y carga las variables de entorno desde el archivo .env
import 'dotenv/config';

import {
  cert,
  getApps,
  initializeApp,
} from 'firebase-admin/app';
// El resto de tu código de inicialización y lógica
import { getAuth } from 'firebase-admin/auth';

// 2. Define el objeto de cuenta de servicio usando process.env
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: (process.env.FIREBASE_PRIVATE_KEY as string).replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
};

// 3. Inicializa la app de Firebase Admin
const app = getApps().length === 0 ? initializeApp({
  credential: cert(serviceAccount)
}) : getApps()[0];

// 4. Usa la app inicializada para obtener el servicio de autenticación
const auth = getAuth(app);

// Resto de tu código para establecer el rol de admin
const email = 'juntosencasa.ivs@gmail.com';

async function setAdminClaim() {
  try {
    const user = await auth.getUserByEmail(email);
    await auth.setCustomUserClaims(user.uid, { admin: true });
    console.log(`Usuario ${email} ahora tiene rol de admin.`);
  } catch (error) {
    console.error('Error al establecer el rol de admin:', error);
  }
}

setAdminClaim();