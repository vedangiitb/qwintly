"use client";
import { useEffect } from "react";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const toggleCaptchaBadge = (show: boolean) => {
    const badge = document.getElementsByClassName("grecaptcha-badge")[0];
    if (badge && badge instanceof HTMLElement) {
      badge.style.visibility = show ? "visible" : "hidden";
    }
  };

  useEffect(() => {
    toggleCaptchaBadge(true);
    return () => toggleCaptchaBadge(false);
  }, []);

  return (
    <>
      <div className="show-recaptcha">{children}</div>;
    </>
  );
}
