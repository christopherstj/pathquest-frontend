"use client";

import React, { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { Mountain, MapPin, Trophy, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthModalStore } from "@/providers/AuthModalProvider";
import updateUser from "@/actions/users/updateUser";
import checkEmail from "@/helpers/checkEmail";
import stravaButton from "@/public/images/btn_strava_connectwith_light.svg";

const AuthModal = () => {
    const { data: session, status, update } = useSession();
    const isOpen = useAuthModalStore((state) => state.isOpen);
    const mode = useAuthModalStore((state) => state.mode);
    const closeModal = useAuthModalStore((state) => state.closeModal);
    const openEmailModal = useAuthModalStore((state) => state.openEmailModal);
    const executeRedirectAction = useAuthModalStore(
        (state) => state.executeRedirectAction
    );

    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check if user is logged in but missing email - open email collection modal
    useEffect(() => {
        if (status === "authenticated" && session?.user && !session.user.email) {
            openEmailModal();
        }
    }, [status, session, openEmailModal]);

    // If user completes auth (has email), close modal and execute redirect
    useEffect(() => {
        if (
            status === "authenticated" &&
            session?.user?.email &&
            isOpen &&
            mode === "email"
        ) {
            executeRedirectAction();
            closeModal();
        }
    }, [status, session, isOpen, mode, closeModal, executeRedirectAction]);

    const handleStravaLogin = async () => {
        // Get current URL to redirect back after OAuth
        const currentUrl = window.location.href;

        await signIn("strava", {
            redirect: true,
            callbackUrl: currentUrl,
        });
    };

    const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const res = await updateUser({ email });

            if (res.success) {
                // Update session to refresh JWT
                await update();

                // Small delay to ensure session is updated
                await new Promise((resolve) => setTimeout(resolve, 300));

                // Execute any pending redirect action
                executeRedirectAction();
                closeModal();
            } else {
                setError(res.error || "Failed to save email");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            // Don't allow closing if in email mode without email
            if (mode === "email" && status === "authenticated" && !session?.user?.email) {
                return;
            }
            closeModal();
        }
    };

    const showCloseButton = !(
        mode === "email" &&
        status === "authenticated" &&
        !session?.user?.email
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent
                className="sm:max-w-md"
                showCloseButton={showCloseButton}
                onPointerDownOutside={(e) => {
                    // Prevent closing by clicking outside in email mode
                    if (mode === "email" && !session?.user?.email) {
                        e.preventDefault();
                    }
                }}
                onEscapeKeyDown={(e) => {
                    // Prevent closing by escape in email mode
                    if (mode === "email" && !session?.user?.email) {
                        e.preventDefault();
                    }
                }}
            >
                {mode === "login" ? (
                    <LoginContent onStravaLogin={handleStravaLogin} />
                ) : (
                    <EmailContent
                        email={email}
                        setEmail={setEmail}
                        isSubmitting={isSubmitting}
                        error={error}
                        onSubmit={handleEmailSubmit}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};

type LoginContentProps = {
    onStravaLogin: () => void;
};

const LoginContent = ({ onStravaLogin }: LoginContentProps) => {
    return (
        <>
            <DialogHeader className="text-center items-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Mountain className="w-8 h-8 text-primary" />
                </div>
                <DialogTitle className="text-2xl font-display">
                    Join PathQuest
                </DialogTitle>
                <DialogDescription className="text-base">
                    Track your peak summits and conquer hiking challenges
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
                {/* Value propositions */}
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-4 h-4 text-secondary" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">
                                Auto-detect Summits
                            </p>
                            <p className="text-xs text-muted-foreground">
                                We analyze your Strava activities to find peaks
                                you&apos;ve climbed
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                            <Trophy className="w-4 h-4 text-secondary" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">
                                Complete Challenges
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Track your progress on famous peak lists and
                                hiking challenges
                            </p>
                        </div>
                    </div>
                </div>

                {/* Strava button */}
                <div className="pt-2">
                    <Button
                        onClick={onStravaLogin}
                        className="w-full rounded-md bg-[#FC4C02] hover:bg-[#E34402] px-4 py-6"
                        aria-label="Connect with Strava"
                    >
                        <Image
                            src={stravaButton}
                            height={40}
                            alt="Connect with Strava"
                        />
                    </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                    By connecting, you agree to let PathQuest read your activity
                    data from Strava
                </p>
            </div>
        </>
    );
};

type EmailContentProps = {
    email: string;
    setEmail: (email: string) => void;
    isSubmitting: boolean;
    error: string | null;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

const EmailContent = ({
    email,
    setEmail,
    isSubmitting,
    error,
    onSubmit,
}: EmailContentProps) => {
    const isValidEmail = checkEmail(email);

    return (
        <>
            <DialogHeader className="text-center items-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Mountain className="w-8 h-8 text-primary" />
                </div>
                <DialogTitle className="text-2xl font-display">
                    Almost there!
                </DialogTitle>
                <DialogDescription className="text-base">
                    Enter your email to complete signup. We&apos;ll use it to
                    send you summit notifications and updates.
                </DialogDescription>
            </DialogHeader>

            <form onSubmit={onSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                    <Input
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting}
                        aria-label="Email address"
                        className="text-center"
                    />
                    {error && (
                        <p className="text-sm text-destructive text-center">
                            {error}
                        </p>
                    )}
                </div>

                <Button
                    type="submit"
                    disabled={!isValidEmail || isSubmitting}
                    className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Setting up your account...
                        </>
                    ) : (
                        "Start Exploring"
                    )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                    We&apos;re syncing your Strava history in the background.
                    This may take a few minutes.
                </p>
            </form>
        </>
    );
};

export default AuthModal;

