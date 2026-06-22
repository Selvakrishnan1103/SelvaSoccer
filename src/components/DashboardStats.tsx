import { Team, Match, Tournament, UserProfile } from '../types';
import { 
  Users, 
  Calendar, 
  Trophy, 
  Clock, 
  Activity, 
  ArrowRight, 
  Plus, 
  MapPin, 
  Sparkles,
  Zap
} from 'lucide-react';

interface DashboardStatsProps {
  teams: Team[];
  players: UserProfile[];
  matches: Match[];
  tournaments: Tournament[];
  isAdmin: boolean;
  onStartMatch: (match: Match) => void;
  onViewMatchDetails: (matchId: string) => void;
  setActiveTab: (tab: string) => void;
  onOpenCreateMatchModal: () => void;
  onOpenCreateTeamModal: () => void;
  onOpenCreateTournamentModal: () => void;
}

export default function DashboardStats({
  teams,
  players,
  matches,
  tournaments,
  isAdmin,
  onStartMatch,
  onViewMatchDetails,
  setActiveTab,
  onOpenCreateMatchModal,
  onOpenCreateTeamModal,
}: DashboardStatsProps) {
  // Compute basic aggregates
  const totalTeams = teams.length;
  const totalPlayers = players.filter(p => p.role !== 'admin').length;
  const totalMatchesCount = matches.length;
  const activeTournamentsCount = tournaments.filter(t => t.status === 'ongoing').length;

  // Filter schedules
  const liveMatches = matches.filter(m => m.status === 'live');
  const upcomingMatches = matches
    .filter(m => m.status === 'scheduled')
    .sort((a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime());
  const completedMatches = matches
    .filter(m => m.status === 'completed')
    .sort((a, b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime());

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Hero Welcome Banner */}
      <div className="relative p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-zinc-800 text-white overflow-hidden shadow-xl">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-400 via-emerald-600 to-black"></div>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> League Scorecard Orchestrator
            </div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl text-zinc-50">
              SelvaSoccer Stadium Core
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-xl leading-relaxed">
              Track live scores, scheduled tournaments, automated point tables, team rosters, and system overall leaderboards with full precision.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0 w-full sm:w-auto">
            {isAdmin ? (
              <>
                <button
                  id="dash-create-match-btn"
                  onClick={onOpenCreateMatchModal}
                  className="flex items-center justify-center flex-1 sm:flex-initial gap-1.5 bg-emerald-500 hover:bg-emerald-600 font-bold px-4 py-2.5 rounded-xl text-xs transition active:scale-95 text-white shadow-lg shadow-emerald-500/10"
                >
                  <Plus className="w-4 h-4" /> Schedule Match
                </button>
                <button
                  id="dash-create-team-btn"
                  onClick={onOpenCreateTeamModal}
                  className="flex items-center justify-center flex-1 sm:flex-initial gap-1.5 bg-zinc-900 hover:bg-zinc-800 font-bold px-4 py-2.5 rounded-xl text-xs transition active:scale-95 text-zinc-200 border border-zinc-800"
                >
                  <Plus className="w-4 h-4" /> Create Team
                </button>
              </>
            ) : (
              <button
                id="dash-explore-tourneys-btn"
                onClick={() => setActiveTab('tournaments')}
                className="flex items-center justify-center w-full sm:w-auto gap-2 bg-zinc-900 hover:bg-zinc-800 font-bold px-4 py-2.5 rounded-xl text-xs transition active:scale-95 text-emerald-400 border border-emerald-500/20"
              >
                Explore Active Tournaments <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Aggregate Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { id: "stat-teams", label: 'Total Teams', value: totalTeams, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20', icon: Users, tab: 'teams' },
          { id: "stat-players", label: 'Rostered Players', value: totalPlayers, color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20', icon: Users, tab: 'teams' },
          { id: "stat-matches", label: 'Total Playlists', value: totalMatchesCount, color: 'text-teal-500 bg-teal-50 dark:bg-teal-500/10 border-teal-100 dark:border-teal-500/20', icon: Calendar, tab: 'matches' },
          { id: "stat-active", label: 'Live Tournaments', value: activeTournamentsCount, color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20', icon: Trophy, tab: 'tournaments' },
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              id={item.id}
              key={index}
              onClick={() => setActiveTab(item.tab)}
              className="group p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 block transition-colors group-hover:text-emerald-500 uppercase tracking-wider">
                  {item.label}
                </span>
                <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 font-mono tracking-tight">
                  {item.value}
                </span>
              </div>
              <div className={`p-2.5 rounded-xl border ${item.color} transition-transform group-hover:scale-105`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Match Alert Banner */}
      {liveMatches.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-500 animate-pulse" /> Matches Currently LIVE
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveMatches.map((m) => (
              <div
                id={`live-match-banner-${m.id}`}
                key={m.id}
                onClick={() => onViewMatchDetails(m.id)}
                className="group relative p-5 bg-gradient-to-br from-red-50/40 to-white dark:from-red-950/10 dark:to-zinc-900/40 border border-red-100 dark:border-red-900/30 rounded-2xl cursor-pointer hover:shadow-lg hover:border-red-200 dark:hover:border-red-900/50 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute -right-2 -top-3 text-6xl opacity-[0.03] dark:opacity-[0.02] font-black pointer-events-none text-red-600 font-mono select-none tracking-tighter">
                  LIVE
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-bold tracking-wider uppercase text-zinc-400">
                    <span className="text-red-500 flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-current" /> Live Scorecard
                    </span>
                    <span className="flex items-center gap-1 font-medium text-zinc-500 max-w-[180px] truncate">
                      <MapPin className="w-3 h-3" /> {m.venue}
                    </span>
                  </div>

                  <div className="grid grid-cols-7 items-center text-center">
                    <div className="col-span-2 flex flex-col items-center gap-1.5">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xl shadow-sm border border-zinc-200/40 dark:border-zinc-700/40">{m.teamALogo || '⚽'}</div>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 line-clamp-1">{m.teamAName}</span>
                    </div>

                    <div className="col-span-3 flex items-center justify-center gap-3">
                      <span className="text-3xl font-black font-mono tracking-tight text-zinc-900 dark:text-zinc-50">
                        {m.scoreA}
                      </span>
                      <span className="text-[10px] font-black text-red-500 px-2 py-0.5 rounded-full bg-red-100/50 dark:bg-red-500/10 border border-red-200/20 dark:border-red-500/20">
                        VS
                      </span>
                      <span className="text-3xl font-black font-mono tracking-tight text-zinc-900 dark:text-zinc-50">
                        {m.scoreB}
                      </span>
                    </div>

                    <div className="col-span-2 flex flex-col items-center gap-1.5">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xl shadow-sm border border-zinc-200/40 dark:border-zinc-700/40">{m.teamBLogo || '⚽'}</div>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 line-clamp-1">{m.teamBName}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      {m.type === 'tournament' ? 'Tournament Match' : 'One vs One Match'}
                    </span>
                    {isAdmin ? (
                      <button
                        id={`resume-scorecard-btn-${m.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartMatch(m);
                        }}
                        className="text-[11px] bg-red-500 hover:bg-red-600 active:scale-95 text-white px-3 py-1.5 rounded-lg font-bold transition shadow-md shadow-red-500/10"
                      >
                        Input Scorecard
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-500 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        Watch Live <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Upcoming and Completed Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upcoming Matches */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500" /> Upcoming Match Fixtures
          </h2>

          <div className="space-y-3">
            {upcomingMatches.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 text-xs font-medium">
                No upcoming match fixtures scheduled.
              </div>
            ) : (
              upcomingMatches.slice(0, 5).map((m) => (
                <div
                  id={`match-fixture-${m.id}`}
                  key={m.id}
                  className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition flex justify-between items-center gap-4"
                >
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      <span>{m.date}</span>
                      <span className="text-zinc-300 dark:text-zinc-700">•</span>
                      <span>{m.time}</span>
                      <span className="text-zinc-300 dark:text-zinc-700">•</span>
                      <span className="inline-flex items-center gap-0.5 text-zinc-500 dark:text-zinc-400 normal-case font-medium truncate max-w-[150px]">
                        <MapPin className="w-3 h-3 text-zinc-400" /> {m.venue}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-semibold text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-base shrink-0">{m.teamALogo || '⚽'}</span> 
                        <span className="truncate">{m.teamAName}</span>
                      </div>
                      <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 shrink-0">VS</span>
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-base shrink-0">{m.teamBLogo || '⚽'}</span> 
                        <span className="truncate">{m.teamBName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isAdmin ? (
                      <button
                        id={`dashboard-start-match-btn-${m.id}`}
                        onClick={() => onStartMatch(m)}
                        className="text-[11px] bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        Start
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 text-[9px] uppercase font-bold tracking-wider rounded-md bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border border-zinc-200/50 dark:border-zinc-700/50">
                        Scheduled
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Results */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-500" /> Recent Results Timeline
          </h2>

          <div className="space-y-3">
            {completedMatches.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 text-xs font-medium">
                No matches have been recorded yet.
              </div>
            ) : (
              completedMatches.slice(0, 5).map((m) => (
                <div
                  id={`match-completed-row-${m.id}`}
                  key={m.id}
                  onClick={() => onViewMatchDetails(m.id)}
                  className="group p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:shadow-sm cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition flex justify-between items-center gap-4"
                >
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                      {m.type === 'tournament' ? 'Tournament Cup' : 'Friendly Match'}
                    </span>
                    
                    <div className="flex items-center justify-between sm:justify-start sm:gap-4 text-xs sm:text-sm">
                      {/* Team A */}
                      <div className={`flex items-center gap-1.5 flex-1 sm:flex-initial justify-end sm:justify-start text-right sm:text-left truncate ${m.scoreA > m.scoreB ? 'text-zinc-950 dark:text-zinc-50 font-bold' : 'text-zinc-400 dark:text-zinc-500 font-medium'}`}>
                        <span className="truncateOrder order-2 sm:order-2 truncate">{m.teamAName}</span>
                        <span className="text-base order-1 sm:order-1 shrink-0">{m.teamALogo || '⚽'}</span>
                      </div>
                      
                      {/* Score Badge */}
                      <span className="mx-3 sm:mx-0 px-2.5 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-black font-mono tracking-tight text-zinc-900 dark:text-zinc-50 shrink-0 border border-zinc-200/20">
                        {m.scoreA} - {m.scoreB}
                      </span>
                      
                      {/* Team B */}
                      <div className={`flex items-center gap-1.5 flex-1 sm:flex-initial truncate ${m.scoreB > m.scoreA ? 'text-zinc-950 dark:text-zinc-50 font-bold' : 'text-zinc-400 dark:text-zinc-500 font-medium'}`}>
                        <span className="text-base shrink-0">{m.teamBLogo || '⚽'}</span>
                        <span className="truncate">{m.teamBName}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] text-emerald-500 font-bold shrink-0 group-hover:translate-x-0.5 transition-transform">
                    Stats
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}