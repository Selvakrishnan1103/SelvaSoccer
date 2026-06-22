import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  Trophy, 
  Dribbble, 
  ShieldAlert, 
  Calendar, 
  Save, 
  Edit2, 
  CheckCircle2, 
  Users 
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

  // Compute mock win ratios
  const winRatio = user.matchesPlayed > 0 
    ? Math.round((user.wins / user.matchesPlayed) * 100) 
    : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Banner */}
      <div className="relative h-32 rounded-3xl bg-neutral-900 border border-neutral-805 overflow-hidden shadow-sm">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-400 via-emerald-600 to-black"></div>
      </div>

      {/* Profile Detail block */}
      <div className="relative -mt-16 px-6 sm:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-24 h-24 rounded-3xl border-4 border-white dark:border-neutral-950 object-cover shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-3xl border-4 border-white dark:border-neutral-950 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-black text-3xl shadow-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white leading-none">
                  {user.name}
                </h1>
                <span className={`px-2 py-0.5 text-[9px] uppercase font-black rounded-md ${user.role === 'admin' ? 'bg-red-50 text-red-650' : 'bg-blue-105 text-blue-705 border'}`}>
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-neutral-450 flex items-center justify-center sm:justify-start gap-1">
                <Mail className="w-3.5 h-3.5" /> {user.email}
              </p>
            </div>
          </div>

          <button
            id="toggle-edit-profile-btn"
            onClick={() => setIsEditing(!isEditing)}
            className="self-center sm:self-end flex items-center gap-1 bg-neutral-50 dark:bg-neutral-850 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-750 font-bold text-xs py-2 px-3.5 rounded-xl transition dark:text-white"
          >
            {isEditing ? 'Cancel Edit' : <><Edit2 className="w-3.5 h-3.5" /> Edit Profile</>}
          </button>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-650 dark:text-emerald-400 text-xs rounded-xl flex items-center gap-1.5 font-medium animate-pulse">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
          </div>
        )}

        {isEditing ? (
          /* EDIT PROFILE FORM */
          <form onSubmit={handleProfileSave} className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 rounded-2xl space-y-4">
            <h3 className="text-sm font-black text-neutral-800 dark:text-neutral-100 border-b pb-2">Edit Basic Parameters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-550 uppercase">Full Name</label>
                <input
                  id="edit-profile-name-input"
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-xl dark:text-white outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-550 uppercase">Phone Number</label>
                <input
                  id="edit-profile-phone-input"
                  type="text"
                  value={formPhone}
                  placeholder="e.g. +91 98765 43210"
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-xl dark:text-white outline-none"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-bold text-neutral-550 uppercase">Profile Picture URL (Unsplash/Web)</label>
                <input
                  id="edit-profile-image-input"
                  type="url"
                  value={formImage}
                  placeholder="https://images.unsplash.com/photo-..."
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-xl dark:text-white outline-none"
                />
              </div>
            </div>

            <button
              id="save-profile-btn"
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-2 w-full rounded-xl transition shadow-lg shadow-emerald-500/10"
            >
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        ) : (
          /* STANDARD INFO AND ATHLETIC DATA GRID */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left side: Stats board */}
            <div className="md:col-span-1 p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-xs uppercase font-extrabold text-neutral-450 flex items-center gap-1.5 border-b pb-2 dark:border-neutral-810">
                <Award className="w-4 h-4 text-emerald-500" /> Stats scorecard
              </h3>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-xl">
                  <span className="text-[10px] text-neutral-450 font-bold block uppercase">Goals</span>
                  <span className="text-lg font-black font-mono text-neutral-900 dark:text-white">{user.goals || 0}</span>
                </div>
                <div className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-xl">
                  <span className="text-[10px] text-neutral-450 font-bold block uppercase">Assists</span>
                  <span className="text-lg font-black font-mono text-neutral-900 dark:text-white">{user.assists || 0}</span>
                </div>
                <div className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-xl">
                  <span className="text-[10px] text-neutral-450 font-bold block uppercase">Played</span>
                  <span className="text-lg font-black font-mono text-neutral-900 dark:text-white">{user.matchesPlayed || 0}</span>
                </div>
                <div className="p-3 bg-neutral-50 dark:bg-neutral-850 rounded-xl">
                  <span className="text-[10px] text-neutral-450 font-bold block uppercase">Wins</span>
                  <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">{user.wins || 0}</span>
                </div>
              </div>

              {/* Progress summary item */}
              <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 rounded-xl space-y-1.5 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Cumulative Win Ratio</span>
                <p className="text-2xl font-black font-mono text-neutral-900 dark:text-emerald-450">{winRatio}%</p>
                <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${winRatio}%` }}></div>
                </div>
              </div>
            </div>

            {/* Right side: History lists */}
            <div className="md:col-span-2 space-y-4">
              {/* Contact Information Cards */}
              <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm space-y-3">
                <h3 className="text-xs uppercase font-extrabold text-neutral-450 flex items-center gap-1">Contact Metadata</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-700 dark:text-neutral-350">
                  <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-neutral-400" /> {user.email}</span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-neutral-400" /> {user.phone || 'No Contact registered'}
                  </span>
                </div>
              </div>

              {/* Club / Tournament Histories */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-3">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest block flex items-center gap-1"><Users className="w-4 h-4 text-emerald-500" /> Club affiliations history</span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {!user.teamHistory || user.teamHistory.length === 0 ? (
                      <span className="text-xs text-neutral-500 italic">No historical club affiliations registered</span>
                    ) : (
                      user.teamHistory.map((cl, i) => (
                        <div key={i} className="px-2.5 py-1 text-xs font-semibold bg-neutral-50 dark:bg-neutral-850 text-neutral-750 dark:text-white rounded-lg border">
                          ⚽ {cl}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-3">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest block flex items-center gap-1"><Trophy className="w-4 h-4 text-amber-500" /> Tournament Cup played</span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {!user.tournamentHistory || user.tournamentHistory.length === 0 ? (
                      <span className="text-xs text-neutral-500 italic">No historical tournament cups registered</span>
                    ) : (
                      user.tournamentHistory.map((tour, i) => (
                        <div key={i} className="px-2.5 py-1 text-xs font-semibold bg-neutral-50 dark:bg-neutral-850 text-neutral-750 dark:text-white rounded-lg border">
                          🏆 {tour}
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
