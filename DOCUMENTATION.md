# VolleyballAlley — Frontend Documentation

## 1. App Overview

**VolleyballAlley** is a mobile-first volleyball event discovery and hosting application built as a Next.js 15 (App Router) frontend. Users can browse nearby volleyball events, join games, manage their profile, and (for organizers) create and manage their own events.

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 15** (App Router, `"next": "^15.3.3"`) |
| Language | **TypeScript 5.8** |
| Styling | **Tailwind CSS 4** (`"@tailwindcss": "^4.1.8"`) with CSS custom properties for theming |
| Icons | **Lucide React** (`lucide-react` 0.525.0) |
| HTTP Client | **Axios** (`axios` 1.11.0) |
| State | React Context API (`UserContext`) |
| Node.js | Requires `^20.0.0` or `^22.0.0` |

### Main Purpose

The app serves two user roles:
- **Players** who browse and join volleyball events.
- **Organizers** (users with `role: "organizer"` or `"admin"`) who can create, edit, and manage events including attendee/waitlist management.

---

## 2. Page-by-Page Description

### `/(app)/page.tsx` — Home Page
- **Route:** `/`
- **Purpose:** Landing / welcome screen for the app.
- **Features:** Displays a welcome message and quick links to main sections. Shows a "Log In with Telegram" button if the user is not authenticated. Shows stats (total games, upcoming games) and a list of recommended events based on the user's location.
- **Key components:** `StatCard`, `EventCard`, `Footer`.

### `/(app)/browse/page.tsx` — Browse Events
- **Route:** `/browse`
- **Purpose:** Browse all available volleyball events.
- **Features:** Displays events as cards, allows searching/filtering. Each card shows event details (title, date, time, location, max players). Users can tap a card to view details or attend.
- **Key components:** `EventCard`, `EventDetailsSheet`, `Footer`.

### `/(app)/host/page.tsx` — Host an Event
- **Route:** `/host`
- **Purpose:** Form for organizers to create a new volleyball event.
- **Features:** Full event creation form with fields for title, description, player level, game type (indoor/outdoor), date, time slot (start/end), location, fee (HUF), Revolut payment tag, and max players. Validates that the date is not in the past. On submit, creates the event via the API.
- **Key components:** `CreateEventSheet`, `FormField`, `Footer`.

### `/(app)/my-games/page.tsx` — My Games
- **Route:** `/my-games`
- **Purpose:** View the user's upcoming and past games.
- **Features:** Displays the user's attended and upcoming events. Includes tabs or filters for different statuses (upcoming, completed). Shows event cards with relevant details.
- **Key components:** `EventCard`, `EventDetailsSheet`, `Footer`.

### `/(app)/profile/page.tsx` — User Profile
- **Route:** `/profile`
- **Purpose:** View and manage the current user's profile information.
- **Features:** Displays the user's avatar, name, email. Shows user role (player/organizer/admin). Provides stats (total events created, events attended). Includes a settings toggle for preferences.
- **Key components:** `StatCard`, `ToggleSwitch`, `Footer`.

### `/(app)/layout.tsx` — App Layout
- **Route:** Wraps all `/(app)` routes.
- **Purpose:** Provides the shared layout for authenticated app pages.
- **Features:** Renders `Header` (top navigation bar) and `Footer` (bottom tab bar). Ensures proper spacing/padding. Wraps children with the `UserProvider` if not already provided at a higher level. Sets `enableFutureLayoutSyntax` and `clientSession` settings.

### `app/layout.tsx` — Root Layout
- **Route:** Topmost layout.
- **Purpose:** Sets up the HTML document shell.
- **Features:** Imports `globals.css`, sets `enableFutureDocumentSyntax`, `clientRoot` and other Next.js 15 App Router flags.

### `app/documentation/page.tsx` — Documentation Page (Self-Documentation)
- **Route:** `/documentation`
- **Purpose:** An in-app documentation page that renders the documentation sections defined in `_sections/`.
- **Features:** Renders the full documentation using the `DocTable` component (which renders all sections). Sections include Overview, Architecture, Home, Browse, Organizer, My Games, and Profile.
- **Key components:** `DocTable`, all `_sections/*` components, `InfoCallout`.

