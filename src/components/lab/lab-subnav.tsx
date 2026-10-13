"use client";

import { ModuleChips } from "@/components/os/os-subnav";
import { isLabActive, labModules } from "./modules";

/** R&D lab tabs for phones/tablets; desktop shows them in the sidebar. */
export function LabSubnav() {
  return <ModuleChips modules={labModules} isActive={isLabActive} label="R&D lab sections" />;
}
