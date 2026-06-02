"use client";

import React from 'react';
import { Calendar, Clock, MapPin, Users, Shield } from 'lucide-react';

export interface Game {
    id: string;
    title: string;
    date: string;
    time: string;
    rawDate?: string; 
    start_time?: string; // Added to catch raw backend data
    end_time?: string;
    location: string;
    currentPlayers: number;
    maxPlayers: number;
    type: 'Indoor' | 'Outdoor';
    level: string;
    price: string;
    hostName: string;
    isJoined: boolean;
    isHost: boolean;
    rsvpStatus?: string | null;
    description?: string;
    revolutTag?: string;
}

interface GameCardProps {
    game: Game;
    variant?: 'compact' | 'standard' | 'detailed' | 'host';
    onClick?: () => void;
    onEditClick?: (e: React.MouseEvent) => void;
    onRsvpClick?: () => void;
    onCancelClick?: () => void;
}

// BULLETPROOF HELPERS
const parseBackendDate = (utcString?: string) => {
    if (!utcString) return null;
    // Force UTC parsing if the backend omitted the 'Z' timezone indicator
    const safeString = utcString.endsWith('Z') || utcString.match(/[+-]\d{2}:\d{2}$/) 
        ? utcString 
        : `${utcString}Z`;
    
    const dateObj = new Date(safeString);
    return isNaN(dateObj.getTime()) ? null : dateObj;
};

const getLocalDate = (game: Game, fallback: string) => {
    // Check both start_time and rawDate just in case the parent mapper missed one
    const dateObj = parseBackendDate(game.start_time || game.rawDate);
    if (!dateObj) return fallback;
    return dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

const getLocalTime = (game: Game, fallback: string) => {
    const dateObj = parseBackendDate(game.start_time || game.rawDate);
    if (!dateObj) return fallback;
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

export default function EventCard({ game, variant = 'detailed', onClick }: GameCardProps) {
    const isFull = game.currentPlayers >= game.maxPlayers;
    const fillPercentage = Math.min((game.currentPlayers / game.maxPlayers) * 100, 100);

    // Override the dumb strings with smart local conversions
    const displayDate = getLocalDate(game, game.date);
    const displayTime = getLocalTime(game, game.time);

    return (
        <div
            onClick={onClick}
            className="bg-app-bg rounded-[24px] p-4 shadow-sm border border-app-active mb-3 active:scale-[0.98] transition-all cursor-pointer overflow-hidden duration-200"
        >
            {/* LABELS */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] px-2 py-0.5 bg-app-inset text-app-text-secondary rounded-full uppercase font-black tracking-wider transition-colors">
                        {game.type}
                    </span>
                    {game.isJoined && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-black tracking-wider transition-colors ${
                            game.rsvpStatus === 'waitlisted' 
                            ? 'bg-app-warning-bg text-app-warning' 
                            : 'bg-app-success-bg text-app-success'
                        }`}>
                            {game.rsvpStatus === 'waitlisted' ? 'In Waitlist' : 'Joined'}
                        </span>
                    )}
                </div>
                {game.isHost && (
                    <div className="flex items-center gap-1 text-app-accent bg-app-inset px-2 py-0.5 rounded-full transition-colors">
                        <Shield size={10} className="fill-current" />
                        <span className="text-[10px] font-black uppercase tracking-tight">Host</span>
                    </div>
                )}
            </div>

            {/* TITLE */}
            <h3 className="font-bold text-app-text-primary text-lg mb-3 leading-tight transition-colors">{game.title}</h3>

            {/* INFO ROWS */}
            <div className="space-y-2 mb-4">
                <div className="flex items-center text-[13px] text-app-text-secondary font-medium transition-colors">
                    <Calendar size={14} className="mr-2 text-app-accent" />
                    <span>{displayDate}</span>
                    <span className="mx-2 text-app-active">|</span>
                    <Clock size={14} className="mr-2 text-app-accent" />
                    <span>{displayTime}</span>
                </div>
                <div className="flex items-center text-[13px] text-app-text-secondary font-medium transition-colors">
                    <MapPin size={14} className="mr-2 text-app-accent" />
                    <span className="truncate">{game.location || 'Location TBD'}</span>
                </div>
            </div>

            {/* CAPACITY */}
            <div className="space-y-2">
                <div className="flex justify-between items-end">
                    <div className="flex items-center text-[13px] font-bold text-app-text-primary transition-colors">
                        <Users size={15} className="mr-2 text-app-accent" />
                        {game.currentPlayers} / {game.maxPlayers}
                        <span className="ml-1 text-app-text-secondary font-medium text-[11px]">Players</span>
                    </div>
                    {isFull && !game.isJoined && (
                        <span className="text-[10px] text-app-warning font-black uppercase tracking-widest transition-colors">Waitlist Open</span>
                    )}
                </div>
                <div className="w-full bg-app-inset rounded-full h-1.5 overflow-hidden transition-colors">
                    <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${isFull ? 'bg-app-warning' : 'bg-app-accent'}`}
                        style={{ width: `${fillPercentage}%` }}
                    ></div>
                </div>
            </div>
            
            {/* FOOTER */}
            {variant === 'detailed' && (
                <div className="mt-4 pt-3 border-t border-dashed border-app-active flex justify-between items-center transition-colors">
                    <span className="text-sm font-black text-app-text-primary transition-colors">{game.price}</span>
                    <span className="text-xs font-bold text-app-link transition-colors">View Details →</span>
                </div>
            )}
        </div>
    );
}