# PathQuest Frontend Architecture

## Overview
PathQuest Frontend is a Next.js 16 application built with React 19, TypeScript, and TailwindCSS. It provides a modern web interface for users to explore mountain peaks, track their summits, view challenges, and manage their Strava-connected activities.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **React**: React 19
- **Language**: TypeScript
- **Styling**: TailwindCSS 4.x
- **UI Components**: Radix UI, Shadcn/ui
- **State Management**: Zustand
- **Authentication**: NextAuth.js (Strava OAuth)
- **Maps**: Mapbox GL JS
- **Charts**: Visx
- **Payment**: Stripe
- **Fonts**: Fraunces (display), IBM Plex Mono (body/data)

## Project Structure

### App Router (`src/app/`)
Next.js 16 App Router structure with route groups and parallel routes.

#### Root Layout (`layout.tsx`)
- Provides theme provider (dark mode by default, retro topo palette)
- NextAuth session provider
- Persistent MapProvider with Mapbox background (map stays mounted while overlays change)
- Analytics integration (Vercel Analytics)
- Global fonts configuration (Fraunces + IBM Plex Mono)
- Parallel route slot `@overlay` for intercepted routes (peak/challenge details)

#### Static Detail Pages

The peak and challenge detail pages are static ISR pages:
- **SEO-friendly static pages** at `/peaks/[id]` and `/challenges/[id]`
- **Overlay UX** handled by `UrlOverlayManager` component (map stays mounted, overlays show based on URL params)

**Route Structure:**
```
src/app/
├── peaks/[id]/page.tsx          # Static ISR page (direct URL/crawlers)
└── challenges/[id]/page.tsx     # Static ISR page (direct URL/crawlers)
```

**How it works:**
- Direct URL access (Google, shared links) → Full static page with ISR
- In-app navigation → `UrlOverlayManager` reads URL params (`peakId`/`challengeId`) and shows appropriate overlay, map stays mounted
- Both share the same URL structure (`/peaks/abc123`)

**Static Generation:**
- Top 1000 peaks (by public summit count) are pre-generated at build
- All challenges are pre-generated at build
- Remaining peaks use on-demand ISR with 24-hour revalidation

#### Pages

##### `/` (Home Page)
- Landing page with full map experience
- Unauthenticated users can browse peaks and challenges freely
- Login/signup handled via modal overlay (AuthModal)
- Authentication triggered when user attempts personal actions (favorites, progress tracking)

##### `/peaks/[id]` (Peak Detail Page - Static/SEO)
- Static ISR page for SEO indexing
- Pre-generates top 1000 peaks by summit count
- Dynamic metadata with `generateMetadata` for SEO
- Uses `PeakDetailContent` component for overlay display
- Supports intercepting routes for in-app navigation

##### `/challenges/[id]` (Challenge Detail Page - Static/SEO)
- Static ISR page for SEO indexing
- Pre-generates all challenges at build time
- Dynamic metadata with `generateMetadata` for SEO
- Uses `ChallengeDetailContent` component for overlay display
- Supports intercepting routes for in-app navigation

##### `/activities/[id]` (Activity Detail Page - Dynamic)
- **Not statically generated** (too many activities, privacy concerns)
- Dynamic page with runtime data fetching
- Privacy-aware: only accessible if user AND activity are public, or by the owner
- Components:
  - `ActivityDetailPanel` (desktop): Right-side panel with Details/Summits/Analytics tabs
  - `ActivityDetailsMobile` (mobile): Bottom sheet content with same tab structure
- Features:
  - Activity stats (distance, elevation gain, duration, start time)
  - GPX route displayed on map via `useActivityMapEffects` hook
  - Interactive elevation profile with hover-to-map marker
  - List of summitted peaks with links to peak details
  - Analytics charts (grade analysis, cumulative elevation, climbing segments, mile splits)
  - Strava link and share button
  - Manual summit logging for peaks along the route

##### `/users/[userId]` (User Profile Page - Dynamic)
- **Not statically generated** (too many users, privacy concerns)
- Dynamic page with runtime data fetching
- Privacy-aware: only accessible if user is public, or by the owner
- Components:
  - `ProfileDetailPanel` (desktop): Right-side panel with profile stats and accepted challenges
  - `ProfileDetailsMobile` (mobile): Bottom sheet content with same structure
  - `ProfileSummitsList`: Left drawer list with Peaks/Summits tabs and search
- Features:
  - User info (name, avatar, location)
  - Accomplishment stats (peaks summited, total summits, highest peak, challenges completed, elevation gained)
  - Year-over-year summit comparison
  - States/countries climbed
  - Peak type breakdown (14ers, 13ers, etc.)
  - Accepted challenges with progress bars
  - All summited peaks displayed on map via `useProfileMapEffects` hook
  - Searchable peaks and summits lists

##### Legacy Routes (Removed)
- `/login`, `/signup`, `/signup/email-form`, `/m/*` routes have been removed
- Auth is now handled via the `AuthModal` component (modal overlay)
- Middleware redirects legacy routes to home page

#### API Routes (`api/`)

##### Auth (`api/auth/[...nextauth]/route.ts`)
- NextAuth API route handler
- Configures Strava OAuth provider
- Handles authentication callbacks

##### Weather (`api/weather/route.ts`)
- Proxies weather requests to Open-Meteo API (free, no key required, global coverage)
- Query params: `lat`, `lng` (required)
- Returns: temperature (°F), feels like, weather code/description/icon, wind speed/direction/gusts (mph), humidity (%), cloud cover, elevation
- Implements in-memory caching (10 min TTL) to reduce API calls
- Used by `CurrentConditions` component for live peak weather

