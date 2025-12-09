# PathQuest Frontend Architecture

## Overview

PathQuest is a peak bagging and challenge tracking application built with Next.js 14 (App Router), React, TypeScript, and Mapbox GL JS.

## Key Architecture Patterns

### URL-Driven Overlay Pattern

The application uses a **URL-driven overlay pattern** that provides:
1. **Persistent Mapbox instance** - The map never reloads during navigation
2. **SEO-friendly static pages** - 1000+ peaks and challenges are statically generated
3. **Smooth client-side navigation** - Soft navigation between all routes

#### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                        Root Layout                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    MapProvider (Zustand)                     ││
│  │  ┌──────────────────────────────────────────────────────────┘│
│  │  │                                                           │
│  │  │  ┌─────────────────┐  ┌─────────────────┐                │
│  │  │  │  MapBackground  │  │ DiscoveryDrawer │                │
│  │  │  │   (Mapbox GL)   │  │  (Left Panel)   │                │
│  │  │  └─────────────────┘  └─────────────────┘                │
│  │  │                                                           │
│  │  │  ┌─────────────────────────────────────┐                  │
│  │  │  │       UrlOverlayManager             │                  │
│  │  │  │  (Reads pathname, shows overlay)    │                  │
│  │  │  │  - /peaks/[id] → PeakDetailPanel    │                  │
│  │  │  │  - /challenges/[id] → ChallengePanel│                  │
│  │  │  └─────────────────────────────────────┘                  │
│  │  │                                                           │
│  │  │  ┌─────────────────────────────────────┐                  │
│  │  │  │           {children}                │                  │
│  │  │  │   (SEO content from static pages)   │                  │
│  │  │  │   sr-only - hidden from users       │                  │
│  │  │  └─────────────────────────────────────┘                  │
│  └──┴───────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────┘
```

#### Navigation Flows

**Client-side navigation (`/` → `/peaks/123`):**
1. User clicks peak on map or in DiscoveryDrawer
2. `router.push('/peaks/123')` triggers soft navigation
3. Root layout stays mounted → **Map persists** ✅
4. `UrlOverlayManager` sees pathname change → shows `PeakDetailPanel`
5. Static page's hidden SEO content renders (invisible to users)

**Direct URL access (Google bot or bookmark to `/peaks/123`):**
1. Server renders static HTML with SEO metadata + structured data
2. Google indexes the content ✅
3. Browser hydrates, `UrlOverlayManager` shows interactive panel
4. Map initializes (expected for fresh page load)

**Navigation between detail pages (`/peaks/123` → `/challenges/456`):**
1. User clicks challenge link in peak panel
2. Soft navigation occurs
3. Layout stays mounted → **Map persists** ✅
4. `UrlOverlayManager` updates to show `ChallengeDetailPanel`

### File Structure

```
src/app/
├── layout.tsx              # Root layout with MapBackground + UrlOverlayManager
├── page.tsx                # Home page (returns null - map is the content)
├── peaks/
│   └── [id]/
│       └── page.tsx        # Static page for SEO (generateStaticParams)
├── challenges/
│   └── [id]/
│       └── page.tsx        # Static page for SEO (generateStaticParams)
└── ...

