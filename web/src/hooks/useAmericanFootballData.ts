import { useQuery } from '@tanstack/react-query';
import { fetchAmericanFootballEvents, fetchAmericanFootballStandings, fetchAmericanFootballTeams } from '../services/supabaseAmericanFootball';
import type { FootballStanding } from './useFootballData';
import type { SportsEvent, Team } from '../types';

export const AMERICAN_FOOTBALL_LEAGUES = {
  nfl: { id: '4391', name: 'NFL' },
} as const;

function toUtcDateTime(date: string, time: string | null): string {
  const normalized = (time ?? '00:00:00').replace('Z', '').replace('+00:00', '');
  return `${date}T${normalized}Z`;
}

function rowToEvent(row: Awaited<ReturnType<typeof fetchAmericanFootballEvents>>[number]): SportsEvent {
  const homeName = row.home_team?.trim() || 'Home';
  const awayName = row.away_team?.trim() || 'Away';
  return {
    id: row.id,
    sport_id: '5',
    round: row.round,
    home_team_id: row.home_team_id,
    away_team_id: row.away_team_id,
    title: `${homeName} vs ${awayName}`,
    datetime_utc: toUtcDateTime(row.date_event, row.time_event),
    venue: row.venue || 'TBD',
    competition: row.league_name,
    external_event_id: row.id,
    home_score: row.home_score ?? undefined,
    away_score: row.away_score ?? undefined,
    home_team_name: homeName,
    away_team_name: awayName,
  };
}

const queryConfig = {
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  retry: 2,
};

export function useAmericanFootballLeagueEvents(leagueId: string) {
  return useQuery({
    queryKey: ['americanFootballLeagueEvents', leagueId],
    queryFn: async () => {
      const events = await fetchAmericanFootballEvents(leagueId);
      return events.map(rowToEvent);
    },
    ...queryConfig,
  });
}

export function useNFLEvents() {
  return useAmericanFootballLeagueEvents(AMERICAN_FOOTBALL_LEAGUES.nfl.id);
}

export function useAmericanFootballLeagueTeams(leagueId: string) {
  return useQuery({
    queryKey: ['americanFootballLeagueTeams', leagueId],
    queryFn: async () => {
      const teams = await fetchAmericanFootballTeams(leagueId);
      return teams.map((team): Team => ({
        id: team.id,
        sport_id: '5',
        name: team.name,
        external_api_id: team.id,
        league: team.league_name,
      }));
    },
    ...queryConfig,
  });
}

export function useAmericanFootballStandings(leagueId: string) {
  return useQuery({
    queryKey: ['americanFootballStandings', leagueId],
    queryFn: async () => {
      const standings = await fetchAmericanFootballStandings(leagueId);
      return standings.map((row): FootballStanding => ({
        rank: row.rank,
        team: row.team_name,
        played: row.played,
        w: row.w,
        d: row.d,
        l: row.l,
        gf: row.gf,
        ga: row.ga,
        gd: row.gd,
        pts: row.pts,
        teamId: row.team_id,
      }));
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
  });
}

export function useNFLStandings() {
  return useAmericanFootballStandings(AMERICAN_FOOTBALL_LEAGUES.nfl.id);
}
