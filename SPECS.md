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