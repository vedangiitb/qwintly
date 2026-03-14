"use client";

import { QuestionAnswers, UserResponse } from "@/features/ai/types/askQuestions.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { useChat } from "../hooks/useChat";

interface QuestionnaireProps {
  questionSet?: QuestionAnswers;
  fallbackText?: string;
}

export function Questionnaire({ questionSet, fallbackText }: QuestionnaireProps) {
  const { submitAnswers } = useChat();
  const [submitting, setSubmitting] = useState(false);
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const hasSubmitted = questionSet?.status === "answered" || questionSet?.status === "skipped";

  const initialResponses = useMemo(() => {
    if (!questionSet) return {};
    const serverResponses = Array.isArray((questionSet as any).userResponses)
      ? ((questionSet as any).userResponses as UserResponse[])
      : [];
    return serverResponses.reduce<Record<string, string | string[]>>((acc, curr) => {
      acc[curr.questionId] = curr.response;
      return acc;
    }, {});
  }, [questionSet]);

  const effectiveResponses = useMemo(
    () => ({
      ...initialResponses,
      ...responses,
    }),
    [initialResponses, responses],
  );

  useEffect(() => {
    setCurrentQuestionIndex(0);
  }, [questionSet?.id, questionSet?.messageId]);

  const setQuestionResponse = (questionId: string, value: string | string[]) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const buildPayload = (
    questions: QuestionAnswers["questions"],
    responseMap: Record<string, string | string[]>,
  ): UserResponse[] =>
    questions.map((question) => ({
      questionId: question.id,
      response: responseMap[question.id] ?? "",
    }));

  const onSubmit = async () => {
    if (!questionSet) return;
    setSubmitting(true);
    try {
      await submitAnswers({
        answers: buildPayload(questionSet.questions, effectiveResponses),
        questionSetId: questionSet.id,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onSkipAll = async () => {
    if (!questionSet) return;
    setSubmitting(true);
    try {
      const skippedResponses = questionSet.questions.reduce<
        Record<string, string | string[]>
      >((acc, question) => {
        acc[question.id] = question.type === "multi_select" ? [] : "";
        return acc;
      }, {});

      setResponses(skippedResponses);

      await submitAnswers({
        answers: buildPayload(questionSet.questions, skippedResponses),
        questionSetId: questionSet.id,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!questionSet) {
    return (
      <Card className="w-full md:max-w-[85%] rounded-2xl">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          {fallbackText || "Questions are not available for this message."}
        </CardContent>
      </Card>
    );
  }

  if (hasSubmitted) {
    return (
      <div className="w-full md:max-w-[85%] space-y-4">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Questionnaire submitted</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Thanks! Your full questionnaire has already been submitted, so no
              more changes are needed here.
            </p>
          </CardContent>
        </Card>
        <Button variant="outline" disabled>
          Already submitted
        </Button>
      </div>
    );
  }

  const totalQuestions = questionSet.questions.length;
  const currentQuestion = questionSet.questions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const skipValue = currentQuestion.type === "multi_select" ? [] : "";

  const onSkipCurrent = async () => {
    setQuestionResponse(currentQuestion.id, skipValue);

    if (isLastQuestion) {
      const nextResponses = {
        ...effectiveResponses,
        [currentQuestion.id]: skipValue,
      };

      setSubmitting(true);
      try {
        await submitAnswers({
          answers: buildPayload(questionSet.questions, nextResponses),
          questionSetId: questionSet.id,
        });
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setCurrentQuestionIndex((current) =>
      Math.min(current + 1, totalQuestions - 1),
    );
  };

  return (
    <div
      className={cn(
        "w-full space-y-6 md:max-w-[85%] bg-muted/40 rounded-2xl border transition-all text-primary text-sm md:text-base p-4",
        submitting && "opacity-60",
      )}
      aria-busy={submitting}
    >
      <p>
        Please answer the following questions to help me get better
        understanding of your project
      </p>
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
          <span>
            {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%
            {" "}complete
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{
              width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
            }}
          />
        </div>

        <Card key={currentQuestion.id} className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">{currentQuestion.question}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {currentQuestion.type === "single_select" && currentQuestion.options && (
              <div className="flex flex-wrap gap-2">
                {currentQuestion.options.map((opt) => {
                  const selected = effectiveResponses[currentQuestion.id] === opt;
                  return (
                    <Button
                      key={opt}
                      type="button"
                      variant={selected ? "default" : "outline"}
                      className={cn("rounded-full", selected && "shadow-sm")}
                      disabled={submitting}
                      onClick={() => setQuestionResponse(currentQuestion.id, opt)}
                    >
                      {opt}
                    </Button>
                  );
                })}
              </div>
            )}

            {currentQuestion.type === "multi_select" && currentQuestion.options && (
              <div className="flex flex-wrap gap-2">
                {currentQuestion.options.map((opt) => {
                  const current = Array.isArray(effectiveResponses[currentQuestion.id])
                    ? (effectiveResponses[currentQuestion.id] as string[])
                    : [];
                  const selected = current.includes(opt);

                  return (
                    <Button
                      key={opt}
                      type="button"
                      variant={selected ? "default" : "outline"}
                      className="rounded-full"
                      disabled={submitting}
                      onClick={() => {
                        const updated = selected
                          ? current.filter((v) => v !== opt)
                          : [...current, opt];
                        setQuestionResponse(currentQuestion.id, updated);
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            disabled={submitting}
            onClick={onSkipCurrent}
          >
            Skip
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={submitting}
            onClick={onSkipAll}
          >
            Skip All
          </Button>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={submitting || isFirstQuestion}
            onClick={() =>
              setCurrentQuestionIndex((current) => Math.max(current - 1, 0))
            }
          >
            Previous
          </Button>

          {isLastQuestion ? (
            <Button disabled={submitting} onClick={onSubmit}>
              Submit Answers
            </Button>
          ) : (
            <Button
              type="button"
              disabled={submitting}
              onClick={() =>
                setCurrentQuestionIndex((current) =>
                  Math.min(current + 1, totalQuestions - 1),
                )
              }
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
