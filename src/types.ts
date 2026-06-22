export type UserRole = 'admin' | 'user';

export interface UserProfile {
  id: string; // matches auth UID
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  profileImage?: string;
  goals: number;
  assists: number;
  matchesPlayed: number;
  wins: number;
  teamHistory?: string[]; // list of team names or search strings
  tournamentHistory?: string[]; // list of tournament names
}

export interface Team {
  id: string;
  name: string;
  logo: string; // path or URL
  description: string;
  captainId?: string;
  viceCaptainId?: string;
  playerIds: string[]; // references user IDs
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsConceded: number;
  points: number; // For One-vs-One Leaderboard
}

export type MatchType = 'one_vs_one' | 'tournament';
export type MatchStatus = 'scheduled' | 'live' | 'completed';

export interface Match {
  id: string;
  type: MatchType;
  tournamentId?: string; // only if type is 'tournament'
  teamAId: string;
  teamBId: string;
  teamAName: string;
  teamBName: string;
  teamALogo: string;
  teamBLogo: string;
  date: string; // format YYYY-MM-DD
  time: string; // format HH:MM
  venue: string;
  status: MatchStatus;
  scoreA: number;
  scoreB: number;
  round?: number; // for tournament rounds (1, 2, 3...)
  winnerId?: string | 'draw'; // populated when completed
}

export type MatchEventType = 
  | 'goal' 
  | 'assist' 
  | 'yellow_card' 
  | 'red_card' 
  | 'own_goal' 
  | 'substitution';

export interface MatchEvent {
  id: string;
  matchId: string;
  type: MatchEventType;
  teamId: string; // team context of the event
  playerAId: string; // primary actor (scorer, carded player, coming OUT)
  playerAName: string;
  playerBId?: string; // secondary actor (assist provider, coming IN)
  playerBName?: string;
  minute: number;
}

export type TournamentFormat = 'round_robin' | 'knockout';
export type TournamentStatus = 'upcoming' | 'ongoing' | 'completed';

export interface Tournament {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  logo: string;
  format: TournamentFormat;
  participatingTeamIds: string[];
  status: TournamentStatus;
}

// Points table Row
export interface TournamentPointsRow {
  teamId: string;
  teamName: string;
  teamLogo: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}
