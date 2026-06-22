import React from 'react';
import { Match, Team, MatchEvent, MatchEventType } from '../types';
import { 
  X, 
  MapPin, 
  Calendar, 
  Activity, 
  Clock, 
  Sparkles, 
  ShieldAlert, 
  Flame, 
  Trophy 
} from 'lucide-react';

interface MatchDetailsModalProps {
  matchId: string;
  matches: Match[];
  teams: Team[];
  events: MatchEvent[];
  onClose: () => void;
}

export default function MatchDetailsModal({
  matchId,
  matches,
  teams,
  events,
  onClose,
}: MatchDetailsModalProps) {
  const match = matches.find((m) => m.id === matchId);
  if (!match) return null;

  // Derive teams
  const teamA = teams.find((t) => t.id === match.teamAId);
  const teamB = teams.find((t) => t.id === match.teamBId);

  // Compute live scores based on history (re-verify robustly)
  let scoreA = 0;
  let scoreB = 0;

  if (match.status === 'completed') {
    scoreA = match.scoreA;
    scoreB = match.scoreB;
  } else {
    // Dynamically calculate from events if live scheduled
    events.forEach((evt) => {
      if (evt.type === 'goal') {
        if (evt.teamId === match.teamAId) scoreA += 1;
        else if (evt.teamId === match.teamBId) scoreB += 1;
      } else if (evt.type === 'own_goal') {
        if (evt.teamId === match.teamAId) scoreB += 1;
        else if (evt.teamId === match.teamBId) scoreA += 1;
      }
    });
  }

  const getEventGlyph = (type: MatchEventType) => {
    switch (type) {
      case 'goal': return '⚽';
      case 'assist': return '🎯';
      case 'yellow_card': return '🟨';
      case 'red_card': return '🟥';
      case 'own_goal': return '💥';
      case 'substitution': return '🔁';
      default: return '📍';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
        
        {/* Header banner */}
        <div className="p-6 bg-zinc-950 text-white relative overflow-hidden shrink-0">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-500 via-zinc-950 to-black"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest font-black text-emerald-400 block font-mono">
                {match.type === 'tournament' ? 'Tournament Match Series' : 'Kickoff Clash Series'}
              </span>
              <h3 className="text-lg font-black tracking-tight text-white">Match Overview Details</h3>
            </div>
            <button
              id="close-match-details-modal-btn"
              onClick={onClose}
              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-white rounded-full transition-colors border border-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Premium Scoreboard Display */}
          <div className="relative z-10 grid grid-cols-7 items-center text-center mt-6 bg-zinc-900/40 border border-zinc-800/40 p-4 rounded-2xl backdrop-blur-md">
            <div className="col-span-2 flex flex-col items-center">
              <span className="text-3xl filter drop-shadow-sm">{match.teamALogo || '⚽'}</span>
              <span className="text-xs font-black line-clamp-1 mt-1.5 text-zinc-200">{match.teamAName}</span>
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold font-mono">Home</span>
            </div>

            <div className="col-span-3 flex flex-col items-center justify-center">
              {match.status === 'scheduled' ? (
                <span className="px-2.5 py-1 bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-wider rounded-md border border-zinc-700/50">
                  Scheduled
                </span>
              ) : (
                <div className="space-y-1">
                  <span className="text-3xl font-black font-mono text-white tracking-widest bg-zinc-950 px-3 py-1 rounded-xl border border-zinc-800">
                    {scoreA} - {scoreB}
                  </span>
                  {match.status === 'live' && (
                    <span className="text-[9px] font-black text-red-500 uppercase tracking-widest block animate-pulse">Live Feed</span>
                  )}
                </div>
              )}
            </div>

            <div className="col-span-2 flex flex-col items-center">
              <span className="text-3xl filter drop-shadow-sm">{match.teamBLogo || '⚽'}</span>
              <span className="text-xs font-black line-clamp-1 mt-1.5 text-zinc-200">{match.teamBName}</span>
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold font-mono">Away</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/60 rounded-xl space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
              <span className="text-[9px] uppercase font-black text-zinc-400 dark:text-zinc-500 tracking-wider block">Kickoff Timeline</span>
              <p className="font-bold flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200">
                <Clock className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" /> {match.date} • {match.time}
              </p>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/60 rounded-xl space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
              <span className="text-[9px] uppercase font-black text-zinc-400 dark:text-zinc-500 tracking-wider block">Match Venue</span>
              <p className="font-bold flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200 truncate">
                <MapPin className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" /> {match.venue}
              </p>
            </div>
          </div>

          {/* Final winner highlights banner */}
          {match.status === 'completed' && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-base shadow-sm shrink-0">
                🏆
              </div>
              <div>
                <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">Match Outcome</span>
                <p className="text-xs font-black text-zinc-900 dark:text-zinc-100 leading-tight">
                  {match.winnerId === 'draw' 
                    ? 'Friendly Stalemate (Draw Match)' 
                    : `${match.winnerId === match.teamAId ? match.teamAName : match.teamBName} Wins Match!`}
                </p>
              </div>
            </div>
          )}

          {/* Chronological event logs list */}
          <div className="space-y-3">
            <span className="text-xs uppercase font-black text-zinc-400 dark:text-zinc-500 tracking-wider flex items-center gap-1.5 border-b pb-2 border-zinc-100 dark:border-zinc-800">
              <Activity className="w-4 h-4 text-emerald-500" /> Match Event Log Breakdown ({events.length})
            </span>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {events.length === 0 ? (
                <div className="text-center py-10 text-xs text-zinc-400 dark:text-zinc-500 italic bg-zinc-50 dark:bg-zinc-950/40 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
                  No scorecard events recorded during kickoff timeframe.
                </div>
              ) : (
                [...events]
                  .sort((a, b) => a.minute - b.minute)
                  .map((evt) => (
                    <div
                      id={`inspect-event-${evt.id}`}
                      key={evt.id}
                      className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-950/20 flex gap-3 text-xs items-center"
                    >
                      <span className="font-black font-mono text-zinc-500 dark:text-zinc-400 text-xs bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded w-8 text-center shrink-0">
                        {evt.minute}'
                      </span>
                      <span className="text-base shrink-0">{getEventGlyph(evt.type)}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-zinc-800 dark:text-zinc-200 truncate">
                          {evt.type === 'goal' && `${evt.playerAName} Goal Score`}
                          {evt.type === 'assist' && `${evt.playerAName} Assist Playmaker`}
                          {evt.type === 'yellow_card' && `${evt.playerAName} Yellow Warning`}
                          {evt.type === 'red_card' && `${evt.playerAName} Red Dismissed Card`}
                          {evt.type === 'own_goal' && `Own Goal Misplay (Opponent Score)`}
                          {evt.type === 'substitution' && `Sub OUT: ${evt.playerAName}`}
                        </p>
                        {evt.type === 'goal' && evt.playerBName && (
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block truncate">Assisted by {evt.playerBName}</span>
                        )}
                        {evt.type === 'substitution' && evt.playerBName && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block truncate">Sub IN: {evt.playerBName}</span>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
          <button
            id="close-match-inspect-btn"
            onClick={onClose}
            className="w-full py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-bold text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 rounded-xl transition-colors shadow-sm"
          >
            Close Drilldown View
          </button>
        </div>
      </div>
    </div>
  );
}