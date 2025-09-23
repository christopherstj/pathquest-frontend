import createUserIfNotExists from "@/actions/users/createUser";
import getIsUserSubscribed from "@/actions/users/getIsUserSubscribed";
import getUser from "@/actions/users/getUser";
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
            if (
                !user.id ||
                !account?.access_token ||
                !account?.providerAccountId ||
                !account?.refresh_token ||
                !account?.expires_at
            ) {
                return false;
            }
            const stravaCreds = {
                accessToken: account?.access_token,
                refreshToken: account?.refresh_token,
                providerAccountId: account?.providerAccountId,
                expiresAt: account?.expires_at,
            };
            await createUserIfNotExists(user, stravaCreds);
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                // token = { ...token, userId: user.id, subscribed: false };
                const isSubscribed = await getIsUserSubscribed(user.id);

                token.userId = user.id;
                token.subscribed = isSubscribed;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.userId) {
                session.user.id = token.userId as string;
                session.user.subscribed = token.subscribed as boolean;
            }
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