### `app/documentation/_components/DocTable.tsx`
- **Purpose:** Renders all documentation section components in order as a navigation table of contents.
- **Key components:** Imports and renders `OverviewSection`, `ArchitectureSection`, `HomeSection`, `BrowseSection`, `OrganizerSection`, `MyGamesSection`, `ProfileSection`, `InfoCallout`.

### `app/documentation/_components/InfoCallout.tsx`
- **Purpose:** A callout/info box component used within the documentation to highlight important notes, tips, or warnings.

### Documentation Sections (`_sections/`)
| File | Route | Content |
|---|---|---|
| `OverviewSection.tsx` | — | High-level app overview, tech stack, key features. |
| `ArchitectureSection.tsx` | — | App Router structure, layout hierarchy, route groups. |
| `HomeSection.tsx` | — | Home page details: layout, stats display, recommended events. |
| `BrowseSection.tsx` | — | Browse page details: event cards, search, event details sheet. |
| `OrganizerSection.tsx` | — | Host page details: event creation form, validation, API calls. |
| `MyGamesSection.tsx` | — | My Games page details: filtering, event display. |
| `ProfileSection.tsx` | — | Profile page details: user info, stats, settings. |

---

## 3. Component Library

### Page Layout Components

| Component | File | Purpose |
|---|---|---|
| `Header` | `components/Header.tsx` | Fixed top bar (h-16) with page title (derived from pathname) and user avatar dropdown menu (Profile link, Support popup). |
| `Footer` | `components/Footer.tsx` | Fixed bottom tab bar (h-20) with nav items: Home, Browse, My Games, Host (organizers only), Profile. Uses `useUser().role` to conditionally show Host. Toggleable visibility via `setFooterVisible`. |
| `BottomSheetLayout` | `components/BottomSheetLayout.tsx` | Layout wrapper for bottom sheet content. |

### UI Components

| Component | File | Purpose |
|---|---|---|
| `BottomSheet` | `components/BottomSheet.tsx` | A bottom-sheet modal that slides up from the bottom. Used for event details, event creation/editing, and support forms. Controlled via `isOpen`/`onClose` props. |
| `ConfirmDialog` | `components/ConfirmDialog.tsx` | Confirmation dialog for destructive actions (e.g., delete event). |
| `FormField` | `components/FormField.tsx` | Form field wrapper with label and icon. Used across CreateEventSheet and EditEventSheet. Renders a field label (uppercase, tracking-widest) above an input/select/textarea. |
| `StatCard` | `components/StatCard.tsx` | Stats display card with title, value (large font), and optional icon. Used on Home and Profile pages. |
| `ToggleSwitch` | `components/ToggleSwitch.tsx` | Toggle switch component for settings (e.g., dark mode). |
| `ThemeSync` | `components/ThemeSync.tsx` | Component that syncs the app theme (light/dark) with the system preference and/or user settings. |

### Event Components

| Component | File | Purpose |
|---|---|---|
| `EventCard` | `components/EventCard.tsx` | Card displaying a single volleyball event. Shows title, date, time, location, max players, price. Has a tap handler for event details. |
| `EventDetailsSheet` | `components/EventDetailsSheet.tsx` | Bottom sheet showing full event details: title, description, date/time, location, max players, attendees, price, Revolut link. Can show an "Attend" button or current status. |
| `CreateEventSheet` | `components/CreateEventSheet.tsx` | Bottom sheet with a full form to create a new event. Fields: title, description, level, type, date, max players, start time, end time, location, fee (HUF), Revolut tag. Submits via `api.createEvent()`. |
| `EditEventSheet` | `components/EditEventSheet.tsx` | Bottom sheet with a full form to edit an existing event plus attendee/waitlist management. Handles: title, description, level, type, date, max players, time slot, location, fee, Revolut tag. Also manages attendees (promote/demote/remove) and waitlist. Has delete confirmation with `api.deleteEvent()`. **Important:** Has a `isLocked()` check that prevents edits within 6 hours of the event start time. |
| `AttendeeManager` | `components/AttendeeManager.tsx` | Component for managing attendees and waitlist within events. |

---

## 4. State Management / Context

### `UserContext` (`context/UserContext.tsx`)

The `UserContext` is the primary state management mechanism for the app. It is a React Context that provides:

