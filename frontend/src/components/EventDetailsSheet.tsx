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

export default function EventDetailsSheet({ isOpen, onClose, game, onRsvp, onCancelRsvp, isCancelling = false }: EventDetailsSheetProps) {
  
  // Safely calculate variables ONLY if game exists to prevent crashes during the closing animation
  const isFull = game ? game.currentPlayers >= game.maxPlayers : false;
  const isCancellable = game ? (new Date(game.rawDate).getTime() - Date.now()) > (2 * 60 * 60 * 1000) : false;

  const handleMapClick = () => {
    if (!game) return;
    // FIXED: Use the official Google Maps query URL
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(game.location)}`, '_blank');
  };

  const handlePayClick = () => {
    if (!game || !game.revolutTag) return;
    const cleanTag = game.revolutTag.replace('@', '');
    window.open(`https://revolut.me/${cleanTag}`, '_blank');
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Game Details">
      {/* Wrap the content in game && so it only renders if there is data, but keeps the sheet alive to animate! */}
      {game && (
        <div className="space-y-6 pb-10 mt-2">
          {/* Title, Level, & Type Block */}
          <div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight transition-colors">{game.title}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md transition-colors">
                  <Shield size={14} />
                  <span className="text-xs font-bold">{game.level} Level</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md transition-colors">
                  <MapIcon size={14} />
                  <span className="text-xs font-bold">{game.type}</span>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 space-y-1 transition-colors">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-tight"><Calendar size={12} /> Date</div>
              <p className="text-sm font-bold text-gray-900 dark:text-zinc-100">{game.date}</p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 space-y-1 transition-colors">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-tight"><Clock size={12} /> Time</div>
              <p className="text-sm font-bold text-gray-900 dark:text-zinc-100">{game.time.split(' - ')[0]}</p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 space-y-1 transition-colors">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-tight"><Banknote size={12} /> Court Fee</div>
              <p className="text-sm font-bold text-gray-900 dark:text-zinc-100">{game.price}</p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 space-y-1 transition-colors">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-tight"><Users size={12} /> Capacity</div>
              <p className="text-sm font-bold text-gray-900 dark:text-zinc-100">{game.currentPlayers}/{game.maxPlayers}</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest px-1"><AlignLeft size={14} /> Description</div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 text-sm text-gray-700 dark:text-zinc-300 leading-relaxed font-medium whitespace-pre-wrap transition-colors">
              {game.description || "No description provided."}
            </div>
          </div>

          {/* Maps Location */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest px-1"><MapPin size={14} /> Location</div>
            <button onClick={handleMapClick} className="flex items-center justify-between w-full bg-zinc-100 dark:bg-zinc-800 text-gray-900 dark:text-white p-4 rounded-2xl active:scale-95 transition-all border border-gray-200 dark:border-zinc-700">
              <span className="font-bold text-sm truncate pr-4">{game.location}</span>
              <MapIcon size={18} className="text-blue-600 dark:text-blue-400 shrink-0" />
            </button>
          </div>

          {/* REVOLUT PAYMENT BLOCK */}
          {game.revolutTag && game.price.toLowerCase() !== 'free' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest px-1">
                <ExternalLink size={14} /> Payment Link
              </div>
              <button onClick={handlePayClick} className="flex items-center justify-between w-full bg-blue-600 dark:bg-blue-500 text-white p-4 rounded-2xl active:scale-95 transition-all">
                <span className="font-bold text-sm">Pay via Revolut</span>
                <span className="text-xs opacity-80 font-medium">@{game.revolutTag.replace('@', '')}</span>
              </button>
            </div>
          )}

          <hr className="border-gray-100 dark:border-zinc-800 my-4" />

          {/* Actions */}
          <div className="space-y-3">
            {!game.isHost && (
              <button className="w-full py-4 bg-zinc-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 font-bold rounded-2xl flex items-center justify-center active:scale-95 transition-all text-sm">
                <MessageCircle size={18} className="mr-2 text-blue-500 dark:text-blue-400" /> Message Host
              </button>
            )}

            {game.isHost ? (
              <button disabled className="w-full py-4 rounded-2xl font-black text-base shadow-none bg-zinc-100 dark:bg-zinc-800/50 text-gray-400 dark:text-zinc-600 cursor-not-allowed transition-colors">
                You're the Organizer
              </button>
            ) : game.isJoined ? (
               isCancellable ? (
                  <button onClick={() => onCancelRsvp?.(game.id)} disabled={isCancelling} className="w-full py-4 rounded-2xl font-black text-base shadow-xl active:scale-95 transition-all bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 shadow-rose-100 dark:shadow-none flex justify-center items-center disabled:opacity-50">
                    {isCancelling ? <Loader2 className="animate-spin" size={20} /> : (game.rsvpStatus === 'waitlisted' ? 'Leave Waitlist' : 'Cancel RSVP')}
                  </button>
               ) : (
                  <div className="space-y-2 text-center">
                    <div className="w-full flex items-center justify-center gap-2 text-gray-400 dark:text-zinc-500 font-bold text-sm py-4 bg-gray-100 dark:bg-zinc-800 rounded-2xl cursor-not-allowed opacity-60 transition-colors">
                      <XCircle size={18} /> Cancellation Locked
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium px-4 leading-relaxed">
                      Cancellation is locked 2h before the match starts to prevent empty slots.
                    </p>
                  </div>
               )
            ) : (
              <button onClick={() => onRsvp?.(game.id)} className={`w-full py-4 rounded-2xl font-black text-base shadow-xl active:scale-95 transition-all ${isFull ? 'bg-amber-500 dark:bg-amber-600 text-white shadow-amber-100 dark:shadow-none' : 'bg-blue-600 dark:bg-blue-500 text-white shadow-blue-100 dark:shadow-none'}`}>
                {isFull ? 'Join Waitlist' : 'RSVP Now'}
              </button>
            )}
          </div>
        </div>
      )}
    </BottomSheet>
  );
}