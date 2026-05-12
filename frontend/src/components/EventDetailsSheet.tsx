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
    window.open(`http://googleusercontent.com/maps.google.com/?q=${encodeURIComponent(game.location)}`, '_blank');
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
            <h3 className="text-2xl font-black text-gray-900 leading-tight">{game.title}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                  <Shield size={14} />
                  <span className="text-xs font-bold">{game.level} Level</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                  <MapIcon size={14} />
                  <span className="text-xs font-bold">{game.type}</span>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-50 rounded-2xl p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-tight"><Calendar size={12} /> Date</div>
              <p className="text-sm font-bold text-gray-900">{game.date}</p>
            </div>
            <div className="bg-zinc-50 rounded-2xl p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-tight"><Clock size={12} /> Time</div>
              <p className="text-sm font-bold text-gray-900">{game.time.split(' - ')[0]}</p>
            </div>
            <div className="bg-zinc-50 rounded-2xl p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-tight"><Banknote size={12} /> Court Fee</div>
              <p className="text-sm font-bold text-gray-900">{game.price}</p>
            </div>
            <div className="bg-zinc-50 rounded-2xl p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-tight"><Users size={12} /> Capacity</div>
              <p className="text-sm font-bold text-gray-900">{game.currentPlayers}/{game.maxPlayers}</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest px-1"><AlignLeft size={14} /> Description</div>
            <div className="bg-zinc-50 rounded-2xl p-4 text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">
              {game.description || "No description provided."}
            </div>
          </div>

          {/* Maps Location */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest px-1"><MapPin size={14} /> Location</div>
            <button onClick={handleMapClick} className="flex items-center justify-between w-full bg-zinc-100 text-gray-900 p-4 rounded-2xl active:scale-95 transition-all border border-gray-200">
              <span className="font-bold text-sm truncate pr-4">{game.location}</span>
              <MapIcon size={18} className="text-blue-600 shrink-0" />
            </button>
          </div>

          {/* REVOLUT PAYMENT BLOCK */}
          {game.revolutTag && game.price.toLowerCase() !== 'free' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
                <ExternalLink size={14} /> Payment Link
              </div>
              <button onClick={handlePayClick} className="flex items-center justify-between w-full bg-blue-600 text-white p-4 rounded-2xl active:scale-95 transition-all">
                <span className="font-bold text-sm">Pay via Revolut</span>
                <span className="text-xs opacity-80 font-medium">@{game.revolutTag.replace('@', '')}</span>
              </button>
            </div>
          )}

          <hr className="border-gray-100 my-4" />

          {/* Actions */}
          <div className="space-y-3">
            {!game.isHost && (
              <button className="w-full py-4 bg-zinc-100 text-gray-700 font-bold rounded-2xl flex items-center justify-center active:scale-95 transition-transform text-sm">
                <MessageCircle size={18} className="mr-2 text-blue-500" /> Message Host
              </button>
            )}

            {game.isHost ? (
              <button disabled className="w-full py-4 rounded-2xl font-black text-base shadow-none bg-zinc-100 text-gray-400 cursor-not-allowed">
                You're the Organizer
              </button>
            ) : game.isJoined ? (
               isCancellable ? (
                  <button onClick={() => onCancelRsvp?.(game.id)} disabled={isCancelling} className="w-full py-4 rounded-2xl font-black text-base shadow-xl active:scale-95 transition-all bg-rose-50 text-rose-600 shadow-rose-100 flex justify-center items-center disabled:opacity-50">
                    {isCancelling ? <Loader2 className="animate-spin" size={20} /> : (game.rsvpStatus === 'waitlisted' ? 'Leave Waitlist' : 'Cancel RSVP')}
                  </button>
               ) : (
                  <div className="space-y-2 text-center">
                    <div className="w-full flex items-center justify-center gap-2 text-gray-400 font-bold text-sm py-4 bg-gray-100 rounded-2xl cursor-not-allowed opacity-60">
                      <XCircle size={18} /> Cancellation Locked
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium px-4 leading-relaxed">
                      Cancellation is locked 2h before the match starts to prevent empty slots.
                    </p>
                  </div>
               )
            ) : (
              <button onClick={() => onRsvp?.(game.id)} className={`w-full py-4 rounded-2xl font-black text-base shadow-xl active:scale-95 transition-all ${isFull ? 'bg-amber-500 text-white shadow-amber-100' : 'bg-blue-600 text-white shadow-blue-100'}`}>
                {isFull ? 'Join Waitlist' : 'RSVP Now'}
              </button>
            )}
          </div>
        </div>
      )}
    </BottomSheet>
  );
}