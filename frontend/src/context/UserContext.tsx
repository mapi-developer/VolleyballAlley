"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/api'; // Use named import

export type UserRole = 'member' | 'organizer' | 'admin';

interface UserContextType {
  user: any;
  rating: number;
  level: string;
  role: UserRole;
  setRole: (role: UserRole) => void;
  footerVisible: boolean;
  setFooterVisible: (visible: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children, initialRole, initialUser }: any) => {
  const [user, setUser] = useState<any>(initialUser);
  const [role, setRoleState] = useState<UserRole>(initialRole);
  const [footerVisible, setFooterVisible] = useState(true);

  const [rating, setRating] = useState(4.8);
  const [level, setLevel] = useState("Intermediate+");

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      const telegramUser = tg.initDataUnsafe.user;
      setUser(telegramUser);

      // CHANGE THIS:
      // Use a GET request to /users/me to trigger the auto-registration in FastAPI
      fetchWithAuth('/users/me')
      .then((data) => {
        console.log("Backend Sync/Auth successful:", data);
        if (data.role) setRoleState(data.role);
        // if (data.reliability_score) setRating(data.reliability_score);
      })
      .catch((err) => console.error("Auth failed:", err));
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    document.cookie = `dev-role=${newRole}; path=/; max-age=31536000`;
  };

  return (
    <UserContext.Provider value={{ user, rating, level, role, setRole, footerVisible, setFooterVisible }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};