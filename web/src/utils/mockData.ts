import { Event, Sport, Team } from '../types';

export const mockSports: Sport[] = [
  { id: '1', name: 'Premier League' },
  { id: '2', name: 'Formula 1' },
];

export const mockTeams: Team[] = [
  { id: '1', sport_id: '1', name: 'Arsenal', external_api_id: '133604' },
  { id: '2', sport_id: '1', name: 'Chelsea', external_api_id: '133613' },
  { id: '3', sport_id: '1', name: 'Liverpool', external_api_id: '133602' },
  { id: '4', sport_id: '2', name: 'Ferrari', external_api_id: 'ferrari' },
  { id: '5', sport_id: '2', name: 'Red Bull Racing', external_api_id: 'red_bull' },
];

export const mockEvents: Event[] = [
  {
    id: '1',
    sport_id: '1',
    home_team_id: '1',
    away_team_id: '2',
    title: 'Arsenal vs Chelsea',
    datetime_utc: '2026-02-14T15:00:00Z',
    venue: 'Emirates Stadium',
    competition: 'Premier League',
    external_event_id: 'pl_001',
  },
  {
    id: '2',
    sport_id: '1',
    home_team_id: '3',
    away_team_id: '1',
    title: 'Liverpool vs Arsenal',
    datetime_utc: '2026-02-21T17:30:00Z',
    venue: 'Anfield',
    competition: 'Premier League',
    external_event_id: 'pl_002',
  },
  {
    id: '3',
    sport_id: '2',
    title: 'Bahrain Grand Prix',
    datetime_utc: '2026-02-28T15:00:00Z',
    venue: 'Bahrain International Circuit',
    competition: 'Formula 1',
    external_event_id: 'f1_001',
  },
  {
    id: '4',
    sport_id: '2',
    title: 'Saudi Arabian Grand Prix',
    datetime_utc: '2026-03-07T18:00:00Z',
    venue: 'Jeddah Corniche Circuit',
    competition: 'Formula 1',
    external_event_id: 'f1_002',
  },
  {
    id: '5',
    sport_id: '1',
    home_team_id: '2',
    away_team_id: '3',
    title: 'Chelsea vs Liverpool',
    datetime_utc: '2026-02-16T14:00:00Z',
    venue: 'Stamford Bridge',
    competition: 'Premier League',
    external_event_id: 'pl_003',
  },
];
