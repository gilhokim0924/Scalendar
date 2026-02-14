import { useQuery } from '@tanstack/react-query';
import type { SportsEvent } from '../types';
import {
  fetchCompetitionByExternalId,
  fetchEventsByCompetition,
  fetchParticipantsByIds,
  fetchStandingsByCompetition,
} from '../services/supabaseMultiSport';

const F1_COMPETITION_EXTERNAL_ID = 'f1-wdc';

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

const queryConfig = {
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  retry: 2,
};

async function loadF1Competition() {
  return fetchCompetitionByExternalId('f1', F1_COMPETITION_EXTERNAL_ID);
}

export function useF1Events(season: string = DEFAULT_SEASON) {
  return useQuery({
    queryKey: ['f1Events', season],
    queryFn: async (): Promise<SportsEvent[]> => {
      const competition = await loadF1Competition();
      if (!competition) return [];

      const rows = await fetchEventsByCompetition(competition.id, season);
      return rows.map((row) => ({
        id: row.id,
        sport_id: '2',
        title: typeof row.metadata?.title === 'string' ? row.metadata.title : competition.name,
        datetime_utc: row.starts_at_utc,
        venue: row.venue ?? 'TBD',
        competition: competition.name,
        external_event_id: row.external_id ?? row.id,
      }));
    },
    ...queryConfig,
  });
}

export function useF1DriverStandings(season: string = DEFAULT_SEASON) {
  return useQuery({
    queryKey: ['f1DriverStandings', season],
    queryFn: async (): Promise<F1Standing[]> => {
      const competition = await loadF1Competition();
      if (!competition) return [];

      const rows = await fetchStandingsByCompetition(competition.id, season);
      if (rows.length === 0) return [];

      const participantIds = rows.map((row) => row.participant_id);
      const participants = await fetchParticipantsByIds(participantIds);
      const participantNameById = new Map(participants.map((p) => [p.id, p.name]));

      return rows.map((row) => ({
        rank: row.rank,
        driver: participantNameById.get(row.participant_id) ?? 'Unknown Driver',
        team: typeof row.metadata?.team === 'string' ? row.metadata.team : '-',
        pts: Number(row.points ?? 0),
      }));
    },
    ...queryConfig,
  });
}
