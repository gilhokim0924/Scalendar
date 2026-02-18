import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const DELAY_MS = 2500;
const SPORT_KEY = 'basketball';
const SPORT_NAME = 'Basketball';
const SPORTS_DB_BASE_URL = 'https://www.thesportsdb.com/api/v1/json/3';

function getCurrentBasketballSeason(now = new Date()) {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const startYear = month >= 7 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}

const SEASON = getCurrentBasketballSeason();

const LEAGUES = [
  {
    id: '4387',
    searchName: 'NBA',
    displayName: 'NBA',
    format: 'league',
  },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseEnvFile(content) {
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex <= 0) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^"(.*)"$/, '$1');
    env[key] = value;
  }
  return env;
}

function loadEnvFromWebDir() {
  const envPath = path.resolve(process.cwd(), 'web/.env');
  try {
    const parsed = parseEnvFile(readFileSync(envPath, 'utf8'));
    return {
      ...parsed,
      ...process.env,
    };
  } catch {
    return process.env;
  }
}

async function fetchSportsDbJson(pathWithQuery) {
  try {
    const res = await fetch(`${SPORTS_DB_BASE_URL}${pathWithQuery}`);
    if (!res.ok) {
      throw new Error(`TheSportsDB request failed (${res.status}): ${pathWithQuery}`);
    }
    return await res.json();
  } finally {
    await sleep(DELAY_MS);
  }
}

function toInt(value) {
  if (value == null || value === '') return null;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function toUtcIsoString(dateEvent, timeEvent) {
  const date = (dateEvent ?? '').trim();
  if (!date) return null;

  const normalizedTime = (timeEvent ?? '00:00:00').trim().replace('Z', '').replace('+00:00', '');
  const hhmmss = normalizedTime || '00:00:00';
  const asDate = new Date(`${date}T${hhmmss}Z`);
  if (Number.isNaN(asDate.getTime())) return null;
  return asDate.toISOString();
}

function computeStandings(events, competitionByLeague, participantByExternalId) {
  const byCompetition = new Map();

  for (const event of events) {
    if (event.home_score == null || event.away_score == null) continue;

    const competitionId = competitionByLeague.get(event.league_id);
    if (!competitionId) continue;

    const homeParticipantId = participantByExternalId.get(event.home_team_id);
    const awayParticipantId = participantByExternalId.get(event.away_team_id);
    if (!homeParticipantId || !awayParticipantId) continue;

    if (!byCompetition.has(competitionId)) {
      byCompetition.set(competitionId, new Map());
    }

    const table = byCompetition.get(competitionId);

    if (!table.has(homeParticipantId)) {
      table.set(homeParticipantId, {
        participant_id: homeParticipantId,
        team_name: event.home_team,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        scored: 0,
        conceded: 0,
        points: 0,
      });
    }

    if (!table.has(awayParticipantId)) {
      table.set(awayParticipantId, {
        participant_id: awayParticipantId,
        team_name: event.away_team,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        scored: 0,
        conceded: 0,
        points: 0,
      });
    }

    const home = table.get(homeParticipantId);
    const away = table.get(awayParticipantId);
    const homeScore = event.home_score;
    const awayScore = event.away_score;

    home.played += 1;
    away.played += 1;
    home.scored += homeScore;
    home.conceded += awayScore;
    away.scored += awayScore;
    away.conceded += homeScore;

    if (homeScore > awayScore) {
      home.wins += 1;
      home.points += 1;
      away.losses += 1;
    } else if (awayScore > homeScore) {
      away.wins += 1;
      away.points += 1;
      home.losses += 1;
    } else {
      home.draws += 1;
      away.draws += 1;
    }
  }

  const rows = [];

  for (const [competitionId, table] of byCompetition.entries()) {
    const ranked = Array.from(table.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const goalDiff = (b.scored - b.conceded) - (a.scored - a.conceded);
      if (goalDiff !== 0) return goalDiff;
      if (b.scored !== a.scored) return b.scored - a.scored;
      return a.team_name.localeCompare(b.team_name);
    });

    ranked.forEach((row, index) => {
      rows.push({
        competition_id: competitionId,
        season: SEASON,
        participant_id: row.participant_id,
        rank: index + 1,
        points: row.points,
        played: row.played,
        wins: row.wins,
        draws: row.draws,
        losses: row.losses,
        scored: row.scored,
        conceded: row.conceded,
        diff: row.scored - row.conceded,
        metadata: { team_name: row.team_name },
      });
    });
  }

  return rows;
}

