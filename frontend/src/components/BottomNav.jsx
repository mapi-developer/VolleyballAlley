import React from 'react';
import { Home, Search, CalendarDays, User, Shield } from 'lucide-react';

const NavButton = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-16 py-1 gap-1 transition-colors ${
      active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
    }`}
  >
    <div className={`transition-transform duration-200 ${active ? 'scale-110' : 'scale-100'}`}>
      {icon}
    </div>
    <span className={`text-[10px] font-medium ${active ? 'font-bold' : ''}`}>{label}</span>
  </button>
);

export default function BottomNav({ activeTab, setActiveTab, userRole }) {
  return (
    <nav className="shrink-0 w-full bg-white border-t border-gray-200 pb-safe pt-2 px-2 flex justify-around items-center z-20 pb-4 shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.05)]">
      <NavButton id="home" icon={<Home size={22} />} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
      <NavButton id="browse" icon={<Search size={22} />} label="Browse" active={activeTab === 'browse'} onClick={() => setActiveTab('browse')} />
      <NavButton id="mygames" icon={<CalendarDays size={22} />} label="My Games" active={activeTab === 'mygames'} onClick={() => setActiveTab('mygames')} />
      
      {(userRole === 'organizer' || userRole === 'admin') && (
        <NavButton id="organizer" icon={<Shield size={22} />} label="Host" active={activeTab === 'organizer'} onClick={() => setActiveTab('organizer')} />
      )}

      <NavButton id="profile" icon={<User size={22} />} label="Profile" active={activeTab === 'profile' || activeTab === 'notifications'} onClick={() => setActiveTab('profile')} />
    </nav>
  );
}