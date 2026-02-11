# PathQuest Frontend Guide

## Tech Stack
- Next.js 16 (App Router)
- React 19 + TypeScript
- TailwindCSS 4.x
- Mapbox GL JS
- NextAuth.js (Strava OAuth)
- Zustand (state management)
- TanStack Query (client-side data)
- Radix UI + shadcn/ui

## Key Architecture Patterns

### Map Stays Mounted
The Mapbox map is persistent. Overlays (panels, sheets) change via URL params.

### URL-Driven State
Map state stored in URL for shareability:
- `lat`, `lng`, `zoom` - Map position
- `peakId`, `challengeId` - Selected entity

### Overlay Manager
`UrlOverlayManager` orchestrates:
- Desktop: Side panels (DiscoveryDrawer left, DetailPanel right)
- Mobile: Bottom sheet with tabs

## Component Organization

```
src/components/
  ui/                    # Shared UI (detail-panel-header, stats-grid)
  discovery/             # Discovery lists and empty states
  lists/                 # List item components
  overlays/
    desktop/             # Side panel components
    mobile/              # Bottom sheet components
  map/                   # Map-related components
```

## Data Fetching Patterns

### Server Actions (SSR)
```typescript
// src/actions/peaks/getPeakDetails.ts
"use server";
import { getPeakById } from "@pathquest/shared";
// ...
```

### React Query (Client-side)
```typescript
// For Omnibar search, dashboard data, etc.
const { data } = useQuery({
  queryKey: ['peaks', 'search', query],
  queryFn: () => searchPeaks(query),
});
```

## Map Hooks

```typescript
usePeakMapEffects()      // Peak detail map interactions
useChallengeMapEffects() // Challenge detail map interactions
useMapSource()           // Manages GeoJSON sources with retry
useDrawerHeight()        // Mobile drawer height with snap points
```

## Auth Pattern

```typescript
// Auth-gated action
const { openAuthModal } = useRequireAuth();

const handleAction = () => {
  if (!session) {
    openAuthModal();
    return;
  }
  // ... proceed
};
```

## Static Generation (ISR)

- Top 1000 peaks pre-generated
- All challenges pre-generated
- Remaining peaks: on-demand ISR (24h revalidation)
- URLs: `/peaks/[id]`, `/challenges/[id]`
