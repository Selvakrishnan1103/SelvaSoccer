import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { UserProfile } from '../types';
import { X, Lock, Mail, User, Phone, AlertCircle, Loader2 } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export default function AuthModal({
  onClose,
  onSuccess,
}: AuthModalProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (loading) return;

    if (isLoginMode) {
      if (!email || !password) {
        setErrorMsg('Please enter both email and password.');
        return;
      }

      setLoading(true);
      try {
        const uCred = await signInWithEmailAndPassword(auth, email.trim(), password);
        const userDocRef = doc(db, 'users', uCred.user.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          onSuccess(userSnap.data() as UserProfile);
        } else {
          const fallbackProfile: UserProfile = {
            id: uCred.user.uid,
            name: email.split('@')[0],
            email: email.trim(),
            role: email.trim() === 'selvakrish601@gmail.com' ? 'admin' : 'user',
            goals: 0,
            assists: 0,
            matchesPlayed: 0,
            wins: 0
          };
          await setDoc(userDocRef, fallbackProfile);
          onSuccess(fallbackProfile);
        }
        onClose();
      } catch (err: any) {
        console.error(err);
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          setErrorMsg('Invalid email or password credentials.');
        } else {
          setErrorMsg(err.message || 'Authentication failed.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      if (!email.trim() || !password || !fullName.trim()) {
        setErrorMsg('Please populate all required fields.');
        return;
      }

      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }

      if (password.length < 6) {
        setErrorMsg('Password should be at least 6 characters long.');
        return;
      }

      setLoading(true);
      try {
        const uCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const targetEmail = email.trim().toLowerCase();

        const role = (
          targetEmail === 'selvakrish601@gmail.com' ||
          targetEmail.startsWith('admin@')
        ) ? 'admin' : 'user';

        const newProfile: UserProfile = {
          id: uCred.user.uid,
          name: fullName.trim(),
          email: targetEmail,
          phone: phone.trim() || undefined,
          role: role as 'admin' | 'user',
          goals: 0,
          assists: 0,
          matchesPlayed: 0,
          wins: 0,
          teamHistory: [],
          tournamentHistory: []
        };

        await setDoc(doc(db, 'users', uCred.user.uid), newProfile);
        onSuccess(newProfile);
        onClose();
      } catch (err: any) {
        console.error(err);
        if (err.code === 'auth/email-already-in-use') {
          setErrorMsg('This email is already associated with another account.');
        } else {
          setErrorMsg(err.message || 'Failed to complete registration.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  function initFields() {
    setEmail('');
    setPassword('');
    setFullName('');
    setPhone('');
    setConfirmPassword('');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-md transition-opacity duration-300">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl p-6 sm:p-8 space-y-6 transform scale-100 transition-all duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-xl font-black tracking-tight text-zinc-950 dark:text-zinc-50">
              {isLoginMode ? 'Sign In SelvaSoccer' : 'Register Player Profile'}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {isLoginMode ? 'Welcome back, league competitor.' : 'Register to log goals, assist statistics, and play matches.'}
            </p>
          </div>
          <button
            id="close-auth-modal-btn"
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Block */}
        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-center gap-2 font-medium border border-red-200 dark:border-red-900/50">
            <AlertCircle className="w-4 h-4 shrink-0" /> 
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          
          {/* Sign Up Fields Only */}
          {!isLoginMode && (
            <>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                  <input
                    id="reg-fullname-input"
                    type="text"
                    placeholder="Selvakrishnan K"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                  <input
                    id="reg-phone-input"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              <input
                id="auth-email-input"
                type="email"
                placeholder="competitor@scorecard.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Password *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              <input
                id="auth-password-input"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition"
                required
              />
            </div>
          </div>

          {/* Confirm Password (Sign up only) */}
          {!isLoginMode && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                <input
                  id="reg-confirm-password-input"
                  type="password"
                  placeholder="••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition"
                  required
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/60 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {loading ? 'Processing Authenticatory...' : isLoginMode ? 'Sign In To Account' : 'Assemble Competitor'}
          </button>
        </form>

        {/* Toggle Mode Footer */}
        <div className="text-center pt-2 text-xs border-t border-zinc-100 dark:border-zinc-800/60">
          <span className="text-zinc-500 dark:text-zinc-400">
            {isLoginMode ? 'New player to the league?' : 'Already have a registered player card?'}
          </span>{' '}
          <button
            id="auth-toggle-btn"
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setErrorMsg('');
              initFields();
            }}
            className="text-emerald-500 font-extrabold hover:text-emerald-600 hover:underline transition"
          >
            {isLoginMode ? 'Create Profile' : 'Sign In Now'}
          </button>
        </div>
      </div>
    </div>
  );
}