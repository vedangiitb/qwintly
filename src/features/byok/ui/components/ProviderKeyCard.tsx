"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserApiKeyDetails } from "@/features/byok/ui/api/byok.api";
import { cn } from "@/lib/utils";
import { KeyRound, PencilLine, Plus, ShieldCheck, Trash2 } from "lucide-react";

type ProviderKeyCardProps = {
  provider: "gemini" | "openai";
  description: string;
  accentClassName: string;
  keyDetails?: UserApiKeyDetails;
  totalKeys: number;
  isLoading: boolean;
  isDeleting: boolean;
  onCreate: () => void;
  onUpdate: () => void;
  onDelete: () => void;
};

const providerLabels = {
  gemini: "Gemini",
  openai: "OpenAI",
};

function formatDate(date?: string | null) {
  if (!date) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function ProviderKeyCard({
  provider,
  description,
  accentClassName,
  keyDetails,
  totalKeys,
  isLoading,
  isDeleting,
  onCreate,
  onUpdate,
  onDelete,
}: ProviderKeyCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden rounded-4xl border border-stone-200/80 bg-white/80 shadow-[0_16px_60px_rgba(28,25,23,0.08)] backdrop-blur-xl dark:border-stone-800/80 dark:bg-stone-950/70",
        accentClassName,
      )}
    >
      <CardContent className="p-6 sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-white/40 bg-white/50 shadow-sm dark:border-stone-700 dark:bg-stone-900/80">
                <KeyRound className="size-5" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  {providerLabels[provider]}
                </h2>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                <div className="h-4 w-52 animate-pulse rounded-full bg-stone-200 dark:bg-stone-800" />
                <div className="h-4 w-72 animate-pulse rounded-full bg-stone-200 dark:bg-stone-800" />
              </div>
            ) : keyDetails ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="rounded-full px-3 py-1">
                    <ShieldCheck className="size-3.5" />
                    Encrypted
                  </Badge>
                  <Badge variant="outline" className="rounded-full px-3 py-1">
                    Version {keyDetails.keyVersion}
                  </Badge>
                  {keyDetails.isActive !== false && (
                    <Badge className="rounded-full bg-emerald-600 px-3 py-1 text-white hover:bg-emerald-600">
                      Active
                    </Badge>
                  )}
                  {totalKeys > 1 && (
                    <Badge variant="secondary" className="rounded-full px-3 py-1">
                      {totalKeys} stored keys
                    </Badge>
                  )}
                </div>

                <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                      Key
                    </p>
                    <p className="mt-1 font-medium text-foreground">Stored securely</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                      Updated
                    </p>
                    <p className="mt-1 font-medium text-foreground">
                      {formatDate(keyDetails.updatedAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                      Created
                    </p>
                    <p className="mt-1 font-medium text-foreground">
                      {formatDate(keyDetails.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-stone-300/90 bg-white/40 p-4 text-sm text-muted-foreground dark:border-stone-700 dark:bg-stone-900/40">
                No key has been added for {providerLabels[provider]} yet.
              </div>
            )}
          </div>

          <div className="flex min-w-55 flex-col gap-3">
            {keyDetails ? (
              <>
                <Button
                  onClick={onUpdate}
                  className="h-11 rounded-2xl bg-stone-900 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
                >
                  <PencilLine className="size-4" />
                  Update key
                </Button>
                <Button
                  variant="outline"
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="h-11 rounded-2xl border-stone-300 bg-transparent hover:bg-red-50 hover:text-red-700 dark:border-stone-700 dark:hover:bg-red-950/40 dark:hover:text-red-200"
                >
                  <Trash2 className="size-4" />
                  {isDeleting ? "Deleting..." : "Delete key"}
                </Button>
              </>
            ) : (
              <Button
                onClick={onCreate}
                className="h-11 rounded-2xl bg-stone-900 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
              >
                <Plus className="size-4" />
                Add key
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
