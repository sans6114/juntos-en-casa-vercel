import {
  loginGoogleUser,
  loginUser,
  logoutUser,
  registerUser,
} from './auth';
import { inscripcionDB } from './db';

export const server = {
    // actions
    registerUser,
    logoutUser,
    loginUser,
    loginGoogleUser,
    inscripcionDB
}