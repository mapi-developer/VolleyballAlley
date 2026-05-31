// src/app/documentation/_sections/HomeSection.tsx
import React from 'react';
import { InfoCallout } from '../_components/InfoCallout';
import { DocTable } from '../_components/DocTable';

interface HomeSectionProps {
  subsection: 'overview' | 'api';
}

export function HomeSection({ subsection }: HomeSectionProps) {
  if (subsection === 'overview') {
    const componentLayoutColumns = [
      { header: "Interface Component Block", accessor: "block" },
      { header: "Visual Mapping & Actions", accessor: "mapping" },
      { header: "Routing Target / Link Workflow", accessor: "technical" }
    ];

    const componentLayoutData = [
      { block: "1. Performance Metrics Grid", mapping: "Verified Level Badge Card • 5-Star Behavior Rating Card", technical: "None (Static metrics loaded straight from global user initialization profile context)." },
      { block: "2. Next Up Tracker Header", mapping: "'Next UP' Text Label Area • Left Alignment", technical: "None." },
      { block: "3. Schedule Jump Action", mapping: "'See All' Clean Chevron Link Text • Right Accent", technical: "Triggers router path modification pushing view straight into /my-games view state." },
      { block: "4. Featured Open Matches Header", mapping: "'Open Matches' Text Label Area • Left Alignment", technical: "None." },
      { block: "5. Discover Feed Jump Action", mapping: "'Browse All' Accent Link Text • Right Accent", technical: "Modifies routing index configuration directly to focus on /browse layout views." }
    ];

    return (
      <div className="animate-in fade-in duration-300 space-y-12">
        {/* Intro Section */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-4">
            Feature Screen
          </div>
          <h1>Home Screen Layout</h1>
          <p className="text-xl text-slate-500 mb-6 leading-relaxed">
            The Home Page acts as the centralized launchpad for the player. It isolates active telemetry markers, aggregates personalized next-step parameters, and renders a compressed discovery feed directly on launch.
          </p>
          <hr className="border-slate-200 my-4" />
        </div>

        {/* SUBTOPIC ANCHOR: Performance Metrics */}
        <section id="perf-metrics" className="scroll-mt-20 target:ring-2 target:ring-blue-500 target:ring-offset-8 rounded-xl">
          <h2>1. Player Level & Behavior Rating Cards</h2>
          <p className="text-slate-600">
            Positioned directly under the global header frame, this block provides players with immediate visibility over their structural community standing attributes.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
            <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm flex flex-col justify-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Play Level</span>
              <span className="text-xl font-extrabold text-blue-600 mt-1 block">Intermediate+</span>
              <p className="text-xs text-slate-500 m-0 mt-2 leading-tight">Enforces skill boundaries to guarantee balanced game lobbies across feeds.</p>
            </div>
            <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm flex flex-col justify-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reliability Score Rank</span>
              <span className="text-xl font-extrabold text-amber-600 mt-1 block">★ 4.8 / 5.0</span>
              <p className="text-xs text-slate-500 m-0 mt-2 leading-tight">Monitors attendance behaviors, penalizing late roster cancellations automatically.</p>
            </div>
          </div>
        </section>

        {/* SUBTOPIC ANCHOR: Next Up Schedule */}
        <section id="next-up" className="scroll-mt-20 target:ring-2 target:ring-blue-500 target:ring-offset-8 rounded-xl">
          <h2>2. Next UP Schedule Block</h2>
          <p className="text-slate-600">
            A focal layout element pulling a single target card record to display the user's nearest chronological commitment parameter.
          </p>

          <p className="text-sm text-slate-600 mt-2">
            The layout block uses the following strict structural constraints:
          </p>
          <ul className="text-sm text-slate-500 space-y-1">
            <li><strong>Row 1 Layout:</strong> Groups the <code>"Upcoming Match"</code> visual label on the left. If the user's active ID matches the event's creator key, a specialized <code>"You're Hosting"</code> accent label mounts on the right.</li>
            <li><strong>Row 2 Layout:</strong> Renders the complete, un-truncated primary match title property string.</li>
            <li><strong>Row 3 Layout:</strong> Outputs localized date attributes joined with starting time markers for clean layout tracking.</li>
          </ul>
        </section>

        {/* SUBTOPIC ANCHOR: Open Matches Preview */}
        <section id="open-matches" className="scroll-mt-20 target:ring-2 target:ring-blue-500 target:ring-offset-8 rounded-xl">
          <h2>3. Open Matches Discovery Track</h2>
          <p className="text-slate-600">
            Renders a tailored slice component array showcasing matching play opportunities. It leverages the exact structural layout card specifications defined in the Browse Page documentation rules.
          </p>

          <DocTable columns={componentLayoutColumns} data={componentLayoutData} />
        </section>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <h1>Data Sorting & Context Aggregation Architecture</h1>
      <p>The Home Page component manages layout generation internally by evaluating overlapping data parameters requested from independent collection arrays.</p>

      <h2>Client Filtering Algorithms</h2>
      <p>To compute dashboard layout configurations accurately, the home layout triggers array processing functions on response vectors:</p>

      <pre><code>{`// Core scheduling calculation mappings executing inside src/app/page.tsx
const computeHomepageSchedules = (myGamesList: Event[], globalFeedList: Event[], currentUserId: number) => {
  const currentTimeMs = Date.now();
  const twoHourBuffer = 2 * 60 * 60 * 1000; // Account for matches currently in progress

  // 1. Isolate and cache the Next Up target slot data
  const nextUpGame = myGamesList
    .filter(game => new Date(game.start_time).getTime() + twoHourBuffer > currentTimeMs)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())[0] || null;

  // 2. Compile relevant open recommendations feed
  const visibleOpenMatches = globalFeedList
    .filter(game => game.host_id !== currentUserId) // Exclude hosted entities
    .filter(game => !game.attendees.some(a => a.user_id === currentUserId)) // Exclude joined rooms
    .filter(game => new Date(game.start_time).getTime() > currentTimeMs) // Exclude elapsed dates
    .slice(0, 3); // Restrict to top 3 slots to avoid viewport scrolling bloat

  return { nextUpGame, visibleOpenMatches };
};`}</code></pre>

      <InfoCallout type="info" title="Relational Sync Loops">
        Because items hook into centralized <code>api.ts</code> pipelines, selecting an action toggle anywhere inside the Home Page card preview paths updates global database parameters immediately. This forces component matrices across siblings to synchronize values without forcing layout restarts.
      </InfoCallout>
    </div>
  );
}