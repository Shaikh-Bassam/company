type Scroller = { scrollTo: (target: HTMLElement, options?: { offset?: number }) => void };

let scroller: Scroller | null = null;

export function registerScroller(s: Scroller | null): void {
  scroller = s;
}

export function scrollToId(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  if (scroller) scroller.scrollTo(el, { offset: -96 });
  else el.scrollIntoView?.({ behavior: "smooth", block: "start" });
}
