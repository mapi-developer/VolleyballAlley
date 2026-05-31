// src/app/documentation/_sections/ArchitectureSection.tsx
import React from 'react';

export function ArchitectureSection() {
  return (
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
  );
}