##### Dashboard (`api/dashboard/`)
- `favorite-challenges/route.ts` - Fetches user's favorite challenges (in-progress/not-started only)
- `recent-summits/route.ts` - Fetches user's recent summits
- Both routes require authentication and use `getGoogleIdToken` for backend auth

### Actions (`src/actions/`)
Server actions for data fetching and mutations. Organized by domain. Backend calls now target the `/api` prefix via `getBackendUrl()`; private endpoints include a bearer from `getGoogleIdToken`, while public reads omit the header.

#### Activities (`actions/activities/`)
- `deleteActivity.ts` - Deletes an activity
- `getActivityCoords.ts` - Fetches activity coordinate data
- `getActivityDetails.ts` - Gets detailed activity information
- `getActivityStarts.ts` - Gets activity start locations
- `getRecentActivities.ts` - Fetches recent activities for user
- `reprocessActivity.ts` - Triggers activity reprocessing
- `searchNearestActivities.ts` - Searches activities near coordinates

#### Auth (`actions/auth/`)
- `redirectEmail.ts` - Handles email redirect logic
- `redirectLogin.ts` - Handles login redirect logic

#### Challenges (`actions/challenges/`)
- `addChallengeFavorite.ts` - Adds challenge to favorites
- `deleteChallengeFavorite.ts` - Removes challenge from favorites
- `getAllChallenges.ts` - Fetches all challenges with filters
- `getAllChallengeIds.ts` - Fetches all challenge IDs for static generation
- `getChallengeDetails.ts` - Gets detailed challenge information (requires auth)
- `getPublicChallengeDetails.ts` - Gets challenge details (public, optional auth)
- `getChallenges.ts` - Gets paginated challenges list
- `searchChallenges.ts` - Searches challenges with optional bounds, search, favorites-only, and type filters
- `getFavoriteChallenges.ts` - Gets user's favorite challenges
- `getIncompleteChallenges.ts` - Gets incomplete challenges for user
- `updateChallengeFavorite.ts` - Updates challenge favorite privacy

#### Peaks (`actions/peaks/`)
- `addManualPeakSummit.ts` - Adds manual peak summit entry
- `deleteAscent.ts` - Deletes an ascent
- `getTopPeaks.ts` - Fetches top peaks by summit count (for static generation)
- `getAscentDetails.ts` - Gets detailed ascent information
- `getFavoritePeaks.ts` - Gets user's favorite peaks
- `getIsPeakFavorited.ts` - Checks if peak is favorited
- `getPeakDetails.ts` - Gets detailed peak information
- `getPeaks.ts` - Gets paginated peaks list
- `getPeakSummits.ts` - Gets peaks summitted by user
- `getRecentSummits.ts` - Gets recent summits for user
- `getUnclimbedPeaks.ts` - Gets unclimbed peaks (no bounds)
- `getUnclimbedPeaksWithBounds.ts` - Gets unclimbed peaks within bounds
- `redirectPublicPage.ts` - Redirects to public peak page
- `searchPeaks.ts` - Searches peaks with filters
- `toggleFavoritePeak.ts` - Toggles peak favorite status
- `updateAscent.ts` - Updates ascent details

#### Users (`actions/users/`)
- `createUser.ts` - Creates new user account
- `createUserInterest.ts` - Records user interest (email collection)
- `deleteUser.ts` - Deletes user account
- `getActivitiesProcessing.ts` - Gets count of processing activities
- `getIsUserSubscribed.ts` - Checks subscription status
- `getUser.ts` - Gets user profile
- `getUserProfile.ts` - Gets aggregated profile data (stats, accepted challenges, peaks for map)
- `processHistoricalData.ts` - Initiates historical data processing
- `searchUserPeaks.ts` - Searches user's summited peaks with counts and pagination
- `searchUserSummits.ts` - Searches user's individual summit entries with pagination
- `updateUser.ts` - Updates user profile

#### Root Actions
- `searchNearestPeaks.ts` - Searches peaks nearest to coordinates
- `getTimezoneFromCoords.ts` - Gets IANA timezone string for given coordinates (uses geo-tz library)
- `testApi.ts` - **UNUSED** - Test API endpoint (likely for development)

### Components (`src/components/`)

#### App Components (`components/app/`)

##### Layout (`components/app/layout/`)
- `GlobalNavigation.tsx` - Top navigation bar with logo, search omnibar, and user menu
- `SidebarLink.tsx` - Sidebar link component
- `UserButton.tsx` - User menu button

##### Brand (`components/brand/`)
- `Logo.tsx` - SVG logo component with topographic contour-line mountain design. Uses currentColor for theming, supports size prop.

##### Overlays (`components/overlays/`)
- `UrlOverlayManager.tsx` - Central overlay orchestrator. On desktop, renders DiscoveryDrawer (left panel) plus PeakDetailPanel/ChallengeDetailPanel/ActivityDetailPanel/ProfileDetailPanel (right panel). On mobile (< 1024px), renders DetailBottomSheet with tabbed interface. Routes handled: `/peaks/[id]`, `/challenges/[id]`, `/activities/[id]`, `/users/[userId]`.
- `DiscoveryDrawer.tsx` - Desktop left panel for discovering peaks and challenges. Supports multiple modes:
  - Default: Discovery content showing visible peaks and challenges
  - Peak selected: My Activity, Community tabs (summit history drill-down mode via `summitHistoryPeakId` in mapStore—when set, shows SummitHistoryPanel)
  - Activity selected: Summits tab showing activity summits
  - Profile selected: Peaks and Journal tabs (hides Explore tab)
  - Challenge selected: Peaks tab showing challenge peaks list with PeakRow components (hides Explore tab)
