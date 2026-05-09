1. Recommended Tech Stack

    Framework: FastAPI (Asynchronous Python).

    Database: PostgreSQL. Relational data is critical for managing the complex many-to-many relationships between Users, Events, and RSVPs.

    ORM: SQLAlchemy or SQLModel (for clean async DB interactions).

    Authentication: Telegram initData HMAC-SHA-256 validation.

2. Database Schema (PostgreSQL)

Based on your mock data in host/page.tsx and browse/page.tsx, the following schema is required:
Users Table

Stores Telegram profile data and community standings.

    id: Integer (Primary Key - Telegram User ID).

    username, first_name, last_name, photo_url: Strings (From TG SDK).

    role: Enum ('member', 'organizer', 'admin').

    verified_play_level: Enum ('Beginner', 'Intermediate', 'Advanced', 'All').

    reliability_score: Float (0.0 to 5.0, automatically calculated).

    last_evaluation_at: Timestamp (To enforce the 2-week cooldown).

Events Table

Stores match logistics created by organizers.

    id: UUID.

    title, description: Strings.

    type: Enum ('Indoor', 'Outdoor').

    level_required: Enum ('Beginner', 'Intermediate', 'Advanced', 'All').

    start_time, end_time: Timestamps (ISO format).

    location_name, address: Strings.

    price: Integer (Amount in HUF/EUR).

    revolut_tag: String (Organizer's payment link).

    max_players: Integer.

    host_id: Integer (Foreign Key to Users.id).

    status: Enum ('Open', 'Full', 'Completed', 'Cancelled').

Registrations (RSVP) Table

Tracks attendance and waitlists.

    user_id, event_id: Composite Primary Key.

    status: Enum ('confirmed', 'waitlisted').

    joined_at: Timestamp (Used for FIFO waitlist promotion).

    attended: Boolean (Marked by organizer after game to update rating).

3. Backend Logic & Edge Cases

    HMAC Security: Every request must include the initData string in the header (x-telegram-init-data) to verify the user's identity on the server side.

    Automated Waitlist Promotion: When a "confirmed" user cancels their RSVP, the backend must immediately find the user with the earliest joined_at timestamp in the "waitlisted" status for that event and promote them.

    Cancellation Locks:

        5-Hour Lock: Users cannot cancel via the Home hero section within 5 hours of the match.

        2-Hour Lock: Users cannot cancel via the "My Games" tab within 2 hours.

    24-Hour Edit Lock: Organizers cannot change the date, time, or location of an event if the match starts in less than 24 hours.

    Consensus Skill Grading: A user's verified_play_level only updates once two different organizers have submitted the same grade for them.
