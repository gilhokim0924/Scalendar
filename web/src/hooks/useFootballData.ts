import { useQuery } from '@tanstack/react-query';
import { fetchEvents, fetchStandings, fetchTeams } from '../services/supabaseFootball';
import type { SportsEvent, Team } from '../types';

export interface FootballStanding {
  rank: number;
  team: string;
  played: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  teamId: string;
}

function toUtcDateTime(date: string, time: string | null): string {
  const normalized = (time ?? '00:00:00').replace('Z', '').replace('+00:00', '');
  return `${date}T${normalized}Z`;
}

function rowToEvent(row: Awaited<ReturnType<typeof fetchEvents>>[number]): SportsEvent {
  return {
    id: row.id,
    sport_id: '1',
    round: row.round,
    home_team_id: row.home_team_id,
    away_team_id: row.away_team_id,
    title: `${row.home_team} vs ${row.away_team}`,
    datetime_utc: toUtcDateTime(row.date_event, row.time_event),
    venue: row.venue || 'TBD',
    competition: row.league_name,
    external_event_id: row.id,
    home_score: row.home_score ?? undefined,
    away_score: row.away_score ?? undefined,
    home_team_name: row.home_team,
    away_team_name: row.away_team,
  };
}

const queryConfig = {
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  retry: 2,
};

export function useLeagueEvents(leagueId: string, rounds?: number[]) {
  return useQuery({
    queryKey: ['leagueEvents', leagueId, rounds],
    queryFn: async () => {
      const events = await fetchEvents(leagueId, rounds);
      return events.map(rowToEvent);
    },
    ...queryConfig,
  });
}

export function usePLEvents() {
  return useLeagueEvents('4328');
}

export function useUCLEvents() {
  return useLeagueEvents('4480');
}

export function useComputedStandings(leagueId: string) {
  return useQuery({
    queryKey: ['computedStandings', leagueId],
    queryFn: async () => {
      const standings = await fetchStandings(leagueId);
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

export function usePLStandings() {
  return useComputedStandings('4328');
}

export function useUCLStandings() {
  return useComputedStandings('4480');
}

export function useLeagueTeams(leagueId: string) {
  return useQuery({
    queryKey: ['leagueTeams', leagueId],
    queryFn: async () => {
      const teams = await fetchTeams(leagueId);
      return teams.map((t): Team => ({
        id: t.id,
        sport_id: '1',
        name: t.name,
        external_api_id: t.id,
        league: t.league_name,
      }));
    },
    ...queryConfig,
  });
}