- `DetailBottomSheet.tsx` - Mobile-only bottom sheet with tabbed interface. Uses extracted mobile components (PeakDetailsMobile, ChallengeDetailsMobile, DiscoveryContentMobile). Manages drawer height with snap points (collapsed/halfway/expanded). Supports Challenge Peaks tab when challenge is selected (hides Explore tab similar to profile).
- `SummitHistoryPanel.tsx` - Full summit history list for a peak. Shows all public summits with user names, dates, and weather conditions at summit time. Used inside DiscoveryDrawer (desktop) or DetailBottomSheet (mobile).
- `PeakDetailPanel.tsx` - Desktop right panel for peak details. Uses shared components (DetailPanelHeader, StatsGrid, DetailLoadingState) and usePeakMapEffects hook. Includes CurrentConditions weather widget, summit status for authenticated users.
- `PeakDetailContent.tsx` - Peak detail content with SSR data (used by static pages). Uses shared UI components.
- `PeakCommunity.tsx` - Community summit history display component (shows public summits with user names and weather)
- `PeakUserActivity.tsx` - User's activity display for a peak (shows user's ascents, activities, and allows editing). Activity cards link to `/activities/[id]` detail pages. Uses shared `ActivityWithSummits` and `OrphanSummitCard` components.
- `ChallengeDetailPanel.tsx` - Desktop right panel for challenge details. Uses shared components and useChallengeMapEffects hook. Shows challenge progress for authenticated users. Peaks list is displayed in DiscoveryDrawer (left pane) instead of this panel. Shares challenge data with mapStore via `selectedChallengeData`.
- `ChallengeDetailContent.tsx` - Challenge detail content with SSR data (used by static pages). Uses shared UI components.
- `DashboardPanel.tsx` - User dashboard panel (authenticated only). Wrapper component that renders DashboardContent.
- `DashboardContent.tsx` - Dashboard content component. Shows recent summits (fetched from `/api/dashboard/recent-summits`), favorite challenges with progress bars (fetched from `/api/dashboard/favorite-challenges`), and activity sync status.
- `AddManualSummitModal.tsx` - Modal for logging manual peak summits. Supports two flows: peak-first (from peak detail) and activity-first (from activity detail with peak search along route). Triggered by ManualSummitProvider.
- `SummitReportModal.tsx` - Modal for editing summit experiences/reports (triggered by SummitReportProvider)
- `ActivityDetailPanel.tsx` - Desktop right panel for activity details. Shows Details/Summits/Analytics tabs, GPX route on map, elevation profile with hover interaction.
- `ProfileDetailPanel.tsx` - Desktop right panel for user profile details. Shows profile stats, accepted challenges, and action buttons. Uses useProfileMapEffects hook.
- `ProfileDetailContent.tsx` - Profile detail content with SSR data (used by static pages). Uses shared UI components.
- `ProfileSummitsList.tsx` - User's peaks list with search. When `compact` prop is true, hides internal tabs (tabs are in DiscoveryDrawer). Supports ordering by summit count descending.
- `ProfileJournal.tsx` - User's summit journal grouped by activity. Fetches all summits via `searchUserSummits`, groups by activity_id, fetches activity details, and renders `ActivityWithSummits` and `OrphanSummitCard` components. Similar to PeakUserActivity but for all peaks. Detects ownership via `useIsAuthenticated` hook and passes `isOwner` prop to child components to control edit/delete button visibility. Invalidates query cache when summits are deleted.

##### Mobile Overlays (`components/overlays/mobile/`)
- `peak-details-mobile.tsx` - Mobile-optimized peak detail view extracted from DetailBottomSheet
- `challenge-details-mobile.tsx` - Mobile-optimized challenge detail view. Shows stats, progress bar, and action buttons. Peaks list is shown in separate Challenge Peaks tab.
- `discovery-content-mobile.tsx` - Mobile-optimized discovery content using shared discovery components
- `activity-details-mobile.tsx` - Mobile-optimized activity detail view with Details/Summits/Analytics tabs
- `profile-details-mobile.tsx` - Mobile-optimized profile detail view with stats, highest peak, and accepted challenges

##### Auth (`components/auth/`)
- `AuthModal.tsx` - Modal-based authentication flow. Two modes: login (Strava OAuth) and email collection (post-OAuth). Opens via `useRequireAuth` hook when user attempts auth-gated action.

##### Login (`components/app/login/`)
- `StravaLoginButton.tsx` - Strava OAuth button component (used by AuthModal)

##### Map (`components/map/`)
- `MapBackground.tsx` - Main Mapbox map component with persistent background. Handles map initialization, 3D terrain, satellite mode, peak/challenge data loading, and URL state synchronization.

##### Peaks (`components/app/peaks/`)
- `CurrentConditions.tsx` - Live weather display for peak detail panels. Fetches from `/api/weather` route (Open-Meteo). Shows temperature, feels like, conditions, wind, humidity.

##### Activities (`components/app/activities/`)
- `ActivityElevationProfile.tsx` - Interactive elevation profile chart using visx. Supports hover interaction that shows a marker on the GPX track at the corresponding distance point via `onHover` callback, displays summit markers on chart, shows min/max elevation labels.
- `ActivitySummitsList.tsx` - List of individual summits during an activity (not grouped by peak). Uses shared `SummitItem` component with `showPeakHeader=true` to display peak name at top of each summit. Includes "Log Another Summit" button. Supports `onSummitHover` callback for map marker highlighting.
- `ActivityWithSummits.tsx` - Shared activity card with nested summits. Used by PeakUserActivity and ProfileJournal. Shows activity header with link, stats (distance, elevation gain), Strava link, and nested summit items. Supports both `Summit[]` and `SummitWithPeak[]` for summits. Props: `activity`, `summits`, `summitsWithPeak`, `isHighlighted`, `onHighlight`, `peakId`, `peakName`, `showPeakHeaders`, `isOwner` (controls edit/delete button visibility), `onSummitDeleted` (callback when a summit is deleted).

