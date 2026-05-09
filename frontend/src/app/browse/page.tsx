"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    Search, Info, Calendar, MapPin, Loader2,
    Users, Banknote, Clock, ExternalLink, Map as MapIcon
} from 'lucide-react';
import GameCard, { Game } from '@/components/GameCard';
import BottomSheet from '@/components/BottomSheet';
import { useUser } from '@/context/UserContext';
import { fetchWithAuth, mapEventToGame } from '@/lib/api';

const FILTERS = ["All", "Indoor", "Outdoor", "Advanced", "Beginner"];

export default function BrowsePage() {
    const [games, setGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { setFooterVisible } = useUser();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);

    useEffect(() => {
        const loadEvents = async () => {
            try {
                const data = await fetchWithAuth('/events');
                const formattedGames = data.map((e: any) => mapEventToGame(e));
                setGames(formattedGames);
            } catch (err) {
                console.error("Failed to load events:", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadEvents();
    }, []);

    useEffect(() => {
        fetchWithAuth('/users/me')
            .then(data => console.log("Profile data:", data))
            .catch(err => console.error(err));
    }, []);

    const filteredGames = useMemo(() => {
        return games.filter(game => {
            const matchesFilter = activeFilter === "All" || game.type === activeFilter || game.level === activeFilter;
            const query = searchQuery.toLowerCase();
            const matchesSearch = game.title.toLowerCase().includes(query) || game.location.toLowerCase().includes(query);
            return matchesFilter && matchesSearch;
        });
    }, [searchQuery, activeFilter, games]);

    // FIXED: Corrected template literal syntax
    const handleMapClick = (location: string) => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`, '_blank');
    };

    // ADDED: Missing handlePayClick function
    const handlePayClick = (tag: string) => {
        const cleanTag = tag.replace('@', '');
        window.open(`https://revolut.me/${cleanTag}`, '_blank');
    };

    const handleRsvp = async (gameId: string) => {
        // Find the specific game object to check current status
        const game = games.find(g => g.id === gameId);
        if (!game) return;

        try {
            if (game.isJoined) {
                // CANCEL logic: Send DELETE to /api/rsvps/{event_id}
                await fetchWithAuth(`/rsvps/${gameId}`, {
                    method: 'DELETE'
                });
                console.log("Successfully left the game");
            } else {
                // JOIN logic: Send POST to /api/rsvps/{event_id}
                await fetchWithAuth(`/rsvps/${gameId}`, {
                    method: 'POST'
                });
                console.log("Successfully joined the game");
            }

            // --- UI REFRESH ---
            // Option A: Optimistic Update (Immediate change)
            setGames(prevGames => prevGames.map(g =>
                g.id === gameId ? { ...g, isJoined: !g.isJoined } : g
            ));

            // Option B: Full Refresh from Server (Most accurate)
            // refreshEvents(); 

            // Close the popup if it was open
            if (selectedGame?.id === gameId) {
                setSelectedGame(null);
            }

        } catch (err: any) {
            // Handle the 2-hour cancellation lock or full game errors
            alert(err.message || "Action failed");
        }
    };

    return (
        <div className="py-3 space-y-4 animate-in fade-in duration-500">
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

            {/* Game Cards */}
            <div className="space-y-4 pb-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-20 text-blue-600">
                        <Loader2 className="animate-spin mb-2" size={32} />
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading Matches...</p>
                    </div>
                ) : filteredGames.length > 0 ? (
                    filteredGames.map((game) => (
                        <GameCard
                            key={game.id}
                            game={game}
                            onClick={() => setSelectedGame(game)}
                            onMapClick={handleMapClick}
                            onPayClick={handlePayClick}
                            onRsvpClick={() => handleRsvp(game.id)}
                            onCancelClick={() => console.log("Cancel")}
                        />
                    ))
                ) : (
                    <div className="bg-white rounded-[32px] p-12 border border-dashed border-gray-200 text-center">
                        <h3 className="text-gray-900 font-bold">No matches found</h3>
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
                            <div className="bg-zinc-50 rounded-2xl p-4 text-sm text-gray-700 leading-relaxed font-medium">{selectedGame.description}</div>
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
                                <a
                                    href={`https://revolut.me/${selectedGame.revolutTag.replace('@', '')}`}
                                    target="_blank"
                                    className="flex items-center justify-between w-full bg-blue-600 text-white p-4 rounded-2xl active:scale-95 transition-all"
                                >
                                    <span className="font-bold text-sm">Pay via Revolut</span>
                                    <span className="text-xs opacity-80 font-medium">@{selectedGame.revolutTag.replace('@', '')}</span>
                                </a>
                            </div>
                        )}

                        {/* Primary RSVP Action inside BottomSheet */}
                        <div className="pt-4 border-t border-gray-100">
                            <button
                                onClick={() => handleRsvp(selectedGame.id)}
                                className={`w-full py-4 rounded-2xl font-black text-base shadow-xl active:scale-95 transition-all ${selectedGame.isJoined
                                        ? 'bg-rose-50 text-rose-600 shadow-rose-100' // Styling for Cancel
                                        : 'bg-blue-600 text-white shadow-blue-100'    // Styling for Join
                                    }`}
                            >
                                {selectedGame.isJoined ? 'Cancel Registration' : 'RSVP Now'}
                            </button>
                        </div>
                    </div>
                )}
            </BottomSheet>
        </div>
    );
}