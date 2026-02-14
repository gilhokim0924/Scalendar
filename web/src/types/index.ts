export interface Sport {
  id: string;
  name: string;
  icon: string;
  icon_url?: string;
}

export interface Team {
  id: string;
  sport_id: string;
  name: string;
  logo_url?: string;
  external_api_id: string;
  league?: string;
}

export interface SportsEvent {
  id: string;
  sport_id: string;
  round?: number;
  home_team_id?: string;
  away_team_id?: string;
  title: string;
  datetime_utc: string;
  venue: string;
  competition: string;
  external_event_id: string;
  home_score?: number;
  away_score?: number;
  result?: string; // F1 podium/standings summary
  home_team_name?: string;
  away_team_name?: string;
}

export interface UserSubscription {
  user_id: string;
  team_id: string;
  created_at: string;
}
