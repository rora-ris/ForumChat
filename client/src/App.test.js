import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders forum chat title", () => {
  render(<App />);
  const titleElement = screen.getByText(/forum chat/i);
  expect(titleElement).toBeInTheDocument();
});
