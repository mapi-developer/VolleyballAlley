"use client";

import React, { useState } from 'react';
import { Search, BookOpen, Server, User, Settings, Globe, ChevronDown } from 'lucide-react';

export default function DocumentationPage() {
    const [activeSection, setActiveSection] = useState('overview');
    const [expandedMenus, setExpandedMenus] = useState({
        profile: false,
        organizer: false
    });

    const toggleMenu = (menu: 'profile' | 'organizer') => {
        setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
    };

    const getNavLinkClass = (sectionId: string, isNested = false) => {
        const baseClass = isNested 
            ? "w-full text-left pl-10 pr-3 py-1.5 text-sm rounded-lg transition-colors"
            : "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors mt-2";
            
        const activeClass = activeSection === sectionId
            ? (isNested ? "text-slate-900 bg-slate-50 font-medium" : "text-blue-700 bg-blue-50")
            : (isNested ? "text-slate-500 hover:text-slate-900 hover:bg-slate-50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50");

        return `${baseClass} ${activeClass}`;
    };

    return (
        <div className="text-slate-900 overflow-hidden h-screen flex flex-col bg-slate-50">
            {/* Inject Custom Styles for Markdown Prose and Scrollbar */}
            <style>{`
                /* Custom Scrollbar for a cleaner look */
                ::-webkit-scrollbar { width: 6px; height: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

                /* Markdown-like styling for content */
                .prose h1 { font-size: 2.25rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem; letter-spacing: -0.025em; }
                .prose h2 { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-top: 2rem; margin-bottom: 0.75rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; }
                .prose h3 { font-size: 1.25rem; font-weight: 600; color: #334155; margin-top: 1.5rem; margin-bottom: 0.5rem; }
                .prose p { color: #475569; line-height: 1.75; margin-bottom: 1.25rem; }
                .prose ul { list-style-type: disc; padding-left: 1.5rem; color: #475569; margin-bottom: 1.25rem; }
                .prose li { margin-bottom: 0.5rem; }
                .prose code { background-color: #f1f5f9; color: #0f172a; padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-size: 0.875em; font-family: monospace; border: 1px solid #e2e8f0; }
                .prose pre { background-color: #0f172a; color: #f8fafc; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin-bottom: 1.5rem; font-family: monospace; font-size: 0.875rem; line-height: 1.5;}
                .prose pre code { background-color: transparent; color: inherit; padding: 0; border: none; }
                .prose table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; font-size: 0.875rem; }
                .prose th { text-align: left; padding: 0.75rem 1rem; border-bottom: 2px solid #e2e8f0; color: #1e293b; font-weight: 600; }
                .prose td { padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0; color: #475569; }
            `}</style>

            {/* Header */}
            <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm relative">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <h1 className="font-extrabold text-xl tracking-tight text-slate-900">VolleyBros <span className="text-blue-600">Docs</span></h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-500 border border-slate-200">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span> System Operational
                    </div>
                    <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-md">v1.0.0-beta</span>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex flex-1 overflow-hidden">
                
                {/* Sidebar Navigation */}
                <aside className="w-72 bg-white border-r border-slate-200 overflow-y-auto flex-shrink-0 flex flex-col hidden md:flex">
                    <div className="p-6">
                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input type="text" placeholder="Search docs..." className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                        </div>

                        <nav className="space-y-1">
                            {/* Nav Item: Overview */}
                            <button onClick={() => setActiveSection('overview')} className={getNavLinkClass('overview')}>
                                <BookOpen size={18} />
                                Project Overview
                            </button>

                            {/* Nav Item: Architecture */}
                            <button onClick={() => setActiveSection('architecture')} className={getNavLinkClass('architecture')}>
                                <Server size={18} />
                                Architecture & Docker
                            </button>

                            <div className="h-px bg-slate-200 my-4"></div>
                            <h3 className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Features</h3>

                            {/* Expandable Nav Item: Profile & Auth */}
                            <div>
                                <button onClick={() => toggleMenu('profile')} className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <User size={18} />
                                        Profile Page
                                    </div>
                                    <ChevronDown size={16} className={`transition-transform duration-200 ${expandedMenus.profile ? 'rotate-0' : '-rotate-90'}`} />
                                </button>
                                {/* Nested Items */}
                                <ul className={`mt-1 mb-2 space-y-1 relative ${expandedMenus.profile ? 'block' : 'hidden'}`}>
                                    <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200"></div>
                                    <li>
                                        <button onClick={() => setActiveSection('profile-auth')} className={getNavLinkClass('profile-auth', true)}>Telegram Auth Flow</button>
                                    </li>
                                    <li>
                                        <button onClick={() => setActiveSection('profile-roles')} className={getNavLinkClass('profile-roles', true)}>Role Switching</button>
                                    </li>
                                </ul>
                            </div>

                            {/* Expandable Nav Item: Organizer Tools */}
                            <div>
                                <button onClick={() => toggleMenu('organizer')} className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <Settings size={18} />
                                        Organizer Tools
                                    </div>
                                    <ChevronDown size={16} className={`transition-transform duration-200 ${expandedMenus.organizer ? 'rotate-0' : '-rotate-90'}`} />
                                </button>
                                {/* Nested Items */}
                                <ul className={`mt-1 mb-2 space-y-1 relative ${expandedMenus.organizer ? 'block' : 'hidden'}`}>
                                    <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200"></div>
                                    <li>
                                        <button onClick={() => setActiveSection('org-create')} className={getNavLinkClass('org-create', true)}>Creating Events</button>
                                    </li>
                                    <li>
                                        <button onClick={() => setActiveSection('org-manage')} className={getNavLinkClass('org-manage', true)}>Managing Rosters</button>
                                    </li>
                                </ul>
                            </div>

                             {/* Nav Item: Browse & RSVP */}
                             <button onClick={() => setActiveSection('browse')} className={getNavLinkClass('browse')}>
                                <Globe size={18} />
                                Browse & RSVP API
                            </button>
                        </nav>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-white relative">
                    <div className="max-w-4xl mx-auto px-8 py-12 prose">
                        
                        {/* CONTENT SECTION: Overview */}
                        {activeSection === 'overview' && (
                            <div className="animate-in fade-in duration-300">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-4">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                    </span>
                                    Introduction
                                </div>
                                <h1>VolleyBros Overview</h1>
                                <p className="text-xl text-slate-500 mb-8 leading-relaxed">VolleyBros (VolleyballAlley) is a full-stack Telegram Mini App designed to connect volleyball players, organize matches, manage RSVPs, and handle automated waitlists seamlessly within the Telegram ecosystem.</p>
                                
                                <h2>Core Tech Stack</h2>
                                <p>The application is built using a modern, decoupled architecture wrapped in a unified Docker environment for production deployment.</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                                    <div className="border border-slate-200 rounded-xl p-5 bg-slate-50">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center font-bold">N</div>
                                            <h3 className="m-0 text-lg">Next.js (Frontend)</h3>
                                        </div>
                                        <p className="text-sm m-0">React-based frontend optimized for mobile. Utilizes Tailwind CSS for styling and communicates directly with the Telegram WebApp SDK.</p>
                                    </div>
                                    <div className="border border-slate-200 rounded-xl p-5 bg-slate-50">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xl">F</div>
                                            <h3 className="m-0 text-lg">FastAPI (Backend)</h3>
                                        </div>
                                        <p className="text-sm m-0">High-performance Python backend. Handles Telegram <code>initData</code> cryptographic validation, business logic, and PostgreSQL database connections via SQLModel.</p>
                                    </div>
                                </div>

                                <h2>Key Features</h2>
                                <ul>
                                    <li><strong>Telegram Authentication:</strong> Secure cryptographic handshake verifying users natively without passwords.</li>
                                    <li><strong>Role-Based Access Control (RBAC):</strong> Distinct privileges for Members, Organizers, and Admins.</li>
                                    <li><strong>Live Game Feed:</strong> Real-time event browsing with capacity tracking.</li>
                                    <li><strong>Automated Waitlists:</strong> When an event is full, players are waitlisted. If someone cancels, the next in line is automatically promoted.</li>
                                    <li><strong>Organizer Dashboard:</strong> Tools to create events, manage rosters, and set requirements (Level, Price, Location).</li>
                                </ul>

                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mt-8">
                                    <h3 className="text-blue-800 m-0 mb-2 flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                                        Getting Started
                                    </h3>
                                    <p className="text-blue-700 text-sm m-0">To test the application locally, ensure your <code>.env</code> file is configured with the correct <code>BOT_TOKEN</code> from BotFather, and run <code>docker compose up --build -d</code> followed by tunneling port 80 via localtunnel.</p>
                                </div>
                            </div>
                        )}

                        {/* CONTENT SECTION: Architecture */}
                        {activeSection === 'architecture' && (
                            <div className="animate-in fade-in duration-300">
                                <h1>Architecture & Docker</h1>
                                <p>Because this is a Telegram Mini App, requests originate from the user's mobile device, not from the server. This requires a specific routing setup to avoid CORS issues and ensure fast communication between the Next.js frontend and FastAPI backend.</p>

                                <h2>The Unified Nginx Proxy</h2>
                                <p>In production (and local tunneling), we use Nginx to unify the frontend and backend under a single domain. This eliminates CORS pre-flight checks and speeds up the app significantly.</p>

                                <pre><code>{`services:
  db:
    image: postgres:15
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build: ./frontend

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"`}</code></pre>

                                <h2>API Routing Setup</h2>
                                <p>Inside the Next.js frontend (<code>src/lib/api.ts</code>), the <code>API_BASE_URL</code> is set to a relative path:</p>
                                <pre><code>const API_BASE_URL = '/api/v1'; // Nginx handles routing this to FastAPI</code></pre>
                                <p>When the frontend fetches <code>/api/v1/users/me</code>, Nginx intercepts the request and instantly passes it to the FastAPI Docker container on port 8000.</p>
                            </div>
                        )}

                        {/* CONTENT SECTION: Profile Auth */}
                        {activeSection === 'profile-auth' && (
                            <div className="animate-in fade-in duration-300">
                                <h1>Telegram Authentication Flow</h1>
                                <p>Authentication happens seamlessly using the Telegram WebApp SDK. No passwords or email sign-ups are required.</p>

                                <h2>How it works</h2>
                                <ol>
                                    <li>The Next.js frontend extracts <code>window.Telegram.WebApp.initData</code>.</li>
                                    <li>This raw string is attached to every fetch request via the <code>x-telegram-init-data</code> header.</li>
                                    <li>FastAPI intercepts the header, uses your bot's secret <code>BOT_TOKEN</code>, and calculates an HMAC-SHA-256 hash.</li>
                                    <li>If the calculated hash matches the hash provided by Telegram, the user is authenticated and their PostgreSQL record is fetched (or created).</li>
                                </ol>

                                <h2>The API Fetch Wrapper</h2>
                                <pre><code>{`// Core fetch wrapper inside api.ts
async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const initData = window.Telegram?.WebApp?.initData || '';
  
  const headers = {
    'Content-Type': 'application/json',
    'x-telegram-init-data': initData,
    ...options.headers,
  };

  const response = await fetch(\`\${API_BASE_URL}\${endpoint}\`, { ...options, headers });
  if (!response.ok) throw new Error('API Error');
  return response.json();
}`}</code></pre>
                            </div>
                        )}

                        {/* CONTENT SECTION: Profile Roles */}
                        {activeSection === 'profile-roles' && (
                            <div className="animate-in fade-in duration-300">
                                <h1>Role Switching (RBAC)</h1>
                                <p>The application supports three database-level roles: <code>MEMBER</code>, <code>ORGANIZER</code>, and <code>ADMIN</code>. The UI dynamically adapts based on the active role stored in <code>UserContext</code>.</p>

                                <h2>Updating Roles</h2>
                                <p>Changing a role hits the <code>PATCH /users/me/role</code> endpoint. We use optimistic UI updates combined with Telegram Haptic Feedback for a native feel.</p>

                                <pre><code>{`// frontend/src/context/UserContext.tsx
const setRole = async (newRole: UserRole) => {
  const previousRole = role;
  try {
    // Optimistic UI update
    setRoleState(newRole);
    
    // Haptic Feedback
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }

    // Database Update
    await api.updateRole(newRole);
  } catch (error) {
    // Revert on failure
    setRoleState(previousRole);
    console.error("Failed to save role");
  }
};`}</code></pre>

                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                                    <strong className="text-amber-800">Note:</strong> Fast API validation requires the query parameter to strictly match the python function argument (e.g., <code>?new_role=organizer</code>).
                                </div>
                            </div>
                        )}

                        {/* CONTENT SECTION: Org Create */}
                        {activeSection === 'org-create' && (
                            <div className="animate-in fade-in duration-300">
                                <h1>Creating Events</h1>
                                <p>Organizers have access to the "Host" dashboard, allowing them to create new events. The backend automatically safeguards this via the <code>Depends(get_current_organizer)</code> dependency.</p>

                                <h2>The Event Payload</h2>
                                <p>The <code>CreateEventSheet</code> collects the following data to fulfill the <code>EventBase</code> SQLModel schema:</p>
                                
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Field</th>
                                            <th>Type</th>
                                            <th>Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><code>title</code></td>
                                            <td>String</td>
                                            <td>Display name of the match</td>
                                        </tr>
                                        <tr>
                                            <td><code>start_time</code></td>
                                            <td>ISO Date</td>
                                            <td>Calculated from Date + Time inputs</td>
                                        </tr>
                                        <tr>
                                            <td><code>max_players</code></td>
                                            <td>Integer</td>
                                            <td>Cap for the match (triggers waitlist)</td>
                                        </tr>
                                        <tr>
                                            <td><code>level_required</code></td>
                                            <td>Enum</td>
                                            <td>BEGINNER, INTERMEDIATE, ADVANCED, ALL</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <h2>Auto-Host Registration</h2>
                                <p>When an Organizer creates an event, the backend automatically generates a <code>CONFIRMED</code> RSVP record linking the Organizer to their new event to ensure they are on the roster.</p>
                            </div>
                        )}

                        {/* CONTENT SECTION: Org Manage */}
                        {activeSection === 'org-manage' && (
                            <div className="animate-in fade-in duration-300">
                                <h1>Managing Rosters</h1>
                                <p>In the <code>EditEventSheet</code>, hosts can view the current attendees. The UI implements safety checks to prevent hosts from accidentally removing themselves.</p>

                                <h2>Host Safeguard Logic</h2>
                                <pre><code>{`{event.attendees.map((a) => (
  <div key={a.user_id} className="flex justify-between">
    <span>{a.user?.first_name}</span>
    
    {/* Hide delete button if the user is the host */}
    {a.user_id !== event.host_id ? (
      <button onClick={() => handleKick(a.user_id)}>Remove</button>
    ) : (
      <span className="text-xs text-blue-500 font-bold">Host</span>
    )}
  </div>
))}`}</code></pre>
                            </div>
                        )}

                         {/* CONTENT SECTION: Browse */}
                         {activeSection === 'browse' && (
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
                         )}

                    </div>
                </main>
            </div>
        </div>
    );
}