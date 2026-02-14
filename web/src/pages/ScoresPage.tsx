import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { getTeamInitials } from '../utils/mockData';
import { usePLStandings, useUCLEvents, useUCLStandings } from '../hooks/useFootballData';
import { useF1DriverStandings } from '../hooks/useF1Data';
import type { FootballStanding } from '../hooks/useFootballData';
import './ScoresPage.css';

type SportFilter = 'all' | 'football' | 'motorsport';
type LeagueFilter = 'all' | 'Premier League' | 'Champions League';
type UCLPhase = 'league' | 'tournament';

interface F1StandingRow {
  driver: string;
  team: string;
  pts: number;
}

const fallbackF1Standings: F1StandingRow[] = [
  { driver: 'M. Verstappen', team: 'Red Bull', pts: 51 },
  { driver: 'C. Leclerc', team: 'Ferrari', pts: 42 },
  { driver: 'L. Norris', team: 'McLaren', pts: 38 },
  { driver: 'L. Hamilton', team: 'Mercedes', pts: 30 },
  { driver: 'F. Alonso', team: 'Aston Martin', pts: 22 },
];

function StandingsTable({ data, isLoading, error, refetch, accentClass, title, defaultVisibleRows, expandAll }: {
  data: FootballStanding[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  accentClass: string;
  title: string;
  defaultVisibleRows: number;
  expandAll: boolean;
}) {
  const { t } = useTranslation();
  const rows = data ?? [];
  const visibleRows = expandAll ? rows : rows.slice(0, defaultVisibleRows);

  return (
    <div className={`standings-section ${accentClass}`}>
      <h2 className="standings-league-name">{title}</h2>
      {isLoading ? (
        <div className="standings-loading">Loading...</div>
      ) : error ? (
        <div className="standings-error">
          <p>Couldn't load standings</p>
          <button onClick={refetch} className="retry-btn">Retry</button>
        </div>
      ) : rows.length === 0 ? (
        <div className="standings-loading">No standings available</div>
      ) : (
        <table className="standings-table">
          <thead>
            <tr>
              <th className="standings-col-pos">#</th>
              <th className="standings-col-team">{t('scores.team')}</th>
              <th className="standings-col-stat">P</th>
              <th className="standings-col-stat">W</th>
              <th className="standings-col-stat">D</th>
              <th className="standings-col-stat">L</th>
              <th className="standings-col-stat">GD</th>
              <th className="standings-col-pts">{t('scores.pts')}</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, i) => (
              <tr key={row.teamId} className={i % 2 === 1 ? 'standings-row-alt' : ''}>
                <td className="standings-col-pos">{row.rank}</td>
                <td className="standings-col-team">
                  <span className="standings-team-badge">{getTeamInitials(row.team)}</span>
                  {row.team}
                </td>
                <td className="standings-col-stat">{row.played}</td>
                <td className="standings-col-stat">{row.w}</td>
                <td className="standings-col-stat">{row.d}</td>
                <td className="standings-col-stat">{row.l}</td>
                <td className="standings-col-stat">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                <td className="standings-col-pts">{row.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function ScoresPage() {
  const { t } = useTranslation();
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');
  const [leagueFilter, setLeagueFilter] = useState<LeagueFilter>('all');
  const [expandAll, setExpandAll] = useState(false);
  const [uclPhase, setUclPhase] = useState<UCLPhase>('league');

  const plStandings = usePLStandings();
  const uclStandings = useUCLStandings();
  const uclEvents = useUCLEvents();
  const f1StandingsQuery = useF1DriverStandings();
  const f1Standings = (f1StandingsQuery.data && f1StandingsQuery.data.length > 0)
    ? f1StandingsQuery.data
    : fallbackF1Standings;

  const handleSportFilter = (filter: SportFilter) => {
    setSportFilter(filter);
    setLeagueFilter('all');
  };

  const showFootball = sportFilter === 'all' || sportFilter === 'football';
  const showMotorsport = sportFilter === 'all' || sportFilter === 'motorsport';
  const showPremierLeague = showFootball && (leagueFilter === 'all' || leagueFilter === 'Premier League');
  const showChampionsLeague = showFootball && (leagueFilter === 'all' || leagueFilter === 'Champions League');
  const showExpandControl = showPremierLeague || showChampionsLeague || showMotorsport;
  const uclTournamentFixtures = (uclEvents.data ?? [])
    .filter((event) => (event.round ?? 0) >= 32)
    .sort((a, b) => parseISO(a.datetime_utc).getTime() - parseISO(b.datetime_utc).getTime());

  return (
    <div className="scores-page">
      <div className="scores-sticky-header">
        <header className="scores-header">
          <h1 className="scores-title">{t('scores.title')}</h1>
        </header>
      </div>

      <div className="scores-filters">
        <button
          className={`scores-filter-btn ${sportFilter === 'all' ? 'active' : ''}`}
          onClick={() => handleSportFilter('all')}
        >
          {t('filters.all')}
        </button>
        <button
          className={`scores-filter-btn ${sportFilter === 'football' ? 'active' : ''}`}
          onClick={() => handleSportFilter('football')}
        >
          <span className="filter-icon">⚽</span>
          {t('filters.football')}
        </button>
        <button
          className={`scores-filter-btn ${sportFilter === 'motorsport' ? 'active' : ''}`}
          onClick={() => handleSportFilter('motorsport')}
        >
          <span className="filter-icon">🏎️</span>
          {t('filters.motorsport')}
        </button>
      </div>

      {sportFilter === 'football' && (
        <div className="scores-league-filters">
          <button
            className={`scores-filter-btn scores-league-btn ${leagueFilter === 'all' ? 'active' : ''}`}
            onClick={() => setLeagueFilter('all')}
          >
            {t('filters.allLeagues')}
          </button>
          <button
            className={`scores-filter-btn scores-league-btn ${leagueFilter === 'Premier League' ? 'active' : ''}`}
            onClick={() => setLeagueFilter('Premier League')}
          >
            {t('filters.premierLeague')}
          </button>
          <button
            className={`scores-filter-btn scores-league-btn ${leagueFilter === 'Champions League' ? 'active' : ''}`}
            onClick={() => setLeagueFilter('Champions League')}
          >
            {t('filters.championsLeague')}
          </button>
        </div>
      )}

      <div className="scores-content">
        {showExpandControl && (
          <div className="scores-table-controls">
            <button className="scores-expand-btn" onClick={() => setExpandAll(v => !v)}>
              {expandAll ? 'Collapse all' : 'Expand all'}
            </button>
          </div>
        )}

        {showPremierLeague && (
          <StandingsTable
            data={plStandings.data}
            isLoading={plStandings.isLoading}
            error={plStandings.error}
            refetch={() => plStandings.refetch()}
            accentClass="standings-football"
            title={t('filters.premierLeague')}
            defaultVisibleRows={10}
            expandAll={expandAll}
          />
        )}

        {showChampionsLeague && (
          <div className="standings-section standings-ucl">
            <div className="ucl-phase-header">
              <h2 className="standings-league-name">{t('filters.championsLeague')}</h2>
              <div className="ucl-phase-toggle">
                <button
                  className={`ucl-phase-btn ${uclPhase === 'league' ? 'active' : ''}`}
                  onClick={() => setUclPhase('league')}
                >
                  League phase
                </button>
                <button
                  className={`ucl-phase-btn ${uclPhase === 'tournament' ? 'active' : ''}`}
                  onClick={() => setUclPhase('tournament')}
                >
                  Tournament phase
                </button>
              </div>
            </div>

            {uclPhase === 'league' ? (
              <StandingsTable
                data={uclStandings.data}
                isLoading={uclStandings.isLoading}
                error={uclStandings.error}
                refetch={() => uclStandings.refetch()}
                accentClass="standings-ucl"
                title="League table"
                defaultVisibleRows={12}
                expandAll={expandAll}
              />
            ) : (
              <div className="ucl-tournament-list">
                {uclEvents.isLoading ? (
                  <div className="standings-loading">Loading...</div>
                ) : uclTournamentFixtures.length === 0 ? (
                  <div className="standings-loading">No tournament fixtures available yet.</div>
                ) : (
                  uclTournamentFixtures.map((event) => (
                    <div key={event.id} className="ucl-tournament-card">
                      <div className="ucl-tournament-round">Knockout Round</div>
                      <div className="ucl-tournament-title">{event.title}</div>
                      <div className="ucl-tournament-meta">
                        <span>{format(parseISO(event.datetime_utc), 'MMM d, HH:mm')}</span>
                        <span>{event.venue}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {showMotorsport && (
          <div className="standings-section standings-f1">
            <h2 className="standings-league-name">{t('scores.f1DriverStandings')}</h2>
            <table className="standings-table">
              <thead>
                <tr>
                  <th className="standings-col-pos">#</th>
                  <th className="standings-col-team">{t('scores.driver')}</th>
                  <th className="standings-col-f1-team">{t('scores.team')}</th>
                  <th className="standings-col-pts">{t('scores.pts')}</th>
                </tr>
              </thead>
              <tbody>
                {(expandAll ? f1Standings : f1Standings.slice(0, 3)).map((row, i) => (
                  <tr key={row.driver} className={i % 2 === 1 ? 'standings-row-alt' : ''}>
                    <td className="standings-col-pos">{i + 1}</td>
                    <td className="standings-col-team">{row.driver}</td>
                    <td className="standings-col-f1-team">{row.team}</td>
                    <td className="standings-col-pts">{row.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
