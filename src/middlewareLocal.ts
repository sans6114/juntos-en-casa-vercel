import type { MiddlewareNext } from 'astro';
import { defineMiddleware } from 'astro:middleware';

const privateRoutes = ['/admin'];
const publicRoutes = ['/', '/login', '/register'];


export const onRequest = defineMiddleware(async ({ request, url }, next) => {

    const authHeader = request.headers.get('Authorization') ?? ''; //(el doble igual es para decile a typescript que si viene null o undefined le asigne un string vacio y no de error luego)
    if (privateRoutes.includes(url.pathname)) {
        return checkLocalAuth(authHeader, next);
    }
    return next();
});



const checkLocalAuth = (authHeaders: string, next: MiddlewareNext) => {
    // Lógica para verificar la autenticación local

    if (authHeaders) {
        const authValue = authHeaders.split(' ').at(-1) ?? 'user:pass';
        const decodedValue = atob(authValue).split(':');
        const [user, pass] = decodedValue;
        if (user === 'admin' && pass === 'admin') {
            return next();
        }
    }
    return new Response('Auth necesaria', {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Basic realm="Secure Area"',
            }
    });
}
