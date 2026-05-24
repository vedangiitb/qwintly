"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { AI_MODELS, DEFAULT_MODEL, DEFAULT_PROVIDER } from "@/features/ai/core/modelInfo";
import { useAuth } from "@/features/auth/ui/hooks/useAuth";
import { usePreferences } from "@/features/auth/ui/hooks/usePreferences";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  KeyRound,
  LogOut,
  MailCheck,
  MailWarning,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  type DailyMessagesResponse,
  fetchDailyMessages,
} from "@/features/auth/ui/services/accountMetrics.service";
import { getLocalTimeStringForNextUTCMidnight } from "@/features/auth/ui/helpers/dailyUsage.helpers";

function resolveModelGroup(provider: string) {
  if (provider === "openai") return AI_MODELS.OPENAI;
  return AI_MODELS.GEMINI;
}

export default function Account() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [dailyMessages, setDailyMessages] =
    useState<DailyMessagesResponse | null>(null);
  const [dailyMessagesLoading, setDailyMessagesLoading] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  const {
    preferences,
    isLoading: preferencesLoading,
    error: preferencesError,
    selectedProvider,
    selectedModel,
    byokEnabled,
    saveProvider,
    saveModel,
    saveByokEnabled,
  } = usePreferences({ enabled: !loading && Boolean(user) });

  const [prefsInitialized, setPrefsInitialized] = useState(false);
  const [draftProvider, setDraftProvider] = useState<string>("");
  const [draftModel, setDraftModel] = useState<string>("");
  const [draftByokEnabled, setDraftByokEnabled] = useState(false);

  const effectiveProvider =
    draftProvider || selectedProvider || preferences?.pref_provider || DEFAULT_PROVIDER;

  const modelOptions = (() => {
    const group = resolveModelGroup(effectiveProvider);
    const values = Object.values(group);
    const unique = Array.from(new Set(values));
    return unique.map((model) => ({ id: model, label: model }));
  })();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (prefsInitialized) return;
    if (!preferences) return;

    const provider = preferences.pref_provider ?? DEFAULT_PROVIDER;
    const group = resolveModelGroup(provider);
    const allowedModels = new Set<string>(Object.values(group) as string[]);

    const modelCandidate = preferences.pref_model ?? DEFAULT_MODEL;
    const resolvedModel = allowedModels.has(modelCandidate)
      ? modelCandidate
      : group.DEFAULT;

    setDraftProvider(provider);
    setDraftModel(resolvedModel);
    setDraftByokEnabled(preferences.byok_enabled ?? false);
    setPrefsInitialized(true);
  }, [preferences, prefsInitialized]);

  useEffect(() => {
    if (!draftProvider) return;

    const group = resolveModelGroup(draftProvider);
    const allowedModels = new Set<string>(Object.values(group) as string[]);

    if (draftModel && allowedModels.has(draftModel)) return;
    setDraftModel(group.DEFAULT);
  }, [draftModel, draftProvider]);

  const handleSavePreferences = async () => {
    try {
      setIsSavingPreferences(true);
      const updates: Promise<unknown>[] = [];

      if (draftProvider && draftProvider !== selectedProvider) {
        updates.push(saveProvider(draftProvider));
      }

      if (draftModel && draftModel !== selectedModel) {
        updates.push(saveModel(draftModel));
      }

      if (draftByokEnabled !== byokEnabled) {
        updates.push(saveByokEnabled(draftByokEnabled));
      }

      if (updates.length === 0) {
        toast("No changes to save");
        return;
      }

      await Promise.all(updates);
      toast.success("Preferences updated");
    } catch (e) {
      console.error("Failed to save preferences", e);
      toast.error(e instanceof Error ? e.message : "Failed to update preferences");
    } finally {
      setIsSavingPreferences(false);
    }
  };

  useEffect(() => {
    async function loadDailyMessages() {
      if (loading || !user) return;

      setDailyMessagesLoading(true);
      try {
        const data = await fetchDailyMessages();
        setDailyMessages(data);
      } catch {
        setDailyMessages(null);
      } finally {
        setDailyMessagesLoading(false);
      }
    }

    loadDailyMessages();
  }, [loading, user?.id]);

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

  const displayName =
    user.displayName || user.email?.split("@")[0] || "Account";
  const email = user.email || "";
  const initials = (displayName?.charAt(0) || "A").toUpperCase();
  const shortId = user.id ? `${user.id.slice(0, 8)}…` : "";

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-[linear-gradient(180deg,#f7f3ea_0%,#f2efe6_55%,#ece8df_100%)] px-4 py-8 text-stone-900 dark:bg-[linear-gradient(180deg,#111111_0%,#171717_55%,#1c1917_100%)] dark:text-stone-100">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[2.25rem] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.88),rgba(255,250,245,0.7))] p-6 shadow-[0_24px_80px_rgba(28,25,23,0.12)] backdrop-blur-xl sm:p-8 dark:border-stone-800/80 dark:bg-[linear-gradient(145deg,rgba(28,25,23,0.88),rgba(17,17,17,0.84))]">
          <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.18),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.12),transparent_55%)]" />

          <div className="relative space-y-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <Avatar className="size-16 ring-4 ring-emerald-200/60 ring-offset-2 ring-offset-white dark:ring-emerald-900/60 dark:ring-offset-stone-950">
                  <AvatarFallback className="bg-emerald-600 text-white text-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-semibold tracking-tight">
                      {displayName}
                    </h1>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
                        user.emailVerified
                          ? "border-emerald-300/70 bg-emerald-100/70 text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-900/30 dark:text-emerald-200"
                          : "border-rose-300/70 bg-rose-100/70 text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-200",
                      )}
                    >
                      {user.emailVerified ? (
                        <MailCheck className="size-3.5" />
                      ) : (
                        <MailWarning className="size-3.5" />
                      )}
                      {user.emailVerified
                        ? "Email verified"
                        : "Email unverified"}
                    </span>
                  </div>
                  <p className="text-sm text-stone-600 dark:text-stone-300">
                    {email}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    User ID: {shortId}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                {!user.emailVerified && (
                  <Button
                    variant="outline"
                    onClick={() => router.push("/login/verify")}
                    className="h-11 rounded-2xl border-stone-300 bg-white/70 px-5 hover:bg-white dark:border-stone-700 dark:bg-stone-900/70 dark:hover:bg-stone-900"
                  >
                    Verify email
                    <ArrowRight className="size-4" />
                  </Button>
                )}
                <Button
                  asChild
                  variant="outline"
                  className="h-11 rounded-2xl border-stone-300 bg-white/70 px-5 hover:bg-white dark:border-stone-700 dark:bg-stone-900/70 dark:hover:bg-stone-900"
                >
                  <Link href="/byok">
                    <KeyRound className="size-4" />
                    Go to BYOK
                  </Link>
                </Button>
                <Button
                  onClick={logout}
                  className="h-11 rounded-2xl bg-stone-900 px-5 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
                >
                  <LogOut className="size-4" />
                  Sign out
                </Button>
              </div>
            </div>

            <div className="grid gap-4 rounded-4xl border border-stone-200/80 bg-white/45 p-4 backdrop-blur-sm sm:grid-cols-3 dark:border-stone-800/70 dark:bg-stone-950/30">
              <div className="rounded-2xl border border-white/80 bg-white/65 p-4 dark:border-stone-800 dark:bg-stone-900/70">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                  Email status
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {user.emailVerified ? "Verified" : "Unverified"}
                </p>
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                  {user.emailVerified
                    ? "All set for secure sign-ins."
                    : "Verify to unlock all features."}
                </p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/65 p-4 dark:border-stone-800 dark:bg-stone-900/70">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                  Messages today (UTC)
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {dailyMessagesLoading
                    ? "Loading…"
                    : `${dailyMessages?.count ?? 0}/${dailyMessages?.limit ?? 50}`}
                </p>
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                  Resets at {getLocalTimeStringForNextUTCMidnight()}.
                </p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/65 p-4 dark:border-stone-800 dark:bg-stone-900/70">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                  Security
                </p>
                <p className="mt-2 inline-flex items-center gap-2 text-2xl font-semibold">
                  <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-300" />
                  Protected
                </p>
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                  Manage provider keys via BYOK.
                </p>
              </div>
            </div>

            <div className="rounded-4xl border border-stone-200/80 bg-white/55 p-6 shadow-sm backdrop-blur-sm dark:border-stone-800/70 dark:bg-stone-950/30">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold tracking-tight">
                    User preferences
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-stone-600 dark:text-stone-300">
                    Update provider, model, and BYOK.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleSavePreferences}
                  disabled={preferencesLoading || isSavingPreferences}
                  className="mt-3 h-10 rounded-2xl bg-stone-900 px-5 text-white hover:bg-stone-800 sm:mt-0 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
                >
                  Save changes
                </Button>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="flex items-center justify-between border-b border-stone-200/70 py-3 dark:border-stone-800/70">
                  <p className="text-sm">Provider</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex gap-2 rounded-md px-2 py-1 hover:bg-accent">
                      <p className="text-sm">
                        {(draftProvider || selectedProvider || DEFAULT_PROVIDER) === "openai"
                          ? "OpenAI"
                          : "Gemini"}
                      </p>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Providers</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => setDraftProvider("gemini")}>
                        Gemini
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setDraftProvider("openai")}>
                        OpenAI
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center justify-between border-b border-stone-200/70 py-3 dark:border-stone-800/70">
                  <p className="text-sm">Model</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex max-w-80 justify-end gap-2 rounded-md px-2 py-1 hover:bg-accent">
                      <p className="truncate text-sm">
                        {draftModel || selectedModel || DEFAULT_MODEL}
                      </p>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="max-h-72 overflow-auto">
                      <DropdownMenuLabel>Models</DropdownMenuLabel>
                      {modelOptions.map((m) => (
                        <DropdownMenuItem key={m.id} onClick={() => setDraftModel(m.id)}>
                          {m.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center justify-between border-b border-stone-200/70 py-3 dark:border-stone-800/70">
                  <div className="flex flex-col">
                    <p className="text-sm">BYOK</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Use your own provider keys for billing.
                    </p>
                  </div>
                  <Switch
                    checked={draftByokEnabled}
                    onCheckedChange={setDraftByokEnabled}
                    disabled={preferencesLoading || isSavingPreferences}
                    aria-label="Toggle BYOK"
                  />
                </div>

                {preferencesError ? (
                  <p className="text-sm text-destructive">{preferencesError}</p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-4xl border border-stone-200/80 bg-white/55 p-6 shadow-sm backdrop-blur-sm dark:border-stone-800/70 dark:bg-stone-950/30">
                <h2 className="text-base font-semibold tracking-tight">
                  Bring your own key (BYOK)
                </h2>
                <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-300">
                  Add your Gemini or OpenAI API key to unlock higher limits and
                  keep your provider billing under your control.
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Button
                    asChild
                    className="h-11 rounded-2xl bg-stone-900 px-5 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
                  >
                    <Link href="/byok">
                      <KeyRound className="size-4" />
                      Manage keys
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 rounded-2xl border-stone-300 bg-white/70 px-5 hover:bg-white dark:border-stone-700 dark:bg-stone-900/70 dark:hover:bg-stone-900"
                  >
                    <Link href="/byok">
                      Learn more
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="rounded-4xl border border-stone-200/80 bg-white/55 p-6 shadow-sm backdrop-blur-sm dark:border-stone-800/70 dark:bg-stone-950/30">
                <h2 className="text-base font-semibold tracking-tight">
                  Quick tips
                </h2>
                <ul className="mt-3 space-y-2 text-sm text-stone-600 dark:text-stone-300">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 rounded-full bg-stone-400 dark:bg-stone-500" />
                    Verify your email for smoother sign-ins across devices.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 rounded-full bg-stone-400 dark:bg-stone-500" />
                    Use BYOK to control your provider usage and billing.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 rounded-full bg-stone-400 dark:bg-stone-500" />
                    If you rotate keys, update them in BYOK immediately.
                  </li>
                </ul>
                <div className="mt-4">
                  <Button asChild variant="link" className="h-auto p-0 text-sm">
                    <Link href="/byok">
                      Open BYOK
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
