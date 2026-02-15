import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return (data as UserProfile | null) ?? null;
}

export async function upsertUserProfile(profile: {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .upsert([profile], { onConflict: 'id' });

  if (error) throw error;
}
