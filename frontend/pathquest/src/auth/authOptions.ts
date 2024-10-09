import NextAuth, { AuthOptions } from "next-auth";
import StravaProvider from "next-auth/providers/strava";

export const authOptions: AuthOptions = {
    pages: {
        signIn: "/signin",
    },
    session: {
        strategy: "jwt",
    },
    jwt: {
        secret: process.env.NEXTAUTH_SECRET,
    },
    providers: [
        StravaProvider({
            clientId: process.env.STRAVA_CLIENT_ID ?? "",
            clientSecret: process.env.STRAVA_CLIENT_SECRET ?? "",
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
