"use client";

import { useSession } from "next-auth/react";
import { useAuthModalStore } from "@/providers/AuthModalProvider";
import { useCallback } from "react";

/**
 * Hook that provides auth-gated action execution.
 * If user is not authenticated, opens the auth modal and queues the action.
 * If user is authenticated, executes the action immediately.
 *
 * @example
 * const requireAuth = useRequireAuth();
 *
 * // Wrap any action that requires authentication
 * const handleFavorite = () => {
 *   requireAuth(() => toggleFavoritePeak(peakId));
 * };
 *
 * // Or use it inline
 * <button onClick={() => requireAuth(() => doSomething())}>Action</button>
 */
const useRequireAuth = () => {
    const { data: session, status } = useSession();
    const openLoginModal = useAuthModalStore((state) => state.openLoginModal);

    const requireAuth = useCallback(
        (action: () => void | Promise<void>, intendedUrl?: string) => {
            // If authenticated and has email, execute immediately
            if (status === "authenticated" && session?.user?.email) {
                action();
                return;
            }

            // If not authenticated or missing email, open modal with queued action
            openLoginModal(action, intendedUrl);
        },
        [status, session, openLoginModal]
    );

    return requireAuth;
};

export default useRequireAuth;

/**
 * Hook that returns whether the user is authenticated with email.
 * Useful for conditionally rendering UI based on auth state.
 */
export const useIsAuthenticated = () => {
    const { data: session, status } = useSession();

    return {
        isAuthenticated: status === "authenticated" && !!session?.user?.email,
        isLoading: status === "loading",
        user: session?.user ?? null,
    };
};

