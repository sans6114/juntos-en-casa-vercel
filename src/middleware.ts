import { defineMiddleware } from 'astro:middleware';

import {
  authAdmin,
  firestoreAdmin,
} from './firebase/server';
import type { Inscripcion } from './interfaces';

const privateRoutes = ['/mi-inscripcion'];
const publicRoutes = ['/login', '/inscripcion'];


export const onRequest = defineMiddleware(async ({ request, url, locals, redirect }, next) => {
    const authHeader = request.headers.get('Authorization') || '';
    let idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

      if (!idToken) {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(p => p.trim().split('=').map(decodeURIComponent)).filter(([k]) => k)
    );
    idToken = (cookies['idToken'] as string) || '';
  }

    //valores por defecto, esto para que no queden undefined
    locals.isLoggedIn = false;
    locals.isAdmin = false;
    locals.user = null;
    locals.inscripcion = null;
    if (idToken) {
        try {
            const decodedToken = await authAdmin.verifyIdToken(idToken);
            const userRecord = await authAdmin.getUser(decodedToken.uid);
            const customClaims = userRecord.customClaims || (decodedToken as any);
            locals.isLoggedIn = true;
            locals.isAdmin = !!customClaims?.admin;
            locals.user = {
                uid: userRecord.uid,
                email: userRecord.email as string | null,
                name: userRecord.displayName as string | null,
                avatar: userRecord.photoURL as string | null,
            };
            const docRef = firestoreAdmin.doc(`inscripciones/${decodedToken.uid}`)
            const docSnap = await docRef.get();
            if(docSnap.exists) {
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
                }
            }

        } catch (error) {
            console.error('Error verifying ID token:', error);
            // En caso de error, mantener como no logueado
        }
    }

    if(!locals.isAdmin && url.pathname.startsWith('/admin')) {
        return redirect('/');
    }
    if (!locals.isLoggedIn && privateRoutes.includes(url.pathname)) {
        return redirect('/login');
    }

    if (locals.isLoggedIn && publicRoutes.includes(url.pathname)) {
        return redirect('/mi-inscripcion');
    }

    return next();
});


