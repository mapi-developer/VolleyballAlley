VolleyballAlley: Advanced Specification Document

App Description: A community-driven Telegram Mini App designed to manage volleyball sports events, handle RSVP logistics, facilitate skill-based matchmaking, and maintain community standards through a reputation system.

1. Core Technology Stack

Frontend: React via Vite (Single Page Application, utilizing Tailwind CSS and Lucide-React icons, optimized for Telegram SDK without SSR conflicts).

Backend: Python FastAPI (Asynchronous API endpoints).

Database: PostgreSQL (Relational management of users, events, and RSVPs).

Integration: Telegram Bot API (Authentication via initData, direct push messaging).

2. User Roles & Access Control

Member: Can browse events, RSVP, view their personal profile, manage notification settings, and receive bot notifications.

Organizer: All Member features. Unlocks the "Host" (Organizer) tab. Can create new events, modify existing event details, manage waitlists, and evaluate member skills.

Admin: All Organizer features. (Future scope: access to Admin Tab for global statistics and moderation tools like issuing fines).

3. Gamification & Reputation System

Behavior Rating (5-Star System)

Automated Scoring: The system automatically calculates a user's base reliability score based on their attendance record for registered games.

Admin Penalties ("Fines"): Admins have the manual authority to deduct points from a user's score for community violations (e.g., severe late cancellations, bad behavior).

Skill Verification

Organizer-Led Grading: Play levels (Beginner, Intermediate, Advanced, All Levels) are strictly verified by Organizers to ensure accurate matchmaking.

Consensus Requirement: A user's skill level is only officially updated after receiving grades from at least two different Organizers.

Evaluation Cooldown: Skill evaluation requests/updates are locked behind a 2-week time gap to prevent spam and allow time for actual skill progression.

4. Event & Court Management

Event Data Structure
Events track: Title, Type (Indoor/Outdoor), Level, Date, Time, Location Name, Exact Address, Description, Price, Host, Current Attendees, Max Attendees, and Status (open/full).

Waitlist Logistics

Automated Progression: If a confirmed player cancels, the first user on the waitlist is automatically promoted to a confirmed slot.

Status UI: The app dynamically switches the RSVP button to "Join Waitlist" (yellow) when attendees reach maximum capacity.

Financial Integrations

Payment Collection: The app displays the hosting Organizer's payment details (e.g., Revolut).

Action Buttons: Dedicated "Pay" UI buttons on Event Cards and Detail Views allow the user to easily fulfill the court fee.

Location Services

Mapping: Event locations show both a venue name and exact text address. Dedicated "Maps" action buttons allow users to securely open exact coordinates in external Map applications.

5. Communication Ecosystem

Bot-Driven Push Notifications: The companion Telegram bot sends direct messages (DMs) to users for critical alerts.
Users can toggle these specific alerts on/off in the app:

New Match Alerts: Notifies when a new game is posted matching the user's play level and area.

Waitlist Promotions: Instant alert if a spot opens up and the user is promoted from the waitlist.

Game Reminders: Automated reminders sent 24 hours and 2 hours before confirmed games.

Skill Evaluations: Alerts when an Organizer verifies and updates their official play level.

6. Frontend UI Architecture

The application utilizes a fixed top header, a dynamic scrollable main content area, and a fixed bottom navigation bar (which transforms into a contextual Action Bar during sub-views).

Home Tab

Hero Section: Highlights the number of upcoming games for the week. Features a smart "View Next Game" button that instantly opens the details of the nearest joined event.

Recommended Feed: Displays a filtered list of Event Cards for upcoming games the user has not yet joined.

Browse Games Tab

Search & Filter: Includes a sticky top search bar (by city, level, host) and horizontal scrollable quick-filter pills (All, Indoor, Outdoor, Advanced, Beginner).

Global Feed: Displays all available Event Cards.

My Games Tab ("Your Journey")

Stat Cards: Highlights total games attended, hours played, and favorite game type.

Navigation Toggle: Two-way toggle between "Upcoming" and "History" views.

Upcoming Feed: Shows events the user is currently RSVP'd to.

History Feed: A historical log of past events attended.

Host Tab (Organizer Dashboard - Role-Gated)

Dashboard Header: Features a "New Event" button that launches a full-screen event creation form.

Hosted Events Feed: A list of games created by the user, with quick-access "Edit" buttons.

