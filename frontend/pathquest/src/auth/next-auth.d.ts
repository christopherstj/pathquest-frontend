import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            subscribed?: boolean;
            name?: string | null;
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        subscribed?: boolean;
        name?: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        userId?: string;
        subscribed?: boolean;
        name?: string | null;
    }
}
