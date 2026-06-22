import React, { useState } from 'react';
import { Match, Team, Tournament, UserProfile, MatchEvent } from '../types';
import { generateFixtures } from '../utils/db';
import {
  Calendar,
  Plus,
  MapPin,
  Trophy,
  ChevronRight,
  ChevronLeft,
  Search,
  Award,
  ListOrdered,
  X,
  Sparkles,
  AlertTriangle,
  Zap,
} from 'lucide-react';

interface MatchManagementProps {
  matches: Match[];
  teams: Team[];
  tournaments: Tournament[];
  players: UserProfile[];
  isAdmin: boolean;
  onSaveMatch: (match: Match) => void;
  onSaveTournament: (tournament: Tournament, fixtures: Match[]) => void;
  onStartMatch: (match: Match) => void;
  onViewMatchDetails: (matchId: string) => void;
  matchEventsMap: Record<string, MatchEvent[]>;
}

export default function MatchManagement({
  matches,
  teams,
  tournaments,
  players,
  isAdmin,
  onSaveMatch,
  onSaveTournament,
  onStartMatch,
  onViewMatchDetails,
  matchEventsMap,
}: MatchManagementProps) {
  const [activeSubTab, setActiveSubTab] = useState<'matches' | 'tournaments'>('matches');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  const [showCreate1v1Modal, setShowCreate1v1Modal] = useState(false);
  const [showCreateTourneyModal, setShowCreateTourneyModal] = useState(false);

  const [matchSearch, setMatchSearch] = useState('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('');

  const [formTeamA, setFormTeamA] = useState('');
  const [formTeamB, setFormTeamB] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('17:00');
  const [formVenue, setFormVenue] = useState('Central Turf Arena');
  const [formError1v1, setFormError1v1] = useState('');

  const [tourneyName, setTourneyName] = useState('');
  const [tourneyDesc, setTourneyDesc] = useState('');
  const [tourneyStart, setTourneyStart] = useState('');
  const [tourneyEnd, setTourneyEnd] = useState('');
  const [tourneyLogo, setTourneyLogo] = useState('🏆');
  const [tourneyFormat, setTourneyFormat] = useState<'round_robin' | 'knockout'>('round_robin');
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [tourneyError, setTourneyError] = useState('');

  const getTeamLogo = (id: string) => teams.find(t => t.id === id)?.logo || '⚽';
  const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || 'Unknown Team';

  const filteredMatches = matches
    .filter(m => {
      if (m.type === 'tournament' && selectedTournament) return false;
      const s = `${m.teamAName} vs ${m.teamBName} ${m.venue}`.toLowerCase();
      const matchesSearch = s.includes(matchSearch.toLowerCase());
      const matchesTeam = selectedTeamFilter
        ? m.teamAId === selectedTeamFilter || m.teamBId === selectedTeamFilter
        : true;
      return matchesSearch && matchesTeam;
    })
    .sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime());

  const handleCreate1v1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError1v1('');
    if (!formTeamA || !formTeamB) return setFormError1v1('Please select both teams.');
    if (formTeamA === formTeamB) return setFormError1v1('Teams must be distinct.');
    if (!formDate) return setFormError1v1('Please enter a match date.');

    const teamA = teams.find(t => t.id === formTeamA)!;
    const teamB = teams.find(t => t.id === formTeamB)!;
    const newMatch: Match = {
      id: `match_1v1_${Date.now()}`,
      type: 'one_vs_one',
      teamAId: formTeamA,
      teamBId: formTeamB,
      teamAName: teamA.name,
      teamBName: teamB.name,
      teamALogo: teamA.logo,
      teamBLogo: teamB.logo,
      date: formDate,
      time: formTime,
      venue: formVenue.trim() || 'Central Turf Arena',
      status: 'scheduled',
      scoreA: 0,
      scoreB: 0,
    };
    onSaveMatch(newMatch);
    setShowCreate1v1Modal(false);
    setFormTeamA(''); setFormTeamB(''); setFormDate(''); setFormVenue('Central Turf Arena');
  };

  const handleCreateTourneySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTourneyError('');
    if (!tourneyName.trim()) return setTourneyError('Tournament name is required.');
    if (selectedTeamIds.length < 2) return setTourneyError('At least 2 teams required.');
    if (!tourneyStart || !tourneyEnd) return setTourneyError('Start and end dates are required.');

    const newTournamentId = `tourney_${Date.now()}`;
    const newTournament: Tournament = {
      id: newTournamentId,
      name: tourneyName.trim(),
      description: tourneyDesc.trim(),
      startDate: tourneyStart,
      endDate: tourneyEnd,
      logo: tourneyLogo,
      format: tourneyFormat,
      participatingTeamIds: selectedTeamIds,
      status: 'upcoming',
    };

    const teamsMap: Record<string, string> = {};
    const logosMap: Record<string, string> = {};
    teams.forEach(t => { teamsMap[t.id] = t.name; logosMap[t.id] = t.logo; });

    const generatedMatches = generateFixtures(newTournamentId, selectedTeamIds, tourneyFormat, teamsMap, logosMap);
    onSaveTournament(newTournament, generatedMatches);
    setShowCreateTourneyModal(false);
    setTourneyName(''); setTourneyDesc(''); setTourneyStart(''); setTourneyEnd('');
    setTourneyLogo('🏆'); setSelectedTeamIds([]);
  };

  const toggleTourneyTeamSelection = (teamId: string) => {
    setSelectedTeamIds(prev =>
      prev.includes(teamId) ? prev.filter(id => id !== teamId) : [...prev, teamId]
    );
  };

  const getTournamentStats = (tournament: Tournament) => {
    const tourneyMatches = matches.filter(m => m.tournamentId === tournament.id);
    const table: Record<string, {
      teamId: string; teamName: string; teamLogo: string;
      played: number; wins: number; draws: number; losses: number;
      goalsFor: number; goalsAgainst: number; goalDifference: number; points: number;
    }> = {};

    tournament.participatingTeamIds.forEach(teamId => {
      const tm = teams.find(t => t.id === teamId);
      table[teamId] = {
        teamId, teamName: tm?.name || 'Unknown', teamLogo: tm?.logo || '⚽',
        played: 0, wins: 0, draws: 0, losses: 0,
        goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
      };
    });

    tourneyMatches.forEach(m => {
      if (m.status !== 'completed') return;
      const cardA = table[m.teamAId];
      const cardB = table[m.teamBId];
      if (!cardA || !cardB) return;
      cardA.played += 1; cardB.played += 1;
      cardA.goalsFor += m.scoreA; cardA.goalsAgainst += m.scoreB;
      cardB.goalsFor += m.scoreB; cardB.goalsAgainst += m.scoreA;
      if (m.scoreA > m.scoreB) { cardA.wins += 1; cardA.points += 3; cardB.losses += 1; }
      else if (m.scoreB > m.scoreA) { cardB.wins += 1; cardB.points += 3; cardA.losses += 1; }
      else { cardA.draws += 1; cardA.points += 1; cardB.draws += 1; cardB.points += 1; }
      cardA.goalDifference = cardA.goalsFor - cardA.goalsAgainst;
      cardB.goalDifference = cardB.goalsFor - cardB.goalsAgainst;
    });

    return Object.values(table).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
  };

  const getTournamentScorers = (tournament: Tournament) => {
    const tourneyMatches = matches.filter(m => m.tournamentId === tournament.id);
    const goalsScorecard: Record<string, { name: string; teamLogo: string; goals: number }> = {};
    const assistsScorecard: Record<string, { name: string; teamLogo: string; assists: number }> = {};

    tourneyMatches.forEach(m => {
      const envs = matchEventsMap[m.id] || [];
      envs.forEach(evt => {
        if (evt.type === 'goal' && evt.playerAId) {
          if (!goalsScorecard[evt.playerAId])
            goalsScorecard[evt.playerAId] = { name: evt.playerAName, teamLogo: getTeamLogo(evt.teamId), goals: 0 };
          goalsScorecard[evt.playerAId].goals += 1;
        }
        if (evt.type === 'assist' && evt.playerBId) {
          if (!assistsScorecard[evt.playerBId])
            assistsScorecard[evt.playerBId] = { name: evt.playerBName || 'Anonymous', teamLogo: getTeamLogo(evt.teamId), assists: 0 };
          assistsScorecard[evt.playerBId].assists += 1;
        }
      });
    });

    return {
      topScorers: Object.values(goalsScorecard).sort((a, b) => b.goals - a.goals).slice(0, 5),
      topAssists: Object.values(assistsScorecard).sort((a, b) => b.assists - a.assists).slice(0, 5),
    };
  };

  // ─── Shared input classes ────────────────────────────────────────────────
  const inputCls =
    'w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-emerald-500 dark:text-white transition-colors';
  const labelCls = 'block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1';

  // ─── Status badge helper ─────────────────────────────────────────────────
  const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, string> = {
      live: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 animate-pulse',
      completed: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
      scheduled: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500',
      ongoing: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
      upcoming: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${map[status] ?? map.scheduled}`}>
        {status}
      </span>
    );
  };

  // ─── Match card ──────────────────────────────────────────────────────────
  const MatchCard = ({ m }: { m: Match }) => (
    <div
      onClick={() => onViewMatchDetails(m.id)}
      className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm transition-all duration-150 space-y-4"
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
          m.type === 'tournament'
            ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
            : 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
        }`}>
          {m.type === 'tournament' ? 'League' : 'Friendly'}
        </span>
        <span className="flex items-center gap-1 text-[11px] text-neutral-400">
          <MapPin className="w-3 h-3" /> {m.venue}
        </span>
      </div>

      {/* Teams */}
      <div className="grid grid-cols-7 items-center">
        <div className="col-span-3 flex flex-col items-center gap-1.5">
          <span className="text-3xl">{m.teamALogo || '⚽'}</span>
          <span className="text-xs font-semibold text-center text-neutral-800 dark:text-white line-clamp-1">{m.teamAName}</span>
        </div>
        <div className="col-span-1 flex flex-col items-center gap-1">
          {(m.status === 'completed' || m.status === 'live') ? (
            <span className="text-lg font-bold font-mono text-neutral-900 dark:text-white tracking-tight">
              {m.scoreA}–{m.scoreB}
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-neutral-400 uppercase">vs</span>
          )}
          <span className="text-[10px] font-mono text-neutral-400">{m.time}</span>
        </div>
        <div className="col-span-3 flex flex-col items-center gap-1.5">
          <span className="text-3xl">{m.teamBLogo || '⚽'}</span>
          <span className="text-xs font-semibold text-center text-neutral-800 dark:text-white line-clamp-1">{m.teamBName}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 flex items-center justify-between">
        <span className="flex items-center gap-1 text-[11px] text-neutral-400 font-mono">
          <Calendar className="w-3 h-3" /> {m.date}
        </span>
        <div>
          {m.status === 'live' ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-red-500 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" /> Live
            </span>
          ) : m.status === 'completed' ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500">
              <Sparkles className="w-3 h-3" /> Final
            </span>
          ) : isAdmin ? (
            <button
              onClick={e => { e.stopPropagation(); onStartMatch(m); }}
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              Start match
            </button>
          ) : (
            <StatusBadge status="scheduled" />
          )}
        </div>
      </div>
    </div>
  );

  // ─── Tournament card ─────────────────────────────────────────────────────
  const TournamentCard = ({ t }: { t: Tournament }) => (
    <div
      onClick={() => setSelectedTournament(t)}
      className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm transition-all duration-150 flex flex-col gap-4"
    >
      <div className="flex items-start justify-between">
        <span className="text-4xl bg-neutral-50 dark:bg-neutral-800 p-3 rounded-xl leading-none">{t.logo || '🏆'}</span>
        <StatusBadge status={t.status} />
      </div>
      <div>
        <h3 className="font-semibold text-neutral-900 dark:text-white leading-snug">{t.name}</h3>
        {t.description && (
          <p className="text-xs text-neutral-500 mt-1 leading-relaxed line-clamp-2">{t.description}</p>
        )}
      </div>
      <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 flex items-center justify-between">
        <span className="text-xs text-neutral-400">{t.participatingTeamIds.length} teams registered</span>
        <span className="text-xs font-semibold text-emerald-500 flex items-center gap-0.5">
          Season details <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );

  // ─── Tournament detail ───────────────────────────────────────────────────
  if (selectedTournament) {
    const stats = getTournamentStats(selectedTournament);
    const { topScorers, topAssists } = getTournamentScorers(selectedTournament);
    const tourneyMatches = matches.filter(m => m.tournamentId === selectedTournament.id);

    return (
      <div className="space-y-6 pb-16">
        {/* Breadcrumb banner */}
        <div className="flex justify-between items-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-5 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedTournament(null)}
              className="flex items-center gap-1 text-sm font-semibold text-emerald-500 hover:text-emerald-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />
            <div>
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <span>{selectedTournament.logo}</span> {selectedTournament.name}
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">{selectedTournament.description || 'Tournament details'}</p>
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">Timeline</p>
            <p className="text-xs font-mono text-neutral-500">{selectedTournament.startDate} – {selectedTournament.endDate}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fixtures */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-500" /> Match schedule
              </h2>
              <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 px-2.5 py-1 rounded-lg font-semibold uppercase tracking-wider">
                {selectedTournament.format === 'round_robin' ? 'Round robin' : 'Knockout'}
              </span>
            </div>

            <div className="space-y-2.5">
              {tourneyMatches.length === 0 ? (
                <div className="p-10 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-sm text-neutral-400">
                  No fixtures generated yet.
                </div>
              ) : (
                tourneyMatches.map(m => (
                  <div
                    key={m.id}
                    onClick={() => onViewMatchDetails(m.id)}
                    className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                        {m.round && <span className="font-semibold text-emerald-500">Round {m.round}</span>}
                        <span>·</span>
                        <span>{m.date}</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" /> {m.venue}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-semibold text-neutral-800 dark:text-white">
                        <span>{m.teamALogo} {m.teamAName}</span>
                        {(m.status === 'completed' || m.status === 'live') ? (
                          <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${m.status === 'live' ? 'bg-red-500 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'}`}>
                            {m.scoreA} – {m.scoreB}
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-neutral-400">VS</span>
                        )}
                        <span>{m.teamBLogo} {m.teamBName}</span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {m.status === 'live' ? (
                        <StatusBadge status="live" />
                      ) : m.status === 'completed' ? (
                        <StatusBadge status="completed" />
                      ) : isAdmin ? (
                        <button
                          onClick={e => { e.stopPropagation(); onStartMatch(m); }}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Start match
                        </button>
                      ) : (
                        <StatusBadge status="scheduled" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">
            {/* Points table */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 mb-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <ListOrdered className="w-3.5 h-3.5 text-emerald-500" /> Points table
              </h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-[10px] text-neutral-400 uppercase tracking-wider border-b border-neutral-100 dark:border-neutral-800">
                    <th className="pb-2 text-left font-semibold">Pos</th>
                    <th className="pb-2 text-left font-semibold">Club</th>
                    <th className="pb-2 text-center font-semibold">P</th>
                    <th className="pb-2 text-center font-semibold">GD</th>
                    <th className="pb-2 text-right font-semibold">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
                  {stats.map((row, idx) => (
                    <tr key={row.teamId} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                      <td className="py-2.5 font-mono text-neutral-400">{idx + 1}</td>
                      <td className="py-2.5 font-medium flex items-center gap-1 max-w-[100px] truncate">
                        <span>{row.teamLogo}</span> {row.teamName}
                      </td>
                      <td className="py-2.5 text-center font-mono text-neutral-500">{row.played}</td>
                      <td className="py-2.5 text-center font-mono text-neutral-600 dark:text-neutral-300">
                        {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                      </td>
                      <td className="py-2.5 text-right font-bold font-mono text-neutral-900 dark:text-white">{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Leaderboard */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <Award className="w-3.5 h-3.5 text-emerald-500" /> Leaderboard
              </h3>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">Top scorers</p>
                {topScorers.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic">No goals recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {topScorers.map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 font-medium text-neutral-700 dark:text-neutral-300">
                          <span>{s.teamLogo}</span> {s.name}
                        </span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded">
                          {s.goals}G
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">Top assists</p>
                {topAssists.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic">No assists recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {topAssists.map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 font-medium text-neutral-700 dark:text-neutral-300">
                          <span>{s.teamLogo}</span> {s.name}
                        </span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400 font-mono bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded">
                          {s.assists}A
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main board ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Match & Tournament Board</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Browse 1v1 matchups, active cups, or schedule new seasons.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => activeSubTab === 'matches' ? setShowCreate1v1Modal(true) : setShowCreateTourneyModal(true)}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            {activeSubTab === 'matches' ? 'Schedule 1v1 match' : 'New tournament'}
          </button>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex bg-neutral-100 dark:bg-neutral-800/60 p-1 rounded-xl w-full sm:w-64">
        {(['matches', 'tournaments'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
              activeSubTab === tab
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Matches tab */}
      {activeSubTab === 'matches' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search teams or venue…"
                value={matchSearch}
                onChange={e => setMatchSearch(e.target.value)}
                className="pl-8 pr-3 py-2 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-emerald-500 w-52 dark:text-white transition-colors"
              />
            </div>
            <select
              value={selectedTeamFilter}
              onChange={e => setSelectedTeamFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none dark:text-white"
            >
              <option value="">All teams</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          {/* Match grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMatches.length === 0 ? (
              <div className="md:col-span-2 p-12 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-sm text-neutral-400">
                No matches found.
              </div>
            ) : (
              filteredMatches.map(m => <MatchCard key={m.id} m={m} />)
            )}
          </div>
        </div>
      )}

      {/* Tournaments tab */}
      {activeSubTab === 'tournaments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournaments.length === 0 ? (
            <div className="md:col-span-3 p-12 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-sm text-neutral-400">
              No tournaments yet. Create your first season.
            </div>
          ) : (
            tournaments.map(t => <TournamentCard key={t.id} t={t} />)
          )}
        </div>
      )}

      {/* ── 1v1 Modal ───────────────────────────────────────────────────────── */}
      {showCreate1v1Modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">Schedule 1v1 match</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Set up a friendly kickoff between two registered squads.</p>
              </div>
              <button onClick={() => setShowCreate1v1Modal(false)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            </div>

            {formError1v1 && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs rounded-xl">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {formError1v1}
              </div>
            )}

            <form onSubmit={handleCreate1v1Submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Team A (home)</label>
                  <select value={formTeamA} onChange={e => setFormTeamA(e.target.value)} className={inputCls} required>
                    <option value="">Select team</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Team B (away)</label>
                  <select value={formTeamB} onChange={e => setFormTeamB(e.target.value)} className={inputCls} required>
                    <option value="">Select team</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>Kickoff date</label>
                <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className={inputCls} required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Kickoff time</label>
                  <input type="time" value={formTime} onChange={e => setFormTime(e.target.value)} className={inputCls} required />
                </div>
                <div>
                  <label className={labelCls}>Venue</label>
                  <input type="text" value={formVenue} onChange={e => setFormVenue(e.target.value)} className={inputCls} required />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowCreate1v1Modal(false)}
                  className="flex-1 py-2 text-sm font-semibold text-neutral-500 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors"
                >
                  Schedule match
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Tournament Modal ─────────────────────────────────────────────────── */}
      {showCreateTourneyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
            {/* Modal header */}
            <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">Create tournament</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Auto-generate fixtures and track standings.</p>
              </div>
              <button onClick={() => setShowCreateTourneyModal(false)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleCreateTourneySubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {tourneyError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs rounded-xl">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {tourneyError}
                </div>
              )}

              <div>
                <label className={labelCls}>Tournament name</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Champions League"
                  value={tourneyName}
                  onChange={e => setTourneyName(e.target.value)}
                  className={inputCls}
                  required
                />
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  rows={2}
                  placeholder="League summary or rules…"
                  value={tourneyDesc}
                  onChange={e => setTourneyDesc(e.target.value)}
                  className={inputCls + ' resize-none'}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Start date</label>
                  <input type="date" value={tourneyStart} onChange={e => setTourneyStart(e.target.value)} className={inputCls} required />
                </div>
                <div>
                  <label className={labelCls}>End date</label>
                  <input type="date" value={tourneyEnd} onChange={e => setTourneyEnd(e.target.value)} className={inputCls} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Logo emoji</label>
                  <select value={tourneyLogo} onChange={e => setTourneyLogo(e.target.value)} className={inputCls}>
                    <option value="🏆">🏆 Golden Cup</option>
                    <option value="👑">👑 Crown Trophy</option>
                    <option value="🛡️">🛡️ Shield Banner</option>
                    <option value="🌟">🌟 Star Series</option>
                    <option value="🔥">🔥 Flame Masters</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Format</label>
                  <select value={tourneyFormat} onChange={e => setTourneyFormat(e.target.value as 'round_robin' | 'knockout')} className={inputCls}>
                    <option value="round_robin">Round robin</option>
                    <option value="knockout">Knockout</option>
                  </select>
                </div>
              </div>

              {/* Team picker */}
              <div>
                <label className={labelCls}>Participating teams</label>
                <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
                  {teams.length === 0 ? (
                    <p className="text-xs text-neutral-400 italic p-3">No squads registered yet.</p>
                  ) : (
                    <div className="max-h-40 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
                      {teams.map(tm => {
                        const checked = selectedTeamIds.includes(tm.id);
                        return (
                          <label
                            key={tm.id}
                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleTourneyTeamSelection(tm.id)}
                              className="rounded text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                            />
                            <span className="text-sm font-medium text-neutral-800 dark:text-white flex items-center gap-1.5">
                              <span>{tm.logo}</span> {tm.name}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
                {selectedTeamIds.length > 0 && (
                  <p className="text-[11px] text-emerald-500 font-medium mt-1.5">{selectedTeamIds.length} team{selectedTeamIds.length > 1 ? 's' : ''} selected</p>
                )}
              </div>

              <div className="flex gap-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowCreateTourneyModal(false)}
                  className="flex-1 py-2 text-sm font-semibold text-neutral-500 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors"
                >
                  Create tournament
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}