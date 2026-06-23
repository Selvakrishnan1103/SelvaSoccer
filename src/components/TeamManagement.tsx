import React, { useState } from 'react';
import { Team, UserProfile } from '../types';
import { 
  Plus, 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Trophy, 
  TrendingUp, 
  Flame, 
  Search, 
  X, 
  AlertCircle,
  Pencil,
  UserMinus,
  UserCheck
} from 'lucide-react';

interface TeamManagementProps {
  teams: Team[];
  players: UserProfile[];
  isAdmin: boolean;
  onSaveTeam: (team: Team) => void;
}

export default function TeamManagement({
  teams,
  players,
  isAdmin,
  onSaveTeam,
}: TeamManagementProps) {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editPlayerIds, setEditPlayerIds] = useState<string[]>([]);
  const [editCaptain, setEditCaptain] = useState('');
  const [editViceCaptain, setEditViceCaptain] = useState('');
  const [editError, setEditError] = useState('');
  const [editSearchQuery, setEditSearchQuery] = useState('');

  // Form states for creating a team
  const [formName, setFormName] = useState('');
  const [formLogo, setFormLogo] = useState('⚽');
  const [formDescription, setFormDescription] = useState('');
  const [formCaptain, setFormCaptain] = useState('');
  const [formViceCaptain, setFormViceCaptain] = useState('');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [formError, setFormError] = useState('');

  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const initForm = () => {
    setFormName('');
    setFormLogo('⚽');
    setFormDescription('');
    setFormCaptain('');
    setFormViceCaptain('');
    setSelectedPlayerIds([]);
    setFormError('');
  };

  const togglePlayerSelection = (playerId: string) => {
    if (selectedPlayerIds.includes(playerId)) {
      setSelectedPlayerIds(selectedPlayerIds.filter((id) => id !== playerId));
      if (formCaptain === playerId) setFormCaptain('');
      if (formViceCaptain === playerId) setFormViceCaptain('');
    } else {
      setSelectedPlayerIds([...selectedPlayerIds, playerId]);
    }
  };

  // ─── Edit modal helpers ───────────────────────────────────────────────────
  const openEditModal = (team: Team) => {
    setEditingTeam(team);
    setEditPlayerIds([...team.playerIds]);
    setEditCaptain(team.captainId || '');
    setEditViceCaptain(team.viceCaptainId || '');
    setEditError('');
    setEditSearchQuery('');
    setShowEditModal(true);
  };

  const toggleEditPlayer = (playerId: string) => {
    if (editPlayerIds.includes(playerId)) {
      setEditPlayerIds(editPlayerIds.filter((id) => id !== playerId));
      if (editCaptain === playerId) setEditCaptain('');
      if (editViceCaptain === playerId) setEditViceCaptain('');
    } else {
      setEditPlayerIds([...editPlayerIds, playerId]);
    }
  };

  const handleEditSubmit = () => {
    setEditError('');
    if (!editingTeam) return;

    if (editPlayerIds.length === 0) {
      setEditError('A team must have at least one player.');
      return;
    }

    const updatedTeam: Team = {
      ...editingTeam,
      playerIds: editPlayerIds,
      captainId: editCaptain || undefined,
      viceCaptainId: editViceCaptain || undefined,
    };

    onSaveTeam(updatedTeam);

    // Keep the side panel in sync
    if (selectedTeam?.id === updatedTeam.id) {
      setSelectedTeam(updatedTeam);
    }

    setShowEditModal(false);
    setEditingTeam(null);
  };

  // Filtered list for the edit modal player picker
  const editFilteredPlayers = players
    .filter((p) => p.role !== 'admin')
    .filter((p) =>
      p.name.toLowerCase().includes(editSearchQuery.toLowerCase())
    );

  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim()) {
      setFormError('Team name is required.');
      return;
    }

    if (selectedPlayerIds.length === 0) {
      setFormError('Please select at least one player to add to the team.');
      return;
    }

    const newTeam: Team = {
      id: `team_${Date.now()}`,
      name: formName.trim(),
      logo: formLogo.trim() || '⚽',
      description: formDescription.trim(),
      captainId: formCaptain || undefined,
      viceCaptainId: formViceCaptain || undefined,
      playerIds: selectedPlayerIds,
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsScored: 0,
      goalsConceded: 0,
      points: 0,
    };

    onSaveTeam(newTeam);
    setShowCreateModal(false);
    initForm();
  };

  const getPlayerName = (id?: string) => {
    const p = players.find((x) => x.id === id);
    return p ? p.name : 'Not Assigned';
  };

  return (
    <div className="space-y-6 pb-24 transition-all duration-300">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-100 dark:border-neutral-800/60 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
            Team Management Unit
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            View teams, review squad statistics, and assign players/captains.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
            <input
              id="team-search-input"
              type="text"
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500"
            />
          </div>

          {isAdmin && (
            <button
              id="open-create-team-modal-btn"
              onClick={() => {
                initForm();
                setShowCreateModal(true);
              }}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 font-bold text-white px-4 py-2 rounded-xl text-sm transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-98 shrink-0"
            >
              <Plus className="w-4 h-4" /> Create Team
            </button>
          )}
        </div>
      </div>

      {/* Main layout: Teams grid & selected team side panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Teams List Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredTeams.length === 0 ? (
            <div className="sm:col-span-2 p-16 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-60" />
              <p className="font-medium text-sm">No registered teams found.</p>
            </div>
          ) : (
            filteredTeams.map((team) => (
              <div
                id={`team-card-${team.id}`}
                key={team.id}
                onClick={() => setSelectedTeam(team)}
                className={`p-5 bg-white dark:bg-neutral-900 rounded-2xl border-2 transition-all duration-200 cursor-pointer hover:translate-y-[-2px] ${
                  selectedTeam?.id === team.id
                    ? 'border-emerald-500 shadow-lg shadow-emerald-500/5 dark:shadow-emerald-500/10'
                    : 'border-neutral-200/70 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-xl flex items-center justify-center text-2xl shadow-inner">
                    {team.logo || '⚽'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-neutral-900 dark:text-white text-base truncate">{team.name}</h3>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mt-0.5 font-medium">
                      <Users className="w-3.5 h-3.5 text-neutral-400" /> {team.playerIds.length} Squad Members
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-5 text-center border-t border-neutral-100 dark:border-neutral-800/80 pt-3.5">
                  <div>
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase font-bold tracking-wider">Played</span>
                    <p className="text-sm font-bold font-mono text-neutral-800 dark:text-neutral-200 mt-0.5">{team.matchesPlayed}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase font-bold tracking-wider">Wins</span>
                    <p className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">{team.wins}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase font-bold tracking-wider">GF / GA</span>
                    <p className="text-sm font-bold font-mono text-neutral-700 dark:text-neutral-300 mt-0.5">
                      {team.goalsScored} : {team.goalsConceded}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Team Profile side-bar */}
        <div id="selected-team-details-panel" className="lg:sticky lg:top-20">
          {selectedTeam ? (
            <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 rounded-2xl space-y-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="text-4xl p-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-2xl shadow-inner">
                    {selectedTeam.logo || '⚽'}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-neutral-900 dark:text-white leading-tight">{selectedTeam.name}</h2>
                    <span className="inline-block text-[10px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold px-2 py-0.5 rounded mt-1 uppercase tracking-wider">
                      Rival Squad
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {isAdmin && (
                    <button
                      id="edit-selected-team-btn"
                      onClick={() => openEditModal(selectedTeam)}
                      title="Edit squad roster"
                      className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg transition-colors border border-transparent hover:border-amber-200 dark:hover:border-amber-800/50 group"
                    >
                      <Pencil className="w-4 h-4 text-neutral-400 dark:text-neutral-500 group-hover:text-amber-500 transition-colors" />
                    </button>
                  )}
                  <button
                    id="close-selected-team-btn"
                    onClick={() => setSelectedTeam(null)}
                    className="p-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
                  >
                    <X className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                  </button>
                </div>
              </div>

              {selectedTeam.description && (
                <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed italic bg-neutral-50 dark:bg-neutral-850/40 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800">
                  "{selectedTeam.description}"
                </p>
              )}

              {/* Advanced metrics board */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Captain', value: getPlayerName(selectedTeam.captainId), icon: ShieldCheck, color: 'text-amber-500', bg: 'dark:bg-amber-500/5' },
                  { label: 'Vice Captain', value: getPlayerName(selectedTeam.viceCaptainId), icon: UserPlus, color: 'text-blue-500', bg: 'dark:bg-blue-500/5' },
                  { label: 'Total Points', value: selectedTeam.points, icon: Trophy, color: 'text-emerald-500', bg: 'dark:bg-emerald-500/5' },
                  { label: 'Form Ratio', value: `${selectedTeam.wins}W - ${selectedTeam.draws}D - ${selectedTeam.losses}L`, icon: TrendingUp, color: 'text-teal-500', bg: 'dark:bg-teal-500/5' },
                ].map((stat, i) => (
                  <div key={i} className={`p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl space-y-1 ${stat.bg}`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
                      <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} /> {stat.label}
                    </span>
                    <p className="text-xs font-bold text-neutral-800 dark:text-white line-clamp-1 truncate">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Squad List */}
              <div className="space-y-3 pt-2">
                <span className="text-[11px] uppercase font-black text-neutral-400 dark:text-neutral-500 tracking-widest flex items-center gap-1.5 border-b pb-2 dark:border-neutral-800">
                  <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" /> Squad Roster ({selectedTeam.playerIds.length})
                </span>
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800">
                  {selectedTeam.playerIds.map((pId) => {
                    const pl = players.find((p) => p.id === pId);
                    if (!pl) return null;
                    return (
                      <div
                        id={`team-member-row-${pl.id}`}
                        key={pl.id}
                        className="flex justify-between items-center p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-850/60 text-neutral-800 dark:text-neutral-200 border border-transparent hover:border-neutral-100 dark:hover:border-neutral-800/50 transition-all duration-150"
                      >
                        <div className="flex items-center gap-2.5">
                          {pl.profileImage ? (
                            <img
                              src={pl.profileImage}
                              alt={pl.name}
                              referrerPolicy="no-referrer"
                              className="w-7 h-7 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                            />
                          ) : (
                            <div className="w-7 h-7 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center font-bold text-xs">
                              {pl.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-xs font-semibold truncate max-w-[120px]">{pl.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold font-mono text-neutral-400 dark:text-neutral-500">
                          <span className="text-neutral-600 dark:text-neutral-400">{pl.goals || 0} G</span>
                          <span>•</span>
                          <span>{pl.assists || 0} A</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-neutral-50 dark:bg-neutral-900 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
              <Users className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
              <h3 className="font-bold text-neutral-700 dark:text-neutral-200 text-sm mb-1">No Team Selected</h3>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 max-w-[240px] mx-auto leading-relaxed">
                Click on any team card on the left to inspect squad members, captain credentials, and goal details.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Edit Squad Modal ─────────────────────────────────────────── */}
      {showEditModal && editingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-900 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-xl flex items-center justify-center text-lg">
                  {editingTeam.logo || '⚽'}
                </div>
                <div>
                  <h3 className="text-base font-black text-neutral-900 dark:text-white">
                    Edit Squad — {editingTeam.name}
                  </h3>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                    Add or remove players, reassign captain roles.
                  </p>
                </div>
              </div>
              <button
                id="close-edit-team-modal-btn"
                onClick={() => setShowEditModal(false)}
                className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 transition"
              >
                <X className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {editError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {editError}
                </div>
              )}

              {/* Current squad count pill */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Player Pool
                </span>
                <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 px-2 py-0.5 rounded-full">
                  {editPlayerIds.length} selected
                </span>
              </div>

              {/* Player search within edit modal */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                <input
                  type="text"
                  placeholder="Filter players..."
                  value={editSearchQuery}
                  onChange={(e) => setEditSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500"
                />
              </div>

              {/* Player toggle list */}
              <div className="space-y-1.5 max-h-52 overflow-y-auto border border-neutral-200 dark:border-neutral-800 p-2 rounded-xl bg-neutral-50 dark:bg-neutral-950/50">
                {editFilteredPlayers.length === 0 && (
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center py-4">No players match your search.</p>
                )}
                {editFilteredPlayers.map((usr) => {
                  const isIn = editPlayerIds.includes(usr.id);
                  return (
                    <label
                      key={usr.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer select-none text-xs border transition-all ${
                        isIn
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-300'
                          : 'border-transparent text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {usr.profileImage ? (
                          <img
                            src={usr.profileImage}
                            alt={usr.name}
                            referrerPolicy="no-referrer"
                            className="w-6 h-6 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                          />
                        ) : (
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${isIn ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'}`}>
                            {usr.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-semibold">{usr.name}</span>
                        {/* Captain / VC badges */}
                        {editCaptain === usr.id && (
                          <span className="text-[9px] font-black bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full uppercase tracking-wider">C</span>
                        )}
                        {editViceCaptain === usr.id && (
                          <span className="text-[9px] font-black bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full uppercase tracking-wider">VC</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-bold font-mono">
                          {usr.goals || 0}G • {usr.assists || 0}A
                        </span>
                        <div
                          onClick={(e) => { e.preventDefault(); toggleEditPlayer(usr.id); }}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${
                            isIn
                              ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/40 hover:bg-rose-100 dark:hover:bg-rose-950/50'
                              : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/50'
                          }`}
                        >
                          {isIn
                            ? <UserMinus className="w-3.5 h-3.5 text-rose-500" />
                            : <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                          }
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Captain & Vice Captain re-assignment */}
              {editPlayerIds.length > 0 && (
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-amber-500" /> Captain
                    </label>
                    <select
                      id="edit-team-captain-select"
                      value={editCaptain}
                      onChange={(e) => setEditCaptain(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:border-emerald-500 focus:outline-none dark:text-white"
                    >
                      <option value="">-- None --</option>
                      {editPlayerIds.map((pId) => (
                        <option key={pId} value={pId}>{getPlayerName(pId)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                      <UserPlus className="w-3 h-3 text-blue-500" /> Vice Captain
                    </label>
                    <select
                      id="edit-team-vcaptain-select"
                      value={editViceCaptain}
                      onChange={(e) => setEditViceCaptain(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:border-emerald-500 focus:outline-none dark:text-white"
                    >
                      <option value="">-- None --</option>
                      {editPlayerIds
                        .filter((pId) => pId !== editCaptain)
                        .map((pId) => (
                          <option key={pId} value={pId}>{getPlayerName(pId)}</option>
                        ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-neutral-100 dark:border-neutral-800 flex gap-3 bg-neutral-50/50 dark:bg-neutral-900 shrink-0">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-600 dark:text-neutral-300 text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                id="submit-edit-team-btn"
                type="button"
                onClick={handleEditSubmit}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition shadow-md shadow-amber-500/10 active:scale-98"
              >
                Save Squad Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden scale-in">
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-900">
              <div>
                <h3 className="text-base font-black text-neutral-900 dark:text-white">
                  Add New Football Team
                </h3>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">Create a team profile and assign roster positions.</p>
              </div>
              <button
                id="close-create-team-modal-btn"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 transition"
              >
                <X className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
              </button>
            </div>

            {/* Modal Body / Scrollable Form */}
            <form onSubmit={handleCreateTeamSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
                </div>
              )}

              {/* Team Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Team Name</label>
                <input
                  id="form-team-name-input"
                  type="text"
                  placeholder="e.g. Sparks Capital FC"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none dark:text-white transition-all"
                  required
                />
              </div>

              {/* Logo Emoji Selector */}
              <div className="grid grid-cols-3 gap-4 items-end">
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Team Crest Badge</label>
                  <select
                    id="form-team-logo-select"
                    value={formLogo}
                    onChange={(e) => setFormLogo(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none dark:text-white transition-all"
                  >
                    <option value="⚽">⚽ Football Classic</option>
                    <option value="⚽👑">👑 Crown Royal</option>
                    <option value="⚽⚡">⚡ Lightning Bolt</option>
                    <option value="⚽⛈️">⛈️ Thunderstorm</option>
                    <option value="⚽🔥">🔥 Fireball</option>
                    <option value="⚽🦁">🦁 Lion Head</option>
                    <option value="⚽🏆">🏆 Golden Cup</option>
                    <option value="⚽🦅">🦅 Golden Eagle</option>
                  </select>
                </div>
                <div className="flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl h-10 w-full shadow-inner">
                  <span className="text-2xl">{formLogo}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Strategic Summary / Slogan</label>
                <textarea
                  id="form-team-desc-textarea"
                  rows={2}
                  placeholder="Club values, goals, or summary lines..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none dark:text-white transition-all resize-none"
                />
              </div>

              {/* Rostered Player Checklist */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
                  Select Players Pool List
                </label>
                <div className="space-y-1 max-h-36 overflow-y-auto border border-neutral-200 dark:border-neutral-800 p-2 rounded-xl bg-neutral-50 dark:bg-neutral-950/50">
                  {players.filter(p => p.role !== 'admin').map((usr) => {
                    const isChecked = selectedPlayerIds.includes(usr.id);
                    return (
                      <label
                        key={usr.id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer select-none text-xs border transition-all ${
                          isChecked 
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-300' 
                            : 'border-transparent text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePlayerSelection(usr.id)}
                            className="rounded border-neutral-300 dark:border-neutral-700 text-emerald-500 focus:ring-emerald-500/20 w-3.5 h-3.5"
                          />
                          <span className="font-semibold">{usr.name}</span>
                        </div>
                        <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-bold font-mono uppercase">
                          {usr.goals || 0}G • {usr.assists || 0}A
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Captain & Vice Captain Selections */}
              {selectedPlayerIds.length > 0 && (
                <div className="grid grid-cols-2 gap-4 pt-2 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Assign Captain</label>
                    <select
                      id="form-team-captain-select"
                      value={formCaptain}
                      onChange={(e) => setFormCaptain(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:border-emerald-500 focus:outline-none dark:text-white"
                    >
                      <option value="">-- Select --</option>
                      {selectedPlayerIds.map((pId) => (
                        <option key={pId} value={pId}>
                          {getPlayerName(pId)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Assign Vice Captain</label>
                    <select
                      id="form-team-vcaptain-select"
                      value={formViceCaptain}
                      onChange={(e) => setFormViceCaptain(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:border-emerald-500 focus:outline-none dark:text-white"
                    >
                      <option value="">-- Select --</option>
                      {selectedPlayerIds
                        .filter((pId) => pId !== formCaptain)
                        .map((pId) => (
                          <option key={pId} value={pId}>
                            {getPlayerName(pId)}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-600 dark:text-neutral-300 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  id="submit-create-team-btn"
                  type="submit"
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition shadow-md shadow-emerald-500/10 active:scale-98"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}