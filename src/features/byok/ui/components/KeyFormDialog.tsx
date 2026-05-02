"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ByokProvider } from "@/features/byok/ui/api/byok.api";
import { useEffect, useState } from "react";

type KeyFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: ByokProvider;
  mode: "create" | "update";
  isSubmitting: boolean;
  onSubmit: (apiKey: string) => Promise<void>;
};

const providerLabels: Record<ByokProvider, string> = {
  gemini: "Gemini",
  openai: "OpenAI",
};

export default function KeyFormDialog({
  open,
  onOpenChange,
  provider,
  mode,
  isSubmitting,
  onSubmit,
}: KeyFormDialogProps) {
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    if (!open) {
      setApiKey("");
    }
  }, [open]);

  const submit = async () => {
    const normalizedKey = apiKey.trim();
    if (!normalizedKey) return;

    await onSubmit(normalizedKey);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-stone-200 bg-white/95 shadow-2xl sm:max-w-xl dark:border-stone-800 dark:bg-stone-950/95">
        <DialogHeader>
          <DialogTitle className="text-2xl tracking-tight">
            {mode === "create" ? "Add" : "Update"} {providerLabels[provider]} key
          </DialogTitle>
          <DialogDescription className="text-sm leading-6">
            Your key is encrypted with KMS before storage and is never shown again
            after upload.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Label htmlFor="api-key-input">API key</Label>
          <Input
            id="api-key-input"
            type="password"
            placeholder={`Paste your ${providerLabels[provider]} key`}
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            className="h-12 rounded-xl border-stone-300 bg-stone-50/80 px-4 text-sm dark:border-stone-700 dark:bg-stone-900/80"
          />
          <p className="text-xs leading-5 text-muted-foreground">
            Use this to connect your own provider account for generation.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={isSubmitting || !apiKey.trim()}
            className="rounded-xl bg-stone-900 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
          >
            {isSubmitting ? "Saving..." : mode === "create" ? "Save key" : "Update key"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
