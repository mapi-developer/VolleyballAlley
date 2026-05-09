import React from 'react';
import { Clock, Users, MapPin, CreditCard } from 'lucide-react';

export const Badge = ({ children, variant = "primary" }) => {
  const styles = {
    primary: "bg-blue-100 text-blue-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    secondary: "bg-gray-200 text-gray-700",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${styles[variant]}`}>
      {children}
    </span>
  );
};

export const EventCard = ({ event, onClick, onRSVP }) => {
  return (
    <div 
      onClick={onClick}
      className="cursor-pointer bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4 flex flex-col gap-3 relative overflow-hidden transition-all hover:border-blue-200 active:scale-[0.99]"
    >
      <div className="flex justify-between items-start">
        <div>
          <Badge variant={event.type === 'Indoor' ? 'primary' : 'warning'}>{event.type}</Badge>
          <h3 className="font-bold text-lg mt-1 text-gray-900">{event.title}</h3>
        </div>
        {event.isJoined && <Badge variant="success">Joined</Badge>}
      </div>

      <div className="flex flex-col gap-1.5 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-blue-500" />
          <span>{event.date} • {event.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users size={16} className="text-blue-500" />
          <span>{event.attendees}/{event.maxAttendees} Players • Host: {event.host}</span>
        </div>
      </div>

      <div className="flex gap-2 mt-1">
        <button 
          onClick={(e) => e.stopPropagation()}
          className="flex-1 flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl text-xs font-medium transition-colors"
        >
          <MapPin size={14} /> Maps
        </button>
        {event.price !== 'Free' && (
          <button 
            onClick={(e) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl text-xs font-medium transition-colors"
          >
            <CreditCard size={14} /> Pay {event.price}
          </button>
        )}
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onRSVP(event.id); }}
        className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] mt-1 ${
          event.isJoined 
            ? 'bg-red-50 text-red-600 hover:bg-red-100' 
            : event.status === 'full' 
              ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200'
        }`}
      >
        {event.isJoined ? 'Cancel RSVP' : event.status === 'full' ? 'Join Waitlist' : 'RSVP Now'}
      </button>
    </div>
  );
};