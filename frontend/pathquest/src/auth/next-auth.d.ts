import NextAuth, { DefaultSession } from "next-auth";
import { DefaultJWT } from "@auth/core/jwt";
import { AdapterUser } from "next-auth/adapters";

declare module "next-auth" {
    interface Session {
        user: AdapterUser;
    }
}
