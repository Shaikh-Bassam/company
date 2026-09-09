import { useEffect } from "react";

export const LOADER_DONE_EVENT = "loader:done";

export function markLoaderDone(): void {
  document.documentElement.dataset.loaded = "true";
  window.dispatchEvent(new Event(LOADER_DONE_EVENT));
}

/** Runs `onDone` once the intro loader has finished (immediately if it already has). */
export function useLoaderDone(onDone: () => void): void {
  useEffect(() => {
    if (document.documentElement.dataset.loaded === "true") {
      onDone();
      return;
    }
    window.addEventListener(LOADER_DONE_EVENT, onDone, { once: true });
    return () => window.removeEventListener(LOADER_DONE_EVENT, onDone);
  }, [onDone]);
}
