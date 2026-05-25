import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { usePreferences } from "@/features/auth/ui/hooks/usePreferences";
import { fetchValidModels, type ValidModelsByProviderResponse } from "@/features/byok/ui/api/byok.api";
import { Settings2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function formatProviderLabel(provider: string) {
  if (!provider) return "Select";
  if (provider.toLowerCase() === "openai") return "OpenAI";
  return provider.charAt(0).toUpperCase() + provider.slice(1);
}

export default function PrefDialog() {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validModels, setValidModels] = useState<ValidModelsByProviderResponse>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const {
    preferences,
    isLoading,
    error,
    selectedModel,
    selectedProvider,
    byokEnabled,
    saveModel,
    saveProvider,
    saveByokEnabled,
  } = usePreferences({ enabled: open });

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    async function loadModels() {
      setModelsLoading(true);
      setModelsError(null);
      try {
        const data = await fetchValidModels();
        if (cancelled) return;
        setValidModels(data);
      } catch (e) {
        if (cancelled) return;
        setValidModels([]);
        setModelsError(e instanceof Error ? e.message : "Failed to load models");
      } finally {
        if (!cancelled) setModelsLoading(false);
      }
    }

    loadModels();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const providerOptions = useMemo(() => {
    return validModels.map((p) => ({
      id: p.provider,
      label: formatProviderLabel(p.provider),
    }));
  }, [validModels]);

  const [draftProvider, setDraftProvider] = useState<string>("");
  const [draftModel, setDraftModel] = useState<string>("");
  const [draftByokEnabled, setDraftByokEnabled] = useState(false);

  const effectiveProvider = draftProvider || selectedProvider || preferences?.pref_provider || "";

  const modelOptions = useMemo(() => {
    const providerGroup = validModels.find((p) => p.provider === effectiveProvider);
    return (providerGroup?.models ?? []).map((m) => ({
      id: m.modelName,
      label: m.modelName,
    }));
  }, [effectiveProvider, validModels]);

  useEffect(() => {
    if (!open) return;
    if (isSaving) return;
    if ((isLoading && !preferences) || (modelsLoading && validModels.length === 0)) return;

    const availableProviders = new Set<string>(validModels.map((p) => p.provider));
    const providerCandidate = preferences?.pref_provider ?? "";
    const resolvedProvider = availableProviders.has(providerCandidate)
      ? providerCandidate
      : validModels[0]?.provider ?? "";

    const providerGroup = validModels.find((p) => p.provider === resolvedProvider);
    const allowedModels = new Set<string>(providerGroup?.models.map((m) => m.modelName) ?? []);

    const modelCandidate = preferences?.pref_model ?? "";
    const resolvedModel = allowedModels.has(modelCandidate)
      ? modelCandidate
      : providerGroup?.models[0]?.modelName ?? "";

    setDraftProvider(resolvedProvider);
    setDraftModel(resolvedModel);
    setDraftByokEnabled(preferences?.byok_enabled ?? false);
  }, [open, preferences, isLoading, isSaving, modelsLoading, validModels]);

  useEffect(() => {
    if (!open) return;
    if (!draftProvider) return;

    const providerGroup = validModels.find((p) => p.provider === draftProvider);
    const allowedModels = new Set<string>(providerGroup?.models.map((m) => m.modelName) ?? []);

    if (draftModel && allowedModels.has(draftModel)) return;
    setDraftModel(providerGroup?.models[0]?.modelName ?? "");
  }, [draftModel, draftProvider, open, validModels]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updates: Promise<unknown>[] = [];

      if (draftByokEnabled !== byokEnabled) {
        updates.push(saveByokEnabled(draftByokEnabled));
      }

      if (draftByokEnabled) {
        if (draftProvider && draftProvider !== selectedProvider) {
          updates.push(saveProvider(draftProvider));
        }

        if (draftModel && draftModel !== selectedModel) {
          updates.push(saveModel(draftModel));
        }
      }

      if (updates.length === 0) {
        toast("No changes to save");
        setOpen(false);
        return;
      }

      await Promise.all(updates);
      toast.success("Preferences updated");
      setOpen(false);
    } catch (e) {
      console.error("Failed to save preferences", e);
      toast.error(e instanceof Error ? e.message : "Failed to update preferences");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form>
        <DialogTrigger asChild>
          <div className="flex items-center cursor-pointer p-2 hover:bg-border transition-colors duration-300 rounded-md">
            <Settings2 className="h-4 w-4 mr-2" />
            <p className="text-sm">Preferences</p>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Edit Preferences</DialogTitle>
            <DialogDescription>
              Choose your preferred provider and model.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 pt-2">
            {((isLoading && !preferences) || (modelsLoading && validModels.length === 0)) ? (
              <>
                <div className="flex items-center justify-between border-b py-3">
                  <p className="text-sm">BYOK</p>
                  <div className="h-5 w-8 rounded-full bg-muted animate-pulse" />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between border-b py-3">
                  <div className="flex flex-col">
                    <p className="text-sm">BYOK</p>
                    <p className="text-xs text-muted-foreground">
                      Use your own provider keys for billing.
                    </p>
                  </div>
                  <Switch
                    checked={draftByokEnabled}
                    onCheckedChange={setDraftByokEnabled}
                    disabled={isLoading || isSaving}
                    aria-label="Toggle BYOK"
                  />
                </div>

                {draftByokEnabled ? (
                  <>
                    <div className="flex items-center justify-between border-b py-3">
                      <p className="text-sm">Provider</p>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex gap-2 hover:bg-accent py-1 px-2 rounded-md">
                          <p className="text-sm">
                            {providerOptions.find(
                              (p) => p.id === (draftProvider || selectedProvider),
                            )?.label ?? "Select"}
                          </p>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Providers</DropdownMenuLabel>
                          {providerOptions.map((p) => (
                            <DropdownMenuItem
                              key={p.id}
                              onClick={() => setDraftProvider(p.id)}
                            >
                              {p.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center justify-between border-b py-3">
                      <p className="text-sm">Model</p>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex gap-2 hover:bg-accent py-1 px-2 rounded-md max-w-70 justify-end">
                          <p className="text-sm truncate">
                            {draftModel || selectedModel || "Select"}
                          </p>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="max-h-72 overflow-auto"
                        >
                          <DropdownMenuLabel>Models</DropdownMenuLabel>
                          {modelOptions.map((m) => (
                            <DropdownMenuItem
                              key={m.id}
                              onClick={() => setDraftModel(m.id)}
                            >
                              {m.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </>
                ) : null}
              </>
            )}

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {modelsError ? <p className="text-sm text-destructive">{modelsError}</p> : null}

          </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="button" onClick={handleSave} disabled={isLoading || isSaving}>
                Save changes
              </Button>
            </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