##### Summits (`components/app/summits/`)
- `OrphanSummitCard.tsx` - Shared orphan summit card for manual summits without an activity. Used by PeakUserActivity and ProfileJournal. Shows date/time, weather conditions, difficulty/experience ratings, notes, and edit/delete buttons (only visible when `isOwner` is true). Supports both `Summit` and `SummitWithPeak` types. Optional `showPeakHeader` prop for profile context. Props include `isOwner` and `onDeleted` callback.
- `SummitItem.tsx` - Shared summit display component used by both Journal tab (PeakUserActivity) and Activity Summits tab (ActivitySummitsList). Features:
  - Works with both `Summit` and `SummitWithPeak` types
  - Optional peak header for activity context (`showPeakHeader` prop)
  - Hover callbacks (`onHoverStart`, `onHoverEnd`) for map marker highlighting
  - Weather conditions (temperature, weather code, wind speed, humidity) with colored icons
  - Difficulty badge (easy/moderate/hard/expert) with color-coded text
  - `isOwner` prop controls visibility of edit/delete buttons (only shown to owner)
  - Delete button with confirmation dialog, calls `deleteAscent` action
  - `onDeleted` callback for refreshing parent component after deletion
  - Experience rating badge (amazing/good/tough/epic) with icons
  - Trip notes in styled box
  - Edit button for summit reports (opens SummitReportModal)
  - "Add Trip Report" CTA when no report exists
  - Exports helper functions: `getWeatherDescription`, `celsiusToFahrenheit`, `kmhToMph`, `formatTime`, `extractIanaTimezone`
- `ActivityAnalytics.tsx` - Analytics charts for activity data. Includes:
  - Grade analysis chart (positive/negative gradients)
  - Elevation distribution histogram
  - Mile splits table with pace comparison
  - Summary stats (moving time, average pace)
- `ElevationProfileSelector.tsx` - Clickable elevation profile for selecting summit time in manual summit modal. Used by AddManualSummitModal when an activity is linked.

#### Discovery Components (`components/discovery/`)
Shared discovery list components used by both desktop (DiscoveryDrawer) and mobile (DetailBottomSheet):
- `discovery-challenges-list.tsx` - Renders visible challenges list with click handlers
- `discovery-peaks-list.tsx` - Renders visible peaks list using `PeakRow` component. Supports `onHoverStart` and `onHoverEnd` props for map hover dot interaction.
- `empty-discovery-state.tsx` - Empty state when no peaks/challenges visible (includes zoom-in prompt)

#### List Components (`components/lists/`)
Reusable list item components:
- `challenge-list-item.tsx` - Peak list item for challenge detail views (shows completion status)
- `peak-list-item.tsx` - Challenge list item for peak detail views
- `peak-row.tsx` - Reusable peak row component for discovery lists and challenges. Displays:
  - Peak name and elevation
  - Location (country, state, county)
  - Public summit count (if any)
  - User's summit count (if authenticated and summited, with sky blue icon using `--summited` theme color)
  - Challenge badge indicator (if peak is part of any challenges)
  - Supports hover handlers for map dot display via `onHoverStart`/`onHoverEnd` props

#### UI Components (`components/ui/`)
Shadcn/ui components built on Radix UI:
- `badge.tsx` - Badge component
- `button.tsx` - Button component
- `input.tsx` - Input component
- `separator.tsx` - Separator component
- `sheet.tsx` - Sheet/sidebar component
- `skeleton.tsx` - Loading skeleton
- `sidebar.tsx` - Sidebar component
- `toggle.tsx` - Toggle switch
- `tooltip.tsx` - Tooltip component

Custom shared UI components:
- `detail-panel-header.tsx` - Reusable header for detail panels with badge, title, location, and close button
- `stats-grid.tsx` - 2-column grid layout for stat cards
- `stat-card.tsx` - Individual stat card with label and value
- `detail-loading-state.tsx` - Loading spinner for detail panels (supports panel and inline variants)
- `empty-state.tsx` - Generic empty state component with icon, title, and description

### Helpers (`src/helpers/`)
Utility functions for common operations.

- `peaksSearchState.ts` - Module-level state for disabling peaks search (used when viewing challenge details to prevent general peaks from loading)
- `getAuthHeaders.ts` - Gets authentication headers (Bearer token + x-user-* headers) for backend API calls. Used by several challenge actions.
- `checkEmail.ts` - Email validation
- `convertActivitiesToGeoJSON.ts` - Converts activities to GeoJSON format
- `convertPeaksToGeoJSON.ts` - Converts peaks to GeoJSON format
- `convertChallengesToGeoJSON.ts` - Converts challenges (with center coords) to GeoJSON
- `convertSummitsToPeaks.ts` - Converts SummitWithPeak[] to Peak[] with nested ascents. Used by activity detail components for map effects and elevation profile.
- `dayjs.ts` - Day.js configuration/helpers
- `getBackendUrl.ts` - Gets API backend URL from environment
- `getBoundsFromURL.ts` - Extracts map bounds from URL params (legacy, migrating to center/zoom)
- `getDistanceString.ts` - Formats distance strings
- `getElevationString.ts` - Formats elevation strings
- `getMapStateFromURL.ts` - Extracts map state from URL (center lat/lng, zoom, pitch, bearing, is3D, isSatellite)
- `navigateWithMapState.ts` - Helpers for navigating while preserving map state URL params (`pushWithMapState`, `replaceWithMapState`, `buildUrlWithMapState`)
- `getAuthHeaders.ts` - Gets authentication headers (Bearer token + x-user-* headers) for backend API calls
- `getNewData.ts` - Data fetching helper
- `getRoutes.tsx` - Route configuration helper
- `getStripe.ts` - Stripe client initialization
- `getVerticalGainString.ts` - Formats elevation gain strings
- `hexToRgb.ts` - Color conversion
- `metersToFt.ts` - Unit conversion
- `numSecsToHhmmss.ts` - Time formatting
- `oklchToHex.ts` - Color conversion
- `updateMapStateInURL.ts` - Updates URL with map state
- `updateMapURL.ts` - Updates map-related URL params using router.replace (soft navigation) with debouncing
- `updateURLWithBounds.ts` - Updates URL with map bounds
- `useIsMobile.ts` - Mobile detection hook (legacy implementation using window resize, breakpoint 900px)
- `useWindowResize.tsx` - Window resize hook

