import { useQuery } from '@tanstack/react-query';
import type { SportsEvent } from '../types';
import {
  fetchCompetitionByExternalId,
  fetchEventsByCompetition,
  fetchLatestEventSeasonByCompetition,
  fetchLatestStandingSeasonByCompetition,
  fetchParticipantsBySport,
  fetchParticipantsByIds,
  fetchStandingsByCompetition,
} from '../services/supabaseMultiSport';

const F1_COMPETITION_EXTERNAL_ID = 'f1-wdc';
const JOLPICA_BASE_URL = 'https://api.jolpi.ca/ergast/f1';

function getCurrentF1Season(now = new Date()) {
  return String(now.getUTCFullYear());
}

const DEFAULT_SEASON = getCurrentF1Season();

export interface F1Standing {
  rank: number;
  driver: string;
  team: string;
  pts: number;
}

export interface F1ConstructorStanding {
  rank: number;
  team: string;
  pts: number;
}

export interface F1DriverParticipant {
  id: string;
  name: string;
}

export interface F1ConstructorParticipant {
  id: string;
  name: string;
}

const queryConfig = {
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  retry: 2,
};

async function loadF1Competition() {
  return fetchCompetitionByExternalId('f1', F1_COMPETITION_EXTERNAL_ID);
}

async function fetchJolpica(path: string) {
  const response = await fetch(`${JOLPICA_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Jolpica request failed (${response.status})`);
  }
  return response.json();
}

function toIsoDateTime(date?: string, time?: string | null) {
  if (!date) return null;
  const normalizedTime = (time ?? '00:00:00Z').replace(' ', '');
  const asDate = new Date(`${date}T${normalizedTime}`);
  if (Number.isNaN(asDate.getTime())) return null;
  return asDate.toISOString();
}

function getDriverFullName(driver: { givenName?: string; familyName?: string; driverId?: string }) {
  const given = driver.givenName ?? '';
  const family = driver.familyName ?? '';
  return `${given} ${family}`.trim() || driver.driverId || 'Unknown Driver';
}

function buildPodiumSummary(results: Array<{ position?: string; Driver?: { givenName?: string; familyName?: string; driverId?: string } }>) {
  const podium = results
    .map((result) => ({
      position: Number.parseInt(result.position ?? '0', 10) || 0,
      name: getDriverFullName(result.Driver ?? {}),
    }))
    .filter((result) => result.position > 0)
    .sort((a, b) => a.position - b.position)
    .slice(0, 3)
    .map((result) => `${result.position}. ${result.name}`);

  return podium.length > 0 ? podium.join('  ') : undefined;
}

async function loadJolpicaDriverStandings(season: string): Promise<F1Standing[]> {
  const payload = await fetchJolpica(`/${season}/driverStandings.json`);
  const standings = payload?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];

  return standings
    .map((standing: {
      position?: string;
      points?: string;
      Driver?: { givenName?: string; familyName?: string; driverId?: string };
      Constructors?: Array<{ name?: string }>;
    }) => ({
      rank: Number.parseInt(standing.position ?? '0', 10) || 0,
      driver: getDriverFullName(standing.Driver ?? {}),
      team: standing.Constructors?.[0]?.name ?? '-',
      pts: Number.parseFloat(standing.points ?? '0') || 0,
    }))
    .sort((a: F1Standing, b: F1Standing) => (b.pts - a.pts) || (a.rank - b.rank) || a.driver.localeCompare(b.driver));
}

async function loadJolpicaConstructorStandings(season: string): Promise<F1ConstructorStanding[]> {
  const payload = await fetchJolpica(`/${season}/constructorStandings.json`);
  const standings = payload?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];

  return standings
    .map((standing: {
      position?: string;
      points?: string;
      Constructor?: { name?: string };
    }) => ({
      rank: Number.parseInt(standing.position ?? '0', 10) || 0,
      team: standing.Constructor?.name ?? 'Unknown Constructor',
      pts: Number.parseFloat(standing.points ?? '0') || 0,
    }))
    .sort((a: F1ConstructorStanding, b: F1ConstructorStanding) => (b.pts - a.pts) || (a.rank - b.rank) || a.team.localeCompare(b.team));
}

