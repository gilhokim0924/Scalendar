import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';

const PREFERENCES_EVENT = 'scalendar:preferences-updated';
const USE_24_HOUR_KEY = 'use24HourTime';
const HIDE_SCORES_KEY = 'hideScores';

interface UserPreferences {
  use24HourTime: boolean;
  hideScores: boolean;
}

function readBooleanPreference(key: string, fallback = false): boolean {
  if (typeof window === 'undefined') return fallback;
  const value = window.localStorage.getItem(key);
  if (value == null) return fallback;
  return value === 'true';
}

function readPreferences(): UserPreferences {
  return {
    use24HourTime: readBooleanPreference(USE_24_HOUR_KEY, false),
    hideScores: readBooleanPreference(HIDE_SCORES_KEY, false),
  };
}

function notifyPreferencesUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(PREFERENCES_EVENT));
}

export function formatPreferenceTime(date: Date, use24HourTime: boolean): string {
  return format(date, use24HourTime ? 'HH:mm' : 'h:mm a');
}

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(() => readPreferences());

  useEffect(() => {
    const refreshPreferences = () => setPreferences(readPreferences());
    window.addEventListener('storage', refreshPreferences);
    window.addEventListener(PREFERENCES_EVENT, refreshPreferences);
    return () => {
      window.removeEventListener('storage', refreshPreferences);
      window.removeEventListener(PREFERENCES_EVENT, refreshPreferences);
    };
  }, []);

  const setUse24HourTime = useCallback((next: boolean) => {
    window.localStorage.setItem(USE_24_HOUR_KEY, String(next));
    notifyPreferencesUpdated();
  }, []);

  const setHideScores = useCallback((next: boolean) => {
    window.localStorage.setItem(HIDE_SCORES_KEY, String(next));
    notifyPreferencesUpdated();
  }, []);

  return {
    use24HourTime: preferences.use24HourTime,
    hideScores: preferences.hideScores,
    setUse24HourTime,
    setHideScores,
  };
}
