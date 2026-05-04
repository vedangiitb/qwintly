"use client";

import React from "react";
import { MessageSquare, Cpu,Globe } from "lucide-react";

const steps = [
  {
    title: "Describe",
    description: "Type in what you want to build. From a simple to-do list to a complex CRM.",
    icon: MessageSquare,
  },
  {
    title: "Generate",
    description: "Our AI brain architecturally designs and writes the code for your application in real-time.",
    icon: Cpu,
  },
  {
    title: "Deploy",
    description: "Instantly preview your app and deploy it to a live URL with a single click.",
    icon: Globe,
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section className="border-t border-stone-200/70 pt-16 dark:border-stone-800/70">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-5xl dark:text-stone-50">
          How It Works
        </h2>
        <p className="mt-4 text-sm leading-7 text-stone-600 dark:text-stone-300">
          Three simple steps to go from concept to live application.
        </p>
      </div>

      <div className="relative">
        <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px bg-stone-200/90 dark:bg-stone-800/90 -translate-y-1/2 -z-10" />

        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="group flex flex-col items-center text-center">
              <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-stone-200/80 bg-white/65 shadow-sm backdrop-blur-sm transition-colors duration-300 group-hover:border-teal-500 dark:border-stone-800/70 dark:bg-stone-950/25">
                <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white dark:bg-teal-400 dark:text-stone-950">
                  {index + 1}
                </span>
                <step.icon className="h-8 w-8 text-stone-700 dark:text-stone-200" />
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-300">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
