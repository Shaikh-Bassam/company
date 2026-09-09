import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { LOADER_DONE_EVENT, markLoaderDone, useLoaderDone } from "@/lib/loader-events";

function Probe({ cb }: { cb: () => void }) {
  useLoaderDone(cb);
  return null;
}

describe("useLoaderDone", () => {
  afterEach(() => {
    delete document.documentElement.dataset.loaded;
  });

  it("fires when the loader event is dispatched", () => {
    const cb = vi.fn();
    render(<Probe cb={cb} />);
    expect(cb).not.toHaveBeenCalled();
    window.dispatchEvent(new Event(LOADER_DONE_EVENT));
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("fires immediately if the loader already finished", () => {
    markLoaderDone();
    const cb = vi.fn();
    render(<Probe cb={cb} />);
    expect(cb).toHaveBeenCalledTimes(1);
  });
});
