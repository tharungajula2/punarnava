import { OsShell } from "@/components/os-shell/os-shell";

export default function OsLayout({ children }: { children: React.ReactNode }) {
  return <OsShell>{children}</OsShell>;
}
