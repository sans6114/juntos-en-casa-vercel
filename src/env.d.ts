interface User {
    email: string | null;
    name: string | null;
    avatar: string | null;
    emailVerified: boolean | null;
}


declare namespace App {
    interface Locals {
        isLoggedIn: boolean;
        user: User | null;
    }
}