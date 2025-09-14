import { defineMiddleware } from 'astro:middleware';

import { firebase } from './firebase/config';
import { firestoreAdmin } from './firebase/server';
import type { Inscripcion } from './interfaces';

const privateRoutes = ['/admin', '/mi-inscripcion'];
const publicRoutes = ['/login', '/inscripcion'];


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
            const docRef = firestoreAdmin.doc(`inscripciones/${user.uid}`)
            const docSnap = await docRef.get();
            console.log({ docSnapData: docSnap.data() });
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
                console.log({ inscripcion });
            }

            locals.isLoggedIn = true;
            locals.isAdmin = !!customClaims.admin;
        } catch (error) {
            console.error('Error getting user token:', error);
            // En caso de error, mantener como no logueado
        }
    }


    if (!locals.isLoggedIn && privateRoutes.includes(url.pathname)) {
        return redirect('/login');
    }

    if (locals.isLoggedIn && publicRoutes.includes(url.pathname)) {
        return redirect('/mi-inscripcion');
    }

    return next();
});


