"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api'; // Import our new API client

export type UserRole = 'member' | 'organizer' | 'admin';

interface UserContextType {
  user: any;
  rating: number;
  level: string;
  role: UserRole;
  setRole: (role: UserRole) => Promise<void>; // Updated to Promise
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
  const [rating, setRating] = useState(4.8);
  const [level, setLevel] = useState("Beginner");
  const [footerVisible, setFooterVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true); // Track loading state

  // Fetch real user from Backend on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        // This will automatically pass the Telegram initData via headers
        const backendUser = await api.getCurrentUser();
        
        setUser(backendUser);
        setRoleState(backendUser.role);
        setRating(backendUser.reliability_score || 5.0); // Real db value
        setLevel(backendUser.verified_level || "Beginner"); // Real db value
        
      } catch (error) {
        console.error("Failed to fetch user profile from API:", error);
        // Fallback to raw Telegram data if local backend fails to connect
        const tg = (window as any).Telegram?.WebApp;
        if (tg?.initDataUnsafe?.user) {
          setUser(tg.initDataUnsafe.user);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Make setRole update the database!
  const setRole = async (newRole: UserRole) => {
    const previousRole = role;
    try {
      // Optimistic UI update (feels instant to the user)
      setRoleState(newRole);
      
      // Tell backend to update the database
      await api.updateRole(newRole);
    } catch (error) {
      console.error("Failed to update role in DB:", error);
      // Revert if API call fails
      setRoleState(previousRole);
      alert("Failed to update role on server.");
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, rating, level, role, setRole, 
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