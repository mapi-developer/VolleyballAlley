import React, { useState } from 'react';
import { Search, CalendarDays, User, MapPin, CreditCard, Star, Settings, Bell, ChevronRight, Info, Plus, Edit2, ArrowLeft } from 'lucide-react';
import { Badge, EventCard } from '../components/Shared';

export const EventDetailView = ({ event }) => (
  <div className="animate-in fade-in slide-in-from-right-4 duration-300 pb-4">
       <div className="h-28 bg-gradient-to-tr from-blue-600 to-indigo-600 -mx-4 -mt-4 mb-4 rounded-b-3xl shadow-sm"></div>
       <div className="relative -mt-16 bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-6 mx-2">
         <div className="flex justify-between items-start mb-2">
            <Badge variant={event.type === 'Indoor' ? 'primary' : 'warning'}>{event.type}</Badge>
            <Badge variant="secondary">{event.level}</Badge>
         </div>
         <h2 className="text-2xl font-bold text-gray-900 leading-tight">{event.title}</h2>
         <p className="text-gray-500 text-sm mt-2 flex items-center gap-2">
            <User size={14} className="text-blue-500"/> Hosted by <span className="font-semibold text-gray-800">{event.host}</span>
         </p>
       </div>
       {/* Other details truncated for brevity, use your full EventDetailView code here */}
  </div>
);

export const HomeView = ({ events, onEventClick, onRSVP }) => {
  const joinedGamesCount = events.filter(e => e.isJoined).length;
  const nextGame = events.find(e => e.isJoined);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white mb-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-1">Ready to play?</h2>
        <p className="text-blue-100 mb-4 text-sm">You have {joinedGamesCount} game{joinedGamesCount !== 1 ? 's' : ''} coming up this week.</p>
        <button 
          onClick={() => nextGame && onEventClick(nextGame.id)}
          className={`px-4 py-2 rounded-xl font-bold text-sm shadow-sm active:scale-95 transition-transform ${
            nextGame ? 'bg-white text-blue-600' : 'bg-blue-700 text-blue-300 cursor-not-allowed opacity-80'
          }`}
        >
          {nextGame ? 'View Next Game' : 'No Upcoming Games'}
        </button>
      </div>
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
      </div>
      {events.filter(e => !e.isJoined).map(event => (
        <EventCard key={event.id} event={event} onClick={() => onEventClick(event.id)} onRSVP={onRSVP} />
      ))}
    </div>
  );
};

export const BrowseView = ({ events, onEventClick, onRSVP }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
    <div className="sticky top-0 bg-gray-50 pt-2 pb-4 z-10">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input type="text" placeholder="Search by city, level, or host..." className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
    </div>
    <div className="mt-2">
      {events.map(event => (
        <EventCard key={event.id} event={event} onClick={() => onEventClick(event.id)} onRSVP={onRSVP} />
      ))}
    </div>
  </div>
);

// Add your MyGamesView, ProfileView, OrganizerView, EventFormView, NotificationSettingsView exactly as they were here.