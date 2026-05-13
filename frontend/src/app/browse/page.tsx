"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Info, Loader2 } from 'lucide-react';
import GameCard, { Game } from '@/components/EventCard';
import EventDetailsSheet from '@/components/EventDetailsSheet';
import { useUser } from '@/context/UserContext';
import { api } from '@/lib/api';

const FILTERS = ["All", "Indoor", "Outdoor", "Beginner", "Intermediate", "Advanced"];

export default function BrowsePage() {
    const { user, setFooterVisible } = useUser();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");

    const [liveGames, setLiveGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    // Bulletproof Time Helper to satisfy TypeScript and Timezones
    const getGameTime = (g: any) => {
        const timeString = g.start_time || g.rawDate;
        if (!timeString) return 0;
        
        // Add 'Z' if FastAPI forgot it, ensuring our sorting math is strictly UTC
        const safeString = timeString.endsWith('Z') || timeString.match(/[+-]\d{2}:\d{2}$/) 
            ? timeString 
            : `${timeString}Z`;
            
        return new Date(safeString).getTime();
    };

    const loadEvents = async () => {
        try {
            const data = await api.getEvents();
            const mappedGames: Game[] = data.map((dbEvent: any) => {
                const attendees = dbEvent.attendees || [];
                const confirmed = attendees.filter((a: any) => a.status === 'confirmed');
                const userRegistration = attendees.find((a: any) => a.user_id === user?.id);
                const isUserHost = dbEvent.host_id === user?.id;
                const startDate = new Date(dbEvent.start_time);
                const endDate = new Date(dbEvent.end_time || dbEvent.start_time);
                const locName = dbEvent.location_name || "Location TBD";
                const isSand = locName.toLowerCase().includes('sand') || locName.toLowerCase().includes('beach');

                return {
                    id: String(dbEvent.id),
                    type: dbEvent.type || (isSand ? 'Outdoor' : 'Indoor'),
                    level: dbEvent.level_required || 'All',
                    title: dbEvent.title || "Untitled Match",
                    description: dbEvent.description,
                    rawDate: dbEvent.start_time,
                    start_time: dbEvent.start_time, // Passed explicitly for our robust EventCard
                    end_time: dbEvent.end_time,     // Passed explicitly for our robust EventCard
                    date: startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                    time: `${startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`,
                    currentPlayers: confirmed.length,
                    maxPlayers: dbEvent.max_players,
                    hostName: isUserHost ? "You" : "Organizer",
                    price: dbEvent.price === 0 ? "Free" : `${dbEvent.price} HUF`,
                    location: locName,
                    revolutTag: dbEvent.revolut_tag || undefined,
                    isHost: isUserHost,
                    isJoined: !!userRegistration,
                    rsvpStatus: userRegistration ? userRegistration.status : null 
                };
            });

            // Filter out games that ended > 6 hours ago, and sort by chronological start time
            const upcomingGames = mappedGames.filter(g => {
                const time = getGameTime(g);
                return time > 0 && (time + (6 * 60 * 60 * 1000)) > Date.now();
            }).sort((a, b) => getGameTime(a) - getGameTime(b));

            setLiveGames(upcomingGames);
            if (selectedGame) {
                const refreshed = mappedGames.find(g => g.id === selectedGame.id);
                if (refreshed) setSelectedGame(refreshed);
            }
        } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };

    useEffect(() => { loadEvents(); }, [user]);

    const filteredGames = useMemo(() => {
        return liveGames.filter(game => {
            const matchesFilter = activeFilter === "All" || game.type === activeFilter || game.level === activeFilter;
            const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) || game.location.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [searchQuery, activeFilter, liveGames]);

    const handleRsvp = async (gameId: string) => { try { await api.joinEvent(gameId); loadEvents(); } catch (e) { console.error(e); } };
    const handleCancelRsvp = async (gameId: string) => { try { setIsCancelling(true); await api.leaveEvent(gameId); loadEvents(); } catch (e) { console.error(e); } finally { setIsCancelling(false); } };

    return (
        <div className="py-3 space-y-4 animate-in fade-in duration-500 pb-24">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" size={20} />
                <input
                    type="text" placeholder="Search matches..."
                    className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-full py-3.5 pl-12 pr-4 text-[15px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                    value={searchQuery}
                    onFocus={() => setFooterVisible?.(false)} onBlur={() => setFooterVisible?.(true)}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                {FILTERS.map((f) => (
                    <button key={f} onClick={() => setActiveFilter(f)} className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all ${activeFilter === f ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md' : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700'}`}>{f}</button>
                ))}
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400"><Loader2 className="animate-spin mb-4 text-blue-500" size={32} /><p>Finding matches...</p></div>
                ) : filteredGames.length > 0 ? (
                    filteredGames.map((game) => (
                        <GameCard key={game.id} game={game} onClick={() => setSelectedGame(game)} />
                    ))
                ) : (
                    <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-12 border border-dashed border-gray-200 dark:border-zinc-800 text-center transition-colors">
                        <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4"><Info className="text-gray-300 dark:text-zinc-700" size={32} /></div>
                        <h3 className="text-gray-900 dark:text-white font-bold mb-1">No matches found</h3>
                        <p className="text-gray-400 dark:text-zinc-500 text-xs font-medium">Try adjusting your filters.</p>
                    </div>
                )}
            </div>

            <EventDetailsSheet isOpen={!!selectedGame} onClose={() => setSelectedGame(null)} game={selectedGame} onRsvp={handleRsvp} onCancelRsvp={handleCancelRsvp} isCancelling={isCancelling} />
        </div>
    );
}