src/components/
├── map/
│   └── MapBackground.tsx   # Mapbox GL instance (mounted in root layout)
├── overlays/
│   ├── UrlOverlayManager.tsx    # URL-driven overlay controller
│   ├── PeakDetailPanel.tsx      # Peak detail overlay (client component)
│   ├── ChallengeDetailPanel.tsx # Challenge detail overlay (client component)
│   └── DiscoveryDrawer.tsx      # Left sidebar with visible peaks/challenges
└── ...
```

### Static Generation

The following pages are statically generated at build time:

- **Peaks**: Top 1000 peaks by summit count (`generateStaticParams`)
- **Challenges**: All challenges (`generateStaticParams`)

Both use:
- `generateMetadata` for dynamic SEO titles and descriptions
- `revalidate = 86400` (24 hours) for ISR
- `dynamicParams = true` for on-demand generation of new content

### State Management

- **MapProvider (Zustand)**: Manages Mapbox instance, visible peaks/challenges, satellite mode
- **React Query**: Handles data fetching with caching for peak/challenge details
- **URL State**: Current overlay state is derived from pathname

### Key Components

| Component | Purpose |
|-----------|---------|
| `MapBackground` | Initializes and renders Mapbox GL, handles map interactions |
| `UrlOverlayManager` | Reads pathname, renders appropriate detail panel |
| `PeakDetailPanel` | Fetches and displays peak details, shares user/community data with store, displays GPX lines on map |
| `ChallengeDetailPanel` | Fetches and displays challenge details with peak list |
| `DiscoveryDrawer` | Shows visible peaks/challenges in current map viewport. Has tabbed navigation (Discover/My Activity/Community on desktop when peak selected). |
| `DetailBottomSheet` | Mobile-only bottom sheet with tabs (Details/My Activity/Community/Discover/Dashboard) |
| `PeakUserActivity` | Shows authenticated user's summit history and activities for the selected peak |
| `PeakCommunity` | Shows public summit history from all users for the selected peak |
| `DashboardPanel` | Desktop-only slide-out panel for user dashboard (right side) |
| `DashboardContent` | Reusable dashboard content showing recent summits, challenge progress, and sync status |
| `Omnibar` | Global search for peaks, challenges, and places |

### Peak Detail Tabs (My Activity & Community)

When viewing a peak, users see contextual tabs in the left drawer (desktop) or bottom sheet (mobile).

#### My Activity Tab (Authenticated Users Only)
When an authenticated user views a peak, their personal activity data is displayed:

**What's shown:**
- User's summit history for that peak (dates, weather conditions, notes)
- User's activity GPX lines on the map (immediate display)
- "Add Trip Report" CTA button (only if no notes exist for a summit)

#### Community Tab (All Users)
Shows public summit data from all users for the selected peak:

**What's shown:**
- List of public summits with user names, dates, weather conditions, and notes
- Sorted by most recent first

#### Tab Behavior

**Desktop (DiscoveryDrawer):**
- When a peak is selected, tabs appear: Discover / My Activity (if authenticated) / Community
- Authenticated users: Auto-switches to My Activity tab
- Non-authenticated users: Auto-switches to Community tab

**Mobile (DetailBottomSheet):**
- When a peak is selected, tabs appear: Details / My Activity (if authenticated) / Community / Discover / Dashboard
- Authenticated users: Auto-switches to My Activity tab
- Non-authenticated users: Auto-switches to Community tab

**Data Flow:**
1. `PeakDetailPanel` or `DetailBottomSheet` fetches peak data including `ascents`, `activities`, and `publicSummits`
2. User data is shared via `selectedPeakUserData` in the Zustand map store
3. Community data is shared via `selectedPeakCommunityData` in the Zustand map store
4. `PeakUserActivity` and `PeakCommunity` components read from the store and display the content
5. GPX lines are drawn on the map using the existing `activities` and `activityStarts` sources

### Mobile Dashboard Integration

On mobile devices, the user dashboard is integrated into the bottom sheet drawer (`DetailBottomSheet`) as a tab:

- **Details Tab**: Shows peak/challenge details (only when a detail is selected)
- **My Activity Tab**: Shows user's summits and activities for the selected peak (only for authenticated users viewing a peak)
- **Community Tab**: Shows public summit history from all users (only when viewing a peak)
- **Discover Tab**: Shows visible peaks and challenges in the current map viewport
- **Dashboard Tab**: Shows user's recent summits, challenge progress, and sync status

**Default Tab Behavior:**
- When selecting a peak (authenticated): Opens My Activity tab
- When selecting a peak (not authenticated): Opens Community tab
- On initial load (authenticated): Defaults to Dashboard tab
- On initial load (not authenticated): Defaults to Discover tab

The desktop version keeps the dashboard as a separate slide-out panel on the right side, triggered by the dashboard button in the global navigation.

### SEO Strategy

Static pages render two types of content:

1. **JSON-LD Structured Data**: Schema.org markup for search engines
2. **Hidden Article Content**: `sr-only` class makes content invisible to users but accessible to:
   - Search engine crawlers
   - Screen readers
   - Users with CSS disabled

This ensures full SEO value while maintaining the app-like experience.

### Important Notes

1. **Always use `<Link>` or `router.push()`** for navigation to ensure soft navigation
2. **Never use plain `<a>` tags** for user-interactive navigation (causes full page reload)
3. **The map is initialized once** in `MapBackground` and persists across all routes
4. **Overlay state is derived from URL** - no separate state management needed

## Development

```bash
cd pathquest-frontend/frontend/pathquest
npm run dev
```

## Build

```bash
npm run build
```

Note: Build will statically generate 1000+ peak pages and all challenge pages.

