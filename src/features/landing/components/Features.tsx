"use client";

import React from "react";
import { Zap, Shield, Code, Rocket, Layout, Cpu } from "lucide-react";

const features = [
  {
    title: "Instant Generation",
    description: "Go from idea to live application in less than 60 seconds. Our AI handles the heavy lifting.",
    icon: Zap,
    color: "text-amber-500",
  },
  {
    title: "Zero Code Needed",
    description: "No technical knowledge required. If you can describe it, Qwintly can build it.",
    icon: Code,
    color: "text-blue-500",
  },
  {
    title: "Production Ready",
    description: "Get clean, maintainable code using modern frameworks like Next.js and Tailwind CSS.",
    icon: Rocket,
    color: "text-purple-500",
  },
  {
    title: "Secure by Design",
    description: "Built-in best practices for security and performance come standard with every app.",
    icon: Shield,
    color: "text-teal-500",
  },
  {
    title: "Responsive Layouts",
    description: "Your apps look perfect on everything from mobile phones to high-res desktops.",
    icon: Layout,
    color: "text-pink-500",
  },
  {
    title: "Intelligent Logic",
    description: "AI-driven logic generation that understands your business requirements automatically.",
    icon: Cpu,
    color: "text-indigo-500",
  },
];

export const Features: React.FC = () => {
  return (
    <section className="border-t border-stone-200/70 pt-16 dark:border-stone-800/70">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-5xl dark:text-stone-50">
          Powerful Features for Your Next Big Idea
        </h2>
        <p className="mt-4 text-sm leading-7 text-stone-600 dark:text-stone-300">
          Everything you need to build, deploy, and scale your application
          without writing a single line of code.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group rounded-[2rem] border border-stone-200/30 bg-white/35 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.01)] transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.03)] dark:border-stone-800/30 dark:bg-stone-900/35 dark:shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.18)]"
          >
            <div
              className={`mb-6 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/60 bg-white/65 shadow-xs backdrop-blur-md transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-3 dark:border-stone-800/60 dark:bg-stone-900/65 ${feature.color}`}
            >
              <feature.icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-50 select-none">
              {feature.title}
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-stone-600 dark:text-stone-300/90 select-none">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
