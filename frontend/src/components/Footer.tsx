"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, CalendarDays, PlusCircle, UserCircle2 } from 'lucide-react';
import { useUser } from '@/context/UserContext';

const Footer = () => {
  const pathname = usePathname();
  const { role, footerVisible } = useUser();
  const isOrganizer = role === 'organizer' || role === 'admin';
  const navItems = [ { label: 'Home', icon: Home, href: '/' }, { label: 'Browse', icon: Search, href: '/browse' }, { label: 'My Games', icon: CalendarDays, href: '/my-games' }, ...(isOrganizer ? [{ label: 'Host', icon: PlusCircle, href: '/host' }] : []), { label: 'Profile', icon: UserCircle2, href: '/profile' }, ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 h-20 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-around px-2 z-50 transition-all duration-300 ${footerVisible ? 'translate-y-0' : 'translate-y-full'}`}>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.label} href={item.href} className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 active:scale-95 relative ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-zinc-500'}`}>
            <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium mt-1">{item.label}</span>
            {isActive && (<div className="absolute bottom-2 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full" />)}
          </Link>
        );
      })}
    </nav>
  );
};

export default Footer;