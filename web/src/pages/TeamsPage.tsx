import { useState, useEffect } from 'react';
import { mockSports, mockTeams } from '../utils/mockData';
import Navigation from '../components/Navigation';
import './TeamsPage.css';

export default function TeamsPage() {
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  useEffect(() => {
    // Load saved teams from localStorage
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

  const teamsBySport = mockSports.map(sport => ({
    sport,
    teams: mockTeams.filter(team => team.sport_id === sport.id)
  }));

  return (
    <div className="teams-page">
      <header className="page-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="page-title">My Teams</h1>
            <p className="page-subtitle">
              {selectedTeams.length === 0
                ? 'Select teams to follow and see their events on your calendar'
                : `Following ${selectedTeams.length} ${selectedTeams.length === 1 ? 'team' : 'teams'}`
              }
            </p>
          </div>
          <Navigation />
        </div>
      </header>

      <main className="page-content">
        {teamsBySport.map(({ sport, teams }) => (
          <section key={sport.id} className="sport-section">
            <h2 className="sport-title">{sport.name}</h2>
            <div className="teams-grid">
              {teams.map(team => {
                const isSelected = selectedTeams.includes(team.id);
                return (
                  <button
                    key={team.id}
                    onClick={() => toggleTeam(team.id)}
                    className={`team-card ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="team-check">
                      {isSelected && (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M13.3332 4L5.99984 11.3333L2.6665 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <div className="team-info">
                      <h3 className="team-name">{team.name}</h3>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
