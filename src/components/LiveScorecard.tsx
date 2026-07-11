import React, { useState, useEffect } from 'react';
import { Match, Team, UserProfile, MatchEvent, MatchEventType } from '../types';
import { 
  ArrowLeft, 
  Trash2, 
  Activity, 
  Sparkles, 
  Save, 
  AlertTriangle
} from 'lucide-react';

interface LiveScorecardProps {
  match: Match;
  teams: Team[];
  players: UserProfile[];
  initialEvents: MatchEvent[];
  onAddEvent: (event: MatchEvent) => Promise<void>;
  onDeleteEvent: (eventId: string) => Promise<void>;
  onEndMatch: (matchId: string, events: MatchEvent[]) => Promise<void>;
  onBack: () => void;
}

export default function LiveScorecard({
  match,
  teams,
  players,
  initialEvents,
  onAddEvent,
  onDeleteEvent,
  onEndMatch,
  onBack,
}: LiveScorecardProps) {
  const [events, setEvents] = useState<MatchEvent[]>(initialEvents);
  const [submitting, setSubmitting] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);

  // Form states for adding a match event
  const [evtType, setEvtType] = useState<MatchEventType>('goal');
  const [evtTeamId, setEvtTeamId] = useState<string>(match.teamAId);
  const [evtPlayerA, setEvtPlayerA] = useState<string>(''); // primary actor
  const [evtPlayerB, setEvtPlayerB] = useState<string>(''); // secondary actor (assist provider, coming IN)
  const [evtMinute, setEvtMinute] = useState<number>(1);
  const [formError, setFormError] = useState('');

  // Keep state in sync with parent props (Firebase real-time sync)
  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  // Derive teams
  const teamA = teams.find(t => t.id === match.teamAId);
  const teamB = teams.find(t => t.id === match.teamBId);

  // Get current scoreboard based on events
  let scoreA = 0;
  let scoreB = 0;

  events.forEach((evt) => {
    if (evt.type === 'goal') {
      if (evt.teamId === match.teamAId) scoreA += 1;
      else if (evt.teamId === match.teamBId) scoreB += 1;
    } else if (evt.type === 'own_goal') {
      if (evt.teamId === match.teamAId) scoreB += 1;
      else if (evt.teamId === match.teamBId) scoreA += 1;
    }
  });

  // Filters players based on selected team for event logging
  const currentTeamPlayers = players.filter((pl) => {
    const targetTeam = evtTeamId === match.teamAId ? teamA : teamB;
    return targetTeam ? targetTeam.playerIds.includes(pl.id) : false;
  });

  const handleLogEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (evtMinute < 1 || evtMinute > 120) {
      setFormError('Minute must be between 1 and 120.');
      return;
    }

    if (!evtPlayerA && evtType !== 'own_goal') {
      setFormError('Please select the primary player for this event.');
      return;
    }

    if (evtType === 'substitution' && !evtPlayerB) {
      setFormError('Please select the incoming player for substitution.');
      return;
    }

    if (evtType === 'substitution' && evtPlayerA === evtPlayerB) {
      setFormError('Incoming and outgoing players must be distinct.');
      return;
    }

    setSubmitting(true);
    try {
      const actorAPlayer = players.find(p => p.id === evtPlayerA);
      const actorBPlayer = evtPlayerB ? players.find(p => p.id === evtPlayerB) : undefined;

      const newEvent: MatchEvent = {
        id: `evt_${Date.now()}`,
        matchId: match.id,
        type: evtType,
        teamId: evtTeamId,
        playerAId: evtPlayerA,
        playerAName: actorAPlayer ? actorAPlayer.name : 'Own Goal Scorer',
        minute: evtMinute,
        ...(evtPlayerB && actorBPlayer
          ? { playerBId: evtPlayerB, playerBName: actorBPlayer.name }
          : {}),
      };

      await onAddEvent(newEvent);

      // Reset Form fields elegantly
      setEvtPlayerA('');
      setEvtPlayerB('');
      setFormError('');
    } catch (err) {
      console.error(err);
      setFormError('Failed to log event to database.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveEvent = async (id: string) => {
    try {
      await onDeleteEvent(id);
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  const handleConfirmEndMatch = async () => {
    setSubmitting(true);
    try {
      await onEndMatch(match.id, events);
      setShowEndModal(false);
      onBack();
    } catch (err) {
      console.error(err);
      setFormError('Failed to complete match workflow.');
    } finally {
      setSubmitting(false);
    }
  };

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
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Broadcast ticker bar */}
      <div className="flex justify-between items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 rounded-2xl shadow-sm">
        <button
          id="scorecard-back-btn"
          onClick={onBack}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-bold text-xs group transition-colors"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" /> Exit Stream
        </button>

        <div className="flex gap-2 items-center">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span className="text-red-500 font-black uppercase text-[10px] tracking-wider font-mono">
            LIVE BROADCAST FEED
          </span>
        </div>

        <button
          id="scorecard-end-match-btn"
          onClick={() => setShowEndModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm"
        >
          End Match Workflow
        </button>
      </div>

      {/* Broadcast Scoring board */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl text-center">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500 via-zinc-900 to-black"></div>
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Team A */}
          <div className="flex flex-col items-center gap-2 md:w-1/3">
            <span className="text-4xl filter drop-shadow-md">{match.teamALogo || '⚽'}</span>
            <h2 className="text-lg font-black tracking-tight truncate max-w-full text-zinc-100">
              {match.teamAName}
            </h2>
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest font-mono bg-zinc-900 px-2 py-0.5 rounded-md">Home Club</span>
          </div>

          {/* Scores ticker */}
          <div className="space-y-3 md:w-1/3 flex flex-col items-center justify-center">
            <div className="flex items-center justify-center gap-5 bg-zinc-900/80 border border-zinc-800/80 px-6 py-2.5 rounded-2xl backdrop-blur-md">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                {scoreA}
              </span>
              <span className="px-2 py-1 bg-red-600 text-neutral-100 text-[9px] font-black rounded-md uppercase tracking-widest animate-pulse shadow-sm">
                Live
              </span>
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                {scoreB}
              </span>
            </div>
            <div className="text-zinc-400 text-xs font-semibold flex items-center justify-center gap-1.5 bg-zinc-900/30 px-3 py-1 rounded-full border border-zinc-800/30">
              <Activity className="w-3.5 h-3.5 text-red-500 animate-pulse" /> Live Match Ticker • Ground A
            </div>
          </div>

          {/* Team B */}
          <div className="flex flex-col items-center gap-2 md:w-1/3">
            <span className="text-4xl filter drop-shadow-md">{match.teamBLogo || '⚽'}</span>
            <h2 className="text-lg font-black tracking-tight truncate max-w-full text-zinc-100">
              {match.teamBName}
            </h2>
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest font-mono bg-zinc-900 px-2 py-0.5 rounded-md">Away Club</span>
          </div>
        </div>
      </div>

      {/* Main Scoring splits */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Left Option block: Event inputs (3 columns wide) */}
        <div className="lg:col-span-3 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-6">
          <div className="border-b pb-3 border-zinc-100 dark:border-zinc-800/60">
            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-500" /> Log Score Event
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Record a scorecard occurrence into the registry.</p>
          </div>

          {formError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {formError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogEventSubmit} className="space-y-4">
            {/* Event Category & Team Context */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Event Action</label>
                <select
                  id="event-type-select"
                  value={evtType}
                  onChange={(e) => {
                    const nextVal = e.target.value as MatchEventType;
                    setEvtType(nextVal);
                    setEvtPlayerA('');
                    setEvtPlayerB('');
                  }}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100 font-bold"
                >
                  <option value="goal">⚽ Log Goal Score</option>
                  <option value="assist">🎯 Log Assist Playmaker</option>
                  <option value="yellow_card">🟨 Yellow Warning Card</option>
                  <option value="red_card">🟥 Red Dismissal Card</option>
                  <option value="own_goal">💥 Own Goal (Self Score)</option>
                  <option value="substitution">🔁 Substitution Roster</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Team Context</label>
                <select
                  id="event-team-select"
                  value={evtTeamId}
                  onChange={(e) => {
                    setEvtTeamId(e.target.value);
                    setEvtPlayerA('');
                    setEvtPlayerB('');
                  }}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100 font-bold"
                >
                  <option value={match.teamAId}>{match.teamAName}</option>
                  <option value={match.teamBId}>{match.teamBName}</option>
                </select>
              </div>
            </div>

            {/* Event Fields selection rendering dynamically */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Primary Actor player select */}
              {evtType !== 'own_goal' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    {evtType === 'goal' && 'Goal Scorer'}
                    {evtType === 'assist' && 'Key Playmaker'}
                    {(evtType === 'yellow_card' || evtType === 'red_card') && 'Target Player'}
                    {evtType === 'substitution' && 'Player Coming OUT'}
                  </label>
                  <select
                    id="event-actor-a-select"
                    value={evtPlayerA}
                    onChange={(e) => setEvtPlayerA(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100 font-medium"
                    required
                  >
                    <option value="">-- Choose Player --</option>
                    {currentTeamPlayers.map((pl) => (
                      <option key={pl.id} value={pl.id}>{pl.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Assist provider, incoming player or minute */}
              {evtType === 'goal' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Assist Provider (Optional)</label>
                  <select
                    id="event-actor-b-select"
                    value={evtPlayerB}
                    onChange={(e) => setEvtPlayerB(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100 font-medium"
                  >
                    <option value="">-- No Assist --</option>
                    {currentTeamPlayers
                      .filter((pl) => pl.id !== evtPlayerA)
                      .map((pl) => (
                        <option key={pl.id} value={pl.id}>{pl.name}</option>
                      ))}
                  </select>
                </div>
              )}

              {/* Substitution field mapping */}
              {evtType === 'substitution' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Player Coming IN</label>
                  <select
                    id="event-actor-sub-in-select"
                    value={evtPlayerB}
                    onChange={(e) => setEvtPlayerB(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100 font-medium"
                    required
                  >
                    <option value="">-- Choose Player --</option>
                    {currentTeamPlayers
                      .filter((pl) => pl.id !== evtPlayerA)
                      .map((pl) => (
                        <option key={pl.id} value={pl.id}>{pl.name}</option>
                      ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Match Minute (1 - 120)</label>
                <input
                  id="event-minute-input"
                  type="number"
                  min={1}
                  max={120}
                  value={evtMinute}
                  onChange={(e) => setEvtMinute(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100 font-mono font-bold"
                  required
                />
              </div>
            </div>

            {/* Action submit button */}
            <button
              id="save-match-event-btn"
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-1.5 w-full bg-emerald-500 hover:bg-emerald-600 font-bold py-2.5 rounded-xl text-xs text-white transition-colors disabled:opacity-50 shadow-sm"
            >
              <Save className="w-4 h-4" /> Save Score Event
            </button>
          </form>
        </div>

        {/* Right timeline display (2 columns wide) */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800/60 pb-2.5">
            <Activity className="w-4 h-4 text-emerald-500" /> Complete Events Timeline
          </h3>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {events.length === 0 ? (
              <div className="text-center p-12 text-xs text-zinc-400 dark:text-zinc-500 italic">
                No events recorded. Log actions to see the live breakdown.
              </div>
            ) : (
              [...events]
                .sort((a, b) => b.minute - a.minute)
                .map((evt) => (
                  <div
                    id={`live-event-ticker-${evt.id}`}
                    key={evt.id}
                    className="flex justify-between items-center p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-950 text-xs transition-colors group"
                  >
                    <div className="flex gap-3 items-center min-w-0">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 font-black font-mono w-7 shrink-0 text-left bg-zinc-100 dark:bg-zinc-950 p-1 rounded text-center">
                        {evt.minute}'
                      </span>
                      <span className="text-base shrink-0">{getEventGlyph(evt.type)}</span>

                      <div className="space-y-0.5 truncate">
                        <p className="font-bold text-zinc-800 dark:text-zinc-200 truncate">
                          {evt.type === 'goal' && `${evt.playerAName} Goal`}
                          {evt.type === 'assist' && `${evt.playerAName} Assist`}
                          {evt.type === 'yellow_card' && `${evt.playerAName} Yellow`}
                          {evt.type === 'red_card' && `${evt.playerAName} Dismissed`}
                          {evt.type === 'own_goal' && 'Own Goal Misplay'}
                          {evt.type === 'substitution' && `Out: ${evt.playerAName}`}
                        </p>
                        {evt.type === 'goal' && evt.playerBName && (
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block truncate">Assist: {evt.playerBName}</span>
                        )}
                        {evt.type === 'substitution' && evt.playerBName && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block truncate">In: {evt.playerBName}</span>
                        )}
                      </div>
                    </div>

                    <button
                      id={`delete-event-btn-${evt.id}`}
                      onClick={() => handleRemoveEvent(evt.id)}
                      className="p-1.5 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 text-zinc-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Check Confirm End Match Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm p-6 shadow-xl text-center space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto text-lg">
              ⚠️
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black text-zinc-900 dark:text-zinc-50">Conclude Football Match?</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Ending this match will finalize scoreboard scores, formulate winner metrics, update league charts, and mark stats as final.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowEndModal(false)}
                className="flex-1 py-2 text-xs font-bold border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100/60 dark:hover:bg-zinc-800 transition-colors"
              >
                Keep Scoring
              </button>
              <button
                id="confirm-end-match-modal-btn"
                onClick={handleConfirmEndMatch}
                disabled={submitting}
                className="flex-1 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl disabled:opacity-50 transition-colors"
              >
                Yes, Finalize
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
