import NextAuth, { AuthOptions } from "next-auth";
import StravaProvider from "next-auth/providers/strava";

export const authOptions: AuthOptions = {
    pages: {
        signIn: "/",
    },
    session: {
        strategy: "jwt",
    },
    jwt: {
        secret: process.env.NEXTAUTH_SECRET,
    },
    callbacks: {
        async jwt({ token, user }) {
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
                    scope: "activity:read_all",
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
