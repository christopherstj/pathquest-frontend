# PathQuest Frontend Architecture

## Overview
PathQuest Frontend is a Next.js 14 application built with React, TypeScript, and TailwindCSS. It provides a modern web interface for users to explore mountain peaks, track their summits, view challenges, and manage their Strava-connected activities.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
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
Next.js 14 App Router structure with route groups and parallel routes.

#### Root Layout (`layout.tsx`)
- Provides theme provider (dark mode by default, retro topo palette)
- NextAuth session provider
- Persistent MapProvider with Mapbox background (map stays mounted while overlays change)
- Analytics integration (Vercel Analytics)
- Global fonts configuration (Fraunces + IBM Plex Mono)
- Parallel route slot `@overlay` for intercepted routes (peak/challenge details)

#### Static Detail Pages with Intercepting Routes

The peak and challenge detail pages use Next.js intercepting routes to enable:
- **SEO-friendly static pages** at `/peaks/[id]` and `/challenges/[id]`
- **Overlay UX** when navigating within the app (map stays mounted)

**Route Structure:**
```
src/app/
├── @overlay/                     # Parallel route slot for overlays
│   ├── default.tsx              # Empty default
│   ├── (.)peaks/[id]/page.tsx   # Intercepts /peaks/[id] for in-app nav
│   └── (.)challenges/[id]/page.tsx
├── peaks/[id]/page.tsx          # Static ISR page (direct URL/crawlers)
└── challenges/[id]/page.tsx     # Static ISR page (direct URL/crawlers)
```

**How it works:**
- Direct URL access (Google, shared links) → Full static page with ISR
- In-app navigation → Intercepting route shows overlay, map stays mounted
- Both share the same URL structure (`/peaks/abc123`)

**Static Generation:**
- Top 1000 peaks (by public summit count) are pre-generated at build
- All challenges are pre-generated at build
- Remaining peaks use on-demand ISR with 24-hour revalidation

#### Pages

##### `/` (Home Page)
- Landing page with hero map preview, primary CTAs (Explore map, Connect Strava), Strava branding, and featured sections (challenges, nearby peaks, how-it-works). Optimized for mobile with a short hero and quick links into `/m`.

##### `/login`
- Login page with Strava OAuth
- Uses `LoginCard` component
- Supports redirect URL parameter

##### `/signup`
- Signup page with Strava OAuth
- Uses `SignupCard` component
- Supports redirect URL parameter

##### `/signup/email-form`
- Email collection form for users without email
- Required step before accessing main app
- Middleware redirects users here if they lack email

##### `/m/peaks` (Main App - Peaks Search)
- Primary peaks browsing interface
- Uses parallel route pattern (`@content`)
- Grid layout with sidebar (commented out) and main content area
- Renders `PeakSearch` component with bounds toggle, live map-synced results, zoom-aware empty handling, and loading states

##### `/m/peaks/[id]` (Peak Detail Page - Legacy)
- Individual peak detail page (legacy route, may be deprecated)
- Shows peak information, activities, challenges, public summits
- Uses `PeakDetailMapInteraction` and `PeakTitle` components
- Fetches data via `getPublicPeakDetails` server action

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

##### `/m/layout.tsx`
- Layout for main app section (`/m/*`)
- Currently minimal (may be used for sidebar in future)

#### API Routes (`api/auth/[...nextauth]/route.ts`)
- NextAuth API route handler
- Configures Strava OAuth provider
- Handles authentication callbacks

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
- `processHistoricalData.ts` - Initiates historical data processing
- `updateUser.ts` - Updates user profile

#### Root Actions
- `searchNearestPeaks.ts` - Searches peaks nearest to coordinates
- `testApi.ts` - **UNUSED** - Test API endpoint (likely for development)

### Components (`src/components/`)

#### App Components (`components/app/`)

##### Layout (`components/app/layout/`)
- `AppSidebar.tsx` - Main sidebar navigation (currently commented out in layout)
- `GlobalNavigation.tsx` - Top navigation bar with logo, search omnibar, and user menu
- `SidebarLink.tsx` - Sidebar link component
- `UserButton.tsx` - User menu button

##### Brand (`components/brand/`)
- `Logo.tsx` - SVG logo component with topographic contour-line mountain design. Uses currentColor for theming, supports size prop.

