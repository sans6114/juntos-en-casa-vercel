interface User {
    uid: string;
    email: string | null;
    name: string | null;
    avatar: string | null;
    emailVerified: boolean | null;
}
interface ImportMetaEnv {
  readonly FIREBASE_PROJECT_ID: string;
  readonly FIREBASE_PRIVATE_KEY_ID: string;
  readonly FIREBASE_PRIVATE_KEY: string;
  readonly FIREBASE_CLIENT_EMAIL: string;
  readonly FIREBASE_CLIENT_ID: string;
  readonly FIREBASE_AUTH_URI: string;
  readonly FIREBASE_TOKEN_URI: string;
  readonly FIREBASE_AUTH_CERT_URL: string;
  readonly FIREBASE_CLIENT_CERT_URL: string;
}


declare namespace App {
    interface Locals {
        isLoggedIn: boolean;
        user: User | null;
        isAdmin: boolean;
    }
    interface ImportMeta {
  readonly env: ImportMetaEnv;
}}