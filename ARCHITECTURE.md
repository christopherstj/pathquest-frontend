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
- **Shared code**: `@pathquest/shared` (GitHub git-SHA dependency for shared types + API client helpers)
- **Fonts**: Fraunces (display), IBM Plex Mono (body/data)

## Project Structure

### App Router (`src/app/`)
Next.js 16 App Router structure with route groups and parallel routes.

#### Root Layout (`layout.tsx`)
- Provides theme provider (dark mode by default, retro topo palette)
- NextAuth session provider
- Persistent MapProvider (map context available app-wide)
- Analytics integration (Vercel Analytics)
- Global fonts configuration (Fraunces + IBM Plex Mono)
- **Uses `AppShell` component** to conditionally render:
  - **App routes** (`/`, `/explore`, `/peaks/*`, etc.): Map background, overlay manager, modals
  - **Standalone routes** (`/about`, `/faq`, `/contact`): Full-screen scrollable pages (no map, no overlay UI)

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
- Content rendered via `ExploreTabContent` with Details/Summits/Analytics sub-tabs
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
- Content rendered via `ExploreTabContent` with Stats/Peaks/Journal/Challenges sub-tabs
- Components:
  - `ProfileSummitsList`: Peaks list with filtering, sorting, and infinite scroll
- Features:
  - User info (name, avatar, location)
  - Accomplishment stats (peaks summited, total summits, highest peak, challenges completed, elevation gained)
  - Year-over-year summit comparison
  - States/countries climbed
  - Peak type breakdown (14ers, 13ers, etc.)
  - Accepted challenges with progress bars
  - All summited peaks displayed on map via `useProfileMapEffects` hook (only when viewing the Profile **Peaks** sub-tab)
  - Searchable peaks and summits lists

##### Standalone Pages (Full-Screen, No Map)

The following routes are **standalone pages** that render as traditional full-screen web pages without the map or overlay UI. This is handled by `AppShell`, which detects these routes and renders children directly instead of the map+overlay layout. This approach provides:
- Better SEO (clean HTML, fast LCP, no competing JS)
- Better reading experience (no map distraction, full-width content)
- Proper scrolling for long-form content and forms

###### `/about` (About Page - Static/SEO)
- Static page with SEO metadata and Schema.org `WebApplication` structured data
- Content sections: Hero, What is PathQuest, Key Features, How It Works
- Links to FAQ and Contact pages

###### `/faq` (FAQ Page - Static/SEO)
- Static page with SEO metadata and Schema.org `FAQPage` structured data for Google rich snippets
- Accordion-style FAQ organized by category: Getting Started, Strava Integration, Summit Detection, Challenges, Privacy & Data
- Client component with expand/collapse state
- Links to Contact page

###### `/contact` (Contact Page)
- Contact form with Name, Email, Message fields
- Client-side validation with error states
- Honeypot field for spam prevention
- Submits to `/api/contact` route for Resend email delivery
- Success/error states with friendly messaging

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

##### Geolocation (`api/geolocation/route.ts`)
- Returns user's location based on Vercel's built-in geo headers (IP-based)
- Returns: `{ lat, lng, city, region, country }` or `null` if unavailable
- Used by `useInitialMapLocation` hook as part of the location fallback chain
- Note: Vercel geo headers are only available in production/preview deployments, not local dev

##### Contact (`api/contact/route.ts`)
- POST endpoint for contact form submissions
- Validates name, email, message fields
- Honeypot field check for spam prevention
- Rate limiting: 5 requests per hour per IP (in-memory store)
- Sends email via Resend API with HTML and plain text versions
- Environment variables: `RESEND_API_KEY`, `CONTACT_EMAIL`

##### Dashboard (`api/dashboard/`)
- `favorite-challenges/route.ts` - Fetches user's favorite challenges (in-progress/not-started only). Now includes `lastProgressDate` and `lastProgressCount` fields.
- `recent-summits/route.ts` - Fetches user's recent summits. Now includes `hasReport` and `summitNumber` fields.
- `queue-status/route.ts` - Fetches count of activities waiting to be processed from event queue
- `import-status/route.ts` - Fetches detailed import progress: totalActivities, processedActivities, pendingActivities, summitsFound, percentComplete, estimatedHoursRemaining, status, message. Used by ImportProgressCard.
- `stats/route.ts` - Fetches dashboard quick stats (total peaks, elevation gained, summits this/last month, primary challenge progress)
- All routes require authentication. These proxy routes now call `pathquest-api` via the shared `@pathquest/shared` ApiClient (`createApiClient` + shared endpoint helpers where available) with the NextAuth session token as Bearer authentication.

##### Landing (`api/landing/`)
- `recent-public-summits/route.ts` - Fetches most recent public summits across the whole community (no auth). Used for guest landing “community is alive” feed.
- `popular-challenges/route.ts` - Fetches “popular” challenges (hybrid ordering; no popularity numbers displayed) (no auth). Used for guest landing feed.
  - These proxy routes also use the shared `@pathquest/shared` ApiClient for upstream calls for consistency.

##### Peaks (`api/peaks/`)
- `[id]/activity/route.ts` - Fetches recent summit activity counts for a peak (no auth). Used by PeakActivityIndicator.
- `[id]/public-summits/route.ts` - Fetches public summits for a peak with cursor-based pagination (no auth). Query params: `cursor` (ISO timestamp), `limit` (default 20, max 100). Returns `{ summits, nextCursor, totalCount }`. Used by PeakCommunity component for efficient infinite scrolling of peaks with hundreds of summits.

##### Summits (`api/summits/`)
- `unconfirmed/route.ts` - GET: Fetches summits that need user review (low confidence auto-detections). Optional `limit` query param.
- `[id]/confirm/route.ts` - POST: Confirms a summit as valid. Updates `confirmation_status` to `user_confirmed`.
- `[id]/deny/route.ts` - POST: Denies a summit as invalid. Updates `confirmation_status` to `denied`. Summit is kept for audit but excluded from all counts.
- `confirm-all/route.ts` - POST: Bulk confirms all unconfirmed summits for the user.
- All routes require authentication using the NextAuth session token

### Actions (`src/actions/`)
Server actions for data fetching and mutations. Organized by domain. Backend calls now target the `/api` prefix via `getBackendUrl()`; private endpoints include a bearer token from `getSessionToken` (NextAuth session JWT), while public reads omit the header.

**Static vs Dynamic Actions:**
- **Public actions** (e.g., `getPeakDetailsPublic`, `getPublicChallengeDetails`, `getTopPeaks`, `getAllChallengeIds`) - Safe for static generation (ISR). Do NOT use `useAuth()` or access cookies/headers. No authentication needed for these public endpoints.
- **Authenticated actions** (e.g., `getPeakDetails`, `getChallengeDetails`) - For runtime use only. Use `useAuth()` to get session and pass user headers. Will trigger `DYNAMIC_SERVER_USAGE` if called during static generation.

For static ISR pages (`/peaks/[id]`, `/challenges/[id]`), always use the "Public" variants. The overlay components (runtime) use the authenticated variants for user-specific data.

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
- `getAllChallengeIds.ts` - Fetches all challenge IDs for static generation (no auth)
- `getChallengeDetails.ts` - Gets detailed challenge information (authenticated, runtime only)
- `getPublicChallengeDetails.ts` - Gets challenge details for static generation (public, no auth)
- `getChallenges.ts` - Gets paginated challenges list
- `searchChallenges.ts` - Searches challenges with optional bounds, search, favorites-only, and type filters
- `getFavoriteChallenges.ts` - Gets user's favorite challenges
- `getIncompleteChallenges.ts` - Gets incomplete challenges for user
- `updateChallengeFavorite.ts` - Updates challenge favorite privacy

