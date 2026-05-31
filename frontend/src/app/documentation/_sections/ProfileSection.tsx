// src/app/documentation/_sections/ProfileSection.tsx
import React from 'react';
import { InfoCallout } from '../_components/InfoCallout';

interface ProfileSectionProps {
  subsection: 'auth' | 'roles';
}

export function ProfileSection({ subsection }: ProfileSectionProps) {
  if (subsection === 'auth') {
    return (
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
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <h1>Role Switching (RBAC)</h1>
      <p>The application supports three database-level roles: <code>MEMBER</code>, <code>ORGANIZER</code>, and <code>ADMIN</code>. The UI dynamically adapts based on the active role stored in <code>UserContext</code>.</p>

      <h2>Updating Roles</h2>
      <p>Changing a role hits the <code>PATCH /users/me/role</code> endpoint. We use optimistic UI updates combined with Telegram Haptic Feedback for a native feel.</p>

      <pre><code>{`// frontend/src/context/UserContext.tsx
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
  }
};`}</code></pre>

      <InfoCallout type="warning" title="FastAPI Parameter Requirement">
        FastAPI validation requires the query parameter to strictly match the python function argument signature exactly (e.g., <code>?new_role=organizer</code>).
      </InfoCallout>
    </div>
  );
}