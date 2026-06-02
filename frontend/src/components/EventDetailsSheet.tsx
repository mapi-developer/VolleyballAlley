"use client";

import React from 'react';
import { Calendar, Clock, Banknote, Users, Info, MapPin, Map as MapIcon, ExternalLink, Shield, XCircle, Loader2, MessageCircle, AlignLeft } from 'lucide-react';
import BottomSheet from '@/components/BottomSheet';
import { Game } from '@/components/EventCard'; 

interface EventDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game | null;
  onRsvp?: (gameId: string) => void;
  onCancelRsvp?: (gameId: string) => void;
  isCancelling?: boolean;
}

// BULLETPROOF HELPERS
const parseBackendDate = (utcString?: string) => {
    if (!utcString) return null;
    const safeString = utcString.endsWith('Z') || utcString.match(/[+-]\d{2}:\d{2}$/) 
        ? utcString 
        : `${utcString}Z`;
    const dateObj = new Date(safeString);
    return isNaN(dateObj.getTime()) ? null : dateObj;
};

const getLocalDate = (game: Game, fallback: string) => {
    const dateObj = parseBackendDate(game.start_time || game.rawDate);
    if (!dateObj) return fallback;
    return dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

const getLocalTime = (game: Game, fallback: string) => {
    const dateObj = parseBackendDate(game.start_time || game.rawDate);
    if (!dateObj) return fallback;
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

export default function EventDetailsSheet({ isOpen, onClose, game, onRsvp, onCancelRsvp, isCancelling = false }: EventDetailsSheetProps) {
  
  const isFull = game ? game.currentPlayers >= game.maxPlayers : false;
  // Use parseBackendDate for the cancellation lock to ensure accuracy
  const gameStartTime = game ? parseBackendDate(game.start_time || game.rawDate)?.getTime() || 0 : 0;
  const isCancellable = gameStartTime > 0 ? (gameStartTime - Date.now()) > (2 * 60 * 60 * 1000) : false;

  const handleMapClick = () => {
    if (!game) return;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(game.location)}`, '_blank');
  };

  const handlePayClick = () => {
    if (!game || !game.revolutTag) return;
    const cleanTag = game.revolutTag.replace('@', '');
    window.open(`https://revolut.me/${cleanTag}`, '_blank');
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Game Details">
      {game && (
        <div className="space-y-6 pb-10 mt-2">
          {/* Title, Level, & Type Block */}
          <div>
            <h3 className="text-2xl font-black text-app-text-primary leading-tight transition-colors">{game.title}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <div className="flex items-center gap-1.5 text-app-accent bg-app-accent-bg px-2 py-1 rounded-md transition-colors">
                  <Shield size={14} />
                  <span className="text-xs font-bold">{game.level} Level</span>
              </div>
              <div className="flex items-center gap-1.5 text-app-success bg-app-success-bg px-2 py-1 rounded-md transition-colors">
                  <MapIcon size={14} />
                  <span className="text-xs font-bold">{game.type}</span>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-app-inset rounded-2xl p-4 space-y-1 transition-colors">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-app-text-secondary uppercase tracking-tight"><Calendar size={12} /> Date</div>
              <p className="text-sm font-bold text-app-text-primary">{getLocalDate(game, game.date)}</p>
            </div>
            <div className="bg-app-inset rounded-2xl p-4 space-y-1 transition-colors">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-app-text-secondary uppercase tracking-tight"><Clock size={12} /> Time</div>
              <p className="text-sm font-bold text-app-text-primary">{getLocalTime(game, game.time.split(' - ')[0])}</p>
            </div>
            <div className="bg-app-inset rounded-2xl p-4 space-y-1 transition-colors">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-app-text-secondary uppercase tracking-tight"><Banknote size={12} /> Court Fee</div>
              <p className="text-sm font-bold text-app-text-primary">{game.price}</p>
            </div>
            <div className="bg-app-inset rounded-2xl p-4 space-y-1 transition-colors">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-app-text-secondary uppercase tracking-tight"><Users size={12} /> Capacity</div>
              <p className="text-sm font-bold text-app-text-primary">{game.currentPlayers}/{game.maxPlayers}</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-black text-app-text-secondary uppercase tracking-widest px-1"><AlignLeft size={14} /> Description</div>
            <div className="bg-app-inset rounded-2xl p-4 text-sm text-app-text-primary leading-relaxed font-medium whitespace-pre-wrap transition-colors">
              {game.description || "No description provided."}
            </div>
          </div>

          {/* Maps Location */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-black text-app-text-secondary uppercase tracking-widest px-1"><MapPin size={14} /> Location</div>
            <button onClick={handleMapClick} className="flex items-center justify-between w-full bg-app-inset text-app-text-primary p-4 rounded-2xl active:scale-95 transition-all border border-app-active">
              <span className="font-bold text-sm truncate pr-4">{game.location}</span>
              <MapIcon size={18} className="text-app-accent shrink-0" />
            </button>
          </div>

          {/* REVOLUT PAYMENT BLOCK */}
          {game.revolutTag && game.price.toLowerCase() !== 'free' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-black text-app-text-secondary uppercase tracking-widest px-1">
                <ExternalLink size={14} /> Payment Link
              </div>
              <button onClick={handlePayClick} className="flex items-center justify-between w-full bg-app-accent text-white p-4 rounded-2xl active:scale-95 transition-all">
                <span className="font-bold text-sm">Pay via Revolut</span>
                <span className="text-xs opacity-80 font-medium">@{game.revolutTag.replace('@', '')}</span>
              </button>
            </div>
          )}

          <hr className="border-app-active my-4" />

          {/* Actions */}
          <div className="space-y-3">
            {!game.isHost && (
              <button className="w-full py-4 bg-app-inset text-app-text-primary font-bold rounded-2xl flex items-center justify-center active:scale-95 transition-all text-sm hover:bg-app-active">
                <MessageCircle size={18} className="mr-2 text-app-accent" /> Message Host
              </button>
            )}

            {game.isHost ? (
              <button disabled className="w-full py-4 rounded-2xl font-black text-base shadow-none bg-app-inset opacity-70 text-app-text-secondary cursor-not-allowed transition-colors">
                You're the Organizer
              </button>
            ) : game.isJoined ? (
               isCancellable ? (
                  <button onClick={() => onCancelRsvp?.(game.id)} disabled={isCancelling} className="w-full py-4 rounded-2xl font-black text-base shadow-xl active:scale-95 transition-all bg-app-error-bg text-app-error flex justify-center items-center disabled:opacity-50">
                    {isCancelling ? <Loader2 className="animate-spin" size={20} /> : (game.rsvpStatus === 'waitlisted' ? 'Leave Waitlist' : 'Cancel RSVP')}
                  </button>
               ) : (
                  <div className="space-y-2 text-center">
                    <div className="w-full flex items-center justify-center gap-2 text-app-text-secondary font-bold text-sm py-4 bg-app-inset rounded-2xl cursor-not-allowed opacity-60 transition-colors">
                      <XCircle size={18} /> Cancellation Locked
                    </div>
                    <p className="text-[10px] text-app-text-secondary font-medium px-4 leading-relaxed">
                      Cancellation is locked 2h before the match starts to prevent empty slots.
                    </p>
                  </div>
               )
            ) : (
              <button onClick={() => onRsvp?.(game.id)} className={`w-full py-4 rounded-2xl font-black text-base shadow-xl active:scale-95 transition-all ${isFull ? 'bg-app-warning text-white' : 'bg-app-accent text-white'}`}>
                {isFull ? 'Join Waitlist' : 'RSVP Now'}
              </button>
            )}
          </div>
        </div>
      )}
    </BottomSheet>
  );
}