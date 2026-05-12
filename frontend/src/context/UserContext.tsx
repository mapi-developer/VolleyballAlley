"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';

export type UserRole = 'member' | 'organizer' | 'admin';

interface UserContextType {
  user: any;
  rating: number;
  level: string;
  role: UserRole;
  setRole: (role: UserRole) => Promise<void>;
  refreshUser: () => Promise<void>; // Added refreshUser to the interface
  footerVisible: boolean;
  setFooterVisible: (visible: boolean) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ 
  children, 
  initialRole = 'member', 
  initialUser = null
}: { 
  children: React.ReactNode, 
  initialRole?: UserRole,
  initialUser?: any 
}) => {
  const [user, setUser] = useState<any>(initialUser);
  const [role, setRoleState] = useState<UserRole>(initialRole);
  const [rating, setRating] = useState(5.0);
  const [level, setLevel] = useState("Beginner");
  const [footerVisible, setFooterVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Define the refresh logic as a reusable function
  const refreshUser = useCallback(async () => {
    try {
      const backendUser = await api.getCurrentUser();
      
      setUser(backendUser);
      setRoleState(backendUser.role);
      setRating(backendUser.reliability_score ?? 5.0);
      setLevel(backendUser.verified_level ?? "Beginner");
    } catch (error) {
      console.error("Failed to refresh user profile:", error);
    }
  }, []);

  // 2. Fetch on mount
  useEffect(() => {
    const initProfile = async () => {
      setIsLoading(true);
      try {
        await refreshUser();
      } catch (error) {
        // Fallback to raw Telegram data if local backend fails
        const tg = (window as any).Telegram?.WebApp;
        if (tg?.initDataUnsafe?.user) {
          setUser(tg.initDataUnsafe.user);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initProfile();
  }, [refreshUser]);

  const setRole = async (newRole: UserRole) => {
    const previousRole = role;
    try {
      setRoleState(newRole);
      await api.updateRole(newRole);
      // Refresh user after role change to ensure backend object matches
      await refreshUser();
    } catch (error) {
      console.error("Failed to update role in DB:", error);
      setRoleState(previousRole);
      alert("Failed to update role on server.");
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, rating, level, role, setRole, refreshUser,
      footerVisible, setFooterVisible, isLoading 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};