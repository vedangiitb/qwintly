"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { GenerationSummary } from "@/features/generate/ui/api/generate.client";
import { generateClient } from "@/features/generate/ui/api/generate.client";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

const statusBadgeVariant = (
  status: string,
): React.ComponentProps<typeof Badge>["variant"] => {
  const normalized = status.trim().toLowerCase();
  if (normalized === "completed" || normalized === "success") return "default";
  if (normalized === "failed" || normalized === "error") return "destructive";
  return "secondary";
};

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

  const canFetch = Boolean(messageId?.trim());

  const loadSummary = async () => {
    if (!canFetch) {
      console.log("message id is empty");
      return;
    }
    if (isLoading) return;
    if (loadedForMsgId === messageId && summary) {
      console.log("summary already loaded");
      return;
    }

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

  return (
    <div className="w-full md:max-w-[75%]">
      <div className="overflow-hidden rounded-2xl border bg-muted/20 shadow-sm">
        <div className="p-3">{displayMessage}</div>

        <Accordion
          type="single"
          collapsible
          value={isExpanded ? "details" : ""}
          onValueChange={(value) => {
            const nextExpanded = value === "details";
            setIsExpanded(nextExpanded);
            if (nextExpanded) {
              void loadSummary();
            }
          }}
          className="w-full"
        >
          <AccordionItem value="details" className="border-0">
            <AccordionTrigger className="border-t px-3 py-2 hover:no-underline">
              <div className="flex w-full items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">Details</span>
                  {statusLabel ? (
                    <Badge
                      variant={badgeVariant}
                      className={cn(
                        "text-[10px] uppercase",
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

            <AccordionContent className="px-3 pb-3">
              {isLoading ? (
                <div className="text-xs text-muted-foreground">Loading...</div>
              ) : error ? (
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs text-destructive">{error}</div>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={!canFetch}
                    onClick={() => void loadSummary()}
                    className="h-7 text-xs"
                  >
                    Retry
                  </Button>
                </div>
              ) : summary ? (
                <ScrollArea className="h-72 pr-2">
                  {summary.messages?.length ? (
                    <ul className="space-y-2 text-xs leading-relaxed">
                      {summary.messages.map((item, idx) => (
                        <li
                          key={`${idx}-${item}`}
                          className="rounded-lg border bg-background/40 px-3 py-2"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      No details available.
                    </div>
                  )}
                </ScrollArea>
              ) : (
                <div className="text-xs text-muted-foreground">
                  {canFetch ? "No details available." : "Missing message id."}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};
