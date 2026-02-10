import type { SportsEvent, Sport, Team } from '../types';

export const mockSports: Sport[] = [
  { id: '1', name: 'Premier League', icon: '⚽' },
  { id: '2', name: 'Formula 1', icon: '🏎️' },
];

export const mockTeams: Team[] = [
  // Premier League teams
  { id: '1', sport_id: '1', name: 'Arsenal', external_api_id: '133604' },
  { id: '2', sport_id: '1', name: 'Chelsea', external_api_id: '133613' },
  { id: '3', sport_id: '1', name: 'Liverpool', external_api_id: '133602' },
  { id: '4', sport_id: '1', name: 'Manchester City', external_api_id: '133613' },
  { id: '5', sport_id: '1', name: 'Manchester United', external_api_id: '133612' },
  { id: '6', sport_id: '1', name: 'Tottenham Hotspur', external_api_id: '133616' },
  { id: '7', sport_id: '1', name: 'Newcastle United', external_api_id: '133615' },
  { id: '8', sport_id: '1', name: 'Aston Villa', external_api_id: '133601' },
  { id: '9', sport_id: '1', name: 'Brighton', external_api_id: '133619' },
  { id: '10', sport_id: '1', name: 'West Ham United', external_api_id: '133622' },
  // Formula 1 teams
  { id: '11', sport_id: '2', name: 'Ferrari', external_api_id: 'ferrari' },
  { id: '12', sport_id: '2', name: 'Red Bull Racing', external_api_id: 'red_bull' },
  { id: '13', sport_id: '2', name: 'Mercedes', external_api_id: 'mercedes' },
  { id: '14', sport_id: '2', name: 'McLaren', external_api_id: 'mclaren' },
  { id: '15', sport_id: '2', name: 'Aston Martin F1', external_api_id: 'aston_martin' },
];

export const mockEvents: SportsEvent[] = [
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
    home_team_id: '2',
    away_team_id: '3',
    title: 'Chelsea vs Liverpool',
    datetime_utc: '2026-02-16T14:00:00Z',
    venue: 'Stamford Bridge',
    competition: 'Premier League',
    external_event_id: 'pl_002',
  },
  {
    id: '3',
    sport_id: '1',
    home_team_id: '3',
    away_team_id: '1',
    title: 'Liverpool vs Arsenal',
    datetime_utc: '2026-02-21T17:30:00Z',
    venue: 'Anfield',
    competition: 'Premier League',
    external_event_id: 'pl_003',
  },
  {
    id: '4',
    sport_id: '1',
    home_team_id: '4',
    away_team_id: '6',
    title: 'Manchester City vs Tottenham',
    datetime_utc: '2026-02-22T12:30:00Z',
    venue: 'Etihad Stadium',
    competition: 'Premier League',
    external_event_id: 'pl_004',
  },
  {
    id: '5',
    sport_id: '1',
    home_team_id: '5',
    away_team_id: '7',
    title: 'Manchester United vs Newcastle',
    datetime_utc: '2026-02-22T15:00:00Z',
    venue: 'Old Trafford',
    competition: 'Premier League',
    external_event_id: 'pl_005',
  },
  {
    id: '6',
    sport_id: '1',
    home_team_id: '8',
    away_team_id: '9',
    title: 'Aston Villa vs Brighton',
    datetime_utc: '2026-02-28T15:00:00Z',
    venue: 'Villa Park',
    competition: 'Premier League',
    external_event_id: 'pl_006',
  },
  {
    id: '7',
    sport_id: '1',
    home_team_id: '10',
    away_team_id: '4',
    title: 'West Ham vs Manchester City',
    datetime_utc: '2026-03-01T16:30:00Z',
    venue: 'London Stadium',
    competition: 'Premier League',
    external_event_id: 'pl_007',
  },
  {
    id: '8',
    sport_id: '1',
    home_team_id: '6',
    away_team_id: '5',
    title: 'Tottenham vs Manchester United',
    datetime_utc: '2026-03-08T12:30:00Z',
    venue: 'Tottenham Hotspur Stadium',
    competition: 'Premier League',
    external_event_id: 'pl_008',
  },
  {
    id: '9',
    sport_id: '2',
    title: 'Bahrain Grand Prix',
    datetime_utc: '2026-02-28T15:00:00Z',
    venue: 'Bahrain International Circuit',
    competition: 'Formula 1',
    external_event_id: 'f1_001',
  },
  {
    id: '10',
    sport_id: '2',
    title: 'Saudi Arabian Grand Prix',
    datetime_utc: '2026-03-07T18:00:00Z',
    venue: 'Jeddah Corniche Circuit',
    competition: 'Formula 1',
    external_event_id: 'f1_002',
  },
  {
    id: '11',
    sport_id: '2',
    title: 'Australian Grand Prix',
    datetime_utc: '2026-03-21T06:00:00Z',
    venue: 'Albert Park Circuit',
    competition: 'Formula 1',
    external_event_id: 'f1_003',
  },
  {
    id: '12',
    sport_id: '1',
    home_team_id: '1',
    away_team_id: '4',
    title: 'Arsenal vs Manchester City',
    datetime_utc: '2026-03-15T16:30:00Z',
    venue: 'Emirates Stadium',
    competition: 'Premier League',
    external_event_id: 'pl_009',
  },
];

/** Get initials from a team name (e.g. "Manchester City" -> "MC") */
export function getTeamInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);
}