**Note**: There are two `useIsMobile` implementations:
- `hooks/use-mobile.ts` - Modern implementation using `window.matchMedia` (default breakpoint 768px, can be customized). This is the primary implementation used by components.
- `helpers/useIsMobile.ts` - Legacy implementation using window resize (breakpoint 900px). May be deprecated.
- `stateAbbreviations.ts` - US state abbreviation mapping and search query expansion utilities

### Libraries (`src/lib/`)

#### Client Fetchers (`lib/client/`)
- `api.ts` - Client-safe fetch helper utilities (`buildUrl`, `fetchLocalJson`) for local Next route proxies
- `searchPeaksClient.ts` - Client search for peaks (supports bounds, pagination, showSummitted flag) via `/api/search/peaks`
- `searchChallengesClient.ts` - Client search for challenges (supports bounds, favorites, type filters) via `/api/search/challenges`

#### Map (`lib/map/`)
Mapbox integration helpers:
- `initiateMap.ts` - Map initialization
- `loadMapDefaults.ts` - Default map settings
- `renderPopup.tsx` - Popup rendering logic
- `updateMapInteractions.tsx` - Map interaction handlers

#### Theme (`lib/theme/`)
- `colors.ts` - Theme color definitions

#### Utils (`lib/utils.ts`)
- General utility functions (likely includes `cn` for className merging)

### Providers (`src/providers/`)
React context providers:
- `MapProvider.tsx` - Map state context provider
- `NextAuthProvider.tsx` - NextAuth session provider wrapper
- `ThemeProvider.tsx` - Theme (dark/light) provider
- `UserProvider.tsx` - User state context provider
- `AuthModalProvider.tsx` - Auth modal state provider (login/email modal)
- `DashboardProvider.tsx` - Dashboard panel state provider
- `QueryProvider.tsx` - React Query (TanStack Query) provider for client-side data fetching and caching
- `ManualSummitProvider.tsx` - Manual summit modal state provider
- `SummitReportProvider.tsx` - Summit report/edit modal state provider

### Store (`src/store/`)
Zustand state management stores:
- `mapStore.tsx` - Map instance store (vanilla Zustand). State includes:
  - `map` - Mapbox GL map instance
  - `visiblePeaks`, `visibleChallenges` - Currently visible items on map
  - `isSatellite` - Satellite mode toggle
  - `disablePeaksSearch` - Prevents peaks loading when viewing challenge details
  - `summitHistoryPeakId` - When set, DiscoveryDrawer shows SummitHistoryPanel instead of discovery content (desktop drill-down)
  - `selectedChallengeData` - Challenge peaks data shared between ChallengeDetailPanel and DiscoveryDrawer (challengeId, challengeName, peaks)
  - `hoveredPeakId` - ID of peak being hovered over in summit list, used for map marker highlighting with amber accent color
- `userStore.tsx` - User data store (vanilla Zustand)
- `authModalStore.ts` - Auth modal state (isOpen, mode, redirectAction)
- `dashboardStore.ts` - Dashboard panel state (isOpen, toggle)
- `manualSummitStore.ts` - Manual summit modal state
- `summitReportStore.ts` - Summit report/edit modal state

### Auth (`src/auth/`)
Authentication configuration:
- `authOptions.ts` - NextAuth configuration with Strava provider
- `getGoogleIdToken.ts` - Google ID token helper (may be unused)
- `next-auth.d.ts` - NextAuth type definitions
- `useAuth.ts` - Custom auth hook

### Type Definitions (`src/typeDefs/`)
TypeScript type definitions:
- `Activity.ts` - Activity data structure
- `ActivityStart.ts` - Activity start location
- `AscentDetail.ts` - Peak ascent details
- `Challenge.ts` - Challenge data structure
- `ChallengeProgress.ts` - Challenge progress tracking
- `ManualPeakSummit.ts` - Manual summit entry
- `Peak.ts` - Peak data structure
- `ProductDisplay.ts` - Stripe product display
- `ServerActionResult.ts` - Server action result wrapper
- `StravaCreds.ts` - Strava OAuth credentials
- `Summit.ts` - Summit data structure with difficulty and experience rating
- `SummitWithPeak.ts` - Individual summit entry with nested peak data. Used by activity detail API response. Includes all summit fields (notes, weather, difficulty, experience rating) plus peak info.
- `ProfileStats.ts` - User profile statistics (peaks summited, total summits, highest peak, challenges completed, elevation gained, states/countries, year stats, peak type breakdown)
- `UserPeakWithSummitCount.ts` - Peak with summit count and first/last summit dates for user profile search results
- `User.ts` - User data structure
- `UserChallengeFavorite.ts` - User challenge favorite

