import React, { useState } from 'react';
import { Bell, Settings, Info, ChevronRight, Star } from 'lucide-react';

export default function ProfileView({ currentRole, setCurrentRole }) {
  const [role, setRole] = useState(currentRole || 'Organizer');

  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    if (setCurrentRole) setCurrentRole(newRole);
  };

  return (
    <div className="flex flex-col min-h-full bg-tg-secondary">
      
      {/* Top Header */}
      <header className="flex justify-between items-center px-4 py-4 bg-tg-bg border-b border-tg-hint/10 shrink-0">
        <h1 className="text-xl font-bold text-tg-text">My Profile</h1>
        <div className="w-8 h-8 rounded-full bg-tg-button/10 text-tg-button flex items-center justify-center font-bold text-sm">
          M
        </div>
      </header>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* User Identity Card */}
        <div className="bg-tg-bg rounded-3xl p-6 flex flex-col items-center text-center shadow-sm border border-tg-hint/10">
          <div className="w-20 h-20 rounded-full bg-tg-button text-tg-buttonText flex items-center justify-center text-3xl font-bold mb-3 shadow-md">
            M
          </div>
          <h2 className="text-2xl font-bold text-tg-text leading-tight">Matvei</h2>
          <p className="text-tg-hint text-sm mb-4">@mapi_dev</p>

          {/* Gamification Badges */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            <span className="bg-tg-button/10 text-tg-button px-3 py-1.5 rounded-full text-xs font-semibold">
              Level: Intermediate/Advanced
            </span>
            <span className="bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" /> 
              4.8 / 5.0
            </span>
          </div>
          <p className="text-[11px] text-tg-hint/70">
            Behavior rating is updated automatically based on attendance.
          </p>
        </div>

        {/* Settings Menu List */}
        <div className="bg-tg-bg rounded-3xl shadow-sm border border-tg-hint/10 overflow-hidden">
          <button className="w-full flex items-center justify-between p-4 border-b border-tg-hint/10 active:bg-tg-secondary transition-colors">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-tg-button" />
              <span className="text-tg-text font-medium text-sm">Notification Settings</span>
            </div>
            <ChevronRight className="w-5 h-5 text-tg-hint/50" />
          </button>
          
          <button className="w-full flex items-center justify-between p-4 border-b border-tg-hint/10 active:bg-tg-secondary transition-colors">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-tg-button" />
              <span className="text-tg-text font-medium text-sm">App Preferences</span>
            </div>
            <ChevronRight className="w-5 h-5 text-tg-hint/50" />
          </button>
          
          <button className="w-full flex items-center justify-between p-4 active:bg-tg-secondary transition-colors">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-tg-button" />
              <span className="text-tg-text font-medium text-sm">About VolleyballAlley</span>
            </div>
            <ChevronRight className="w-5 h-5 text-tg-hint/50" />
          </button>
        </div>

        {/* Developer Tool: Role Switcher */}
        <div className="bg-tg-secondary rounded-3xl p-5 mt-2">
          <h3 className="text-[11px] font-bold text-tg-hint tracking-wider mb-3 uppercase">
            Dev Tool: Switch Role
          </h3>
          <div className="flex gap-2">
            {['Member', 'Organizer', 'Admin'].map((r) => (
              <button
                key={r}
                onClick={() => handleRoleSwitch(r)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  role === r 
                    ? 'bg-tg-button text-tg-buttonText shadow-md' 
                    : 'bg-tg-bg text-tg-text hover:bg-tg-hint/10'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}