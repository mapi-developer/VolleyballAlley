"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Loader2, Search, MapPin, User, Clock } from 'lucide-react';
import GameCard, { Game } from '@/components/EventCard';
import EventDetailsSheet from '@/components/EventDetailsSheet';
import { useUser } from '@/context/UserContext';
import { api } from '@/lib/api';

export default function MyGamesPage() {
  const { user } = useUser();
  const [upcomingGames, setUpcomingGames] = useState<(Game & { durationHours: number })[]>([]);
  const [pastGames, setPastGames] = useState<(Game & { durationHours: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [activeSection, setActiveSection] = useState<'upcoming' | 'history' | 'stats'>('upcoming');

  const fetchMyGames = async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const data = await api.getMyGames();

      const mappedGames = data.map((item: any) => {
        const dbEvent = item.event || item;
        const dateObj = new Date(dbEvent.start_time);
        const endDate = new Date(dbEvent.end_time || dbEvent.start_time);
        const userRegistration = (dbEvent.attendees || []).find((a: any) => a.user_id === user.id);
        const confirmed = (dbEvent.attendees || []).filter((a: any) => a.status === 'confirmed');
        const durationHours = (endDate.getTime() - dateObj.getTime()) / (1000 * 60 * 60) || 2;

        const locName = dbEvent.location_name || "Location TBD";
        const isSand = locName.toLowerCase().includes('sand') || locName.toLowerCase().includes('beach');

        return {
          id: String(dbEvent.id),
          title: dbEvent.title || "Untitled Match",
          description: dbEvent.description,
          type: dbEvent.type || (isSand ? 'Outdoor' : 'Indoor'),
          level: dbEvent.level_required || 'All',
          rawDate: dbEvent.start_time,
          date: dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          time: `${dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`,
          location: locName,
          price: dbEvent.price === 0 ? "Free" : `${dbEvent.price} HUF`,
          revolutTag: dbEvent.revolut_tag,
          maxPlayers: dbEvent.max_players,
          currentPlayers: confirmed.length,
          hostName: dbEvent.host_id === user.id ? "You" : "Organizer",
          isJoined: !!userRegistration,
          isHost: dbEvent.host_id === user.id,
          rsvpStatus: userRegistration ? userRegistration.status : null,
          end_time: dbEvent.end_time,
          durationHours
        };
      });

      const now = Date.now();
      const upcoming = mappedGames.filter((g: any) => new Date(g.rawDate).getTime() + (2 * 60 * 60 * 1000) > now).sort((a: any, b: any) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime());
      const past = mappedGames.filter((g: any) => new Date(g.rawDate).getTime() + (2 * 60 * 60 * 1000) <= now).sort((a: any, b: any) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());

      setUpcomingGames(upcoming);
      setPastGames(past);
      if (selectedGame) {
        const refreshed = mappedGames.find((g: any) => g.id === selectedGame.id);
        if (refreshed) setSelectedGame(refreshed);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => { fetchMyGames(); }, [user]);

  const totalHours = pastGames.reduce((acc, game) => acc + game.durationHours, 0);
  const stats = [
    { label: 'Upcoming', value: upcomingGames.length.toString() },
    { label: 'Total Games', value: (pastGames.length + upcomingGames.length).toString() },
    { label: 'Hours Played', value: totalHours.toFixed(1) },
  ];

  const handleCancelRSVP = async (gameId: string) => {
    try {
      setIsCancelling(true);
      await api.leaveEvent(gameId);
      fetchMyGames();
      setSelectedGame(null);
    }
    catch (error) { console.error(error); }
    finally { setIsCancelling(false); }
  };

  return (
    <div className="py-4 space-y-6 animate-in fade-in duration-500 pb-24">
      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, index) => {
          const sectionKey = ['upcoming', 'history', 'stats'][index] as 'upcoming' | 'history' | 'stats';
          const isActive = activeSection === sectionKey;
          return (
            <button
              key={index}
              onClick={() => setActiveSection(sectionKey)}
              className={`bg-app-bg rounded-[24px] p-4 shadow-sm flex flex-col items-center text-center justify-center transition-colors ${isActive
                  ? 'border-2 border-app-accent'
                  : 'border border-app-active'
                }`}
            >
              <p className="text-xl font-black text-app-accent leading-none">{stat.value}</p>
              <p className="text-[9px] font-black text-app-text-secondary uppercase tracking-tight mt-2 leading-tight">{stat.label}</p>
            </button>
          );
        })}
      </div>

      <div className="space-y-4 pt-2">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-app-text-secondary">
            <Loader2 className="animate-spin mb-4 text-app-accent" size={32} />
            <p>Loading your games...</p>
          </div>
        ) : activeSection === 'upcoming' ? (
          <>
            <h2 className="text-sm font-black text-app-text-secondary uppercase tracking-widest px-1">Upcoming Schedule</h2>
            {upcomingGames.length === 0 ? (
              <div className="bg-app-bg rounded-[32px] p-10 shadow-sm border border-dashed border-app-active text-center transition-colors">
                <Calendar className="mx-auto mb-3 text-app-text-secondary" size={32} />
                <p className="text-sm font-bold text-app-text-primary">Your schedule is empty</p>
                <p className="text-xs text-app-text-secondary mt-1">Head to the Browse tab to find matches.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onClick={() => setSelectedGame(game)}
                  />
                ))}
              </div>
            )}
          </>
        ) : activeSection === 'history' ? (
          <>
            <h2 className="text-sm font-black text-app-text-secondary uppercase tracking-widest px-1">Games History</h2>
            {pastGames.length === 0 ? (
              <div className="bg-app-bg rounded-[32px] p-10 shadow-sm border border-dashed border-app-active text-center transition-colors">
                <Calendar className="mx-auto mb-3 text-app-text-secondary" size={32} />
                <p className="text-sm font-bold text-app-text-primary">No games played yet</p>
                <p className="text-xs text-app-text-secondary mt-1">Your match history will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pastGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onClick={() => setSelectedGame(game)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="text-sm font-black text-app-text-secondary uppercase tracking-widest px-1">Player Statistics</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-app-bg rounded-[24px] p-6 shadow-sm border border-app-active flex flex-col items-center text-center">
                <p className="text-3xl font-black text-app-accent leading-none">{pastGames.length + upcomingGames.length}</p>
                <p className="text-[9px] font-black text-app-text-secondary uppercase tracking-tight mt-2 leading-tight">Total Games</p>
              </div>
              <div className="bg-app-bg rounded-[24px] p-6 shadow-sm border border-app-active flex flex-col items-center text-center">
                <p className="text-3xl font-black text-app-accent leading-none">{totalHours.toFixed(1)}</p>
                <p className="text-[9px] font-black text-app-text-secondary uppercase tracking-tight mt-2 leading-tight">Hours Played</p>
              </div>
            </div>
          </>
        )}
      </div>

      <EventDetailsSheet
        isOpen={!!selectedGame}
        onClose={() => setSelectedGame(null)}
        game={selectedGame}
        onCancelRsvp={(id) => handleCancelRSVP(id)}
        isCancelling={isCancelling}
      />
    </div>
  );
}
