"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { GenerationSummary } from "@/features/generate/ui/api/generate.client";
import { generateClient } from "@/features/generate/ui/api/generate.client";
import { useGenerate } from "@/features/generate/ui/hooks/useGenerate";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ExternalLink,
  Loader2,
  Rocket,
  RotateCcw,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useChat } from "../hooks/useChat";

const statusBadgeVariant = (
  status: string,
): React.ComponentProps<typeof Badge>["variant"] => {
  const normalized = status.trim().toLowerCase();
  if (normalized === "completed" || normalized === "success") return "default";
  if (normalized === "failed" || normalized === "error") return "destructive";
  return "secondary";
};

const formatInteger = (value: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);

const formatUsd = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 4,
  }).format(value);

export const GenSummaryCard = ({
  displayMessage,
  messageId,
  renderMessageBody,
}: {
  displayMessage: string;
  messageId: string;
  renderMessageBody: (displayMessage: string) => React.ReactNode;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<GenerationSummary | null>(null);
  const [loadedForMsgId, setLoadedForMsgId] = useState<string | null>(null);

  const { chatId } = useChat();
  const {
    isSessionRunning,
    setPreviewUrl,
    deployApp,
    retryGenerate,
    retryDeploy,
  } = useGenerate();

  const canFetch = Boolean(messageId?.trim());
  const canTrigger = Boolean(chatId?.trim());
  const [isTriggering, setIsTriggering] = useState(false);

  const loadSummary = async () => {
    if (!canFetch) return;
    if (isLoading) return;
    if (loadedForMsgId === messageId && summary) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await generateClient.fetchGenerationSummary({
        msgId: messageId,
      });
      setSummary(data);
      setLoadedForMsgId(messageId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load details.");
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreviewUrl = (genId: string) => {
    const previewSuffix = process.env.NEXT_PUBLIC_PREVIEW_URL_SUFFIX ?? "";
    if (!previewSuffix) return;
    setPreviewUrl(`${genId}-${previewSuffix}`);
  };

  useEffect(() => {
    setSummary(null);
    setError(null);
    setIsLoading(false);
    setLoadedForMsgId(null);
  }, [messageId]);

  const statusLabel = useMemo(() => summary?.status?.trim() ?? "", [summary]);
  const badgeVariant = useMemo(
    () => statusBadgeVariant(statusLabel),
    [statusLabel],
  );
  const normalizedStatus = useMemo(
    () => statusLabel.trim().toLowerCase(),
    [statusLabel],
  );
  const isFailed =
    normalizedStatus === "failed" || normalizedStatus === "error";

  return (
    <div className="w-full md:max-w-[75%] space-y-2">
      {renderMessageBody(displayMessage)}

      <Card
        className={cn(
          "overflow-hidden rounded-2xl border py-0 shadow-sm",
          "bg-muted/20",
        )}
      >
        <Accordion
          type="single"
          collapsible
          value={isExpanded ? "details" : ""}
          onValueChange={(value) => {
            const nextExpanded = value === "details";
            setIsExpanded(nextExpanded);
            if (nextExpanded) void loadSummary();
          }}
          className="w-full"
        >
          <AccordionItem value="details" className="border-0">
            <AccordionTrigger
              className={cn(
                "px-4 py-3 hover:no-underline",
                "transition-colors hover:bg-muted/30",
              )}
            >
              <div className="flex w-full items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold tracking-wide text-muted-foreground">
                    Generation details
                  </span>
                  {statusLabel ? (
                    <Badge
                      variant={badgeVariant}
                      className={cn(
                        "h-5 rounded-full px-2 text-[10px] font-semibold uppercase tracking-wide",
                        !canFetch && "opacity-60",
                      )}
                    >
                      {statusLabel}
                    </Badge>
                  ) : null}
                </div>

                {!canFetch ? (
                  <span className="text-[10px] text-muted-foreground">
                    Missing message id
                  </span>
                ) : null}
              </div>
            </AccordionTrigger>

            <AccordionContent className="px-0 pb-0">
              <CardContent className="px-4 pb-4 pt-0">
                {isLoading ? (
                  <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Loading details…
                  </div>
                ) : error ? (
                  <div className="flex items-start justify-between gap-3 py-1">
                    <div className="flex items-start gap-2 text-xs text-destructive">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={!canFetch}
                      onClick={() => void loadSummary()}
                      className="h-7 rounded-full px-3 text-xs"
                    >
                      Retry
                    </Button>
                  </div>
                ) : summary ? (
                  <div className="space-y-3">
                    <div
                      className={cn(
                        "grid grid-cols-2 gap-2 rounded-xl border p-3",
                        "bg-background/30",
                      )}
                    >
                      <div className="space-y-0.5">
                        <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          Tokens
                        </div>
                        <div className="text-xs">
                          {formatInteger(
                            (summary.inputTokens ?? 0) +
                              (summary.outputTokens ?? 0),
                          )}
                          <span className="ml-1 text-[10px] text-muted-foreground">
                            in {formatInteger(summary.inputTokens ?? 0)} / out{" "}
                            {formatInteger(summary.outputTokens ?? 0)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-0.5 text-right">
                        <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          Cost
                        </div>
                        <div className="text-xs">
                          {formatUsd(
                            (summary.inputCost ?? 0) + (summary.outputCost ?? 0),
                          )}
                          <span className="ml-1 text-[10px] text-muted-foreground">
                            in {formatUsd(summary.inputCost ?? 0)} / out{" "}
                            {formatUsd(summary.outputCost ?? 0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      {summary.sessionType === "generate" &&
                      summary.status !== "failed" ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 rounded-full px-3 text-xs"
                          onClick={() => updatePreviewUrl(summary.genSessionId)}
                        >
                          <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                          Preview
                        </Button>
                      ) : null}

                      {isFailed ? (
                        <Button
                          size="sm"
                          variant="default"
                          className="h-8 rounded-full px-3 text-xs"
                          disabled={
                            !canTrigger || isTriggering || isSessionRunning
                          }
                          onClick={() => {
                            if (!chatId?.trim()) return;
                            if (isTriggering) return;
                            if (isSessionRunning) return;
                            setIsTriggering(true);
                            const task =
                              summary.sessionType === "generate"
                                ? retryGenerate(chatId, summary.genSessionId)
                                : retryDeploy(chatId, summary.genSessionId);
                            void task.finally(() => setIsTriggering(false));
                          }}
                        >
                          <RotateCcw
                            className={cn(
                              "mr-1.5 h-3.5 w-3.5",
                              isTriggering && "animate-spin",
                            )}
                          />
                          {isTriggering
                            ? "Retrying…"
                            : summary.sessionType === "generate"
                              ? "Retry generation"
                              : "Retry deployment"}
                        </Button>
                      ) : summary.sessionType === "generate" ? (
                        <Button
                          size="sm"
                          variant="default"
                          className="h-8 rounded-full px-3 text-xs"
                          disabled={
                            !canTrigger || isTriggering || isSessionRunning
                          }
                          onClick={() => {
                            if (!chatId?.trim()) return;
                            if (isTriggering) return;
                            if (isSessionRunning) return;
                            setIsTriggering(true);
                            void deployApp(
                              chatId,
                              summary.genSessionId,
                            ).finally(() => setIsTriggering(false));
                          }}
                        >
                          <Rocket className="mr-1.5 h-3.5 w-3.5" />
                          {isTriggering ? "Deploying…" : "Deploy"}
                        </Button>
                      ) : null}

                      {!canTrigger ? (
                        <span className="text-[10px] text-muted-foreground">
                          Missing chat id
                        </span>
                      ) : null}
                    </div>

                    <ScrollArea className="h-72 pr-2">
                      {summary.messages?.length ? (
                        <ul className="space-y-2 text-xs leading-relaxed">
                          {summary.messages.map((item, idx) => (
                            <li
                              key={`${idx}-${item}`}
                              className={cn(
                                "rounded-lg border px-3 py-2",
                                "bg-background/40",
                              )}
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="py-2 text-xs text-muted-foreground">
                          No details available.
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="py-2 text-xs text-muted-foreground">
                    {canFetch ? "No details available." : "Missing message id."}
                  </div>
                )}
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    </div>
  );
};
