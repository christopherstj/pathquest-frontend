"use server";
import { redirect } from "next/navigation";
import { useAuth } from "@/auth/useAuth";

const redirectPublicPage = async (route: string): Promise<void> => {
    const session = await useAuth();

    if (session?.user) {
        redirect(`/app/${route}`);
    }

    return;
};

export default redirectPublicPage;
