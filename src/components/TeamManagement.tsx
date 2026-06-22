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
  FileText
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

  // Reset form states
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
      // If player removed was captain or vice captain, clear them
      if (formCaptain === playerId) setFormCaptain('');
      if (formViceCaptain === playerId) setFormViceCaptain('');
    } else {
      setSelectedPlayerIds([...selectedPlayerIds, playerId]);
    }
  };

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

  // Find player helpers
  const getPlayerName = (id?: string) => {
    const p = players.find((x) => x.id === id);
    return p ? p.name : 'Not Assigned';
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
            Team Management Unit
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            View teams, review squad statistics, and assign players/captains.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
            <input
              id="team-search-input"
              type="text"
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:border-emerald-500 focus:outline-none transition-all dark:text-white"
            />
          </div>

          {isAdmin && (
            <button
              id="open-create-team-modal-btn"
              onClick={() => {
                initForm();
                setShowCreateModal(true);
              }}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 font-semibold text-white px-4 py-2 rounded-xl text-sm transition-colors shadow-lg shadow-emerald-500/10 shrink-0"
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
            <div className="sm:col-span-2 p-12 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400">
              No registered teams found.
            </div>
          ) : (
            filteredTeams.map((team) => (
              <div
                id={`team-card-${team.id}`}
                key={team.id}
                onClick={() => setSelectedTeam(team)}
                className={`p-5 bg-white dark:bg-neutral-900 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedTeam?.id === team.id
                    ? 'border-emerald-500 shadow-md shadow-emerald-500/10'
                    : 'border-neutral-150 dark:border-neutral-800 hover:border-neutral-250 dark:hover:border-neutral-750'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center text-2xl shadow-inner">
                    {team.logo || '⚽'}
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-950 dark:text-white text-base line-clamp-1">{team.name}</h3>
                    <span className="text-xs text-neutral-550 dark:text-neutral-450 flex items-center gap-1 font-medium">
                      <Users className="w-3.5 h-3.5" /> {team.playerIds.length} Squad Members
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 text-center border-t border-neutral-100 dark:border-neutral-805 pt-3">
                  <div>
                    <span className="text-[10px] text-neutral-450 uppercase font-semibold">Played</span>
                    <p className="text-sm font-bold font-mono dark:text-neutral-200">{team.matchesPlayed}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-450 uppercase font-semibold">Wins</span>
                    <p className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">{team.wins}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-450 uppercase font-semibold">GF / GA</span>
                    <p className="text-sm font-bold font-mono text-neutral-800 dark:text-neutral-300">
                      {team.goalsScored} - {team.goalsConceded}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Team Profile side-bar */}
        <div id="selected-team-details-panel">
          {selectedTeam ? (
            <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 rounded-2xl space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="text-4xl p-3 bg-neutral-50 dark:bg-neutral-800 rounded-2xl">
                    {selectedTeam.logo || '⚽'}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-neutral-900 dark:text-white">{selectedTeam.name}</h2>
                    <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold px-2 py-0.5 rounded">
                      Rival Squad
                    </span>
                  </div>
                </div>
                <button
                  id="close-selected-team-btn"
                  onClick={() => setSelectedTeam(null)}
                  className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
                >
                  <X className="w-4 h-4 text-neutral-400" />
                </button>
              </div>

              {selectedTeam.description && (
                <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed italic">
                  "{selectedTeam.description}"
                </p>
              )}

              {/* Advanced metrics board */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Captain', value: getPlayerName(selectedTeam.captainId), icon: ShieldCheck, color: 'text-amber-500' },
                  { label: 'Vice Captain', value: getPlayerName(selectedTeam.viceCaptainId), icon: UserPlus, color: 'text-blue-500' },
                  { label: 'Total Points', value: selectedTeam.points, icon: Trophy, color: 'text-emerald-500' },
                  { label: 'Form Ratio', value: `${selectedTeam.wins}W - ${selectedTeam.draws}D - ${selectedTeam.losses}L`, icon: TrendingUp, color: 'text-emerald-550' },
                ].map((stat, i) => (
                  <div key={i} className="p-3 bg-neutral-50 dark:bg-neutral-850/50 rounded-xl space-y-1">
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                      <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} /> {stat.label}
                    </span>
                    <p className="text-xs font-bold text-neutral-800 dark:text-white line-clamp-1">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Squad List */}
              <div className="space-y-3">
                <span className="text-xs uppercase font-extrabold text-neutral-400 tracking-wider flex items-center gap-1.5 border-b pb-1 dark:border-neutral-800">
                  <Flame className="w-3.5 h-3.5 text-emerald-500 animate-pulse" /> Roster Players List ({selectedTeam.playerIds.length})
                </span>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selectedTeam.playerIds.map((pId) => {
                    const pl = players.find((p) => p.id === pId);
                    if (!pl) return null;
                    return (
                      <div
                        id={`team-member-row-${pl.id}`}
                        key={pl.id}
                        className="flex justify-between items-center p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/40 text-neutral-800 dark:text-neutral-250 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {pl.profileImage ? (
                            <img
                              src={pl.profileImage}
                              alt={pl.name}
                              referrerPolicy="no-referrer"
                              className="w-7 h-7 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-650 dark:text-emerald-400 rounded-full flex items-center justify-center font-bold text-xs font-mono">
                              {pl.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-xs font-semibold">{pl.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400">
                          <span>{pl.goals} G</span>
                          <span>•</span>
                          <span>{pl.assists} A</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-neutral-50 dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-800 rounded-2xl">
              <Users className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
              <h3 className="font-bold text-neutral-700 dark:text-white mb-1">No Team Selected</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Click on any team card on the left to inspect squad members, captain credentials, and goal details.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl animate-scale-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                  Add Football Team
                </h3>
                <p className="text-xs text-neutral-500">Create a rival club and assign players.</p>
              </div>
              <button
                id="close-create-team-modal-btn"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 hover:bg-neutral-105 dark:hover:bg-neutral-800 rounded-full transition"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            {/* Modal Body / Scrollable Form */}
            <form onSubmit={handleCreateTeamSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
                </div>
              )}

              {/* Team Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase">Team Name</label>
                <input
                  id="form-team-name-input"
                  type="text"
                  placeholder="e.g. Sparks Capital FC"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2 text-sm bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:border-emerald-500 focus:outline-none dark:text-white"
                  required
                />
              </div>

              {/* Logo Emoji (Simple representation) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase">Team Logo Emoji</label>
                  <select
                    id="form-team-logo-select"
                    value={formLogo}
                    onChange={(e) => setFormLogo(e.target.value)}
                    className="w-full px-4 py-2 text-sm bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:border-emerald-500 focus:outline-none dark:text-white"
                  >
                    <option value="⚽">⚽ Football</option>
                    <option value="⚽👑">👑 Crown Royal</option>
                    <option value="⚽⚡">⚡ Lightning Bolt</option>
                    <option value="⚽⛈️">⛈️ Thunderstorm</option>
                    <option value="⚽🔥">🔥 Fireball</option>
                    <option value="⚽🦁">🦁 Lion Head</option>
                    <option value="⚽🏆">🏆 Golden Cup</option>
                    <option value="⚽🦅">🦅 Golden Eagle</option>
                  </select>
                </div>
                <div className="flex items-center justify-center bg-neutral-50 dark:bg-neutral-850 border border-dashed rounded-xl h-22">
                  <span className="text-4xl">{formLogo}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase">Description</label>
                <textarea
                  id="form-team-desc-textarea"
                  rows={2}
                  placeholder="Club slogan or strategic summary..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-4 py-2 text-sm bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:border-emerald-500 focus:outline-none dark:text-white"
                />
              </div>

              {/* Rostered Player Checklist */}
              <div className="space-y-1.5 border-t border-neutral-100 dark:border-neutral-850 pt-4">
                <label className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider block">
                  Add Registered Players List
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-neutral-100 dark:border-neutral-805 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-850/50">
                  {players.filter(p => p.role !== 'admin').map((usr) => {
                    const isChecked = selectedPlayerIds.includes(usr.id);
                    return (
                      <label
                        key={usr.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer select-none text-xs text-neutral-700 dark:text-neutral-300"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePlayerSelection(usr.id)}
                            className="rounded border-neutral-320 text-emerald-650 focus:ring-emerald-500"
                          />
                          <span className="font-semibold">{usr.name}</span>
                        </div>
                        <span className="text-[10px] text-neutral-450 uppercase font-mono">
                          {usr.goals} Goals • {usr.assists} Assists
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Captain & Vice Captain Selections */}
              {selectedPlayerIds.length > 0 && (
                <div className="grid grid-cols-2 gap-4 border-t border-neutral-100 dark:border-neutral-850 pt-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase">Select Captain</label>
                    <select
                      id="form-team-captain-select"
                      value={formCaptain}
                      onChange={(e) => setFormCaptain(e.target.value)}
                      className="w-full px-4 py-2 text-sm bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:border-emerald-500 focus:outline-none dark:text-white"
                    >
                      <option value="">-- No Captain --</option>
                      {selectedPlayerIds.map((pId) => (
                        <option key={pId} value={pId}>
                          {getPlayerName(pId)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase">Select Vice Captain</label>
                    <select
                      id="form-team-vcaptain-select"
                      value={formViceCaptain}
                      onChange={(e) => setFormViceCaptain(e.target.value)}
                      className="w-full px-4 py-2 text-sm bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:border-emerald-500 focus:outline-none dark:text-white"
                    >
                      <option value="">-- No Vice Captain --</option>
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
              <div className="flex gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-600 dark:text-neutral-350 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  id="submit-create-team-btn"
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-500/15"
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
