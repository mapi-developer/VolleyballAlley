"use client";

import React from 'react';
import { Calendar, Clock, MapPin, Users, Edit3, Shield } from 'lucide-react';

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
    onEditClick?: (e: React.MouseEvent) => void;
    onMapClick?: (location: string) => void;
    onPayClick?: (tag: string) => void;
    onRsvpClick?: () => void;
    onCancelClick?: () => void;
}

export default function EventCard({ 
    game, 
    variant = 'detailed', 
    onClick, 
    onEditClick 
}: GameCardProps) {
    const isFull = game.currentPlayers >= game.maxPlayers;
    const fillPercentage = Math.min((game.currentPlayers / game.maxPlayers) * 100, 100);

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-[24px] p-4 shadow-sm border border-gray-100 mb-3 active:scale-[0.98] transition-all cursor-pointer"
        >
            {/* TOP ROW: Labels & Status */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded-full uppercase font-black tracking-wider">
                        {game.type}
                    </span>
                    {game.isJoined && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-black tracking-wider ${
                            game.rsvpStatus === 'waitlisted' 
                            ? 'bg-amber-100 text-amber-600' 
                            : 'bg-green-100 text-green-600'
                        }`}>
                            {game.rsvpStatus === 'waitlisted' ? 'In Waitlist' : 'Joined'}
                        </span>
                    )}
                </div>

                {variant === 'host' || game.isHost ? (
                    <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        <Shield size={10} className="fill-blue-600" />
                        <span className="text-[10px] font-black uppercase tracking-tight">Host</span>
                    </div>
                ) : null}
            </div>

            {/* TITLE */}
            <h3 className="font-bold text-gray-900 text-lg mb-3 leading-tight">{game.title}</h3>

            {/* INFO ROWS */}
            <div className="space-y-2 mb-4">
                <div className="flex items-center text-[13px] text-gray-600 font-medium">
                    <Calendar size={14} className="mr-2 text-blue-500" />
                    <span>{game.date}</span>
                    <span className="mx-2 text-gray-300">|</span>
                    <Clock size={14} className="mr-2 text-blue-500" />
                    <span>{game.time}</span>
                </div>

                <div className="flex items-center text-[13px] text-gray-600 font-medium">
                    <MapPin size={14} className="mr-2 text-blue-500" />
                    <span className="truncate">{game.location || 'Location TBD'}</span>
                </div>
            </div>

            {/* CAPACITY SECTION */}
            <div className="space-y-2">
                <div className="flex justify-between items-end">
                    <div className="flex items-center text-[13px] font-bold text-gray-900">
                        <Users size={15} className="mr-2 text-blue-500" />
                        {game.currentPlayers} / {game.maxPlayers}
                        <span className="ml-1 text-gray-400 font-medium text-[11px]">Players</span>
                    </div>
                    {isFull && !game.isJoined && (
                        <span className="text-[10px] text-amber-600 font-black uppercase tracking-widest">Waitlist Open</span>
                    )}
                </div>

                <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                    <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                            isFull ? 'bg-amber-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${fillPercentage}%` }}
                    ></div>
                </div>
            </div>
            
            {/* FOOTER: Price & Action Label (Only for Detailed variant) */}
            {variant === 'detailed' && (
                <div className="mt-4 pt-3 border-t border-dashed border-gray-100 flex justify-between items-center">
                    <span className="text-sm font-black text-gray-900">{game.price}</span>
                    <span className="text-xs font-bold text-blue-600">View Details →</span>
                </div>
            )}
        </div>
    );
}