##### Overlays (`components/overlays/`)
- `DiscoveryDrawer.tsx` - Main side drawer for discovering peaks and challenges. Adapts to a bottom sheet on mobile devices.
- `OverlayManager.tsx` - Manages the state of active overlays (legacy query param approach)
- `PeakDetailPanel.tsx` - Client component for peak detail overlay (used by intercepting routes). Shows selected peak with a larger icon (0.4 scale vs 0.2) using the `selectedPeaks` map source.
- `PeakDetailContent.tsx` - Peak detail content with SSR data (used by static pages)
- `ChallengeDetailPanel.tsx` - Client component for challenge detail overlay (used by intercepting routes). Hides regular peaks/clusters and shows only challenge peaks on the map using the `selectedPeaks` source, allowing users to see all challenge peaks mapped out.
- `ChallengeDetailContent.tsx` - Challenge detail content with SSR data (used by static pages)


##### Login (`components/app/login/`)
- `EmailForm.tsx` - Email collection form
- `LoginCard.tsx` - Login card with Strava OAuth
- `SignupCard.tsx` - Signup card with Strava OAuth
- `StravaLoginButton.tsx` - Strava OAuth button component

##### Map (`components/app/map/`)
- `Map.tsx` - Main Mapbox map component
- `SatelliteButton.tsx` - Toggle satellite map style
- `ThreeDButton.tsx` - Toggle 3D terrain

##### Peaks (`components/app/peaks/`)
- `BoundsToggle.tsx` - Toggle for showing/hiding bounds
- `CenterButton.tsx` - Button to center map on peak
- `ChallengeDetails.tsx` - Challenge information display
- `PeakDetailMapInteraction.tsx` - Map interactions for peak detail page
- `PeakPopup.tsx` - Popup displayed when clicking peak on map
- `PeakRow.tsx` - Row component for peak list
- `PeakSearch.tsx` - Main peak search interface component
- `PeaksList.tsx` - List of peaks display
- `PeaksSearchInput.tsx` - Search input for peaks
- `PeakTitle.tsx` - Peak title and metadata display

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

### Helpers (`src/helpers/`)
Utility functions for common operations.

- `peaksSearchState.ts` - Module-level state for disabling peaks search (used when viewing challenge details to prevent general peaks from loading)
- `checkEmail.ts` - Email validation
- `convertActivitiesToGeoJSON.ts` - Converts activities to GeoJSON format
- `convertPeaksToGeoJSON.ts` - Converts peaks to GeoJSON format
- `convertChallengesToGeoJSON.ts` - Converts challenges (with center coords) to GeoJSON
- `dayjs.ts` - Day.js configuration/helpers
- `getBackendUrl.ts` - Gets API backend URL from environment
- `getBoundsFromURL.ts` - Extracts map bounds from URL params
- `getDistanceString.ts` - Formats distance strings
- `getElevationString.ts` - Formats elevation strings
- `getMapStateFromURL.ts` - Extracts map state from URL
- `getNewData.ts` - Data fetching helper
- `getRoutes.tsx` - Route configuration helper
- `getStripe.ts` - Stripe client initialization
- `getVerticalGainString.ts` - Formats elevation gain strings
- `hexToRgb.ts` - Color conversion
- `metersToFt.ts` - Unit conversion
- `numSecsToHhmmss.ts` - Time formatting
- `oklchToHex.ts` - Color conversion
- `updateMapStateInURL.ts` - Updates URL with map state
- `updateMapURL.ts` - Updates map-related URL params
- `updateURLWithBounds.ts` - Updates URL with map bounds
- `useIsMobile.ts` - Mobile detection hook
- `useWindowResize.tsx` - Window resize hook
- `stateAbbreviations.ts` - US state abbreviation mapping and search query expansion utilities

### Libraries (`src/lib/`)

#### Client Fetchers (`lib/client/`)
- `api.ts` - Client-safe fetch helper for local Next route proxies.
- `searchPeaksClient.ts` - Client search for peaks (supports bounds, pagination, showSummitted flag) via `/api/search/peaks`.
- `searchChallengesClient.ts` - Client search for challenges (supports bounds, favorites, type filters) via `/api/search/challenges`.

#### Map (`lib/map/`)
Mapbox integration helpers:
- `addMapConfiguration.tsx` - Map configuration setup
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

### Store (`src/store/`)
Zustand state management stores:
- `mapStore.tsx` - Map instance store (vanilla Zustand). Includes `disablePeaksSearch` flag to prevent peaks loading when viewing challenge details.
- `userStore.tsx` - User data store (vanilla Zustand)

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
- `Summit.ts` - Summit data structure
- `User.ts` - User data structure
- `UserChallengeFavorite.ts` - User challenge favorite

