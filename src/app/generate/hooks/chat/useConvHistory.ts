"use client";
import { useEffect, useState } from "react";

export const useConvHistory = () => {
  const [convHistory, setConvHistory] = useState<
    { role: string; parts: { text: string }[] }[]
  >([]);

  useEffect(() => {}, []);

  return { convHistory, setConvHistory };
};
