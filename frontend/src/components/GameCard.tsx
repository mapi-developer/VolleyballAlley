"use client";

import React from 'react';
import { Clock, Users, MapPin, CreditCard } from 'lucide-react';

export interface Game {
  id: string;
  type: 'Indoor' | 'Outdoor';
  level: 'Advanced' | 'Beginner' | 'All';
  title: string;
  description: string;
  rawDate: string;
  date: string;
  time: string;
  currentPlayers: number;
  maxPlayers: number;
  hostName: string;
  hostRole: string;
  price: string;
  location: string;
  revolutTag?: string;
  isJoined?: boolean;
}

interface GameCardProps {
  game: Game;
  onClick: () => void; // Added for opening details
  onMapClick: (location: string) => void;
  onPayClick: (tag: string) => void;
  onRsvpClick: () => void;
  onCancelClick?: () => void;
}

export default function GameCard({ 
  game, 
  onClick, 
  onMapClick, 
  onPayClick, 
  onRsvpClick, 
  onCancelClick 
}: GameCardProps) {
  const isFull = game.currentPlayers >= game.maxPlayers;
  const isFree = game.price.toLowerCase() === "free";
  const badgeColor = game.type === 'Indoor' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800';

  // Helper to handle button clicks without triggering card click
  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation(); // Prevents the card's onClick from firing
    action();
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col gap-4 active:scale-[0.99] transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${badgeColor}`}>
          {game.type}
        </span>
        {game.isJoined && (
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
            Joined
          </span>
        )}
      </div>

      <h3 className="text-xl font-bold text-gray-900 leading-tight">{game.title}</h3>

      <div className="space-y-2 text-sm text-gray-600 font-medium">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-blue-500" />
          <span>{game.date} • {game.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users size={16} className="text-blue-500" />
          <span>
            {game.currentPlayers}/{game.maxPlayers} Players • {game.hostName}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={(e) => handleAction(e, () => onMapClick(game.location))}
          className="flex-1 flex items-center justify-center gap-2 bg-zinc-100 text-gray-700 py-2.5 rounded-xl text-sm font-bold active:scale-95 transition-transform"
        >
          <MapPin size={16} /> Maps
        </button>

        <button 
          onClick={(e) => game.revolutTag && handleAction(e, () => onPayClick(game.revolutTag!))}
          disabled={isFree}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
            isFree 
              ? 'bg-zinc-50 text-gray-400 cursor-default' 
              : 'bg-zinc-100 text-gray-700 active:scale-95'
          }`}
        >
          <CreditCard size={16} /> 
          {isFree ? "Free" : `Pay ${game.price}`}
        </button>
      </div>

      {game.isJoined ? (
        <button 
          onClick={(e) => handleAction(e, onCancelClick || (() => {}))} 
          className="w-full bg-rose-50 text-rose-600 py-3.5 rounded-xl font-bold text-[15px] active:scale-95 transition-transform"
        >
          Cancel RSVP
        </button>
      ) : (
        <button 
          onClick={(e) => handleAction(e, onRsvpClick)} 
          disabled={isFull} 
          className={`w-full py-3.5 rounded-xl font-bold text-[15px] active:scale-95 transition-transform ${
            isFull ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white shadow-md shadow-blue-200'
          }`}
        >
          {isFull ? 'Waitlist Full' : 'RSVP Now'}
        </button>
      )}
    </div>
  );
}