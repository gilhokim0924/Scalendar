import type { SportsEvent, Sport, Team } from '../types';

export const mockSports: Sport[] = [
  { id: '1', name: 'Football', icon: '⚽' },
  { id: '2', name: 'Formula 1', icon: '🏎️' },
];

export const mockTeams: Team[] = [
  { id: '11', sport_id: '2', name: 'Ferrari', external_api_id: 'ferrari' },
  { id: '12', sport_id: '2', name: 'Red Bull Racing', external_api_id: 'red_bull' },
  { id: '13', sport_id: '2', name: 'Mercedes', external_api_id: 'mercedes' },
  { id: '14', sport_id: '2', name: 'McLaren', external_api_id: 'mclaren' },
  { id: '15', sport_id: '2', name: 'Aston Martin F1', external_api_id: 'aston_martin' },
];

export const mockEvents: SportsEvent[] = [
  {
    id: 'f1_past_001',
    sport_id: '2',
    title: 'Japanese Grand Prix',
    datetime_utc: '2026-01-26T06:00:00Z',
    venue: 'Suzuka International Racing Course',
    competition: 'Formula 1',
    external_event_id: 'f1_past_001',
    result: '1. Verstappen  2. Leclerc  3. Norris',
  },
  {
    id: 'f1_001',
    sport_id: '2',
    title: 'Bahrain Grand Prix',
    datetime_utc: '2026-02-28T15:00:00Z',
    venue: 'Bahrain International Circuit',
    competition: 'Formula 1',
    external_event_id: 'f1_001',
  },
  {
    id: 'f1_002',
    sport_id: '2',
    title: 'Saudi Arabian Grand Prix',
    datetime_utc: '2026-03-07T18:00:00Z',
    venue: 'Jeddah Corniche Circuit',
    competition: 'Formula 1',
    external_event_id: 'f1_002',
  },
  {
    id: 'f1_003',
    sport_id: '2',
    title: 'Australian Grand Prix',
    datetime_utc: '2026-03-21T06:00:00Z',
    venue: 'Albert Park Circuit',
    competition: 'Formula 1',
    external_event_id: 'f1_003',
  },
];

const knownInitials: Record<string, string> = {
  'Ferrari': 'FER',
  'Red Bull Racing': 'RBR',
  'Mercedes': 'MER',
  'McLaren': 'MCL',
  'Aston Martin F1': 'AMR',
};

export function getTeamInitials(name: string): string {
  if (knownInitials[name]) return knownInitials[name];

  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return words
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 3);
  }

  return name.slice(0, 3).toUpperCase();
}
