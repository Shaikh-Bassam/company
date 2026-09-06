export function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-surface-2 px-3 py-1 text-xs text-muted">{children}</span>;
}
