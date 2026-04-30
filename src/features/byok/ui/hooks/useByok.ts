"use client";

import {
  ByokProvider,
  createProviderKey,
  deleteProviderKey,
  fetchKeyDetails,
  updateProviderKey,
  UserApiKeyDetails,
} from "@/features/byok/ui/api/byok.api";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type SubmitKeyInput = {
  provider: ByokProvider;
  apiKey: string;
  keyId?: string;
};

export function useByok() {
  const [keys, setKeys] = useState<UserApiKeyDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingProvider, setDeletingProvider] = useState<string | null>(null);

  const loadKeys = async () => {
    setIsLoading(true);
    try {
      const data = await fetchKeyDetails();
      setKeys(data);
    } catch (error) {
      console.error("Failed to load BYOK details", error);
      toast.error("Could not load your API keys.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const submitKey = async ({ provider, apiKey, keyId }: SubmitKeyInput) => {
    setIsSubmitting(true);
    try {
      if (keyId) {
        await updateProviderKey({ keyId, apiKey });
        toast.success(`Updated ${provider} key`);
      } else {
        await createProviderKey({ provider, apiKey });
        toast.success(`Saved ${provider} key`);
      }

      await loadKeys();
    } catch (error) {
      console.error("Failed to save BYOK key", error);
      toast.error(`Could not save ${provider} key.`);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeKey = async (keyId: string, provider: string) => {
    setDeletingProvider(provider);
    try {
      await deleteProviderKey({ keyId });
      setKeys((current) => current.filter((item) => item.id !== keyId));
      toast.success(`Deleted ${provider} key`);
    } catch (error) {
      console.error("Failed to delete BYOK key", error);
      toast.error(`Could not delete ${provider} key.`);
    } finally {
      setDeletingProvider(null);
    }
  };

  return {
    keys,
    isLoading,
    isSubmitting,
    deletingProvider,
    loadKeys,
    submitKey,
    removeKey,
  };
}
