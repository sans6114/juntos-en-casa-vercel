import { defineAction } from 'astro:actions';
import { z } from 'astro:content';
import {
  type AuthError,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import { firebase } from '../../firebase/config';

export const loginUser = defineAction({
    accept: 'form',
    input: z.object({
      email: z.string().email(),
      password: z.string().min(6).max(100),
      remember_me: z.boolean().optional()
    }),
    handler: async ({email, password, remember_me}, {cookies}) => {
      // lógica para registrar al usuario
       if (remember_me) {
      cookies.set('email', email, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 días donde la cookie quedraa viva.
        path: '/', // ruta donde la cookie es válida
      })
    } else {
      cookies.delete('email', { path: '/' }) // borra la cookie (importante la path)
    } 
    try {
      const userCredential = await signInWithEmailAndPassword(firebase.auth, email, password);
      if(userCredential.user) {
        return { ok: true, msg: 'Usuario logeado', user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
        }}
      }
    } catch (error) {
      const firebaseError = error as AuthError
      if (firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password') {
        return { ok: false, msg: 'Usuario o contraseña incorrecta' };
      }
      return { ok: false, msg: 'Error al logear usuario' }
    }
}  })
  
  