"use client";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Accordion,
} from "@/components/ui/accordion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// import { Accordion } from "@radix-ui/react-accordion";
import { Check, Paintbrush, Pen, Settings } from "lucide-react";
import { getFontsList, getRelColList } from "./stylesEdit";

export default function StyleSettings({
  stylesFromLLM,
  setStylesFromLLM,
  initialStyles,
  setChanges,
}: {
  stylesFromLLM: any;
  setStylesFromLLM: any;
  initialStyles: any;
  setChanges: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label="Open style settings"
        className="cursor-pointer"
      >
        <Settings className="w-5 h-5 text-chart-2 hover:text-chart-2/70 transition-colors" />
      </PopoverTrigger>

      <PopoverContent className="mr-4 p-4 rounded-2xl shadow-xl bg-background border border-border max-w-xs space-y-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="colors" className="focus:outline-none">
            <AccordionTrigger className="flex  items-center gap-2 cursor-pointer font-semibold text-sm tracking-wide select-none rounded-md pb-4 px-2 hover:bg-muted transition-colors">
              <Paintbrush className="w-4 h-4" />
              Theme Colors
            </AccordionTrigger>
            <AccordionContent className="p-2 max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
              {getRelColList(initialStyles).map((item, idx) => {
                const isSelected =
                  item.col1 === stylesFromLLM.color &&
                  item.col2 === stylesFromLLM.muted;
                return (
                  <div
                    key={idx}
                    role="button"
                    tabIndex={0}
                    aria-selected={isSelected}
                    onClick={() => {
                      setStylesFromLLM((prev: any) => ({
                        color: item.col1,
                        muted: item.col2,
                        font: prev.font,
                      }));
                      setChanges(true);
                    }}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all border ${
                      isSelected
                        ? "ring-2 ring-primary bg-primary/10 border-primary"
                        : "border-transparent hover:ring-2 hover:ring-accent hover:bg-accent/10"
                    }`}
                    title={`Select ${item.col1} / ${item.col2}`}
                  >
                    <div className="flex gap-1">
                      <div
                        className={`w-6 h-6 rounded border border-border shadow-sm ${item.color}`}
                        title={item.col1}
                      />
                      <div
                        className={`w-6 h-6 rounded border border-border shadow-sm ${item.muted}`}
                        title={item.col2}
                      />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{`${item.col1} / ${item.col2}`}</span>
                    {isSelected && (
                      <Check
                        className="text-primary ml-auto"
                        size={18}
                        aria-label="Selected"
                      />
                    )}
                  </div>
                );
              })}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="fonts" className="focus:outline-none">
            <AccordionTrigger className="flex items-center gap-2 cursor-pointer font-semibold text-sm tracking-wide select-none rounded-md pb-4 px-2 hover:bg-muted transition-colors">
              <Pen className="w-4 h-4" />
              Font Styles
            </AccordionTrigger>
            <AccordionContent className="p-2 max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
              {getFontsList().map((item, idx) => {
                const isSelected =
                  item.primary === stylesFromLLM.font.primary &&
                  item.body === stylesFromLLM.font.body;

                return (
                  <div
                    key={idx}
                    role="button"
                    tabIndex={0}
                    aria-selected={isSelected}
                    onClick={() => {
                      setStylesFromLLM((prev: any) => ({
                        ...prev,
                        font: {
                          primary: item.primary,
                          body: item.body,
                        },
                      }));
                      setChanges(true);
                    }}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all border ${
                      isSelected
                        ? "ring-2 ring-primary bg-primary/10 border-primary"
                        : "border-transparent hover:ring-2 hover:ring-accent hover:bg-accent/10"
                    }`}
                    title={`Select ${item.primary} / ${item.body}`}
                  >
                    <span className={`font-${item.primary} text-base`}>
                      {item.primary}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {item.body}
                    </span>
                    {isSelected && (
                      <Check
                        className="text-primary ml-auto"
                        size={18}
                        aria-label="Selected"
                      />
                    )}
                  </div>
                );
              })}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </PopoverContent>
    </Popover>
  );
}
