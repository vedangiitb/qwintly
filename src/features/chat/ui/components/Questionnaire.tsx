"use client";

import { QuestionAnswers, UserResponse } from "@/features/ai/types/askQuestions.types";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  const [showSubmittedDetails, setShowSubmittedDetails] = useState(false);

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

  const submittedResponses = useMemo(() => {
    if (Object.keys(initialResponses).length > 0) return initialResponses;
    return effectiveResponses;
  }, [effectiveResponses, initialResponses]);

  useEffect(() => {
    setCurrentQuestionIndex(0);
    setShowSubmittedDetails(false);
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

  const resolveSkipResponse = (
    question: QuestionAnswers["questions"][number],
  ): string | string[] => {
    const fallbackOption = question.options?.[0] ?? "";

    if (question.type === "single_select") {
      if (
        typeof question.defaultAnswer === "string" &&
        question.options?.includes(question.defaultAnswer)
      ) {
        return question.defaultAnswer;
      }

      return fallbackOption;
    }

    if (question.type === "multi_select") {
      if (Array.isArray(question.defaultAnswer)) {
        const filtered = question.defaultAnswer.filter(
          (value): value is string =>
            typeof value === "string" && question.options?.includes(value),
        );

        if (filtered.length > 0) return filtered;
      }

      return fallbackOption ? [fallbackOption] : [];
    }

    return "";
  };

  const formatResponse = (value: string | string[] | undefined): string => {
    if (Array.isArray(value)) return value.filter(Boolean).join(", ") || "—";
    if (typeof value === "string") return value.trim() || "—";
    return "—";
  };

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
        acc[question.id] = resolveSkipResponse(question);
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
      <div className="w-full md:max-w-[95%] rounded-[1.5rem] border border-stone-200/35 bg-white/35 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.01)] backdrop-blur-md dark:border-stone-800/35 dark:bg-stone-900/35">
        <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400 select-none">
          {fallbackText || "Questions are not available for this message."}
        </p>
      </div>
    );
  }

  if (hasSubmitted) {
    const hasAnySubmittedAnswers = Object.keys(submittedResponses).length > 0;
    return (
      <div className="w-full md:max-w-[95%] space-y-4 select-none">
        <div className="rounded-[1.5rem] border border-stone-200/35 bg-white/35 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)] backdrop-blur-md dark:border-stone-800/35 dark:bg-stone-900/35">
          <h2 className="text-sm font-semibold tracking-tight text-stone-900 dark:text-stone-100">Questionnaire Completed</h2>
          <div className="space-y-4 text-xs text-stone-550 dark:text-stone-400 mt-2">
            <p>
              Thanks! Your full project questionnaire has already been submitted successfully.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                className="rounded-full px-4 h-8 border-stone-200/50 hover:bg-stone-100 dark:border-stone-800/50 dark:hover:bg-stone-900 text-[11px] font-semibold transition-all duration-300"
                onClick={() => setShowSubmittedDetails((v) => !v)}
                disabled={!hasAnySubmittedAnswers}
              >
                {showSubmittedDetails ? "Hide Answers" : "View Answers"}
              </Button>
              {!hasAnySubmittedAnswers ? (
                <p className="text-[10px] text-stone-500">
                  Answers are not available for this questionnaire.
                </p>
              ) : null}
            </div>

            {showSubmittedDetails && hasAnySubmittedAnswers ? (
              <Accordion type="single" collapsible className="pt-2">
                {questionSet.questions.map((question) => (
                  <AccordionItem key={question.id} value={question.id} className="border-b border-stone-200/20 dark:border-stone-850/20">
                    <AccordionTrigger className="text-[11px] hover:no-underline font-medium py-3 text-stone-700 dark:text-stone-300">
                      <span>{question.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-[11px] font-semibold text-teal-600 dark:text-teal-405 pb-3">
                      {formatResponse(submittedResponses[question.id])}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  const totalQuestions = questionSet.questions.length;
  const currentQuestion = questionSet.questions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const onSkipCurrent = async () => {
    const skipValue = resolveSkipResponse(currentQuestion);
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
        "w-full space-y-6 md:max-w-[95%] bg-white/35 dark:bg-stone-900/35 rounded-[1.5rem] border border-stone-200/35 dark:border-stone-800/35 transition-all text-stone-900 dark:text-stone-100 text-sm p-5 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)] backdrop-blur-md",
        submitting && "opacity-60",
      )}
      aria-busy={submitting}
    >
      <p className="font-medium text-xs tracking-wide uppercase text-stone-500 dark:text-stone-400 select-none">
        Project Requirement Questionnaire
      </p>
      <div className="space-y-4">
        <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 font-semibold select-none">
          <span>
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
          <span>
            {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}% complete
          </span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-stone-200/40 dark:bg-stone-800/40 select-none">
          <div
            className="h-full rounded-full bg-teal-500 dark:bg-teal-400 transition-all duration-500 ease-out"
            style={{
              width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
            }}
          />
        </div>

        <div key={currentQuestion.id} className="rounded-2xl border border-stone-200/20 bg-white/20 dark:border-stone-850/20 dark:bg-stone-950/10 p-5 space-y-4 shadow-2xs">
          <h3 className="text-sm font-semibold tracking-tight text-stone-850 dark:text-stone-150 leading-relaxed">
            {currentQuestion.question}
          </h3>

          <div className="space-y-4 pt-1">
            {currentQuestion.type === "single_select" && currentQuestion.options && (
              <div className="flex flex-wrap gap-2">
                {currentQuestion.options.map((opt) => {
                  const selected = effectiveResponses[currentQuestion.id] === opt;
                  return (
                    <Button
                      key={opt}
                      type="button"
                      variant={selected ? "default" : "outline"}
                      className={cn(
                        "rounded-full px-4 h-8.5 text-xs font-semibold active:scale-[0.98] transition-all cursor-pointer",
                        selected
                          ? "bg-stone-900 dark:bg-stone-50 hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-950 shadow-sm"
                          : "border-stone-200/50 hover:bg-stone-900/5 dark:border-stone-800/50 dark:hover:bg-white/5 text-stone-600 dark:text-stone-300"
                      )}
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
                      className={cn(
                        "rounded-full px-4 h-8.5 text-xs font-semibold active:scale-[0.98] transition-all cursor-pointer",
                        selected
                          ? "bg-stone-900 dark:bg-stone-50 hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-950 shadow-sm"
                          : "border-stone-200/50 hover:bg-stone-900/5 dark:border-stone-800/50 dark:hover:bg-white/5 text-stone-600 dark:text-stone-300"
                      )}
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
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            className="rounded-full px-4 text-xs font-semibold text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-900/5 dark:hover:bg-white/5 active:scale-[0.98] cursor-pointer"
            disabled={submitting}
            onClick={onSkipCurrent}
          >
            Skip
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="rounded-full px-4 text-xs font-semibold text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-900/5 dark:hover:bg-white/5 active:scale-[0.98] cursor-pointer"
            disabled={submitting}
            onClick={onSkipAll}
          >
            Skip All
          </Button>
        </div>

        <div className="flex items-center justify-between gap-2.5 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="rounded-full px-4 h-8.5 border-stone-200/50 hover:bg-stone-100 dark:border-stone-800/50 dark:hover:bg-stone-900 text-xs font-semibold active:scale-[0.98] cursor-pointer"
            disabled={submitting || isFirstQuestion}
            onClick={() =>
              setCurrentQuestionIndex((current) => Math.max(current - 1, 0))
            }
          >
            Previous
          </Button>

          {isLastQuestion ? (
            <Button 
              disabled={submitting} 
              onClick={onSubmit}
              className="rounded-full px-5 h-8.5 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-50 dark:text-stone-950 dark:hover:bg-stone-200 cursor-pointer shadow-sm active:scale-[0.97]"
            >
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
              className="rounded-full px-5 h-8.5 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-50 dark:text-stone-950 dark:hover:bg-stone-200 cursor-pointer shadow-sm active:scale-[0.97]"
            >
              Next Question
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
