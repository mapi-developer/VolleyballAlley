const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Centeralized fetch wrapper that automatically injects Telegram Auth headers.
 */
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  // Get initData from the Telegram SDK global object
  const initData = window.Telegram?.WebApp?.initData || '';

  const headers = {
    'Content-Type': 'application/json',
    'X-Telegram-Init-Data': initData, // Required by backend security.py
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'API request failed');
  }

  return response.json();
}

export const api = {
  // User Endpoints
  getProfile: () => apiFetch('/users/me'),
  getStats: () => apiFetch('/users/me/stats'),
  
  // Event Endpoints
  getEvents: (params?: string) => apiFetch(`/events/?${params || ''}`),
  createEvent: (data: any) => apiFetch('/events/', { method: 'POST', body: JSON.stringify(data) }),
  
  // RSVP Endpoints
  joinEvent: (eventId: string) => apiFetch(`/rsvps/${eventId}/join`, { method: 'POST' }),
  leaveEvent: (eventId: string) => apiFetch(`/rsvps/${eventId}/leave`, { method: 'DELETE' }),
};