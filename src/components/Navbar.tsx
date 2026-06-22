import { UserProfile } from '../types';
import { LogOut, Sun, Moon, Shield, Award, User, Layers, Calendar, Users, Trophy } from 'lucide-react';

interface NavbarProps {
  user: UserProfile | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onLogout: () => void;
  onOpenLogin: () => void;
}

export default function Navbar({
  user,
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  onLogout,
  onOpenLogin,
}: NavbarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'matches', label: 'Matches', icon: Calendar },
    { id: 'tournaments', label: 'Tournaments', icon: Trophy },
    { id: 'leaderboards', label: 'Leaderboards', icon: Award },
  ];

  return (
    <header id="app-navbar" className="sticky top-0 z-40 w-full border-b backdrop-blur-md bg-white/80 dark:bg-neutral-900/80 border-neutral-200 dark:border-neutral-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/20">
              ⚽
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-350 bg-clip-text text-transparent">
                SELVASOCCER
              </span>
              <span className="text-xs block text-emerald-500 font-bold -mt-1 tracking-wider uppercase">
                Scorecard
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-emerald-400 font-bold" /> : <Moon className="w-4 h-4 text-violet-600" />}
            </button>

            {/* Profile / Auth Controls */}
            {user ? (
              <div className="flex items-center gap-3">
                {/* User Info Card */}
                <button
                  id="profile-tab-btn"
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-2 text-left p-1 rounded-lg transition-all border ${
                    activeTab === 'profile'
                      ? 'border-emerald-250 bg-emerald-55/50 dark:border-emerald-950/40 dark:bg-emerald-950/10'
                      : 'border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full border border-emerald-200 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-650 font-bold dark:text-neutral-300">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden lg:block">
                    <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 line-clamp-1 max-w-[120px]">
                      {user.name}
                    </div>
                    <div className="flex items-center gap-1">
                      {user.role === 'admin' ? (
                        <span className="text-[9px] px-1 py-0.2 bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 font-bold uppercase rounded-sm flex items-center gap-0.5">
                          <Shield className="w-2.5 h-2.5" /> Admin
                        </span>
                      ) : (
                        <span className="text-[9px] px-1 py-0.2 bg-blue-105 text-blue-705 dark:bg-blue-950/40 dark:text-blue-400 font-bold uppercase rounded-sm">
                          Player
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                {/* Logout Button */}
                <button
                  id="logout-nav-btn"
                  onClick={onLogout}
                  className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                  title="Logout Session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="login-cta-btn"
                onClick={onOpenLogin}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md shadow-emerald-500/10 transition-all"
              >
                <User className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Floating Bottom Navigation Tab bar for Mobile devices */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-neutral-900/95 border-t border-neutral-200 dark:border-neutral-800 backdrop-blur-lg">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg transition-colors ${
                  isActive ? 'text-emerald-500' : 'text-neutral-500 dark:text-neutral-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
