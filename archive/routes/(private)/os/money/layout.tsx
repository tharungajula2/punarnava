import { SectionTabs } from "@/components/os-shell/section-tabs";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SectionTabs id="money" />
      {children}
    </>
  );
}
