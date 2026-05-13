import React, { useState } from 'react';
import { Shield, UserMinus, ArrowUpCircle, Search } from 'lucide-react';

export interface Attendee {
  id: string;
  name: string;
  tgTag: string;
  isHost?: boolean;
}

interface AttendeeManagerProps {
  maxPlayers: number;
  mainList: Attendee[];
  waitList: Attendee[];
  onPromote: (id: string) => void;
  onRemove: (id: string, fromList: 'main' | 'waitlist') => void;
}

export default function AttendeeManager({ maxPlayers, mainList, waitList, onPromote, onRemove }: AttendeeManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const renderPlayer = (player: Attendee, listType: 'main' | 'waitlist') => (
    <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl mb-2 border border-gray-100 dark:border-zinc-800 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold">
          {player.name.charAt(0)}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-900 dark:text-zinc-100 text-sm">{player.name}</span>
            {player.isHost && <Shield size={14} className="text-blue-500 dark:text-blue-400" />}
          </div>
          <span className="text-xs text-gray-500 dark:text-zinc-500">{player.tgTag}</span>
        </div>
      </div>

      {!player.isHost && (
        <div className="flex gap-2">
          {listType === 'waitlist' && (
            <button onClick={() => onPromote(player.id)} className="p-2 text-green-600 dark:text-green-500 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-full transition-colors">
              <ArrowUpCircle size={18} />
            </button>
          )}
          <button onClick={() => onRemove(player.id, listType)} className="p-2 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors">
            <UserMinus size={18} />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 transition-colors">
        Attendees <span className="text-blue-500 dark:text-blue-400">{mainList.length}/{maxPlayers}</span>
      </h3>
      
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
        <input 
          type="text" 
          placeholder="Search by name or @tag to add..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      {/* Main List */}
      <div className="mb-6">
        <h4 className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-2">Main List</h4>
        {mainList.map(p => renderPlayer(p, 'main'))}
      </div>

      {/* Waitlist */}
      {waitList.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-2 flex justify-between">
            Waitlist <span>{waitList.length} waiting</span>
          </h4>
          {waitList.map(p => renderPlayer(p, 'waitlist'))}
        </div>
      )}
    </div>
  );
}