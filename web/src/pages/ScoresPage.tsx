import { useState, useEffect, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { getTeamInitials } from '../utils/mockData';
import {
  useConferenceStandings,
  useConferenceEvents,
  FOOTBALL_LEAGUES,
  useEuropaStandings,
  useEuropaEvents,
  useBundesligaStandings,
  useLaLigaStandings,
  useLigue1Standings,
  usePLStandings,
  useSerieAStandings,
  useUCLEvents,
  useUCLStandings,
} from '../hooks/useFootballData';
import { useF1DriverStandings } from '../hooks/useF1Data';
import type { FootballStanding } from '../hooks/useFootballData';
import './ScoresPage.css';

type SportFilter = 'all' | 'football' | 'motorsport';
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
type CompetitionPhase = 'league' | 'tournament';
type F1Mode = 'driver' | 'constructor';

interface F1StandingRow {
  driver: string;
  team: string;
  pts: number;
}

interface F1ConstructorStandingRow {
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

function StandingsTable({ data, isLoading, error, refetch, accentClass, title, defaultVisibleRows, expandAll, onToggleExpand }: {
  data: FootballStanding[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  accentClass: string;
  title: string;
  defaultVisibleRows: number;
  expandAll: boolean;
  onToggleExpand: () => void;
}) {
  const { t } = useTranslation();
  const rows = data ?? [];
  const visibleRows = expandAll ? rows : rows.slice(0, defaultVisibleRows);
  const canExpand = rows.length > defaultVisibleRows;

  return (
    <div className={`standings-section ${accentClass}`}>
      {title && <h2 className="standings-league-name">{title}</h2>}
      {isLoading ? (
        <div className="standings-loading">
          <span className="loading-with-spinner">
            <span className="loading-spinner" aria-hidden="true" />
            <span>Loading...</span>
          </span>
        </div>
      ) : error ? (
        <div className="standings-error">
          <p>Couldn't load standings</p>
          <button onClick={refetch} className="retry-btn">Retry</button>
        </div>
      ) : rows.length === 0 ? (
        <div className="standings-loading">No standings available</div>
      ) : (
        <>
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
          {canExpand && (
            <div className="scores-view-more-row">
              <button className="scores-expand-btn" onClick={onToggleExpand}>
                {expandAll ? 'View less' : 'View more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ScoresPage() {
  const { t } = useTranslation();
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');
  const [leagueFilter, setLeagueFilter] = useState<LeagueFilter>('all');
  const [plExpanded, setPlExpanded] = useState(false);
  const [laLigaExpanded, setLaLigaExpanded] = useState(false);
  const [bundesligaExpanded, setBundesligaExpanded] = useState(false);
  const [serieAExpanded, setSerieAExpanded] = useState(false);
  const [ligue1Expanded, setLigue1Expanded] = useState(false);
  const [uclLeagueExpanded, setUclLeagueExpanded] = useState(false);
  const [uclTournamentExpanded, setUclTournamentExpanded] = useState(false);
  const [europaLeagueExpanded, setEuropaLeagueExpanded] = useState(false);
  const [europaTournamentExpanded, setEuropaTournamentExpanded] = useState(false);
  const [conferenceLeagueExpanded, setConferenceLeagueExpanded] = useState(false);
  const [conferenceTournamentExpanded, setConferenceTournamentExpanded] = useState(false);
  const [f1Expanded, setF1Expanded] = useState(false);
  const [f1Mode, setF1Mode] = useState<F1Mode>('driver');
  const [uclPhase, setUclPhase] = useState<CompetitionPhase>('league');
  const [europaPhase, setEuropaPhase] = useState<CompetitionPhase>('league');
  const [conferencePhase, setConferencePhase] = useState<CompetitionPhase>('league');

  const plStandings = usePLStandings();
  const laLigaStandings = useLaLigaStandings();
  const bundesligaStandings = useBundesligaStandings();
  const serieAStandings = useSerieAStandings();
  const ligue1Standings = useLigue1Standings();
  const uclStandings = useUCLStandings();
  const uclEvents = useUCLEvents();
  const europaStandings = useEuropaStandings();
  const conferenceStandings = useConferenceStandings();
  const europaEvents = useEuropaEvents();
  const conferenceEvents = useConferenceEvents();
  const f1StandingsQuery = useF1DriverStandings();
  const f1Standings = (f1StandingsQuery.data && f1StandingsQuery.data.length > 0)
    ? f1StandingsQuery.data
    : fallbackF1Standings;
  const f1ConstructorStandings = useMemo<F1ConstructorStandingRow[]>(() => {
    const pointsByTeam = new Map<string, number>();
    f1Standings.forEach((row) => {
      pointsByTeam.set(row.team, (pointsByTeam.get(row.team) ?? 0) + row.pts);
    });

    return Array.from(pointsByTeam.entries())
      .map(([team, pts]) => ({ team, pts }))
      .sort((a, b) => b.pts - a.pts);
  }, [f1Standings]);

  const handleSportFilter = (filter: SportFilter) => {
    setSportFilter(filter);
    setLeagueFilter('all');
  };

  const showFootball = sportFilter === 'all' || sportFilter === 'football';
  const showMotorsport = sportFilter === 'all' || sportFilter === 'motorsport';
  const showPremierLeague = showFootball && (leagueFilter === 'all' || leagueFilter === 'Premier League');
  const showLaLiga = showFootball && (leagueFilter === 'all' || leagueFilter === 'La Liga');
  const showBundesliga = showFootball && (leagueFilter === 'all' || leagueFilter === 'Bundesliga');
  const showSerieA = showFootball && (leagueFilter === 'all' || leagueFilter === 'Serie A');
  const showLigue1 = showFootball && (leagueFilter === 'all' || leagueFilter === 'Ligue 1');
  const showChampionsLeague = showFootball && (leagueFilter === 'all' || leagueFilter === 'Champions League');
  const showEuropaLeague = showFootball && (leagueFilter === 'all' || leagueFilter === 'Europa League');
  const showConferenceLeague = showFootball && (leagueFilter === 'all' || leagueFilter === 'Europa Conference League');
  const uclTournamentFixtures = (uclEvents.data ?? [])
    .filter((event) => (event.round ?? 0) >= 32)
    .sort((a, b) => parseISO(a.datetime_utc).getTime() - parseISO(b.datetime_utc).getTime());
  const europaTournamentFixtures = (europaEvents.data ?? [])
    .filter((event) => (event.round ?? 0) >= 32)
    .sort((a, b) => parseISO(a.datetime_utc).getTime() - parseISO(b.datetime_utc).getTime());
  const conferenceTournamentFixtures = (conferenceEvents.data ?? [])
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
          <div className="scores-league-row">
            <button
              className={`scores-filter-btn scores-league-btn ${leagueFilter === 'all' ? 'active' : ''}`}
              onClick={() => setLeagueFilter('all')}
            >
              {t('filters.allLeagues')}
            </button>
            <button
              className={`scores-filter-btn scores-league-btn scores-league-pl ${leagueFilter === 'Premier League' ? 'active' : ''}`}
              onClick={() => setLeagueFilter('Premier League')}
            >
              {t('filters.premierLeague')}
            </button>
            <button
              className={`scores-filter-btn scores-league-btn scores-league-laliga ${leagueFilter === 'La Liga' ? 'active' : ''}`}
              onClick={() => setLeagueFilter('La Liga')}
            >
              {t('filters.laLiga')}
            </button>
            <button
              className={`scores-filter-btn scores-league-btn scores-league-bundesliga ${leagueFilter === 'Bundesliga' ? 'active' : ''}`}
              onClick={() => setLeagueFilter('Bundesliga')}
            >
              {t('filters.bundesliga')}
            </button>
            <button
              className={`scores-filter-btn scores-league-btn scores-league-seriea ${leagueFilter === 'Serie A' ? 'active' : ''}`}
              onClick={() => setLeagueFilter('Serie A')}
            >
              {t('filters.serieA')}
            </button>
            <button
              className={`scores-filter-btn scores-league-btn scores-league-ligue1 ${leagueFilter === 'Ligue 1' ? 'active' : ''}`}
              onClick={() => setLeagueFilter('Ligue 1')}
            >
              {t('filters.ligue1')}
            </button>
          </div>
          <div className="scores-league-row">
            <button
              className={`scores-filter-btn scores-league-btn scores-league-ucl ${leagueFilter === 'Champions League' ? 'active' : ''}`}
              onClick={() => setLeagueFilter('Champions League')}
            >
              {t('filters.championsLeague')}
            </button>
            <button
              className={`scores-filter-btn scores-league-btn scores-league-europa ${leagueFilter === 'Europa League' ? 'active' : ''}`}
              onClick={() => setLeagueFilter('Europa League')}
            >
              {t('filters.europaLeague')}
            </button>
            <button
              className={`scores-filter-btn scores-league-btn scores-league-conference ${leagueFilter === 'Europa Conference League' ? 'active' : ''}`}
              onClick={() => setLeagueFilter('Europa Conference League')}
            >
              {t('filters.europaConferenceLeague')}
            </button>
          </div>
        </div>
      )}

      <div className="scores-content">
        {showPremierLeague && (
          <StandingsTable
            data={plStandings.data}
            isLoading={plStandings.isLoading}
            error={plStandings.error}
            refetch={() => plStandings.refetch()}
            accentClass="standings-football"
            title={t('filters.premierLeague')}
            defaultVisibleRows={5}
            expandAll={plExpanded}
            onToggleExpand={() => setPlExpanded((v) => !v)}
          />
        )}

        {showLaLiga && (
          <StandingsTable
            data={laLigaStandings.data}
            isLoading={laLigaStandings.isLoading}
            error={laLigaStandings.error}
            refetch={() => laLigaStandings.refetch()}
            accentClass="standings-laliga"
            title={FOOTBALL_LEAGUES.laLiga.name}
            defaultVisibleRows={5}
            expandAll={laLigaExpanded}
            onToggleExpand={() => setLaLigaExpanded((v) => !v)}
          />
        )}

        {showBundesliga && (
          <StandingsTable
            data={bundesligaStandings.data}
            isLoading={bundesligaStandings.isLoading}
            error={bundesligaStandings.error}
            refetch={() => bundesligaStandings.refetch()}
            accentClass="standings-bundesliga"
            title={FOOTBALL_LEAGUES.bundesliga.name}
            defaultVisibleRows={5}
            expandAll={bundesligaExpanded}
            onToggleExpand={() => setBundesligaExpanded((v) => !v)}
          />
        )}

        {showSerieA && (
          <StandingsTable
            data={serieAStandings.data}
            isLoading={serieAStandings.isLoading}
            error={serieAStandings.error}
            refetch={() => serieAStandings.refetch()}
            accentClass="standings-seriea"
            title={FOOTBALL_LEAGUES.serieA.name}
            defaultVisibleRows={5}
            expandAll={serieAExpanded}
            onToggleExpand={() => setSerieAExpanded((v) => !v)}
          />
        )}

        {showLigue1 && (
          <StandingsTable
            data={ligue1Standings.data}
            isLoading={ligue1Standings.isLoading}
            error={ligue1Standings.error}
            refetch={() => ligue1Standings.refetch()}
            accentClass="standings-ligue1"
            title={FOOTBALL_LEAGUES.ligue1.name}
            defaultVisibleRows={5}
            expandAll={ligue1Expanded}
            onToggleExpand={() => setLigue1Expanded((v) => !v)}
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
                title=""
                defaultVisibleRows={5}
                expandAll={uclLeagueExpanded}
                onToggleExpand={() => setUclLeagueExpanded((v) => !v)}
              />
            ) : (
              <div className="ucl-tournament-list">
                {uclEvents.isLoading ? (
                  <div className="standings-loading">
                    <span className="loading-with-spinner">
                      <span className="loading-spinner" aria-hidden="true" />
                      <span>Loading...</span>
                    </span>
                  </div>
                ) : uclTournamentFixtures.length === 0 ? (
                  <div className="standings-loading">No tournament fixtures available yet.</div>
                ) : (
                  <>
                    {(uclTournamentExpanded ? uclTournamentFixtures : uclTournamentFixtures.slice(0, 5)).map((event) => (
                      <div key={event.id} className="ucl-tournament-card">
                        <div className="ucl-tournament-round">Knockout Round</div>
                        <div className="ucl-tournament-title">{event.title}</div>
                        <div className="ucl-tournament-meta">
                          <span>{format(parseISO(event.datetime_utc), 'MMM d, HH:mm')}</span>
                          <span>{event.venue}</span>
                        </div>
                      </div>
                    ))}
                    {uclTournamentFixtures.length > 5 && (
                      <div className="scores-view-more-row">
                        <button className="scores-expand-btn" onClick={() => setUclTournamentExpanded(v => !v)}>
                          {uclTournamentExpanded ? 'View less' : 'View more'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {showEuropaLeague && (
          <div className="standings-section standings-europa">
            <div className="ucl-phase-header">
              <h2 className="standings-league-name">{t('filters.europaLeague')}</h2>
              <div className="ucl-phase-toggle">
                <button
                  className={`ucl-phase-btn ${europaPhase === 'league' ? 'active' : ''}`}
                  onClick={() => setEuropaPhase('league')}
                >
                  League phase
                </button>
                <button
                  className={`ucl-phase-btn ${europaPhase === 'tournament' ? 'active' : ''}`}
                  onClick={() => setEuropaPhase('tournament')}
                >
                  Tournament phase
                </button>
              </div>
            </div>

            {europaPhase === 'league' ? (
              <StandingsTable
                data={europaStandings.data}
                isLoading={europaStandings.isLoading}
                error={europaStandings.error}
                refetch={() => europaStandings.refetch()}
                accentClass="standings-europa"
                title=""
                defaultVisibleRows={5}
                expandAll={europaLeagueExpanded}
                onToggleExpand={() => setEuropaLeagueExpanded((v) => !v)}
              />
            ) : (
              <div className="ucl-tournament-list">
                {europaEvents.isLoading ? (
                  <div className="standings-loading">
                    <span className="loading-with-spinner">
                      <span className="loading-spinner" aria-hidden="true" />
                      <span>Loading...</span>
                    </span>
                  </div>
                ) : europaTournamentFixtures.length === 0 ? (
                  <div className="standings-loading">No tournament fixtures available yet.</div>
                ) : (
                  <>
                    {(europaTournamentExpanded ? europaTournamentFixtures : europaTournamentFixtures.slice(0, 5)).map((event) => (
                      <div key={event.id} className="ucl-tournament-card">
                        <div className="ucl-tournament-round">Knockout Round</div>
                        <div className="ucl-tournament-title">{event.title}</div>
                        <div className="ucl-tournament-meta">
                          <span>{format(parseISO(event.datetime_utc), 'MMM d, HH:mm')}</span>
                          <span>{event.venue}</span>
                        </div>
                      </div>
                    ))}
                    {europaTournamentFixtures.length > 5 && (
                      <div className="scores-view-more-row">
                        <button className="scores-expand-btn" onClick={() => setEuropaTournamentExpanded((v) => !v)}>
                          {europaTournamentExpanded ? 'View less' : 'View more'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {showConferenceLeague && (
          <div className="standings-section standings-conference">
            <div className="ucl-phase-header">
              <h2 className="standings-league-name">{t('filters.europaConferenceLeague')}</h2>
              <div className="ucl-phase-toggle">
                <button
                  className={`ucl-phase-btn ${conferencePhase === 'league' ? 'active' : ''}`}
                  onClick={() => setConferencePhase('league')}
                >
                  League phase
                </button>
                <button
                  className={`ucl-phase-btn ${conferencePhase === 'tournament' ? 'active' : ''}`}
                  onClick={() => setConferencePhase('tournament')}
                >
                  Tournament phase
                </button>
              </div>
            </div>

            {conferencePhase === 'league' ? (
              <StandingsTable
                data={conferenceStandings.data}
                isLoading={conferenceStandings.isLoading}
                error={conferenceStandings.error}
                refetch={() => conferenceStandings.refetch()}
                accentClass="standings-conference"
                title=""
                defaultVisibleRows={5}
                expandAll={conferenceLeagueExpanded}
                onToggleExpand={() => setConferenceLeagueExpanded((v) => !v)}
              />
            ) : (
              <div className="ucl-tournament-list">
                {conferenceEvents.isLoading ? (
                  <div className="standings-loading">
                    <span className="loading-with-spinner">
                      <span className="loading-spinner" aria-hidden="true" />
                      <span>Loading...</span>
                    </span>
                  </div>
                ) : conferenceTournamentFixtures.length === 0 ? (
                  <div className="standings-loading">No tournament fixtures available yet.</div>
                ) : (
                  <>
                    {(conferenceTournamentExpanded ? conferenceTournamentFixtures : conferenceTournamentFixtures.slice(0, 5)).map((event) => (
                      <div key={event.id} className="ucl-tournament-card">
                        <div className="ucl-tournament-round">Knockout Round</div>
                        <div className="ucl-tournament-title">{event.title}</div>
                        <div className="ucl-tournament-meta">
                          <span>{format(parseISO(event.datetime_utc), 'MMM d, HH:mm')}</span>
                          <span>{event.venue}</span>
                        </div>
                      </div>
                    ))}
                    {conferenceTournamentFixtures.length > 5 && (
                      <div className="scores-view-more-row">
                        <button className="scores-expand-btn" onClick={() => setConferenceTournamentExpanded((v) => !v)}>
                          {conferenceTournamentExpanded ? 'View less' : 'View more'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {showMotorsport && (
          <div className="standings-section standings-f1">
            <div className="standings-header-row">
              <h2 className="standings-league-name">Formula 1</h2>
              <div className="ucl-phase-toggle">
                <button
                  className={`ucl-phase-btn ${f1Mode === 'driver' ? 'active' : ''}`}
                  onClick={() => setF1Mode('driver')}
                >
                  Driver
                </button>
                <button
                  className={`ucl-phase-btn ${f1Mode === 'constructor' ? 'active' : ''}`}
                  onClick={() => setF1Mode('constructor')}
                >
                  Constructor
                </button>
              </div>
            </div>

            <table className="standings-table">
              <thead>
                {f1Mode === 'driver' ? (
                  <tr>
                    <th className="standings-col-pos">#</th>
                    <th className="standings-col-team">{t('scores.driver')}</th>
                    <th className="standings-col-f1-team">{t('scores.team')}</th>
                    <th className="standings-col-pts">{t('scores.pts')}</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="standings-col-pos">#</th>
                    <th className="standings-col-team">{t('scores.team')}</th>
                    <th className="standings-col-pts">{t('scores.pts')}</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {(f1Mode === 'driver'
                  ? (f1Expanded ? f1Standings : f1Standings.slice(0, 5)).map((row, i) => (
                    <tr key={row.driver} className={i % 2 === 1 ? 'standings-row-alt' : ''}>
                      <td className="standings-col-pos">{i + 1}</td>
                      <td className="standings-col-team">{row.driver}</td>
                      <td className="standings-col-f1-team">{row.team}</td>
                      <td className="standings-col-pts">{row.pts}</td>
                    </tr>
                  ))
                  : (f1Expanded ? f1ConstructorStandings : f1ConstructorStandings.slice(0, 5)).map((row, i) => (
                    <tr key={row.team} className={i % 2 === 1 ? 'standings-row-alt' : ''}>
                      <td className="standings-col-pos">{i + 1}</td>
                      <td className="standings-col-team">{row.team}</td>
                      <td className="standings-col-pts">{row.pts}</td>
                    </tr>
                  )))}
              </tbody>
            </table>
            {((f1Mode === 'driver' ? f1Standings.length : f1ConstructorStandings.length) > 5) && (
              <div className="scores-view-more-row">
                <button className="scores-expand-btn" onClick={() => setF1Expanded((v) => !v)}>
                  {f1Expanded ? 'View less' : 'View more'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
