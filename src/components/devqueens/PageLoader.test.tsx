import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PageLoader from "./PageLoader";

describe("PageLoader", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("never shows the Render wake-up message", () => {
    vi.useFakeTimers();
    render(<PageLoader />);

    act(() => vi.advanceTimersByTime(9000));

    expect(screen.queryByText(/Render’s free plan/)).not.toBeInTheDocument();
  });
});
