"use client";

import { usePathname } from "next/navigation";
import NavBar from "./navbar";

export default function NavBarWrapper() {
  const pathName = usePathname();
  if (pathName == "/") return null;
  else return <NavBar showSidebar={false} />;
}
