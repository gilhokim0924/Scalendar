import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const SPORT_KEY = 'f1';
const SEASON = '2026';
const COMPETITION_EXTERNAL_ID = 'f1-wdc';
const COMPETITION_NAME = 'Formula 1 World Championship';

const DRIVER_STANDINGS = [
  { external_id: 'max_verstappen', name: 'M. Verstappen', team: 'Red Bull', points: 51, rank: 1 },
  { external_id: 'charles_leclerc', name: 'C. Leclerc', team: 'Ferrari', points: 42, rank: 2 },
  { external_id: 'lando_norris', name: 'L. Norris', team: 'McLaren', points: 38, rank: 3 },
  { external_id: 'lewis_hamilton', name: 'L. Hamilton', team: 'Mercedes', points: 30, rank: 4 },
  { external_id: 'fernando_alonso', name: 'F. Alonso', team: 'Aston Martin', points: 22, rank: 5 },
];

const F1_RACES = [
  { external_id: 'f1_past_001', title: 'Japanese Grand Prix', starts_at_utc: '2026-01-26T06:00:00Z', venue: 'Suzuka International Racing Course', round: '1' },
  { external_id: 'f1_001', title: 'Bahrain Grand Prix', starts_at_utc: '2026-02-28T15:00:00Z', venue: 'Bahrain International Circuit', round: '2' },
  { external_id: 'f1_002', title: 'Saudi Arabian Grand Prix', starts_at_utc: '2026-03-07T18:00:00Z', venue: 'Jeddah Corniche Circuit', round: '3' },
  { external_id: 'f1_003', title: 'Australian Grand Prix', starts_at_utc: '2026-03-21T06:00:00Z', venue: 'Albert Park Circuit', round: '4' },
];

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

async function main() {
  const env = loadEnvFromWebDir();
  const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL (or VITE_SUPABASE_URL) and/or SUPABASE_SERVICE_ROLE_KEY in web/.env');
  }

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

  const participants = DRIVER_STANDINGS.map((driver) => ({
    sport_id: sportId,
    external_id: driver.external_id,
    name: driver.name,
    participant_type: 'driver',
    short_name: driver.name,
    country: null,
  }));

  const { error: participantsError } = await supabase
    .from('participants')
    .upsert(participants, { onConflict: 'sport_id,external_id' });
  if (participantsError) throw participantsError;

  const { data: participantRows, error: participantReadError } = await supabase
    .from('participants')
    .select('id, external_id')
    .eq('sport_id', sportId)
    .in('external_id', DRIVER_STANDINGS.map((d) => d.external_id));
  if (participantReadError) throw participantReadError;

  const participantIdByExternal = new Map(
    (participantRows ?? []).map((row) => [row.external_id, row.id]),
  );

  const events = F1_RACES.map((race) => ({
    sport_id: sportId,
    competition_id: competitionId,
    external_id: race.external_id,
    season: SEASON,
    round: race.round,
    stage: null,
    starts_at_utc: race.starts_at_utc,
    venue: race.venue,
    status: 'scheduled',
    metadata: { title: race.title },
  }));

  const { error: eventsError } = await supabase
    .from('events_v2')
    .upsert(events, { onConflict: 'competition_id,external_id' });
  if (eventsError) throw eventsError;

  const standings = DRIVER_STANDINGS
    .map((driver) => {
      const participantId = participantIdByExternal.get(driver.external_id);
      if (!participantId) return null;
      return {
        competition_id: competitionId,
        season: SEASON,
        participant_id: participantId,
        rank: driver.rank,
        points: driver.points,
        metadata: { team: driver.team },
      };
    })
    .filter(Boolean);

  if (standings.length > 0) {
    const { error: standingsError } = await supabase
      .from('standings_v2')
      .upsert(standings, { onConflict: 'competition_id,season,participant_id' });
    if (standingsError) throw standingsError;
  }

  console.log(`F1 seed sync complete: ${participants.length} drivers, ${events.length} races, ${standings.length} standings rows`);
}

main().catch((error) => {
  console.error('F1 seed sync failed:', error);
  process.exitCode = 1;
});
