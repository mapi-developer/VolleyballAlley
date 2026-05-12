import React from 'react';
import { MapPin, Link as LinkIcon, MessageCircle, Calendar, Clock, Shield, Coins, Users, AlignLeft } from 'lucide-react';
import BottomSheetLayout from './BottomSheetLayout';
import { EventData } from './EventCard'; // Importing the type we made in Step 1

interface EventDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventData | null;
  onRsvp: () => void;
  isRegistered: boolean;
  userRole: string; // To check if they are the organizer
}

export default function EventDetailsSheet({ isOpen, onClose, event, onRsvp, isRegistered, userRole }: EventDetailsSheetProps) {
  if (!event) return null;

  const isFull = event.currentPlayers >= event.maxPlayers;
  const isHost = event.isHost;

  return (
    <BottomSheetLayout isOpen={isOpen} onClose={onClose} title="Game Details">
      
      {/* Title & Level */}
      <div className="mb-6">
        <h3 className="text-2xl font-black text-gray-900 leading-tight">{event.title}</h3>
        <div className="flex items-center gap-2 mt-2">
          <Shield size={16} className="text-blue-500" />
          <span className="text-sm font-medium text-gray-600">All Levels Welcome</span>
        </div>
      </div>

      {/* Grid Info Block */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
          <div className="flex items-center text-gray-500 text-xs mb-1 font-semibold uppercase tracking-wider">
            <Calendar size={14} className="mr-1" /> Date
          </div>
          <div className="font-semibold text-gray-900">{event.date}</div>
          <div className="text-sm text-gray-600">{event.startTime}</div>
        </div>

        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
          <div className="flex justify-between items-center text-gray-500 text-xs mb-1 font-semibold uppercase tracking-wider">
            <span className="flex items-center"><Users size={14} className="mr-1" /> Capacity</span>
            {isFull && <span className="text-red-500 font-bold">FULL</span>}
          </div>
          <div className="font-semibold text-gray-900">{event.currentPlayers} / {event.maxPlayers}</div>
          <div className="text-sm text-gray-600">Players Joined</div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <div className="flex items-center text-gray-900 font-bold mb-2">
          <AlignLeft size={18} className="mr-2 text-blue-500" /> Description
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">
          {/* Mock description for now, pull from event if available */}
          Join us for a friendly, competitive game! Please bring proper footwear and water.
        </p>
      </div>

      {/* Location & Payments */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center p-3 bg-blue-50 text-blue-700 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors">
          <MapPin size={20} className="mr-3 shrink-0" />
          <span className="text-sm font-semibold truncate flex-1">{event.location || 'Location TBD'}</span>
        </div>
        
        {event.fee !== undefined && (
           <div className="flex gap-2">
            <div className="flex items-center p-3 bg-gray-50 text-gray-800 rounded-xl flex-1 border border-gray-100">
              <Coins size={20} className="mr-3 text-amber-500 shrink-0" />
              <span className="text-sm font-bold">{event.fee === 0 ? 'Free' : `€${event.fee} Court Fee`}</span>
            </div>
            
            <button className="flex items-center justify-center px-4 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
              <LinkIcon size={16} className="mr-2" /> Revolut
            </button>
          </div>
        )}
      </div>

      <hr className="border-gray-100 mb-6" />

      {/* Action Buttons */}
      <div className="space-y-3">
        {!isHost && (
          <button className="w-full py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors">
            <MessageCircle size={18} className="mr-2" /> Message Host
          </button>
        )}

        <button 
          onClick={onRsvp}
          disabled={isHost}
          className={`w-full py-4 text-white font-bold rounded-xl shadow-md text-lg transition-all ${
            isHost ? 'bg-gray-400 cursor-not-allowed' :
            isRegistered ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' : 
            isFull ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30' : 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30'
          }`}
        >
          {isHost ? "You're the Organizer" : 
           isRegistered ? "Cancel RSVP" : 
           isFull ? "Join Waitlist" : "Confirm RSVP"}
        </button>
      </div>

    </BottomSheetLayout>
  );
}