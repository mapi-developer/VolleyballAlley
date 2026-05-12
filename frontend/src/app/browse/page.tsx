"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
    Search, Info, Loader2
} from 'lucide-react';
import GameCard, { Game } from '@/components/EventCard';
import EventDetailsSheet from '@/components/EventDetailsSheet';
import { useUser } from '@/context/UserContext';
import { api } from '@/lib/api';

const FILTERS = ["All", "Indoor", "Outdoor", "Beginner", "Intermediate", "Advanced"];

export default function BrowsePage() {
    const { user, setFooterVisible } = useUser();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");

    // Live State
    const [liveGames, setLiveGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    // Fetch and Map Events
    const loadEvents = async () => {
        try {
            const data = await api.getEvents();

            const mappedGames: Game[] = data.map((dbEvent: any) => {
                const attendees = dbEvent.attendees || [];
                const confirmed = attendees.filter((a: any) => a.status === 'confirmed');
                
                // WAITLIST FIX: Capture exact registration to know if they are confirmed or waitlisted
                const userRegistration = attendees.find((a: any) => a.user_id === user?.id);
                
                const isUserHost = dbEvent.host_id === user?.id; // Check host

                const startDate = new Date(dbEvent.start_time);
                const endDate = new Date(dbEvent.end_time || dbEvent.start_time);

                // Simple heuristic for Indoor/Outdoor
                const isSand = (dbEvent.location_name || "").toLowerCase().includes('sand') || (dbEvent.location_name || "").toLowerCase().includes('beach');

                return {
                    id: String(dbEvent.id),
                    type: dbEvent.type || (isSand ? 'Outdoor' : 'Indoor'),
                    level: dbEvent.level_required || 'All',
                    title: dbEvent.title || "Untitled Match",
                    description: dbEvent.description,
                    rawDate: dbEvent.start_time,
                    date: startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                    time: `${startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`,
                    currentPlayers: confirmed.length,
                    maxPlayers: dbEvent.max_players,
                    hostName: isUserHost ? "You" : "Organizer",
                    price: dbEvent.price === 0 ? "Free" : `${dbEvent.price} HUF`,
                    location: dbEvent.location_name || "Location TBD",
                    revolutTag: dbEvent.revolut_tag || undefined,
                    isHost: isUserHost,
                    
                    // Track RSVP strictly
                    isJoined: !!userRegistration,
                    rsvpStatus: userRegistration ? userRegistration.status : null 
                };
            });

            // Sort by date ascending
            const sortedGames = mappedGames.sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime());
            // Only show events that haven't already finished
            const upcomingGames = sortedGames.filter(g => {
                const eventTime = new Date(g.rawDate).getTime();
                const currentTime = Date.now();
                // Keep game visible for 6 hours after it starts
                return eventTime + (6 * 60 * 60 * 1000) > currentTime;
            });

            setLiveGames(upcomingGames);

            if (selectedGame) {
                const refreshedSelected = mappedGames.find(g => g.id === selectedGame.id);
                if (refreshedSelected) setSelectedGame(refreshedSelected);
            }
        } catch (error) {
            console.error("Failed to load events:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadEvents();
    }, [user]);

    const filteredGames = useMemo(() => {
        return liveGames.filter(game => {
            const matchesFilter = activeFilter === "All" || game.type === activeFilter || game.level === activeFilter;
            const query = searchQuery.toLowerCase();
            const matchesSearch = game.title.toLowerCase().includes(query) || game.hostName.toLowerCase().includes(query) || game.location.toLowerCase().includes(query);
            return matchesFilter && matchesSearch;
        });
    }, [searchQuery, activeFilter, liveGames]);

    const handleRsvp = async (gameId: string) => {
        try {
            await api.joinEvent(gameId); 
            loadEvents(); 
        } catch (error) {
            console.error("RSVP failed:", error);
        }
    };

    const handleCancelRsvp = async (gameId: string) => {
        try {
            setIsCancelling(true);
            await api.leaveEvent(gameId); 
            loadEvents(); 
        } catch (error) {
            console.error("Cancel failed:", error);
        } finally {
            setIsCancelling(false);
        }
    };

    return (
        <div className="py-3 space-y-4 animate-in fade-in duration-500 pb-24">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by title, host, or venue..."
                    className="w-full bg-white border border-gray-200 rounded-full py-3.5 pl-12 pr-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
                    value={searchQuery}
                    onFocus={() => setFooterVisible?.(false)}
                    onBlur={() => setFooterVisible?.(true)}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                {FILTERS.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all ${activeFilter === filter
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                            : 'bg-white text-gray-600 border border-gray-200'
                            }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <Loader2 className="animate-spin mb-4 text-blue-500" size={32} />
                        <p>Finding matches...</p>
                    </div>
                ) : filteredGames.length > 0 ? (
                    filteredGames.map((game) => (
                        <GameCard
                            key={game.id}
                            game={game}
                            onClick={() => setSelectedGame(game)}
                            onRsvpClick={() => handleRsvp(game.id)}
                            onCancelClick={() => handleCancelRsvp(game.id)}
                        />
                    ))
                ) : (
                    <div className="bg-white rounded-[32px] p-12 border border-dashed border-gray-200 text-center">
                        <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Info className="text-gray-300" size={32} />
                        </div>
                        <h3 className="text-gray-900 font-bold mb-1">No matches found</h3>
                        <p className="text-gray-400 text-xs leading-relaxed max-w-[200px] mx-auto font-medium">
                            Try adjusting your search or filters to find more events.
                        </p>
                    </div>
                )}
            </div>

            {/* Unified GAME DETAILS POPUP */}
            <EventDetailsSheet 
              isOpen={!!selectedGame} 
              onClose={() => setSelectedGame(null)} 
              game={selectedGame} 
              onRsvp={(id) => handleRsvp(id)} 
              onCancelRsvp={(id) => handleCancelRsvp(id)} 
              isCancelling={isCancelling} 
            />
        </div>
    );
}