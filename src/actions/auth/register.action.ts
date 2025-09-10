import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import {
  type AuthError,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';

import { firebase } from '../../firebase/config';

export const registerUser = defineAction({
  accept: 'form',
  input: z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
    remember_me: z.boolean().optional(),
  }),
  handler: async ({ name, email, password, remember_me }, { cookies }) => {
    //cookies
    if (remember_me) {
      cookies.set('email', email, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 días donde la cookie quedraa viva.
        path: '/', // ruta donde la cookie es válida
      })
    } else {
      cookies.delete('email', { path: '/' }) // borra la cookie (importante la path)
    }
    //creacion del usuario en firebase
    try {
      const userCredential = await createUserWithEmailAndPassword(firebase.auth, email, password); // ---> creamos el usuario a partir de su email y password.

      // actualizar el nombre del usuario
      updateProfile(userCredential.user, { displayName: name });

      //verificacion de correo electronico
      await sendEmailVerification(userCredential.user, {
        url: 'http://localhost:4321/admin',
      })
       return {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: name,
          success: true
      };
    } catch (error) {
      const firebaseError = error as AuthError;
      
      if (firebaseError.code === 'auth/email-already-in-use') {
        return {
          success: false,
          message: 'El correo electrónico ya está en uso'
        };
      }
      
      if (firebaseError.code === 'auth/weak-password') {
        return {
          success: false,
          message: 'La contraseña es muy débil'
        };
      }
      
      if (firebaseError.code === 'auth/invalid-email') {
        return {
          success: false,
          message: 'El correo electrónico no es válido'
        };
      }
      
      // Para cualquier otro error
      return {
        success: false,
        message: 'Error al registrar el usuario'
      };
    }
  }

})

