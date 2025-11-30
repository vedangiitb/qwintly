// import { colorMap } from "@/components/generator/colorMap";
import { colorMap } from "@/utils/colorMap";

export const getRelColList = (initialStyles: GenStyles) => {
  const allPairs = [
    {
      color: colorMap[initialStyles?.color].button,
      muted: colorMap[initialStyles?.muted].button,
      col1: initialStyles?.color,
      col2: initialStyles?.muted,
    },
    { color: "bg-blue-500", muted: "bg-sky-300", col1: "blue", col2: "sky" },
    {
      color: "bg-indigo-500",
      muted: "bg-violet-300",
      col1: "indigo",
      col2: "violet",
    },
    {
      color: "bg-emerald-500",
      muted: "bg-green-300",
      col1: "emerald",
      col2: "green",
    },
    {
      color: "bg-orange-500",
      muted: "bg-amber-300",
      col1: "orange",
      col2: "amber",
    },
    {
      color: "bg-purple-500",
      muted: "bg-fuchsia-300",
      col1: "purple",
      col2: "fuchsia",
    },
    {
      color: "bg-teal-500",
      muted: "bg-cyan-300",
      col1: "teal",
      col2: "cyan",
    },
    {
      color: "bg-gray-700",
      muted: colorMap[initialStyles?.muted],
      col1: "black",
      col2: initialStyles?.muted,
    },
    {
      color: "bg-zinc-500",
      muted: "bg-gray-300",
      col1: "zinc",
      col2: "gray",
    },
    {
      color: "bg-white",
      muted: "bg-gray-700",
      col1: "black",
      col2: "black",
    },
  ];

  return allPairs;
};

export const getFontsList = () => {
  return [
    { primary: "montserrat", body: "inter" }, // Modern / SaaS / Clean
    { primary: "handlee", body: "handlee" }, // Playful / Casual
    { primary: "libre-baskerville", body: "georgia" }, // Editorial / Traditional
    { primary: "work-sans", body: "work-sans" }, // Minimalist
    { primary: "arial-black", body: "system-ui" }, // Brutalist
    { primary: "courier", body: "georgia" }, // Vintage / Retro
    { primary: "segoe-ui", body: "roboto" }, // Corporate / Professional
    { primary: "playfair-display", body: "lora" }, // Luxury / Elegant
    { primary: "nunito-sans", body: "open-sans" }, // Friendly / Humanist
    { primary: "orbitron", body: "roboto-mono" }, // Tech / Futuristic
  ];
};
