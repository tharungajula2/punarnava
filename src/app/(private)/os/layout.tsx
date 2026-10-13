import { OsSubnav } from "@/components/os/os-subnav";

export default function OsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OsSubnav />
      {children}
    </>
  );
}
