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
import { AI_MODELS, DEFAULT_MODEL, DEFAULT_PROVIDER } from "@/features/ai/core/modelInfo";
import { usePreferences } from "@/features/auth/ui/hooks/usePreferences";
import { Settings2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function resolveModelGroup(provider: string) {
  if (provider === "openai") return AI_MODELS.OPENAI;
  return AI_MODELS.GEMINI;
}

export default function PrefDialog() {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { preferences, isLoading, error, selectedModel, selectedProvider, saveModel, saveProvider } =
    usePreferences({ enabled: open });

  const providerOptions = useMemo(
    () =>
      [
        { id: "gemini", label: "Gemini" },
      ] as const,
    [],
  );

  const [draftProvider, setDraftProvider] = useState<string>("");
  const [draftModel, setDraftModel] = useState<string>("");

  const effectiveProvider = draftProvider || selectedProvider || DEFAULT_PROVIDER;

  const modelOptions = useMemo(() => {
    const group = resolveModelGroup(effectiveProvider);
    const values = Object.values(group);
    const unique = Array.from(new Set(values));
    return unique.map((model) => ({ id: model, label: model }));
  }, [effectiveProvider]);

  useEffect(() => {
    if (!open) return;
    if (isSaving) return;
    if (isLoading && !preferences) return;

    const provider = preferences?.pref_provider ?? DEFAULT_PROVIDER;
    const group = resolveModelGroup(provider);
    const allowedModels = new Set<string>(Object.values(group) as string[]);

    const modelCandidate = preferences?.pref_model ?? DEFAULT_MODEL;
    const resolvedModel = allowedModels.has(modelCandidate)
      ? modelCandidate
      : group.DEFAULT;

    setDraftProvider(provider);
    setDraftModel(resolvedModel);
  }, [open, preferences, isLoading, isSaving]);

  useEffect(() => {
    if (!open) return;
    if (!draftProvider) return;

    const group = resolveModelGroup(draftProvider);
    const allowedModels = new Set<string>(Object.values(group) as string[]);

    if (draftModel && allowedModels.has(draftModel)) return;
    setDraftModel(group.DEFAULT);
  }, [draftModel, draftProvider, open]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updates: Promise<unknown>[] = [];

      if (draftProvider && draftProvider !== selectedProvider) {
        updates.push(saveProvider(draftProvider));
      }

      if (draftModel && draftModel !== selectedModel) {
        updates.push(saveModel(draftModel));
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
            {isLoading && !preferences ? (
              <>
                <div className="flex items-center justify-between border-b py-3">
                  <p className="text-sm">Provider</p>
                  <div className="h-8 w-28 rounded-md bg-muted animate-pulse" />
                </div>
                <div className="flex items-center justify-between border-b py-3">
                  <p className="text-sm">Model</p>
                  <div className="h-8 w-56 rounded-md bg-muted animate-pulse" />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between border-b py-3">
                  <p className="text-sm">Provider</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex gap-2 hover:bg-accent py-1 px-2 rounded-md">
                      <p className="text-sm">
                        {providerOptions.find((p) => p.id === (draftProvider || selectedProvider))
                          ?.label ?? "Select"}
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
              </>
            )}

            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}

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