async function loadJolpicaRaceEvents(season: string, competitionName: string): Promise<SportsEvent[]> {
  const [racesPayload, resultsPayload] = await Promise.all([
    fetchJolpica(`/${season}/races.json`),
    fetchJolpica(`/${season}/results.json`),
  ]);

  const races = racesPayload?.MRData?.RaceTable?.Races ?? [];
  const finishedRaces = resultsPayload?.MRData?.RaceTable?.Races ?? [];
  const resultsByRound = new Map<string, Array<{ position?: string; Driver?: { givenName?: string; familyName?: string; driverId?: string } }>>(
    finishedRaces.map((race: { round?: string; Results?: Array<{ position?: string; Driver?: { givenName?: string; familyName?: string; driverId?: string } }> }) => [
      String(race.round ?? ''),
      race.Results ?? [],
    ]),
  );

  return races.map((race: {
    round?: string;
    raceName?: string;
    date?: string;
    time?: string | null;
    Circuit?: { circuitName?: string; Location?: { locality?: string; country?: string } };
  }) => {
    const round = String(race.round ?? '');
    const results = resultsByRound.get(round) ?? [];
    const startsAtUtc = toIsoDateTime(race.date, race.time) ?? new Date().toISOString();

    return {
      id: `${season}-round-${round}-race`,
      sport_id: '2',
      title: race.raceName ?? competitionName,
      datetime_utc: startsAtUtc,
      venue: race.Circuit?.circuitName ?? race.Circuit?.Location?.locality ?? 'TBD',
      competition: competitionName,
      external_event_id: `${season}-round-${round}-race`,
      result: buildPodiumSummary(results),
    };
  });
}

async function loadF1EventsForSeason(competitionId: string, preferredSeason: string) {
  const preferredRows = await fetchEventsByCompetition(competitionId, preferredSeason);
  if (preferredRows.length > 0) {
    return preferredRows;
  }

  const fallbackSeason = await fetchLatestEventSeasonByCompetition(competitionId);
  if (!fallbackSeason || fallbackSeason === preferredSeason) {
    return preferredRows;
  }

  return fetchEventsByCompetition(competitionId, fallbackSeason);
}

async function loadF1StandingsForSeason(competitionId: string, preferredSeason: string) {
  const preferredRows = await fetchStandingsByCompetition(competitionId, preferredSeason);
  if (preferredRows.length > 0) {
    return preferredRows;
  }

  const fallbackSeason = await fetchLatestStandingSeasonByCompetition(competitionId);
  if (!fallbackSeason || fallbackSeason === preferredSeason) {
    return preferredRows;
  }

  return fetchStandingsByCompetition(competitionId, fallbackSeason);
}

export function useF1Events(season: string = DEFAULT_SEASON) {
  return useQuery({
    queryKey: ['f1Events', season],
    queryFn: async (): Promise<SportsEvent[]> => {
      const competition = await loadF1Competition();
      const competitionName = competition?.name ?? 'Formula 1 World Championship';

      try {
        const liveRaceEvents = await loadJolpicaRaceEvents(season, competitionName);
        if (!competition) {
          return liveRaceEvents;
        }

        const rows = await loadF1EventsForSeason(competition.id, season);
        if (rows.length === 0) {
          return liveRaceEvents;
        }

        const supabaseEvents = rows.map((row) => ({
          id: row.id,
          sport_id: '2',
          title: typeof row.metadata?.title === 'string' ? row.metadata.title : competitionName,
          datetime_utc: row.starts_at_utc,
          venue: row.venue ?? 'TBD',
          competition: competitionName,
          external_event_id: row.external_id ?? row.id,
          result: typeof row.metadata?.result === 'string' ? row.metadata.result : undefined,
        }));

        const liveRaceByExternalId = new Map(liveRaceEvents.map((event) => [event.external_event_id, event]));
        const merged = supabaseEvents.map((event) => {
          const liveRace = liveRaceByExternalId.get(event.external_event_id);
          return liveRace ? { ...event, ...liveRace, id: event.id } : event;
        });

        const knownIds = new Set(merged.map((event) => event.external_event_id));
        const missingLiveRaces = liveRaceEvents.filter((event) => !knownIds.has(event.external_event_id));
        return [...merged, ...missingLiveRaces].sort((a, b) => new Date(a.datetime_utc).getTime() - new Date(b.datetime_utc).getTime());
      } catch {
        if (!competition) return [];

        const rows = await loadF1EventsForSeason(competition.id, season);
        return rows.map((row) => ({
          id: row.id,
          sport_id: '2',
          title: typeof row.metadata?.title === 'string' ? row.metadata.title : competitionName,
          datetime_utc: row.starts_at_utc,
          venue: row.venue ?? 'TBD',
          competition: competitionName,
          external_event_id: row.external_id ?? row.id,
          result: typeof row.metadata?.result === 'string' ? row.metadata.result : undefined,
        }));
      }
    },
    ...queryConfig,
  });
}

