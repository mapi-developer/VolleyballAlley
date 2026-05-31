// src/app/documentation/_sections/BrowseSection.tsx
import React from 'react';

export function BrowseSection() {
  return (
    <div className="animate-in fade-in duration-300">
      <h1>Browse & RSVP API</h1>
      <p>The Browse page loops through events fetched from <code>GET /events/</code>. RSVP logic uses distinct RESTful endpoints.</p>

      <h2>RSVP Endpoints</h2>
      <ul>
        <li><strong>Join:</strong> <code>POST /rsvps/&#123;event_id&#125;/join</code></li>
        <li><strong>Leave:</strong> <code>DELETE /rsvps/&#123;event_id&#125;/leave</code></li>
        <li><strong>My Schedule:</strong> <code>GET /rsvps/me</code></li>
      </ul>

      <h2>Waitlist Automation Architecture</h2>
      <p>The backend intelligently handles full events. If a user tries to join an event where <code>current_players &gt;= max_players</code>, their status is set to <code>WAITLISTED</code>.</p>
      <p>If a <code>CONFIRMED</code> user calls the Leave endpoint, the database cascade triggers the <code>promote_next_on_waitlist</code> service, instantly converting the oldest waitlisted user to confirmed status.</p>
    </div>
  );
}