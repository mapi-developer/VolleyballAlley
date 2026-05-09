"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

// Define the available roles
export type UserRole = 'member' | 'organizer' | 'admin';

interface UserContextType {
  user: any;
  rating: number;
  level: string;
  role: UserRole; // Added role state
  setRole: (role: UserRole) => void; // Added role setter
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<UserRole>('member'); // Default to member
  
  const [rating] = useState(4.8);
  const [level] = useState("Intermediate+");

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      setUser(tg.initDataUnsafe.user);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, rating, level, role, setRole }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};