async function syncLeagueTeams(league) {
  const payload = await fetchSportsDbJson(`/search_all_teams.php?l=${encodeURIComponent(league.searchName)}`);
  const rows = (payload.teams ?? [])
    .map((team) => ({
      id: team.idTeam,
      league_id: league.id,
      name: team.strTeam,
      league_name: league.displayName,
    }))
    .filter((team) => team.id && team.name);

  return rows;
}

async function syncLeagueEvents(league) {
  const payload = await fetchSportsDbJson(`/eventsseason.php?id=${league.id}&s=${encodeURIComponent(SEASON)}`);
  const rows = (payload.events ?? [])
    .filter((event) => event.idLeague === league.id)
    .map((event) => ({
      id: event.idEvent,
      league_id: league.id,
      round: toInt(event.intRound) ?? 0,
      season: SEASON,
      date_event: event.dateEvent ?? '',
      time_event: event.strTime ?? '',
      venue: event.strVenue ?? '',
      league_name: league.displayName,
      home_team: event.strHomeTeam ?? '',
      away_team: event.strAwayTeam ?? '',
      home_team_id: event.idHomeTeam ?? '',
      away_team_id: event.idAwayTeam ?? '',
      home_score: toInt(event.intHomeScore),
      away_score: toInt(event.intAwayScore),
    }))
    .filter((event) => event.id && event.date_event && event.home_team_id && event.away_team_id);

  console.log(`[${league.displayName}] ${rows.length} events`);
  return rows;
}

