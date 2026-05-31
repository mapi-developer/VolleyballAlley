// src/app/documentation/_sections/OverviewSection.tsx
import React from 'react';
import { InfoCallout } from '../_components/InfoCallout';

export function OverviewSection() {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-4">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        Introduction
      </div>
      <h1>VolleyBros Overview</h1>
      <p className="text-xl text-slate-500 mb-8 leading-relaxed">
        VolleyBros (VolleyballAlley) is a full-stack Telegram Mini App designed to connect volleyball players, organize matches, manage RSVPs, and handle automated waitlists seamlessly within the Telegram ecosystem.
      </p>
      
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

      <InfoCallout type="info" title="Getting Started">
        To test the application locally, ensure your <code>.env</code> file is configured with the correct <code>BOT_TOKEN</code> from BotFather, and run <code>docker compose up --build -d</code> followed by tunneling port 80 via localtunnel.
      </InfoCallout>
    </div>
  );
}