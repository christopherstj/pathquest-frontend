import { createStore } from "zustand/vanilla";

const STORAGE_KEY = "pathquest_onboarding_seen";

export type OnboardingState = {
    // Whether the user has completed onboarding (persisted)
    hasSeenOnboarding: boolean;
    // Whether the onboarding modal is currently visible
    showOnboardingModal: boolean;
    // Whether we've loaded the persisted state
    isInitialized: boolean;
};

export type OnboardingActions = {
    initialize: () => void;
    openOnboarding: () => void;
    completeOnboarding: () => void;
    resetOnboarding: () => void; // For testing
};

export type OnboardingStore = OnboardingState & OnboardingActions;

export const defaultOnboardingState: OnboardingState = {
    hasSeenOnboarding: false,
    showOnboardingModal: false,
    isInitialized: false,
};

export const createOnboardingStore = (
    preloadedState: OnboardingState = defaultOnboardingState
) => {
    return createStore<OnboardingStore>((set) => ({
        ...preloadedState,
        
        /**
         * Initialize onboarding state from localStorage.
         * Called on app mount.
         */
        initialize: () => {
            if (typeof window === "undefined") return;
            
            try {
                const value = localStorage.getItem(STORAGE_KEY);
                const hasSeenOnboarding = value === "true";
                set({ 
                    hasSeenOnboarding, 
                    isInitialized: true,
                });
            } catch (error) {
                console.error("[OnboardingStore] Failed to load from localStorage:", error);
                set({ isInitialized: true });
            }
        },

        /**
         * Show the onboarding modal.
         */
        openOnboarding: () => {
            set({ showOnboardingModal: true });
        },

        /**
         * Mark onboarding as complete and hide the modal.
         * Persists to localStorage.
         */
        completeOnboarding: () => {
            if (typeof window !== "undefined") {
                try {
                    localStorage.setItem(STORAGE_KEY, "true");
                } catch (error) {
                    console.error("[OnboardingStore] Failed to save to localStorage:", error);
                }
            }
            set({ 
                hasSeenOnboarding: true, 
                showOnboardingModal: false,
            });
        },

        /**
         * Reset onboarding state (for testing/debugging).
         */
        resetOnboarding: () => {
            if (typeof window !== "undefined") {
                try {
                    localStorage.removeItem(STORAGE_KEY);
                } catch (error) {
                    console.error("[OnboardingStore] Failed to reset localStorage:", error);
                }
            }
            set({ 
                hasSeenOnboarding: false, 
                showOnboardingModal: false,
            });
        },
    }));
};

