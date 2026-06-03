"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, ChevronRight, RefreshCw, Trash2, Trophy, Play, Dumbbell } from 'lucide-react';
import { api } from '@/lib/api';
import { useUser } from '@/context/UserContext';

// ─── Player Shuffle ───────────────────────────────────────────────────────────

function PlayerShuffle() {
  const { user } = useUser();
  const [games, setGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGame, setSelectedGame] = useState<any | null>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [teams, setTeams] = useState<{ team1: any[]; team2: any[] } | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);

  const loadGames = useCallback(async () => {
    setIsLoading(true);
    try {
      const myGamesData = await api.getMyGames();
      // Only show games with 6+ attendees (enough for a full shuffle)
      const validGames = myGamesData
        .map((g: any) => g.event || g)
        .filter((g: any) => (g.attendees || []).length >= 6)
        .sort((a: any, b: any) => {
          const parseTime = (s?: string) => {
            if (!s) return 0;
            const safe = s.endsWith('Z') ? s : `${s}Z`;
            return new Date(safe).getTime();
          };
          return parseTime(b.start_time) - parseTime(a.start_time);
        });
      setGames(validGames);
    } catch (e) { console.error('Failed to load games', e); } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { loadGames(); }, [loadGames]);

  const handleSelectGame = (game: any) => {
    setSelectedGame(game);
    setAttendees((game.attendees || []).filter((a: any) => a.status !== 'waitlisted').slice(0, 6));
    setTeams(null);
  };

  const shuffleTeams = () => {
    if (attendees.length < 6) return;
    setIsShuffling(true);

    // Fisher-Yates shuffle
    const pool = [...attendees];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const team1 = pool.slice(0, 3);
    const team2 = pool.slice(3, 6);

    // Small delay for animation feel
    setTimeout(() => {
      setTeams({ team1, team2 });
      setIsShuffling(false);
    }, 400);
  };

  const resetShuffle = () => {
    setTeams(null);
  };

  return (
    <div className="bg-app-card rounded-3xl p-5 border border-app-active">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-app-accent-bg flex items-center justify-center">
          <Users className="text-app-accent" size={20} />
        </div>
        <div>
          <h3 className="font-bold text-app-text-primary text-base">Player Shuffle</h3>
          <p className="text-xs text-app-text-secondary">Pick a game, shuffle 6 players into 2 teams</p>
        </div>
      </div>

      {!selectedGame ? (
        <div className="space-y-2">
          {isLoading ? (
            <p className="text-sm text-app-text-secondary text-center py-4">Loading games...</p>
          ) : games.length === 0 ? (
            <p className="text-sm text-app-text-secondary text-center py-4">No games with 6+ players available.</p>
          ) : (
            games.slice(0, 5).map((game) => {
              const count = (game.attendees || []).filter((a: any) => a.status !== 'waitlisted').length;
              return (
                <button
                  key={game.id}
                  onClick={() => handleSelectGame(game)}
                  className="w-full flex items-center justify-between p-3 bg-app-bg rounded-2xl border border-app-active active:scale-[0.98] transition-all text-left"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-app-text-primary truncate">{game.title || 'Untitled Game'}</p>
                    <p className="text-xs text-app-text-secondary">{count} players</p>
                  </div>
                  <ChevronRight size={16} className="text-app-text-secondary flex-shrink-0" />
                </button>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Selected game info */}
          <div className="bg-app-bg rounded-2xl p-3 flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-app-text-primary truncate">{selectedGame.title || 'Untitled Game'}</p>
              <p className="text-xs text-app-text-secondary">{attendees.length} players selected</p>
            </div>
            <button
              onClick={() => { setSelectedGame(null); setTeams(null); }}
              className="text-xs font-bold text-app-accent flex-shrink-0 ml-2"
            >
              Change
            </button>
          </div>

          {/* Shuffle button */}
          <button
            onClick={shuffleTeams}
            disabled={isShuffling || attendees.length < 6}
            className="w-full flex items-center justify-center gap-2 py-3 bg-app-accent text-white rounded-2xl font-bold text-sm active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={isShuffling ? 'animate-spin' : ''} />
            Shuffle Teams
          </button>

          {/* Results */}
          {teams && (
            <div className="space-y-3 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-app-success-bg rounded-2xl p-4 text-center">
                  <p className="text-[10px] font-black text-app-success uppercase tracking-widest mb-2">Team 1</p>
                  {teams.team1.map((player, i) => (
                    <p key={i} className="text-sm font-bold text-app-text-primary">{player.user?.name || player.name || `Player ${i + 1}`}</p>
                  ))}
                </div>
                <div className="bg-app-accent-bg rounded-2xl p-4 text-center">
                  <p className="text-[10px] font-black text-app-accent uppercase tracking-widest mb-2">Team 2</p>
                  {teams.team2.map((player, i) => (
                    <p key={i} className="text-sm font-bold text-app-text-primary">{player.user?.name || player.name || `Player ${i + 4}`}</p>
                  ))}
                </div>
              </div>
              <button
                onClick={resetShuffle}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-app-bg rounded-2xl border border-app-active text-sm font-bold text-app-text-secondary active:scale-[0.98] transition-all"
              >
                <RefreshCw size={16} /> Shuffle Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Score Counter ────────────────────────────────────────────────────────────

interface ScoreState {
  set: number;
  score1: number;
  score2: number;
  winner: number | null; // 1 or 2
  gameOver: boolean;
  history: { set: number; score1: number; score2: number; winner: number }[];
}

const MAX_SETS = 5;
const SET_POINTS = 25;
const SET5_POINTS = 15;
const WIN_BY = 2;

function ScoreCounter() {
  const [state, setState] = useState<ScoreState>({
    set: 1,
    score1: 0,
    score2: 0,
    winner: null,
    gameOver: false,
    history: [],
  });
  const [team1Name, setTeam1Name] = useState('Team 1');
  const [team2Name, setTeam2Name] = useState('Team 2');
  const [editing, setEditing] = useState<1 | 2 | null>(null);

  const pointsNeeded = state.set === MAX_SETS ? SET5_POINTS : SET_POINTS;

  const canAddPoint = useCallback((team: 1 | 2) => {
    if (state.gameOver) return false;
    const current = team === 1 ? state.score1 : state.score2;
    const opponent = team === 1 ? state.score2 : state.score1;
    // Can always add if not at cap
    if (state.set === MAX_SETS) return current < 50; // cap at 30-28 max
    return current < pointsNeeded + WIN_BY;
  }, [state, pointsNeeded]);

  const addPoint = (team: 1 | 2) => {
    if (!canAddPoint(team)) return;

    setState(prev => {
      const newScore1 = team === 1 ? prev.score1 + 1 : prev.score1;
      const newScore2 = team === 2 ? prev.score2 + 1 : prev.score2;
      const currentPoints = team === 1 ? newScore1 : newScore2;
      const opponentPoints = team === 1 ? newScore2 : newScore1;

      // Check win condition
      if (currentPoints >= pointsNeeded && currentPoints - opponentPoints >= WIN_BY) {
        const isFinal = prev.history.length + 1 === MAX_SETS;
        return {
          ...prev,
          score1: newScore1,
          score2: newScore2,
          winner: team,
          gameOver: isFinal,
        };
      }

      return { ...prev, score1: newScore1, score2: newScore2 };
    });
  };

  const nextSet = () => {
    if (!state.winner) return;
    setState(prev => ({
      set: prev.set + 1,
      score1: 0,
      score2: 0,
      winner: null,
      gameOver: false,
      history: [...prev.history, { set: prev.set, score1: prev.score1, score2: prev.score2, winner: prev.winner! }],
    }));
  };

  const resetSet = () => {
    setState(prev => ({ ...prev, score1: 0, score2: 0, winner: null }));
  };

  const newGame = () => {
    setState({
      set: 1,
      score1: 0,
      score2: 0,
      winner: null,
      gameOver: false,
      history: [],
    });
  };

  const undoPoint = (team: 1 | 2) => {
    if (team === 1 && state.score1 > 0) {
      setState(prev => ({ ...prev, score1: prev.score1 - 1 }));
    } else if (team === 2 && state.score2 > 0) {
      setState(prev => ({ ...prev, score2: prev.score2 - 1 }));
    }
  };

  const renderHistory = () => {
    if (state.history.length === 0) return null;
    return (
      <div className="space-y-1">
        {state.history.map((h, i) => (
          <div key={i} className="flex items-center justify-between text-xs bg-app-bg rounded-xl px-3 py-2">
            <span className="text-app-text-secondary font-medium">Set {h.set}</span>
            <span className="font-bold text-app-text-primary">{h.score1} - {h.score2}</span>
            <span className="text-app-success font-bold">
              {h.winner === 1 ? team1Name : team2Name}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-app-card rounded-3xl p-5 border border-app-active">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-app-warning-bg flex items-center justify-center">
          <Trophy className="text-app-warning" size={20} />
        </div>
        <div>
          <h3 className="font-bold text-app-text-primary text-base">Score Counter</h3>
          <p className="text-xs text-app-text-secondary">Volleyball scoreboard with set tracking</p>
        </div>
      </div>

      {/* Team names */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-app-success" />
          <input
            value={team1Name}
            onChange={e => setTeam1Name(e.target.value)}
            onFocus={() => setEditing(1)}
            onBlur={() => setEditing(null)}
            className="bg-transparent text-sm font-bold text-app-text-primary border-b border-transparent focus:border-app-active outline-none w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-app-accent" />
          <input
            value={team2Name}
            onChange={e => setTeam2Name(e.target.value)}
            onFocus={() => setEditing(2)}
            onBlur={() => setEditing(null)}
            className="bg-transparent text-sm font-bold text-app-text-primary border-b border-transparent focus:border-app-active outline-none w-full"
          />
        </div>
      </div>

      {/* Score display */}
      <div className="bg-app-bg rounded-3xl p-6 mb-4 text-center">
        <p className="text-[10px] font-black text-app-text-secondary uppercase tracking-widest mb-3">
          Set {state.set} of {MAX_SETS}
        </p>
        <div className="flex items-center justify-center gap-8 mb-2">
          <div className="text-center">
            <p className="text-5xl font-black text-app-text-primary">{state.score1}</p>
          </div>
          <div className="text-xl text-app-text-secondary font-bold">-</div>
          <div className="text-center">
            <p className="text-5xl font-black text-app-text-primary">{state.score2}</p>
          </div>
        </div>
        {state.winner && !state.gameOver && (
          <p className="text-sm font-bold text-app-success mt-2">
            {state.winner === 1 ? team1Name : team2Name} wins set {state.set}!
          </p>
        )}
        {state.gameOver && (
          <p className="text-sm font-bold text-app-success mt-2">
            {state.winner === 1 ? team1Name : team2Name} wins the game!
          </p>
        )}
      </div>

      {/* Score buttons */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <button
          onClick={() => addPoint(1)}
          disabled={!canAddPoint(1)}
          className="py-4 bg-app-success-bg rounded-2xl font-bold text-sm text-app-success active:scale-[0.98] transition-all disabled:opacity-30"
        >
          +1 {team1Name}
        </button>
        <button
          onClick={() => addPoint(2)}
          disabled={!canAddPoint(2)}
          className="py-4 bg-app-accent-bg rounded-2xl font-bold text-sm text-app-accent active:scale-[0.98] transition-all disabled:opacity-30"
        >
          +1 {team2Name}
        </button>
      </div>

      {/* Undo buttons */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <button
          onClick={() => undoPoint(1)}
          disabled={state.score1 === 0}
          className="py-2 bg-app-bg rounded-xl border border-app-active text-xs font-medium text-app-text-secondary active:scale-[0.98] transition-all disabled:opacity-30"
        >
          Undo {team1Name}
        </button>
        <button
          onClick={() => undoPoint(2)}
          disabled={state.score2 === 0}
          className="py-2 bg-app-bg rounded-xl border border-app-active text-xs font-medium text-app-text-secondary active:scale-[0.98] transition-all disabled:opacity-30"
        >
          Undo {team2Name}
        </button>
      </div>

      {/* Controls */}
      <div className="space-y-2">
        {!state.gameOver && state.winner && (
          <button
            onClick={nextSet}
            className="w-full flex items-center justify-center gap-2 py-3 bg-app-accent text-white rounded-2xl font-bold text-sm active:scale-[0.98] transition-all"
          >
            <Play size={16} /> Next Set
          </button>
        )}
        <button
          onClick={resetSet}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-app-bg rounded-2xl border border-app-active text-sm font-bold text-app-text-secondary active:scale-[0.98] transition-all"
        >
          <RefreshCw size={16} /> Reset Set
        </button>
        <button
          onClick={newGame}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-app-bg rounded-2xl border border-app-active text-sm font-bold text-app-warning active:scale-[0.98] transition-all"
        >
          <Trash2 size={16} /> New Game
        </button>
      </div>

      {/* History */}
      {renderHistory()}
    </div>
  );
}

// ─── Warm-up Helper ───────────────────────────────────────────────────────────

const WARMUP_EXERCISES = [
  { name: 'Jumping Jacks', duration: '30s', reps: 2, desc: 'Full body warm-up' },
  { name: 'High Knees', duration: '30s', reps: 2, desc: 'Hip flexor activation' },
  { name: 'Arm Circles', duration: '20s', reps: 2, desc: 'Shoulder mobility' },
  { name: 'Shoulder Rolls', duration: '20s', reps: 2, desc: 'Upper back release' },
  { name: 'Lateral Lunges', duration: '30s', reps: 2, desc: 'Hip & leg stretch' },
  { name: 'Wrist Rotations', duration: '15s', reps: 2, desc: 'Wrist prep for setting' },
  { name: 'Neck Rolls', duration: '15s', reps: 1, desc: 'Neck tension release' },
  { name: 'Dynamic Stretching', duration: '60s', reps: 1, desc: 'Full body movement' },
];

function WarmupHelper() {
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [currentExercise, setCurrentExercise] = useState<number | null>(null);

  const toggleComplete = (index: number) => {
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const progress = Math.round((completed.size / WARMUP_EXERCISES.length) * 100);

  return (
    <div className="bg-app-card rounded-3xl p-5 border border-app-active">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-app-success-bg flex items-center justify-center">
          <Dumbbell className="text-app-success" size={20} />
        </div>
        <div>
          <h3 className="font-bold text-app-text-primary text-base">Warm-up Helper</h3>
          <p className="text-xs text-app-text-secondary">Pre-game warm-up routine</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-app-text-secondary mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-app-bg rounded-full h-2 overflow-hidden">
          <div
            className="h-2 rounded-full bg-app-success transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Exercise list */}
      <div className="space-y-2 mb-4">
        {WARMUP_EXERCISES.map((ex, i) => (
          <button
            key={i}
            onClick={() => toggleComplete(i)}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
              completed.has(i)
                ? 'bg-app-success-bg border-app-success'
                : 'bg-app-bg border-app-active'
            }`}
          >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              completed.has(i) ? 'bg-app-success border-app-success' : 'border-app-text-secondary'
            }`}>
              {completed.has(i) && <span className="text-white text-xs">✓</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold truncate ${completed.has(i) ? 'text-app-success' : 'text-app-text-primary'}`}>
                {ex.name}
              </p>
              <p className="text-xs text-app-text-secondary">{ex.desc} · {ex.duration} · {ex.reps}x</p>
            </div>
          </button>
        ))}
      </div>

      {/* Timer button */}
      <button
        onClick={() => setCurrentExercise(currentExercise !== null ? null : 0)}
        className="w-full flex items-center justify-center gap-2 py-3 bg-app-bg rounded-2xl border border-app-active text-sm font-bold text-app-text-secondary active:scale-[0.98] transition-all"
      >
        <Play size={16} />
        {currentExercise !== null ? 'Stop Timer' : 'Start Timer'}
      </button>

      <p className="text-xs text-app-text-secondary text-center mt-3">
        Complete all exercises before the game starts!
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GameToolsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/" className="p-2 -ml-2 active:scale-95 transition-all">
          <ArrowLeft size={24} className="text-app-text-secondary" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-app-text-primary">Game Tools</h1>
          <p className="text-xs text-app-text-secondary">Everything you need on the court</p>
        </div>
      </div>

      {/* Tools */}
      <div className="space-y-4">
        <PlayerShuffle />
        <ScoreCounter />
        <WarmupHelper />
      </div>
    </div>
  );
}
