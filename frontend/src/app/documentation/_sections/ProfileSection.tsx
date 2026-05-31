// src/app/documentation/_sections/ProfileSection.tsx
import React from 'react';
import { InfoCallout } from '../_components/InfoCallout';
import { DocTable } from '../_components/DocTable';

interface ProfileSectionProps {
  subsection: 'overview' | 'auth' | 'roles';
}

export function ProfileSection({ subsection }: ProfileSectionProps) {
  if (subsection === 'overview') {
    const appLinksColumns = [
      { header: "Accessible Navigation Tab", accessor: "tab" },
      { header: "Member Level", accessor: "member" },
      { header: "Organizer Level", accessor: "organizer" },
      { header: "Admin Level", accessor: "admin" }
    ];

    const appLinksData = [
      { tab: "Home", member: "Available", organizer: "Available", admin: "Available" },
      { tab: "Browse", member: "Available", organizer: "Available", admin: "Available" },
      { tab: "My Games", member: "Available", organizer: "Available", admin: "Available" },
      { tab: "Profile", member: "Available", organizer: "Available", admin: "Available" },
      { tab: "Organizer Dashboard (Host)", member: "Restricted", organizer: "★ Available", admin: "★ Available" }
    ];

    return (
      <div className="animate-in fade-in duration-300 space-y-6">
        {/* Intro */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-4">
            Feature Screen
          </div>
          <h1>Profile Page Layout</h1>
          <p className="text-xl text-slate-500 mb-6 leading-relaxed">
            The Profile Page provides players with an intuitive, gamified dashboard to track their standing while serving as the runtime control panel for platform security configurations and identity access flags.
          </p>
          <hr className="border-slate-200 my-4" />
        </div>

        {/* SUBTOPIC ANCHOR: Info Card */}
        <section id="info-card" className="scroll-mt-20 target:ring-2 target:ring-blue-500 target:ring-offset-8 rounded-xl">
          <h2>1. Info Card Section</h2>
          <p className="text-slate-600">
            The topmost block of the screen handles immediate identity presentation and gamified player verification metrics synced natively with Telegram.
          </p>
          
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 my-4 space-y-3">
            <h4 className="font-bold text-slate-800 mb-2">Interface Layout Parameters:</h4>
            <ul className="text-sm space-y-2 mb-0">
              <li><strong>User First & Last Name:</strong> Rendered in bold header typography natively retrieved from the platform.</li>
              <li><strong>Telegram Tag Identifier:</strong> Appends the <code>@username</code> prefix with a click-to-copy clipboard utility wrapper.</li>
              <li><strong>User Avatar Profile Image:</strong> Circular image fallback container hosting the raw binary asset from Telegram CDN, or structural fallback character initial.</li>
              <li><strong>Verified Athlete Level Badge:</strong> Visual skill rating parameter (<code>Beginner</code>, <code>Intermediate+</code>, <code>Advanced</code>) used to maintain game feed quality thresholds.</li>
              <li><strong>Reliability Behavior Rank:</strong> Interactive 5-star evaluation tracking system rating attendance consistency and community standings.</li>
            </ul>
          </div>
        </section>

        {/* SUBTOPIC ANCHOR: Account Settings Card */}
        <section id="account-settings" className="scroll-mt-20 target:ring-2 target:ring-blue-500 target:ring-offset-8 rounded-xl">
          <h2>2. Account Settings Card Section</h2>
          <p className="text-slate-600">
            A comprehensive unified management container grouping application customization blocks, notification endpoints, and debugging preferences.
          </p>

          <div className="space-y-6 mt-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-base font-bold text-slate-800 my-1">A. Notification Settings</h3>
              <h4 className="text-sm text-slate-600 mb-2">Interactive toggle switch rows handling user push-alert distribution parameters:</h4>
              <ul className="text-xs text-slate-500 my-0">
                <li><strong>New Game Alerts:</strong> Instant pings fired when organizers create matches matching your profile skill level.</li>
                <li><strong>Waitlist Updates:</strong> Automated alerts signaling automatic confirmation promotion following another player’s cancellation.</li>
                <li><strong>Game Reminders:</strong> Push alerts generated 6 hours before court checkout and schedule windows close.</li>
                <li><strong>Administrative:</strong> Crucial transactional updates regarding system state or moderation reports.</li>
              </ul>
            </div>

            <div className="border-l-4 border-slate-400 pl-4">
              <h3 className="text-base font-bold text-slate-800 my-1">B. App Preferences</h3>
              <ul className="text-xs text-slate-500 my-1 space-y-1">
                <li><strong>Role Management:</strong> Development-only environmental tool allowing hot-swapping between roles to evaluate real-time UI adaptions.</li>
                <li><strong>Payment Preferences:</strong> Saves personal <code>@Revolut</code> tags into active application memory to auto-populate fee links when generating host files.</li>
              </ul>
            </div>

            <div className="border-l-4 border-emerald-500 pl-4">
              <h3 className="text-base font-bold text-slate-800 my-1">C. Support & Review</h3>
              <h4 className="text-sm text-slate-600 mb-2">A direct helpdesk utility sheet providing integrated debugging pipelines:</h4>
              <ul className="text-xs text-slate-500 my-1">
                <li><strong>Bug / Request Toggle:</strong> Form switch changing ticket categorization payload variables.</li>
                <li><strong>Message Input:</strong> Controlled textarea tracking user descriptions of platform issues.</li>
                <li><strong>Submit Ticket Button:</strong> Disables interaction and renders loading state during asynchronous payload processing.</li>
              </ul>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-base font-bold text-slate-800 my-1">D. Credentials & About</h3>
              <p className="text-sm text-slate-600 m-0">
                Displays system build numbers (e.g., <code>v1.0.0-beta</code>), platform compliance descriptions, and a hidden, role-gated **Project Docs Button** visible exclusively to developer access keys.
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (subsection === 'auth') {
    return (
      <div className="animate-in fade-in duration-300">
        <h1>Telegram Authentication Flow</h1>
        <p>Authentication happens seamlessly using the Telegram WebApp SDK securely validating the user without email credentials.</p>

        <h2>Cryptographic Handshake Protocol</h2>
        <ol>
          <li>The Next.js client layout layer extracts <code>window.Telegram.WebApp.initData</code> from the secure client shell.</li>
          <li>This query parameter hash string is attached to every downstream request via the custom <code>x-telegram-init-data</code> header.</li>
          <li>The FastAPI backend interceptor hashes your secret <code>BOT_TOKEN</code> string via HMAC-SHA-256 to verify the signature integrity before committing any state variations to PostgreSQL.</li>
        </ol>

        <h2>Client Fetch API Wrapper</h2>
        <pre><code>{`// Core client side fetch handler
async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const initData = window.Telegram?.WebApp?.initData || '';
  
  const headers = {
    'Content-Type': 'application/json',
    'x-telegram-init-data': initData,
    ...options.headers,
  };

  const response = await fetch(\`\${API_BASE_URL}\${endpoint}\`, { ...options, headers });
  if (!response.ok) throw new Error('API Execution Error');
  return response.json();
}`}</code></pre>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <h1>Role Switching (RBAC Optimization)</h1>
      <p>The system stores three native permission levels: <code>MEMBER</code>, <code>ORGANIZER</code>, and <code>ADMIN</code>. The UI dynamically tracks the active context parameters to redraw interface layouts on the fly.</p>

      <h2>State Mutator Routine</h2>
      <pre><code>{`// React Client Context Layer Update Handler
const setRole = async (newRole: UserRole) => {
  const previousRole = role;
  try {
    setRoleState(newRole);
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
    await api.updateRole(newRole);
  } catch (error) {
    setRoleState(previousRole);
    console.error("Failed to commit role change:", error);
  }
};`}</code></pre>

      <InfoCallout type="warning" title="API Query Constraint Note">
        The FastAPI router relies on strict query parameters mapping exactly to backend parameters (e.g. <code>PATCH /api/v1/users/me/role?new_role=organizer</code>).
      </InfoCallout>
    </div>
  );
}