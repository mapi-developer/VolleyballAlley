// src/app/documentation/_sections/MyGamesSection.tsx
import React from 'react';
import { InfoCallout } from '../_components/InfoCallout';
import { DocTable } from '../_components/DocTable';

interface MyGamesSectionProps {
  subsection: 'overview' | 'stats' | 'schedule';
}

export function MyGamesSection({ subsection }: MyGamesSectionProps) {
  if (subsection === 'overview') {
    const cardRowsColumns = [
      { header: "Card Level Element", accessor: "element" },
      { header: "Visual Mapping", accessor: "visual" },
      { header: "Technical Data / Fallback Behavior" , accessor: "technical" }
    ];

    const cardRowsData = [
      { element: "Row 1: Meta Headers", visual: "Event Name | Status | Host Label (Optional)", technical: "Displays event title. Appends a 'Host' badge exclusively if current_user.id === event.host_id." },
      { element: "Row 2: Chrono Block", visual: "Calendar Icon | Date | Start Time", technical: "Parses UTC backend timestamps to localized display formats." },
      { element: "Row 3: Venue Information", visual: "Map Pin Icon | Location Name", technical: "Prints raw string address, defaulting to 'Location TBD' if empty." },
      { element: "Row 4: Capacity Counter", visual: "Players Icon | x / Max Players | 'Players Joined'", technical: "Tracks live registration slots by checking active, confirmed RSVP entries." },
      { element: "Row 5: Progress Fill Gauge", visual: "Tailwind Color Fill Progress Bar", technical: "Visual fill indicator mapping slot saturation percentage dynamically." }
    ];

    return (
      <div className="animate-in fade-in duration-300 space-y-12">
        {/* Intro */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-4">
            Feature Screen
          </div>
          <h1>My Games Dashboard</h1>
          <p className="text-xl text-slate-500 mb-6 leading-relaxed">
            The My Games page serves as the player's personalized schedule and athletic summary workspace. It tallies individual participation metrics and neatly splits active matches from match histories.
          </p>
          <hr className="border-slate-200 my-4" />
        </div>

        {/* SUBTOPIC ANCHOR: Stats Summary Block */}
        <section id="stats-summary" className="scroll-mt-20 target:ring-2 target:ring-blue-500 target:ring-offset-8 rounded-xl">
          <h2>1. Stats Summary Panel</h2>
          <p className="text-slate-600">
            Positioned at the top of the interface, this component grid houses three distinct telemetry cards computing raw match configurations.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 text-center">
              <span className="block text-2xl font-black text-slate-900">3</span>
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block mt-1">Upcoming</span>
            </div>
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 text-center">
              <span className="block text-2xl font-black text-slate-900">24</span>
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block mt-1">Total Games</span>
            </div>
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 text-center">
              <span className="block text-2xl font-black text-slate-900">48</span>
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block mt-1">Hours Played</span>
            </div>
          </div>
          
          <ul className="text-sm space-y-2 text-slate-600">
            <li><strong>Upcoming Count:</strong> Tracks active reservations where `start_time + 2h` {'>'}` current_time`.</li>
            <li><strong>Total Games Count:</strong> Sum of upcoming games plus past games (all games from the <code>GET /api/v1/users/me/games</code> endpoint).</li>
            <li><strong>Hours Played:</strong> Aggregated calculation computed as: `(end_time - start_time)` summed across all past games.</li>
          </ul>

          <InfoCallout type="info" title="Interactive Navigation">
            Each stat card is a clickable button that switches the visible section below. The active card displays a highlighted accent border. The page defaults to the <strong>Upcoming</strong> section on load.
          </InfoCallout>
        </section>

        {/* SUBTOPIC ANCHOR: Timeline Schedule Filter */}
        <section id="schedule-timeline" className="scroll-mt-20 target:ring-2 target:ring-blue-500 target:ring-offset-8 rounded-xl">
          <h2>2. Timeline Filtering & Event Cards</h2>
          <p className="text-slate-600">
            Directly beneath the telemetry row, a specialized layout switch mutates the page view state to filter timelines between active itineraries and complete history lists.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 my-4">
            <h4 className="font-bold text-slate-800 m-0 mb-2">Toggle-State Routing Behaviors:</h4>
            <ul className="text-sm space-y-2 mb-0">
              <li><strong>Upcoming Schedule (default):</strong> Lists pending games sorted <strong>older-first</strong> (ascending by date). Clicking any item launches the interactive <code>EventDetailsSheet</code> modal drawer.</li>
              <li><strong>Games History:</strong> Renders archived cards from past events, also sorted <strong>older-first</strong> (ascending by date).</li>
              <li><strong>Player Statistics:</strong> Displays a 2-column grid with <strong>Total Games</strong> (upcoming + past) and <strong>Hours Played</strong> (aggregated duration of past events).</li>
            </ul>
          </div>

          <h3>Event Card Layout Specifications</h3>
          <DocTable columns={cardRowsColumns} data={cardRowsData} />
        </section>
      </div>
    );
  }

  if (subsection === 'stats') {
    return (
      <div className="animate-in fade-in duration-300">
        <h1>Analytics Aggregation (Client-Side Computation)</h1>
        <p>Telemetry stats are computed entirely client-side from the <code>GET /api/v1/users/me/games</code> endpoint. No separate stats endpoint is required.</p>

        <h2>Client-Side Calculation</h2>
        <p>All three stat values derive from the same games list:</p>

        <ul className="text-sm space-y-2 text-slate-600 my-4">
          <li><strong>Upcoming Count:</strong> Games where <code>start_time + 2h &gt; now</code></li>
          <li><strong>Total Games:</strong> <code>upcomingGames.length + pastGames.length</code></li>
          <li><strong>Hours Played:</strong> Sum of <code>durationHours</code> for all past games</li>
        </ul>

        <h2>Game Classification</h2>
        <p>Games are split into upcoming vs past using a 2-hour grace window after the event start:</p>

        <pre><code>{`const now = Date.now();
const upcoming = games.filter(g =>
  new Date(g.rawDate).getTime() + (2 * 60 * 60 * 1000) > now
);
const past = games.filter(g =>
  new Date(g.rawDate).getTime() + (2 * 60 * 60 * 1000) <= now
);`}</code></pre>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <h1>Schedule Routing & Operations (Registration Cancellation)</h1>
      <p>The system prevents anomalous mutations across schedules by confirming profile identity signatures before revoking registration rows.</p>

      <h2>Cancellation Endpoint Architecture</h2>
      <p>Revoking attendance entries relies on standard parameters to smoothly process transactional safety cascading pipelines:</p>
      
      <pre><code>{`// Client-side execution script handling resignation actions
const handleCancelRSVP = async (eventId: string) => {
  try {
    // Invoke DELETE action targeting explicit event link paths
    await api.leaveEvent(eventId);
    
    // Play structural feedback ticks inside Telegram Mini App window frames
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
    
    // Refresh application routing context arrays
    refreshScheduleFeed();
  } catch (error) {
    console.error("Failed to safely sever reservation entry row context: ", error);
  }
};`}</code></pre>

      <InfoCallout type="info" title="Automatic Waitlist Shifts">
        As documented in the core service modules, invoking the <code>DELETE</code> route instantly fires the <code>promote_next_on_waitlist</code> routine. This moves the oldest queue participant from a <code>WAITLISTED</code> status to <code>CONFIRMED</code> automatically.
      </InfoCallout>
    </div>
  );
}