- **`user`** — The current logged-in user object (typically from Telegram auth). Contains fields like `id`, `first_name`, `photo_url`, `email`, `role`, etc.
- **`setUser`** — Setter for the user object.
- **`role`** — Derived from `user.role`, used for conditional rendering (e.g., showing/hiding the Host nav item).
- **`footerVisible`** — Boolean controlling whether the bottom Footer is shown. Used by Header's support form to hide the footer when typing.
- **`setFooterVisible`** — Setter for footer visibility.
- **`isLoading`** — Loading state during user initialization.

The context is provided at the layout level (`UserProvider`) and consumed by components/pages via `useUser()`.

---

## 5. API Layer

### `lib/api.ts` (`/home/matvei/Projects/VolleyballAlley/frontend/src/lib/api.ts`)

The API layer is a module that exports an `api` object with the following methods:

| Method | Purpose |
|---|---|
| `api.createEvent(data)` | Create a new volleyball event |
| `api.updateEvent(id, data)` | Update an existing event |
| `api.deleteEvent(id)` | Delete/cancel an event |
| `api.getEvents(params)` | Fetch event list with optional query params (location, date, etc.) |
| `api.getEvent(id)` | Fetch a single event by ID |
| `api.joinEvent(id)` | Join an event as an attendee |
| `api.leaveEvent(id)` | Leave an event |
| `api.promoteToAttendee(eventId, userId)` | Promote a user from waitlist to attendee |
| `api.demoteToWaitlist(eventId, userId)` | Demote a user from attendee to waitlist |
| `api.removeAttendee(eventId, userId)` | Remove a user from attendees or waitlist |
| `api.getUserProfile()` | Fetch current user's profile |
| `api.updateUserProfile(data)` | Update current user's profile |

The API client uses **Axios** as the HTTP client. It is configured with:
- A base URL (likely from environment variables).
- Request/response interceptors for auth token handling (Telegram auth token).
- Proper error handling with axios error responses.

### Environment Configuration

The `.env.local` file (at `/home/matvei/Projects/VolleyballAlley/frontend/.env.local`) contains the backend API URL and any other environment-specific configuration needed for the frontend.

---

## 6. Styling / Theming

### Tailwind Configuration (`tailwind.config.ts`)

Located at `/home/matvei/Projects/VolleyballAlley/frontend/tailwind.config.ts`. Configures:
- The `app-*` prefixed color tokens (e.g., `app-bg`, `app-accent`, `app-text-primary`, etc.).
- Theme-aware custom properties that map to CSS variables.
- Animation utilities (fade-in, animate-in).
- Content paths for scanning components.

### Global Styles (`app/globals.css`)

Located at `/home/matvei/Projects/VolleyballAlley/frontend/src/app/globals.css`. Defines:

#### CSS Custom Properties (Light Theme — default `:root`)
| Variable | Light Value | Dark Value |
|---|---|---|
| `--app-bg` | `#ffffff` | `#17212B` |
| `--app-card` | `#ffffff` | `#1C2B38` |
| `--app-inset` | `#f3f4f6` (gray-100) | `#182533` |
| `--app-active` | `#e5e7eb` (gray-200) | `#243343` |
| `--app-accent` | `#3b82f6` (blue-500) | `#4AA2E3` |
| `--app-accent-bg` | `#eff6ff` (blue-50) | `rgba(74, 162, 227, 0.15)` |
| `--app-text-primary` | `#111827` (gray-900) | `#FFFFFF` |
| `--app-text-secondary` | `#6b7280` (gray-500) | `#7D8B99` |
| `--app-inverted` | `#111827` | `#FFFFFF` |
| `--app-inverted-text` | `#ffffff` | `#17212B` |
| `--app-warning` | `#f59e0b` (amber-500) | `#fbbf24` (amber-400) |
| `--app-warning-bg` | `#fffbeb` (amber-50) | `rgba(245, 158, 11, 0.15)` |
| `--app-success` | `#10b981` (emerald-500) | `#34d399` (emerald-400) |
| `--app-success-bg` | `#ecfdf5` (emerald-50) | `rgba(16, 185, 129, 0.15)` |
| `--app-error` | `#ef4444` (red-500) | `#f87171` (red-400) |
| `--app-error-bg` | `#fef2f2` (red-50) | `rgba(239, 68, 68, 0.15)` |

