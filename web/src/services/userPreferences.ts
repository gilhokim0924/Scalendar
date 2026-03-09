import { supabase } from '../lib/supabase';

export const SELECTED_TEAMS_EVENT = 'scalendar:selected-teams-updated';
const F1_SELECTION_ID = 'f1';
const LEGACY_F1_SELECTION_IDS = new Set(['11', '12', '13', '14', '15']);

export function normalizeSelectedTeamIds(teamIds: string[]): string[] {
  return Array.from(new Set(teamIds.map((id) => (
    LEGACY_F1_SELECTION_IDS.has(id) ? F1_SELECTION_ID : id
  ))));
}

export function readStoredSelectedTeams(): string[] {
  if (typeof window === 'undefined') return [];
  const saved = window.localStorage.getItem('selectedTeams');
  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved) as string[];
    const normalized = normalizeSelectedTeamIds(parsed);
    if (normalized.join(',') !== parsed.join(',')) {
      window.localStorage.setItem('selectedTeams', JSON.stringify(normalized));
    }
    return normalized;
  } catch {
    return [];
  }
}

export function writeStoredSelectedTeams(teamIds: string[]): void {
  if (typeof window === 'undefined') return;
  const normalized = normalizeSelectedTeamIds(teamIds);
  window.localStorage.setItem('selectedTeams', JSON.stringify(normalized));
  window.dispatchEvent(new Event(SELECTED_TEAMS_EVENT));
}

export function clearStoredSelectedTeams(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('selectedTeams');
  window.dispatchEvent(new Event(SELECTED_TEAMS_EVENT));
}

export async function fetchUserSelectedTeams(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_selected_teams')
    .select('team_id')
    .eq('user_id', userId);

  if (error) throw error;
  return normalizeSelectedTeamIds((data ?? []).map((row) => row.team_id as string));
}

export async function addUserSelectedTeam(userId: string, teamId: string): Promise<void> {
  const { error } = await supabase
    .from('user_selected_teams')
    .upsert(
      [{ user_id: userId, team_id: teamId }],
      { onConflict: 'user_id,team_id' },
    );

  if (error) throw error;
}

export async function removeUserSelectedTeam(userId: string, teamId: string): Promise<void> {
  const { error } = await supabase
    .from('user_selected_teams')
    .delete()
    .eq('user_id', userId)
    .eq('team_id', teamId);

  if (error) throw error;
}

export async function clearUserSelectedTeams(userId: string): Promise<void> {
  const { error } = await supabase
    .from('user_selected_teams')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
}

export async function fetchSelectedTeamNames(teamIds: string[]): Promise<Record<string, string>> {
  const ids = Array.from(new Set(teamIds.filter(Boolean)));
  if (ids.length === 0) return {};

  const result: Record<string, string> = {};
  if (ids.includes('f1')) {
    result.f1 = 'Formula 1';
  }

  const dbIds = ids.filter((id) => id !== 'f1');
  if (dbIds.length === 0) return result;

  const { data, error } = await supabase
    .from('teams')
    .select('id, name')
    .in('id', dbIds);

  if (error) throw error;

  for (const row of data ?? []) {
    const id = row.id as string;
    if (!result[id]) {
      result[id] = row.name as string;
    }
  }

  return result;
}
