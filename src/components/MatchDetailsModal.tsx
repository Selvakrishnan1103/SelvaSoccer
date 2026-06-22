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
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
        {/* Header banner */}
        <div className="p-6 bg-neutral-900 text-white relative overflow-hidden shrink-0">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-400 via-neutral-900 to-black"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-400 block font-mono">
                {match.type === 'tournament' ? 'Tournament Match Series' : 'Kickoff Clash Series'}
              </span>
              <h3 className="text-lg font-black tracking-tight leading-none text-white">Match Overview Details</h3>
            </div>
            <button
              id="close-match-details-modal-btn"
              onClick={onClose}
              className="p-1.5 hover:bg-neutral-805 text-neutral-400 rounded-full transition"
            >
              <X className="w-5 h-5 text-neutral-350" />
            </button>
          </div>

          {/* Simple Scores display */}
          <div className="relative z-10 grid grid-cols-7 items-center text-center mt-6">
            <div className="col-span-2 flex flex-col items-center">
              <span className="text-3xl">{match.teamALogo || '⚽'}</span>
              <span className="text-xs font-bold line-clamp-1 mt-1">{match.teamAName}</span>
            </div>

            <div className="col-span-3">
              {match.status === 'scheduled' ? (
                <span className="text-xs font-black uppercase text-neutral-400 tracking-wider">Scheduled</span>
              ) : (
                <span className="text-2xl font-black font-mono text-white tracking-wider">
                  {scoreA} - {scoreB}
                </span>
              )}
            </div>

            <div className="col-span-2 flex flex-col items-center">
              <span className="text-3xl">{match.teamBLogo || '⚽'}</span>
              <span className="text-xs font-bold line-clamp-1 mt-1">{match.teamBName}</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-xl space-y-0.5 text-xs text-neutral-700 dark:text-neutral-300">
              <span className="text-[10px] uppercase font-bold text-neutral-40a">Kickoff Timeline</span>
              <p className="font-semibold flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-neutral-400" /> {match.date} {match.time}</p>
            </div>
            <div className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-xl space-y-0.5 text-xs text-neutral-700 dark:text-neutral-300">
              <span className="text-[10px] uppercase font-bold text-neutral-10a">Match Venue</span>
              <p className="font-semibold flex items-center gap-1 truncate"><MapPin className="w-3.5 h-3.5 text-neutral-400" /> {match.venue}</p>
            </div>
          </div>

          {/* Final winner highlights banner */}
          {match.status === 'completed' && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-base shadow-md">
                🏆
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-650 uppercase">Winner highlight</span>
                <p className="text-xs font-black text-neutral-900 dark:text-white leading-tight">
                  {match.winnerId === 'draw' 
                    ? 'Friendly Stalemate (Draw Match)' 
                    : `${match.winnerId === match.teamAId ? match.teamAName : match.teamBName} Wins Match!`}
                </p>
              </div>
            </div>
          )}

          {/* Chronological event logs list */}
          <div className="space-y-3">
            <span className="text-xs uppercase font-extrabold text-neutral-400 tracking-wider flex items-center gap-1.5 border-b pb-2 dark:border-neutral-800">
              <Activity className="w-4 h-4 text-emerald-500" /> Match Event log Details ({events.length})
            </span>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {events.length === 0 ? (
                <div className="text-center py-10 text-xs text-neutral-450 italic">
                  No scorecard events recorded during kickoff timeframe.
                </div>
              ) : (
                [...events]
                  .sort((a, b) => a.minute - b.minute)
                  .map((evt) => (
                    <div
                      id={`inspect-event-${evt.id}`}
                      key={evt.id}
                      className="p-3 rounded-xl border border-neutral-100 dark:border-neutral-850 bg-neutral-50/50 dark:bg-neutral-850/20 flex gap-3 text-xs items-center"
                    >
                      <span className="font-black font-mono text-neutral-600 dark:text-neutral-400 text-sm">
                        {evt.minute}'
                      </span>
                      <span className="text-base">{getEventGlyph(evt.type)}</span>
                      <div>
                        <p className="font-bold text-neutral-850 dark:text-neutral-200">
                          {evt.type === 'goal' && `${evt.playerAName} Goal Score`}
                          {evt.type === 'assist' && `${evt.playerAName} Assist Playmaker`}
                          {evt.type === 'yellow_card' && `${evt.playerAName} Yellow warning Card`}
                          {evt.type === 'red_card' && `${evt.playerAName} Red Dismissed Card`}
                          {evt.type === 'own_goal' && `Own Goal Misplay (Scores for opponent)`}
                          {evt.type === 'substitution' && `Sub OUT: ${evt.playerAName}`}
                        </p>
                        {evt.type === 'goal' && evt.playerBName && (
                          <span className="text-[10px] text-neutral-450 block">Assisted by {evt.playerBName}</span>
                        )}
                        {evt.type === 'substitution' && evt.playerBName && (
                          <span className="text-[10px] text-neutral-450 block text-emerald-650">Sub IN: {evt.playerBName}</span>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-neutral-50 border-t shrink-0">
          <button
            id="close-match-inspect-btn"
            onClick={onClose}
            className="w-full py-2 bg-white border font-bold text-xs text-neutral-550 hover:bg-neutral-100 rounded-xl transition"
          >
            Close Drilldown View
          </button>
        </div>
      </div>
    </div>
  );
}
