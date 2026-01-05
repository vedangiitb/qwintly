import { useState } from "react";

type Props = {
  questions: Question[];
  onChange?: (answers: Record<string, string | string[]>) => void;
};

export function Questionnaire({ questions, onChange }: Props) {
  const [answers, setAnswers] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    questions.forEach((q) => {
      if (q.answer_default) {
        initial[q.id] =
          q.type === "multi_select"
            ? [q.answer_default]
            : q.answer_default;
      }
    });
    return initial;
  });

  function updateAnswer(id: string, value: any) {
    const updated = { ...answers, [id]: value };
    setAnswers(updated);
    onChange?.(updated);
  }

  return (
    <div className="space-y-6">
      {questions.map((q) => (
        <div
          key={q.id}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <p className="mb-3 text-sm font-medium text-gray-900">
            {q.question}
          </p>

          {/* TEXT */}
          {q.type === "text" && (
            <input
              type="text"
              defaultValue={q.answer_default}
              onChange={(e) => updateAnswer(q.id, e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-black focus:outline-none"
              placeholder="Type your answer..."
            />
          )}

          {/* SINGLE SELECT */}
          {q.type === "single_select" && q.options && (
            <div className="flex flex-wrap gap-2">
              {q.options.map((opt) => {
                const selected = answers[q.id] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => updateAnswer(q.id, opt)}
                    className={`rounded-full px-4 py-1.5 text-sm transition
                      ${
                        selected
                          ? "bg-black text-white"
                          : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    {opt}
                  </button>
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
                  <button
                    key={opt}
                    onClick={() => {
                      const prev = answers[q.id] || [];
                      updateAnswer(
                        q.id,
                        selected
                          ? prev.filter((v: string) => v !== opt)
                          : [...prev, opt]
                      );
                    }}
                    className={`rounded-full px-4 py-1.5 text-sm transition
                      ${
                        selected
                          ? "bg-black text-white"
                          : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
