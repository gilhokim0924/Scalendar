import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const SPORT_KEY = 'f1';
const COMPETITION_EXTERNAL_ID = 'f1-wdc';
const COMPETITION_NAME = 'Formula 1 World Championship';
const JOLPICA_BASE_URL = 'https://api.jolpi.ca/ergast/f1';

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
    return { ...parsed, ...process.env };
  } catch {
    return process.env;
  }
}

function getCurrentF1Season(now = new Date()) {
  return String(now.getUTCFullYear());
}

async function fetchJolpica(pathWithQuery) {
  const response = await fetch(`${JOLPICA_BASE_URL}${pathWithQuery}`);
  if (!response.ok) {
    throw new Error(`Jolpica request failed (${response.status}): ${pathWithQuery}`);
  }
  return response.json();
}

function raceToIsoDateTime(race) {
  const date = race.date;
  const time = race.time ?? '00:00:00Z';
  if (!date) return null;
  const asDate = new Date(`${date}T${time}`);
  if (Number.isNaN(asDate.getTime())) return null;
  return asDate.toISOString();
}

function sessionToIsoDateTime(session) {
  const date = session?.date;
  const time = session?.time ?? '00:00:00Z';
  if (!date) return null;
  const asDate = new Date(`${date}T${time}`);
  if (Number.isNaN(asDate.getTime())) return null;
  return asDate.toISOString();
}

function buildF1Sessions(race) {
  const sessions = [
    { key: 'FirstPractice', stage: 'practice-1', title: `${race.raceName} - Practice 1` },
    { key: 'SecondPractice', stage: 'practice-2', title: `${race.raceName} - Practice 2` },
    { key: 'ThirdPractice', stage: 'practice-3', title: `${race.raceName} - Practice 3` },
    { key: 'SprintQualifying', stage: 'sprint-qualifying', title: `${race.raceName} - Sprint Qualifying` },
    { key: 'Sprint', stage: 'sprint', title: `${race.raceName} - Sprint` },
    { key: 'Qualifying', stage: 'qualifying', title: `${race.raceName} - Qualifying` },
    { key: 'Race', stage: 'race', title: race.raceName },
  ];

  const sessionRows = [];
  for (const session of sessions) {
    const raw = session.key === 'Race' ? { date: race.date, time: race.time } : race[session.key];
    const startsAtUtc = sessionToIsoDateTime(raw);
    if (!startsAtUtc) continue;

    sessionRows.push({
      sessionType: session.key,
      stage: session.stage,
      title: session.title,
      startsAtUtc,
    });
  }

  return sessionRows;
}

