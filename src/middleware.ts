import { defineMiddleware } from 'astro:middleware';
import {
  doc,
  getDoc,
} from 'firebase/firestore';

import { firebase } from './firebase/config';

const privateRoutes = ['/admin'];
const publicRoutes = ['/', '/login', '/inscripcion'];


export const onRequest = defineMiddleware(async ({ request, url, locals, redirect }, next) => {
    //valores por defecto, esto para que no queden undefined
    locals.isLoggedIn = false;
    locals.isAdmin = false;
    locals.user = null;

    const user = firebase.auth.currentUser;

    if (user) {
        try {
            const tokenResult = await user.getIdTokenResult();
            const customClaims = tokenResult.claims;
            const docRef = doc(firebase.db, "inscripciones", user.uid);
            const docSnap = await getDoc(docRef);
            if(docSnap.exists()) {
                const inscripcion = docSnap.data();
                locals.inscripcion = {
                    nombre: inscripcion.name,
                    edad: inscripcion.edad,
                    iglesiaVS: inscripcion.iglesiaVS,
                    iglesiaNone: inscripcion.iglesiaNone,
                    iglesiaDif: inscripcion.iglesiaDif,
                    iglesiaDifNombre: inscripcion.iglesiaDifNombre,
                    timestamp: inscripcion.timestamp.toDate()
                }
            }

            locals.isLoggedIn = true;
            locals.isAdmin = !!customClaims.admin;

            locals.user = {
                uid: user.uid,
                email: user.email,
                name: user.displayName,
                avatar: user.photoURL ?? '',
            };
        } catch (error) {
            console.error('Error getting user token:', error);
            // En caso de error, mantener como no logueado
        }
    }


    if (!locals.isLoggedIn && privateRoutes.includes(url.pathname)) {
        return redirect('/login');
    }

    // if (locals.isLoggedIn && publicRoutes.includes(url.pathname)) {
    //     return redirect('/admin');
    // }

    return next();
});


