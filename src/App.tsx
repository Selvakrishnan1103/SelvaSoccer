import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile, Team, Match, Tournament, MatchEvent } from './types';

import Navbar from './components/Navbar';
import DashboardStats from './components/DashboardStats';
import TeamManagement from './components/TeamManagement';
import MatchManagement from './components/MatchManagement';
import LiveScorecard from './components/LiveScorecard';
import Leaderboards from './components/Leaderboards';
import UserProfileComp from './components/UserProfileComp';
import AuthModal from './components/AuthModal';
import MatchDetailsModal from './components/MatchDetailsModal';

import {
  saveTeam,
  saveMatch,
  saveTournament,
  fetchMatchEvents,
  addMatchEvent,
  deleteMatchEvent,
  completeMatchWorkflow
} from './utils/db';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(true);

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [matchEventsMap, setMatchEventsMap] = useState<Record<string, MatchEvent[]>>({});

  const [activeScoringMatch, setActiveScoringMatch] = useState<Match | null>(null);
  const [activeScoringEvents, setActiveScoringEvents] = useState<MatchEvent[]>([]);

  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [inspectedMatchId, setInspectedMatchId] = useState<string | null>(null);
  const [inspectedEvents, setInspectedEvents] = useState<MatchEvent[]>([]);

  // Sync System Dark Mode Configuration Class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Real-time Database Listeners
  useEffect(() => {
    const unsubs: (() => void)[] = [];

    function initializeAndListen() {
      const usersSub = onSnapshot(collection(db, 'users'), (snap) => {
        const uList = snap.docs.map(d => ({ id: d.id, ...d.data() }) as UserProfile);
        setUsers(uList);
      });
      unsubs.push(usersSub);

      const teamsSub = onSnapshot(collection(db, 'teams'), (snap) => {
        const tList = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Team);
        setTeams(tList);
      });
      unsubs.push(teamsSub);

      const tourneySub = onSnapshot(collection(db, 'tournaments'), (snap) => {
        const tnList = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Tournament);
        setTournaments(tnList);
      });
      unsubs.push(tourneySub);

      const matchesSub = onSnapshot(collection(db, 'matches'), (snap) => {
        const mList = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Match);
        setMatches(mList);

        mList.forEach((m) => {
          const eventsSub = onSnapshot(collection(db, 'matches', m.id, 'events'), (eSnap) => {
            const evts = eSnap.docs.map(d => ({ id: d.id, ...d.data() }) as MatchEvent);
            setMatchEventsMap(prev => ({ ...prev, [m.id]: evts }));

            if (activeScoringMatch && activeScoringMatch.id === m.id) {
              setActiveScoringEvents(evts);
            }
            if (inspectedMatchId === m.id) {
              setInspectedEvents(evts);
            }
          });
          unsubs.push(eventsSub);
        });
      });
      unsubs.push(matchesSub);
    }

    initializeAndListen();

    return () => {
      unsubs.forEach(fn => fn());
    };
  }, [activeScoringMatch?.id, inspectedMatchId]);

  // Firebase Authentication Core Watcher State
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const unsubProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUser(docSnap.data() as UserProfile);
          } else {
            const defaultProf: UserProfile = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Player',
              email: firebaseUser.email || '',
              role: 'user',
              goals: 0,
              assists: 0,
              matchesPlayed: 0,
              wins: 0
            };
            setDoc(userDocRef, defaultProf);
            setUser(defaultProf);
          }
        });
        return () => unsubProfile();
      } else {
        setUser(null);
      }
    });

    return () => unsubAuth();
  }, []);

  // Handler Workflow Functions
  const handleStartMatch = async (match: Match) => {
    const updatedMatch: Match = { ...match, status: 'live' };
    await saveMatch(updatedMatch);
    const evs = await fetchMatchEvents(match.id);
    setActiveScoringEvents(evs);
    setActiveScoringMatch(updatedMatch);
  };

  const handleEndMatchWorkflowOnFirebase = async (matchId: string, events: MatchEvent[]) => {
    const activeMatch = matches.find(m => m.id === matchId);
    if (!activeMatch) return;
    await completeMatchWorkflow(activeMatch, events, teams, users);
    setActiveScoringMatch(null);
  };

  const handleSaveTeam = async (team: Team) => {
    await saveTeam(team);
  };

  const handleSaveMatch = async (match: Match) => {
    await saveMatch(match);
  };

  const handleSaveTournamentAndFixtures = async (tournament: Tournament, fixtures: Match[]) => {
    await saveTournament(tournament);
    for (const m of fixtures) {
      await saveMatch(m);
    }
  };

  const handleAddMatchEvent = async (event: MatchEvent) => {
    await addMatchEvent(event.matchId, event);
  };

  const handleDeleteMatchEvent = async (eventId: string) => {
    if (activeScoringMatch) {
      await deleteMatchEvent(activeScoringMatch.id, eventId);
    }
  };

  const handleViewMatchDetails = async (matchId: string) => {
    const evList = await fetchMatchEvents(matchId);
    setInspectedEvents(evList);
    setInspectedMatchId(matchId);
  };

  const handleUpdateProfileDataOfUser = async (userId: string, data: Partial<UserProfile>) => {
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, data, { merge: true });
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setActiveTab('dashboard');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 transition-colors duration-200 antialiased selection:bg-emerald-500 selection:text-white">
      {activeScoringMatch ? (
        <div className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-in fade-in zoom-in-95 duration-200">
          <LiveScorecard
            match={activeScoringMatch}
            teams={teams}
            players={users}
            initialEvents={activeScoringEvents}
            onAddEvent={handleAddMatchEvent}
            onDeleteEvent={handleDeleteMatchEvent}
            onEndMatch={handleEndMatchWorkflowOnFirebase}
            onBack={() => setActiveScoringMatch(null)}
          />
        </div>
      ) : (
        <>
          <Navbar
            user={user}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onLogout={handleLogout}
            onOpenLogin={() => setShowAuthModal(true)}
          />

          <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
            {activeTab === 'dashboard' && (
              <DashboardStats
                teams={teams}
                players={users}
                matches={matches}
                tournaments={tournaments}
                isAdmin={isAdmin}
                onStartMatch={handleStartMatch}
                onViewMatchDetails={handleViewMatchDetails}
                setActiveTab={setActiveTab}
                onOpenCreateMatchModal={() => setActiveTab('matches')}
                onOpenCreateTeamModal={() => setActiveTab('teams')}
                onOpenCreateTournamentModal={() => setActiveTab('tournaments')}
              />
            )}

            {activeTab === 'teams' && (
              <TeamManagement
                teams={teams}
                players={users}
                isAdmin={isAdmin}
                onSaveTeam={handleSaveTeam}
              />
            )}

            {activeTab === 'matches' && (
              <MatchManagement
                matches={matches}
                teams={teams}
                tournaments={tournaments}
                players={users}
                isAdmin={isAdmin}
                onSaveMatch={handleSaveMatch}
                onSaveTournament={handleSaveTournamentAndFixtures}
                onStartMatch={handleStartMatch}
                onViewMatchDetails={handleViewMatchDetails}
                matchEventsMap={matchEventsMap}
              />
            )}

            {activeTab === 'tournaments' && (
              <MatchManagement
                matches={matches}
                teams={teams}
                tournaments={tournaments}
                players={users}
                isAdmin={isAdmin}
                onSaveMatch={handleSaveMatch}
                onSaveTournament={handleSaveTournamentAndFixtures}
                onStartMatch={handleStartMatch}
                onViewMatchDetails={handleViewMatchDetails}
                matchEventsMap={matchEventsMap}
              />
            )}

            {activeTab === 'leaderboards' && (
              <Leaderboards
                teams={teams}
                players={users}
                matches={matches}
              />
            )}

            {activeTab === 'profile' && user && (
              <UserProfileComp
                user={user}
                onUpdateProfile={handleUpdateProfileDataOfUser}
              />
            )}
          </main>
        </>
      )}

      {/* Global Application Footer Container Layout */}
      <footer className="border-t dark:border-neutral-900 border-neutral-200 mt-auto bg-white dark:bg-neutral-950 text-neutral-400 text-xs py-6 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div>
            <span className="font-extrabold tracking-widest text-emerald-500 uppercase text-[10px] block">
              SelvaSoccer League Orchestrator
            </span>
            <p className="mt-1 text-neutral-400 dark:text-neutral-500 font-medium">
              &copy; 2026 SelvaSoccer Stadium. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-semibold text-neutral-500 dark:text-neutral-400">
            <span className="cursor-pointer hover:text-emerald-500 transition-colors" onClick={() => setActiveTab('leaderboards')}>Standings</span>
            <span className="cursor-pointer hover:text-emerald-500 transition-colors" onClick={() => setActiveTab('matches')}>Fixture Calendar</span>
            <span className="cursor-pointer hover:text-emerald-500 transition-colors">Support Unit</span>
          </div>
        </div>
      </footer>

      {/* Authenticated Global Portal Modals */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={(uProf) => {
            setUser(uProf);
            setShowAuthModal(false);
          }}
        />
      )}

      {inspectedMatchId && (
        <MatchDetailsModal
          matchId={inspectedMatchId}
          matches={matches}
          teams={teams}
          events={inspectedEvents}
          onClose={() => setInspectedMatchId(null)}
        />
      )}
    </div>
  );
}