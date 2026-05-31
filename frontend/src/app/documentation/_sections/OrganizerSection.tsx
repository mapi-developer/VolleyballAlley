// src/app/documentation/_sections/OrganizerSection.tsx
import React from 'react';
import { InfoCallout } from '../_components/InfoCallout';
import { DocTable } from '../_components/DocTable';

interface OrganizerSectionProps {
  subsection: 'overview' | 'create' | 'manage';
}

export function OrganizerSection({ subsection }: OrganizerSectionProps) {
  if (subsection === 'overview') {
    const cardRowsColumns = [
      { header: "Card Level Element", accessor: "element" },
      { header: "Visual Mapping", accessor: "visual" },
      { header: "Technical Data / Fallback Behavior", accessor: "technical" }
    ];

    const cardRowsData = [
      { element: "Row 1: Title & Status", visual: "Event Name | Status Badge | Pencil Icon", technical: "Renders title text, computes status string enum, routes to EditEventSheet via UUID context keys." },
      { element: "Row 2: Chrono Frame", visual: "Calendar Icon | Date | Start Time", technical: "Transforms raw database UTC strings to localized formats using parseBackendDate helper tools." },
      { element: "Row 3: Court Location", visual: "Map Pin Icon | Location String", technical: "Prints raw string address. Automatically displays 'Location TBD' if left null in database configuration." },
      { element: "Row 4: Cap Count", visual: "User Group Icon | x / Max Players", technical: "Live capacity metric calculated as confirmed attendees against max constraints. Appends 'Players Joined'." },
      { element: "Row 5: Progress Fill Gauge", visual: "Horizontal Tailwind Progress Bar", technical: "Visual percentage component calculated dynamically via standard layout ratios: (current / max) * 100." }
    ];

    return (
      <div className="animate-in fade-in duration-300 space-y-12">
        {/* Intro */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-4">
            Feature Screen
          </div>
          <h1>Organizer Dashboard (Host Page)</h1>
          <p className="text-xl text-slate-500 mb-6 leading-relaxed">
            The Host Page acts as the exclusive operational dashboard for community managers. It provides a clean workspace to initialize games, audit active rosters, process waitlists, and review archived game logs.
          </p>
          <hr className="border-slate-200 my-4" />
        </div>

        {/* SUBTOPIC ANCHOR: Dashboard Control Panel */}
        <section id="dashboard-layout" className="scroll-mt-20 target:ring-2 target:ring-blue-500 target:ring-offset-8 rounded-xl">
          <h2>1. Dashboard Layout Control Panel</h2>
          <p className="text-slate-600">
            The top control layout groups administrative commands with a view filter switch row layout, providing total visibility over past and future schedules.
          </p>
          
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 my-4 space-y-4">
            <h4 className="font-bold text-slate-800 m-0">Primary Frame Subcomponents:</h4>
            <ul className="text-sm space-y-2 mb-0">
              <li>
                <strong>Screen Header Title:</strong> Renders <code>Organizer Dashboard</code> styling variables cleanly within the layout frame.
              </li>
              <li>
                <strong>"+ New Event" Action CTA:</strong> High-visibility control button targeting your application's <code>CreateEventSheet</code> form modal drawer mechanism.
              </li>
              <li>
                <strong>Timeline Scope Toggle Switch:</strong> A horizontal layout tracking component that provides instant switches between system filters:
                <ul className="text-xs text-slate-500 mt-1 pl-4 list-disc space-y-1">
                  <li><strong>Current View Mode:</strong> Populates the lower container exclusively with match elements matching <code>upcoming</code> or <code>ongoing</code> parameters.</li>
                  <li><strong>History View Mode:</strong> Filters out active schedules to index complete listings of matches whose expiration dates have passed.</li>
                </ul>
              </li>
            </ul>
          </div>
        </section>

        {/* SUBTOPIC ANCHOR: Hosted Card Specification */}
        <section id="hosted-cards" className="scroll-mt-20 target:ring-2 target:ring-blue-500 target:ring-offset-8 rounded-xl">
          <h2>2. Hosted Events Card Row Mapping</h2>
          <p className="text-slate-600">
            Each event container acts as an independent component tile rendering granular multi-row metrics computed directly from database tables.
          </p>

          <DocTable columns={cardRowsColumns} data={cardRowsData} />

          <InfoCallout type="info" title="Dynamic Status Computations">
            Event status flags (<code>upcoming</code>, <code>ongoing</code>, <code>passed</code>) adapt programmatically at runtime by evaluating database timestamps against the client device's active local time matrix.
          </InfoCallout>
        </section>
      </div>
    );
  }

  if (subsection === 'create') {
    return (
      <div className="animate-in fade-in duration-300">
        <h1>Creating Events (API Payload Structure)</h1>
        <p>The backend tightly governs access permissions to creation endpoints by enforcing the <code>Depends(get_current_organizer)</code> middleware layer statement parameters.</p>

        <h2>Database Payload Contracts</h2>
        <p>Submitting the creation form maps collected layout variables directly into the application data models:</p>
        
        <pre><code>{`# Core data schemas implemented in backend models
class EventBase(SQLModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    location_name: Optional[str] = None
    price: float = 0.0
    max_players: int = 12
    revolut_tag: Optional[str] = None`}</code></pre>

        <h2>Auto-Host Confirmation Logic</h2>
        <p>To avoid instances where empty player queues are compiled at startup, successfully creating an event triggers an internal system loop. This automatically writes a <code>CONFIRMED</code> state row into the RSVP table link matrix for the creator's user profile ID.</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <h1>Managing Rosters (Roster Safeguards)</h1>
      <p>Inside the interactive edit panel, organizers can execute targeted user drops via standard administrative pipeline calls.</p>

      <h2>Host Removal Protection</h2>
      <p>To prevent organizers from accidentally kicking themselves out of their own games, component iterations block the removal UI element whenever the targeted record id matches the root host parameter keys:</p>

      <pre><code>{`// Core user safety logic validation condition map
{event.attendees.map((attendee) => (
  <div key={attendee.user_id} className="flex justify-between items-center">
    <span>{attendee.user?.first_name}</span>
    
    {/* Enforce strict identity verification loops */}
    {attendee.user_id !== event.host_id ? (
      <button onClick={() => handleKick(attendee.user_id)}>Remove Player</button>
    ) : (
      <span className="text-xs text-blue-500 font-bold bg-blue-50 px-2 py-0.5 rounded">Host</span>
    )}
  </div>
))}`}</code></pre>
    </div>
  );
}