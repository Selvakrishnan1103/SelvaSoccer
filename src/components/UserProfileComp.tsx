import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  User, 
  Mail, 
  Phone, 
  Award, 
  Trophy, 
  Edit2, 
  CheckCircle2, 
  Users,
  Save,
  Loader2,
  X
} from 'lucide-react';

interface UserProfileCompProps {
  user: UserProfile;
  onUpdateProfile: (userId: string, data: Partial<UserProfile>) => Promise<void>;
}

export default function UserProfileComp({
  user,
  onUpdateProfile,
}: UserProfileCompProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formName, setFormName] = useState(user.name);
  const [formPhone, setFormPhone] = useState(user.phone || '');
  const [formImage, setFormImage] = useState(user.profileImage || '');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      await onUpdateProfile(user.id, {
        name: formName.trim(),
        phone: formPhone.trim(),
        profileImage: formImage.trim() || undefined,
      });
      setSuccessMsg('Profile updated successfully.');
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update stats:', err);
    } finally {
      setSaving(false);
    }
  };

  const winRatio = user.matchesPlayed > 0 
    ? Math.round((user.wins / user.matchesPlayed) * 100) 
    : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 transition-all duration-300">
      {/* Banner */}
      <div className="relative h-36 rounded-3xl bg-neutral-950 border border-neutral-200/10 dark:border-neutral-800/60 overflow-hidden shadow-lg">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-400 via-emerald-700 to-neutral-950"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-50"></div>
      </div>

      {/* Profile Detail Block */}
      <div className="relative -mt-20 px-4 sm:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-28 h-28 rounded-2xl border-4 border-white dark:border-neutral-950 object-cover shadow-xl bg-neutral-100 dark:bg-neutral-900"
              />
            ) : (
              <div className="w-28 h-28 rounded-2xl border-4 border-white dark:border-neutral-950 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-black text-4xl shadow-xl text-neutral-800 dark:text-neutral-200">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="space-y-1.5 pb-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight leading-none">
                  {user.name}
                </h1>
                <span className={`px-2 py-0.5 text-[9px] uppercase font-black rounded-md tracking-wider border ${
                  user.role === 'admin' 
                    ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/30' 
                    : 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30'
                }`}>
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center justify-center sm:justify-start gap-1.5 font-medium">
                <Mail className="w-3.5 h-3.5 text-neutral-400" /> {user.email}
              </p>
            </div>
          </div>

          <button
            id="toggle-edit-profile-btn"
            onClick={() => {
              setIsEditing(!isEditing);
              setSuccessMsg('');
            }}
            className="self-center sm:self-end flex items-center gap-1.5 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 font-bold text-xs py-2 px-4 rounded-xl transition-all shadow-sm active:scale-98 dark:text-white"
          >
            {isEditing ? (
              <><X className="w-3.5 h-3.5" /> Cancel Edit</>
            ) : (
              <><Edit2 className="w-3.5 h-3.5 text-neutral-400" /> Edit Profile</>
            )}
          </button>
        </div>

        {/* Action Notifications */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 text-xs rounded-xl flex items-center gap-2 font-semibold shadow-inner">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
          </div>
        )}

        {isEditing ? (
          /* EDIT PROFILE FORM */
          <form onSubmit={handleProfileSave} className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-5 shadow-sm">
            <div className="border-b border-neutral-100 dark:border-neutral-800/60 pb-3">
              <h3 className="text-sm font-black text-neutral-900 dark:text-white">Edit Basic Parameters</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">Manage public metadata points attached to this participant.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Full Name</label>
                <input
                  id="edit-profile-name-input"
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Phone Number</label>
                <input
                  id="edit-profile-phone-input"
                  type="text"
                  value={formPhone}
                  placeholder="e.g. +91 98765 43210"
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Profile Picture URL</label>
                <input
                  id="edit-profile-image-input"
                  type="url"
                  value={formImage}
                  placeholder="https://images.unsplash.com/photo-..."
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              id="save-profile-btn"
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/70 text-white font-bold text-xs py-2.5 w-full rounded-xl transition-all shadow-md shadow-emerald-500/10 active:scale-98"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {saving ? 'Saving Records...' : 'Save Profile Changes'}
            </button>
          </form>
        ) : (
          /* STANDARD INFO AND ATHLETIC DATA GRID */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Left side: Stats board */}
            <div className="md:col-span-1 p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-xs uppercase font-black text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5 border-b pb-2.5 dark:border-neutral-800/80 tracking-wider">
                <Award className="w-4 h-4 text-emerald-500" /> Stats Scorecard
              </h3>

              <div className="grid grid-cols-2 gap-2.5 text-center">
                <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-850 rounded-xl shadow-inner">
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold block uppercase tracking-wide">Goals</span>
                  <span className="text-xl font-black font-mono text-neutral-900 dark:text-white">{user.goals || 0}</span>
                </div>
                <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-850 rounded-xl shadow-inner">
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold block uppercase tracking-wide">Assists</span>
                  <span className="text-xl font-black font-mono text-neutral-900 dark:text-white">{user.assists || 0}</span>
                </div>
                <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-850 rounded-xl shadow-inner">
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold block uppercase tracking-wide">Played</span>
                  <span className="text-xl font-black font-mono text-neutral-900 dark:text-white">{user.matchesPlayed || 0}</span>
                </div>
                <div className="p-3 bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-850 rounded-xl shadow-inner">
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold block uppercase tracking-wide">Wins</span>
                  <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">{user.wins || 0}</span>
                </div>
              </div>

              {/* Progress summary item */}
              <div className="p-3.5 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/70 dark:border-emerald-900/20 rounded-xl space-y-2 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider block">Cumulative Win Ratio</span>
                <p className="text-2xl font-black font-mono text-neutral-900 dark:text-white">{winRatio}%</p>
                <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden shadow-inner">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${winRatio}%` }}></div>
                </div>
              </div>
            </div>

            {/* Right side: History lists */}
            <div className="md:col-span-2 space-y-4">
              {/* Contact Information Cards */}
              <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm space-y-3.5">
                <h3 className="text-xs uppercase font-black text-neutral-400 dark:text-neutral-500 tracking-wider border-b pb-2 dark:border-neutral-800/80">
                  Contact Metadata
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-700 dark:text-neutral-300 font-medium">
                  <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-neutral-400 shrink-0" /> {user.email}</span>
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-neutral-400 shrink-0" /> {user.phone || 'No Contact registered'}
                  </span>
                </div>
              </div>

              {/* Club / Tournament Histories */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Club affiliations */}
                <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-3 shadow-sm">
                  <span className="text-[10px] uppercase font-black text-neutral-400 dark:text-neutral-500 tracking-wider flex items-center gap-1.5 border-b pb-2 dark:border-neutral-800/80">
                    <Users className="w-3.5 h-3.5 text-emerald-500" /> Club Affiliations
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800">
                    {!user.teamHistory || user.teamHistory.length === 0 ? (
                      <span className="text-xs text-neutral-400 dark:text-neutral-500 italic block pt-1">No historical affiliations</span>
                    ) : (
                      user.teamHistory.map((cl, i) => (
                        <div key={i} className="px-3 py-1.5 text-xs font-semibold bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 rounded-xl border border-neutral-100 dark:border-neutral-850 shadow-sm flex items-center gap-1.5">
                          <span>⚽</span> <span className="truncate">{cl}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Tournament History */}
                <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-3 shadow-sm">
                  <span className="text-[10px] uppercase font-black text-neutral-400 dark:text-neutral-500 tracking-wider flex items-center gap-1.5 border-b pb-2 dark:border-neutral-800/80">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" /> Tournaments Played
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800">
                    {!user.tournamentHistory || user.tournamentHistory.length === 0 ? (
                      <span className="text-xs text-neutral-400 dark:text-neutral-500 italic block pt-1">No tournament cups registered</span>
                    ) : (
                      user.tournamentHistory.map((tour, i) => (
                        <div key={i} className="px-3 py-1.5 text-xs font-semibold bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 rounded-xl border border-neutral-100 dark:border-neutral-850 shadow-sm flex items-center gap-1.5">
                          <span>🏆</span> <span className="truncate">{tour}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}