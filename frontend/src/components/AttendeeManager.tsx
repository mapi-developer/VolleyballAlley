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
    <div key={player.id} className="flex items-center justify-between p-3 bg-app-inset rounded-xl mb-2 border border-app-active transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-app-accent-bg text-app-accent rounded-full flex items-center justify-center font-bold transition-colors">
          {player.name.charAt(0)}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-app-text-primary text-sm transition-colors">{player.name}</span>
            {player.isHost && <Shield size={14} className="text-app-accent transition-colors" />}
          </div>
          <span className="text-xs text-app-text-secondary transition-colors">{player.tgTag}</span>
        </div>
      </div>

      {!player.isHost && (
        <div className="flex gap-2">
          {listType === 'waitlist' && (
            <button onClick={() => onPromote(player.id)} className="p-2 text-app-success hover:bg-app-success-bg rounded-full transition-colors">
              <ArrowUpCircle size={18} />
            </button>
          )}
          <button onClick={() => onRemove(player.id, listType)} className="p-2 text-app-error hover:bg-app-error-bg rounded-full transition-colors">
            <UserMinus size={18} />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold text-app-text-primary mb-4 transition-colors">
        Attendees <span className="text-app-accent">{mainList.length}/{maxPlayers}</span>
      </h3>
      
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-app-text-secondary transition-colors" />
        <input 
          type="text" 
          placeholder="Search by name or @tag to add..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-app-inset border border-app-active rounded-xl text-sm text-app-text-primary placeholder:text-app-text-secondary focus:outline-none focus:ring-2 focus:ring-app-accent/20 focus:border-app-accent transition-all"
        />
      </div>

      {/* Main List */}
      <div className="mb-6">
        <h4 className="text-xs font-bold text-app-text-secondary uppercase tracking-wider mb-2 transition-colors">Main List</h4>
        {mainList.map(p => renderPlayer(p, 'main'))}
      </div>

      {/* Waitlist */}
      {waitList.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-app-text-secondary uppercase tracking-wider mb-2 flex justify-between transition-colors">
            Waitlist <span>{waitList.length} waiting</span>
          </h4>
          {waitList.map(p => renderPlayer(p, 'waitlist'))}
        </div>
      )}
    </div>
  );
}