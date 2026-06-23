import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, Team, Match, MatchEvent, Tournament } from '../types';

async function getCollectionData<T>(collectionName: string): Promise<T[]> {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as unknown as T);
  } catch (error) {
    console.error(`Error reading collection ${collectionName}:`, error);
    return [];
  }
}

export async function fetchUsers(): Promise<UserProfile[]> {
  return getCollectionData<UserProfile>('users');
}

export async function fetchTeams(): Promise<Team[]> {
  return getCollectionData<Team>('teams');
}

export async function fetchMatches(): Promise<Match[]> {
  return getCollectionData<Match>('matches');
}

export async function fetchMatchEvents(matchId: string): Promise<MatchEvent[]> {
  try {
    const eventsRef = collection(db, 'matches', matchId, 'events');
    const snapshot = await getDocs(eventsRef);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as unknown as MatchEvent);
  } catch (error) {
    console.error(`Error fetching match events for match ${matchId}:`, error);
    return [];
  }
}

export async function fetchTournaments(): Promise<Tournament[]> {
  return getCollectionData<Tournament>('tournaments');
}

export async function saveUser(userId: string, data: Partial<UserProfile>): Promise<void> {
  const userDoc = doc(db, 'users', userId);
  await setDoc(userDoc, data, { merge: true });
}

export async function saveTeam(team: Team): Promise<void> {
  const teamDoc = doc(db, 'teams', team.id);
  await setDoc(teamDoc, team);
}

export async function saveMatch(match: Match): Promise<void> {
  const matchDoc = doc(db, 'matches', match.id);
  await setDoc(matchDoc, match);
}

export async function saveTournament(tournament: Tournament): Promise<void> {
  const tournamentDoc = doc(db, 'tournaments', tournament.id);
  await setDoc(tournamentDoc, tournament);
}

export async function addMatchEvent(matchId: string, event: MatchEvent): Promise<void> {
  const eventDoc = doc(db, 'matches', matchId, 'events', event.id);
  await setDoc(eventDoc, event);
}

export async function deleteMatchEvent(matchId: string, eventId: string): Promise<void> {
  const eventDoc = doc(db, 'matches', matchId, 'events', eventId);
  await deleteDoc(eventDoc);
}

export function generateFixtures(
  tournamentId: string, 
  teamIds: string[], 
  format: 'round_robin' | 'knockout',
  teamsMap: Record<string, string>,
  logosMap: Record<string, string>
): Match[] {
  const fixtures: Match[] = [];
  const now = new Date();

  if (format === 'round_robin') {
    const n = teamIds.length;
    const list = [...teamIds];
    if (n % 2 !== 0) list.push('BYE');
    const numTeams = list.length;
    const rounds = numTeams - 1;

    for (let round = 1; round <= rounds; round++) {
      for (let i = 0; i < numTeams / 2; i++) {
        const home = list[i];
        const away = list[numTeams - 1 - i];

        if (home !== 'BYE' && away !== 'BYE') {
          const matchDate = new Date();
          matchDate.setDate(now.getDate() + round * 2);
          const dateStr = matchDate.toISOString().split('T')[0];

          fixtures.push({
            id: `tourney_${tournamentId}_r${round}_m${i}`,
            type: 'tournament',
            tournamentId,
            teamAId: home,
            teamBId: away,
            teamAName: teamsMap[home] || 'Unknown Team',
            teamBName: teamsMap[away] || 'Unknown Team',
            teamALogo: logosMap[home] || '',
            teamBLogo: logosMap[away] || '',
            date: dateStr,
            time: '18:00',
            venue: '',
            status: 'scheduled',
            scoreA: 0,
            scoreB: 0,
            round
          });
        }
      }
      const last = list.pop()!;
      list.splice(1, 0, last);
    }
  } else {
    const numMatches = Math.floor(teamIds.length / 2);

    for (let i = 0; i < numMatches; i++) {
      const home = teamIds[i * 2];
      const away = teamIds[i * 2 + 1];

      const matchDate = new Date();
      matchDate.setDate(now.getDate() + 3);
      const dateStr = matchDate.toISOString().split('T')[0];

      fixtures.push({
        id: `tourney_${tournamentId}_r1_m${i}`,
        type: 'tournament',
        tournamentId,
        teamAId: home,
        teamBId: away,
        teamAName: teamsMap[home] || 'Unknown Team',
        teamBName: teamsMap[away] || 'Unknown Team',
        teamALogo: logosMap[home] || '',
        teamBLogo: logosMap[away] || '',
        date: dateStr,
        time: '16:00',
        venue: '',
        status: 'scheduled',
        scoreA: 0,
        scoreB: 0,
        round: 1
      });
    }
  }

  return fixtures;
}

