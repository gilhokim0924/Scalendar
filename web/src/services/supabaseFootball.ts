import { supabase } from '../lib/supabase';

const CURRENT_SEASON = '2025-2026';

interface TeamRow {
  id: string;
  league_id: string;
  name: string;
  league_name: string;
}

interface EventRow {
  id: string;
  league_id: string;
  round: number;
  season: string;
  date_event: string;
  time_event: string | null;
  venue: string | null;
  league_name: string;
  home_team: string;
  away_team: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number | null;
  away_score: number | null;
}

interface StandingRow {
  league_id: string;
  season: string;
  team_id: string;
  team_name: string;
  rank: number;
  played: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
}

export async function fetchTeams(leagueId: string) {
  const { data, error } = await supabase
    .from('teams')
    .select('id, league_id, name, league_name')
    .eq('league_id', leagueId)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as TeamRow[];
}

export async function fetchEvents(leagueId: string, rounds?: number[]) {
  let query = supabase
    .from('events')
    .select('id, league_id, round, season, date_event, time_event, venue, league_name, home_team, away_team, home_team_id, away_team_id, home_score, away_score')
    .eq('league_id', leagueId)
    .eq('season', CURRENT_SEASON)
    .order('date_event', { ascending: true })
    .order('time_event', { ascending: true });

  if (rounds && rounds.length > 0) {
    query = query.in('round', rounds);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as EventRow[];
}

export async function fetchStandings(leagueId: string) {
  const { data, error } = await supabase
    .from('standings')
    .select('league_id, season, team_id, team_name, rank, played, w, d, l, gf, ga, gd, pts')
    .eq('league_id', leagueId)
    .eq('season', CURRENT_SEASON)
    .order('rank', { ascending: true });

  if (error) throw error;
  return (data ?? []) as StandingRow[];
}
