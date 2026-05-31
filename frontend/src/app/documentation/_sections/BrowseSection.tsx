// src/app/documentation/_sections/BrowseSection.tsx
import React from 'react';
import { InfoCallout } from '../_components/InfoCallout';
import { DocTable } from '../_components/DocTable';

interface BrowseSectionProps {
  subsection: 'overview' | 'api' | 'waitlist';
}

export function BrowseSection({ subsection }: BrowseSectionProps) {
  if (subsection === 'overview') {
    const cardRowsColumns = [
      { header: "Card Level Row", accessor: "row" },
      { header: "Visual Elements & Layout", accessor: "elements" },
      { header: "Technical Data & Mapping Strategy", accessor: "technical" }
    ];

    const cardRowsData = [
      { row: "Row 1: Badges", elements: "Event Type Tag (Indoor/Outdoor) | Left Alignment • User State Tag (Joined/Waitlist) | Right Accent", technical: "Computes user's registration state by searching context lists. Renders specialized colored text borders." },
      { row: "Row 2: Primary Meta", elements: "Event Name | Bold Text Header • Status Badge (Upcoming/Ongoing/Passed) • Host Badge (If Creator)", technical: "Renders title property string value. Status badge computes dynamically by evaluating live database times." },
      { row: "Row 3: Chrono Row", elements: "Calendar Icon | Localized Date String | Start - End Time Range Frame", technical: "Transforms raw database UTC strings to localized formats using parseBackendDate helper tools." },
      { row: "Row 4: Roster Info", elements: "Users Icon | Formatted Capacity Counter (x / Max Players) | Host Name String", technical: "Current counter tracks active entries. Host label prints the relation schema sequence: event.host.first_name." },
      { row: "Row 5: Quick Utilities", elements: "Maps Redirect Button (Pin Icon) • Revolut Billing Button (Card Icon | Fee Amount)", technical: "Maps click triggers window.open target to Google Maps URL. Revolut tag uses payment preference strings." },
      { row: "Row 6: CTA Engine", elements: "Full-Width High-Visibility Contextual Action Toggle Button", technical: "State branch machine rendering dynamic color configurations and actions based on player authorization tiers." }
    ];

    return (
      <div className="animate-in fade-in duration-300 space-y-12">
        {/* Section Intro */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-4">
            Feature Screen
          </div>
          <h1>Browse Games Feed</h1>
          <p className="text-xl text-slate-500 mb-6 leading-relaxed">
            The Browse Page serves as the real-time match discovery feed for the community. It implements high-frequency searching, horizontal category filtering arrays, and an adaptive booking workspace.
          </p>
          <hr className="border-slate-200 my-4" />
        </div>

        {/* SUBTOPIC ANCHOR: Feed Filters */}
        <section id="browse-controls" className="scroll-mt-20 target:ring-2 target:ring-blue-500 target:ring-offset-8 rounded-xl">
          <h2>1. Feed Search & Control Parameters</h2>
          <p className="text-slate-600">
            The upper navigation workspace provides instant query handling and multi-faceted parameters to sift through available court times without view delays.
          </p>
          
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 my-4 space-y-4">
            <ul className="text-sm space-y-3 mb-0 list-none pl-0">
              <li className="flex items-start gap-2">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                <div>
                  <strong>Unified Search Bar Control:</strong> A predictive text field executing fuzzy lookups across string segments, enabling filters targeted at match titles, host names, or venue locations.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                <div>
                  <strong>Horizontal Filters Scrolling Panel:</strong> A touch-friendly swipe track housing toggle chips to layer attribute queries:
                  <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1 text-xs">
                    <span className="px-2.5 py-1 bg-blue-600 text-white rounded-full font-medium shadow-sm">All</span>
                    <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-full font-medium text-slate-600">Indoor</span>
                    <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-full font-medium text-slate-600">Outdoor</span>
                    <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-full font-medium text-slate-600">Beginner</span>
                    <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-full font-medium text-slate-600">Intermediate</span>
                    <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-full font-medium text-slate-600">Advanced</span>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* SUBTOPIC ANCHOR: The Advanced Event Card */}
        <section id="browse-card" className="scroll-mt-20 target:ring-2 target:ring-blue-500 target:ring-offset-8 rounded-xl">
          <h2>2. Rich Event Card Layout Specification</h2>
          <p className="text-slate-600">
            Each listing item runs a standardized multi-row container mapping composite relation states. Clicking anywhere on the tile body launches the full <code>EventDetailsSheet</code> overlay wrapper.
          </p>

          <DocTable columns={cardRowsColumns} data={cardRowsData} />
        </section>

        {/* SUBTOPIC ANCHOR: RSVP Branching Logic */}
        <section id="browse-rsvp-logic" className="scroll-mt-20 target:ring-2 target:ring-blue-500 target:ring-offset-8 rounded-xl">
          <h2>3. Dynamic RSVP State Machine Branches</h2>
          <p className="text-slate-600">
            The lower primary action CTA recalculates configuration maps and labels at runtime based on the match capacity profile and user relation records.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <span className="inline-block px-2 py-0.5 rounded text-xs bg-slate-200 font-bold mb-2">Branch A</span>
              <h4 className="text-sm font-bold m-0 text-slate-800">User Is Host</h4>
              <p className="text-xs text-slate-500 mt-2 mb-0">Renders button label to <code>"You're the Host"</code>. Disables click listeners, tinting the element background to neutral styling variations.</p>
            </div>
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <span className="inline-block px-2 py-0.5 rounded text-xs bg-red-100 text-red-700 font-bold mb-2">Branch B</span>
              <h4 className="text-sm font-bold m-0 text-slate-800">User Registered</h4>
              <p className="text-xs text-slate-500 mt-2 mb-0">Detects matching profile id row under active attendees or waitlists. Displays <code>"Cancel RSVP"</code> executing <code>DELETE</code> operations.</p>
            </div>
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <span className="inline-block px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-700 font-bold mb-2">Branch C</span>
              <h4 className="text-sm font-bold m-0 text-slate-800">Available Slots</h4>
              <p className="text-xs text-slate-500 mt-2 mb-0">Displays <code>"RSVP"</code> layout properties. Triggers <code>POST /join</code> request pipelines, assigning <code>CONFIRMED</code> or <code>WAITLISTED</code> indices automatically.</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (subsection === 'api') {
    return (
      <div className="animate-in fade-in duration-300">
        <h1>REST API Integration Contracts</h1>
        <p>The browse listing calls high-performance dataset arrays, compiling nested relation targets through relational eager loads.</p>

        <h2>Endpoint Specification Definitions</h2>
        <ul>
          <li><strong>Fetch Feed:</strong> <code>GET /api/v1/events/</code></li>
          <li><strong>Query Parameters:</strong>
            <ul>
              <li><code>search</code>: string segment parameter filtering alphanumeric labels</li>
              <li><code>type</code>: Indoor | Outdoor classification definitions</li>
              <li><code>level</code>: PlayLevel skill verification strings</li>
            </ul>
          </li>
        </ul>

        <h2>Data Model Validation Mapping</h2>
        <pre><code>{`// Client-side TypeScript model contract definition structures
export interface EventRelationData {
  id: string;               // Database UUID primary validation index string
  title: str;               
  type: 'Indoor' | 'Outdoor';
  start_time: string;       # ISO UTC Timestamp parameters
  end_time: string;         # ISO UTC Timestamp parameters
  location_name: string;    
  price: number;            
  max_players: number;      
  host_id: number;          
  host: {
    first_name: string;     // Relational model reference 
    last_name?: string;
  };
  attendees: Array<{
    user_id: number;
    status: 'confirmed' | 'waitlisted'; // Roster validation values
  }>;
}`}</code></pre>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <h1>Automated Waitlists Lifecycle Architecture</h1>
      <p>Roster slot saturation tracks actions cleanly via structural transitions managed entirely by relational dependencies in the data layers.</p>

      <h2>Roster Processing Automation Script</h2>
      <p>When users invoke structural status updates, the server checks cap tolerances before appending record listings:</p>

      <pre><code>{`# Waitlist evaluation transaction logic inside app/api/routes/rsvps.py
@router.post("/{event_id}/join")
async def join_event_endpoint(event_id: UUID, current_user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    event = session.get(Event, event_id)
    
    # 1. Evaluate total capacity boundaries safely
    current_confirmed = len([r for r in event.attendees if r.status == "confirmed"])
    
    if current_confirmed >= event.max_players:
        # Saturation reached: assign user to FIFO waitlist array tracks
        rsvp_entry = RSVP(user_id=current_user.id, event_id=event_id, status="waitlisted")
    else:
        rsvp_entry = RSVP(user_id=current_user.id, event_id=event_id, status="confirmed")
        
    session.add(rsvp_entry)
    session.commit()
    return rsvp_entry`}</code></pre>

      <InfoCallout type="warning" title="Atomic Roster Cascade Mutators">
        A cancellation event immediately triggers waitlist promotions. The background database worker intercepts the drop row action, queries the earliest entry via historical timestamps, and instantly changes its access value to <code>confirmed</code>.
      </InfoCallout>
    </div>
  );
}