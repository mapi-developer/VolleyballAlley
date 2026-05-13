"use client";

import React from 'react';
import { Calendar, Clock, MapPin, Users, Shield } from 'lucide-react';

export interface Game {
    id: string;
    title: string;
    date: string;
    time: string;
    rawDate: string;
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
    // Added back as optional to prevent build errors in host/browse pages
    onEditClick?: (e: React.MouseEvent) => void;
    onRsvpClick?: () => void;
    onCancelClick?: () => void;
}

export default function EventCard({ game, variant = 'detailed', onClick }: GameCardProps) {
    const isFull = game.currentPlayers >= game.maxPlayers;
    const fillPercentage = Math.min((game.currentPlayers / game.maxPlayers) * 100, 100);

    return (
        <div
            onClick={onClick}
            className="bg-white dark:bg-zinc-900 rounded-[24px] p-4 shadow-sm border border-gray-100 dark:border-zinc-800 mb-3 active:scale-[0.98] transition-all cursor-pointer overflow-hidden transition-colors duration-200"
        >
            {/* LABELS */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-full uppercase font-black tracking-wider transition-colors">
                        {game.type}
                    </span>
                    {game.isJoined && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-black tracking-wider transition-colors ${
                            game.rsvpStatus === 'waitlisted' 
                            ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' 
                            : 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                        }`}>
                            {game.rsvpStatus === 'waitlisted' ? 'In Waitlist' : 'Joined'}
                        </span>
                    )}
                </div>
                {game.isHost && (
                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full transition-colors">
                        <Shield size={10} className="fill-current" />
                        <span className="text-[10px] font-black uppercase tracking-tight">Host</span>
                    </div>
                )}
            </div>

            {/* TITLE */}
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-3 leading-tight transition-colors">{game.title}</h3>

            {/* INFO ROWS */}
            <div className="space-y-2 mb-4">
                <div className="flex items-center text-[13px] text-gray-600 dark:text-zinc-400 font-medium transition-colors">
                    <Calendar size={14} className="mr-2 text-blue-500 dark:text-blue-400" />
                    <span>{game.date}</span>
                    <span className="mx-2 text-gray-300 dark:text-zinc-700">|</span>
                    <Clock size={14} className="mr-2 text-blue-500 dark:text-blue-400" />
                    <span>{game.time}</span>
                </div>
                <div className="flex items-center text-[13px] text-gray-600 dark:text-zinc-400 font-medium transition-colors">
                    <MapPin size={14} className="mr-2 text-blue-500 dark:text-blue-400" />
                    <span className="truncate">{game.location || 'Location TBD'}</span>
                </div>
            </div>

            {/* CAPACITY */}
            <div className="space-y-2">
                <div className="flex justify-between items-end">
                    <div className="flex items-center text-[13px] font-bold text-gray-900 dark:text-zinc-100 transition-colors">
                        <Users size={15} className="mr-2 text-blue-500 dark:text-blue-400" />
                        {game.currentPlayers} / {game.maxPlayers}
                        <span className="ml-1 text-gray-400 dark:text-zinc-500 font-medium text-[11px]">Players</span>
                    </div>
                    {isFull && !game.isJoined && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-black uppercase tracking-widest">Waitlist Open</span>
                    )}
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden transition-colors">
                    <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${isFull ? 'bg-amber-500' : 'bg-blue-500'}`}
                        style={{ width: `${fillPercentage}%` }}
                    ></div>
                </div>
            </div>
            
            {/* FOOTER */}
            {variant === 'detailed' && (
                <div className="mt-4 pt-3 border-t border-dashed border-gray-100 dark:border-zinc-800 flex justify-between items-center transition-colors">
                    <span className="text-sm font-black text-gray-900 dark:text-zinc-100">{game.price}</span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">View Details →</span>
                </div>
            )}
        </div>
    );
}