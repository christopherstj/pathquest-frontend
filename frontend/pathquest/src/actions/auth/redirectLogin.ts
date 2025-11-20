"use server";
import { useAuth } from "@/auth/useAuth";
import { redirect } from "next/navigation";

const redirectLogin = async (redirectUrl?: string) => {
    const session = await useAuth();

    if (session) {
        redirect(redirectUrl || "/m/peaks");
    }
};

export default redirectLogin;
