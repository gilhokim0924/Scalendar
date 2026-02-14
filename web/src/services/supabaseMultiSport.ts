import { supabase } from '../lib/supabase';

export interface SportRow {
  id: string;
  key: string;
  name: string;
}

export interface CompetitionRow {
  id: string;
  sport_id: string;
  external_id: string | null;
  name: string;
  country: string | null;
  format: string | null;
}

export interface ParticipantRow {
  id: string;
  sport_id: string;
  external_id: string | null;
  name: string;
  participant_type: 'team' | 'driver' | 'constructor';
  short_name: string | null;
  country: string | null;
}

export interface EventRowV2 {
  id: string;
  sport_id: string;
  competition_id: string;
  external_id: string | null;
  season: string;
  round: string | null;
  stage: string | null;
  starts_at_utc: string;
  venue: string | null;
  status: string | null;
  metadata: Record<string, unknown>;
}

export interface EventParticipantRow {
  event_id: string;
  participant_id: string;
  role: string;
  score: number | null;
  result_position: number | null;
  outcome: string | null;
  metadata: Record<string, unknown>;
}

export interface StandingRowV2 {
  id: string;
  competition_id: string;
  season: string;
  participant_id: string;
  rank: number;
  points: number;
  played: number | null;
  wins: number | null;
  draws: number | null;
  losses: number | null;
  scored: number | null;
  conceded: number | null;
  diff: number | null;
  metadata: Record<string, unknown>;
}

export async function fetchSports() {
  const { data, error } = await supabase
    .from('sports')
    .select('id, key, name')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as SportRow[];
}

export async function fetchCompetitionsBySport(sportKey: string) {
  const { data, error } = await supabase
    .from('competitions')
    .select('id, sport_id, external_id, name, country, format, sports!inner(key)')
    .eq('sports.key', sportKey)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    sport_id: row.sport_id,
    external_id: row.external_id,
    name: row.name,
    country: row.country,
    format: row.format,
  })) as CompetitionRow[];
}

export async function fetchCompetitionByExternalId(sportKey: string, externalId: string) {
  const { data, error } = await supabase
    .from('competitions')
    .select('id, sport_id, external_id, name, country, format, sports!inner(key)')
    .eq('sports.key', sportKey)
    .eq('external_id', externalId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    sport_id: data.sport_id,
    external_id: data.external_id,
    name: data.name,
    country: data.country,
    format: data.format,
  } as CompetitionRow;
}

export async function fetchParticipantsBySport(sportKey: string, participantType?: ParticipantRow['participant_type']) {
  let query = supabase
    .from('participants')
    .select('id, sport_id, external_id, name, participant_type, short_name, country, sports!inner(key)')
    .eq('sports.key', sportKey)
    .order('name', { ascending: true });

  if (participantType) {
    query = query.eq('participant_type', participantType);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    sport_id: row.sport_id,
    external_id: row.external_id,
    name: row.name,
    participant_type: row.participant_type,
    short_name: row.short_name,
    country: row.country,
  })) as ParticipantRow[];
}

export async function fetchParticipantsByIds(participantIds: string[]) {
  if (participantIds.length === 0) return [];

  const { data, error } = await supabase
    .from('participants')
    .select('id, sport_id, external_id, name, participant_type, short_name, country')
    .in('id', participantIds);

  if (error) throw error;
  return (data ?? []) as ParticipantRow[];
}

export async function fetchEventsByCompetition(competitionId: string, season: string) {
  const { data, error } = await supabase
    .from('events')
    .select('id, sport_id, competition_id, external_id, season, round, stage, starts_at_utc, venue, status, metadata')
    .eq('competition_id', competitionId)
    .eq('season', season)
    .order('starts_at_utc', { ascending: true });

  if (error) throw error;
  return (data ?? []) as EventRowV2[];
}

export async function fetchEventParticipants(eventIds: string[]) {
  if (eventIds.length === 0) return [];

  const { data, error } = await supabase
    .from('event_participants')
    .select('event_id, participant_id, role, score, result_position, outcome, metadata')
    .in('event_id', eventIds);

  if (error) throw error;
  return (data ?? []) as EventParticipantRow[];
}

export async function fetchStandingsByCompetition(competitionId: string, season: string) {
  const { data, error } = await supabase
    .from('standings')
    .select('id, competition_id, season, participant_id, rank, points, played, wins, draws, losses, scored, conceded, diff, metadata')
    .eq('competition_id', competitionId)
    .eq('season', season)
    .order('rank', { ascending: true });

  if (error) throw error;
  return (data ?? []) as StandingRowV2[];
}
