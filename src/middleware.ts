import { defineMiddleware } from 'astro:middleware';

import {
  authAdmin,
  firestoreAdmin,
} from './firebase/server';
import type { Inscripcion } from './interfaces';

// --- NUEVO: cachés y utilidades --- //
type CachedToken = { decoded: any; expMs: number };
const tokenCache = new Map<string, CachedToken>();
const inscripcionCache = new Map<string, { data: Inscripcion; ts: number }>();

const TOKEN_SKEW_MS = 60_000; // margen de 1 min
const INSCRIPCION_TTL_MS = 5 * 60_000; // 5 min

// rutas que requieren locals.inscripcion
const requireInscripcionPaths = new Set<string>(['/mi-inscripcion']);


const STATIC_PREFIXES = [
  '/_astro',
  '/assets',
  '/favicon',
  '/icons',
  '/images',
  '/img',
  '/public',
  '/personaje',
  '/robots.txt',
  '/manifest.webmanifest',
];

function isStaticPath(path: string) {
  return STATIC_PREFIXES.some((p) => path.startsWith(p));
}


const privateRoutes = ['/mi-inscripcion'];
const publicRoutes = ['/login', '/inscripcion'];

export const onRequest = defineMiddleware(async ({ request, url, locals, redirect }, next) => {
  // 1) Saltar recursos estáticos
  if (isStaticPath(url.pathname)) {
    return next();
  }

  // 2) Obtener token de Authorization o cookie
  const authHeader = request.headers.get('Authorization') || '';
  let idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!idToken) {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader
        .split(';')
        .map((p) => p.trim().split('=').map(decodeURIComponent))
        .filter(([k]) => k),
    );
    idToken = (cookies['idToken'] as string) || '';
  }

  // valores por defecto
  locals.isLoggedIn = false;
  locals.isAdmin = false;
  locals.user = null;
  locals.inscripcion = null;

  // 3) Verificación con caché y sin getUser
  if (idToken) {
    try {
      let decodedToken: any | null = null;
      const cached = tokenCache.get(idToken);
      const now = Date.now();

      if (cached && now < cached.expMs - TOKEN_SKEW_MS) {
        decodedToken = cached.decoded;
      } else {
        decodedToken = await authAdmin.verifyIdToken(idToken);
        const expMs = (decodedToken.exp as number) * 1000;
        tokenCache.set(idToken, { decoded: decodedToken, expMs });
      }

      locals.isLoggedIn = true;
      locals.isAdmin = !!decodedToken.admin;
      locals.user = {
        uid: decodedToken.uid,
        email: (decodedToken.email as string) ?? null,
        name: (decodedToken.name as string) ?? null,     // usa claims si vienen
        avatar: (decodedToken.picture as string) ?? null // evita getUser
      };

      // 4) Solo leer Firestore si la ruta lo necesita, con caché
      if (requireInscripcionPaths.has(url.pathname)) {
        const uid = decodedToken.uid as string;
        const cachedIns = inscripcionCache.get(uid);
        if (cachedIns && now - cachedIns.ts < INSCRIPCION_TTL_MS) {
          locals.inscripcion = cachedIns.data;
        } else {
          const docRef = firestoreAdmin.doc(`inscripciones/${uid}`);
          const docSnap = await docRef.get();
          if (docSnap.exists) {
            const ins = docSnap.data() as Inscripcion;
            const data: Inscripcion = {
              name: ins.name,
              apellido: ins.apellido,
              edad: ins.edad,
              iglesiaVS: ins.iglesiaVS,
              iglesiaNone: ins.iglesiaNone,
              iglesiaDif: ins.iglesiaDif,
              iglesiaDifNombre: ins.iglesiaDifNombre,
              timestamp: ins.timestamp,
            };
            locals.inscripcion = data;
            inscripcionCache.set(uid, { data, ts: now });
          }
        }
      }
    } catch (error) {
      console.error('Error en autenticación o lectura (omitido para ahorrar cuota):', error);
      // mantener como no logueado / sin inscripcion si falla
    }
  }

  // 5) Guards mínimos
  if (!locals.isAdmin && url.pathname.startsWith('/admin')) {
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


