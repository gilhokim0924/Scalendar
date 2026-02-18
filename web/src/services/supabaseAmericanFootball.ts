import { supabase } from '../lib/supabase';

const AMERICAN_FOOTBALL_SPORT_KEY = 'american_football';

function getCurrentAmericanFootballSeason(now = new Date()) {
  return String(now.getUTCFullYear());
}

const CURRENT_SEASON = getCurrentAmericanFootballSeason();

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
  metadata?: Record<string, unknown>;
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

interface CompetitionLookupRow {
  id: string;
  name: string;
}

async function getAmericanFootballCompetition(leagueId: string) {
  const { data, error } = await supabase
    .from('competitions')
    .select('id, name, sports!inner(key)')
    .eq('sports.key', AMERICAN_FOOTBALL_SPORT_KEY)
    .eq('external_id', leagueId)
    .maybeSingle();

  if (error) throw error;
  return (data as CompetitionLookupRow | null) ?? null;
}

function timestampToDateParts(startsAtUtc: string) {
  const utcDate = new Date(startsAtUtc);
  if (Number.isNaN(utcDate.getTime())) {
    return { date: '', time: null as string | null };
  }

  const iso = utcDate.toISOString();
  return {
    date: iso.slice(0, 10),
    time: iso.slice(11, 19),
  };
}

export async function fetchAmericanFootballTeams(leagueId: string) {
  const { data, error } = await supabase
    .from('teams')
    .select('id, league_id, name, league_name')
    .eq('league_id', leagueId)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as TeamRow[];
}

export async function fetchAmericanFootballEvents(leagueId: string) {
  const competition = await getAmericanFootballCompetition(leagueId);
  if (!competition) return [];

  const { data: eventRows, error: eventError } = await supabase
    .from('events')
    .select('id, external_id, season, round, starts_at_utc, venue, competition_id, metadata')
    .eq('competition_id', competition.id)
    .eq('season', CURRENT_SEASON)
    .order('starts_at_utc', { ascending: true });

  if (eventError) throw eventError;

  const events = eventRows ?? [];
  if (events.length === 0) return [];

  const eventIds = events.map((event) => event.id);

  const { data: eventParticipants, error: eventParticipantError } = await supabase
    .from('event_participants')
    .select('event_id, participant_id, role, score')
    .in('event_id', eventIds);
  if (eventParticipantError) throw eventParticipantError;

  const participantIds = Array.from(new Set((eventParticipants ?? []).map((ep) => ep.participant_id)));
  const { data: participantRows, error: participantError } = await supabase
    .from('participants')
    .select('id, external_id, name')
    .in('id', participantIds);
  if (participantError) throw participantError;

  const participantById = new Map((participantRows ?? []).map((participant) => [participant.id, participant]));
  const participantsByEvent = new Map<string, (typeof eventParticipants extends null ? never : NonNullable<typeof eventParticipants>[number])[]>();

  for (const eventParticipant of eventParticipants ?? []) {
    const items = participantsByEvent.get(eventParticipant.event_id) ?? [];
    items.push(eventParticipant);
    participantsByEvent.set(eventParticipant.event_id, items);
  }

  return events.map((event) => {
    const participants = participantsByEvent.get(event.id) ?? [];
    const home = participants.find((p) => p.role === 'home');
    const away = participants.find((p) => p.role === 'away');
    const homeParticipant = home ? participantById.get(home.participant_id) : null;
    const awayParticipant = away ? participantById.get(away.participant_id) : null;
    const { date, time } = timestampToDateParts(event.starts_at_utc);
    const metadata = (event.metadata && typeof event.metadata === 'object') ? event.metadata : {};
    const metadataHomeName = typeof metadata.home_team === 'string' ? metadata.home_team : '';
    const metadataAwayName = typeof metadata.away_team === 'string' ? metadata.away_team : '';
    const metadataHomeId = typeof metadata.home_team_id === 'string' ? metadata.home_team_id : '';
    const metadataAwayId = typeof metadata.away_team_id === 'string' ? metadata.away_team_id : '';
    const homeTeamName = homeParticipant?.name ?? metadataHomeName;
    const awayTeamName = awayParticipant?.name ?? metadataAwayName;
    const homeTeamId = homeParticipant?.external_id ?? homeParticipant?.id ?? metadataHomeId;
    const awayTeamId = awayParticipant?.external_id ?? awayParticipant?.id ?? metadataAwayId;

    return {
      id: event.external_id ?? event.id,
      league_id: leagueId,
      round: Number.parseInt(event.round ?? '0', 10) || 0,
      season: event.season,
      date_event: date,
      time_event: time,
      venue: event.venue,
      league_name: competition.name,
      home_team: homeTeamName,
      away_team: awayTeamName,
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      home_score: typeof home?.score === 'number' ? home.score : null,
      away_score: typeof away?.score === 'number' ? away.score : null,
      metadata,
    } satisfies EventRow;
  });
}

export async function fetchAmericanFootballStandings(leagueId: string) {
  const competition = await getAmericanFootballCompetition(leagueId);
  if (!competition) return [];

  const { data: standingRows, error: standingError } = await supabase
    .from('standings')
    .select('participant_id, rank, points, played, wins, draws, losses, scored, conceded, diff, season')
    .eq('competition_id', competition.id)
    .eq('season', CURRENT_SEASON)
    .order('rank', { ascending: true });
  if (standingError) throw standingError;

  const participantIds = Array.from(new Set((standingRows ?? []).map((standing) => standing.participant_id)));
  const { data: participantRows, error: participantError } = await supabase
    .from('participants')
    .select('id, external_id, name')
    .in('id', participantIds);
  if (participantError) throw participantError;

  const participantById = new Map((participantRows ?? []).map((participant) => [participant.id, participant]));

  return (standingRows ?? []).map((standing) => {
    const participant = participantById.get(standing.participant_id);

    return {
      league_id: leagueId,
      season: standing.season,
      team_id: participant?.external_id ?? standing.participant_id,
      team_name: participant?.name ?? 'Unknown',
      rank: standing.rank,
      played: standing.played ?? 0,
      w: standing.wins ?? 0,
      d: standing.draws ?? 0,
      l: standing.losses ?? 0,
      gf: standing.scored ?? 0,
      ga: standing.conceded ?? 0,
      gd: standing.diff ?? 0,
      pts: Number(standing.points ?? 0),
    } satisfies StandingRow;
  });
}