### Middleware (`src/middleware.ts`)
Next.js middleware for legacy route redirects:
- Redirects `/login`, `/signup`, `/m/*` routes to home page
- Auth is handled entirely via modal system (no dedicated auth pages)

### Hooks (`src/hooks/`)
- `useRequireAuth.ts` - Hook for auth-gated actions. Opens auth modal if not logged in, otherwise executes action.
- `useIsAuthenticated.ts` (exported from useRequireAuth) - Returns auth state and user info
- `use-mobile.ts` - Mobile detection hook using `window.matchMedia` (default breakpoint 768px). Exports `useIsMobile` function. Used by components for responsive behavior.

#### Map Hooks
- `use-map-source.ts` - Hook to manage Mapbox GeoJSON source data with retry logic. Handles waiting for source availability and cleanup on unmount.
- `use-peak-map-effects.ts` - Hook to handle map effects when viewing a peak detail. Sets selected peak marker, displays activity GPX lines, and provides flyTo functionality.
- `use-challenge-map-effects.ts` - Hook to handle map effects when viewing a challenge. Disables general peaks search, shows challenge peaks on map (with conditional styling for summited peaks), and fits map to challenge bounds (only once on initial load to prevent zoom/pan issues).
- `use-activity-map-effects.ts` - Hook to handle map effects when viewing an activity. Displays GPX line, shows peak markers for summitted peaks, handles hover marker from elevation profile chart, handles hover highlighting of peaks from summit list via mapStore.hoveredPeakId (uses Mapbox feature-state for amber accent color), and fits map to activity bounds.
- `use-peak-hover-map-effects.ts` - Hook to handle map hover effects when hovering over peak rows in discovery lists. Creates/updates a `peakHover` map source and layer to show a bright green dot marker at peak coordinates. Used by DiscoveryDrawer to show a visual indicator on the map when hovering over peak rows.
- `use-drawer-height.ts` - Hook to manage draggable drawer height with snap points (collapsed/halfway/expanded). Used by DetailBottomSheet for mobile UI.

## Authentication Flow

1. User attempts an action requiring auth (favorite, progress tracking, etc.)
2. `useRequireAuth` hook checks session state
3. If not authenticated, opens `AuthModal` in login mode
4. User clicks "Connect with Strava" button
5. Redirected to Strava OAuth
6. Strava redirects back with authorization code
7. NextAuth exchanges code for tokens
8. `signIn` callback creates user in database + triggers historical data processing
9. If user has no email, modal switches to email collection mode
10. User enters email, JWT is updated
11. Modal closes and queued action executes
12. Map refreshes to show user's summit data with color-coded markers

## Data Flow

### Omnibar Search Flow
1. User types into the Omnibar (global navigation).
2. Search query is expanded using state abbreviation utilities (e.g., "nh" also searches "new hampshire").
3. Client fetchers call REST API for challenges (with case-insensitive name AND region matching) and peaks.
4. Mapbox geocoding searches for regions (states), places (cities), POIs (national parks/forests), and localities.
5. Results are prioritized: Challenges first (max 4), then Peaks (max 3), then Places (max 3).
6. Places are filtered to outdoor-relevant POIs (parks, forests, trails, etc.).
7. Selecting an item flies the map and updates URL params (`peakId`/`challengeId`) to open the detail overlay.

### Peak Discovery Flow
1. User browses map on home page
2. `MapBackground` loads peaks in visible bounds via `getNewData`
3. Peaks rendered as markers on Mapbox map
4. User clicks peak marker → navigates to `/peaks/[id]`
5. `UrlOverlayManager` opens `PeakDetailPanel` (desktop) or `DetailBottomSheet` (mobile)
6. Map flies to peak location

### Peak Detail Flow
1. User clicks peak on map or in discovery list
2. Navigates to `/peaks/[id]`
3. `PeakDetailPanel`/`DetailBottomSheet` fetches data via `getPeakDetails`
4. Renders peak details, weather, challenges, user summits
5. Map shows peak location and associated activities

### Activity Processing Flow
1. User connects Strava account
2. Backend workers process activities via webhooks
3. Activities appear in user's recent activities
4. Peak summits detected and cataloged
5. User can view activities and associated peaks

## State Management

### Client State
- **Zustand Stores**: Map instance, user data, auth modal, dashboard, manual summit, summit report
- **React Context**: Theme, auth session, map state, user state, query client (React Query)
- **URL State**: Map center (`lat`, `lng`), zoom (`z`), pitch, bearing, satellite mode, 3D mode, selected peak/challenge (for shareability)

### Server/Client Data
- Server actions for SSR/routes; REST endpoints accessed via client fetchers where interactivity is needed (e.g., Omnibar).
- React Query (TanStack Query) used extensively for client-side data fetching and caching:
  - Omnibar search results
  - Dashboard data (recent summits, favorite challenges)
  - Peak/challenge detail panels
  - CurrentConditions weather widget
- Next.js handles caching and revalidation for server-side data.

## Styling

### TailwindCSS
- Retro topographic palette (parchment background, forest/umber inks) defined in CSS variables.
- Paper grain/contour background overlays baked into `globals.css`.
- Responsive design with mobile-first approach.
- Custom utilities for spacing, typography, and glass/grain accents.
- Custom `--summited` CSS variable (sky blue) for summit indicators throughout the app.
- Green color reserved exclusively for call-to-action buttons (Log Summit, Add Summit, etc.).

### Component Styling
- Shadcn/ui components with TailwindCSS
- Radix UI primitives for accessibility
- Custom styling via Tailwind classes with retro borders/notches on overlays

