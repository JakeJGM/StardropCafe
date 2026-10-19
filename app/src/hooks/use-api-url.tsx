import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, type ReactNode, use, useEffect, useState } from 'react';

import { setApiBaseUrl } from '@/api/api';

const STORAGE_KEY = 'apiUrl';

type ApiUrlState = {
  // Still reading from storage.
  isLoading: boolean;
  // Null until the user has entered one.
  apiUrl: string | null;
  saveApiUrl: (url: string) => Promise<void>;
};

const ApiUrlContext = createContext<ApiUrlState | null>(null);

// Must be rendered inside a QueryClientProvider.
export function ApiUrlProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const [apiUrl, setApiUrl] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((storedUrl) => {
        if (storedUrl !== null) {
          setApiBaseUrl(storedUrl);
          setApiUrl(storedUrl);
        }
      })
      // An unreadable value is treated as unset, so the user is asked again.
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const saveApiUrl = async (url: string) => {
    await AsyncStorage.setItem(STORAGE_KEY, url);
    // Set before state, so screens that mount on the change request the new URL.
    setApiBaseUrl(url);
    // Cached responses came from the previous server. Resetting drops them and
    // refetches the queries still on screen from the new one.
    queryClient.resetQueries();
    setApiUrl(url);
  };

  return <ApiUrlContext value={{ isLoading, apiUrl, saveApiUrl }}>{children}</ApiUrlContext>;
}

export function useApiUrl() {
  const state = use(ApiUrlContext);
  if (state === null) {
    throw new Error('useApiUrl must be used within an ApiUrlProvider');
  }
  return state;
}

// Accepts what a user is likely to type, like `192.168.1.10:8080/`, and returns
// a base URL axios can use, or null if it can't be one.
export function normalizeApiUrl(input: string): string | null {
  let url = input.trim().replace(/\/+$/, '');
  if (!/^[a-z][a-z\d+.-]*:\/\//i.test(url)) {
    url = `http://${url}`;
  }
  return /^https?:\/\/[^\s/?#]+[^\s]*$/i.test(url) ? url : null;
}
