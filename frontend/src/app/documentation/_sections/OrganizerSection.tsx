// src/app/documentation/_sections/OrganizerSection.tsx
import React from 'react';
import { DocTable } from '../_components/DocTable';

interface OrganizerSectionProps {
  subsection: 'create' | 'manage';
}

export function OrganizerSection({ subsection }: OrganizerSectionProps) {
  if (subsection === 'create') {
    const tableColumns = [
      { header: "Field", accessor: "field" },
      { header: "Type", accessor: "type" },
      { header: "Description", accessor: "description" }
    ];

    const tableData = [
      { field: "title", type: "String", description: "Display name of the volleyball match" },
      { field: "start_time", type: "ISO Date", description: "Calculated from combined Date + Time dashboard inputs" },
      { field: "max_players", type: "Integer", description: "Hardcap constraint for the match roster (triggers automated waitlist flow)" },
      { field: "level_required", type: "Enum", description: "BEGINNER, INTERMEDIATE, ADVANCED, ALL" }
    ];

    return (
      <div className="animate-in fade-in duration-300">
        <h1>Creating Events</h1>
        <p>Organizers have access to the "Host" dashboard, allowing them to create new events. The backend automatically safeguards this via the <code>Depends(get_current_organizer)</code> dependency.</p>

        <h2>The Event Payload</h2>
        <p>The <code>CreateEventSheet</code> collects the following data to fulfill the <code>EventBase</code> SQLModel schema:</p>
        
        <DocTable columns={tableColumns} data={tableData} />

        <h2>Auto-Host Registration</h2>
        <p>When an Organizer creates an event, the backend automatically generates a <code>CONFIRMED</code> RSVP record linking the Organizer to their new event to ensure they are on the roster.</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <h1>Managing Rosters</h1>
      <p>In the <code>EditEventSheet</code>, hosts can view the current attendees. The UI implements safety checks to prevent hosts from accidentally removing themselves.</p>

      <h2>Host Safeguard Logic</h2>
      <pre><code>{`{event.attendees.map((a) => (
  <div key={a.user_id} className="flex justify-between">
    <span>{a.user?.first_name}</span>
    {a.user_id !== event.host_id ? (
      <button onClick={() => handleKick(a.user_id)}>Remove</button>
    ) : (
      <span className="text-xs text-blue-500 font-bold">Host</span>
    )}
  </div>
))}`}</code></pre>
    </div>
  );
}