"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/ui/hooks/useAuth";
import { ByokProvider, UserApiKeyDetails } from "@/features/byok/ui/api/byok.api";
import KeyFormDialog from "@/features/byok/ui/components/KeyFormDialog";
import ProviderKeyCard from "@/features/byok/ui/components/ProviderKeyCard";
import { useByok } from "@/features/byok/ui/hooks/useByok";
import { cn } from "@/lib/utils";
import { KeyRound, LockKeyhole, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const providerConfig: Array<{
  id: ByokProvider;
  description: string;
  accentClassName: string;
}> = [
  {
    id: "gemini",
    description: "Use your Gemini key for models powered through Google.",
    accentClassName:
      "bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.22),_transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.88),rgba(255,247,237,0.75))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.2),_transparent_35%),linear-gradient(135deg,rgba(28,25,23,0.92),rgba(41,37,36,0.82))]",
  },
  {
    id: "openai",
    description: "Connect your OpenAI key for completions and future provider routing.",
    accentClassName:
      "bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.18),_transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.88),rgba(240,253,250,0.78))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.18),_transparent_35%),linear-gradient(135deg,rgba(28,25,23,0.92),rgba(17,24,39,0.82))]",
  },
];

function getLatestKey(keys: UserApiKeyDetails[], provider: ByokProvider) {
  return keys.find((item) => item.provider?.toLowerCase() === provider);
}

function getProviderKeys(keys: UserApiKeyDetails[], provider: ByokProvider) {
  return keys.filter((item) => item.provider?.toLowerCase() === provider);
}

export default function ByokPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { keys, isLoading, isSubmitting, deletingProvider, loadKeys, submitKey, removeKey } =
    useByok();

  const [dialogState, setDialogState] = useState<{
    open: boolean;
    provider: ByokProvider;
    mode: "create" | "update";
    keyId?: string;
  }>({
    open: false,
    provider: "gemini",
    mode: "create",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, router, user]);

  const openDialog = (
    provider: ByokProvider,
    mode: "create" | "update",
    keyId?: string,
  ) => {
    setDialogState({
      open: true,
      provider,
      mode,
      keyId,
    });
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto bg-[linear-gradient(180deg,#f7f3ea_0%,#f2efe6_55%,#ece8df_100%)] px-4 py-10 dark:bg-[linear-gradient(180deg,#111111_0%,#171717_55%,#1c1917_100%)]">
        <div className="mx-auto max-w-6xl animate-pulse space-y-6">
          <div className="h-48 rounded-4xl bg-white/70 dark:bg-stone-900/70" />
          <div className="h-56 rounded-4xl bg-white/70 dark:bg-stone-900/70" />
          <div className="h-56 rounded-4xl bg-white/70 dark:bg-stone-900/70" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-[linear-gradient(180deg,#f7f3ea_0%,#f2efe6_55%,#ece8df_100%)] px-4 py-8 text-stone-900 dark:bg-[linear-gradient(180deg,#111111_0%,#171717_55%,#1c1917_100%)] dark:text-stone-100">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[2.25rem] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.88),rgba(255,250,245,0.7))] p-6 shadow-[0_24px_80px_rgba(28,25,23,0.12)] backdrop-blur-xl sm:p-8 dark:border-stone-800/80 dark:bg-[linear-gradient(145deg,rgba(28,25,23,0.88),rgba(17,17,17,0.84))]">
          <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.2),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.12),transparent_55%)]" />

          <div className="relative space-y-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-stone-300/80 bg-white/70 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-stone-700 dark:border-stone-700 dark:bg-stone-900/70 dark:text-stone-300">
                  <LockKeyhole className="size-3.5" />
                  Bring your own key
                </div>
                <div className="space-y-3">
                  <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
                    Secure provider keys with a clean control panel
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-stone-600 dark:text-stone-300">
                    Manage your Gemini and OpenAI credentials from one place. Keys
                    are encrypted through KMS before they are stored, and this page
                    only exposes metadata such as creation time and version.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={loadKeys}
                  disabled={isLoading}
                  className="h-11 rounded-2xl border-stone-300 bg-white/70 px-5 hover:bg-white dark:border-stone-700 dark:bg-stone-900/70 dark:hover:bg-stone-900"
                >
                  <RefreshCcw className={cn("size-4", isLoading && "animate-spin")} />
                  Refresh
                </Button>
                <Button
                  onClick={() => openDialog("gemini", "create")}
                  className="h-11 rounded-2xl bg-stone-900 px-5 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
                >
                  <KeyRound className="size-4" />
                  Add Gemini key
                </Button>
              </div>
            </div>

            <div className="grid gap-4 rounded-4xl border border-stone-200/80 bg-white/45 p-4 backdrop-blur-sm sm:grid-cols-3 dark:border-stone-800/70 dark:bg-stone-950/30">
              <div className="rounded-2xl border border-white/80 bg-white/65 p-4 dark:border-stone-800 dark:bg-stone-900/70">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                  Providers
                </p>
                <p className="mt-2 text-2xl font-semibold">2 enabled</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/65 p-4 dark:border-stone-800 dark:bg-stone-900/70">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                  Stored keys
                </p>
                <p className="mt-2 text-2xl font-semibold">{keys.length}</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/65 p-4 dark:border-stone-800 dark:bg-stone-900/70">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                  Security
                </p>
                <p className="mt-2 text-2xl font-semibold">KMS encrypted</p>
              </div>
            </div>

            <div className="space-y-5">
              {providerConfig.map((provider) => {
                const providerKeys = getProviderKeys(keys, provider.id);
                const latestKey = getLatestKey(keys, provider.id);

                return (
                  <ProviderKeyCard
                    key={provider.id}
                    provider={provider.id}
                    description={provider.description}
                    accentClassName={provider.accentClassName}
                    keyDetails={latestKey}
                    totalKeys={providerKeys.length}
                    isLoading={isLoading}
                    isDeleting={deletingProvider === provider.id}
                    onCreate={() => openDialog(provider.id, "create")}
                    onUpdate={() =>
                      latestKey && openDialog(provider.id, "update", latestKey.id)
                    }
                    onDelete={() =>
                      latestKey && removeKey(latestKey.id, provider.id)
                    }
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <KeyFormDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState((current) => ({ ...current, open }))}
        provider={dialogState.provider}
        mode={dialogState.mode}
        isSubmitting={isSubmitting}
        onSubmit={async (apiKey) => {
          await submitKey({
            provider: dialogState.provider,
            apiKey,
            keyId: dialogState.keyId,
          });
        }}
      />
    </div>
  );
}
