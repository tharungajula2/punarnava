// Remounts on every navigation inside /os, so each page fades in (CSS, respects reduced motion).
export default function OsTemplate({ children }: { children: React.ReactNode }) {
  return <div className="os-page">{children}</div>;
}
