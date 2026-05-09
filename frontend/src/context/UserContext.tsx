"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

interface UserContextType {
  user: any;
  rating: number;
  level: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  
  // These are the variables you wanted to pass from the layout level
  const [rating] = useState(4.8);
  const [level] = useState("Intermediate+");

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      setUser(tg.initDataUnsafe.user);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, rating, level }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};