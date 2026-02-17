import { supabase } from '../lib/supabase';

type TableName =
  | 'sports'
  | 'competitions'
  | 'events'
  | 'event_participants'
  | 'participants'
  | 'standings';

interface TableDiagnosticRow {
  table: TableName;
  ok: boolean;
  count: number | null;
  code: string | null;
  message: string | null;
}

interface FootballDiagnostic {
  season: string;
  competitionFound: boolean;
  competitionId: string | null;
  eventsCount: number | null;
  standingsCount: number | null;
  issue: string | null;
}

function getCurrentFootballSeason(now = new Date()) {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const startYear = month >= 7 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}

async function diagnoseTableRead(table: TableName): Promise<TableDiagnosticRow> {
  const { count, error } = await supabase
    .from(table)
    .select('*', { head: true, count: 'exact' });

  if (error) {
    return {
      table,
      ok: false,
      count: null,
      code: error.code ?? null,
      message: error.message ?? 'Unknown error',
    };
  }

  return {
    table,
    ok: true,
    count: count ?? 0,
    code: null,
    message: null,
  };
}

async function diagnoseFootballPath(): Promise<FootballDiagnostic> {
  const season = getCurrentFootballSeason();

  const { data: competition, error: competitionError } = await supabase
    .from('competitions')
    .select('id, name, sports!inner(key)')
    .eq('sports.key', 'football')
    .eq('external_id', '4328')
    .maybeSingle();

  if (competitionError) {
    return {
      season,
      competitionFound: false,
      competitionId: null,
      eventsCount: null,
      standingsCount: null,
      issue: `competition lookup failed: ${competitionError.message}`,
    };
  }

  if (!competition) {
    return {
      season,
      competitionFound: false,
      competitionId: null,
      eventsCount: null,
      standingsCount: null,
      issue: 'Premier League competition (external_id=4328) not found for sport key football.',
    };
  }

  const [{ count: eventsCount, error: eventsError }, { count: standingsCount, error: standingsError }] = await Promise.all([
    supabase
      .from('events')
      .select('*', { head: true, count: 'exact' })
      .eq('competition_id', competition.id)
      .eq('season', season),
    supabase
      .from('standings')
      .select('*', { head: true, count: 'exact' })
      .eq('competition_id', competition.id)
      .eq('season', season),
  ]);

  if (eventsError) {
    return {
      season,
      competitionFound: true,
      competitionId: competition.id,
      eventsCount: null,
      standingsCount: null,
      issue: `events query failed: ${eventsError.message}`,
    };
  }

  if (standingsError) {
    return {
      season,
      competitionFound: true,
      competitionId: competition.id,
      eventsCount: eventsCount ?? 0,
      standingsCount: null,
      issue: `standings query failed: ${standingsError.message}`,
    };
  }

  return {
    season,
    competitionFound: true,
    competitionId: competition.id,
    eventsCount: eventsCount ?? 0,
    standingsCount: standingsCount ?? 0,
    issue: null,
  };
}

export async function runSupabaseReadDiagnostics(roleLabel: 'anon' | 'authenticated') {
  const tables: TableName[] = [
    'sports',
    'competitions',
    'events',
    'event_participants',
    'participants',
    'standings',
  ];

  const [tableRows, football] = await Promise.all([
    Promise.all(tables.map((table) => diagnoseTableRead(table))),
    diagnoseFootballPath(),
  ]);

  const heading = `[Scalendar DIAG] Supabase read diagnostics (${roleLabel})`;
  console.groupCollapsed(heading);
  console.table(tableRows);
  console.log('Football path:', football);

  const failed = tableRows.filter((row) => !row.ok);
  if (failed.length > 0) {
    console.warn('[Scalendar DIAG] Read failures detected:', failed.map((row) => row.table));
  }

  if (football.issue) {
    console.warn('[Scalendar DIAG] Football path issue:', football.issue);
  }

  console.groupEnd();

  return {
    tableRows,
    football,
  };
}