#### Dark Mode
- Automatic via `@media (prefers-color-scheme: dark)`.
- The dark palette uses a navy/teal base (`#17212B`) with adjusted accent and text colors for readability on dark backgrounds.

#### Color Naming Convention
All Tailwind classes use the `app-*` prefix:
- `bg-app-bg` — background
- `bg-app-card` — card backgrounds
- `bg-app-inset` — input/field backgrounds
- `text-app-text-primary` / `text-app-text-secondary` — text
- `bg-app-accent` — primary action button color
- `bg-app-warning` / `bg-app-success` / `bg-app-error` — status colors
- `text-app-accent` — link/primary text color
- `border-app-active` — borders/dividers

#### Keyframe Animations
- `fadeIn`: fade + translateY from 8px → 0.
- `.animate-in` utility: 300ms duration, `cubic-bezier(0.4, 0, 0.2, 1)`.

---

## 7. Architecture Notes

### App Router Structure

```
frontend/src/app/
├── layout.tsx                          # Root document layout (Next.js 15 flags)
├── globals.css                         # Global styles, CSS variables, theming
├── (app)/                              # Route group: /
│   ├── layout.tsx                      # App layout (Header + Footer + UserProvider)
│   ├── page.tsx                        # Home (/)
│   ├── browse/page.tsx                 # Browse events (/browse)
│   ├── host/page.tsx                   # Create events (/host)
│   ├── my-games/page.tsx               # User's games (/my-games)
│   └── profile/page.tsx                # User profile (/profile)
└── documentation/                      # In-app documentation (/documentation)
    ├── page.tsx                        # Documentation page entry
    ├── _components/
    │   ├── DocTable.tsx                # Renders all sections in order
    │   └── InfoCallout.tsx            # Info callout component
    └── _sections/
        ├── OverviewSection.tsx
        ├── ArchitectureSection.tsx
        ├── HomeSection.tsx
        ├── BrowseSection.tsx
        ├── OrganizerSection.tsx
        ├── MyGamesSection.tsx
        └── ProfileSection.tsx
```

### Layout Hierarchy

1. **Root layout** (`app/layout.tsx`) — Sets up the HTML shell, imports `globals.css`, applies Next.js 15 App Router flags (`enableFutureDocumentSyntax`, `clientRoot`).
2. **App layout** (`(app)/layout.tsx`) — Provides `UserProvider` context, renders `Header` (fixed top bar) and `Footer` (fixed bottom tab bar), wraps children with proper spacing.
3. **Page layouts** — Each page (`page.tsx`) renders its own content area, typically with `EventCard` lists, `StatCard` displays, and form sheets.

### Route Groups

- **`(app)`** — A route group (parenthesized directory) that does not add a URL segment. All pages within `/(app)/` render at routes `/`, `/browse`, `/host`, `/my-games`, `/profile`. This group shares the common layout (`layout.tsx`) with Header + Footer.
- **`documentation/`** — A non-grouped route that does affect the URL path (`/documentation`). Contains self-documentation for the app, rendered via the `_sections/` and `_components/` subdirectories.

### Navigation Flow

- The `Footer` component provides 5 main navigation tabs: Home (`/`), Browse (`/browse`), My Games (`/my-games`), Host (`/host`, conditional), Profile (`/profile`).
- The `Header` includes a user avatar menu with a link to Profile and a Support popup (bug/feature requests and app reviews).
- Navigation uses Next.js `<Link>` components for client-side transitions.

### Key Design Decisions

- **Mobile-first:** Fixed header (h-16) and footer (h-20) with content in between. Bottom sheets for overlays.
- **Organizer-only features:** The Host route and event management (CreateEventSheet, EditEventSheet) are gated by the user's role from UserContext.
- **6-hour lock:** EditEventSheet prevents editing events within 6 hours of the start time via the `isLocked()` function.
- **Time handling:** `parseBackendDate()` in EditEventSheet handles UTC ISO strings robustly, ensuring time zone correctness for date/time inputs.
- **Theme:** No manual theme toggle — uses `prefers-color-scheme` media query for automatic light/dark switching. ThemeSync component handles system sync.