Pending Evaluations: A section prompting the organizer to verify the skills of players from recently completed matches.

Event Form (Sub-view): Handles inputs for Title, Type, Level, Date, Time, Location Name, Exact Address, Price, Max Players, and Description.

Profile Tab

Identity Summary: Visualizes the user's avatar, Name, Telegram ID, Verified Play Level badge, and Behavior Rating (out of 5 stars).

Menu List: Navigation to Notification Settings, App Preferences, and About sections.

Notification Settings (Sub-view): iOS-style toggle switches for managing bot DM preferences.

Shared Sub-Views & Components

Event Card: A compact summary displaying type, title, date, time, attendee count, host, Maps button, Pay button, and a dynamic RSVP button.

Event Detail View: An immersive full-page overlay. Features a colorful cover block, detailed date/time/location/payment rows, full description, and a visual progress bar indicating remaining attendee spots. The bottom navigation is replaced by a sticky RSVP action bar.







** DB SPECS **

A. Users Table

The source of truth for every player and organizer.

    id: BigInt (Primary Key - Telegram User ID).

    username, first_name, photo_url: Strings.

    role: Enum (member, organizer, admin).

    verified_level: Enum (Beginner, Intermediate, Advanced, All).

    reliability_score: Float (0.0 to 5.0).

    last_evaluation_at: Timestamp (to enforce the 2-week cooldown).

B. Events Table

Stores match logistics created by Organizers.

    id: UUID (Primary Key).

    host_id: BigInt (Foreign Key → Users.id).

    title, description, location_name, address: Strings.

    start_time, end_time: Timestamps.

    price: Integer (HUF/EUR).

    revolut_tag: String.

    max_players: Integer.

    status: Enum (Open, Full, Completed, Cancelled).

C. RSVPs (Registrations) Table

Handles the many-to-many relationship and waitlist FIFO.

    user_id: BigInt (Composite PK / FK).

    event_id: UUID (Composite PK / FK).

    status: Enum (confirmed, waitlisted).

    joined_at: Timestamp (Critical for FIFO waitlist promotion).

    attended: Boolean (Used by organizers post-game to calculate reliability).

D. BehaviorLog Table

Stores admin-issued "fines" and statistics.

    id: Integer (PK).

    user_id: BigInt (FK → Users.id).

    admin_id: BigInt (FK → Users.id).

    penalty_points: Float (Points deducted from reliability score).

    reason: String.



DB logic:

User: 
 - automatic add user if firtsly launch mini-app
 - ability to update user role
 - ability to change user data (username, telegram_id, ferified_level, etc.)

Event:
 - get all events
 - get events with filtering (level, location, name, etc.)
 - create event (with checking that user who creates is at least orginizer role)
 - update event (with checking that user who updating is a host)
 - delete event (with deletion of registration data connected with this event)

Registration:
 - get registrations by event_id
 - get registrations by user_id
 - create registration (by RSVP button user can create registration)
 - update registration (if host manually promote or kicking user from registration status of registration needs to be changed)
 - delete registration (if user cancel RSVP)

Behavior Ratings:
 - get reports by admin_id
 - get reports by user_id
 - create report (when admin want to fine user after game)
 - update report (it also possible)
 - delete report (if it was accident, or later solved)

 DB Struct:

    backend/
    ├── app/
    │   ├── api/
    │   │   ├── deps.py          # Shared dependencies (Auth & RBAC)
    │   │   └── routes/
    │   │       ├── users.py      # Profile & Role management
    │   │       ├── events.py     # Match creation & Filtering
    │   │       ├── rsvps.py      # Join/Leave & Host roster management
    │   │       └── reports.py    # Admin Behavior Ratings
    │   ├── core/
    │   │   ├── config.py         # Environment variables (Pydantic Settings)
    │   │   └── security.py       # Telegram HMAC validation logic
    │   ├── db/
    │   │   ├── database.py       # Engine & Session setup
    │   │   └── models.py         # SQLModel Table Definitions
    │   ├── services/
    │   │   ├── waitlist.py       # Automated FIFO promotion logic
    │   │   └── scoring.py        # Reliability score calculations
    │   └── main.py               # Application entry point & Lifespan
    ├── .env                      # Secrets (Bot Token, DB URL)
    ├── docker-compose.yml        # PostgreSQL container config
    └── requirements.txt          # Python dependencies


