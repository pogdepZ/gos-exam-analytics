import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RankingsPage } from "./RankingsPage";
import type { GroupARanking } from "./RankingsPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe("RankingsPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const renderWithClient = (ui: React.ReactElement) => {
    const queryClient = createTestQueryClient();
    return render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    );
  };

  it("should render loading state initially", () => {
    vi.spyOn(window, "fetch").mockImplementation(
      () => new Promise(() => {}), // never resolves
    );

    renderWithClient(<RankingsPage />);
    expect(
      screen.getByText(
        /Compiling database records and calculating student rankings/i,
      ),
    ).toBeInTheDocument();
  });

  it("should render error card on API error", async () => {
    vi.spyOn(window, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: { message: "Database failed" } }), {
        status: 500,
      }),
    );

    renderWithClient(<RankingsPage />);

    expect(
      await screen.findByText("Failed to Load Rankings"),
    ).toBeInTheDocument();
    expect(screen.getByText("Database failed")).toBeInTheDocument();
  });

  it("should render empty state when no students are returned", async () => {
    vi.spyOn(window, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), { status: 200 }),
    );

    renderWithClient(<RankingsPage />);

    expect(
      await screen.findByText("No Student Rankings Found"),
    ).toBeInTheDocument();
  });

  it("should render rankings list and highlight top 3 successfully on valid API response", async () => {
    const mockData: GroupARanking[] = [
      {
        registrationNumber: "01000001",
        totalScore: 29.5,
        scores: { math: 10.0, physics: 9.75, chemistry: 9.75 },
      },
      {
        registrationNumber: "01000002",
        totalScore: 28.5,
        scores: { math: 9.5, physics: 9.5, chemistry: 9.5 },
      },
      {
        registrationNumber: "01000003",
        totalScore: 27.5,
        scores: { math: 9.0, physics: 9.5, chemistry: 9.0 },
      },
      {
        registrationNumber: "01000004",
        totalScore: 26.5,
        scores: { math: 8.5, physics: 9.0, chemistry: 9.0 },
      },
    ];

    vi.spyOn(window, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: mockData }), { status: 200 }),
    );

    renderWithClient(<RankingsPage />);

    // Wait for rendering
    expect(
      await screen.findByText("Group A Top 10 Student Rankings"),
    ).toBeInTheDocument();

    // Verify SBDs and ranks
    expect(screen.getByText("01000001")).toBeInTheDocument();
    expect(screen.getByText("01000002")).toBeInTheDocument();
    expect(screen.getByText("01000003")).toBeInTheDocument();
    expect(screen.getByText("01000004")).toBeInTheDocument();

    // Verify top rank badges
    expect(screen.getByText("1st")).toBeInTheDocument();
    expect(screen.getByText("2nd")).toBeInTheDocument();
    expect(screen.getByText("3rd")).toBeInTheDocument();
    expect(screen.getByText("4th")).toBeInTheDocument();

    expect(screen.getByText("29.50")).toBeInTheDocument();
    expect(screen.getAllByText("9.75")).toHaveLength(2);
    expect(screen.getByText("10.00")).toBeInTheDocument();
  });
});
