import { useState, useEffect } from 'react';
import { mockTeams, getTeamInitials } from '../utils/mockData';
import { useNavigate } from 'react-router-dom';
import './TeamsPage.css';

type SportFilter = 'all' | '1' | '2';

export default function TeamsPage() {
  const navigate = useNavigate();
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');

  useEffect(() => {
    const saved = localStorage.getItem('selectedTeams');
    if (saved) {
      setSelectedTeams(JSON.parse(saved));
    }
  }, []);

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

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredTeams = filteredTeams.filter(t => t.name.toLowerCase().includes(q));
  }

  const selectedTeamObjects = mockTeams.filter(t => selectedTeams.includes(t.id));

  return (
    <div className="teams-page">
      <header className="teams-header">
        <h1 className="teams-title">Teams</h1>
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
            placeholder="Search teams..."
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
          onClick={() => setSportFilter('all')}
        >
          All
        </button>
        <button
          className={`teams-filter-btn ${sportFilter === '1' ? 'active' : ''}`}
          onClick={() => setSportFilter('1')}
        >
          <span className="filter-icon">⚽</span>
          Football
        </button>
        <button
          className={`teams-filter-btn ${sportFilter === '2' ? 'active' : ''}`}
          onClick={() => setSportFilter('2')}
        >
          <span className="filter-icon">🏎️</span>
          Motorsport
        </button>
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
          <div className="teams-empty">No teams found</div>
        )}
      </div>

      {/* Selected Teams Bar */}
      {selectedTeamObjects.length > 0 && (
        <div className="teams-selected-bar">
          <div className="teams-selected-avatars">
            {selectedTeamObjects.slice(0, 6).map(team => (
              <div key={team.id} className="teams-selected-avatar">{getTeamInitials(team.name)}</div>
            ))}
            {selectedTeamObjects.length > 6 && (
              <div className="teams-selected-more">+{selectedTeamObjects.length - 6}</div>
            )}
          </div>
          <div className="teams-selected-actions">
            <button className="teams-clear-btn" onClick={clearAllTeams}>Clear All</button>
            <button className="teams-done-btn" onClick={handleDone}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
