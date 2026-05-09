"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, CalendarDays, PlusCircle, UserCircle2 } from 'lucide-react';

interface FooterProps {
  isOrganizer?: boolean;
}

const Footer = ({ isOrganizer = false }: FooterProps) => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', icon: Home, href: '/' },
    { label: 'Browse', icon: Search, href: '/browse' },
    { label: 'My Games', icon: CalendarDays, href: '/my-games' },
    // Show Host button only for organizers
    ...(isOrganizer ? [{ label: 'Host', icon: PlusCircle, href: '/host' }] : []),
    { label: 'Profile', icon: UserCircle2, href: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-100 flex items-center justify-around px-2 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 active:scale-95 ${
              isActive ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <Icon 
              size={24} 
              strokeWidth={isActive ? 2.5 : 2} 
            />
            <span className="text-[10px] font-medium mt-1">
              {item.label}
            </span>
            
            {/* Active Highlight Dot */}
            {isActive && (
              <div className="absolute bottom-2 w-1 h-1 bg-blue-600 rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
};

export default Footer;