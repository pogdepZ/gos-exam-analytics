import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SearchPage } from "./SearchPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe("SearchPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const renderWithClient = (ui: React.ReactElement) => {
    const queryClient = createTestQueryClient();
    return render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    );
  };

  it("should render search form correctly initially", () => {
    renderWithClient(<SearchPage />);

    expect(screen.getByPlaceholderText("e.g. 01000001")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Search Scores/i }),
    ).toBeInTheDocument();
  });

  it("should display error message on invalid input", async () => {
    renderWithClient(<SearchPage />);
    const input = screen.getByPlaceholderText("e.g. 01000001");
    const button = screen.getByRole("button", { name: /Search Scores/i });

    // Submit empty input
    fireEvent.click(button);
    expect(
      await screen.findByText(/Registration number is required/i),
    ).toBeInTheDocument();

    // Submit invalid format (characters)
    fireEvent.change(input, { target: { value: "0100000A" } });
    fireEvent.click(button);
    expect(
      await screen.findByText(/Registration number must contain only numbers/i),
    ).toBeInTheDocument();

    // Submit too short
    fireEvent.change(input, { target: { value: "123" } });
    fireEvent.click(button);
    expect(
      await screen.findByText(/Must be at least 6 digits/i),
    ).toBeInTheDocument();
  });

  it("should render loading state and disable submit button during score fetching", async () => {
    // Delay fetch to test loading state
    const fetchSpy = vi.spyOn(window, "fetch").mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve(
                new Response(
                  JSON.stringify({
                    data: { registrationNumber: "01000001", scores: {} },
                  }),
                  { status: 200 },
                ),
              ),
            100,
          ),
        ),
    );

    renderWithClient(<SearchPage />);
    const input = screen.getByPlaceholderText("e.g. 01000001");
    const button = screen.getByRole("button", { name: /Search Scores/i });

    fireEvent.change(input, { target: { value: "01000001" } });
    fireEvent.click(button);

    // Wait for validation and loading state to trigger asynchronously
    const loadingText = await screen.findByText(/Retrieving score record/i);
    expect(loadingText).toBeInTheDocument();

    // Verify duplicate submission prevention: button is disabled
    expect(button).toBeDisabled();

    // Wait for resolve
    await waitFor(() => {
      expect(
        screen.queryByText(/Retrieving score record/i),
      ).not.toBeInTheDocument();
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("should display result successfully on valid search", async () => {
    const mockData = {
      registrationNumber: "01000001",
      scores: {
        math: 8.4,
        literature: null,
        physics: 6.0,
      },
    };

    vi.spyOn(window, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: mockData }), { status: 200 }),
    );

    renderWithClient(<SearchPage />);
    const input = screen.getByPlaceholderText("e.g. 01000001");
    const button = screen.getByRole("button", { name: /Search Scores/i });

    fireEvent.change(input, { target: { value: "01000001" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Student SBD: 01000001")).toBeInTheDocument();
      // Math score
      expect(screen.getByText("8.40")).toBeInTheDocument();
      // Null Literature score should be represented as N/A
      expect(screen.getByText("N/A")).toBeInTheDocument();
      // Physics score
      expect(screen.getByText("6.00")).toBeInTheDocument();
    });
  });

  it("should display not found alert on 404 response", async () => {
    const mockError = {
      error: {
        code: "EXAM_RESULT_NOT_FOUND",
        message: "No score record matches this registration number",
      },
    };

    vi.spyOn(window, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockError), { status: 404 }),
    );

    renderWithClient(<SearchPage />);
    const input = screen.getByPlaceholderText("e.g. 01000001");
    const button = screen.getByRole("button", { name: /Search Scores/i });

    fireEvent.change(input, { target: { value: "99999999" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Result Not Found")).toBeInTheDocument();
      expect(
        screen.getByText("No score record matches this registration number"),
      ).toBeInTheDocument();
    });
  });

  it("should allow form submission using Enter key", async () => {
    const fetchSpy = vi.spyOn(window, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: { registrationNumber: "01000001", scores: {} },
        }),
        { status: 200 },
      ),
    );

    renderWithClient(<SearchPage />);
    const input = screen.getByPlaceholderText("e.g. 01000001");

    fireEvent.change(input, { target: { value: "01000001" } });
    fireEvent.submit(input); // Submit form directly

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalled();
    });
  });
});
