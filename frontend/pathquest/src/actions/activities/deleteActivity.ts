"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const backendUrl = getBackendUrl();

const deleteActivity = async (activityId: string) => {
    const session = await useAuth();

    if (!session) {
        return;
    }

    const token = await getGoogleIdToken();

    const url = `${backendUrl}/activities/${activityId}`;

    const res = await fetch(url, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        console.error(await res.text());
        return;
    }

    revalidatePath("/app/activities");
    redirect("/app/activities");
};

export default deleteActivity;
