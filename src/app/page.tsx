"use client";
import NavBar from "@/components/layouts/navbar/navbar";
import SideBar from "@/components/layouts/sidebar/sidebar";
import ChatBox from "./generate/components/chat/ChatBox";
import { useInitConv } from "./generate/hooks/useInitConv";
import { useAuth } from "./login/hooks/AuthContext";
import { useEffect, useState } from "react";

export default function Home() {
  const { user } = useAuth();
  const [showSidebar, setShowSidebar] = useState(false);

  const { initiateConversation, loading, prompt, setPrompt } = useInitConv();

  useEffect(() => {
    if (showSidebar) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [showSidebar]);

  return (
    <div className="h-screen text-foreground flex">
      <SideBar
        sidebarExpanded={showSidebar}
        setSidebarExpanded={setShowSidebar}
      />

      <div className="w-full flex flex-col h-screen">
        <main className="flex-1 relative overflow-hidden">
          <NavBar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
          <div className="h-[calc(100vh-5rem)] relative z-10 flex flex-col items-center justify-center px-4 py-4 md:py-12 text-center gap-10 md:gap-12">
            <h1 className="relative text-4xl md:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-tr dark:from-teal-200 dark:via-purple-300 dark:to-pink-400 from-teal-500 via-purple-600 to-pink-600  drop-shadow-2xl animate-fadein-smooth">
              <span className="block mb-2 animate-gradient-move">
                Build Your Dream Website
              </span>
              <span className="block text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br dark:from-white dark:via-purple-100 dark:to-cyan-200 opacity-90 from-slate-700 via-purple-600 to-cyan-600">
                in Just a Few Clicks
              </span>
              <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-2/3 h-8 bg-gradient-to-r from-purple-300 via-transparent to-cyan-200 blur-2xl opacity-60 pointer-events-none"></span>
            </h1>
            <p className="text-base md:text-xl dark:text-slate-200/90 text-slate-800/90 font-medium leading-relaxed max-w-xl mx-auto drop-shadow-lg">
              Describe your website idea and let{" "}
              <span className="font-semibold dark:text-teal-300 text-teal-500">
                Qwintly
              </span>{" "}
              turn it into reality with the power of AI.
              <br className="hidden md:block" />
              <span className="dark:text-white text-gray-800 font-semibold">
                It’s truly that simple.
              </span>
            </p>

            <div className="w-full max-w-2xl mx-auto">
              <ChatBox
                prompt={prompt}
                submitPrompt={initiateConversation}
                setPrompt={setPrompt}
                isResponseLoading={loading}
              />
              {!user?.uid ? (
                <p className="mt-4 text-slate-400 text-xs opacity-90 select-none">
                  🚀 <b>No pricing setup needed</b> to try the demo — sign in to
                  save your progress &amp; unlock full features!
                </p>
              ) : null}
            </div>
          </div>
        </main>
      </div>

      <style jsx global>{`
        .animate-bg-flow {
          background-size: 250% 250%;
          animation: bgflow 14s linear infinite alternate;
        }
        @keyframes bgflow {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 100% 100%;
          }
        }
        .animate-gradient-move {
          background-size: 200% 200%;
          animation: gradmove 4s ease-in-out infinite alternate;
        }
        @keyframes gradmove {
          0% {
            background-position: 0% 60%;
          }
          100% {
            background-position: 100% 50%;
          }
        }
        .animate-fadein-smooth {
          animation: fadein-landing 1.2s cubic-bezier(0.33, 1.61, 0.63, 1) both;
        }
        @keyframes fadein-landing {
          0% {
            opacity: 0;
            transform: translateY(36px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .glassmorphism-card {
          box-shadow: 0 12px 60px 0 rgba(68, 0, 170, 0.11);
          backdrop-filter: blur(24px);
        }
      `}</style>
    </div>
  );
}
