import { defineAction } from 'astro:actions';
import { signOut } from 'firebase/auth';

import { firebase } from '../../firebase/config';

export const logoutUser = defineAction({
    accept: 'json',
    handler: async (arg) => {
 
        await signOut(firebase.auth);

      return;
    }
  })