#### Peaks (`actions/peaks/`)
- `addManualPeakSummit.ts` - Adds manual peak summit entry
- `deleteAscent.ts` - Deletes an ascent
- `getTopPeaks.ts` - Fetches top peaks by summit count (for static generation, no auth)
- `getAscentDetails.ts` - Gets detailed ascent information
- `getFavoritePeaks.ts` - Gets user's favorite peaks
- `getIsPeakFavorited.ts` - Checks if peak is favorited
- `getPeakDetails.ts` - Gets detailed peak information (authenticated, runtime only)
- `getPeakDetailsPublic.ts` - Gets peak details for static generation (public, no auth)
- `getPeaks.ts` - Gets paginated peaks list
- `getPeakSummits.ts` - Gets peaks summitted by user
- `getRecentSummits.ts` - Gets recent summits for user
- `getUnclimbedPeaks.ts` - Gets unclimbed peaks (no bounds)
- `getUnclimbedPeaksWithBounds.ts` - Gets unclimbed peaks within bounds
- `redirectPublicPage.ts` - Redirects to public peak page
- `searchPeaks.ts` - Searches peaks with filters
- `toggleFavoritePeak.ts` - Toggles peak favorite status
- `updateAscent.ts` - Updates ascent details
- `flagPeakForReview.ts` - Flags a peak for coordinate review (sets `needs_review = true`). Calls `POST /api/peaks/:id/flag-for-review` endpoint. Used by `PeakDetailsTab` component to allow users to report incorrect peak locations.

#### Users (`actions/users/`)
- `createUser.ts` - Creates new user account
- `createUserInterest.ts` - Records user interest (email collection)
- `deleteUser.ts` - Deletes user account
- `getActivitiesProcessing.ts` - Gets count of processing activities
- `getIsUserSubscribed.ts` - Checks subscription status
- `getUser.ts` - Gets user profile
- `getUserProfile.ts` - Gets aggregated profile data (stats, accepted challenges, peaks for map)
- `getUserChallengeProgress.ts` - Gets a user's progress on a specific challenge. Returns challenge details, progress info, peaks with summit status, and user info. Used by `/users/:userId/challenges/:challengeId` page.
- `processHistoricalData.ts` - Initiates historical data processing
- `searchUserPeaks.ts` - Searches user's summited peaks with advanced filtering (state, elevation range, multiple summits), sorting (summits, elevation, recent, oldest, name), and pagination
- `getUserSummitStates.ts` - Gets list of states where user has summited peaks (for filter dropdown)
- `searchUserSummits.ts` - Searches user's individual summit entries with pagination
- `updateUser.ts` - Updates user profile. Supports: `name`, `email`, `pic`, `city`, `state`, `country`, `location_coords`, `update_description`, `is_public`

#### Photos (`actions/photos/`)
Photo upload and management actions (Stage 4):
- `getPhotoUploadUrl.ts` - Gets signed GCS URL for direct photo upload
- `completePhotoUpload.ts` - Confirms upload completion, triggers thumbnail generation
- `getSummitPhotos.ts` - Gets photos for a specific summit (owner only)
- `updatePhotoCaption.ts` - Updates photo caption
- `deletePhoto.ts` - Deletes a photo from storage and database
- `getPeakPhotos.ts` - Gets public photos for a peak with cursor-based pagination (community gallery, no auth). Supports `cursor` and `limit` params.
- `getPublicSummitPhotos.ts` - Gets public photos for a specific summit (community section, no auth). Used by `PublicSummitPhotoStrip`.

#### Root Actions
- `searchNearestPeaks.ts` - Searches peaks nearest to coordinates
- `getTimezoneFromCoords.ts` - Gets IANA timezone string for given coordinates (uses geo-tz library)

### Components (`src/components/`)

#### App Components (`components/app/`)

##### Layout (`components/app/layout/`)
- `AppShell.tsx` - **Conditional layout wrapper** that detects standalone vs app routes. For app routes (`/`, `/explore`, `/peaks/*`, etc.), renders the map background, global navigation, overlay manager, and modals. For standalone routes (`/about`, `/faq`, `/contact`), renders children as full-screen scrollable pages without map or overlay UI. This provides better SEO and reading experience for static content pages.
- `GlobalNavigation.tsx` - Top navigation bar with logo, search omnibar, and user menu. User dropdown includes Profile, Settings (opens UserManagementModal), and Logout options.
- `SidebarLink.tsx` - Sidebar link component
- `Footer.tsx` - Pane footer links (About/FAQ/Contact). Rendered at the bottom of the scrollable "display pane" (desktop side panel + mobile sheet) so it appears when the user scrolls to the bottom.

##### Brand (`components/brand/`)
- `Logo.tsx` - SVG logo component with topographic contour-line mountain design. Uses currentColor for theming, supports size prop.

##### Overlays (`components/overlays/`)
- `UrlOverlayManager.tsx` - Central overlay orchestrator. Renders platform-specific navigation layout:
  - Desktop (≥ 1024px): `DesktopNavLayout` - Collapsible side panel with same 3-tab structure as mobile
  - Mobile (< 1024px): `MobileNavLayout` - Fixed 3-tab bottom navigation with draggable content sheet
  - Both layouts use the same content components (HomeTabContent, ExploreTabContent, ProfileTabContent)
- `PeakDetailContent.tsx` - Peak detail content with SSR data (used by static pages). Uses shared UI components.
- `PeakCommunity.tsx` - Community summit history display component. Shows public summits with user names (linking to profile pages when user_id is available), weather conditions, difficulty/experience ratings as pill-style chips, and condition tags as small pills. User avatar and name are clickable links to `/users/[user_id]`. **Note**: Activity links have been removed to comply with Strava API guidelines (Strava data can only be shown to the activity owner). Public summits only display PathQuest-derived data (timestamp, notes, ratings, weather). Uses shared `PublicSummitCard`. **Uses React Query cursor-based infinite scrolling** (`useInfiniteQuery`) for efficient pagination of peaks with hundreds of summits. Fetches from `/api/peaks/[id]/public-summits` endpoint with cursor pagination.
- `PeakUserActivity.tsx` - User's activity display for a peak (shows user's ascents, activities, and allows editing). Peak **Journal** sub-tab now reuses `JournalEntryCard` styling for summit entries, but displays the **activity title** as the primary title line (owner-only; not a Strava privacy issue). Activity cards link to `/activities/[id]` detail pages.
- `PeakDetailsTab.tsx` - Peak details tab content showing current weather conditions, public land information, and challenges the peak belongs to. Used in the "Details" sub-tab of peak detail views. Shows challenge progress bars for authenticated users. Uses shared `ChallengeLinkItem`. **Public Land Section**: When a peak is within a public land (National Park, Wilderness, National Forest, etc.), displays the land name, designation type badge, and managing agency. Uses icon mapping for different land types (Landmark for parks/monuments, Trees for forests, Shield for wilderness). Includes "Flag Coordinates for Review" button (auth only) that calls `flagPeakForReview` action to set `needs_review = true` for manual review via the review tool. Shows confirmation message after successful flagging.
- `ChallengeDetailContent.tsx` - Challenge detail content with SSR data (used by static pages). Uses shared UI components.
- `DashboardPanel.tsx` - User dashboard panel (authenticated only). Wrapper component that renders DashboardContent.
- `DashboardContent.tsx` - Dashboard content component (refactored December 2024). When not authenticated, shows login CTA + a guest “community is alive” feed (recent public summits + popular challenges). When authenticated, shows a small Home sub-tab switcher (**Dashboard** / **Recent**) with the selection persisted in localStorage (`pathquest:homeSubTab`):\n+  - **Dashboard** (default): shows:
  - Queue status indicator (when activities are processing) - polls `/api/dashboard/queue-status` every 10s when items in queue
  - **Import Progress Card** - Detailed import progress when historical data is being processed. Shows progress bar, summits found, ETA. Polls every 15s.
  - **Quick Stats Bar** - 4-metric horizontal bar (total peaks, elevation gained, summits this month with trend, primary challenge progress)
  - **Hero Summit Card** - Celebratory card for most recent unreviewed summit with "Add Trip Report" CTA
  - **Unreviewed Summits Queue** - List of summits older than 72 hours without reports (max 5 items)
  - Recent summits (fetched from `/api/dashboard/recent-summits`) with `hasReport` and `summitNumber` fields
  - Favorite challenges with progress bars and last progress date (fetched from `/api/dashboard/favorite-challenges`)
  - **Recent**: shows the community feed (recent public summits + popular challenges) via `/api/landing/*` proxies.
