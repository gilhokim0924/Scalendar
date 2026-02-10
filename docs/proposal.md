# Scalendar - Sports Calendar App

**Portfolio Project Goal:** Cross-platform sports calendar (Web + Mobile) aggregating Premier League and Formula 1 schedules.

## Constraints
* **MVP Scope:** Manual team selection only (Premier League + F1)
* **Data Sources:** TheSportsDB + OpenF1 APIs (free, attribution-friendly)
* **Cost:** Free tier only (Supabase, hosting)
* **Legal:** No official logos/copyrighted assets

## Tech Stack
* **Mobile:** React Native (Expo) + TypeScript
* **Web:** React (Vite) + TypeScript
* **Backend:** Supabase (PostgreSQL + Auth)
* **State:** React Query
* **Version Control:** GitHub

---

## Git/GitHub Strategy (Portfolio Best Practices)

**Commit Frequently:** Small, atomic commits showing development process (15-30 commits/week)

**Conventional Commits Format:**
```
feat: add user authentication screen
fix: resolve timezone conversion bug
chore: setup Supabase project configuration
refactor: extract API calls into service layer
docs: add README with setup instructions
test: add unit tests for calendar component
style: update calendar UI spacing
perf: optimize event query performance
```

**Branching Strategy:**
```
main (protected - stable, working code only)
  ├── feature/auth-setup
  ├── feature/calendar-view
  ├── feature/team-selection
  ├── feature/api-integration
  └── fix/[bug-name]
```

**Merge Strategy:**
- Develop on feature branches
- Merge to main when feature is complete and tested
- Can use PRs (even solo) to show review process
- Keep main always deployable

**Semantic Versioning (Tags):**
```
v0.1.0 - Week 2: Foundation (Supabase + API validation)
v0.2.0 - Week 4: Core Features (Auth + Calendar + Teams)
v0.3.0 - Week 6: Integration (API sync + Polish)
v1.0.0 - Week 7: MVP Launch (Public release)
v1.1.0 - Post-MVP: Add dark mode
v2.0.0 - Phase 2: AI natural language setup
```

**Commit Guidelines:**
- ✅ Commit after each logical unit of work
- ✅ Write clear, descriptive messages (present tense: "add" not "added")
- ✅ Reference issues/tasks if using GitHub Issues
- ✅ Push regularly (shows consistent work)
- ❌ No "WIP", "update files", or vague messages
- ❌ Don't commit broken code to main
- ❌ Avoid giant commits (>20 files changed)

**Example Commit Timeline (Week 1):**
```bash
git commit -m "chore: initialize expo project with typescript"
git commit -m "chore: initialize vite project with react and typescript"
git commit -m "chore: setup project folder structure"
git commit -m "feat: configure supabase client"
git commit -m "chore: create database schema migration"
git commit -m "test: verify TheSportsDB API endpoints"
git commit -m "test: verify OpenF1 API endpoints"
git commit -m "docs: add API integration notes"
git commit -m "chore: setup environment variables"
# Tag milestone
git tag -a v0.1.0 -m "Foundation complete"
```

---

## MVP Features

**Core (Must-Have):**
1. Email/password authentication (Supabase Auth)
2. Team/driver selection UI (Premier League + F1)
3. Calendar view (monthly/weekly) with upcoming events
4. Event details modal (time, location, opponent/circuit)
5. Sport filtering toggle
6. Automatic timezone conversion

**Optional:**
* Calendar export (Google/Apple)
* Push notifications
* Dark mode

**Out of Scope:**
* Past results/stats, live scores, social features

---

## Database Schema

```sql
users: id, email, timezone, created_at
sports: id, name, icon_url
teams: id, sport_id, name, logo_url, external_api_id
events: id, sport_id, home_team_id, away_team_id, title, datetime_utc, venue, competition, external_event_id
user_subscriptions: user_id, team_id, created_at
```

---

## APIs & Data Sync

**TheSportsDB (Premier League):**
* `/search_all_teams.php?l=English%20Premier%20League` → Teams
* `/eventsnextleague.php?id=4328` → Upcoming fixtures
* Sync: Daily (next 30 days)

**OpenF1 (Formula 1):**
* `/v1/sessions` → Race schedule
* `/v1/drivers` → Driver list
* Sync: Weekly (season) / Monthly (off-season)

**Strategy:** Daily background job caches API data in Supabase → Users query DB (not external APIs)

---

## App Screens

1. **Auth/Onboarding** → Login + Team selection wizard
2. **Calendar (Home)** → Monthly/weekly view of subscribed events
3. **Event Details** → Modal with full event info
4. **Settings** → Manage subscriptions, timezone, logout

**Navigation:** Bottom tabs (mobile) | Sidebar (web)

---

## Development Plan (7 Weeks)

**Weeks 1-2: Foundation**
- Init projects (Expo + Vite)
- Setup Supabase (DB schema + RLS + Auth)
- Test external APIs

**Weeks 3-4: Core Features**
- Auth + onboarding screens
- Team selection UI
- Calendar view + event details
- User subscription logic

**Weeks 5-6: Integration & Polish**
- API sync jobs + React Query
- Filtering, timezone, error handling
- Responsive design

**Week 7: Launch**
- Testing (iOS/Android/Web)
- Deploy web (Vercel/Netlify)
- Mobile TestFlight prep

---

## Success Criteria

**Technical:**
* Working cross-platform app (React + React Native + TypeScript)
* Clean API integration with caching
* Responsive UI

**Portfolio:**
* Live web demo + mobile video
* README with architecture docs
* Usable by real users (friends/family)

---

## Risks & Mitigation

| Risk | Solution |
|------|----------|
| API changes | Abstract into service layer |
| Free tier limits | Aggressive caching, monitor usage |
| Copyright issues | Text-only team names, generic icons |
| Timezone bugs | Store UTC, convert on display |
| App store rejection | Start with web, TestFlight for mobile |


