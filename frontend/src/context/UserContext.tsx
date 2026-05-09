"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

export type UserRole = 'member' | 'organizer' | 'admin';

interface UserContextType {
  user: any;
  rating: number;
  level: string;
  role: UserRole;
  setRole: (role: UserRole) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [rating] = useState(4.8);
  const [level] = useState("Intermediate+");
  
  // 1. Initialize role as 'member' initially to avoid hydration errors
  const [role, setRoleState] = useState<UserRole>('member');

  // 2. Load the role from localStorage on mount
  useEffect(() => {
    const savedRole = localStorage.getItem('dev-role') as UserRole;
    if (savedRole) {
      setRoleState(savedRole);
    }

    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      setUser(tg.initDataUnsafe.user);
    }
  }, []);

  // 3. Wrapper function to save the role when it changes
  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem('dev-role', newRole);
  };

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