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
    <section className="py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Three simple steps to go from concept to live application.
          </p>
        </div>

        <div className="relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 -z-10" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center mb-6 shadow-lg group-hover:border-teal-500 transition-colors duration-300 relative">
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-teal-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {index + 1}
                  </span>
                  <step.icon className="w-8 h-8 text-slate-700 dark:text-slate-300" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
