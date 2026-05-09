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

// Add this line to fix the "Did you mean to import default?" error
export default fetchWithAuth;