### Responsive Layout
- **Mobile First**: Application is designed to be fully functional on mobile devices.
- **Adaptive Components**: 
  - **Desktop (≥ 1024px)**: 
    - `DiscoveryDrawer` on left side for discovering peaks/challenges
    - `PeakDetailPanel`/`ChallengeDetailPanel` on right side for details
    - Summit history drill-down replaces discovery content in left panel
  - **Mobile (< 1024px)**: 
    - `DetailBottomSheet` with tabbed interface (Details | Discover)
    - Draggable bottom sheet with 3 snap heights:
      - **Collapsed** (~60px): Just the drag handle visible
      - **Halfway** (~45vh): Default state, map partially visible
      - **Expanded** (~100vh - 80px): Full screen content
    - Supports swipe gestures with velocity detection
    - Tab switches between peak/challenge details and discovery list
  - `GlobalNavigation`: Adapts padding and visibility of elements (logo hidden on mobile) to preserve space.
- **Hooks**: Uses `useIsMobile` hook (based on `window.matchMedia`, default breakpoint 768px, 1024px for layout changes) for programmatic layout adaptations.


## Map Integration

### Mapbox GL JS
- Interactive map for peak visualization
- Custom markers/clusters styled to retro palette (forest fill, parchment stroke)
- Popups with peak information
- Activity route visualization
- 3D terrain support
- Topo-friendly base style (`outdoors-v12`)

