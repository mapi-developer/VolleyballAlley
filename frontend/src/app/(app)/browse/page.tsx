"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Info, Loader2 } from 'lucide-react';
import GameCard, { Game } from '@/components/EventCard';
import EventDetailsSheet from '@/components/EventDetailsSheet';
import { useUser } from '@/context/UserContext';
import { api } from '@/lib/api';

// Matches backend PlayLevel enums exactly (All, Beginner, Intermediate, Advanced)
const FILTERS = ["All", "Indoor", "Outdoor", "Beginner", "Intermediate", "Advanced"];

export default function BrowsePage() {
    const { user, setFooterVisible } = useUser();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");

    const [liveGames, setLiveGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    // Reliable UTC calculation string helper
    const getGameTime = (g: any) => {
        const timeString = g.start_time;
        if (!timeString) return 0;
        
        const safeString = timeString.endsWith('Z') || timeString.match(/[+-]\d{2}:\d{2}$/) 
            ? timeString 
            : `${timeString}Z`;
            
        return new Date(safeString).getTime();
    };

    const loadEvents = async () => {
        try {
            setIsLoading(true);
            const data = await api.getEvents();
            const mappedGames: Game[] = data.map((dbEvent: any) => {
                const attendees = dbEvent.attendees || [];
                const confirmed = attendees.filter((a: any) => a.status === 'confirmed');
                const userRegistration = attendees.find((a: any) => a.user_id === user?.id);
                const isUserHost = dbEvent.host_id === user?.id;
                
                const startDate = new Date(dbEvent.start_time);
                const endDate = new Date(dbEvent.end_time || dbEvent.start_time);
                const locName = dbEvent.location_name || "Location TBD";
                
                // Automatically determine court type based on location strings
                const isSand = locName.toLowerCase().includes('sand') || locName.toLowerCase().includes('beach');
                const computedType = dbEvent.type || (isSand ? 'Outdoor' : 'Indoor');

                return {
                    id: String(dbEvent.id),
                    type: computedType,
                    level: dbEvent.level_required || 'All',
                    title: dbEvent.title || "Untitled Match",
                    description: dbEvent.description,
                    start_time: dbEvent.start_time, 
                    end_time: dbEvent.end_time,     
                    date: startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                    time: `${startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`,
                    currentPlayers: confirmed.length,
                    maxPlayers: dbEvent.max_players || 12,
                    hostName: isUserHost ? "You" : (dbEvent.host?.first_name || "Organizer"),
                    price: !dbEvent.price || dbEvent.price === 0 ? "Free" : `${dbEvent.price} HUF`,
                    location: locName,
                    revolutTag: dbEvent.revolut_tag || undefined,
                    isHost: isUserHost,
                    isJoined: !!userRegistration,
                    rsvpStatus: userRegistration ? userRegistration.status : null 
                };
            });

            // Keep matches that are ongoing or ended less than 6 hours ago
            const upcomingGames = mappedGames.filter(g => {
                const time = getGameTime(g);
                return time > 0 && (time + (6 * 60 * 60 * 1000)) > Date.now();
            }).sort((a, b) => getGameTime(a) - getGameTime(b));

            setLiveGames(upcomingGames);

            // Sync structural modal popup data updates if open
            if (selectedGame) {
                const refreshed = upcomingGames.find(g => g.id === selectedGame.id);
                setSelectedGame(refreshed || null);
            }
        } catch (error) { 
            console.error("Failed to parse event vectors:", error); 
        } finally { 
            setIsLoading(false); 
        }
    };

    useEffect(() => { 
        loadEvents(); 
    }, [user]);

    const filteredGames = useMemo(() => {
        return liveGames.filter(game => {
            // Checks both backend enum types (Indoor/Outdoor and Beginner/Intermediate/Advanced)
            const matchesFilter = activeFilter === "All" || 
                                 game.type === activeFilter || 
                                 game.level.toLowerCase() === activeFilter.toLowerCase();
                                 
            const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 game.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 game.hostName.toLowerCase().includes(searchQuery.toLowerCase());
                                 
            return matchesFilter && matchesSearch;
        });
    }, [searchQuery, activeFilter, liveGames]);

    // FIXED: Use exact joinEvent endpoint from your api.ts
    const handleRsvp = async (gameId: string) => { 
        try { 
            await api.joinEvent(gameId); 
            await loadEvents(); 
        } catch (e) { 
            console.error(e); 
        } 
    };

    // FIXED: Use exact leaveEvent endpoint from your api.ts
    const handleCancelRsvp = async (gameId: string) => { 
        try { 
            setIsCancelling(true); 
            await api.leaveEvent(gameId); 
            await loadEvents(); 
        } catch (e) { 
            console.error(e); 
        } finally { 
            setIsCancelling(false); 
        } 
    };

    return (
        <div className="py-3 space-y-4 animate-in fade-in duration-500 pb-24">
            {/* Search Input bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-app-text-secondary" size={20} />
                <input
                    type="text" 
                    placeholder="Search matches, locations, hosts..."
                    className="w-full bg-app-inset border border-app-active rounded-full py-3.5 pl-12 pr-4 text-[15px] text-app-text-primary placeholder:text-app-text-secondary focus:outline-none focus:ring-2 focus:ring-app-accent transition-all shadow-sm"
                    value={searchQuery}
                    onFocus={() => setFooterVisible?.(false)} 
                    onBlur={() => setFooterVisible?.(true)}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Horizontal Toggle filter bar */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                {FILTERS.map((f) => (
                    <button 
                        key={f} 
                        onClick={() => setActiveFilter(f)} 
                        className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                            activeFilter === f 
                                ? 'bg-app-accent text-white shadow-md' 
                                : 'bg-app-inset text-app-text-secondary border border-app-active'
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Card output matrix window */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-app-text-secondary">
                        <Loader2 className="animate-spin mb-4 text-app-accent" size={32} />
                        <p>Finding matches...</p>
                    </div>
                ) : filteredGames.length > 0 ? (
                    filteredGames.map((game) => (
                        <GameCard key={game.id} game={game} onClick={() => setSelectedGame(game)} />
                    ))
                ) : (
                    <div className="bg-app-bg rounded-[32px] p-12 border border-dashed border-app-active text-center transition-colors">
                        <div className="w-16 h-16 bg-app-inset rounded-full flex items-center justify-center mx-auto mb-4">
                            <Info className="text-app-text-secondary" size={32} />
                        </div>
                        <h3 className="text-app-text-primary font-bold mb-1">No matches found</h3>
                        <p className="text-app-text-secondary text-xs font-medium">Try adjusting your filters or search keywords.</p>
                    </div>
                )}
            </div>

            {/* Event Overlay Drawer Sheet */}
            <EventDetailsSheet 
                isOpen={!!selectedGame} 
                onClose={() => setSelectedGame(null)} 
                game={selectedGame} 
                onRsvp={handleRsvp} 
                onCancelRsvp={handleCancelRsvp} 
                isCancelling={isCancelling} 
            />
        </div>
    );
}