export function useF1DriverStandings(season: string = DEFAULT_SEASON) {
  return useQuery({
    queryKey: ['f1DriverStandings', season],
    queryFn: async (): Promise<F1Standing[]> => {
      try {
        const liveStandings = await loadJolpicaDriverStandings(season);
        if (liveStandings.length > 0) {
          return liveStandings;
        }
      } catch {
        // Fall back to Supabase if live fetch fails.
      }

      const competition = await loadF1Competition();
      if (!competition) return [];

      const rows = await loadF1StandingsForSeason(competition.id, season);
      if (rows.length === 0) return [];

      const participantIds = rows.map((row) => row.participant_id);
      const participants = await fetchParticipantsByIds(participantIds);
      const participantById = new Map(participants.map((p) => [p.id, p]));

      return rows.map((row) => ({
        row,
        participant: participantById.get(row.participant_id),
      }))
        .filter(({ participant }) => participant?.participant_type === 'driver')
        .map(({ row, participant }) => ({
          rank: row.rank,
          driver: participant?.name ?? 'Unknown Driver',
          team: typeof row.metadata?.team === 'string' ? row.metadata.team : '-',
          pts: Number(row.points ?? 0),
        }))
        .sort((a, b) => (b.pts - a.pts) || (a.rank - b.rank) || a.driver.localeCompare(b.driver));
    },
    ...queryConfig,
  });
}

export function useF1ConstructorStandings(season: string = DEFAULT_SEASON) {
  return useQuery({
    queryKey: ['f1ConstructorStandings', season],
    queryFn: async (): Promise<F1ConstructorStanding[]> => {
      try {
        const liveStandings = await loadJolpicaConstructorStandings(season);
        if (liveStandings.length > 0) {
          return liveStandings;
        }
      } catch {
        // Fall back to Supabase if live fetch fails.
      }

      const competition = await loadF1Competition();
      if (!competition) return [];

      const rows = await loadF1StandingsForSeason(competition.id, season);
      if (rows.length === 0) return [];

      const participantIds = rows.map((row) => row.participant_id);
      const participants = await fetchParticipantsByIds(participantIds);
      const participantById = new Map(participants.map((p) => [p.id, p]));

      return rows.map((row) => ({
        row,
        participant: participantById.get(row.participant_id),
      }))
        .filter(({ participant }) => participant?.participant_type === 'constructor')
        .map(({ row, participant }) => ({
          rank: row.rank,
          team: participant?.name ?? (typeof row.metadata?.team === 'string' ? row.metadata.team : 'Unknown Constructor'),
          pts: Number(row.points ?? 0),
        }))
        .sort((a, b) => (b.pts - a.pts) || (a.rank - b.rank) || a.team.localeCompare(b.team));
    },
    ...queryConfig,
  });
}

export function useF1Drivers() {
  return useQuery({
    queryKey: ['f1Drivers'],
    queryFn: async (): Promise<F1DriverParticipant[]> => {
      const rows = await fetchParticipantsBySport('f1', 'driver');
      return rows
        .map((row) => ({ id: row.id, name: row.name }))
        .sort((a, b) => a.name.localeCompare(b.name));
    },
    ...queryConfig,
  });
}

export function useF1Constructors() {
  return useQuery({
    queryKey: ['f1Constructors'],
    queryFn: async (): Promise<F1ConstructorParticipant[]> => {
      const rows = await fetchParticipantsBySport('f1', 'constructor');
      return rows
        .map((row) => ({ id: row.id, name: row.name }))
        .sort((a, b) => a.name.localeCompare(b.name));
    },
    ...queryConfig,
  });
}