FRONTEND Struct:

frontend/
├── src/
│   ├── app/
│   │   ├── browse/page.tsx 
│   │   ├── host/page.tsx 
│   │   ├── my-games/page.tsx 
│   │   ├── profile/page.tsx 
│   │   ├── glovals.css 
│   │   ├── layout.tsx 
│   │   └── page.tsx 
│   ├── components/
│   │   ├── BottomSheet.tsx
│   │   ├── CreateEventSheet.tsx
│   │   ├── EditEventSheet.tsx
│   │   ├── Footer.tsx
│   │   ├── FormField.tsx
│   │   ├── GameCard.tsx
│   │   └── Header.tsx 
│   ├── context/
│   │   └── UserContext.tsx 
│   ├── lib/
│   │   └── api.ts 
│   └── global.d.ts
├── .env.local
├── .gitignore
├── Dockerfile
├── next.config.js
└── postcss.config.mjs

By Page Description:

Profile Page:
 - Header (Page title, Profile avatar icon button)
 - User Info Block (name, telegram tag, Profile photo, Level, Behavior rating)
 - Account Preferences Block:
    - Notifications Settings -> Toggles: (New Game Alerts, WAitlist Updates, Game Reminders, Administrative)
    - App Preferences (Role change toggle (for developing only), Setup Revolut tag (for autofill when user creates event))
    - Support & Review (Lead to Help & Feedback or App review popup)
    - Credentials & About (General information about app, FAQ)
 - Footer with page navigation buttons (Home, Browse, My Games, Profile [Additional Host Button for roles organizer and higher])

Create Event Popup:
 - Top bar (to close tab by touching this bar)
 - Title "Create New Event" + close button
 - Event Title and Player Level Block (Mandatory to fill):
    - Pencil icon and "Event Title" | Player Level (one row)
    - Input Field (for title) | dropdown option (All, Beginner, Intermediate, Advanced)
 - Event Description (optional to fill):
    - Description icon + "Description"
    - input field (for description)
  - Date and Max Players block:
    - calendar icon + "Date" | players icon + "Max Players" (one row)
    - datecalendar choose option | Input field for maximum players amount (one row)
 - Time Slot block:
    - clock icon + "Time Slot"
    - time choose option | "to" | time choose option (one row)
 - Location & Map block:
    - map icon + "Location & Map link"
    - input field 
 - Event Fee and Player level requirements block:
    - cash icon + "Event Fee" | shield icon + "Player Level" (one row)
    - input field for fee (0 default [free]) | dropdown options (All levels, Beginner, Intermediate, Advanced) (one row)
 - Revolut tag block:
    - chain icon + "Revolut Tag"
    - input field for tag (prefill if user set tag in App Preferences)
 - Thin separator line
 - Small reminder: "Host: {host Name}"
 - Confirm & Launch Event button

