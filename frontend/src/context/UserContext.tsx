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

export const UserProvider = ({ 
  children, 
  initialRole, 
  initialUser 
}: { 
  children: React.ReactNode, 
  initialRole: UserRole,
  initialUser: any 
}) => {
  const [user, setUser] = useState<any>(initialUser); // Initialize with cookie data
  const [role, setRoleState] = useState<UserRole>(initialRole);
  
  const [rating] = useState(4.8);
  const [level] = useState("Intermediate+");

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      const telegramUser = tg.initDataUnsafe.user;
      setUser(telegramUser);
      
      // Save basic user info to cookie for zero-flicker header
      const cookieData = {
        first_name: telegramUser.first_name,
        photo_url: telegramUser.photo_url
      };
      document.cookie = `user-data=${encodeURIComponent(JSON.stringify(cookieData))}; path=/; max-age=31536000`;
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    document.cookie = `dev-role=${newRole}; path=/; max-age=31536000`;
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