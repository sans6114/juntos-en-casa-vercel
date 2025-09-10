import {
  loginGoogleUser,
  loginUser,
  logoutUser,
  registerUser,
} from './auth';

export const server = {
    // actions
    registerUser,
    logoutUser,
    loginUser,
    loginGoogleUser
}