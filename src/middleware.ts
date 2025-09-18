// src/middleware/index.ts
import { defineMiddleware } from 'astro:middleware';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

import { app } from './firebase/server';
import type { Inscripcion } from './interfaces';

const authAdmin = getAuth(app);
const firestoreAdmin = getFirestore(app);

const adminRoutes = ['/admin/1'];
const privateRoutes = ['/mi-inscripcion'];
const publicRoutes = ['/login', '/inscripcion'];

export const onRequest = defineMiddleware(async ({ request, url, locals, redirect }, next) => {
    const authHeader = request.headers.get("Authorization");
    const idToken = authHeader?.split('Bearer ')[1];

    locals.isLoggedIn = false;
    locals.isAdmin = false;
    locals.user = null;
    locals.inscripcion = null;

    if (idToken) {
        try {
            const decodedToken = await authAdmin.verifyIdToken(idToken);
            const customClaims = decodedToken.customClaims;
            
            // 💡 Paso clave: Obtener el perfil completo del usuario
            const userRecord = await authAdmin.getUser(decodedToken.uid);

            locals.isLoggedIn = true;
            locals.isAdmin = !!customClaims?.admin;
            // 💡 Asignar un objeto que coincida con tu tipo 'User'
            locals.user = {
                uid: userRecord.uid,
                email: userRecord.email,
                name: userRecord.displayName, // El nombre está en displayName
                avatar: userRecord.photoURL, // La URL del avatar está en photoURL
                // Agrega otras propiedades que necesites
            };

            const docRef = firestoreAdmin.doc(`inscripciones/${decodedToken.uid}`);
            const docSnap = await docRef.get();
            
            if (docSnap.exists) {
                const inscripcion = docSnap.data() as Inscripcion;
                locals.inscripcion = {
                    name: inscripcion.name,
                    apellido: inscripcion.apellido,
                    edad: inscripcion.edad,
                    iglesiaVS: inscripcion.iglesiaVS,
                    iglesiaNone: inscripcion.iglesiaNone,
                    iglesiaDif: inscripcion.iglesiaDif,
                    iglesiaDifNombre: inscripcion.iglesiaDifNombre,
                    timestamp: inscripcion.timestamp
                };
            }
        } catch (error) {
            console.error('Error verifying token or fetching user:', error);
        }
    }

    if (!locals.isAdmin && adminRoutes.includes(url.pathname)) {
        return redirect('/login');
    }
    if (!locals.isLoggedIn && privateRoutes.includes(url.pathname)) {
        return redirect('/login');
    }
    if (locals.isLoggedIn && publicRoutes.includes(url.pathname)) {
        return redirect('/mi-inscripcion');
    }

    return next();
});