import React, { useState } from 'react';
import { Match, Team, Tournament, UserProfile, MatchEvent } from '../types';
import { generateFixtures } from '../utils/db';
import { 
  Calendar, 
  Plus, 
  MapPin, 
  Clock, 
  Trophy, 
  Zap, 
  ChevronRight, 
  ChevronLeft, 
  Search, 
  Award, 
  Dribbble, 
  ListOrdered, 
  Users, 
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle
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
  matchEventsMap: Record<string, MatchEvent[]>; // matchId -> events
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

  // Modals
  const [showCreate1v1Modal, setShowCreate1v1Modal] = useState(false);
  const [showCreateTourneyModal, setShowCreateTourneyModal] = useState(false);

  // Filter & Search
  const [matchSearch, setMatchSearch] = useState('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('');

  // 1v1 Form states
  const [formTeamA, setFormTeamA] = useState('');
  const [formTeamB, setFormTeamB] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('17:00');
  const [formVenue, setFormVenue] = useState('Central Turf Arena');
  const [formError1v1, setFormError1v1] = useState('');

  // Tournament Form states
  const [tourneyName, setTourneyName] = useState('');
  const [tourneyDesc, setTourneyDesc] = useState('');
  const [tourneyStart, setTourneyStart] = useState('');
  const [tourneyEnd, setTourneyEnd] = useState('');
  const [tourneyLogo, setTourneyLogo] = useState('🏆');
  const [tourneyFormat, setTourneyFormat] = useState<'round_robin' | 'knockout'>('round_robin');
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [tourneyError, setTourneyError] = useState('');

  // Helpers to fetch team data
  const getTeamLogo = (id: string) => teams.find(t => t.id === id)?.logo || '⚽';
  const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || 'Unknown Team';

  // Filters matches
  const filteredMatches = matches
    .filter((m) => {
      // Don't show tournament matches in the outer list if a tournament drill down is active
      if (m.type === 'tournament' && selectedTournament) return false;

      const searchableString = `${m.teamAName} vs ${m.teamBName} ${m.venue}`.toLowerCase();
      const matchesSearch = searchableString.includes(matchSearch.toLowerCase());
      const matchesTeam = selectedTeamFilter
        ? (m.teamAId === selectedTeamFilter || m.teamBId === selectedTeamFilter)
        : true;
      return matchesSearch && matchesTeam;
    })
    .sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime());

  // Submit 1v1 Form
  const handleCreate1v1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError1v1('');

    if (!formTeamA || !formTeamB) {
      setFormError1v1('Please select both teams.');
      return;
    }
    if (formTeamA === formTeamB) {
      setFormError1v1('Teams must be distinct.');
      return;
    }
    if (!formDate) {
      setFormError1v1('Please enter a match date.');
      return;
    }

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
      scoreB: 0
    };

    onSaveMatch(newMatch);
    setShowCreate1v1Modal(false);
    setFormTeamA('');
    setFormTeamB('');
    setFormDate('');
    setFormVenue('Central Turf Arena');
  };

  // Submit Tournament Form
  const handleCreateTourneySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTourneyError('');

    if (!tourneyName.trim()) {
      setTourneyError('Tournament name is required.');
      return;
    }
    if (selectedTeamIds.length < 2) {
      setTourneyError('A tournament requires at least 2 participating teams.');
      return;
    }
    if (!tourneyStart || !tourneyEnd) {
      setTourneyError('Start and End dates are required.');
      return;
    }

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
      status: 'upcoming'
    };

    // Auto-generate schedules/fixtures
    const teamsMap: Record<string, string> = {};
    const logosMap: Record<string, string> = {};
    teams.forEach(t => {
      teamsMap[t.id] = t.name;
      logosMap[t.id] = t.logo;
    });

    const generatedMatches = generateFixtures(
      newTournamentId, 
      selectedTeamIds, 
      tourneyFormat, 
      teamsMap, 
      logosMap
    );

    onSaveTournament(newTournament, generatedMatches);
    setShowCreateTourneyModal(false);
    // Reset inputs
    setTourneyName('');
    setTourneyDesc('');
    setTourneyStart('');
    setTourneyEnd('');
    setTourneyLogo('🏆');
    setSelectedTeamIds([]);
  };

  const toggleTourneyTeamSelection = (teamId: string) => {
    if (selectedTeamIds.includes(teamId)) {
      setSelectedTeamIds(selectedTeamIds.filter(id => id !== teamId));
    } else {
      setSelectedTeamIds([...selectedTeamIds, teamId]);
    }
  };

  // COMPUTE DYNAMIC POINTS TABLE FOR SELECTED TOURNAMENT
  const getTournamentStats = (tournament: Tournament) => {
    // Collect all matches for this specific tournament
    const tourneyMatches = matches.filter(m => m.tournamentId === tournament.id);
    
    const table: Record<string, {
      teamId: string;
      teamName: string;
      teamLogo: string;
      played: number;
      wins: number;
      draws: number;
      losses: number;
      goalsFor: number;
      goalsAgainst: number;
      goalDifference: number;
      points: number;
    }> = {};

    // Initialize all participating teams
    tournament.participatingTeamIds.forEach(teamId => {
      const tm = teams.find(t => t.id === teamId);
      table[teamId] = {
        teamId,
        teamName: tm?.name || 'Unknown',
        teamLogo: tm?.logo || '⚽',
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0
      };
    });

    // Traverse matches
    tourneyMatches.forEach(m => {
      if (m.status !== 'completed') return;

      const cardA = table[m.teamAId];
      const cardB = table[m.teamBId];

      if (cardA && cardB) {
        cardA.played += 1;
        cardB.played += 1;

        cardA.goalsFor += m.scoreA;
        cardA.goalsAgainst += m.scoreB;
        cardB.goalsFor += m.scoreB;
        cardB.goalsAgainst += m.scoreA;

        if (m.scoreA > m.scoreB) {
          cardA.wins += 1;
          cardA.points += 3;
          cardB.losses += 1;
        } else if (m.scoreB > m.scoreA) {
          cardB.wins += 1;
          cardB.points += 3;
          cardA.losses += 1;
        } else {
          cardA.draws += 1;
          cardA.points += 1;
          cardB.draws += 1;
          cardB.points += 1;
        }

        cardA.goalDifference = cardA.goalsFor - cardA.goalsAgainst;
        cardB.goalDifference = cardB.goalsFor - cardB.goalsAgainst;
      }
    });

    // Convert keys to array and sort: 1.Points, 2.GD, 3.GoalsFor
    return Object.values(table).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
  };

  // GET INDIVIDUAL HIGHLIGHTS OF TOURNAMENT (derived from inside match logs)
  const getTournamentScorers = (tournament: Tournament) => {
    const tourneyMatches = matches.filter(m => m.tournamentId === tournament.id);
    const goalsScorecard: Record<string, { name: string; teamLogo: string; goals: number }> = {};
    const assistsScorecard: Record<string, { name: string; teamLogo: string; assists: number }> = {};

    tourneyMatches.forEach(m => {
      const envs = matchEventsMap[m.id] || [];
      envs.forEach(evt => {
        if (evt.type === 'goal' && evt.playerAId) {
          if (!goalsScorecard[evt.playerAId]) {
            goalsScorecard[evt.playerAId] = { 
              name: evt.playerAName, 
              teamLogo: getTeamLogo(evt.teamId), 
              goals: 0 
            };
          }
          goalsScorecard[evt.playerAId].goals += 1;
        }
        if (evt.type === 'assist' && evt.playerBId) {
          if (!assistsScorecard[evt.playerBId]) {
            assistsScorecard[evt.playerBId] = { 
              name: evt.playerBName || 'Anonymous', 
              teamLogo: getTeamLogo(evt.teamId), 
              assists: 0 
            };
          }
          assistsScorecard[evt.playerBId].assists += 1;
        }
      });
    });

    const topScorers = Object.values(goalsScorecard).sort((a, b) => b.goals - a.goals).slice(0, 5);
    const topAssists = Object.values(assistsScorecard).sort((a, b) => b.assists - a.assists).slice(0, 5);

    return { topScorers, topAssists };
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Drill-down Tournament Detail Page */}
      {selectedTournament ? (
        <div id="tournament-detail-page" className="space-y-6">
          {/* Breadcrumbs Banner */}
          <div className="flex justify-between items-center bg-neutral-900 border border-neutral-800 text-white rounded-2xl p-4 sm:p-6 shadow">
            <div className="flex gap-4 items-center">
              <button
                id="back-to-tourneys-btn"
                onClick={() => setSelectedTournament(null)}
                className="p-2 hover:bg-neutral-800 rounded-xl transition text-emerald-400 font-bold flex items-center gap-1"
              >
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
              <div className="w-1.5 h-8 bg-emerald-500 rounded"></div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2">
                  <span>{selectedTournament.logo}</span> {selectedTournament.name}
                </h1>
                <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1 max-w-lg">
                  {selectedTournament.description || 'Active Football League details'}
                </p>
              </div>
            </div>

            <div className="hidden sm:block text-right">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 block">Season Timeline</span>
              <span className="text-xs font-mono text-neutral-350">{selectedTournament.startDate} - {selectedTournament.endDate}</span>
            </div>
          </div>

          {/* Drill-down content columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Fixtures & Matches */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-500" /> Match Schedules
                </h2>
                <span className="text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-450 px-2.5 py-1 rounded-lg font-semibold">
                  Format: {selectedTournament.format === 'round_robin' ? 'Round Robin Ledger' : 'Standard Knockout'}
                </span>
              </div>

              <div className="space-y-3">
                {matches.filter((m) => m.tournamentId === selectedTournament.id).length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200">
                    No fixtures populated for this tournament.
                  </div>
                ) : (
                  matches
                    .filter((m) => m.tournamentId === selectedTournament.id)
                    .map((m) => (
                      <div
                        id={`drill-tournament-match-${m.id}`}
                        key={m.id}
                        onClick={() => onViewMatchDetails(m.id)}
                        className="p-4 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 rounded-2xl cursor-pointer hover:shadow-sm hover:border-neutral-250 dark:hover:border-neutral-750 transition flex justify-between items-center gap-4"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                            {m.round && <span className="font-bold text-emerald-500">Round {m.round}</span>}
                            <span>•</span>
                            <span>{m.date}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {m.venue}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold flex items-center gap-1">
                              <span>{m.teamALogo || '⚽'}</span> {m.teamAName}
                            </span>
                            {m.status === 'completed' || m.status === 'live' ? (
                              <span className={`px-2 py-0.5 rounded text-xs font-extrabold font-mono tracking-tight ${m.status === 'live' ? 'bg-red-500 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'}`}>
                                {m.scoreA} - {m.scoreB}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-neutral-400 uppercase">VS</span>
                            )}
                            <span className="text-sm font-semibold flex items-center gap-1">
                              <span>{m.teamBLogo || '⚽'}</span> {m.teamBName}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 flex flex-col items-end gap-1.5">
                          {m.status === 'live' ? (
                            <span className="px-2 py-0.5 rounded bg-red-100 text-red-650 text-[10px] font-extrabold uppercase animate-pulse">Live</span>
                          ) : m.status === 'completed' ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase">Completed</span>
                          ) : isAdmin ? (
                            <button
                              id={`start-from-tourney-${m.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onStartMatch(m);
                              }}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition"
                            >
                              Start Match
                            </button>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 text-[10px] font-extrabold uppercase">Scheduled</span>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Right: Points Table & Top Scorers */}
            <div className="space-y-6">
              {/* Dynamic Points Table */}
              <div className="p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
                <h3 className="text-sm font-extrabold uppercase text-neutral-450 tracking-wider flex items-center gap-1.5 border-b pb-2 dark:border-neutral-800">
                  <ListOrdered className="w-4 h-4 text-emerald-500" /> Points Table
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="text-neutral-400 uppercase text-[10px] border-b dark:border-neutral-850">
                        <th className="py-2">Pos</th>
                        <th className="py-2">Club</th>
                        <th className="py-2 text-center">Pl</th>
                        <th className="py-2 text-center">GD</th>
                        <th className="py-2 text-right">Pts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-855">
                      {getTournamentStats(selectedTournament).map((row, idx) => (
                        <tr key={row.teamId} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/20">
                          <td className="py-2.5 font-bold font-mono text-neutral-500">{idx + 1}</td>
                          <td className="py-2.5 font-semibold flex items-center gap-1 max-w-[120px] truncate">
                            <span>{row.teamLogo}</span> {row.teamName}
                          </td>
                          <td className="py-2.5 text-center font-mono text-neutral-600 dark:text-neutral-400">{row.played}</td>
                          <td className="py-2.5 text-center font-mono font-medium text-neutral-800 dark:text-neutral-300">
                            {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                          </td>
                          <td className="py-2.5 text-right font-black text-neutral-950 dark:text-white font-mono">{row.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Scorers derived dynamically */}
              <div className="p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold uppercase text-neutral-450 tracking-wider flex items-center gap-1.5 border-b pb-2 dark:border-neutral-800">
                  <Award className="w-4 h-4 text-emerald-500" /> Tournament Leaderboard
                </h3>

                {/* Scorer blocks */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-2">Goals Golden Boot</span>
                    {getTournamentScorers(selectedTournament).topScorers.length === 0 ? (
                      <span className="text-xs text-neutral-500 italic block">No goals recorded yet in this season.</span>
                    ) : (
                      <div className="space-y-1.5">
                        {getTournamentScorers(selectedTournament).topScorers.map((sl, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs text-neutral-700 dark:text-neutral-300">
                            <span className="font-semibold flex items-center gap-1">
                              <span>{sl.teamLogo}</span> {sl.name}
                            </span>
                            <span className="font-bold text-emerald-600 font-mono bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded">
                              {sl.goals} Goals
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-2">Defense Key Playmaker (Assists)</span>
                    {getTournamentScorers(selectedTournament).topAssists.length === 0 ? (
                      <span className="text-xs text-neutral-500 italic block">No assists recorded yet.</span>
                    ) : (
                      <div className="space-y-1.5">
                        {getTournamentScorers(selectedTournament).topAssists.map((sl, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs text-neutral-700 dark:text-neutral-300">
                            <span className="font-semibold flex items-center gap-1">
                              <span>{sl.teamLogo}</span> {sl.name}
                            </span>
                            <span className="font-bold text-blue-600 font-mono bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded">
                              {sl.assists} Assists
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
        </div>
      ) : (
        /* Default view lists general matches and tournaments tabs */
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                Match & Tournament Board
              </h1>
              <p className="text-sm text-neutral-500">
                Browse direct 1v1 matchups, active cups, or schedule new tournaments.
              </p>
            </div>

            {/* Selector Tab pills */}
            <div className="flex bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl w-full sm:w-auto">
              <button
                id="matches-sub-tab"
                onClick={() => setActiveSubTab('matches')}
                className={`flex-1 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeSubTab === 'matches'
                    ? 'bg-white dark:bg-neutral-850 text-neutral-900 dark:text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Dribbble className="w-3.5 h-3.5" /> Matches
              </button>
              <button
                id="tournaments-sub-tab"
                onClick={() => setActiveSubTab('tournaments')}
                className={`flex-1 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeSubTab === 'tournaments'
                    ? 'bg-white dark:bg-neutral-850 text-neutral-905 dark:text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" /> Tournaments
              </button>
            </div>
          </div>

          {activeSubTab === 'matches' ? (
            /* Direct One vs One Matches Ledger */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-between">
                {/* Filters */}
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-400" />
                    <input
                      id="inner-match-search"
                      type="text"
                      placeholder="Search venue or teams..."
                      value={matchSearch}
                      onChange={(e) => setMatchSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.8 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:border-emerald-500 w-48 sm:w-60 dark:text-white"
                    />
                  </div>

                  <select
                    id="team-filter-select"
                    value={selectedTeamFilter}
                    onChange={(e) => setSelectedTeamFilter(e.target.value)}
                    className="px-2 py-1.8 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none dark:text-white"
                  >
                    <option value="">-- All Teams --</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {isAdmin && (
                  <button
                    id="schedule-1v1-btn"
                    onClick={() => setShowCreate1v1Modal(true)}
                    className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-1.8 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-500/10"
                  >
                    <Plus className="w-3.5 h-3.5" /> Schedule 1v1 Match
                  </button>
                )}
              </div>

              {/* Grid of Matches */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMatches.length === 0 ? (
                  <div className="md:col-span-2 p-12 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-500">
                    No matching scheduled match fixtures found.
                  </div>
                ) : (
                  filteredMatches.map((m) => (
                    <div
                      id={`match-block-${m.id}`}
                      key={m.id}
                      onClick={() => onViewMatchDetails(m.id)}
                      className="p-5 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 rounded-2xl cursor-pointer hover:shadow-md transition-all space-y-4"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className={`px-2 py-0.5 rounded font-extrabold uppercase text-[9px] tracking-wider ${m.type === 'tournament' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-blue-105 text-blue-705 dark:bg-blue-950/40'}`}>
                          {m.type === 'tournament' ? 'League Round' : 'Simple Match'}
                        </span>
                        <span className="text-neutral-500 dark:text-neutral-450 font-medium flex items-center gap-0.5 font-mono">
                          <MapPin className="w-3 h-3" /> {m.venue}
                        </span>
                      </div>

                      <div className="grid grid-cols-7 items-center text-center">
                        <div className="col-span-2 flex flex-col items-center gap-1.5">
                          <span className="text-2xl">{m.teamALogo || '⚽'}</span>
                          <span className="text-xs font-bold text-neutral-800 dark:text-white line-clamp-1">{m.teamAName}</span>
                        </div>

                        <div className="col-span-3 flex flex-col items-center justify-center gap-1">
                          {m.status === 'completed' || m.status === 'live' ? (
                            <span className="text-xl font-black font-mono tracking-tight text-neutral-950 dark:text-white">
                              {m.scoreA} - {m.scoreB}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-neutral-450 uppercase">VS</span>
                          )}
                          <span className="text-[10px] font-mono text-neutral-400">{m.date} {m.time}</span>
                        </div>

                        <div className="col-span-2 flex flex-col items-center gap-1.5">
                          <span className="text-2xl">{m.teamBLogo || '⚽'}</span>
                          <span className="text-xs font-bold text-neutral-800 dark:text-white line-clamp-1">{m.teamBName}</span>
                        </div>
                      </div>

                      <div className="border-t border-neutral-100 dark:border-neutral-850 pt-3 flex justify-between items-center text-xs">
                        <span className="text-neutral-400 font-medium scale-95 origin-left">
                          Score metrics detailed
                        </span>

                        <div>
                          {m.status === 'live' ? (
                            <span className="text-xs text-red-500 font-semibold uppercase animate-pulse">Live Now</span>
                          ) : m.status === 'completed' ? (
                            <span className="text-xs text-emerald-500 font-semibold flex items-center gap-0.5">Completed <Sparkles className="w-3 h-3" /></span>
                          ) : isAdmin ? (
                            <button
                              id={`matches-list-start-btn-${m.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onStartMatch(m);
                              }}
                              className="text-[10px] bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-2.5 py-1.2 rounded-lg transition"
                            >
                              Start Match
                            </button>
                          ) : (
                            <span className="text-xs text-neutral-450 uppercase font-bold">Scheduled</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* Tournaments Season Ledger */
            <div className="space-y-4">
              {isAdmin && (
                <div className="flex justify-end">
                  <button
                    id="create-tournament-btn"
                    onClick={() => setShowCreateTourneyModal(true)}
                    className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-500/10"
                  >
                    <Plus className="w-4 h-4" /> Assemble Tournament Season
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {tournaments.length === 0 ? (
                  <div className="md:col-span-3 p-12 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 text-neutral-500 text-sm">
                    No tournaments have been assembled yet.
                  </div>
                ) : (
                  tournaments.map((t) => (
                    <div
                      id={`tournament-block-${t.id}`}
                      key={t.id}
                      onClick={() => setSelectedTournament(t)}
                      className="p-5 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 rounded-3xl cursor-pointer hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-955/20 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="text-4xl p-3 bg-neutral-50 dark:bg-neutral-800 rounded-2xl">
                            {t.logo || '🏆'}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${t.status === 'ongoing' ? 'bg-emerald-100 text-emerald-700' : t.status === 'completed' ? 'bg-neutral-100 text-neutral-600' : 'bg-blue-105 text-blue-705'}`}>
                            {t.status}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h3 className="font-extrabold text-neutral-900 dark:text-white tracking-tight leading-snug">{t.name}</h3>
                          {t.description && (
                            <p className="text-xs text-neutral-450 line-clamp-2 leading-relaxed">
                              {t.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-neutral-100 dark:border-neutral-850 pt-3 mt-4 flex items-center justify-between text-xs">
                        <span className="text-neutral-400 font-mono">
                          {t.participatingTeamIds.length} Teams Registered
                        </span>
                        <span className="text-emerald-500 font-bold flex items-center gap-0.5">
                          Season Details <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Direct 1v1 Scheduler Modal */}
      {showCreate1v1Modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-md shadow-2xl animate-scale-in p-6 space-y-4">
            <div>
              <h3 className="text-lg font-black text-neutral-900 dark:text-white">Schedule 1v1 Clash</h3>
              <p className="text-xs text-neutral-570 dark:text-neutral-430">Setup a friendly kickoff between two registered rosters.</p>
            </div>

            {formError1v1 && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-650 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {formError1v1}
              </div>
            )}

            <form onSubmit={handleCreate1v1Submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Team A (Home)</label>
                  <select
                    id="team-a-select"
                    value={formTeamA}
                    onChange={(e) => setFormTeamA(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:border-emerald-500 dark:text-white outline-none"
                    required
                  >
                    <option value="">-- Select --</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Team B (Away)</label>
                  <select
                    id="team-b-select"
                    value={formTeamB}
                    onChange={(e) => setFormTeamB(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:border-emerald-500 dark:text-white outline-none"
                    required
                  >
                    <option value="">-- Select --</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Kickoff Date</label>
                <input
                  id="kickoff-date-input"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-xl dark:text-white outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Kickoff Time</label>
                  <input
                    id="kickoff-time-input"
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-xl dark:text-white outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Match Venue</label>
                  <input
                    id="kickoff-venue-input"
                    type="text"
                    value={formVenue}
                    onChange={(e) => setFormVenue(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-xl dark:text-white outline-none animate-custom-fade"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreate1v1Modal(false)}
                  className="flex-1 py-2 text-xs font-bold text-neutral-550 border rounded-lg hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  id="submit-clash-btn"
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 shadow-md shadow-emerald-500/10"
                >
                  Schedule Match
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assemble Tournament Season Modal */}
      {showCreateTourneyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl animate-scale-in">
            <div className="p-6 border-b flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-lg font-black text-neutral-900 dark:text-white font-sans">Assemble Tournament</h3>
                <p className="text-xs text-neutral-500">Form league schedules and auto-calculate standings.</p>
              </div>
              <button
                id="close-tourney-modal-btn"
                onClick={() => setShowCreateTourneyModal(false)}
                className="p-1 hover:bg-neutral-100 rounded"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleCreateTourneySubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {tourneyError && (
                <div className="p-3 bg-red-50 text-red-650 text-xs rounded-xl flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="w-4 h-4" /> {tourneyError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Tournament Name</label>
                <input
                  id="tourney-name-input"
                  type="text"
                  placeholder="e.g. Royal Champions League"
                  value={tourneyName}
                  onChange={(e) => setTourneyName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:border-emerald-500 dark:text-white outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase">Season Description</label>
                <textarea
                  id="tourney-desc-textarea"
                  rows={2}
                  placeholder="League outline or summary rules..."
                  value={tourneyDesc}
                  onChange={(e) => setTourneyDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:border-emerald-500 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Start Date</label>
                  <input
                    id="tourney-start-input"
                    type="date"
                    value={tourneyStart}
                    onChange={(e) => setTourneyStart(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-xl dark:text-white outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">End Date</label>
                  <input
                    id="tourney-end-input"
                    type="date"
                    value={tourneyEnd}
                    onChange={(e) => setTourneyEnd(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-xl dark:text-white outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Tournament Logo Emoji</label>
                  <select
                    id="tourney-logo-select"
                    value={tourneyLogo}
                    onChange={(e) => setTourneyLogo(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-xl dark:text-white outline-none"
                  >
                    <option value="🏆">🏆 Golden Cup</option>
                    <option value="👑">👑 Crown Trophy</option>
                    <option value="🛡️">🛡️ Shield Banner</option>
                    <option value="🌟">🌟 Star Series</option>
                    <option value="🔥">🔥 Flame Masters</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Tournament Format</label>
                  <select
                    id="tourney-format-select"
                    value={tourneyFormat}
                    onChange={(e) => setTourneyFormat(e.target.value as 'round_robin' | 'knockout')}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-xl dark:text-white outline-none"
                  >
                    <option value="round_robin">Round Robin (League)</option>
                    <option value="knockout">Knockout Tournament</option>
                  </select>
                </div>
              </div>

              {/* Select Participators */}
              <div className="space-y-1.5 border-t pt-3">
                <label className="text-[10px] font-bold text-neutral-400 uppercase block">Select Participating Teams</label>
                <div className="space-y-1 max-h-40 overflow-y-auto border p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 bg-opacity-40">
                  {teams.length === 0 ? (
                    <span className="text-xs text-neutral-500 italic">No squads registered. Register squads first.</span>
                  ) : (
                    teams.map((tm) => {
                      const isSelected = selectedTeamIds.includes(tm.id);
                      return (
                        <label
                          key={tm.id}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-850 cursor-pointer select-none text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleTourneyTeamSelection(tm.id)}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="font-semibold flex items-center gap-1">
                            <span>{tm.logo}</span> {tm.name}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex gap-2.5 pt-4 border-t shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCreateTourneyModal(false)}
                  className="flex-1 py-2 text-xs font-bold text-neutral-550 border rounded-xl hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  id="submit-tourney-btn"
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 shadow-md shadow-emerald-500/10"
                >
                  Assemble League
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
