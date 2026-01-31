import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useChatSession } from "../../hooks/chatSessionContext";
import { useChat } from "../../hooks/useChat";

export function Questionnaire() {
  const { answers, setAnswers, questions } = useChatSession();
  const { submitAnswer } = useChat();

  const [index, setIndex] = useState(0);
  const progress = ((index + 1) / questions.length) * 100;

  function updateAnswer(id: number, value: any) {
    setAnswers((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        answer: value,
      },
    }));
  }

  const canGoNext = () => {
    const ans = answers[index]?.answer;

    if (ans === undefined || ans === null) return false;

    if (Array.isArray(ans)) return ans.length > 0;
    if (typeof ans === "string") return ans.trim().length > 0;

    return true;
  };

  const navigate = () => setIndex((i) => Math.min(i + 1, questions.length - 1));

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <p>
        Please answer the following questions to help me get better
        understanding of your project
      </p>
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
          {questions.map((q, index) => (
            <div key={index} className="w-full shrink-0 px-1">
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-base">{q.question}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* TEXT */}
                  {q.type === "text" && (
                    <input
                      type="text"
                      value={answers[index]?.answer ?? ""}
                      onChange={(e) => updateAnswer(index, e.target.value)}
                      className="w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Type your answer..."
                    />
                  )}

                  {/* SINGLE SELECT */}
                  {q.type === "single_select" && q.options && (
                    <div className="flex flex-wrap gap-2">
                      {q.options.map((opt) => {
                        const selected = answers[index].answer === opt;
                        return (
                          <Button
                            key={opt}
                            type="button"
                            variant={selected ? "default" : "outline"}
                            className={cn(
                              "rounded-full",
                              selected && "shadow-sm",
                            )}
                            onClick={() => updateAnswer(index, opt)}
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
                        const current = Array.isArray(answers[index].answer)
                          ? answers[index].answer
                          : [];
                        const selected = current.includes(opt);

                        return (
                          <Button
                            key={opt}
                            type="button"
                            variant={selected ? "default" : "outline"}
                            className="rounded-full"
                            onClick={() => {
                              const updated = selected
                                ? current.filter((v) => v !== opt)
                                : [...current, opt];

                              updateAnswer(index, updated);
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
          disabled={!canGoNext()}
          onClick={() => submitAnswer(index, navigate)}
        >
          {index === questions.length - 1 ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  );
}
