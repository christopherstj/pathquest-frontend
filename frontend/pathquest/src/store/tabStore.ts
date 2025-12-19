import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";

// TabType is still exported for use in components that derive it from URL
export type TabType = "home" | "explore" | "profile";

export type ProfileSubTab = "stats" | "peaks" | "journal" | "challenges" | "review";

export type ExploreSubTab = 
    | "discovery" 
    | "community" 
    | "myActivity" 
    | "progress" 
    | "peaks" 
    | "details" 
    | "summits" 
    | "analytics";

// Note: activeTab is no longer stored here - it's derived from URL in MobileNavLayout/BottomTabBar
// The store now only manages sub-tab state within each tab
export type DrawerHeight = "collapsed" | "halfway" | "expanded";

export type TabState = {
    profileSubTab: ProfileSubTab;
    exploreSubTab: ExploreSubTab;
    exploreBackStack: string[]; // Track navigation history within Explore (URLs)
    lastExplorePath: string | null; // Remember last Explore detail path for tab memory
    drawerHeight: DrawerHeight; // Current drawer height for map padding
};

export type TabActions = {
    setProfileSubTab: (subTab: ProfileSubTab) => void;
    setExploreSubTab: (subTab: ExploreSubTab) => void;
    pushExploreHistory: (url: string) => void;
    popExploreHistory: () => string | null;
    clearExploreHistory: () => void;
    setLastExplorePath: (path: string | null) => void;
    setDrawerHeight: (height: DrawerHeight) => void;
};

export type TabStore = TabState & TabActions;

const defaultState: TabState = {
    profileSubTab: "stats",
    exploreSubTab: "discovery",
    exploreBackStack: [],
    lastExplorePath: null,
    drawerHeight: "halfway",
};

export const createTabStore = (preloadedState: Partial<TabState> = {}) => {
    return createStore<TabStore>((set, get) => ({
        ...defaultState,
        ...preloadedState,
        
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
        
        setLastExplorePath: (lastExplorePath) => set({ lastExplorePath }),
        
        setDrawerHeight: (drawerHeight) => set({ drawerHeight }),
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