Edit Event Popup:
 - Top bar (to close tab by touching this bar)
 - Title "Manage Event" + close button
 - Event Title and Player Level Block:
    - Pencil icon and "Event Title" | Player Level (one row)
    - Input Field (for title) | dropdown option (All, Beginner, Intermediate, Advanced)
 - Event Description (optional to fill):
    - Description icon + "Description"
    - input field (for description)
  - Date and Max Players block:
    - calendar icon + "Date" | players icon + "Max Players" (one row)
    - datecalendar choose option | Input field for maximum players amount (one row)
 - Time Slot block:
    - clock icon + "Time Slot"
    - time choose option | "to" | time choose option (one row)
 - Location & Map block:
    - map icon + "Location & Map link"
    - input field 
 - Event Fee and Player level requirements block:
    - cash icon + "Event Fee" | shield icon + "Player Level" (one row)
    - input field for fee (0 default [free]) | dropdown options (All levels, Beginner, Intermediate, Advanced) (one row)
 - Revolut tag block:
    - chain icon + "Revolut Tag"
    - input field for tag (prefill if user set tag in App Preferences)
 - Thin separator line
 - Attendes Manage block:
  - "Attendes {x/max_players}" title
  - List of players attended (First user always host with shield icon (can't be removed)):
  - Waiting list of players who are registered but main attended list is already full
  - Search bar to add players manuallyu by name or telegram tag
  (Host user can manipulate with attendes (remove them from main list, promote from waiting list (even if list full so it can be 10/9), remove people completle or move between lists))
 - "Save Changes" in Event button
 - Cancel & Delete Event button (when clicked open additional confirmation to confirm deletion with buttons [Yes, delete & No, Keep It])

Event Details Popup:
 - Top bar (to close tab by touching this bar)
 - Title "Game Details" + close button
 - Event Title and Player Level Block:
    - Pencil icon and "Event Title" | Player Level (one row)
    - Event Title | Player Level requirements
 - Date and Start Time block:
 - Event Fee and Capacity info block:
 - Event Description (optional to fill):
    - Description icon + "Description"
 - Location & Map block:
    - map icon + "Location & Map link"
 - Revolut tag block:
    - chain icon + "Revolut Tag" button leads to revolut
 - Thin separator line
 - Message to host button (leads to DM's to host or to public chat of VolleyBall valley with host tag message prefilled if DM's closed)
 - RSVP Button with confirmation (Show You're Orginizer if it's host user)

Host Page: 
 - Header (Page title, Profile avatar icon button)
 - Block with title: Organizer Dashboard and button "+ New Event" that open create event popup
 - Hosted events List block:
  - Event Card with main info:
    - Event Name | event status (upcoming, ongoing, passed) | pencil edit event icon button on the right side (one row)
    - Date summary information (calendar Icon | Date | Start time)
    - Location summary (Location TBD if not setted yet)
    - players joined amount (players icon | x/max_players | "Players Joined")
    - fill bar that shows how event filled
 - Footer with page navigation buttons (Home, Browse, My Games, Profile [Additional Host Button for roles organizer and higher])

My Games Page:
 - Header (Page title, Profile avatar icon button)
 - Stats Summary block (Three stats cards):
    - Upcoming games amount:
        - Number of Games upcoming
        - "Upcoming" title below
    - Total games amount:
        - Number of Total Games Played
        - "Total Games" title below
    - Hours played amount:
        - Number of Hours played
        - "Hours Played" title below
 - "Upcoming Schedule" title
 - List of upcoming games:
    - Event Card with main info (by click on event card user can open event details popup):
        - Event Name | event status (upcoming, ongoing, passed) | host label if user is a host (one row)
        - Date summary information (calendar Icon | Date | Start time)
        - Location summary (Location TBD if not setted yet)
        - players joined amount (players icon | x/max_players | "Players Joined")
        - fill bar that shows how event filled
 - Footer with page navigation buttons (Home, Browse, My Games, Profile [Additional Host Button for roles organizer and higher])

Browse Page:
 - Header (Page title, Profile avatar icon button)
 - Search bar (to find events by Title, Host, Address, etc.)
 - Common filters scrolling panel (All, Indoor, Outdoor, Beginner, Intermediate, Advanced)
 - List of event cards:
    - Event Card with main info (by click on event card user can open event details popup):
        - Event type (indoor, outdoor) label | if user joined this event joined or in waitlist label on the right part (one row)
        - Event Name | event status (upcoming, ongoing, passed) | host label if user is a host (one row)
        - Date summary information (calendar Icon | Date | Start - End time)
        - players joined amount (players icon | x/max_players | "Players Joined") | host name
        - Maps link Button | Revolut payment button (card icon | fee amount) (one row)
        - RSVP button (if user host this event show "You're the Host", RSVP if user can register to event or waitlist, Cancle RSVP if user already joined or in waitlist)
 - Footer with page navigation buttons (Home, Browse, My Games, Profile [Additional Host Button for roles organizer and higher])

Home Page:
 - Header (Page title, Profile avatar icon button)
 - Player Level and Behavior rating cards block
 - Next UP block | See All link text on the right that leads to My Games Page
 - Next game info card:
    - Upcoming Match label | if user is a host "You're Hosting" label on the right (one row)
    - game Title
    - Date and start time information
 - Open Matches | Browse All link text leads to Browse page:
    - List of most relevant upcopming games for user (use the same cards as in Browse Page):


App Core Logic:
 - RSVP system: User can register to event if user satisfied requirement Player Level. if event isn't full user will be registered in main players list. If main list is full user still can register and will moved to waitlist (if main list will be free the user from waitlist will be promoted to main list, based on date registered). Also user can cancel registration. If notification setted on promotion user need to have dm message about it.
 