import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Node-environment test files (`// @vitest-environment node`) have no window.
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Unmount rendered trees between tests (RTL only auto-registers this with `globals: true`).
  afterEach(cleanup);
}
