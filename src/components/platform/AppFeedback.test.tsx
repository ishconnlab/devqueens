import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppFeedbackProvider } from "./AppFeedback";
import { useAppFeedback } from "./AppFeedbackContext";

function FeedbackActions() {
  const { confirm, notify } = useAppFeedback();
  const [decision, setDecision] = useState("");
  return <>
    <button onClick={() => notify("Profile link copied.")}>Show notification</button>
    <button onClick={() => void confirm({ title: "Delete this item?", message: "This cannot be undone.", confirmLabel: "Delete", destructive: true }).then((accepted) => setDecision(accepted ? "accepted" : "cancelled"))}>Ask for confirmation</button>
    <output>{decision}</output>
  </>;
}

describe("AppFeedbackProvider", () => {
  it("shows popup notifications and resolves confirmation through a branded dialog", async () => {
    render(<AppFeedbackProvider><FeedbackActions /></AppFeedbackProvider>);

    fireEvent.click(screen.getByRole("button", { name: "Show notification" }));
    expect(screen.getByText("Profile link copied.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Ask for confirmation" }));
    expect(screen.getByRole("dialog", { name: "Delete this item?" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(screen.getByText("accepted")).toBeInTheDocument());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
