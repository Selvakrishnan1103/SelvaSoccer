import React, { useState, useEffect } from 'react';
import { Match, Team, UserProfile, MatchEvent, MatchEventType } from '../types';
import { 
  ArrowLeft, 
  Trash2, 
  Activity, 
  Flag, 
  ShieldAlert, 
  UserMinus, 
  Plus, 
  Sparkles, 
  Save, 
  AlertTriangle,
  Flame,
  CheckCircle2
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
      // Own goal scores for the opposite team
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
        playerBId: evtPlayerB || undefined,
        playerBName: actorBPlayer ? actorBPlayer.name : undefined,
        minute: evtMinute
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
      console.error('Failed to delet event:', err);
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
      <div className="flex justify-between items-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 p-4 sm:p-5 rounded-2xl shadow-sm">
        <button
          id="scorecard-back-btn"
          onClick={onBack}
          className="flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Stream
        </button>

        <div className="flex gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping self-center"></span>
          <span className="text-red-500 font-extrabold uppercase text-xs tracking-wider font-mono">
            LIVE BROADCAST STIMULATION
          </span>
        </div>

        <button
          id="scorecard-end-match-btn"
          onClick={() => setShowEndModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-md shadow-red-650/10"
        >
          End Match Workflow
        </button>
      </div>

      {/* Broadcast Scoring board */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl text-center">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500 via-neutral-900 to-black"></div>
        <div className="relative z-10 max-w-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Team A */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">{match.teamALogo || '⚽'}</span>
            <h2 className="text-xl font-extrabold tracking-tight truncate max-w-[170px]">
              {match.teamAName}
            </h2>
            <span className="text-[10px] text-neutral-500 uppercase font-mono">Home Club</span>
          </div>

          {/* Scores ticker */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-4">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white animate-custom-fade">
                {scoreA}
              </span>
              <span className="px-3 py-1 bg-red-600 text-neutral-100 text-[10px] font-black rounded-full uppercase tracking-wider animate-pulse">
                Live
              </span>
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                {scoreB}
              </span>
            </div>
            <div className="text-neutral-500 text-xs font-semibold flex items-center justify-center gap-1">
              <Activity className="w-3.5 h-3.5 text-red-500" /> Live Match Ticker • SelvaSoccer ground
            </div>
          </div>

          {/* Team B */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">{match.teamBLogo || '⚽'}</span>
            <h2 className="text-xl font-extrabold tracking-tight truncate max-w-[170px]">
              {match.teamBName}
            </h2>
            <span className="text-[10px] text-neutral-500 uppercase font-mono">Away Club</span>
          </div>
        </div>
      </div>

      {/* Main Scoring splits */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Left Option block: Event inputs (3 columns wide) */}
        <div className="lg:col-span-3 p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-sm space-y-6">
          <div className="border-b pb-3 dark:border-neutral-800">
            <h3 className="text-lg font-black text-neutral-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-emerald-500" /> Log Score Event
            </h3>
            <p className="text-xs text-neutral-500">Record a scorecard occurrence into the ledger.</p>
          </div>

          {formError && (
            <div className="p-3 bg-red-105 border border-red-200 text-red-650 text-xs rounded-xl flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {formError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogEventSubmit} className="space-y-4">
            {/* Event Category & Team Context */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Event Action</label>
                <select
                  id="event-type-select"
                  value={evtType}
                  onChange={(e) => {
                    const nextVal = e.target.value as MatchEventType;
                    setEvtType(nextVal);
                    setEvtPlayerA('');
                    setEvtPlayerB('');
                  }}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:border-emerald-500 dark:text-white outline-none font-bold"
                >
                  <option value="goal">⚽ Log Goal Score</option>
                  <option value="assist">🎯 Log Assist Playmaker</option>
                  <option value="yellow_card">🟨 Yellow Warning Card</option>
                  <option value="red_card">🟥 Red Dismissal Card</option>
                  <option value="own_goal">💥 Own Goal (Self Score)</option>
                  <option value="substitution">🔁 substitution Roster</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Team Context</label>
                <select
                  id="event-team-select"
                  value={evtTeamId}
                  onChange={(e) => {
                    setEvtTeamId(e.target.value);
                    setEvtPlayerA('');
                    setEvtPlayerB('');
                  }}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:border-emerald-500 dark:text-white outline-none font-bold"
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
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">
                    {evtType === 'goal' && 'Goal Scorer'}
                    {evtType === 'assist' && 'Key Playmaker'}
                    {(evtType === 'yellow_card' || evtType === 'red_card') && 'Target Player'}
                    {evtType === 'substitution' && 'Player Coming OUT'}
                  </label>
                  <select
                    id="event-actor-a-select"
                    value={evtPlayerA}
                    onChange={(e) => setEvtPlayerA(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:border-emerald-500 dark:text-white outline-none"
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
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Assist Provider (Optional)</label>
                  <select
                    id="event-actor-b-select"
                    value={evtPlayerB}
                    onChange={(e) => setEvtPlayerB(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:border-emerald-500 dark:text-white outline-none"
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

              {evtType === 'substitution' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Player Coming IN</label>
                  <select
                    id="event-actor-sub-in-select"
                    value={evtPlayerB}
                    onChange={(e) => setEvtPlayerB(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:border-emerald-500 dark:text-white outline-none"
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

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Match Minute (1 - 120)</label>
                <input
                  id="event-minute-input"
                  type="number"
                  min={1}
                  max={120}
                  value={evtMinute}
                  onChange={(e) => setEvtMinute(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:border-emerald-500 dark:text-white outline-none"
                  required
                />
              </div>
            </div>

            {/* Action submit button */}
            <button
              id="save-match-event-btn"
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-1.5 w-full bg-emerald-500 hover:bg-emerald-600 font-bold py-2.5 rounded-xl text-xs text-white transition disabled:opacity-50 shadow-md shadow-emerald-500/10"
            >
              <Save className="w-4 h-4" /> Save Score Event
            </button>
          </form>
        </div>

        {/* Right timeline display (2 columns wide) */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold uppercase text-neutral-450 tracking-wider flex items-center gap-1.5 border-b pb-2 dark:border-neutral-850">
            <Activity className="w-4 h-4 text-emerald-500" /> Complete Events Timeline
          </h3>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {events.length === 0 ? (
              <div className="text-center p-12 text-xs text-neutral-450 italic">
                Schedules underway. Log events to see a live broadcast timeline here.
              </div>
            ) : (
              [...events]
                .sort((a, b) => b.minute - a.minute)
                .map((evt) => (
                  <div
                    id={`live-event-ticker-${evt.id}`}
                    key={evt.id}
                    className="flex justify-between items-center p-3 rounded-xl border border-neutral-100 dark:border-neutral-805 hover:bg-neutral-50 dark:hover:bg-neutral-850/40 text-xs transition duration-150"
                  >
                    <div className="flex gap-2.5 items-center">
                      <span className="text-sm text-neutral-600 dark:text-neutral-300 font-black font-mono w-6">
                        {evt.minute}'
                      </span>
                      <span className="text-base">{getEventGlyph(evt.type)}</span>

                      <div className="space-y-0.5">
                        <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                          {evt.type === 'goal' && `${evt.playerAName} Goal Score`}
                          {evt.type === 'assist' && `${evt.playerAName} Playmaker Assist`}
                          {evt.type === 'yellow_card' && `${evt.playerAName} Cautions Card`}
                          {evt.type === 'red_card' && `${evt.playerAName} Dismissed Card`}
                          {evt.type === 'own_goal' && 'Own Goal Misplay'}
                          {evt.type === 'substitution' && `Sub OUT: ${evt.playerAName}`}
                        </p>
                        {evt.type === 'goal' && evt.playerBName && (
                          <span className="text-[10px] text-neutral-450 block">Assist: {evt.playerBName}</span>
                        )}
                        {evt.type === 'substitution' && evt.playerBName && (
                          <span className="text-[10px] text-neutral-450 block text-emerald-650">Sub IN: {evt.playerBName}</span>
                        )}
                      </div>
                    </div>

                    <button
                      id={`delete-event-btn-${evt.id}`}
                      onClick={() => handleRemoveEvent(evt.id)}
                      className="p-1 hover:bg-red-50 hover:text-red-650 text-neutral-400 rounded transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto text-xl">
              ⚠️
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-neutral-900 dark:text-white">Conclude Football Match?</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Ending this match will automatically calculate the final scoreboard scores, formulate the winner/loser metrics, update all overall leaderboards, and set the status to "completed".
              </p>
            </div>

            <div className="flex gap-2.5 pt-3">
              <button
                type="button"
                onClick={() => setShowEndModal(false)}
                className="flex-1 py-2 text-xs font-bold border rounded-lg text-neutral-550 bg-neutral-50"
              >
                No, Keep Scoring
              </button>
              <button
                id="confirm-end-match-modal-btn"
                onClick={handleConfirmEndMatch}
                disabled={submitting}
                className="flex-1 py-2 text-xs font-bold bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-50"
              >
                Yes, Finalize League
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
