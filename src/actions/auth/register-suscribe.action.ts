import {
  ActionError,
  defineAction,
} from 'astro:actions';
import { z } from 'astro:schema';
import {
  type AuthError,
  AuthErrorCodes,
  createUserWithEmailAndPassword,
  deleteUser,
  type UserCredential,
} from 'firebase/auth';
import {
  doc,
  FirestoreError,
  setDoc,
} from 'firebase/firestore';

import { firebase } from '../../firebase/config';

export const registerSuscribeUser = defineAction({
  accept: 'json',
  input: z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
    edad: z.number().min(0, 'La edad debe ser un número positivo'),
    email: z.string().email(),
    remember_me: z.boolean().optional(),
    password: z.string().min(6),
    iglesiaVS: z.boolean().optional(),
    iglesiaNone: z.boolean().optional(),
    iglesiaDif: z.boolean().optional(),
    iglesiaDifNombre: z.string().optional(),
  }),
  handler: async ({ name, apellido, edad, email, password, iglesiaVS, iglesiaNone, iglesiaDif, iglesiaDifNombre, remember_me }, { cookies }) => {
    // Cookies
    if (remember_me) {
      cookies.set('email', email, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        path: '/',
      });
    } else {
      cookies.delete('email', { path: '/' });
    }
    let userCredential: UserCredential | null = null;
    try {
      // Creación del usuario en Firebase
      userCredential = await createUserWithEmailAndPassword(
        firebase.auth,
        email,
        password
      );
      //inscripción en la base de datos
      const incripcionRef = doc(firebase.db, 'inscripciones', userCredential.user.uid);

      await setDoc(incripcionRef, {
        name,
        apellido,
        edad,
        iglesiaVS: iglesiaVS || false,
        iglesiaNone: iglesiaNone || false,
        iglesiaDif: iglesiaDif || false,
        iglesiaDifNombre: iglesiaDifNombre || null, // Usar null en lugar de undefined
        timestamp: new Date()
      });
      const idToken = await userCredential.user.getIdToken(true);
      cookies.set('idToken', idToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: remember_me ? 60 * 60 * 24 * 7 : undefined, // 7 días
      });
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: `${name} ${apellido}`,
        inscripcionId: incripcionRef.id,
        success: true,
        idToken
      };
    } catch (error) {
      // Si algo falla Y ya se creó el usuario, eliminarlo
      if (userCredential?.user) {
        try {
          await deleteUser(userCredential.user);
          console.log('Usuario eliminado debido a error en inscripción');
        } catch (deleteError) {
          console.error('Error al eliminar usuario:', deleteError);
        }
      }

      // Manejar errores específicos
      if (error instanceof FirestoreError) {
        throw new ActionError({
          code: "INTERNAL_SERVER_ERROR",
          message: 'Error al guardar la inscripción'
        });
      }

      const firebaseError = error as AuthError;

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

      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: 'Error en el proceso de registro'
      });
    }
  }
});

