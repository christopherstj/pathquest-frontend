"use server";

import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";

const testApi = async () => {
    const session = await useAuth();

    return session;
};

export default testApi;
