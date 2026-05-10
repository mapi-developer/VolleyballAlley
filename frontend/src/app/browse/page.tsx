"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
    Search, Info, Calendar, MapPin,
    Users, Banknote, Clock, ExternalLink, Map as MapIcon, Loader2
} from 'lucide-react';
import GameCard, { Game } from '@/components/GameCard';
import BottomSheet from '@/components/BottomSheet';
import { useUser } from '@/context/UserContext';
import { api } from '@/lib/api';

const FILTERS = ["All", "Indoor", "Outdoor", "Advanced", "Beginner"];

export default function BrowsePage() {
    const { user, setFooterVisible } = useUser();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");

    // Live State
    const [liveGames, setLiveGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);

    // Fetch and Map Events
    const loadEvents = async () => {
        try {
            const data = await api.getEvents();

            const mappedGames: Game[] = data.map((dbEvent: any) => {
                const attendees = dbEvent.attendees || [];
                const confirmed = attendees.filter((a: any) => a.status === 'confirmed');
                const isJoined = attendees.some((a: any) => a.user_id === user?.id && a.status === 'confirmed');
                const isUserHost = dbEvent.host_id === user?.id; // Check host

                const startDate = new Date(dbEvent.start_time);
                const endDate = new Date(dbEvent.end_time || dbEvent.start_time); // Fallback if end_time is missing

                // Simple heuristic for Indoor/Outdoor since it's not strictly in your EventBase yet
                const isSand = dbEvent.location_name.toLowerCase().includes('sand') || dbEvent.location_name.toLowerCase().includes('beach');

                return {
                    id: dbEvent.id,
                    type: isSand ? 'Outdoor' : 'Indoor',
                    level: dbEvent.level_required,
                    title: dbEvent.title,
                    description: dbEvent.description,
                    rawDate: dbEvent.start_time,
                    date: startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                    time: `${startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`,
                    currentPlayers: confirmed.length,
                    maxPlayers: dbEvent.max_players,
                    hostName: dbEvent.host_id === user?.id ? "You" : "Organizer",
                    hostRole: "Organizer",
                    price: dbEvent.price === 0 ? "Free" : `${dbEvent.price} HUF`,
                    location: dbEvent.location_name,
                    revolutTag: dbEvent.revolut_tag || undefined,
                    isJoined: !!isJoined,
                    isHost: isUserHost // Pass it to the GameCard
                };
            });

            // Sort by date ascending (closest events first)
            const sortedGames = mappedGames.sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime());

            // Only show events that haven't already finished
            const upcomingGames = sortedGames.filter(g => new Date(g.rawDate).getTime() + (2 * 60 * 60 * 1000) > Date.now());

            setLiveGames(upcomingGames);

            // Update selected game silently if the popup is open
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
    }, [user]); // Re-run if user context loads

    const filteredGames = useMemo(() => {
        return liveGames.filter(game => {
            const matchesFilter = activeFilter === "All" || game.type === activeFilter || game.level === activeFilter;
            const query = searchQuery.toLowerCase();
            const matchesSearch = game.title.toLowerCase().includes(query) || game.hostName.toLowerCase().includes(query) || game.location.toLowerCase().includes(query);
            return matchesFilter && matchesSearch;
        });
    }, [searchQuery, activeFilter, liveGames]);

    const handleMapClick = (location: string) => {
        window.open(`https://maps.google.com/?q=${encodeURIComponent(location)}`, '_blank');
    };

    const handlePayClick = (tag: string) => {
        const cleanTag = tag.replace('@', '');
        window.open(`https://revolut.me/${cleanTag}`, '_blank');
    };

    // Live API RSVP
    const handleRsvp = async (gameId: string) => {
    try {
        await api.joinEvent(gameId); // Calls /api/rsvps/{id}/join
        loadEvents(); // Refresh UI
    } catch (error) {
        console.error("RSVP failed:", error);
    }
};