### Middleware (`src/middleware.ts`)
Next.js middleware for route protection:
- Redirects logged-in users away from login/signup pages
- Redirects users without email to email form
- Redirects users with email away from email form
- Protects routes requiring authentication

## Authentication Flow

1. User clicks "Login with Strava"
2. Redirected to Strava OAuth
3. Strava redirects back with authorization code
4. NextAuth exchanges code for tokens
5. `signIn` callback creates/updates user in database
6. JWT token created with user info
7. User redirected to app (or email form if no email)

## Data Flow

### Omnibar Search Flow
1. User types into the Omnibar (global navigation).
2. Search query is expanded using state abbreviation utilities (e.g., "nh" also searches "new hampshire").
3. Client fetchers call REST API for challenges (with case-insensitive name AND region matching) and peaks.
4. Mapbox geocoding searches for regions (states), places (cities), POIs (national parks/forests), and localities.
5. Results are prioritized: Challenges first (max 4), then Peaks (max 3), then Places (max 3).
6. Places are filtered to outdoor-relevant POIs (parks, forests, trails, etc.).
7. Selecting an item flies the map and updates URL params (`peakId`/`challengeId`) to open the detail overlay.

### Peak Search Flow
1. User navigates to `/m/peaks`
2. `PeakSearch` component mounts
3. Fetches peaks via `searchPeaks` action
4. Converts to GeoJSON via `convertPeaksToGeoJSON`
5. Renders on Mapbox map
6. User interactions update URL params
7. URL changes trigger data refetch

### Peak Detail Flow
1. User clicks peak on map or in list
2. Navigates to `/m/peaks/[id]`
3. Server component fetches data via `getPublicPeakDetails`
4. Renders peak details, activities, challenges
5. Map shows peak location and associated activities

### Activity Processing Flow
1. User connects Strava account
2. Backend workers process activities via webhooks
3. Activities appear in user's recent activities
4. Peak summits detected and cataloged
5. User can view activities and associated peaks

## State Management

### Client State
- **Zustand Stores**: Map instance, user data
- **React Context**: Theme, auth session, map state, user state
- **URL State**: Map bounds, zoom, selected peak (for shareability)

### Server/Client Data
- Server actions for SSR/routes; REST endpoints accessed via client fetchers where interactivity is needed (e.g., Omnibar).
- React Query used for client-side search caching (Omnibar).
- Next.js handles caching and revalidation for server-side data.

## Styling

### TailwindCSS
- Retro topographic palette (parchment background, forest/umber inks) defined in CSS variables.
- Paper grain/contour background overlays baked into `globals.css`.
- Responsive design with mobile-first approach.
- Custom utilities for spacing, typography, and glass/grain accents.

### Component Styling
- Shadcn/ui components with TailwindCSS
- Radix UI primitives for accessibility
- Custom styling via Tailwind classes with retro borders/notches on overlays

### Responsive Layout
- **Mobile First**: Application is designed to be fully functional on mobile devices.
- **Adaptive Components**: 
  - `DiscoveryDrawer`: Transforms from a floating side panel on desktop to a draggable bottom sheet on mobile (< 1024px). The mobile version features 3 snap heights:
    - **Collapsed** (~60px): Just the drag handle visible, allowing full map exploration
    - **Halfway** (~45vh): Default state showing first items while map remains partially visible
    - **Expanded** (~100vh - 80px): Full screen content up to the search bar
    - Supports swipe gestures with velocity detection and tap-to-cycle on the handle
  - `GlobalNavigation`: Adapts padding and visibility of elements (logo hidden on mobile) to preserve space.
- **Hooks**: Uses `useIsMobile` hook (based on `window.matchMedia`) for programmatic layout adaptations.


## Map Integration

### Mapbox GL JS
- Interactive map for peak visualization
- Custom markers/clusters styled to retro palette (forest fill, parchment stroke)
- Popups with peak information
- Activity route visualization
- 3D terrain support
- Topo-friendly base style (`outdoors-v12`)

### Map State
- Stored in Zustand store (map instance) and kept mounted via root layout background
- URL synchronization for shareability
- Bounds tracking for data fetching and Omnibar search scoping

## Unused/Development Code

### `actions/testApi.ts`
- **Status**: UNUSED
- Test endpoint for API testing
- Likely used during development

### `auth/getGoogleIdToken.ts`
- **Status**: Possibly unused
- Google ID token helper (app uses Strava OAuth, not Google)

### Commented Out Code
- `AppSidebar` component is commented out in root layout
- Sidebar infrastructure exists but not currently used

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
- **App Router**: Uses Next.js 14 App Router (not Pages Router)
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

