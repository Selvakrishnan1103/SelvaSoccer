import React, { useState } from 'react';
import { Team, UserProfile, Match } from '../types';
import { 
  Award, 
  Trophy, 
  Search, 
  Flame,
  Zap 
} from 'lucide-react';

interface LeaderboardsProps {
  teams: Team[];
  players: UserProfile[];
  matches: Match[];
}

export default function Leaderboards({
  teams,
  players,
}: LeaderboardsProps) {
  const [activeBoard, setActiveBoard] = useState<'players_goals' | 'players_assists' | 'teams_leaderboard'>('players_goals');
  const [queryName, setQueryName] = useState('');

  // 1. Overall Team Leaderboard (Across all matches)
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsScored - a.goalsConceded;
    const gdB = b.goalsScored - b.goalsConceded;
    if (gdB !== gdA) return gdB - gdA;
    return b.goalsScored - a.goalsScored;
  });

  // 2. Overall Goals Leaderboard (sorted players)
  const sortedGoalsPlayers = players
    .filter(p => p.role !== 'admin' && p.goals > 0)
    .sort((a, b) => b.goals - a.goals);

  // 3. Overall Assists Leaderboard (sorted players)
  const sortedAssistsPlayers = players
    .filter(p => p.role !== 'admin' && p.assists > 0)
    .sort((a, b) => b.assists - a.assists);

  // Helper to resolve player team
  const getPlayerTeam = (playerId: string) => {
    const tm = teams.find((t) => t.playerIds.includes(playerId));
    return tm ? tm.name : 'Unassigned';
  };

  const getPlayerTeamLogo = (playerId: string) => {
    const tm = teams.find((t) => t.playerIds.includes(playerId));
    return tm ? tm.logo : '⚽';
  };

  const filteredGoals = sortedGoalsPlayers.filter(p => p.name.toLowerCase().includes(queryName.toLowerCase()));
  const filteredAssists = sortedAssistsPlayers.filter(p => p.name.toLowerCase().includes(queryName.toLowerCase()));
  const filteredTeams = sortedTeams.filter(t => t.name.toLowerCase().includes(queryName.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      
      {/* Header and Filter Controller */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/50">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Leaderboard Central Ranks
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            System-wide statistics compiling top squads, golden boot leaders, and tactical playmakers.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Search Bar Container */}
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
            <input
              id="leaderboard-search-input"
              type="text"
              placeholder="Search by name..."
              value={queryName}
              onChange={(e) => setQueryName(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
            />
          </div>

          {/* Tab Selection Pill Controller */}
          <div className="flex bg-zinc-200/60 dark:bg-zinc-950 p-1 rounded-xl w-full sm:w-auto border border-zinc-200/20 dark:border-zinc-800/40">
            {[
              { id: 'players_goals', label: 'Golden Goals', icon: Flame },
              { id: 'players_assists', label: 'Playmaker Assists', icon: Zap },
              { id: 'teams_leaderboard', label: 'Top Clubs', icon: Trophy },
            ].map((btn) => {
              const Icon = btn.icon;
              const isActive = activeBoard === btn.id;
              return (
                <button
                  key={btn.id}
                  id={`board-tab-${btn.id}`}
                  onClick={() => {
                    setActiveBoard(btn.id as any);
                    setQueryName('');
                  }}
                  className={`flex-1 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-sm border border-zinc-200/10'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-500' : 'text-zinc-400'}`} />
                  {btn.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Leaderboard Panel */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Goals / Golden Boot Leaderboard */}
        {activeBoard === 'players_goals' && (
          <div className="p-6 space-y-4">
            <h3 className="text-xs font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800/60 pb-3">
              <Award className="w-4 h-4 text-emerald-500 animate-pulse" /> Global Goals Standing (Golden Boot)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-zinc-400 dark:text-zinc-500 uppercase text-[10px] tracking-wider border-b border-zinc-100 dark:border-zinc-800">
                    <th className="py-3 px-4 w-20">Rank</th>
                    <th className="py-3 px-4">Player</th>
                    <th className="py-3 px-4">Rival Club</th>
                    <th className="py-3 px-4 text-center w-28">Matches</th>
                    <th className="py-3 px-4 text-right w-32">Goals Scored</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {filteredGoals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-xs text-zinc-400 dark:text-zinc-500 italic">
                        No golden boots recorded yet. Log goal events during live matches.
                      </td>
                    </tr>
                  ) : (
                    filteredGoals.map((player, index) => (
                      <tr key={player.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/20 transition-colors group">
                        <td className="py-3.5 px-4 font-black font-mono text-zinc-400 dark:text-zinc-500">
                          {index === 0 ? '👑 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : `${index + 1}`}
                        </td>
                        <td className="py-3.5 px-4 font-bold flex items-center gap-2.5">
                          {player.profileImage ? (
                            <img
                              src={player.profileImage}
                              alt={player.name}
                              referrerPolicy="no-referrer"
                              className="w-7 h-7 rounded-full object-cover ring-2 ring-zinc-100 dark:ring-zinc-800"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase">
                              {player.name.charAt(0)}
                            </div>
                          )}
                          <span className="text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-500 transition-colors">{player.name}</span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-zinc-500 dark:text-zinc-400 text-xs">
                          <span className="inline-flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">
                            <span className="text-sm shrink-0">{getPlayerTeamLogo(player.id)}</span> 
                            <span className="truncate max-w-[120px]">{getPlayerTeam(player.id)}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-zinc-600 dark:text-zinc-400 font-semibold">{player.matchesPlayed || 0}</td>
                        <td className="py-3.5 px-4 text-right font-black font-mono text-emerald-600 dark:text-emerald-400 text-base">{player.goals}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Assists Playmaker Leaderboard */}
        {activeBoard === 'players_assists' && (
          <div className="p-6 space-y-4">
            <h3 className="text-xs font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800/60 pb-3">
              <Zap className="w-4 h-4 text-blue-500" /> Playmaker Assists Standing
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-zinc-400 dark:text-zinc-500 uppercase text-[10px] tracking-wider border-b border-zinc-100 dark:border-zinc-800">
                    <th className="py-3 px-4 w-20">Rank</th>
                    <th className="py-3 px-4">Player</th>
                    <th className="py-3 px-4">Rival Club</th>
                    <th className="py-3 px-4 text-center w-28">Matches</th>
                    <th className="py-3 px-4 text-right w-32">Key Assists</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {filteredAssists.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-xs text-zinc-400 dark:text-zinc-500 italic">
                        No playmakers recorded yet. Log assist plays within live game sheets.
                      </td>
                    </tr>
                  ) : (
                    filteredAssists.map((player, index) => (
                      <tr key={player.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/20 transition-colors group">
                        <td className="py-3.5 px-4 font-black font-mono text-zinc-400 dark:text-zinc-500">
                          {index === 0 ? '🏆 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : `${index + 1}`}
                        </td>
                        <td className="py-3.5 px-4 font-bold flex items-center gap-2.5">
                          {player.profileImage ? (
                            <img
                              src={player.profileImage}
                              alt={player.name}
                              referrerPolicy="no-referrer"
                              className="w-7 h-7 rounded-full object-cover ring-2 ring-zinc-100 dark:ring-zinc-800"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase">
                              {player.name.charAt(0)}
                            </div>
                          )}
                          <span className="text-zinc-800 dark:text-zinc-200 group-hover:text-blue-500 transition-colors">{player.name}</span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-zinc-500 dark:text-zinc-400 text-xs">
                          <span className="inline-flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">
                            <span className="text-sm shrink-0">{getPlayerTeamLogo(player.id)}</span> 
                            <span className="truncate max-w-[120px]">{getPlayerTeam(player.id)}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-zinc-600 dark:text-zinc-400 font-semibold">{player.matchesPlayed || 0}</td>
                        <td className="py-3.5 px-4 text-right font-black font-mono text-blue-600 dark:text-blue-400 text-base">{player.assists}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Club Leaderboard Matrix */}
        {activeBoard === 'teams_leaderboard' && (
          <div className="p-6 space-y-4">
            <h3 className="text-xs font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800/60 pb-3">
              <Trophy className="w-4 h-4 text-amber-500" /> Overall Club Standing Matrix
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-center min-w-[600px]">
                <thead>
                  <tr className="text-zinc-400 dark:text-zinc-500 uppercase text-[10px] tracking-wider border-b border-zinc-100 dark:border-zinc-800">
                    <th className="py-3 px-4 text-left w-16">Pos</th>
                    <th className="py-3 px-4 text-left">Club</th>
                    <th className="py-3 px-2 w-12">Pl</th>
                    <th className="py-3 px-2 w-12">W</th>
                    <th className="py-3 px-2 w-12">D</th>
                    <th className="py-3 px-2 w-12">L</th>
                    <th className="py-3 px-2 w-14">GF</th>
                    <th className="py-3 px-2 w-14">GA</th>
                    <th className="py-3 px-2 w-14">GD</th>
                    <th className="py-3 px-4 text-right w-20">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {filteredTeams.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-xs text-zinc-400 dark:text-zinc-500 italic">
                        No registered league squads discovered.
                      </td>
                    </tr>
                  ) : (
                    filteredTeams.map((team, index) => {
                      const gd = team.goalsScored - team.goalsConceded;
                      return (
                        <tr key={team.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/20 text-zinc-700 dark:text-zinc-300 transition-colors">
                          <td className="py-3.5 px-4 text-left font-black font-mono text-zinc-400 dark:text-zinc-500">{index + 1}</td>
                          <td className="py-3.5 px-4 text-left font-bold flex items-center gap-2.5">
                            <span className="text-2xl shrink-0 filter drop-shadow-sm">{team.logo || '⚽'}</span>
                            <span className="text-zinc-900 dark:text-zinc-100 font-extrabold">{team.name}</span>
                          </td>
                          <td className="py-3.5 px-2 font-mono text-zinc-400 dark:text-zinc-500 font-medium">{team.matchesPlayed}</td>
                          <td className="py-3.5 px-2 font-mono text-emerald-600 dark:text-emerald-400 font-bold">{team.wins}</td>
                          <td className="py-3.5 px-2 font-mono text-zinc-400 dark:text-zinc-500 font-medium">{team.draws}</td>
                          <td className="py-3.5 px-2 font-mono text-red-500 dark:text-red-400 font-bold">{team.losses}</td>
                          <td className="py-3.5 px-2 font-mono text-zinc-400 dark:text-zinc-500 font-medium">{team.goalsScored}</td>
                          <td className="py-3.5 px-2 font-mono text-zinc-400 dark:text-zinc-500 font-medium">{team.goalsConceded}</td>
                          <td className={`py-3.5 px-2 font-mono font-bold ${gd > 0 ? 'text-emerald-600 dark:text-emerald-400' : gd < 0 ? 'text-red-500' : 'text-zinc-400'}`}>
                            {gd > 0 ? `+${gd}` : gd}
                          </td>
                          <td className="py-3.5 px-4 text-right font-black font-mono text-zinc-900 dark:text-zinc-50 text-base">{team.points}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}