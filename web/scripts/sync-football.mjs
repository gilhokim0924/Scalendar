import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const DELAY_MS = 2500;
const SEASON = '2025-2026';
const SPORTS_DB_BASE_URL = 'https://www.thesportsdb.com/api/v1/json/3';

const LEAGUES = [
  {
    id: '4328',
    searchName: 'English Premier League',
    displayName: 'Premier League',
    rounds: Array.from({ length: 38 }, (_, i) => i + 1),
  },
  {
    id: '4480',
    searchName: 'UEFA Champions League',
    displayName: 'Champions League',
    rounds: [...Array.from({ length: 8 }, (_, i) => i + 1), 32],
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

function computeStandings(events, leagueId) {
  const byTeam = new Map();

  for (const event of events) {
    if (event.league_id !== leagueId) continue;
    if (event.home_score == null || event.away_score == null) continue;

    if (!byTeam.has(event.home_team_id)) {
      byTeam.set(event.home_team_id, {
        league_id: event.league_id,
        season: event.season,
        team_id: event.home_team_id,
        team_name: event.home_team,
        rank: 0,
        played: 0,
        w: 0,
        d: 0,
        l: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        pts: 0,
      });
    }

    if (!byTeam.has(event.away_team_id)) {
      byTeam.set(event.away_team_id, {
        league_id: event.league_id,
        season: event.season,
        team_id: event.away_team_id,
        team_name: event.away_team,
        rank: 0,
        played: 0,
        w: 0,
        d: 0,
        l: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        pts: 0,
      });
    }

    const home = byTeam.get(event.home_team_id);
    const away = byTeam.get(event.away_team_id);
    const homeScore = event.home_score;
    const awayScore = event.away_score;

    home.played += 1;
    away.played += 1;
    home.gf += homeScore;
    home.ga += awayScore;
    away.gf += awayScore;
    away.ga += homeScore;

    if (homeScore > awayScore) {
      home.w += 1;
      home.pts += 3;
      away.l += 1;
    } else if (awayScore > homeScore) {
      away.w += 1;
      away.pts += 3;
      home.l += 1;
    } else {
      home.d += 1;
      away.d += 1;
      home.pts += 1;
      away.pts += 1;
    }
  }

  const table = Array.from(byTeam.values()).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    const gdDiff = (b.gf - b.ga) - (a.gf - a.ga);
    if (gdDiff !== 0) return gdDiff;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.team_name.localeCompare(b.team_name);
  });

  return table.map((row, index) => ({
    ...row,
    rank: index + 1,
    gd: row.gf - row.ga,
  }));
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
  const rows = [];
  for (const round of league.rounds) {
    const payload = await fetchSportsDbJson(`/eventsround.php?id=${league.id}&r=${round}&s=${SEASON}`);
    const roundRows = (payload.events ?? [])
      .filter((event) => event.idLeague === league.id)
      .map((event) => ({
        id: event.idEvent,
        league_id: league.id,
        round,
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

    rows.push(...roundRows);
    console.log(`[${league.displayName}] round ${round}: ${roundRows.length} events`);
  }
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

  console.log(`Starting football sync for ${SEASON}`);

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

  const standings = LEAGUES.flatMap((league) => computeStandings(allEvents, league.id));

  if (allTeams.length > 0) {
    const { error } = await supabase
      .from('teams')
      .upsert(allTeams, { onConflict: 'id,league_id' });
    if (error) throw error;
  }

  if (allEvents.length > 0) {
    const { error } = await supabase
      .from('events')
      .upsert(allEvents, { onConflict: 'id' });
    if (error) throw error;
  }

  if (standings.length > 0) {
    const { error } = await supabase
      .from('standings')
      .upsert(standings, { onConflict: 'league_id,season,team_id' });
    if (error) throw error;
  }

  console.log(`Sync complete: ${allTeams.length} teams, ${allEvents.length} events, ${standings.length} standings rows`);
}

main().catch((error) => {
  console.error('Football sync failed:', error);
  process.exitCode = 1;
});
