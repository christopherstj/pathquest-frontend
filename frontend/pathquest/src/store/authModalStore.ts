import { createStore } from "zustand/vanilla";

export type AuthModalMode = "login" | "email";

export type AuthModalState = {
    isOpen: boolean;
    mode: AuthModalMode;
    redirectAction: (() => void) | null;
    intendedUrl: string | null;
};

export type AuthModalActions = {
    openLoginModal: (redirectAction?: () => void, intendedUrl?: string) => void;
    openEmailModal: () => void;
    closeModal: () => void;
    setMode: (mode: AuthModalMode) => void;
    executeRedirectAction: () => void;
};

export type AuthModalStore = AuthModalState & AuthModalActions;

export const defaultAuthModalState: AuthModalState = {
    isOpen: false,
    mode: "login",
    redirectAction: null,
    intendedUrl: null,
};

export const createAuthModalStore = (
    preloadedState: AuthModalState = defaultAuthModalState
) => {
    return createStore<AuthModalStore>((set, get) => ({
        ...preloadedState,
        openLoginModal: (redirectAction, intendedUrl) =>
            set({
                isOpen: true,
                mode: "login",
                redirectAction: redirectAction ?? null,
                intendedUrl: intendedUrl ?? null,
            }),
        openEmailModal: () =>
            set({
                isOpen: true,
                mode: "email",
            }),
        closeModal: () =>
            set({
                isOpen: false,
                redirectAction: null,
                intendedUrl: null,
            }),
        setMode: (mode) => set({ mode }),
        executeRedirectAction: () => {
            const { redirectAction } = get();
            if (redirectAction) {
                redirectAction();
            }
            set({ redirectAction: null });
        },
    }));
};

// Create a singleton store instance for use across the app
export const authModalStore = createAuthModalStore();

