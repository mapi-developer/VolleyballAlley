VolleyballAlley: Advanced Specification Document

App Description: A community-driven Telegram Mini App designed to manage volleyball sports events, handle RSVP logistics, facilitate skill-based matchmaking, and maintain community standards through a reputation system[cite: 226].

Core Technology Stack
* Frontend: React via Vite (Single Page Application optimized for Telegram SDK without SSR conflicts)[cite: 227].
* Backend: Python FastAPI (Asynchronous API endpoints)[cite: 228].
* Database: PostgreSQL (Relational management of users, events, and RSVPs)[cite: 229].
* Integration: Telegram Bot API (Authentication via initData, direct push messaging)[cite: 230].

1. User Roles & Access Control
* Member: Browse events, RSVP, view personal profile, receive bot notifications[cite: 231, 232].
* Organizer: All Member features, access Organizer Tab, create/modify events, manage waitlists, evaluate member skills[cite: 232, 233].
* Admin: All Organizer features, access Admin Tab, view global statistics, manage user behavior ratings (issue fines)[cite: 233, 234].

2. Gamification & Reputation System
Behavior Rating (5-Star System)
* Automated Scoring: The system automatically calculates a user's base reliability score based on their attendance record for registered games[cite: 235].
* Admin Penalties ("Fines"): Admins have the manual authority to deduct points from a user's score for community violations (e.g., bad behavior, damaging equipment, severe late cancellations)[cite: 236].

Skill Verification
* Organizer-Led Grading: Play levels are strictly verified by Organizers to ensure accurate matchmaking[cite: 237].
* Consensus Requirement: A user's skill level is only officially updated after receiving grades from at least two different Organizers[cite: 238].
* Evaluation Cooldown: Skill evaluation requests or updates are locked behind a 2-week time gap to prevent spam and allow time for actual skill progression[cite: 239].

3. Event & Court Management
Waitlist Logistics
* Automated Progression: If a confirmed player cancels, the first user on the waitlist is automatically promoted to a confirmed slot[cite: 240].
* Manual Overrides: Organizers and Admins possess the ability to manually kick registered users or instantly promote specific users from the waitlist to manage edge cases[cite: 241].

Financial Integrations
* Payment Collection: The app displays the hosting Organizer's Revolut account details[cite: 242].
* Action Buttons: A dedicated UI button on the event card allows the user to automatically generate a pre-filled "Send Request" via the Revolut platform for the specific court fee amount[cite: 243].

Location Services
* Mapping: Event locations are displayed as text addresses with a dedicated action button to securely open the exact coordinates in external Map applications (e.g., Google Maps, Apple Maps)[cite: 244].

4. Communication Ecosystem
* Bot-Driven Push Notifications: The companion Telegram bot sends direct messages (DMs) to users for all critical alerts[cite: 245].
* Alert Types: RSVP confirmations, waitlist promotions, upcoming game reminders, and skill evaluation updates[cite: 246].
* User Control: Members can customize which notifications they receive via the Profile Tab[cite: 247].

5. Frontend UI Architecture (Tab-Based)
Home Tab
* Hero Section: Displays the most relevant upcoming games or the closest games the user is already registered to attend[cite: 248].

Browse Games Tab
* Header: Title "Browse Games"[cite: 249].
* Search Bar: Filter events by title, city, or date[cite: 249].
* Quick Filters: Pills for most popular sorting options (e.g., 'All', 'Outdoor', 'Indoor')[cite: 250].
* Event Cards: Displays game type, date, location (Maps button), price (Revolut button), registered attendee count, Host Organizer name, and an RSVP button[cite: 251].

My Games Tab ("Your Journey")
* Stat Cards: Highlights total games attended, hours played, and most attended game type[cite: 252].
* Navigation Toggle: Switch between "Upcoming" and "History" views[cite: 253].
* Upcoming Feed: Event cards for future registered games showing status and details[cite: 253].
* History Feed: A log of past games showing user attendance status, date, and game type[cite: 254].

Profile Tab
* Identity Summary: Telegram avatar, Name, Telegram ID, Verified Play Level, and Behavior Rating out of 5 stars[cite: 255].
* Navigation List:
  * Notification Settings: Toggle alerts for new events, waitlist updates, or match reminders[cite: 256].
  * Preferences: General app settings (theme, haptics, sound)[cite: 257].
  * Credentials/About: Small info block about the application[cite: 257].

Organizer Tab (Role-Gated)
* Event Dashboard: Create new events, modify existing event details, and set court fees[cite: 258].
* Roster Management: View attendees, promote waitlisted players, kick players, and initiate the 2-week skill evaluation process for attendees[cite: 259].

Admin Tab (Role-Gated)
* Global Analytics: High-level community statistics (total hours played, active users, top organizers)[cite: 260].
* Moderation Tools: Interface to search for users, issue behavior "fines," and adjust global app parameters[cite: 261].