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
    <section className="py-24 bg-slate-50/50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Powerful Features for Your Next Big Idea
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Everything you need to build, deploy, and scale your application without written a single line of code.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ${feature.color}`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
