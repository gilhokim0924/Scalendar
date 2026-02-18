import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getTeamInitials } from '../utils/mockData';
import { FOOTBALL_LEAGUES, useLeagueEvents, useLeagueTeams } from '../hooks/useFootballData';
import { BASEBALL_LEAGUES, useBaseballLeagueEvents, useBaseballLeagueTeams } from '../hooks/useBaseballData';
import { BASKETBALL_LEAGUES, useBasketballLeagueEvents, useBasketballLeagueTeams } from '../hooks/useBasketballData';
import { AMERICAN_FOOTBALL_LEAGUES, useAmericanFootballLeagueEvents, useAmericanFootballLeagueTeams } from '../hooks/useAmericanFootballData';
import { useAuth } from '../contexts/AuthContext';
import { addUserSelectedTeam, clearUserSelectedTeams, fetchUserSelectedTeams, removeUserSelectedTeam } from '../services/userPreferences';
import { useNavigate } from 'react-router-dom';
import type { Team } from '../types';
import './TeamsPage.css';

type SportFilter = 'all' | '1' | '2' | '3' | '4' | '5';
type LeagueFilter =
  | 'all'
  | 'Premier League'
  | 'Champions League'
  | 'Europa League'
  | 'Europa Conference League'
  | 'La Liga'
  | 'Bundesliga'
  | 'Serie A'
  | 'Ligue 1';
type BaseballLeagueFilter = 'all' | 'MLB' | 'KBO';
const F1_SELECTION_ID = 'f1';
const LEGACY_F1_SELECTION_IDS = new Set(['11', '12', '13', '14', '15']);

function uniqueTeamsById(teams: Team[]): Team[] {
  const byId = new Map<string, Team>();
  for (const team of teams) {
    if (!byId.has(team.id)) {
      byId.set(team.id, team);
    }
  }
  return Array.from(byId.values());
}

function getTeamThemeClass(team: Team): string {
  if (team.sport_id === '2') return 'theme-f1';
  const league = (team.league ?? '').toLowerCase();
  if (league.includes('champions')) return 'theme-ucl';
  if (league.includes('conference')) return 'theme-conference';
  if (league.includes('europa')) return 'theme-europa';
  if (league.includes('la liga')) return 'theme-laliga';
  if (league.includes('bundesliga')) return 'theme-bundesliga';
  if (league.includes('serie a')) return 'theme-seriea';
  if (league.includes('ligue 1')) return 'theme-ligue1';
  if (league.includes('mlb')) return 'theme-mlb';
  if (league.includes('kbo')) return 'theme-kbo';
  if (league.includes('nba')) return 'theme-mlb';
  if (league.includes('nfl')) return 'theme-kbo';
  return 'theme-pl';
}

