import React, { useState } from 'react';
import { Shield, UserMinus, ArrowUpCircle, Search } from 'lucide-react';

// You'd typically pull this from your types file
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
    <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-2 border border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
          {player.name.charAt(0)}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-900 text-sm">{player.name}</span>
            {player.isHost && <Shield size={14} className="text-blue-500" />}
          </div>
          <span className="text-xs text-gray-500">{player.tgTag}</span>
        </div>
      </div>

      {!player.isHost && (
        <div className="flex gap-2">
          {listType === 'waitlist' && (
            <button onClick={() => onPromote(player.id)} className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors">
              <ArrowUpCircle size={18} />
            </button>
          )}
          <button onClick={() => onRemove(player.id, listType)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
            <UserMinus size={18} />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Attendees <span className="text-blue-500">{mainList.length}/{maxPlayers}</span></h3>
      
      {/* Search Bar for manual addition */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search by name or @tag to add..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      {/* Main List */}
      <div className="mb-6">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Main List</h4>
        {mainList.map(p => renderPlayer(p, 'main'))}
      </div>

      {/* Waitlist */}
      {waitList.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex justify-between">
            Waitlist <span>{waitList.length} waiting</span>
          </h4>
          {waitList.map(p => renderPlayer(p, 'waitlist'))}
        </div>
      )}
    </div>
  );
}