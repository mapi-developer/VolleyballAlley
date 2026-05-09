// Define your backend URL. If testing locally, this is your FastAPI address.
// In production, you would set this in your .env.local file.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    let initData = "";

    // 1. Extract Telegram initData safely (only runs on the client side)
    if (typeof window !== "undefined" && window.Telegram?.WebApp?.initData) {
        initData = window.Telegram.WebApp.initData;
    } else {
        // ⚠️ LOCAL TESTING FALLBACK:
        // Paste your raw initData string here when testing in a normal desktop Chrome browser.
        // It looks like: "query_id=AAH...&user=%7B%22id%22..."
        initData = "YOUR_MOCK_INIT_DATA_FOR_LOCAL_TESTING"; 
    }

    // 2. Prepare headers
    const headers = {
        "Content-Type": "application/json",
        "x-telegram-init-data": initData, // The header FastAPI is looking for!
        ...options.headers,
    };

    // 3. Make the API Call
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `API Error: ${response.status}`);
        }

        // Return empty object for 204 No Content (like deletions)
        if (response.status === 204) return {};

        return await response.json();
    } catch (error) {
        console.error(`API Call failed for ${endpoint}:`, error);
        throw error;
    }
}