import type { LucideIcon } from "lucide-react";
import type { UserRole } from "@/types";

export interface INavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  roles: UserRole[];
}