export default function TeamsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');
  const [leagueFilter, setLeagueFilter] = useState<LeagueFilter>('all');
  const [baseballLeagueFilter, setBaseballLeagueFilter] = useState<BaseballLeagueFilter>('all');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const plTeams = useLeagueTeams(FOOTBALL_LEAGUES.premierLeague.id);
  const uclTeams = useLeagueTeams(FOOTBALL_LEAGUES.championsLeague.id);
  const europaTeams = useLeagueTeams(FOOTBALL_LEAGUES.europaLeague.id);
  const conferenceTeams = useLeagueTeams(FOOTBALL_LEAGUES.conferenceLeague.id);
  const laLigaTeams = useLeagueTeams(FOOTBALL_LEAGUES.laLiga.id);
  const bundesligaTeams = useLeagueTeams(FOOTBALL_LEAGUES.bundesliga.id);
  const serieATeams = useLeagueTeams(FOOTBALL_LEAGUES.serieA.id);
  const ligue1Teams = useLeagueTeams(FOOTBALL_LEAGUES.ligue1.id);
  const mlbTeams = useBaseballLeagueTeams(BASEBALL_LEAGUES.mlb.id);
  const kboTeams = useBaseballLeagueTeams(BASEBALL_LEAGUES.kbo.id);
  const nbaTeams = useBasketballLeagueTeams(BASKETBALL_LEAGUES.nba.id);
  const nflTeams = useAmericanFootballLeagueTeams(AMERICAN_FOOTBALL_LEAGUES.nfl.id);

  const plEvents = useLeagueEvents(FOOTBALL_LEAGUES.premierLeague.id);
  const uclEvents = useLeagueEvents(FOOTBALL_LEAGUES.championsLeague.id);
  const europaEvents = useLeagueEvents(FOOTBALL_LEAGUES.europaLeague.id);
  const conferenceEvents = useLeagueEvents(FOOTBALL_LEAGUES.conferenceLeague.id);
  const laLigaEvents = useLeagueEvents(FOOTBALL_LEAGUES.laLiga.id);
  const bundesligaEvents = useLeagueEvents(FOOTBALL_LEAGUES.bundesliga.id);
  const serieAEvents = useLeagueEvents(FOOTBALL_LEAGUES.serieA.id);
  const ligue1Events = useLeagueEvents(FOOTBALL_LEAGUES.ligue1.id);
  const mlbEvents = useBaseballLeagueEvents(BASEBALL_LEAGUES.mlb.id);
  const kboEvents = useBaseballLeagueEvents(BASEBALL_LEAGUES.kbo.id);
  const nbaEvents = useBasketballLeagueEvents(BASKETBALL_LEAGUES.nba.id);
  const nflEvents = useAmericanFootballLeagueEvents(AMERICAN_FOOTBALL_LEAGUES.nfl.id);

  const eventDerivedFootballTeams = useMemo<Team[]>(() => {
    const toTeam = (id: string | undefined, name: string | undefined, league: string): Team | null => {
      if (!id || !name) return null;
      return {
        id,
        sport_id: '1',
        name,
        external_api_id: id,
        league,
      };
    };

    const pl = (plEvents.data ?? []).flatMap((event) => ([
      toTeam(event.home_team_id, event.home_team_name, 'Premier League'),
      toTeam(event.away_team_id, event.away_team_name, 'Premier League'),
    ])).filter((team): team is Team => Boolean(team));

    const ucl = (uclEvents.data ?? []).flatMap((event) => ([
      toTeam(event.home_team_id, event.home_team_name, 'Champions League'),
      toTeam(event.away_team_id, event.away_team_name, 'Champions League'),
    ])).filter((team): team is Team => Boolean(team));

    const europa = (europaEvents.data ?? []).flatMap((event) => ([
      toTeam(event.home_team_id, event.home_team_name, 'Europa League'),
      toTeam(event.away_team_id, event.away_team_name, 'Europa League'),
    ])).filter((team): team is Team => Boolean(team));

    const conference = (conferenceEvents.data ?? []).flatMap((event) => ([
      toTeam(event.home_team_id, event.home_team_name, 'Europa Conference League'),
      toTeam(event.away_team_id, event.away_team_name, 'Europa Conference League'),
    ])).filter((team): team is Team => Boolean(team));

    const laLiga = (laLigaEvents.data ?? []).flatMap((event) => ([
      toTeam(event.home_team_id, event.home_team_name, 'La Liga'),
      toTeam(event.away_team_id, event.away_team_name, 'La Liga'),
    ])).filter((team): team is Team => Boolean(team));

    const bundesliga = (bundesligaEvents.data ?? []).flatMap((event) => ([
      toTeam(event.home_team_id, event.home_team_name, 'Bundesliga'),
      toTeam(event.away_team_id, event.away_team_name, 'Bundesliga'),
    ])).filter((team): team is Team => Boolean(team));

    const serieA = (serieAEvents.data ?? []).flatMap((event) => ([
      toTeam(event.home_team_id, event.home_team_name, 'Serie A'),
      toTeam(event.away_team_id, event.away_team_name, 'Serie A'),
    ])).filter((team): team is Team => Boolean(team));

    const ligue1 = (ligue1Events.data ?? []).flatMap((event) => ([
      toTeam(event.home_team_id, event.home_team_name, 'Ligue 1'),
      toTeam(event.away_team_id, event.away_team_name, 'Ligue 1'),
    ])).filter((team): team is Team => Boolean(team));

    return [...pl, ...ucl, ...europa, ...conference, ...laLiga, ...bundesliga, ...serieA, ...ligue1];
  }, [plEvents.data, uclEvents.data, europaEvents.data, conferenceEvents.data, laLigaEvents.data, bundesligaEvents.data, serieAEvents.data, ligue1Events.data]);

  const eventDerivedBaseballTeams = useMemo<Team[]>(() => {
    const toTeam = (id: string | undefined, name: string | undefined, league: string): Team | null => {
      if (!id || !name) return null;
      return {
        id,
        sport_id: '3',
        name,
        external_api_id: id,
        league,
      };
    };

    const mlb = (mlbEvents.data ?? []).flatMap((event) => ([
      toTeam(event.home_team_id, event.home_team_name, 'MLB'),
      toTeam(event.away_team_id, event.away_team_name, 'MLB'),
    ])).filter((team): team is Team => Boolean(team));

    const kbo = (kboEvents.data ?? []).flatMap((event) => ([
      toTeam(event.home_team_id, event.home_team_name, 'KBO'),
      toTeam(event.away_team_id, event.away_team_name, 'KBO'),
    ])).filter((team): team is Team => Boolean(team));

    return [...mlb, ...kbo];
  }, [mlbEvents.data, kboEvents.data]);

  const eventDerivedBasketballTeams = useMemo<Team[]>(() => {
    const toTeam = (id: string | undefined, name: string | undefined, league: string): Team | null => {
      if (!id || !name) return null;
      return {
        id,
        sport_id: '4',
        name,
        external_api_id: id,
        league,
      };
    };

    return (nbaEvents.data ?? []).flatMap((event) => ([
      toTeam(event.home_team_id, event.home_team_name, 'NBA'),
      toTeam(event.away_team_id, event.away_team_name, 'NBA'),
    ])).filter((team): team is Team => Boolean(team));
  }, [nbaEvents.data]);

  const eventDerivedAmericanFootballTeams = useMemo<Team[]>(() => {
    const toTeam = (id: string | undefined, name: string | undefined, league: string): Team | null => {
      if (!id || !name) return null;
      return {
        id,
        sport_id: '5',
        name,
        external_api_id: id,
        league,
      };
    };

    return (nflEvents.data ?? []).flatMap((event) => ([
      toTeam(event.home_team_id, event.home_team_name, 'NFL'),
      toTeam(event.away_team_id, event.away_team_name, 'NFL'),
    ])).filter((team): team is Team => Boolean(team));
  }, [nflEvents.data]);

  const f1Teams = useMemo<Team[]>(() => ([
    {
      id: F1_SELECTION_ID,
      sport_id: '2',
      name: 'Formula 1',
      external_api_id: 'f1',
      league: 'Formula 1',
    },
  ]), []);

  const allTeams: Team[] = useMemo(() => {
    const apiPl = plTeams.data ?? [];
    const apiUcl = uclTeams.data ?? [];
    const apiEuropa = europaTeams.data ?? [];
    const apiConference = conferenceTeams.data ?? [];
    const apiLaLiga = laLigaTeams.data ?? [];
    const apiBundesliga = bundesligaTeams.data ?? [];
    const apiSerieA = serieATeams.data ?? [];
    const apiLigue1 = ligue1Teams.data ?? [];
    const apiMlb = mlbTeams.data ?? [];
    const apiKbo = kboTeams.data ?? [];
    const apiNba = nbaTeams.data ?? [];
    const apiNfl = nflTeams.data ?? [];
    return uniqueTeamsById([
      ...apiPl,
      ...apiUcl,
      ...apiEuropa,
      ...apiConference,
      ...apiLaLiga,
      ...apiBundesliga,
      ...apiSerieA,
      ...apiLigue1,
      ...apiMlb,
      ...apiKbo,
      ...apiNba,
      ...apiNfl,
      ...eventDerivedFootballTeams,
      ...eventDerivedBaseballTeams,
      ...eventDerivedBasketballTeams,
      ...eventDerivedAmericanFootballTeams,
      ...f1Teams,
    ]);
  }, [
    plTeams.data,
    uclTeams.data,
    europaTeams.data,
    conferenceTeams.data,
    laLigaTeams.data,
    bundesligaTeams.data,
    serieATeams.data,
    ligue1Teams.data,
    mlbTeams.data,
    kboTeams.data,
    nbaTeams.data,
    nflTeams.data,
    eventDerivedFootballTeams,
    eventDerivedBaseballTeams,
    eventDerivedBasketballTeams,
    eventDerivedAmericanFootballTeams,
    f1Teams,
  ]);

  const isLoading = plTeams.isLoading || uclTeams.isLoading || europaTeams.isLoading || conferenceTeams.isLoading || laLigaTeams.isLoading || bundesligaTeams.isLoading || serieATeams.isLoading || ligue1Teams.isLoading || mlbTeams.isLoading || kboTeams.isLoading || nbaTeams.isLoading || nflTeams.isLoading;
  const hasError = plTeams.error && uclTeams.error && europaTeams.error && conferenceTeams.error && laLigaTeams.error && bundesligaTeams.error && serieATeams.error && ligue1Teams.error && mlbTeams.error && kboTeams.error && nbaTeams.error && nflTeams.error;

  useEffect(() => {
    let cancelled = false;

    const loadSelectedTeams = async () => {
      try {
        if (user?.id) {
          const teamIds = await fetchUserSelectedTeams(user.id);
          const normalized = Array.from(new Set(teamIds.map((id) => (
            LEGACY_F1_SELECTION_IDS.has(id) ? F1_SELECTION_ID : id
          ))));
          if (!cancelled) {
            setSelectedTeams(normalized);
            localStorage.setItem('selectedTeams', JSON.stringify(normalized));
          }
          return;
        }

        const saved = localStorage.getItem('selectedTeams');
        if (!saved) return;
        const parsed: string[] = JSON.parse(saved);
        const normalized = Array.from(new Set(parsed.map((id) => (
          LEGACY_F1_SELECTION_IDS.has(id) ? F1_SELECTION_ID : id
        ))));
        if (!cancelled) {
          setSelectedTeams(normalized);
          localStorage.setItem('selectedTeams', JSON.stringify(normalized));
        }
      } catch (error) {
        console.error('Failed to load selected teams', error);
      }
    };

    void loadSelectedTeams();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const handleSportFilter = (filter: SportFilter) => {
    setSportFilter(filter);
    setLeagueFilter('all');
    setBaseballLeagueFilter('all');
  };

  const toggleTeam = (teamId: string) => {
    const isSelected = selectedTeams.includes(teamId);
    const newSelection = selectedTeams.includes(teamId)
      ? selectedTeams.filter(id => id !== teamId)
      : [...selectedTeams, teamId];

    setSelectedTeams(newSelection);
    localStorage.setItem('selectedTeams', JSON.stringify(newSelection));

    if (user?.id) {
      const op = isSelected
        ? removeUserSelectedTeam(user.id, teamId)
        : addUserSelectedTeam(user.id, teamId);
      void op.catch((error) => {
        console.error('Failed to sync selected team', error);
      });
    }
  };

  const handleDone = () => {
    navigate('/');
  };

  const clearAllTeams = () => {
    setSelectedTeams([]);
    localStorage.removeItem('selectedTeams');
    if (user?.id) {
      void clearUserSelectedTeams(user.id).catch((error) => {
        console.error('Failed to clear selected teams', error);
      });
    }
  };

  let filteredTeams = allTeams;

  if (sportFilter !== 'all') {
    filteredTeams = filteredTeams.filter(t => t.sport_id === sportFilter);
  }

  if (sportFilter === '1' && leagueFilter !== 'all') {
    filteredTeams = filteredTeams.filter(t => t.league === leagueFilter);
  }
  if (sportFilter === '3' && baseballLeagueFilter !== 'all') {
    filteredTeams = filteredTeams.filter(t => t.league === baseballLeagueFilter);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredTeams = filteredTeams.filter(t => t.name.toLowerCase().includes(q));
  }

  const selectedTeamObjects = allTeams.filter(t => selectedTeams.includes(t.id));

  return (
    <div className="teams-page">
      <div className="teams-sticky-header">
        <header className="teams-header">
          <h1 className="teams-title">{t('teams.title')}</h1>
        </header>

        {/* Search Bar */}
        <div className="teams-search-wrapper">
          <div className="teams-search-bar">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="12.5" y1="12.5" x2="16" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder={t('teams.searchPlaceholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="teams-search-input"
            />
          </div>
        </div>

        {/* Sport Filter Chips */}
        <div className="teams-filters">
          <button
            className={`teams-filter-btn ${sportFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleSportFilter('all')}
          >
            {t('filters.all')}
          </button>
          <button
            className={`teams-filter-btn ${sportFilter === '1' ? 'active' : ''}`}
            onClick={() => handleSportFilter('1')}
          >
            <span className="filter-icon">⚽</span>
            {t('filters.football')}
          </button>
          <button
            className={`teams-filter-btn ${sportFilter === '3' ? 'active' : ''}`}
            onClick={() => handleSportFilter('3')}
          >
            <span className="filter-icon">⚾</span>
            {t('filters.baseball')}
          </button>
          <button
            className={`teams-filter-btn ${sportFilter === '4' ? 'active' : ''}`}
            onClick={() => handleSportFilter('4')}
          >
            <span className="filter-icon">🏀</span>
            {t('filters.basketball')}
          </button>
          <button
            className={`teams-filter-btn ${sportFilter === '5' ? 'active' : ''}`}
            onClick={() => handleSportFilter('5')}
          >
            <span className="filter-icon">🏈</span>
            {t('filters.americanFootball')}
          </button>
          <button
            className={`teams-filter-btn ${sportFilter === '2' ? 'active' : ''}`}
            onClick={() => handleSportFilter('2')}
          >
            <span className="filter-icon">🏎️</span>
            {t('filters.motorsport')}
          </button>
        </div>

        {/* League Filter Chips (Football only) */}
        {sportFilter === '1' && (
          <div className="teams-league-filters">
            <div className="teams-league-row">
              <button
                className={`teams-filter-btn teams-league-btn ${leagueFilter === 'all' ? 'active' : ''}`}
                onClick={() => setLeagueFilter('all')}
              >
                {t('filters.all')}
              </button>
              <button
                className={`teams-filter-btn teams-league-btn teams-league-pl ${leagueFilter === 'Premier League' ? 'active' : ''}`}
                onClick={() => setLeagueFilter('Premier League')}
              >
                {t('filters.premierLeague')}
              </button>
              <button
                className={`teams-filter-btn teams-league-btn teams-league-laliga ${leagueFilter === 'La Liga' ? 'active' : ''}`}
                onClick={() => setLeagueFilter('La Liga')}
              >
                {t('filters.laLiga')}
              </button>
              <button
                className={`teams-filter-btn teams-league-btn teams-league-bundesliga ${leagueFilter === 'Bundesliga' ? 'active' : ''}`}
                onClick={() => setLeagueFilter('Bundesliga')}
              >
                {t('filters.bundesliga')}
              </button>
              <button
                className={`teams-filter-btn teams-league-btn teams-league-seriea ${leagueFilter === 'Serie A' ? 'active' : ''}`}
                onClick={() => setLeagueFilter('Serie A')}
              >
                {t('filters.serieA')}
              </button>
              <button
                className={`teams-filter-btn teams-league-btn teams-league-ligue1 ${leagueFilter === 'Ligue 1' ? 'active' : ''}`}
                onClick={() => setLeagueFilter('Ligue 1')}
              >
                {t('filters.ligue1')}
              </button>
            </div>
            <div className="teams-league-row">
              <button
                className={`teams-filter-btn teams-league-btn teams-league-ucl ${leagueFilter === 'Champions League' ? 'active' : ''}`}
                onClick={() => setLeagueFilter('Champions League')}
              >
                {t('filters.championsLeague')}
              </button>
              <button
                className={`teams-filter-btn teams-league-btn teams-league-europa ${leagueFilter === 'Europa League' ? 'active' : ''}`}
                onClick={() => setLeagueFilter('Europa League')}
              >
                {t('filters.europaLeague')}
              </button>
              <button
                className={`teams-filter-btn teams-league-btn teams-league-conference ${leagueFilter === 'Europa Conference League' ? 'active' : ''}`}
                onClick={() => setLeagueFilter('Europa Conference League')}
              >
                {t('filters.europaConferenceLeague')}
              </button>
            </div>
          </div>
        )}

        {sportFilter === '3' && (
          <div className="teams-league-filters">
            <div className="teams-league-row">
              <button
                className={`teams-filter-btn teams-league-btn ${baseballLeagueFilter === 'all' ? 'active' : ''}`}
                onClick={() => setBaseballLeagueFilter('all')}
              >
                {t('filters.all')}
              </button>
              <button
                className={`teams-filter-btn teams-league-btn teams-league-mlb ${baseballLeagueFilter === 'MLB' ? 'active' : ''}`}
                onClick={() => setBaseballLeagueFilter('MLB')}
              >
                {t('filters.mlb')}
              </button>
              <button
                className={`teams-filter-btn teams-league-btn teams-league-kbo ${baseballLeagueFilter === 'KBO' ? 'active' : ''}`}
                onClick={() => setBaseballLeagueFilter('KBO')}
              >
                {t('filters.kbo')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Team List */}
      <div className="teams-list">
        {isLoading ? (
          <div className="teams-loading teams-loading-state">
            <span className="loading-with-spinner">
              <span className="loading-spinner" aria-hidden="true" />
              <span>Loading teams...</span>
            </span>
          </div>
        ) : hasError ? (
          <div className="teams-loading">
            <p>Couldn't load teams</p>
            <button onClick={() => { plTeams.refetch(); uclTeams.refetch(); europaTeams.refetch(); conferenceTeams.refetch(); laLigaTeams.refetch(); bundesligaTeams.refetch(); serieATeams.refetch(); ligue1Teams.refetch(); mlbTeams.refetch(); kboTeams.refetch(); nbaTeams.refetch(); nflTeams.refetch(); }} className="retry-btn">Retry</button>
          </div>
        ) : (
          <>
            {filteredTeams.map(team => {
              const isSelected = selectedTeams.includes(team.id);
              return (
                <div key={team.id} className="teams-list-row" onClick={() => toggleTeam(team.id)}>
                  <div className="teams-list-logo">{getTeamInitials(team.name)}</div>
                  <div className="teams-list-name">{team.name}</div>
                  <button className={`teams-list-toggle ${isSelected ? 'selected' : ''}`}>
                    {isSelected ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M13.3332 4L5.99984 11.3333L2.6665 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <span>+</span>
                    )}
                  </button>
                </div>
              );
            })}
            {filteredTeams.length === 0 && (
              <div className="teams-empty">{t('teams.noTeams')}</div>
            )}
          </>
        )}
      </div>

      {/* Selected Teams Bar */}
      <div className="teams-selected-bar">
        <div className="teams-selected-bar-inner">
          <div className="teams-selected-avatars">
            {selectedTeamObjects.slice(0, 6).map(team => (
              <div key={team.id} className={`teams-selected-avatar ${getTeamThemeClass(team)}`}>{getTeamInitials(team.name)}</div>
            ))}
            {selectedTeamObjects.length > 6 && (
              <div className="teams-selected-more">+{selectedTeamObjects.length - 6}</div>
            )}
          </div>
          <div className="teams-selected-actions">
            <button className="teams-bar-tab" onClick={clearAllTeams}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <span>{t('teams.clear')}</span>
            </button>
            <button className="teams-bar-tab" onClick={handleDone}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{t('teams.done')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
