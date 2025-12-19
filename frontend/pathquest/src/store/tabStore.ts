import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";

export type TabType = "home" | "explore" | "profile";

export type ProfileSubTab = "peaks" | "journal" | "challenges" | "review";

export type ExploreSubTab = 
    | "discovery" 
    | "community" 
    | "myActivity" 
    | "progress" 
    | "peaks" 
    | "details" 
    | "summits" 
    | "analytics";

export type TabState = {
    activeTab: TabType;
    profileSubTab: ProfileSubTab;
    exploreSubTab: ExploreSubTab;
    exploreBackStack: string[]; // Track navigation history within Explore (URLs)
};

export type TabActions = {
    setActiveTab: (tab: TabType) => void;
    setProfileSubTab: (subTab: ProfileSubTab) => void;
    setExploreSubTab: (subTab: ExploreSubTab) => void;
    pushExploreHistory: (url: string) => void;
    popExploreHistory: () => string | null;
    clearExploreHistory: () => void;
};

export type TabStore = TabState & TabActions;

const defaultState: TabState = {
    activeTab: "home",
    profileSubTab: "peaks",
    exploreSubTab: "discovery",
    exploreBackStack: [],
};

export const createTabStore = (preloadedState: Partial<TabState> = {}) => {
    return createStore<TabStore>((set, get) => ({
        ...defaultState,
        ...preloadedState,
        
        setActiveTab: (activeTab) => set({ activeTab }),
        
        setProfileSubTab: (profileSubTab) => set({ profileSubTab }),
        
        setExploreSubTab: (exploreSubTab) => set({ exploreSubTab }),
        
        pushExploreHistory: (url) => set((state) => ({
            exploreBackStack: [...state.exploreBackStack, url],
        })),
        
        popExploreHistory: () => {
            const { exploreBackStack } = get();
            if (exploreBackStack.length === 0) return null;
            
            const lastUrl = exploreBackStack[exploreBackStack.length - 1];
            set({ exploreBackStack: exploreBackStack.slice(0, -1) });
            return lastUrl;
        },
        
        clearExploreHistory: () => set({ exploreBackStack: [] }),
    }));
};

// Create a singleton store instance for use across the app
let tabStore: ReturnType<typeof createTabStore> | null = null;

export const getTabStore = () => {
    if (!tabStore) {
        tabStore = createTabStore();
    }
    return tabStore;
};

// Hook for using the tab store in React components
export const useTabStore = <T>(selector: (state: TabStore) => T): T => {
    return useStore(getTabStore(), selector);
};

