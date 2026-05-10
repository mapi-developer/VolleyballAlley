const API_BASE_URL = '/api';

// Helper to safely extract Telegram authentication data
const getTelegramInitData = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        return window.Telegram.WebApp.initData; // This contains the hash!
    }
    return '';
};

// Core fetch wrapper
async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const initData = getTelegramInitData();

    const headers = {
        'Content-Type': 'application/json',
        'bypass-tunnel-reminder': 'true',
        'x-telegram-init-data': initData, // <-- THIS SENDS THE HASH TO FASTAPI
        ...options.headers,
    };

    const response = await fetch(`/api${endpoint}`, {
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
    updateEvent: (id: string, data: any) => fetchApi(`/events/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteEvent: (id: number) => fetchApi(`/events/${id}`, { method: 'DELETE' }),

    // --- RSVPS ---
    joinEvent: (eventId: string) => 
        fetchApi(`/rsvps/${eventId}/join`, { method: 'POST' }),
        
    leaveEvent: (eventId: string) => 
        fetchApi(`/rsvps/${eventId}/leave`, { method: 'DELETE' }),
        
    getMyGames: () => 
        fetchApi('/rsvps/me'),
};