export async function completeMatchWorkflow(
  match: Match, 
  events: MatchEvent[], 
  teamsList: Team[], 
  playersList: UserProfile[]
): Promise<void> {
  const batch = writeBatch(db);

  let scoreA = 0;
  let scoreB = 0;

  events.forEach((evt) => {
    if (evt.type === 'goal') {
      if (evt.teamId === match.teamAId) scoreA += 1;
      else if (evt.teamId === match.teamBId) scoreB += 1;
    } else if (evt.type === 'own_goal') {
      if (evt.teamId === match.teamAId) scoreB += 1;
      else if (evt.teamId === match.teamBId) scoreA += 1;
    }
  });

  const updatedMatch: Match = {
    ...match,
    status: 'completed',
    scoreA,
    scoreB,
    winnerId: scoreA > scoreB ? match.teamAId : scoreB > scoreA ? match.teamBId : 'draw'
  };

  batch.set(doc(db, 'matches', match.id), updatedMatch);

  const teamADoc = teamsList.find(t => t.id === match.teamAId);
  const teamBDoc = teamsList.find(t => t.id === match.teamBId);

  if (teamADoc) {
    const updatedTeamA: Partial<Team> = {
      matchesPlayed: (teamADoc.matchesPlayed || 0) + 1,
      goalsScored: (teamADoc.goalsScored || 0) + scoreA,
      goalsConceded: (teamADoc.goalsConceded || 0) + scoreB,
    };
    if (scoreA > scoreB) {
      updatedTeamA.wins = (teamADoc.wins || 0) + 1;
      updatedTeamA.points = (teamADoc.points || 0) + 3;
    } else if (scoreA < scoreB) {
      updatedTeamA.losses = (teamADoc.losses || 0) + 1;
    } else {
      updatedTeamA.draws = (teamADoc.draws || 0) + 1;
      updatedTeamA.points = (teamADoc.points || 0) + 1;
    }
    batch.update(doc(db, 'teams', teamADoc.id), updatedTeamA);
  }

  if (teamBDoc) {
    const updatedTeamB: Partial<Team> = {
      matchesPlayed: (teamBDoc.matchesPlayed || 0) + 1,
      goalsScored: (teamBDoc.goalsScored || 0) + scoreB,
      goalsConceded: (teamBDoc.goalsConceded || 0) + scoreA,
    };
    if (scoreB > scoreA) {
      updatedTeamB.wins = (teamBDoc.wins || 0) + 1;
      updatedTeamB.points = (teamBDoc.points || 0) + 3;
    } else if (scoreB < scoreA) {
      updatedTeamB.losses = (teamBDoc.losses || 0) + 1;
    } else {
      updatedTeamB.draws = (teamBDoc.draws || 0) + 1;
      updatedTeamB.points = (teamBDoc.points || 0) + 1;
    }
    batch.update(doc(db, 'teams', teamBDoc.id), updatedTeamB);
  }

  const playerGoalsMap: Record<string, number> = {};

  const playerAssistsMap: Record<string, number> = {};

  events.forEach((evt) => {
    if (evt.type === 'goal') {
      if (evt.playerAId)
        playerGoalsMap[evt.playerAId] = (playerGoalsMap[evt.playerAId] || 0) + 1;
      if (evt.playerBId)
        playerAssistsMap[evt.playerBId] = (playerAssistsMap[evt.playerBId] || 0) + 1;   // ← fixed
    }
  });

  const playingUserIds = new Set<string>();
  if (teamADoc) teamADoc.playerIds.forEach(id => playingUserIds.add(id));
  if (teamBDoc) teamBDoc.playerIds.forEach(id => playingUserIds.add(id));

  playersList.forEach((player) => {
    const goalsInMatch = playerGoalsMap[player.id] || 0;
    const assistsInMatch = playerAssistsMap[player.id] || 0;
    const playedInMatch = playingUserIds.has(player.id) ? 1 : 0;
    const gotWin = playedInMatch && (
      (scoreA > scoreB && teamADoc?.playerIds.includes(player.id)) ||
      (scoreB > scoreA && teamBDoc?.playerIds.includes(player.id))
    ) ? 1 : 0;

    if (goalsInMatch > 0 || assistsInMatch > 0 || playedInMatch > 0) {
      batch.update(doc(db, 'users', player.id), {
        goals: (player.goals || 0) + goalsInMatch,
        assists: (player.assists || 0) + assistsInMatch,
        matchesPlayed: (player.matchesPlayed || 0) + playedInMatch,
        wins: (player.wins || 0) + gotWin,
        teamHistory: player.teamHistory 
          ? Array.from(new Set([
              ...player.teamHistory, 
              teamADoc?.playerIds.includes(player.id) ? teamADoc.name : teamBDoc?.name || ''
            ]))
          : [teamADoc?.playerIds.includes(player.id) ? teamADoc.name : teamBDoc?.name || '']
      });
    }
  });

  await batch.commit();
}