async function main() {
  const env = loadEnvFromWebDir();
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const season = env.F1_SEASON || getCurrentF1Season();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL (or VITE_SUPABASE_URL) and/or SUPABASE_SERVICE_ROLE_KEY in web/.env');
  }

  const [driversPayload, racesPayload, standingsPayload, constructorsPayload] = await Promise.all([
    fetchJolpica(`/${season}/drivers.json`),
    fetchJolpica(`/${season}/races.json`),
    fetchJolpica(`/${season}/driverStandings.json`),
    fetchJolpica(`/${season}/constructors.json`),
  ]);

  const drivers = driversPayload?.MRData?.DriverTable?.Drivers ?? [];
  const races = racesPayload?.MRData?.RaceTable?.Races ?? [];
  const standingsList = standingsPayload?.MRData?.StandingsTable?.StandingsLists?.[0];
  const driverStandings = standingsList?.DriverStandings ?? [];
  const constructors = constructorsPayload?.MRData?.ConstructorTable?.Constructors ?? [];

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { error: sportsError } = await supabase
    .from('sports')
    .upsert([{ key: SPORT_KEY, name: 'Formula 1' }], { onConflict: 'key' });
  if (sportsError) throw sportsError;

  const { data: sportRow, error: sportReadError } = await supabase
    .from('sports')
    .select('id')
    .eq('key', SPORT_KEY)
    .single();
  if (sportReadError) throw sportReadError;

  const sportId = sportRow.id;

  const { error: competitionError } = await supabase
    .from('competitions')
    .upsert([{
      sport_id: sportId,
      external_id: COMPETITION_EXTERNAL_ID,
      name: COMPETITION_NAME,
      country: null,
      format: 'season',
    }], { onConflict: 'sport_id,external_id' });
  if (competitionError) throw competitionError;

  const { data: competitionRow, error: competitionReadError } = await supabase
    .from('competitions')
    .select('id')
    .eq('sport_id', sportId)
    .eq('external_id', COMPETITION_EXTERNAL_ID)
    .single();
  if (competitionReadError) throw competitionReadError;

  const competitionId = competitionRow.id;

  const participants = drivers
    .map((driver) => {
      const given = driver.givenName ?? '';
      const family = driver.familyName ?? '';
      const fullName = `${given} ${family}`.trim();
      return {
        sport_id: sportId,
        external_id: driver.driverId ?? null,
        name: fullName || driver.driverId || 'Unknown Driver',
        participant_type: 'driver',
        short_name: driver.code ?? null,
        country: driver.nationality ?? null,
      };
    })
    .filter((driver) => Boolean(driver.external_id));

  if (participants.length > 0) {
    const { error: participantsError } = await supabase
      .from('participants')
      .upsert(participants, { onConflict: 'sport_id,external_id' });
    if (participantsError) throw participantsError;
  }

  const constructorParticipants = constructors
    .map((constructor) => ({
      sport_id: sportId,
      external_id: constructor.constructorId ?? null,
      name: constructor.name ?? constructor.constructorId ?? 'Unknown Constructor',
      participant_type: 'constructor',
      short_name: null,
      country: constructor.nationality ?? null,
    }))
    .filter((constructor) => Boolean(constructor.external_id));

  if (constructorParticipants.length > 0) {
    const { error: constructorUpsertError } = await supabase
      .from('participants')
      .upsert(constructorParticipants, { onConflict: 'sport_id,external_id' });
    if (constructorUpsertError) throw constructorUpsertError;
  }

  const participantExternalIds = participants.map((driver) => driver.external_id).filter(Boolean);
  const { data: participantRows, error: participantReadError } = await supabase
    .from('participants')
    .select('id, external_id')
    .eq('sport_id', sportId)
    .in('external_id', participantExternalIds);
  if (participantReadError) throw participantReadError;

  const participantIdByExternal = new Map(
    (participantRows ?? []).map((row) => [row.external_id, row.id]),
  );

  const now = Date.now();
  const events = races.flatMap((race) => {
    const sessions = buildF1Sessions(race);
    return sessions.map((session) => ({
      sport_id: sportId,
      competition_id: competitionId,
      external_id: `${season}-round-${race.round}-${session.sessionType.toLowerCase()}`,
      season,
      round: String(race.round ?? ''),
      stage: session.stage,
      starts_at_utc: session.startsAtUtc,
      venue: race?.Circuit?.circuitName ?? race?.Circuit?.Location?.locality ?? null,
      status: new Date(session.startsAtUtc).getTime() < now ? 'finished' : 'scheduled',
      metadata: {
        title: session.title,
        session_type: session.sessionType,
        country: race?.Circuit?.Location?.country ?? null,
        locality: race?.Circuit?.Location?.locality ?? null,
      },
    }));
  });

  const { error: deleteEventsError } = await supabase
    .from('events')
    .delete()
    .eq('competition_id', competitionId)
    .eq('season', season);
  if (deleteEventsError) throw deleteEventsError;

  if (events.length > 0) {
    const { error: eventsError } = await supabase
      .from('events')
      .upsert(events, { onConflict: 'competition_id,external_id' });
    if (eventsError) throw eventsError;
  }

  const standings = driverStandings
    .map((standing) => {
      const driverId = standing?.Driver?.driverId;
      if (!driverId) return null;
      const participantId = participantIdByExternal.get(driverId);
      if (!participantId) return null;

      return {
        competition_id: competitionId,
        season,
        participant_id: participantId,
        rank: Number.parseInt(standing.position ?? '0', 10) || 0,
        points: Number.parseFloat(standing.points ?? '0') || 0,
        played: Number.parseInt(standingsList?.round ?? '0', 10) || null,
        wins: Number.parseInt(standing.wins ?? '0', 10) || 0,
        draws: null,
        losses: null,
        scored: null,
        conceded: null,
        diff: null,
        metadata: {
          team: standing?.Constructors?.[0]?.name ?? null,
        },
      };
    })
    .filter(Boolean);

  const { error: deleteStandingsError } = await supabase
    .from('standings')
    .delete()
    .eq('competition_id', competitionId)
    .eq('season', season);
  if (deleteStandingsError) throw deleteStandingsError;

  if (standings.length > 0) {
    const { error: standingsError } = await supabase
      .from('standings')
      .upsert(standings, { onConflict: 'competition_id,season,participant_id' });
    if (standingsError) throw standingsError;
  }

  console.log(`F1 sync complete (${season}): ${participants.length} drivers, ${constructorParticipants.length} constructors, ${events.length} races, ${standings.length} standings rows`);
}

main().catch((error) => {
  console.error('F1 sync failed:', error);
  process.exitCode = 1;
});
