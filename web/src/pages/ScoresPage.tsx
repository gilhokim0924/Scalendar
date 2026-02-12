import { useState } from 'react';
import { getTeamInitials } from '../utils/mockData';
import './ScoresPage.css';

type SportFilter = 'all' | 'football' | 'motorsport';
type LeagueFilter = 'all' | 'Premier League' | 'Champions League';

interface FootballStanding {
  team: string;
  w: number;
  d: number;
  l: number;
  pts: number;
}

interface F1Standing {
  driver: string;
  team: string;
  pts: number;
}

const premierLeague: FootballStanding[] = [
  { team: 'Liverpool', w: 21, d: 5, l: 4, pts: 68 },
  { team: 'Arsenal', w: 18, d: 7, l: 5, pts: 61 },
  { team: 'Man City', w: 16, d: 8, l: 6, pts: 56 },
  { team: 'Chelsea', w: 14, d: 8, l: 8, pts: 50 },
  { team: 'Aston Villa', w: 13, d: 8, l: 9, pts: 47 },
  { team: 'Newcastle', w: 12, d: 9, l: 9, pts: 45 },
  { team: 'Tottenham', w: 11, d: 8, l: 11, pts: 41 },
  { team: 'Brighton', w: 11, d: 8, l: 11, pts: 41 },
  { team: 'Man Utd', w: 10, d: 6, l: 14, pts: 36 },
  { team: 'West Ham', w: 9, d: 7, l: 14, pts: 34 },
];

const championsLeague: FootballStanding[] = [
  { team: 'Barcelona', w: 6, d: 1, l: 1, pts: 19 },
  { team: 'Inter Milan', w: 5, d: 2, l: 1, pts: 17 },
  { team: 'Bayern Munich', w: 5, d: 1, l: 2, pts: 16 },
  { team: 'PSG', w: 4, d: 2, l: 2, pts: 14 },
  { team: 'Juventus', w: 3, d: 3, l: 2, pts: 12 },
];

const f1Standings: F1Standing[] = [
  { driver: 'M. Verstappen', team: 'Red Bull', pts: 51 },
  { driver: 'C. Leclerc', team: 'Ferrari', pts: 42 },
  { driver: 'L. Norris', team: 'McLaren', pts: 38 },
  { driver: 'L. Hamilton', team: 'Mercedes', pts: 30 },
  { driver: 'F. Alonso', team: 'Aston Martin', pts: 22 },
];

export default function ScoresPage() {
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');
  const [leagueFilter, setLeagueFilter] = useState<LeagueFilter>('all');

  const handleSportFilter = (filter: SportFilter) => {
    setSportFilter(filter);
    setLeagueFilter('all');
  };

  const showFootball = sportFilter === 'all' || sportFilter === 'football';
  const showMotorsport = sportFilter === 'all' || sportFilter === 'motorsport';
  const showPremierLeague = showFootball && (leagueFilter === 'all' || leagueFilter === 'Premier League');
  const showChampionsLeague = showFootball && (leagueFilter === 'all' || leagueFilter === 'Champions League');

  return (
    <div className="scores-page">
      <div className="scores-sticky-header">
        <header className="scores-header">
          <h1 className="scores-title">Scores</h1>
        </header>

        <div className="scores-filters">
          <button
            className={`scores-filter-btn ${sportFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleSportFilter('all')}
          >
            All
          </button>
          <button
            className={`scores-filter-btn ${sportFilter === 'football' ? 'active' : ''}`}
            onClick={() => handleSportFilter('football')}
          >
            <span className="filter-icon">⚽</span>
            Football
          </button>
          <button
            className={`scores-filter-btn ${sportFilter === 'motorsport' ? 'active' : ''}`}
            onClick={() => handleSportFilter('motorsport')}
          >
            <span className="filter-icon">🏎️</span>
            Motorsport
          </button>
        </div>

        {sportFilter === 'football' && (
          <div className="scores-league-filters">
            <button
              className={`scores-filter-btn scores-league-btn ${leagueFilter === 'all' ? 'active' : ''}`}
              onClick={() => setLeagueFilter('all')}
            >
              All Leagues
            </button>
            <button
              className={`scores-filter-btn scores-league-btn ${leagueFilter === 'Premier League' ? 'active' : ''}`}
              onClick={() => setLeagueFilter('Premier League')}
            >
              Premier League
            </button>
            <button
              className={`scores-filter-btn scores-league-btn ${leagueFilter === 'Champions League' ? 'active' : ''}`}
              onClick={() => setLeagueFilter('Champions League')}
            >
              Champions League
            </button>
          </div>
        )}
      </div>

      <div className="scores-content">
        {showPremierLeague && (
          <div className="standings-section">
            <h2 className="standings-league-name">Premier League</h2>
            <div className="standings-table">
              <div className="standings-header-row">
                <span className="standings-col-pos">#</span>
                <span className="standings-col-team">Team</span>
                <span className="standings-col-stat">W</span>
                <span className="standings-col-stat">D</span>
                <span className="standings-col-stat">L</span>
                <span className="standings-col-pts">Pts</span>
              </div>
              {premierLeague.map((row, i) => (
                <div key={row.team} className={`standings-row ${i % 2 === 1 ? 'standings-row-alt' : ''}`}>
                  <span className="standings-col-pos">{i + 1}</span>
                  <span className="standings-col-team">
                    <span className="standings-team-badge">{getTeamInitials(row.team)}</span>
                    {row.team}
                  </span>
                  <span className="standings-col-stat">{row.w}</span>
                  <span className="standings-col-stat">{row.d}</span>
                  <span className="standings-col-stat">{row.l}</span>
                  <span className="standings-col-pts">{row.pts}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {showChampionsLeague && (
          <div className="standings-section">
            <h2 className="standings-league-name">Champions League</h2>
            <div className="standings-table">
              <div className="standings-header-row">
                <span className="standings-col-pos">#</span>
                <span className="standings-col-team">Team</span>
                <span className="standings-col-stat">W</span>
                <span className="standings-col-stat">D</span>
                <span className="standings-col-stat">L</span>
                <span className="standings-col-pts">Pts</span>
              </div>
              {championsLeague.map((row, i) => (
                <div key={row.team} className={`standings-row ${i % 2 === 1 ? 'standings-row-alt' : ''}`}>
                  <span className="standings-col-pos">{i + 1}</span>
                  <span className="standings-col-team">
                    <span className="standings-team-badge">{getTeamInitials(row.team)}</span>
                    {row.team}
                  </span>
                  <span className="standings-col-stat">{row.w}</span>
                  <span className="standings-col-stat">{row.d}</span>
                  <span className="standings-col-stat">{row.l}</span>
                  <span className="standings-col-pts">{row.pts}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {showMotorsport && (
          <div className="standings-section">
            <h2 className="standings-league-name">F1 Driver Standings</h2>
            <div className="standings-table">
              <div className="standings-header-row">
                <span className="standings-col-pos">#</span>
                <span className="standings-col-team">Driver</span>
                <span className="standings-col-f1-team">Team</span>
                <span className="standings-col-pts">Pts</span>
              </div>
              {f1Standings.map((row, i) => (
                <div key={row.driver} className={`standings-row ${i % 2 === 1 ? 'standings-row-alt' : ''}`}>
                  <span className="standings-col-pos">{i + 1}</span>
                  <span className="standings-col-team">{row.driver}</span>
                  <span className="standings-col-f1-team">{row.team}</span>
                  <span className="standings-col-pts">{row.pts}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