- `AddManualSummitModal.tsx` - Modal for logging manual peak summits. Supports two flows: peak-first (from peak detail) and activity-first (from activity detail with peak search along route). Triggered by ManualSummitProvider.
- `SummitReportModal.tsx` - Modal for editing summit experiences/reports (triggered by SummitReportProvider). Features:
  - Trip notes textarea with random placeholder prompts
  - Difficulty selection (easy/moderate/hard/expert) with pill buttons
  - Experience rating (tough/good/amazing/epic) with pill buttons
  - Condition tags multi-select (clear, dry, wet, muddy, snow, icy, postholing, windy, foggy, rocky, slippery, overgrown, bushwhack, exposed) with color-coded pills
  - Custom tags input for free-form condition tags (primary green colored pills with remove button)
  - **Photos section** (Stage 4): Upload JPEG photos, edit captions, delete photos, view in lightbox
  - Saves condition_tags and custom_condition_tags to backend
  - Now requires `summitType` ("activity" | "manual") in SummitReportData for photo API calls
- `UserManagementModal.tsx` - Modal for account settings. Features:
  - Location search using Mapbox Search Box (`@mapbox/search-js-react`) configured for places/regions
  - Small Mapbox GL map preview (300x200px) showing user's location with marker
  - Email input field
  - Toggle for "Update Strava Descriptions" (update_description)
  - Toggle for "Public Profile" (is_public)
  - Delete account button with AlertDialog confirmation
  - Cancel and Save buttons
  - Triggered by UserManagementProvider
- `ProfileDetailContent.tsx` - Profile detail content with SSR data (used by static pages). Uses shared UI components.
- `ProfileSummitsList.tsx` - User's peaks list with advanced filtering and sorting. Features:
  - **Filter Bar**: State dropdown, elevation presets (14ers/13ers/12ers), repeat peaks toggle
  - **Sort Options**: Most summits, highest elevation, most recent, first climbed, A-Z
  - **Show All on Map**: Button to zoom map to fit all summited peaks
  - When `compact` prop is true, hides internal tabs (tabs are in parent navigation). Uses infinite scroll for pagination.
- `ProfileJournal.tsx` - User's summit journal grouped by activity. Fetches all summits via `searchUserSummits`, groups by activity_id, fetches activity details, and renders `ActivityWithSummits` and `OrphanSummitCard` components. Similar to PeakUserActivity but for all peaks. Detects ownership via `useIsAuthenticated` hook and passes `isOwner` prop to child components to control edit/delete button visibility. Invalidates query cache when summits are deleted.
- `ProfileChallenges.tsx` - User's accepted challenges list. Fetches user profile data and displays favorited challenges split into two sections: "In Progress" (sorted by progress percentage) and "Completed" (sorted by name). Completed challenges are styled with sky blue accent and checkmark icon. Each challenge shows name, completion count (completed/total), progress bar. Links to `/users/:userId/challenges/:challengeId` when viewing another user's profile, or `/challenges/:challengeId` when viewing your own. Uses `is_completed` flag from API when available.

##### Mobile Overlays (`components/overlays/mobile/`)
- `peak-details-mobile.tsx` - Mobile-optimized peak detail view
- `challenge-details-mobile.tsx` - Mobile-optimized challenge detail view. Shows stats, progress bar, momentum messaging (% complete, last progress), next peak suggestions (closest + easiest unclimbed), community activity indicator, and action buttons. Peaks list is shown in separate Challenge Peaks tab.
- `discovery-content-mobile.tsx` - Mobile-optimized discovery content using shared discovery components
- `activity-details-mobile.tsx` - Mobile-optimized activity detail view with Details/Summits/Analytics tabs. Shows activity highlight callouts (multi-summit day badge, summit count, weather conditions at summit time).
- `profile-details-mobile.tsx` - Mobile-optimized profile detail view with stats and highest peak.

##### Dashboard Components (`components/dashboard/`)
Action-oriented dashboard components (December 2024):
- `QuickStatsBar.tsx` - Horizontal 4-stat bar showing total peaks, elevation gained, summits this month (with trend arrow vs last month), and primary challenge progress percentage. Displays loading skeleton state.
- `HeroSummitCard.tsx` - Celebratory card for recent unreviewed summits. Features gradient background, summit details, prominent "Add Trip Report" CTA, and "This was your Xth summit!" fun fact. Links to peak detail.
- `UnreviewedSummitsQueue.tsx` - List of summits older than 72 hours without reports. Shows up to 5 items with quick "Add Report" buttons. Includes community message footer. Links to Profile tab for full backlog.
- `UnconfirmedSummitsCard.tsx` - Card showing summits needing user review (low confidence auto-detections). Shows up to 3 items with inline confirm/deny buttons and "View Activity" links. Navigates to Profile → Review tab for full backlog.
- `ProcessingToast.tsx` - Dismissible toast notification showing activity processing status. Renders via portal to document.body.
- `ImportProgressCard.tsx` - Progress card for historical Strava import. Shows animated progress bar, summits found so far, estimated time remaining, and user-friendly status message. Polls `/api/dashboard/import-status` every 15 seconds when importing. Priority-based processing shows biggest adventures first.

##### Onboarding Components (`components/onboarding/`)
New user onboarding flow (January 2026):
- `OnboardingModal.tsx` - Multi-step modal shown on first login when import is in progress. Three slides: Welcome (scanning adventures), How It Works (summit detection explanation), What to Expect (time estimates). Uses Framer Motion for slide transitions. Persists "seen" state via `onboardingStore` to localStorage.

##### Journal Components (`components/journal/`)
Optimized journal system (December 2024) for viewing summit history:
- `JournalEntryCard.tsx` - Compact/expandable card for individual summit entries. Shows summit number, date, tags, and a primary title line. Default title is the **peak name** (Profile Journal), but supports an **activity-title** mode for peak-detail Journal. Expands to show weather data, notes, activity details, and edit/delete actions for the owner. Uses condition tag pills with color coding.
- `JournalFilterBar.tsx` - Filter controls for journal view. Includes search input (peak name), year dropdown, hasReport toggle (All/Has Report/Needs Report), clear filters button, and result count display.
- `index.ts` - Export barrel for journal components.
- `index.ts` - Export barrel for dashboard components

##### Navigation (`components/navigation/`)
Unified navigation system (December 2024) with fixed 3-tab structure for both mobile and desktop:

**Desktop Components:**
- `DesktopNavLayout.tsx` - Desktop side panel layout. Collapsible (380px expanded, 64px collapsed) with:
  - Same 3 tabs as mobile: Home, Explore, Profile (horizontal at top of panel)
  - Collapse toggle button (also Cmd/Ctrl+B keyboard shortcut)
  - Collapse state persisted in localStorage
  - Same content components as mobile (HomeTabContent, ExploreTabContent, ProfileTabContent)
  - **Note**: Content area does NOT use Framer Motion AnimatePresence for tab transitions (causes height calculation issues with flex layout)

