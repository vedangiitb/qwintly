"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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

  const canFetch = Boolean(messageId?.trim());

  useEffect(() => {
    if (!isExpanded) return;
    if (!canFetch) return;
    if (summary || isLoading) return;

    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    void generateClient
      .fetchGenerationSummary({ msgId: messageId, signal: controller.signal })
      .then((data) => setSummary(data))
      .catch((err) => {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to load details.");
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [isExpanded, canFetch, summary, isLoading, messageId]);

  const statusLabel = useMemo(() => summary?.status?.trim() ?? "", [summary]);
  const badgeVariant = useMemo(
    () => statusBadgeVariant(statusLabel),
    [statusLabel],
  );

  return (
    <div className="w-full space-y-2">
      {renderMessageBody(displayMessage)}

      <Accordion
        type="single"
        collapsible
        value={isExpanded ? "details" : ""}
        onValueChange={(value) => setIsExpanded(value === "details")}
        className="md:max-w-[75%]"
      >
        <AccordionItem value="details" className="border rounded-xl bg-muted/20 px-3">
          <AccordionTrigger className="py-2 hover:no-underline">
            <div className="flex w-full items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">Details</span>
                {statusLabel ? (
                  <Badge
                    variant={badgeVariant}
                    className={cn("text-[10px] uppercase", !canFetch && "opacity-60")}
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

          <AccordionContent className="pb-3">
            {isLoading ? (
              <div className="text-xs text-muted-foreground">Loading…</div>
            ) : error ? (
              <div className="text-xs text-destructive">{error}</div>
            ) : summary ? (
              <ScrollArea className="max-h-72 pr-2">
                {summary.messages?.length ? (
                  <ul className="space-y-2 text-xs leading-relaxed">
                    {summary.messages.map((item, idx) => (
                      <li
                        key={`${idx}-${item}`}
                        className="rounded-lg border bg-muted/30 px-3 py-2"
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
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs text-muted-foreground">
                  Expand to load details.
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={!canFetch}
                  onClick={() => setIsExpanded(true)}
                  className="h-7 text-xs"
                >
                  Load
                </Button>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