async function main() {
  const env = loadEnvFromWebDir();
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL (or VITE_SUPABASE_URL) and/or SUPABASE_SERVICE_ROLE_KEY in web/.env');
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  console.log(`Starting basketball sync for ${SEASON}`);

  const { error: sportUpsertError } = await supabase
    .from('sports')
    .upsert([{ key: SPORT_KEY, name: SPORT_NAME }], { onConflict: 'key' });
  if (sportUpsertError) throw sportUpsertError;

  const { data: sportRow, error: sportReadError } = await supabase
    .from('sports')
    .select('id')
    .eq('key', SPORT_KEY)
    .single();
  if (sportReadError) throw sportReadError;
  const sportId = sportRow.id;

  const competitionRows = LEAGUES.map((league) => ({
    sport_id: sportId,
    external_id: league.id,
    name: league.displayName,
    country: null,
    format: league.format,
  }));

  const { error: competitionsUpsertError } = await supabase
    .from('competitions')
    .upsert(competitionRows, { onConflict: 'sport_id,external_id' });
  if (competitionsUpsertError) throw competitionsUpsertError;

  const { data: competitions, error: competitionsReadError } = await supabase
    .from('competitions')
    .select('id, external_id')
    .eq('sport_id', sportId)
    .in('external_id', LEAGUES.map((league) => league.id));
  if (competitionsReadError) throw competitionsReadError;

  const competitionByLeague = new Map((competitions ?? []).map((competition) => [competition.external_id, competition.id]));

  const allTeams = [];
  const allEvents = [];

  for (const league of LEAGUES) {
    console.log(`Syncing teams for ${league.displayName}...`);
    const teams = await syncLeagueTeams(league);
    allTeams.push(...teams);

    console.log(`Syncing events for ${league.displayName}...`);
    const events = await syncLeagueEvents(league);
    allEvents.push(...events);
  }

  if (allTeams.length > 0) {
    const { error: teamsError } = await supabase
      .from('teams')
      .upsert(allTeams, { onConflict: 'id,league_id' });
    if (teamsError) throw teamsError;
  }

  const participants = Array.from(
    new Map(
      allTeams.map((team) => [
        team.id,
        {
          sport_id: sportId,
          external_id: team.id,
          name: team.name,
          participant_type: 'team',
          short_name: null,
          country: null,
        },
      ]),
    ).values(),
  );

  if (participants.length > 0) {
    const { error: participantUpsertError } = await supabase
      .from('participants')
      .upsert(participants, { onConflict: 'sport_id,external_id' });
    if (participantUpsertError) throw participantUpsertError;
  }

  const { data: participantRows, error: participantReadError } = await supabase
    .from('participants')
    .select('id, external_id')
    .eq('sport_id', sportId)
    .in('external_id', participants.map((participant) => participant.external_id));
  if (participantReadError) throw participantReadError;

  const participantByExternalId = new Map((participantRows ?? []).map((participant) => [participant.external_id, participant.id]));

  const canonicalEvents = allEvents
    .map((event) => {
      const competitionId = competitionByLeague.get(event.league_id);
      const startsAtUtc = toUtcIsoString(event.date_event, event.time_event);
      if (!competitionId || !startsAtUtc) return null;

      return {
        sport_id: sportId,
        competition_id: competitionId,
        external_id: event.id,
        season: event.season,
        round: String(event.round),
        stage: null,
        starts_at_utc: startsAtUtc,
        venue: event.venue || null,
        status: event.home_score != null && event.away_score != null ? 'finished' : 'scheduled',
        metadata: {
          league_id: event.league_id,
          league_name: event.league_name,
          home_team_id: event.home_team_id,
          away_team_id: event.away_team_id,
          home_team: event.home_team,
          away_team: event.away_team,
        },
      };
    })
    .filter(Boolean);

  if (canonicalEvents.length > 0) {
    const { error: eventsError } = await supabase
      .from('events')
      .upsert(canonicalEvents, { onConflict: 'competition_id,external_id' });
    if (eventsError) throw eventsError;
  }

  const competitionIds = Array.from(new Set(Array.from(competitionByLeague.values())));
  const { data: storedEvents, error: storedEventsError } = await supabase
    .from('events')
    .select('id, competition_id, external_id')
    .eq('season', SEASON)
    .in('competition_id', competitionIds);
  if (storedEventsError) throw storedEventsError;

  const eventIdByKey = new Map(
    (storedEvents ?? []).map((event) => [`${event.competition_id}:${event.external_id}`, event.id]),
  );

  const eventParticipants = [];
  for (const event of allEvents) {
    const competitionId = competitionByLeague.get(event.league_id);
    if (!competitionId) continue;

    const storedEventId = eventIdByKey.get(`${competitionId}:${event.id}`);
    if (!storedEventId) continue;

    const homeParticipantId = participantByExternalId.get(event.home_team_id);
    const awayParticipantId = participantByExternalId.get(event.away_team_id);
    if (!homeParticipantId || !awayParticipantId) continue;

    let homeOutcome = null;
    let awayOutcome = null;
    if (event.home_score != null && event.away_score != null) {
      if (event.home_score > event.away_score) {
        homeOutcome = 'win';
        awayOutcome = 'loss';
      } else if (event.home_score < event.away_score) {
        homeOutcome = 'loss';
        awayOutcome = 'win';
      } else {
        homeOutcome = 'draw';
        awayOutcome = 'draw';
      }
    }

    eventParticipants.push(
      {
        event_id: storedEventId,
        participant_id: homeParticipantId,
        role: 'home',
        score: event.home_score,
        result_position: null,
        outcome: homeOutcome,
        metadata: {},
      },
      {
        event_id: storedEventId,
        participant_id: awayParticipantId,
        role: 'away',
        score: event.away_score,
        result_position: null,
        outcome: awayOutcome,
        metadata: {},
      },
    );
  }

  if (eventParticipants.length > 0) {
    const { error: eventParticipantsError } = await supabase
      .from('event_participants')
      .upsert(eventParticipants, { onConflict: 'event_id,participant_id,role' });
    if (eventParticipantsError) throw eventParticipantsError;
  }

  const standings = computeStandings(allEvents, competitionByLeague, participantByExternalId);
  if (standings.length > 0) {
    const { error: standingsError } = await supabase
      .from('standings')
      .upsert(standings, { onConflict: 'competition_id,season,participant_id' });
    if (standingsError) throw standingsError;
  }

  console.log(`Basketball sync complete: ${allTeams.length} teams, ${allEvents.length} events, ${standings.length} standings rows`);
}

main().catch((error) => {
  console.error('Basketball sync failed:', error);
  process.exitCode = 1;
});
