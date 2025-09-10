import { defineAction } from 'astro:actions';
import {
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';

import { firebase } from '../../firebase/config';

export const loginGoogleUser = defineAction({
    accept: 'json',
    handler: async (credentials) => {
        const credential = GoogleAuthProvider.credentialFromResult(credentials);
        if(!credential) return { ok: false, msg: 'No se pudo iniciar sesion' }
        await signInWithCredential(firebase.auth, credential);
      return { ok: true, msg: 'Usuario logueado' }
    }
  })