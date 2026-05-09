"use client";

import React, { useState, useMemo } from 'react';
import {
    Search, Info, Calendar, MapPin,
    Users, Banknote, Clock, ExternalLink, Map as MapIcon
} from 'lucide-react';
import GameCard, { Game } from '@/components/GameCard';
import BottomSheet from '@/components/BottomSheet';
import { useUser } from '@/context/UserContext';

// Mock Data
const MOCK_GAMES: Game[] = [
    {
        id: "1",
        type: "Indoor",
        level: "Advanced",
        title: "Saturday Morning Smash",
        description: "High-intensity competitive match. Please bring indoor court shoes.",
        rawDate: "2026-10-24T10:00:00",
        date: "Sat, Oct 24",
        time: "10:00 AM - 12:00 PM",
        currentPlayers: 10,
        maxPlayers: 12,
        hostName: "Alex",
        hostRole: "Organizer",
        price: "€8.00",
        location: "Beach Arena Court 4",
        revolutTag: "alexvolleyball",
        isJoined: false
    },
    {
        id: "2",
        type: "Outdoor",
        level: "Beginner",
        title: "Sunset Beach Volley",
        description: "Casual games on the sand. Perfect for beginners or anyone wanting a relaxed game.",
        rawDate: "2026-10-25T16:00:00",
        date: "Sun, Oct 25",
        time: "4:00 PM - 7:00 PM",
        currentPlayers: 12,
        maxPlayers: 12,
        hostName: "Matvei",
        hostRole: "Organizer",
        price: "Free",
        location: "Margaret Island Sand",
        isJoined: true
    }
];

const FILTERS = ["All", "Indoor", "Outdoor", "Advanced", "Beginner"];

export default function BrowsePage() {
    const { setFooterVisible } = useUser();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);

    const filteredGames = useMemo(() => {
        return MOCK_GAMES.filter(game => {
            const matchesFilter = activeFilter === "All" || game.type === activeFilter || game.level === activeFilter;
            const query = searchQuery.toLowerCase();
            const matchesSearch = game.title.toLowerCase().includes(query) || game.hostName.toLowerCase().includes(query) || game.location.toLowerCase().includes(query);
            return matchesFilter && matchesSearch;
        });
    }, [searchQuery, activeFilter]);

    // FIXED: Corrected template literal syntax
    const handleMapClick = (location: string) => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`, '_blank');
    };

    // ADDED: Missing handlePayClick function
    const handlePayClick = (tag: string) => {
        const cleanTag = tag.replace('@', '');
        window.open(`https://revolut.me/${cleanTag}`, '_blank');
    };

    // ADDED: Missing handleRsvp function
    const handleRsvp = (id: string) => {
        console.log("RSVPing for game:", id);
        // Implement actual state update or API call here
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
                        className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                            activeFilter === filter 
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                                : 'bg-white text-gray-600 border border-gray-200'
                        }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-4 pb-6">
                {filteredGames.length > 0 ? (
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

                        {/* Primary RSVP Action */}
                        <div className="pt-4 border-t border-gray-100">
                            <button
                                onClick={() => handleRsvp(selectedGame.id)}
                                className={`w-full py-4 rounded-2xl font-black text-base shadow-xl active:scale-95 transition-all ${
                                    selectedGame.isJoined ? 'bg-rose-50 text-rose-600 shadow-rose-100' : 'bg-blue-600 text-white shadow-blue-100'
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