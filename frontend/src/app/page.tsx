"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from "@/context/UserContext";
import { ShieldCheck, Star, Play, ChevronRight, Calendar, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import GameCard, { Game } from '@/components/EventCard';
import EventDetailsSheet from '@/components/EventDetailsSheet';
import { api } from '@/lib/api';

export default function HomePage() {
  const { user } = useUser();
  const [nextGame, setNextGame] = useState<Game | null>(null);
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const myGamesData = await api.getMyGames();
      const allEventsData = await api.getEvents();
      const now = Date.now();

      // Mapped Function
      const mapGame = (dbEvent: any): Game => {
        const eventData = dbEvent.event || dbEvent;
        const dateObj = new Date(eventData.start_time);
        const endDate = new Date(eventData.end_time || eventData.start_time);
        const confirmed = (eventData.attendees || []).filter((a: any) => a.status === 'confirmed');
        const userRegistration = (eventData.attendees || []).find((a: any) => a.user_id === user?.id);

        return {
          id: eventData.id,
          type: eventData.type || (eventData.location_name.toLowerCase().includes('sand') ? 'Outdoor' : 'Indoor'),
          level: eventData.level_required || 'All',
          title: eventData.title,
          description: eventData.description,
          rawDate: eventData.start_time,
          date: dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          time: `${dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`,
          currentPlayers: confirmed.length,
          maxPlayers: eventData.max_players,
          hostName: eventData.host_id === user?.id ? "You" : "Organizer",
          price: eventData.price === 0 ? "Free" : `${eventData.price} HUF`,
          location: eventData.location_name,
          revolutTag: eventData.revolut_tag,
          isJoined: !!userRegistration,
          isHost: eventData.host_id === user?.id,
          rsvpStatus: userRegistration ? userRegistration.status : null 
        };
      };

      const upcoming = myGamesData.map(mapGame).filter((g: Game) => new Date(g.rawDate).getTime() + (2 * 60 * 60 * 1000) > now);
      upcoming.sort((a: Game, b: Game) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime());
      setNextGame(upcoming.length > 0 ? upcoming[0] : null);

      const openFeatured = allEventsData.map(mapGame)
        .filter((g: Game) => new Date(g.rawDate).getTime() > now && !g.isJoined)
        .sort((a: Game, b: Game) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime())
        .slice(0, 3);
      setFeaturedGames(openFeatured);

      if (selectedGame) {
          const refreshed = allEventsData.map(mapGame).find((g: Game) => g.id === selectedGame.id);
          if (refreshed) setSelectedGame(refreshed);
      }
    } catch (error) { console.error("Failed:", error); } finally { setIsLoading(false); }
  };

  useEffect(() => { loadDashboard(); }, [user]);

  const handleRsvp = async (gameId: string) => {
    try { await api.joinEvent(gameId); loadDashboard(); } 
    catch (error) { console.error(error); alert("RSVP Failed."); }
  };

  const handleCancelRsvp = async (gameId: string) => {
    try { setIsCancelling(true); await api.leaveEvent(gameId); loadDashboard(); } 
    catch (error) { alert("Cancel failed."); } finally { setIsCancelling(false); }
  };

  if (isLoading) return <div className="flex flex-col items-center justify-center h-64 text-gray-400"><Loader2 className="animate-spin mb-4 text-blue-500" size={32} /><p className="text-sm font-medium">Loading Dashboard...</p></div>;

  return (
    <div className="py-2 space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 gap-3">
        {/* Same Stat Headers... */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-3"><ShieldCheck className="text-blue-600" size={20} /></div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Skill Level</p>
          <p className="text-base font-bold text-gray-900 mt-0.5">{user?.verified_level || 'Pending'}</p>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mb-3"><Star className="text-amber-500" size={20} /></div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reliability</p>
          <div className="flex items-end justify-center gap-1 mt-0.5"><span className="text-base font-bold text-gray-900">{user?.reliability_score ? user.reliability_score.toFixed(1) : '5.0'}</span><span className="text-xs font-bold text-gray-400 mb-[2px]">/5.0</span></div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1"><h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Play size={12} className="text-blue-500" /> Next Up</h2>{nextGame && <Link href="/my-games" className="text-[11px] font-bold text-blue-600">See All</Link>}</div>
        {nextGame ? (
          <div onClick={() => setSelectedGame(nextGame)} className="bg-zinc-900 rounded-[32px] p-1 relative overflow-hidden shadow-lg shadow-zinc-200 active:scale-[0.99] transition-all cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            <div className="bg-zinc-800/50 rounded-[28px] p-5 backdrop-blur-xl border border-white/5">
              <div className="flex items-center justify-between mb-4"><span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-wider">Upcoming Match</span>{nextGame.isHost && <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider">You're Hosting</span>}</div>
              <h3 className="text-white font-black text-xl mb-3 pr-8 leading-tight">{nextGame.title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-300 font-medium"><div className="flex items-center gap-1.5"><Calendar size={14} className="text-blue-400" />{nextGame.date}</div><div className="flex items-center gap-1.5"><Clock size={14} className="text-blue-400" />{nextGame.time.split(' - ')[0]}</div></div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[32px] p-8 border border-dashed border-gray-200 text-center"><p className="text-sm font-bold text-gray-800">No upcoming matches</p><p className="text-xs text-gray-400 mt-1">Join a game below to fill your schedule.</p></div>
        )}
      </div>

      {featuredGames.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between px-1"><h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Open Matches</h2><Link href="/browse" className="text-[11px] font-bold text-blue-600 flex items-center">Browse All <ChevronRight size={14} /></Link></div>
          <div className="space-y-4">
            {featuredGames.map(game => (
              <GameCard key={game.id} game={game} onClick={() => setSelectedGame(game)} onRsvpClick={() => handleRsvp(game.id)} />
            ))}
          </div>
        </div>
      )}

      {/* The Unified Component */ }
      <EventDetailsSheet 
        isOpen={!!selectedGame} onClose={() => setSelectedGame(null)} game={selectedGame} 
        onRsvp={(id) => handleRsvp(id)} onCancelRsvp={(id) => handleCancelRsvp(id)} isCancelling={isCancelling} 
      />
    </div>
  );
}