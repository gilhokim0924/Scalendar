import { supabase } from '../lib/supabase';

export async function fetchUserSelectedTeams(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_selected_teams')
    .select('team_id')
    .eq('user_id', userId);

  if (error) throw error;
  return (data ?? []).map((row) => row.team_id as string);
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