**Mobile Components:**
- `BottomTabBar.tsx` - Fixed bottom navigation bar with 3 tabs: Home, Explore, Profile. Always visible, never changes based on context. Uses Zustand tab store for state management.
- `ContentSheet.tsx` - Reusable draggable sheet component. Supports 3 snap heights (collapsed, halfway, expanded) with swipe gestures and velocity detection. Positions above the bottom tab bar.
- `MobileNavLayout.tsx` - Main layout orchestrator for mobile. Manages tab switching, URL-driven tab activation, and content sheet rendering.

**Shared Content Components:**
- `HomeTabContent.tsx` - Home tab content wrapper. Renders DashboardContent for authenticated users.
- `ExploreTabContent.tsx` - Explore tab content with two modes:
  - Discovery mode: Shows visible peaks/challenges when no detail is selected
  - Detail mode: Shows peak/challenge/activity/user/userChallenge detail views with sub-tabs
  - Sub-tabs vary by content type (Peak: Community/Journal/Details; Challenge: Progress/Peaks; Activity: Details/Summits/Analytics; Profile: Stats/Peaks/Journal/Challenges; UserChallenge: Progress/Peaks)
  - Profile views include a user header with avatar, name, and location
  - UserChallenge view (`/users/:userId/challenges/:challengeId`) shows another user's progress on a challenge with peaks list indicating summited status
  - Maintains back stack for navigation within Explore tab
- `ProfileTabContent.tsx` - Profile tab content for viewing YOUR data. Sub-tabs: Stats (default), Peaks, Journal, Challenges, Review. Note: Other users' profiles are viewed in the Explore tab. Shows login CTA button when not authenticated.
- `ProfileStatsContent.tsx` - Stats sub-tab content showing highlight reel with: highest peak, climbing streak (monthly consecutive), geographic diversity (states/countries), peak type breakdown (14ers, 13ers, etc.), total elevation, challenges completed, year-over-year comparison.
- `ProfileReviewContent.tsx` - Review sub-tab content showing all unconfirmed summits. Features "Confirm All" bulk action, individual confirm/deny buttons per summit, "View Activity" links, and refresh button. Empty state when all summits are reviewed.
- `index.ts` - Export barrel for navigation components

##### Auth (`components/auth/`)
- `AuthModal.tsx` - Modal-based authentication flow. Two modes: login (Strava OAuth) and email collection (post-OAuth). Opens via `useRequireAuth` hook when user attempts auth-gated action.

##### Login (`components/app/login/`)
- `StravaLoginButton.tsx` - Strava OAuth button component (used by AuthModal)

##### Map (`components/map/`)
- `MapBackground.tsx` - Main Mapbox map component with persistent background. Handles map initialization, 3D terrain, satellite mode, peak/challenge data loading, URL state synchronization, and **map padding based on drawer height** (mobile only). Uses `getTrueMapCenter()` to calculate the true geographic center accounting for padding when updating URL state. **Location-aware initialization** via `useInitialMapLocation` hook - map initializes at Boulder then flies to user's resolved location (browser geolocation → IP geolocation → user profile → Boulder default). URL writes are suppressed until location resolution completes to prevent baking default coordinates into URL.

##### Peaks (`components/app/peaks/`)
- `CurrentConditions.tsx` - Live weather display for peak detail panels. Fetches from `/api/weather` route (Open-Meteo). Shows temperature, feels like, conditions, wind, humidity.

##### Peak Components (`components/peaks/`)
- `PeakActivityIndicator.tsx` - Shows recent summit activity on a peak. Fetches from `/api/peaks/[id]/activity`. Displays fire icon + "X this week" or trending icon + "X this month". Shows "Be the first this week!" when no recent activity. Supports `compact` prop for inline display.
- `PeaksFilterBar.tsx` - Reusable filter bar component for profile peaks list. Features state dropdown, elevation presets (14ers/13ers/12ers/All), repeat peaks toggle, sort dropdown, and "Show All on Map" button.
- `index.ts` - Export barrel for peak components

##### Activities (`components/app/activities/`)
- `ActivityElevationProfile.tsx` - Interactive elevation profile chart using visx. Supports hover interaction that shows a marker on the GPX track at the corresponding distance point via `onHover` callback, displays summit markers on chart, shows min/max elevation labels.
- `ActivitySummitsList.tsx` - List of individual summits during an activity (not grouped by peak). Reuses `JournalEntryCard` styling (same as Profile/Peak journals) with peak title, tags, and expandable details; hides the redundant activity-link icon when already viewing the activity. Includes "Log Another Summit" button (only visible when `isOwner` is true). Supports `onSummitHover` callback for map marker highlighting. Props: `summits`, `activityId`, `activityTitle`, `onSummitHover`, `isOwner`, `onSummitDeleted`.
- `ActivityWithSummits.tsx` - Shared activity card with nested summits. Used by PeakUserActivity and ProfileJournal. Shows activity header with link, stats (distance, elevation gain), Strava link, and nested summit items. Supports both `Summit[]` and `SummitWithPeak[]` for summits. Props: `activity`, `summits`, `summitsWithPeak`, `isHighlighted`, `onHighlight`, `peakId`, `peakName`, `showPeakHeaders`, `isOwner` (controls edit/delete button visibility), `onSummitDeleted` (callback when a summit is deleted).

##### Summits (`components/app/summits/`)
- `OrphanSummitCard.tsx` - Shared orphan summit card for manual summits without an activity. Used by PeakUserActivity and ProfileJournal. Shows date/time, weather conditions (with muted primary green icons), difficulty/experience ratings as pill-style chips, notes, and edit/delete buttons (only visible when `isOwner` is true). Supports both `Summit` and `SummitWithPeak` types. Optional `showPeakHeader` prop for profile context. Props include `isOwner` and `onDeleted` callback.
- `SummitItem.tsx` - Shared summit display component used by both Journal tab (PeakUserActivity) and Activity Summits tab (ActivitySummitsList). Features:
  - Works with both `Summit` and `SummitWithPeak` types
  - Optional peak header for activity context (`showPeakHeader` prop)
  - Hover callbacks (`onHoverStart`, `onHoverEnd`) for map marker highlighting
  - Visual highlighting for unreported summits when `isOwner=true` (dashed border, tinted background) to encourage trip reports
  - Edit/delete buttons only visible when `isOwner` is true; "Add Trip Report" button for unreported summits

