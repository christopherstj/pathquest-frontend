"use client";
import updateUser from "@/actions/users/updateUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import checkEmail from "@/helpers/checkEmail";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";

type Props = {
    redirectUrl?: string;
};

const EmailForm = ({ redirectUrl }: Props) => {
    const [email, setEmail] = React.useState("");
    const { update } = useSession();
    const router = useRouter();

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;

        const res = await updateUser({ email });

        if (res.success) {
            // Update the session to trigger JWT refresh
            await update();
            // Small delay to ensure session is updated
            await new Promise((resolve) => setTimeout(resolve, 500));
            // Navigate - middleware will catch and redirect appropriately
            router.push(redirectUrl || "/m/peaks");
        }
    };

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-2 w-full">
            <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <Button
                type="submit"
                disabled={!email || !checkEmail(email)}
                className="rounded-full bg-accent hover:bg-accent/80 text-white px-4 py-2"
            >
                Let's go!
            </Button>
        </form>
    );
};

export default EmailForm;
