import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { mockTeams, getTeamInitials } from '../utils/mockData';
import { useNavigate } from 'react-router-dom';
import './TeamsPage.css';

type SportFilter = 'all' | '1' | '2';
type LeagueFilter = 'all' | 'Premier League' | 'Champions League';

export default function TeamsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');
  const [leagueFilter, setLeagueFilter] = useState<LeagueFilter>('all');

  useEffect(() => {
    const saved = localStorage.getItem('selectedTeams');
    if (saved) {
      setSelectedTeams(JSON.parse(saved));
    }
  }, []);

  const handleSportFilter = (filter: SportFilter) => {
    setSportFilter(filter);
    setLeagueFilter('all');
  };

  const toggleTeam = (teamId: string) => {
    const newSelection = selectedTeams.includes(teamId)
      ? selectedTeams.filter(id => id !== teamId)
      : [...selectedTeams, teamId];

    setSelectedTeams(newSelection);
    localStorage.setItem('selectedTeams', JSON.stringify(newSelection));
  };

  const handleDone = () => {
    navigate('/');
  };

  const clearAllTeams = () => {
    setSelectedTeams([]);
    localStorage.removeItem('selectedTeams');
  };

  let filteredTeams = mockTeams;

  if (sportFilter !== 'all') {
    filteredTeams = filteredTeams.filter(t => t.sport_id === sportFilter);
  }

  if (sportFilter === '1' && leagueFilter !== 'all') {
    filteredTeams = filteredTeams.filter(t => t.league === leagueFilter);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredTeams = filteredTeams.filter(t => t.name.toLowerCase().includes(q));
  }

  const selectedTeamObjects = mockTeams.filter(t => selectedTeams.includes(t.id));

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
            <button
              className={`teams-filter-btn teams-league-btn ${leagueFilter === 'all' ? 'active' : ''}`}
              onClick={() => setLeagueFilter('all')}
            >
              {t('filters.allLeagues')}
            </button>
            <button
              className={`teams-filter-btn teams-league-btn ${leagueFilter === 'Premier League' ? 'active' : ''}`}
              onClick={() => setLeagueFilter('Premier League')}
            >
              {t('filters.premierLeague')}
            </button>
            <button
              className={`teams-filter-btn teams-league-btn ${leagueFilter === 'Champions League' ? 'active' : ''}`}
              onClick={() => setLeagueFilter('Champions League')}
            >
              {t('filters.championsLeague')}
            </button>
          </div>
        )}
      </div>

      {/* Team List */}
      <div className="teams-list">
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
      </div>

      {/* Selected Teams Bar */}
      <div className="teams-selected-bar">
        <div className="teams-selected-bar-inner">
          <div className="teams-selected-avatars">
            {selectedTeamObjects.slice(0, 6).map(team => (
              <div key={team.id} className="teams-selected-avatar">{getTeamInitials(team.name)}</div>
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
