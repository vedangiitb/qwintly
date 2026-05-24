"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getPreferences,
  toggleByokEnabled,
  updatePreferredModel,
  updatePreferredProvider,
  UserPreferences,
} from "@/features/auth/ui/api/preferences.api";

export function usePreferences(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;

  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPreferences = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPreferences();
      setPreferences(data ?? null);
      return data ?? null;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load preferences";
      setError(message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void loadPreferences();
  }, [enabled, loadPreferences]);

  const saveProvider = useCallback(async (provider: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await updatePreferredProvider({ provider });
      setPreferences(updated ?? null);
      return updated ?? null;
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to update preferred provider";
      setError(message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveModel = useCallback(async (model: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await updatePreferredModel({ model });
      setPreferences(updated ?? null);
      return updated ?? null;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to update preferred model";
      setError(message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectedProvider = preferences?.pref_provider ?? null;
  const selectedModel = preferences?.pref_model ?? null;
  const byokEnabled = preferences?.byok_enabled ?? false;

  const saveByokEnabled = useCallback(async (byokEnabled: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await toggleByokEnabled({ byokEnabled });
      setPreferences(updated ?? null);
      return updated ?? null;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to update BYOK";
      setError(message);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return useMemo(
    () => ({
      preferences,
      selectedProvider,
      selectedModel,
      byokEnabled,
      isLoading,
      error,
      loadPreferences,
      saveProvider,
      saveModel,
      saveByokEnabled,
      setPreferences,
    }),
    [
      preferences,
      selectedProvider,
      selectedModel,
      byokEnabled,
      isLoading,
      error,
      loadPreferences,
      saveProvider,
      saveModel,
      saveByokEnabled,
    ],
  );
}
