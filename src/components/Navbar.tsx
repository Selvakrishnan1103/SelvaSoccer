import { UserProfile } from '../types';
import { 
  LogOut, Sun, Moon, Shield, Award, User, 
  Layers, Calendar, Users, Trophy, Menu, X 
} from 'lucide-react';
import { useState } from 'react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'matches', label: 'Matches', icon: Calendar },
    { id: 'tournaments', label: 'Tournaments', icon: Trophy },
    { id: 'leaderboards', label: 'Leaderboards', icon: Award },
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header id="app-navbar" className="sticky top-0 z-40 w-full border-b backdrop-blur-md bg-white/80 dark:bg-neutral-950/80 border-neutral-200 dark:border-neutral-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer group select-none" 
            onClick={() => handleTabClick('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              ⚽
            </div>
            <div>
              <span className="font-black text-lg tracking-wider bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
                SELVASOCCER
              </span>
              <span className="text-[10px] block text-emerald-500 font-black tracking-widest uppercase">
                Scorecard
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-neutral-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Action Interface Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Theme Toggle (Desktop Only) */}
            <button
              id="theme-toggle-btn"
              onClick={() => setDarkMode(!darkMode)}
              className="hidden md:block p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all duration-200"
              title="Toggle Theme"
            >
              {darkMode ? (
                <Sun className="w-4 h-4 text-amber-500 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Profile Avatar / Auth Status CTA */}
            {user ? (
              <button
                id="profile-tab-btn"
                onClick={() => handleTabClick('profile')}
                className={`flex items-center gap-2 text-left p-1 pr-1 sm:pr-2 rounded-lg transition-all border duration-200 ${
                  activeTab === 'profile'
                    ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                    : 'border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-900'
                }`}
              >
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-700 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 font-bold dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                
                {/* Desktop Identity Badges */}
                <div className="hidden lg:block text-xs">
                  <div className="font-bold text-neutral-800 dark:text-neutral-200 line-clamp-1 max-w-[120px]">
                    {user.name}
                  </div>
                  <div className="flex items-center gap-1">
                    {user.role === 'admin' ? (
                      <span className="text-[9px] px-1 py-0.5 bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 font-bold uppercase rounded flex items-center gap-0.5">
                        <Shield className="w-2.5 h-2.5" /> Admin
                      </span>
                    ) : (
                      <span className="text-[9px] px-1 py-0.5 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-bold uppercase rounded">
                        Player
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ) : (
              <button
                id="login-cta-btn"
                onClick={onOpenLogin}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold shadow-md shadow-emerald-500/10 active:scale-98 transition-all duration-150"
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Sign In</span>
              </button>
            )}

            {/* Desktop Logout Trigger Only */}
            {user && (
              <button
                id="logout-nav-btn"
                onClick={onLogout}
                className="hidden md:block p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors duration-200"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}

            {/* Mobile Hamburger Drawer Trigger */}
            <button
              className="md:hidden p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Unified Screen Mobile Drawer Link Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-4 space-y-3 shadow-xl transition-all animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Nav Links Stack */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="border-t border-neutral-100 dark:border-neutral-800/80 pt-3 flex items-center justify-between px-2">
            {/* Inline Theme Customizer */}
            <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Appearance</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs font-semibold dark:text-white"
            >
              {darkMode ? (
                <><RefreshSunIcon /> Light Mode</>
              ) : (
                <><RefreshMoonIcon /> Dark Mode</>
              )}
            </button>
          </div>

          {/* Log out controls for authenticated mobile clients */}
          {user && (
            <div className="border-t border-neutral-100 dark:border-neutral-800/80 pt-2">
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                Logout Account
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

// Micro UI Local Icon Components
function RefreshSunIcon() {
  return <Sun className="w-3.5 h-3.5 text-amber-500" />;
}

function RefreshMoonIcon() {
  return <Moon className="w-3.5 h-3.5 text-indigo-500" />;
}