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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group rounded-3xl border border-stone-200/80 bg-white/55 p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md dark:border-stone-800/70 dark:bg-stone-950/30"
          >
            <div
              className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/70 bg-white/70 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 dark:border-stone-800/70 dark:bg-stone-900/60 ${feature.color}`}
            >
              <feature.icon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-50">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm leading-7 text-stone-600 dark:text-stone-300">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
