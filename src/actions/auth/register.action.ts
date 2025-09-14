import {
  ActionError,
  defineAction,
} from 'astro:actions';
import { z } from 'astro:schema';
import {
  type AuthError,
  AuthErrorCodes,
  createUserWithEmailAndPassword,
  type UserCredential,
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
    // Cookies
    if (remember_me) {
      cookies.set('email', email, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        path: '/',
      });
    } else {
      cookies.delete('email', { path: '/' });
    }

    try {
      // Creación del usuario en Firebase
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        firebase.auth, 
        email, 
        password
      );

      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: name,
        success: true
      };

    } catch (error) {
      const firebaseError = error as AuthError;
      
      // Usar los códigos específicos de Firebase
      if (firebaseError.code === AuthErrorCodes.EMAIL_EXISTS) {
        throw new ActionError({
          code: 'CONFLICT',
          message: 'El correo electrónico ya está en uso'
        });
      }
      
      if (firebaseError.code === AuthErrorCodes.WEAK_PASSWORD) {
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: 'La contraseña es muy débil'
        });
      }

      if (firebaseError.code === AuthErrorCodes.INVALID_EMAIL) {
        throw new ActionError({
          code: 'BAD_REQUEST',
          message: 'El correo electrónico no es válido'
        });
      }

      if (firebaseError.code === AuthErrorCodes.OPERATION_NOT_ALLOWED) {
        throw new ActionError({
          code: 'FORBIDDEN',
          message: 'La operación no está permitida'
        });
      }
      
      // Para cualquier otro error
      throw new ActionError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error al registrar el usuario'
      });
    }
  }
});

