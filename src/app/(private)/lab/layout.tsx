import { LabSubnav } from "@/components/lab/lab-subnav";

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LabSubnav />
      {children}
    </>
  );
}
