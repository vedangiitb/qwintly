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
        <div className="hidden lg:block absolute top-1/2 left-0 w-full h-[1px] bg-stone-200/30 dark:bg-stone-800/35 -translate-y-1/2 -z-10" />

        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="group flex flex-col items-center text-center">
              <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-stone-200/40 bg-white/45 shadow-[0_4px_20px_rgba(0,0,0,0.01)] backdrop-blur-md transition-all duration-500 ease-out group-hover:border-teal-500/80 group-hover:scale-105 dark:border-stone-800/40 dark:bg-stone-900/45 dark:shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                <span className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white shadow-xs dark:bg-teal-400 dark:text-stone-950">
                  {index + 1}
                </span>
                <step.icon className="h-6 w-6 text-stone-700 dark:text-stone-200 transition-all duration-500 group-hover:scale-110" />
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-50 select-none">
                {step.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-stone-600 dark:text-stone-300 select-none">
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