##### Photos (`components/photos/`)
Photo upload and management components (Stage 4):
- `SummitPhotosSection.tsx` - Photo management section for SummitReportModal. Features:
  - Photo grid with thumbnails (3 columns)
  - Upload button with file picker (accepts JPEG, PNG, WebP, HEIC/HEIF)
  - **Client-side JPEG conversion**: All images are converted to JPEG before upload using canvas. This ensures compatibility across browsers (especially Brave on iOS which doesn't auto-convert HEIC).
  - Direct upload to GCS via signed URLs with progress indicator showing conversion/upload status
  - 10MB max file size after conversion (accepts up to 20MB before conversion)
  - Inline caption editing on hover
  - Delete with confirmation dialog
  - Lightbox for full-size photo viewing
  - Uses React Query for data fetching and cache invalidation
  - Server actions: `getPhotoUploadUrl`, `completePhotoUpload`, `getSummitPhotos`, `updatePhotoCaption`, `deletePhoto`
- `PeakPhotosGallery.tsx` - Community photo gallery for peak detail page. Features:
  - Compact grid view (3 columns, 6 photos by default via `compactLimit` prop)
  - "View all" button for expanded view with infinite scroll
  - **Uses React Query cursor-based infinite scrolling** (`useInfiniteQuery`) for efficient pagination of peaks with many photos
  - Intersection Observer triggers automatic loading of next page
  - Hover overlay showing photographer name
  - Lightbox with caption, photographer, and date
  - Integrated into PeakCommunity component
  - Server action: `getPeakPhotos` (supports `cursor` and `limit` params)
- `SummitPhotoStrip.tsx` - Horizontal thumbnail strip for summit list items (owner's own summits). Features:
  - Shows up to 4 thumbnails with "+N" indicator for more
  - Lightbox with keyboard navigation (arrow keys, Escape)
  - Photo counter and previous/next buttons in lightbox
  - Owner-only display (photos are private to the summit owner)
  - Uses React Query to fetch photos via `getSummitPhotos` action
  - Integrated into `SummitItem.tsx` component
- `PublicSummitPhotoStrip.tsx` - Horizontal thumbnail strip for public summit cards (community section). Features:
  - Shows up to 4 thumbnails with "+N" indicator for more
  - Lightbox with keyboard navigation (arrow keys, Escape)
  - Photo counter and previous/next buttons in lightbox
  - No auth required - only shows photos from public summits by public users
  - Uses React Query to fetch photos via `getPublicSummitPhotos` action
  - Integrated into `PublicSummitCard.tsx` component

##### Challenges (`components/challenges/`)
- `ChallengeActivityIndicator.tsx` - Shows community activity for a challenge. Displays weekly active users, weekly summit count, and recent completions (with user links). Used in challenge detail views to show social proof and engagement.
  - Weather conditions (temperature, weather code, wind speed, humidity) with muted primary green icons (`text-primary/60`)
  - Difficulty badge (easy/moderate/hard/expert) displayed as pill-style chips with colored borders
  - `isOwner` prop controls visibility of edit/delete buttons (only shown to owner)
  - Delete button with confirmation dialog, calls `deleteAscent` action
  - `onDeleted` callback for refreshing parent component after deletion
  - Experience rating badge (amazing/good/tough/epic) displayed as pill-style chips with colored borders and icons
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
Shared discovery list components used by both desktop and mobile navigation layouts:
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
- `alert-dialog.tsx` - Alert dialog for confirmations (used for delete confirmations)
- `badge.tsx` - Badge component
- `button.tsx` - Button component
- `dialog.tsx` - Dialog/modal component
- `dropdown-menu.tsx` - Dropdown menu component
- `input.tsx` - Input component
- `separator.tsx` - Separator component
- `sheet.tsx` - Sheet/sidebar component
- `skeleton.tsx` - Loading skeleton
- `sidebar.tsx` - Sidebar component
- `switch.tsx` - Toggle switch with on/off states (custom implementation)
- `toggle.tsx` - Toggle button
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
- `convertPeaksToGeoJSON.ts` - Converts peaks to GeoJSON format with summit normalization. Ensures all peaks have a numeric `summits` property for unified map styling (derived from `summits`, `ascents.length`, or `is_summited`).
- `convertChallengesToGeoJSON.ts` - Converts challenges (with center coords) to GeoJSON
- `convertSummitsToPeaks.ts` - Converts SummitWithPeak[] to Peak[] with nested ascents. Used by activity detail components for map effects and elevation profile.
- `dayjs.ts` - Day.js configuration/helpers
- `getBackendUrl.ts` - Gets API backend URL from environment
- `getBoundsFromURL.ts` - Extracts map bounds from URL params (legacy, migrating to center/zoom)
- `getDistanceString.ts` - Formats distance strings
- `getElevationString.ts` - Formats elevation strings
- `getMapStateFromURL.ts` - Extracts map state from URL (center lat/lng, zoom, pitch, bearing, is3D, isSatellite)
- `getTrueMapCenter.ts` - Calculates the true geographic center of the map accounting for padding. When map padding is applied (e.g., for bottom drawer), Mapbox's `getCenter()` returns the center of the padded viewport. This helper uses `project()`/`unproject()` to calculate what the center would be without padding, preventing map jumps when navigating between routes.
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

**Note**: Mobile detection uses `hooks/use-mobile.ts` - Modern implementation using `window.matchMedia` (default breakpoint 768px, can be customized).
- `stateAbbreviations.ts` - US state abbreviation mapping and search query utilities:
  - `expandSearchQuery()` - Expands abbreviations to full names and vice versa
  - `extractStateFromQuery()` - Smart state extraction that only extracts state if remaining search is meaningful (prevents "mount washington" from being parsed as "mount" + WA state)

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
- `UserManagementProvider.tsx` - User management modal state provider (isOpen, openModal, closeModal)
- `OnboardingProvider.tsx` - Onboarding modal state provider (hasSeenOnboarding, showOnboardingModal, localStorage persistence)

### Store (`src/store/`)
Zustand state management stores:
- `mapStore.tsx` - Map instance store (vanilla Zustand). State includes:
  - `map` - Mapbox GL map instance
  - `visiblePeaks`, `visibleChallenges` - Currently visible items on map
  - `isSatellite` - Satellite mode toggle
  - `disablePeaksSearch` - Prevents peaks loading when viewing challenge details
  - `summitHistoryPeakId` - When set, shows SummitHistoryPanel instead of discovery content (desktop drill-down)
  - `selectedChallengeData` - Challenge peaks data shared between challenge views and navigation (challengeId, challengeName, peaks)
  - `hoveredPeakId` - ID of peak being hovered over in summit list, used for map marker highlighting with amber accent color
- `tabStore.ts` - Navigation state (vanilla Zustand with React hook). Note: `activeTab` is derived from URL in MobileNavLayout/DesktopNavLayout, not stored in state. State includes:
  - `profileSubTab` - Active sub-tab within Profile tab ("stats" | "peaks" | "journal" | "challenges" | "review")
  - `exploreSubTab` - Active sub-tab within Explore tab (varies by content type)
  - `exploreBackStack` - Legacy Explore internal history (currently cleared when returning to `/explore` and not used for the primary back affordance)
  - `lastExplorePath` - Remembers last Explore detail path for "tab memory" (so clicking Explore can restore where you were). **Important**: Read via `getTabStore().getState().lastExplorePath` in click handlers to avoid stale closure issues. This value is explicitly cleared when the user is on `/explore` to prevent stale restoration.
  - `drawerHeight` - Current mobile drawer height for map padding ("collapsed" | "halfway" | "expanded")
  - `isDesktopPanelCollapsed` - Desktop panel collapse state for map padding
  - Actions: `setProfileSubTab`, `setExploreSubTab`, `pushExploreHistory`, `popExploreHistory`, `clearExploreHistory`, `setLastExplorePath`, `setDrawerHeight`, `setDesktopPanelCollapsed`
  - Exports: `getTabStore()` - Returns the singleton store instance for direct state access (use in click handlers to avoid stale closures)
- `userStore.tsx` - User data store (vanilla Zustand)
- `authModalStore.ts` - Auth modal state (isOpen, mode, redirectAction)
- `dashboardStore.ts` - Dashboard panel state (isOpen, toggle)
- `manualSummitStore.ts` - Manual summit modal state
- `summitReportStore.ts` - Summit report/edit modal state
- `userManagementStore.ts` - User management modal state (isOpen, openModal, closeModal)
- `onboardingStore.ts` - Onboarding modal state (hasSeenOnboarding, showOnboardingModal, localStorage persistence)

### Auth (`src/auth/`)
Authentication configuration:
- `authOptions.ts` - NextAuth configuration with Strava provider
- `getSessionToken.ts` - Gets NextAuth session JWT from cookies for API authentication
- `next-auth.d.ts` - NextAuth type definitions
- `useAuth.ts` - Custom auth hook

### Type Definitions (`src/typeDefs/`)
TypeScript type definitions:
- `Activity.ts` - Activity data structure
- `ActivityStart.ts` - Activity start location
- `AscentDetail.ts` - Peak ascent details
- `Challenge.ts` - Challenge data structure
- `ChallengeProgress.ts` - Challenge progress tracking. Extended with `lastProgressDate` and `lastProgressCount` fields.
- `DashboardStats.ts` - Dashboard quick stats (totalPeaks, totalElevationGained, summitsThisMonth, summitsLastMonth, primaryChallengeProgress)
- `ManualPeakSummit.ts` - Manual summit entry. Extended with optional `hasReport` and `summitNumber` fields.
- `Peak.ts` - Peak data structure
- `ProductDisplay.ts` - Stripe product display
- `ServerActionResult.ts` - Server action result wrapper
- `StravaCreds.ts` - Strava OAuth credentials
- `Summit.ts` - Summit data structure with difficulty, experience rating, condition_tags, and custom_condition_tags. ConditionTag type: "dry" | "snow" | "ice" | "mud" | "wet" | "windy" | "foggy" | "postholing" | "clear" | "rocky" | "slippery" | "overgrown" | "bushwhack" | "exposed". custom_condition_tags is a string array for free-form user-defined tags. **Note**: `activity_id` is optional because public summit responses don't include it (per Strava API compliance).
- `SummitWithPeak.ts` - Individual summit entry with nested peak data. Used by activity detail API response. Includes all summit fields (notes, weather, difficulty, experience rating, condition_tags, custom_condition_tags) plus peak info.
- `PeakActivity.ts` - Peak activity statistics (summitsThisWeek, summitsThisMonth, lastSummitDate). Used by PeakActivityIndicator.
- `ProfileStats.ts` - User profile statistics (peaks summited, total summits, highest peak, challenges completed, elevation gained, states/countries, year stats, peak type breakdown)
- `UserPeakWithSummitCount.ts` - Peak with summit count and first/last summit dates for user profile search results
- `UnconfirmedSummit.ts` - Unconfirmed summit needing user review (id, peakId, peakName, peakElevation, activityId, timestamp, distanceFromPeak, confidenceScore)
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
- `use-user-location.ts` - Hook for getting user location. Priority: browser geolocation → profile location_coords → default (Boulder, CO). Used for challenge next peak suggestions.
- `use-initial-map-location.ts` - Hook for resolving initial map center with fallback chain:
  1. URL params (respect shared links)
  2. Browser geolocation (with 5s timeout)
  3. IP geolocation via Vercel (`/api/geolocation`)
  4. User profile `location_coords` (if provided)
  5. Default: Boulder, CO
  Returns `{ center, zoom, source, isLoading }`. Used by `MapBackground` to initialize map at user's location. Suppresses URL writes until location is resolved to prevent overwriting with default position.

#### Map Hooks
- `use-map-source.ts` - Hook to manage Mapbox GeoJSON source data with retry logic. Handles waiting for source availability and cleanup on unmount.
- `use-peak-map-effects.ts` - Hook to handle map effects when viewing a peak detail. Sets selected peak marker, displays activity GPX lines, and provides flyTo functionality.
- `use-challenge-map-effects.ts` - Hook to handle map effects when viewing a challenge. Disables general peaks search, shows challenge peaks on map (with conditional styling for summited peaks), and fits map to challenge bounds (only once on initial load to prevent zoom/pan issues).
- `use-activity-map-effects.ts` - Hook to handle map effects when viewing an activity. Displays GPX line, shows peak markers for summitted peaks, handles hover marker from elevation profile chart, handles hover highlighting of peaks from summit list via mapStore.hoveredPeakId (uses Mapbox feature-state for amber accent color), and fits map to activity bounds. Note: Map padding is NOT managed by this hook - it's controlled centrally by `MapBackground` based on drawer height.
- `use-peak-hover-map-effects.ts` - Hook to handle map hover effects when hovering over peak rows in discovery lists. Creates/updates a `peakHover` map source and layer to show a bright green dot marker at peak coordinates. Shows a visual indicator on the map when hovering over peak rows.
- `use-drawer-height.ts` - Hook to manage draggable drawer height with snap points (collapsed/halfway/expanded). Used by ContentSheet for mobile UI.

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
3. State extraction is smart: only extracts state if remaining search term is meaningful (e.g., "mount washington" keeps the full term, "mount washington nh" extracts NH).
4. Peak searches always include broad name matching (without state filter). If state is detected, an additional state-filtered search runs in parallel.
5. Client fetchers call REST API for challenges (with case-insensitive name AND region matching) and peaks.
6. Mapbox geocoding searches for regions (states), places (cities), POIs (national parks/forests), and localities.
7. Results are prioritized: Challenges first (max 4), then Peaks (max 3, with state-matched peaks first), then Places (max 3).
8. Places are filtered to outdoor-relevant POIs (parks, forests, trails, etc.).
9. Peak results display public summit counts and user summit counts (with summited styling when authenticated).
10. Selecting an item clears the search, blurs the input, and navigates to the detail page or flies the map.

### Peak Discovery Flow
1. User browses map on home page
2. `MapBackground` loads peaks in visible bounds via `getNewData`
3. Peaks rendered as markers on Mapbox map
4. User clicks peak marker → navigates to `/peaks/[id]`
5. `UrlOverlayManager` renders appropriate content via `ExploreTabContent`
6. Map flies to peak location

### Peak Detail Flow
1. User clicks peak on map or in discovery list
2. Navigates to `/peaks/[id]`
3. `ExploreTabContent` fetches data via `getPeakDetails`
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
- **Mobile First**: Application is designed to be fully functional on mobile devices. The `useIsMobile` hook defaults to `true` during SSR and initial render for mobile-first experience.
- **Unified Navigation Architecture (Phase 5B)**: Both mobile and desktop share the same navigation structure and content components:
  - **Desktop (≥ 1024px)**: 
    - `DesktopNavLayout`: Collapsible side panel (~380px expanded, ~64px collapsed) on the left
    - Same 3-tab structure as mobile: Home, Explore, Profile
    - Tabs displayed horizontally at top of side panel
    - Collapse toggle button (also accessible via Cmd/Ctrl+B keyboard shortcut)
    - Collapse state persisted in localStorage
    - Map padding adjusts based on panel width (left padding)
  - **Mobile (< 1024px)**: 
    - `MobileNavLayout` with fixed 3-tab bottom navigation:
      - Fixed `BottomTabBar` always visible at bottom: Home, Explore, Profile
      - `ContentSheet` draggable sheet positioned above tab bar
    - Map padding adjusts based on drawer height (bottom padding)
  - **Shared Content Components** (used by both mobile and desktop):
    - `HomeTabContent`: Dashboard content (recent summits, challenges, queue status)
    - `ExploreTabContent`: Discovery mode OR detail views (peak, challenge, activity, user profile) with contextual sub-tabs
    - `ProfileTabContent`: Your aggregated data with sub-tabs (Stats, Peaks, Journal, Challenges, Review)
  - **URL-based tab routing**: Each tab has its own URL:
    - `/` → Home tab
    - `/explore` → Explore tab (discovery mode)
    - `/profile` → Profile tab
      - `/peaks/[id]`, `/challenges/[id]`, `/activities/[id]`, `/users/[id]` → Explore tab (detail mode)
    - Active tab is derived from URL, not stored in state (URL is source of truth)
    - Browser back/forward navigation works naturally between tabs
    - Draggable content sheet with 3 snap heights:
      - **Collapsed** (~60px): Just the drag handle visible
      - **Halfway** (~45vh): Default state, map partially visible
      - **Expanded** (~100vh - 140px): Full screen content (accounting for tab bar)
    - Supports swipe gestures with velocity detection
    - Explore detail navigation:\
      - The Explore back arrow returns directly to `/explore` (discovery mode)\
      - Returning to `/explore` clears cached Explore detail restoration (`lastExplorePath`) so tab switching cannot resurrect stale detail URLs
    - Mobile drawer managed by `ContentSheet` component
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
- `peaks-point` - Discovery peaks (individual unclustered markers) with unified summit-based coloring:
  - Summited (summits > 0): sky blue (#5b9bd5)
  - Not summited: muted green (#4d7a57)
- `selectedPeaks` - Peak markers for challenges/activities/profiles with unified summit-based styling:
  - **Fill color is strictly blue/green** - never changes on hover/selection
  - Summited (summits > 0): sky blue (#5b9bd5)
  - Not summited: muted green (#4d7a57)
  - Default radius: 7px (matches discovery peaks)
  - Hover: radius increases to 10px, stroke changes to pink/amber (#d66ba0) ring, fill stays blue/green
- `activityHover` - Hover marker from elevation profile (created dynamically)
- `peakHover` - Hover ring for peak rows in discovery list (transparent fill, pink/amber #d66ba0 stroke, created dynamically by `usePeakHoverMapEffects`)

**Unified Summit Styling Rule**: All peak markers use the same color rule - blue if summited, green if not. The `summits` property is normalized in `convertPeaksToGeoJSON` from various sources (`summits`, `summit_count`, `ascents.length`, or `is_summited`). Hover/selection indicators may change stroke color and radius, but never the fill color.

### Peak Marker Interactions

**Click-to-Popup Behavior**: Clicking a peak dot (either `peaks-point` or `selectedPeaks`) opens a popup instead of navigating directly. The popup displays:
- Peak name
- Elevation (in feet)
- Location (county/state/country)
- Public summit count (total public summits from all users)
- Personal summit count (user's own summits, if logged in)
- **Details** button that navigates to the peak detail page (`/peaks/:id`)

This provides a quick preview without forcing navigation, improving exploration UX.

**Popup Implementation**:
- `PeakMarkerPopup` component (`src/components/map/PeakMarkerPopup.tsx`)
- `renderPopup` helper returns the popup instance for cleanup
- `activePopupRef` in MapBackground ensures only one popup is open at a time
- Click handlers are bound to invisible hitbox layers (`peaks-point-hitbox`, `selectedPeaks-hitbox`) with a larger radius to make clicks reliable even with small dots / pitch / 3D terrain.
- Cluster clicks still zoom to expand (no popup)

**Popup Close UX**:
- The Mapbox default close button ("X") is disabled (no top-right close icon).
- Popups close via clicking elsewhere on the map (Mapbox `closeOnClick`).

**Data Requirements**: All peak payloads used for map markers must include:
- `public_summits` - count of public summits from all users (API responsibility)
- `summits` or `summit_count` or `ascents` - for personal summit display (normalized by `convertPeaksToGeoJSON`)

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

### `auth/getSessionToken.ts`
- **Status**: ACTIVELY USED
- **Directive**: `"use server"` - ensures code runs server-side (required for cookie access)
- Gets the NextAuth session JWT from cookies for API authentication
- Used throughout actions and API routes for Bearer token authentication
- The session token is verified by `pathquest-api` using the shared `JWT_SECRET`

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

Optional environment variables:
- `RESEND_API_KEY` - Resend API key for contact form email delivery
- `CONTACT_EMAIL` - Email address to receive contact form submissions (default: hello@pathquest.app)


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
7. **Hook Consolidation**: Consolidated `useIsMobile` implementations - legacy helper version removed
8. **Auth model updated**: Replaced Vercel OIDC/Google token flow with direct NextAuth session token authentication
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
- `peak-details-mobile.tsx` - Mobile-optimized peak detail view
- `challenge-details-mobile.tsx` - Mobile-optimized challenge detail view
- `discovery-content-mobile.tsx` - Mobile-optimized discovery content using shared discovery components

### Created Map Hooks (`hooks/`)
- `use-map-source.ts` - Manages Mapbox GeoJSON source data with retry logic. Handles waiting for source availability and cleanup on unmount.
- `use-peak-map-effects.ts` - Handles map effects when viewing a peak detail. Sets selected peak marker, displays activity GPX lines, and provides flyTo functionality.
- `use-challenge-map-effects.ts` - Handles map effects when viewing a challenge. Disables general peaks search, shows challenge peaks on map, and fits map to challenge bounds.
- `use-profile-map-effects.ts` - Handles map effects when viewing a user profile. Disables general peaks search, shows all user's summited peaks on map, and fits map to bounds.
- `use-drawer-height.ts` - Manages draggable drawer height with snap points (collapsed/halfway/expanded). Used by ContentSheet for mobile UI.

### Refactored Components
- `PeakDetailPanel.tsx` - Now uses `DetailPanelHeader`, `StatsGrid`, `StatCard`, `DetailLoadingState`, and `usePeakMapEffects` hook
- `ChallengeDetailPanel.tsx` - Now uses shared components and `useChallengeMapEffects` hook
- `PeakDetailContent.tsx` - Uses shared UI components
- `ChallengeDetailContent.tsx` - Uses shared UI components
- Mobile components extracted: `PeakDetailsMobile`, `ChallengeDetailsMobile`, `DiscoveryContentMobile`

### Benefits
- **Reduced Bundle Size**: Removed 19 unused components (~15-20% reduction in component code)
- **Easier Maintenance**: Single source of truth for common patterns (headers, stats grids, loading states)
- **Consistency**: Shared components ensure UI consistency across desktop and mobile
- **Testability**: Smaller, focused components are easier to test
- **Readability**: Large components split into manageable pieces
- **Reusability**: Map hooks can be reused for future map interaction features

## Code Quality Issues & Improvement Opportunities

This section documents identified code quality issues, technical debt, and opportunities for improvement in the frontend codebase. These items should be addressed in future refactoring efforts.

### Monolithic Components

Several components have grown large and handle multiple responsibilities, making them difficult to maintain and test:

1. **`ExploreTabContent.tsx` (~600 lines)** - MODULARIZED (December 2024)
   - **Issue**: Previously handled discovery mode + multiple detail views (peak/challenge/activity/profile/userChallenge) with large inlined JSX
   - **Progress**:
     - Extracted URL parsing to `hooks/use-explore-route.ts` with centralized `getDefaultSubTab()` helper
     - Extracted data layer (React Query + derived view model) to `hooks/use-explore-data.ts`
     - Extracted map/store side-effects to `hooks/use-explore-map-effects.ts`
     - Extracted Explore UI modules into `components/navigation/explore/`:
       - `ExploreContent.tsx` (content router)
       - `ExploreDiscoveryContent.tsx`
       - `ExplorePeakContent.tsx` (peak detail view with public land badge for notable lands like National Parks, Wilderness Areas)
       - `ExploreChallengeContent.tsx`
       - `ExploreUserChallengeContent.tsx`
       - `ExploreActivityContent.tsx`
       - `ExploreProfileContent.tsx`
       - `ExploreSubTabs.tsx`
       - `ExploreProfileHeader.tsx`
       - `ExploreLoadingState.tsx` / `ExploreEmptyContent.tsx`
   - **Still mixed concerns**: Navigation logic remains centralized in `ExploreTabContent.tsx` (callbacks). The Explore back affordance is intentionally deterministic: it routes to `/explore` and clears Explore tab caches to prevent stale restoration.

2. **`MapBackground.tsx` (~540 lines)** - PARTIALLY REFACTORED (December 2024)
   - **Issue**: Handles map initialization, layer setup, event handlers, data fetching, URL synchronization
   - **Progress**: Extracted padding logic into `useMapPadding` hook
   - **Remaining**: Could extract map layer configuration into `useMapLayers.ts` hook, extract event handlers into `useMapInteractions.ts` hook

3. **Deprecated Large Components** - REMOVED (December 2024):
   - `DetailBottomSheet.tsx` - Deleted, replaced by `MobileNavLayout` system
   - `DiscoveryDrawer.tsx` - Deleted, replaced by `DesktopNavLayout`

### Code Duplication

1. **Map Source Retry Logic** - RESOLVED (December 2024):
   - Created `lib/map/waitForMapSource.ts` with:
     - `waitForMapSource()` - Wait for single source
     - `waitForMapSources()` - Wait for multiple sources
     - `clearMapSource()` / `clearMapSources()` - Cleanup utilities
   - Migrated all hooks and components to use these utilities

2. **Router Ref Pattern** - RESOLVED (December 2024):
   - Created `hooks/use-stable-ref.ts` with `useStableRef()` and `useRouterRef()` hooks
   - Migrated all router ref usage to use the hook:
     - `ExploreTabContent.tsx`
     - `Omnibar.tsx`
     - `MapBackground.tsx`

3. **Debounce Implementations**
   - **Pattern**: Inline debounce functions defined in multiple places:
     - `MapBackground.tsx` (lines 31-40) - Custom debounce utility
     - `Omnibar.tsx` (lines 52-57) - useEffect-based debounce
   - **Recommendation**: Use a shared debounce utility from a library (e.g., `lodash.debounce`) or create `utils/debounce.ts`

4. **Map Source Cleanup Patterns**
   - **Pattern**: Similar cleanup logic for clearing map sources appears in multiple useEffect cleanup functions
   - **Recommendation**: Extract into `useMapSourceCleanup.ts` hook or utility functions

5. **Sub-tab Button Rendering**
   - **Pattern**: Similar sub-tab button rendering logic in `ExploreTabContent.tsx` (lines 709-830)
   - **Recommendation**: Extract `SubTabButton` component (already exists but could be more reusable) and create `SubTabBar` component

### Deprecated/Unused Code

1. **Deprecated Components** - REMOVED (December 2024):
   - `components/overlays/DetailBottomSheet.tsx` - DELETED
   - `components/overlays/DiscoveryDrawer.tsx` - DELETED
   - `components/overlays/PeakDetailPanel.tsx` - DELETED
   - `components/overlays/ChallengeDetailPanel.tsx` - DELETED
   - `components/overlays/ActivityDetailPanel.tsx` - DELETED
   - `components/overlays/ProfileDetailPanel.tsx` - DELETED

2. **Unused Actions** - REMOVED (December 2024):
   - `actions/testApi.ts` - DELETED

3. **Legacy Components** - REMOVED (December 2024):
   - `components/app/layout/UserButton.tsx` - DELETED

4. **Duplicate Mobile Detection Hooks** - RESOLVED (December 2024):
   - `helpers/useIsMobile.ts` - DELETED (legacy implementation)
   - `helpers/useWindowResize.tsx` - DELETED (only used by legacy hook)
   - Now using single implementation: `hooks/use-mobile.ts`

### Code Organization Issues

1. **ESLint Rules Disabled**
   - **Location**: `.eslintrc.json`
   - **Disabled Rules**:
     - `@typescript-eslint/no-unused-vars` - Off
     - `react-hooks/rules-of-hooks` - Off
     - `@typescript-eslint/no-explicit-any` - Off
     - `react-hooks/exhaustive-deps` - Off
   - **Issue**: These disabled rules can hide bugs and code quality issues
   - **Recommendation**: Gradually re-enable rules and fix violations, or use more targeted rule configurations

2. **Large useEffect Dependencies**
   - **Issue**: Some useEffect hooks have many dependencies, making them hard to reason about
   - **Example**: `ExploreTabContent.tsx` line 183 has 7 dependencies
   - **Recommendation**: Split complex effects into smaller, focused effects

3. **Mixed Concerns in Components**
   - **Issue**: Some components mix data fetching, state management, and rendering concerns
   - **Example**: `ExploreTabContent.tsx` handles URL parsing, data fetching, map effects, and rendering
   - **Recommendation**: Extract data fetching into custom hooks, extract map effects into hooks (partially done), extract rendering into smaller components

### Performance Considerations

1. **Multiple React Query Hooks in Single Component**
   - **Issue**: `ExploreTabContent.tsx` uses 7+ React Query hooks, all potentially refetching when tab becomes active
   - **Recommendation**: Consider using React Query's `enabled` option more strategically, or split into smaller components that only fetch when needed

2. **Large Component Re-renders**
   - **Issue**: Large components like `ExploreTabContent.tsx` may re-render frequently due to many state updates
   - **Recommendation**: Use React.memo for expensive sub-components, split into smaller components with focused re-render scopes

3. **Map Source Retry Delays**
   - **Issue**: Retry logic uses fixed 300ms delays, which could cause perceived lag
   - **Recommendation**: Consider exponential backoff or more sophisticated retry strategies

### Type Safety Issues

1. **Explicit `any` Types**
   - **Issue**: ESLint rule for `@typescript-eslint/no-explicit-any` is disabled
   - **Recommendation**: Gradually add proper types, use `unknown` instead of `any` where types are truly unknown

2. **Type Assertions**
   - **Issue**: Some map source type assertions (`as mapboxgl.GeoJSONSource`) may fail at runtime
   - **Recommendation**: Add runtime checks before type assertions

### Testing Gaps

1. **No Test Files Found**
   - **Issue**: No test files (`.test.ts`, `.test.tsx`, `.spec.ts`) found in the codebase
   - **Recommendation**: Add unit tests for utility functions, hooks, and components, especially for:
     - Map hooks (`use-peak-map-effects.ts`, `use-challenge-map-effects.ts`, etc.)
     - Utility functions (`getMapStateFromURL.ts`, `stateAbbreviations.ts`, etc.)
     - Complex components (`ExploreTabContent.tsx`, `MapBackground.tsx`)

### Documentation Gaps

1. **Inline Comments**
   - **Issue**: Some complex logic lacks inline comments explaining the "why"
   - **Recommendation**: Add JSDoc comments for complex functions and hooks

2. **Component Props Documentation**
   - **Issue**: Some components lack clear prop type documentation
   - **Recommendation**: Add JSDoc comments for component props, especially for shared components

### Recommended Refactoring Priority

**High Priority:**
1. ~~Remove deprecated components~~ - DONE (December 2024)
2. ~~Consolidate `useIsMobile` implementations~~ - DONE (December 2024)
3. ~~Extract map source retry logic into reusable hook/utility~~ - DONE (December 2024)
4. ~~Split `ExploreTabContent.tsx` into smaller components~~ - DONE (December 2024)
   - Extracted route parsing to `useExploreRoute`
   - Extracted per-content renderers and shared UI into `components/navigation/explore/*`

**Medium Priority:**
1. ~~Extract router ref pattern into custom hook~~ - DONE (December 2024)
2. Consolidate debounce implementations
3. Add unit tests for critical utilities and hooks

**Low Priority:**
1. ~~Extract map layer configuration from `MapBackground.tsx`~~ - PARTIAL (padding extracted to `useMapPadding`)
2. Improve type safety (reduce `any` usage)
3. Add JSDoc documentation
4. Optimize React Query hook usage