const handleCancelRsvp = async (gameId: string) => {
    try {
        await api.leaveEvent(gameId); // Calls /api/rsvps/{id}/leave
        loadEvents(); // Refresh UI
    } catch (error) {
        console.error("Cancel failed:", error);
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
                            onMapClick={handleMapClick}
                            onPayClick={handlePayClick}
                            onRsvpClick={() => handleRsvp(game.id, game.currentPlayers, game.maxPlayers)}
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

            {/* GAME DETAILS POPUP */}
            <BottomSheet isOpen={!!selectedGame} onClose={() => setSelectedGame(null)} title="Game Details">
                {selectedGame && (
                    <div className="space-y-8 pb-10">
                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-zinc-50 rounded-2xl p-4 space-y-1">
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-tight"><Calendar size={12} /> Date</div>
                                <p className="text-sm font-bold text-gray-900">{selectedGame.date}</p>
                            </div>
                            <div className="bg-zinc-50 rounded-2xl p-4 space-y-1">
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-tight"><Clock size={12} /> Time</div>
                                <p className="text-sm font-bold text-gray-900">{selectedGame.time.split(' - ')[0]}</p>
                            </div>
                            <div className="bg-zinc-50 rounded-2xl p-4 space-y-1">
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-tight"><Banknote size={12} /> Court Fee</div>
                                <p className="text-sm font-bold text-gray-900">{selectedGame.price}</p>
                            </div>
                            <div className="bg-zinc-50 rounded-2xl p-4 space-y-1">
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-tight"><Users size={12} /> Capacity</div>
                                <p className="text-sm font-bold text-gray-900">{selectedGame.currentPlayers}/{selectedGame.maxPlayers}</p>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest px-1"><Info size={14} /> Description</div>
                            <div className="bg-zinc-50 rounded-2xl p-4 text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">
                                {selectedGame.description || "No description provided."}
                            </div>
                        </div>

                        {/* Maps Location */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest px-1"><MapPin size={14} /> Location</div>
                            <button
                                onClick={() => handleMapClick(selectedGame.location)}
                                className="flex items-center justify-between w-full bg-zinc-100 text-gray-900 p-4 rounded-2xl active:scale-95 transition-all border border-gray-200"
                            >
                                <span className="font-bold text-sm truncate pr-4">{selectedGame.location}</span>
                                <MapIcon size={18} className="text-blue-600 shrink-0" />
                            </button>
                        </div>

                        {/* REVOLUT PAYMENT BLOCK */}
                        {selectedGame.revolutTag && selectedGame.price.toLowerCase() !== 'free' && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">
                                    <ExternalLink size={14} /> Payment Link
                                </div>
                                <button
                                    onClick={() => handlePayClick(selectedGame.revolutTag!)}
                                    className="flex items-center justify-between w-full bg-blue-600 text-white p-4 rounded-2xl active:scale-95 transition-all"
                                >
                                    <span className="font-bold text-sm">Pay via Revolut</span>
                                    <span className="text-xs opacity-80 font-medium">@{selectedGame.revolutTag.replace('@', '')}</span>
                                </button>
                            </div>
                        )}

                        {/* Primary RSVP Action */}
                        <div className="pt-4 border-t border-gray-100">
                            {selectedGame.isHost ? (
                                <button
                                    disabled
                                    className="w-full py-4 rounded-2xl font-black text-base shadow-none bg-zinc-100 text-gray-400 cursor-not-allowed"
                                >
                                    You're the Host
                                </button>
                            ) : selectedGame.isJoined ? (
                                <button
                                    onClick={() => handleCancelRsvp(selectedGame.id)}
                                    className="w-full py-4 rounded-2xl font-black text-base shadow-xl active:scale-95 transition-all bg-rose-50 text-rose-600 shadow-rose-100"
                                >
                                    Cancel Registration
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleRsvp(selectedGame.id, selectedGame.currentPlayers, selectedGame.maxPlayers)}
                                    disabled={selectedGame.currentPlayers >= selectedGame.maxPlayers}
                                    className={`w-full py-4 rounded-2xl font-black text-base shadow-xl active:scale-95 transition-all ${selectedGame.currentPlayers >= selectedGame.maxPlayers
                                            ? 'bg-zinc-100 text-gray-400 cursor-not-allowed shadow-none'
                                            : 'bg-blue-600 text-white shadow-blue-100'
                                        }`}
                                >
                                    {selectedGame.currentPlayers >= selectedGame.maxPlayers ? 'Waitlist Full' : 'RSVP Now'}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </BottomSheet>
        </div>
    );
}