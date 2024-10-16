import NextAuth, { AuthOptions } from "next-auth";
import StravaProvider from "next-auth/providers/strava";

const frontendUrl = process.env.NEXTAUTH_URL ?? "";

export const authOptions: AuthOptions = {
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    jwt: {
        secret: process.env.NEXTAUTH_SECRET,
    },
    callbacks: {
        async signIn({ user, account, profile, email, credentials }) {
            if (!account) {
                return false;
            }
            const {
                access_token,
                refresh_token,
                providerAccountId,
                expires_at,
            } = account;
            await fetch(`${frontendUrl}/api/auth/strava-creds`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    access_token,
                    refresh_token,
                    providerAccountId,
                    expires_at,
                }),
            });
            return true;
        },
        async jwt({ token, user, account }) {
            if (user) {
                token = { ...token, user };
            }
            return token;
        },
        async session({ session, token }) {
            // @ts-expect-error User token assignment is handled by the jwt callback
            session.user = token.user;
            return session;
        },
    },
    providers: [
        StravaProvider({
            clientId: process.env.STRAVA_CLIENT_ID ?? "",
            clientSecret: process.env.STRAVA_CLIENT_SECRET ?? "",
            authorization: {
                params: {
                    scope: "read,activity:read,activity:read_all,activity:write",
                },
            },
            token: {
                async request({ client, params, checks, provider }) {
                    const {
                        token_type,
                        expires_at,
                        refresh_token,
                        access_token,
                    } = await client.oauthCallback(
                        provider.callbackUrl,
                        params,
                        checks
                    );
                    return {
                        tokens: {
                            token_type,
                            expires_at,
                            refresh_token,
                            access_token,
                        },
                    };
                },
            },
        }),
    ],
};
