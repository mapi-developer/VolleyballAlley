// frontend/src/lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://cyan-carrots-win.loca.lt/api";

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    let initData = "";

    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp?.initData) {
        initData = (window as any).Telegram.WebApp.initData;
    } else {
        // Fallback for desktop testing
        initData = "YOUR_MOCK_INIT_DATA_FOR_LOCAL_TESTING"; 
    }

    const headers = {
        "Content-Type": "application/json",
        "x-telegram-init-data": initData,
        "ngrok-skip-browser-warning": "true", 
        "Bypass-Tunnel-Reminder": "true",
        ...options.headers,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `API Error: ${response.status}`);
        }

        if (response.status === 204) return {};
        return await response.json();
    } catch (error) {
        console.error(`API Call failed for ${endpoint}:`, error);
        throw error;
    }
}

// Helper to transform Backend Event -> Frontend Game
export function mapEventToGame(event: any): any {
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);

    return {
        id: event.id,
        title: event.title,
        description: event.description,
        type: event.type,
        level: event.level_required,
        rawDate: event.start_time,
        // Format: "Sat, May 10"
        date: start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        // Format: "18:00 - 20:00"
        time: `${start.getHours()}:${start.getMinutes().toString().padStart(2, '0')} - ${end.getHours()}:${end.getMinutes().toString().padStart(2, '0')}`,
        currentPlayers: event.current_players || 0, // Ensure backend provides this or default to 0
        maxPlayers: event.max_players,
        hostName: event.host?.first_name || "Organizer",
        hostRole: event.host?.role || "Host",
        price: event.price === 0 ? "Free" : `€${(event.price / 100).toFixed(2)}`, // Assuming price is in cents
        location: event.location_name,
        revolutTag: event.revolut_tag,
        isJoined: event.is_joined || false // Backend logic should check RSVPs for this
    };
}

export function mapRsvpToGame(rsvp: any): any {
    const event = rsvp.event; // The nested event data
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);

    return {
        id: event.id,
        title: event.title,
        description: event.description,
        rawDate: event.start_time,
        date: start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        time: `${start.getHours()}:${start.getMinutes().toString().padStart(2, '0')} - ${end.getHours()}:${end.getMinutes().toString().padStart(2, '0')}`,
        location: event.location_name,
        price: event.price,
        revolutTag: event.revolut_tag,
        slots: event.max_players,
        // filled: event.current_players || 0, // Ensure your backend calculates this
        filled: 0, // Fallback
        status: rsvp.status === 'confirmed' ? 'Upcoming' : 'Waitlisted',
        isJoined: true // By definition, if it's in this list
    };
}

export function mapFormToBackendEvent(formData: any): any {
    return {
        title: formData.title,
        description: formData.description,
        type: "Indoor", // Default or add to form
        level_required: formData.level,
        start_time: `${formData.date}T${formData.startTime}:00`,
        end_time: `${formData.date}T${formData.endTime}:00`,
        location_name: formData.location,
        price: parseInt(formData.price),
        revolut_tag: formData.revolutTag,
        max_players: parseInt(formData.maxPlayers)
    };
}

export default fetchWithAuth;