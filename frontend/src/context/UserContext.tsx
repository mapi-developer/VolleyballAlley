'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';

// 1. Create the Context
export const UserContext = createContext<any>(null);

// 2. The Provider Component
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initApp() {
      try {
        // Signal to Telegram that the app is ready
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          window.Telegram.WebApp.ready();
          window.Telegram.WebApp.expand();
        }

        // Fetch or auto-register user profile in backend
        const profile = await api.getProfile();
        setUser(profile);
      } catch (err) {
        console.error("Failed to sync user with backend:", err);
      } finally {
        setLoading(false);
      }
    }

    initApp();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

// 3. THE MISSING PIECE: Export the custom hook
// This allows components to use: const { user } = useUser();
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};