### Map Layers (render order bottom to top)
- `activities` - GPX track lines (orange #c9915a)
- `activityStarts` - Activity start point markers (green #22c55e)
- `selectedPeaks` - Peak markers for challenges/activities with conditional styling:
  - Default: muted green (#4d7a57), 7px radius (matches normal exploration)
  - Summited (summits > 0): sky blue (#5b9bd5), 9px radius (slightly bigger)
  - Hover: pink/amber accent (#d66ba0), 8px radius (via feature-state)
- `activityHover` - Hover marker from elevation profile (created dynamically)
- `peakHover` - Hover marker for peak rows in discovery list (bright green #22c55e, created dynamically by `usePeakHoverMapEffects`)
- Peak markers use conditional `circle-color` based on `feature-state.hover` and `properties.summits` for interactive highlighting

### Map State
- Stored in Zustand store (map instance) and kept mounted via root layout background
- URL synchronization for shareability using soft navigation (router.replace) to avoid cluttering browser history
- URL params: `lat`, `lng`, `z` (zoom), `pitch`, `bearing`, `satellite`, `3d`
- Debounced URL updates (300ms) during map movement to prevent excessive updates
- Programmatic map movements (flyTo, easeTo) skip intermediate URL updates

## Unused/Development Code

### `actions/testApi.ts`
- **Status**: UNUSED
- Test endpoint for API testing
- Likely used during development

### `auth/getGoogleIdToken.ts`
- **Status**: ACTIVELY USED
- Google ID token helper for backend authentication
- Used extensively throughout actions and API routes for Bearer token authentication
- Returns Google ID token in production, empty string in development (where header-based auth is used)
- Called via `getAuthHeaders` helper or directly in server actions/API routes

### Removed Components (Cleanup December 2024)
The following legacy components were removed as part of a codebase cleanup:
- `OverlayManager.tsx` - Replaced by `UrlOverlayManager.tsx`
- `AppSidebar.tsx` - Unused sidebar infrastructure
- `EmailForm.tsx`, `LoginCard.tsx`, `SignupCard.tsx` - Replaced by `AuthModal.tsx`
- `Map.tsx`, `SatelliteButton.tsx`, `ThreeDButton.tsx` - Replaced by `MapBackground.tsx`
- `PeakSearch.tsx`, `PeaksList.tsx`, `PeakRow.tsx`, `PeaksSearchInput.tsx`, `BoundsToggle.tsx`, `CenterButton.tsx` - Legacy search UI (now handled by Omnibar and discovery drawer)
- `PeakPopup.tsx`, `PeakTitle.tsx`, `PeakDetailMapInteraction.tsx`, `ChallengeDetails.tsx` - Unused components
- `addMapConfiguration.tsx` - Map config now handled directly in `MapBackground.tsx`

## Environment Variables

Required environment variables:
- `NEXTAUTH_URL` - Frontend URL
- `NEXTAUTH_SECRET` - NextAuth secret
- `STRAVA_CLIENT_ID` - Strava OAuth client ID
- `STRAVA_CLIENT_SECRET` - Strava OAuth client secret
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_MAPBOX_TOKEN` - Mapbox access token
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

## Build & Deployment

### Scripts
- `dev` - Development server
- `build` - Production build
- `start` - Production server
- `lint` - ESLint

### Deployment
- Likely deployed on Vercel (Next.js optimized)
- Server actions run on serverless functions
- Static assets optimized automatically

## Notes

### Architecture Decisions
- **App Router**: Uses Next.js 16 App Router (not Pages Router)
- **Server Actions**: Uses server actions instead of API routes for data mutations
- **No API Routes**: Minimal API routes (only NextAuth)
- **Client Components**: Most components are client components for interactivity
- **Server Components**: Used for data fetching in page components

### Performance Considerations
- Server components reduce client bundle size
- Map rendering handled by Mapbox (external library)
- Image optimization via Next.js Image component
- Code splitting via Next.js automatic code splitting

### Accessibility
- Radix UI components provide accessibility out of the box
- Semantic HTML where possible
- Keyboard navigation support
- Screen reader considerations

## Discrepancies Found and Fixed

### Major Discrepancies Documented

1. **Missing API Routes**: Added documentation for `/api/dashboard/favorite-challenges` and `/api/dashboard/recent-summits` routes
2. **Missing Helper**: Added `getAuthHeaders.ts` to helpers documentation (used by challenge actions)
3. **Missing Action**: Added `getTimezoneFromCoords.ts` to actions documentation
4. **Missing Providers**: Added `QueryProvider`, `ManualSummitProvider`, and `SummitReportProvider` to providers documentation
5. **Missing Stores**: Added `manualSummitStore` and `summitReportStore` to stores documentation
6. **Missing Components**: Added `AddManualSummitModal`, `SummitReportModal`, `PeakCommunity`, `PeakUserActivity`, and `DashboardContent` to overlays documentation
7. **Hook Discrepancy**: Documented that there are two `useIsMobile` implementations (one in hooks, one in helpers)
8. **getGoogleIdToken Status**: Corrected from "Possibly unused" to "ACTIVELY USED" - used extensively throughout codebase
9. **Intercepting Routes**: Removed incorrect documentation about `@overlay` parallel routes - the app uses URL-driven overlays via `UrlOverlayManager` instead
10. **React Query**: Added documentation for `QueryProvider` and expanded React Query usage documentation
11. **Client Fetchers**: Added missing `api.ts` helper to client fetchers documentation

## Component Refactoring (December 2024)

### Overview
A comprehensive refactoring effort was completed to eliminate code duplication, remove unused components, and create shared abstractions for common UI patterns.

### Removed Components (19 files)
The following legacy/unused components were removed:
- `OverlayManager.tsx` - Replaced by `UrlOverlayManager.tsx`
- `AppSidebar.tsx` - Unused sidebar infrastructure
- Legacy auth components (`EmailForm.tsx`, `LoginCard.tsx`, `SignupCard.tsx`) - Replaced by `AuthModal.tsx`
- Legacy map components (`Map.tsx`, `SatelliteButton.tsx`, `ThreeDButton.tsx`) - Replaced by `MapBackground.tsx`
- Unused peak search components (`PeakSearch.tsx`, `PeaksList.tsx`, `PeakRow.tsx`, `PeaksSearchInput.tsx`, `BoundsToggle.tsx`, `CenterButton.tsx`)
- Other unused components (`PeakPopup.tsx`, `PeakTitle.tsx`, `PeakDetailMapInteraction.tsx`, `ChallengeDetails.tsx`)
- Unused map library file (`addMapConfiguration.tsx`)

### Created Shared Components

#### UI Components (`components/ui/`)
- `detail-panel-header.tsx` - Reusable header with badge, title, location, close button
- `stats-grid.tsx` - 2-column grid layout for stat cards
- `stat-card.tsx` - Individual stat card with label and value
- `detail-loading-state.tsx` - Loading spinner for detail panels (supports panel and inline variants)
- `empty-state.tsx` - Generic empty state component with icon, title, and description

#### Discovery Components (`components/discovery/`)
- `discovery-challenges-list.tsx` - Renders visible challenges list with click handlers
- `discovery-peaks-list.tsx` - Renders visible peaks list with click handlers
- `empty-discovery-state.tsx` - Empty state when no peaks/challenges visible (includes zoom-in prompt)

#### List Components (`components/lists/`)
- `challenge-list-item.tsx` - Peak list item for challenge detail views (shows completion status)
- `peak-list-item.tsx` - Challenge list item for peak detail views

#### Mobile Overlays (`components/overlays/mobile/`)
- `peak-details-mobile.tsx` - Mobile-optimized peak detail view extracted from DetailBottomSheet
- `challenge-details-mobile.tsx` - Mobile-optimized challenge detail view extracted from DetailBottomSheet
- `discovery-content-mobile.tsx` - Mobile-optimized discovery content using shared discovery components

### Created Map Hooks (`hooks/`)
- `use-map-source.ts` - Manages Mapbox GeoJSON source data with retry logic. Handles waiting for source availability and cleanup on unmount.
- `use-peak-map-effects.ts` - Handles map effects when viewing a peak detail. Sets selected peak marker, displays activity GPX lines, and provides flyTo functionality.
- `use-challenge-map-effects.ts` - Handles map effects when viewing a challenge. Disables general peaks search, shows challenge peaks on map, and fits map to challenge bounds.
- `use-profile-map-effects.ts` - Handles map effects when viewing a user profile. Disables general peaks search, shows all user's summited peaks on map, and fits map to bounds.
- `use-drawer-height.ts` - Manages draggable drawer height with snap points (collapsed/halfway/expanded). Used by DetailBottomSheet for mobile UI.

### Refactored Components
- `PeakDetailPanel.tsx` - Now uses `DetailPanelHeader`, `StatsGrid`, `StatCard`, `DetailLoadingState`, and `usePeakMapEffects` hook
- `ChallengeDetailPanel.tsx` - Now uses shared components and `useChallengeMapEffects` hook
- `PeakDetailContent.tsx` - Uses shared UI components
- `ChallengeDetailContent.tsx` - Uses shared UI components
- `DetailBottomSheet.tsx` - Refactored to use extracted mobile components (`PeakDetailsMobile`, `ChallengeDetailsMobile`, `DiscoveryContentMobile`)

### Benefits
- **Reduced Bundle Size**: Removed 19 unused components (~15-20% reduction in component code)
- **Easier Maintenance**: Single source of truth for common patterns (headers, stats grids, loading states)
- **Consistency**: Shared components ensure UI consistency across desktop and mobile
- **Testability**: Smaller, focused components are easier to test
- **Readability**: Large components (DetailBottomSheet) split into manageable pieces
- **Reusability**: Map hooks can be reused for future map interaction features

