import { useState } from "react";
import { useChat } from "../../hooks/chat/useChat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Props = {
  onChange?: (answers: Record<string, string | string[]>) => void;
};

export function Questionnaire({ onChange }: Props) {
  const { questionsList: questions } = useChat();
  const [index, setIndex] = useState(0);

  const [answers, setAnswers] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    questions.forEach((q) => {
      if (q.answer_default) {
        initial[q.id] =
          q.type === "multi_select" ? [q.answer_default] : q.answer_default;
      }
    });
    return initial;
  });

  const current = questions[index];
  const progress = ((index + 1) / questions.length) * 100;

  function updateAnswer(id: string, value: any) {
    const updated = { ...answers, [id]: value };
    setAnswers(updated);
    onChange?.(updated);
  }

  const canGoNext =
    current &&
    answers[current.id] !== undefined &&
    answers[current.id]?.length !== 0;

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Question {index + 1} of {questions.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      {/* Carousel */}
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {questions.map((q) => (
            <div key={q.id} className="w-full shrink-0 px-1">
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-base">{q.question}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* TEXT */}
                  {q.type === "text" && (
                    <input
                      type="text"
                      defaultValue={q.answer_default}
                      onChange={(e) => updateAnswer(q.id, e.target.value)}
                      className="w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Type your answer..."
                    />
                  )}

                  {/* SINGLE SELECT */}
                  {q.type === "single_select" && q.options && (
                    <div className="flex flex-wrap gap-2">
                      {q.options.map((opt) => {
                        const selected = answers[q.id] === opt;
                        return (
                          <Button
                            key={opt}
                            type="button"
                            variant={selected ? "default" : "outline"}
                            className={cn(
                              "rounded-full",
                              selected && "shadow-sm"
                            )}
                            onClick={() => updateAnswer(q.id, opt)}
                          >
                            {opt}
                          </Button>
                        );
                      })}
                    </div>
                  )}

                  {/* MULTI SELECT */}
                  {q.type === "multi_select" && q.options && (
                    <div className="flex flex-wrap gap-2">
                      {q.options.map((opt) => {
                        const selected = (answers[q.id] || []).includes(opt);
                        return (
                          <Button
                            key={opt}
                            type="button"
                            variant={selected ? "default" : "outline"}
                            className="rounded-full"
                            onClick={() => {
                              const prev = answers[q.id] || [];
                              updateAnswer(
                                q.id,
                                selected
                                  ? prev.filter((v: string) => v !== opt)
                                  : [...prev, opt]
                              );
                            }}
                          >
                            {opt}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
        >
          Back
        </Button>

        <Button
          disabled={!canGoNext}
          onClick={() => setIndex((i) => Math.min(i + 1, questions.length - 1))}
        >
          {index === questions.length - 1 ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  );
}
