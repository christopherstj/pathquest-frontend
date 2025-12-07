"use server";
import { useAuth } from "@/auth/useAuth";
import { redirect } from "next/navigation";

const redirectEmail = async (redirectUrl: string) => {
    const session = await useAuth();

    if (!session?.user.email) {
        redirect(`/email-form?redirect=${encodeURIComponent(redirectUrl)}`);
    }
};

export default redirectEmail;
