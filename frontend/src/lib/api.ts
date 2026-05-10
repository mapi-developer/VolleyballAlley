const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://rare-spies-dig.loca.lt/api';

// Helper to safely extract Telegram authentication data
const getTelegramInitData = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        return window.Telegram.WebApp.initData;
    }
    return '';
};

// Core fetch wrapper
async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const initData = getTelegramInitData();

    const headers = {
        'Content-Type': 'application/json',
        'bypass-tunnel-reminder': 'true',
        'x-telegram-init-data': initData,
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `API Error: ${response.status}`);
    }

    return response.json();
}

// Exported API Methods based on your backend routes
export const api = {
    // --- USERS ---
    getCurrentUser: () => fetchApi('/users/me'),
    updateRole: (role: string) => fetchApi(`/users/me/role?new_role=${role}`, { method: 'PATCH' }),

    // --- EVENTS ---
    getEvents: () => fetchApi('/events/'),
    getEventById: (id: number) => fetchApi(`/events/${id}`),
    createEvent: (data: any) => fetchApi('/events/', { method: 'POST', body: JSON.stringify(data) }),
    deleteEvent: (id: number) => fetchApi(`/events/${id}`, { method: 'DELETE' }),

    // --- RSVPS ---
    rsvpToEvent: (eventId: number, status: 'confirmed' | 'waitlisted' | 'cancelled') =>
        fetchApi(`/rsvps/?event_id=${eventId}&status=${status}`, { method: 'POST' }),
    getMyGames: () => fetchApi('/rsvps/me'),
};