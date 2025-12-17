import createUserIfNotExists from "@/actions/users/createUser";
import getIsUserSubscribed from "@/actions/users/getIsUserSubscribed";
import getUser from "@/actions/users/getUser";
import NextAuth, { AuthOptions } from "next-auth";
import StravaProvider from "next-auth/providers/strava";

const frontendUrl = process.env.NEXTAUTH_URL ?? "";

export const authOptions: AuthOptions = {
    // Auth is handled via modal, no dedicated login page
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
                access_token: account?.access_token,
                refresh_token: account?.refresh_token,
                provider_account_id: account?.providerAccountId,
                expires_at: account?.expires_at,
            };
            const result = await createUserIfNotExists(user, stravaCreds);
            if (!result.success) {
                console.error("Failed to create user:", result.error);
                return false;
            }
            return true;
        },
        async jwt({ token, user, trigger }) {
            // On sign in or when update() is called
            // console.log("JWT callback triggered:", { token, user, trigger });
            if (user || trigger === "update") {
                const userObj = await getUser(
                    (token.userId as string) || user?.id
                );

                token.userId = user?.id || token.userId;
                token.subscribed = userObj?.user?.is_subscribed ?? false;
                token.name = userObj?.user?.name ?? null;
                token.email = userObj?.user?.email ?? null;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.userId) {
                session.user.id = token.userId as string;
                session.user.subscribed = token.subscribed as boolean;
                session.user.name = token.name as string | null;
                session.user.email = token.email as string | null;
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
