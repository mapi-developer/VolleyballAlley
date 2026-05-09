"use client";

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';

const Header = ({ user }: { user?: any }) => {
  const pathname = usePathname();
  const [imageError, setImageError] = useState(false);

  // Map routes to display titles
  const getPageTitle = (path: string) => {
    switch (path) {
      case '/':
        return 'Home';
      case '/browse':
        return 'Browse';
      case '/my-games':
        return 'My Games';
      case '/host':
        return 'Host';
      case '/profile':
        return 'Profile';
      default:
        return 'VolleyballAlley';
    }
  };

  const initial = user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'V';

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-50 shadow-sm">
      {/* Dynamic Title based on current route */}
      <h1 className="text-xl font-bold text-gray-900">
        {getPageTitle(pathname)}
      </h1>

      {/* User Avatar */}
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-inner shrink-0">
        {user?.photo_url && !imageError ? (
          <img 
            src={user.photo_url} 
            alt="User" 
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="text-blue-700 font-bold text-lg">{initial}</span>
        )}
      </div>
    </header>
  );
};

export default Header;