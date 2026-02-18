import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

const PROFILE_CACHE_PREFIX = 'scalendar:profile:';
const AVATAR_BUCKET = 'avatars';

function getProfileCacheKey(userId: string) {
  return `${PROFILE_CACHE_PREFIX}${userId}`;
}

export function readCachedUserProfile(userId: string): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(getProfileCacheKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserProfile;
    if (!parsed || parsed.id !== userId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function cacheUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(getProfileCacheKey(profile.id), JSON.stringify(profile));
  } catch {
    // Ignore storage failures.
  }
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  const profile = (data as UserProfile | null) ?? null;
  if (profile) {
    cacheUserProfile(profile);
  }
  return profile;
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
  cacheUserProfile({
    id: profile.id,
    display_name: profile.display_name,
    avatar_url: profile.avatar_url,
  });
}

export async function uploadUserAvatar(userId: string, file: File): Promise<string> {
  const rawExt = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const ext = /^[a-z0-9]+$/.test(rawExt) ? rawExt : 'jpg';
  const filePath = `${userId}/avatar-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

function getAvatarPathFromPublicUrl(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl);
    const marker = `/storage/v1/object/public/${AVATAR_BUCKET}/`;
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex < 0) return null;
    return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
}

export async function removeUserAvatarByPublicUrl(publicUrl: string | null | undefined): Promise<void> {
  if (!publicUrl) return;
  const path = getAvatarPathFromPublicUrl(publicUrl);
  if (!path) return;

  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .remove([path]);

  if (error) throw error;
}
