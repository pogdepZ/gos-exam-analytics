import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReportsPage } from "./ReportsPage";
import { transformSubjectData, RawReportSubject } from "../utils/reports";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe("ReportsPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const renderWithClient = (ui: React.ReactElement) => {
    const queryClient = createTestQueryClient();
    return render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    );
  };

  describe("Data Transformation Logic (Unit)", () => {
    it("should transform raw subject data into chart data points correctly", () => {
      const mockSubject: RawReportSubject = {
        subject: "math",
        label: "Mathematics",
        levels: {
          GTE_8: 10,
          GTE_6_LT_8: 20,
          GTE_4_LT_6: 30,
          LT_4: 40,
        },
      };

      const transformed = transformSubjectData(mockSubject);
      expect(transformed).toEqual([
        { range: "score >= 8", count: 10 },
        { range: "6 <= score < 8", count: 20 },
        { range: "4 <= score < 6", count: 30 },
        { range: "score < 4", count: 40 },
      ]);
    });
  });

  describe("Component Rendering and States", () => {
    it("should render loading state initially", () => {
      vi.spyOn(window, "fetch").mockImplementation(
        () => new Promise(() => {}), // never resolves
      );

      renderWithClient(<ReportsPage />);
      expect(
        screen.getByText(/Calculating exam score distributions/i),
      ).toBeInTheDocument();
    });

    it("should render error card on API error", async () => {
      vi.spyOn(window, "fetch").mockResolvedValue(
        new Response(
          JSON.stringify({ error: { message: "Database query timeout" } }),
          { status: 500 },
        ),
      );

      renderWithClient(<ReportsPage />);

      expect(
        await screen.findByText("Failed to Load Reports"),
      ).toBeInTheDocument();
      expect(screen.getByText("Database query timeout")).toBeInTheDocument();
    });

    it("should render empty state when no reports are returned", async () => {
      vi.spyOn(window, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ data: [] }), { status: 200 }),
      );

      renderWithClient(<ReportsPage />);

      expect(await screen.findByText("No Data Available")).toBeInTheDocument();
    });

    it("should render charts and fallback table successfully on valid API response", async () => {
      const mockData: RawReportSubject[] = [
        {
          subject: "math",
          label: "Mathematics",
          levels: {
            GTE_8: 100,
            GTE_6_LT_8: 200,
            GTE_4_LT_6: 300,
            LT_4: 400,
          },
        },
        {
          subject: "physics",
          label: "Physics",
          levels: {
            GTE_8: 50,
            GTE_6_LT_8: 150,
            GTE_4_LT_6: 250,
            LT_4: 350,
          },
        },
      ];

      vi.spyOn(window, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ data: mockData }), { status: 200 }),
      );

      renderWithClient(<ReportsPage />);

      // Wait for rendering
      expect(
        await screen.findByText("2024 Score Distribution by Subject"),
      ).toBeInTheDocument();

      // Verify that subject headings are rendered
      expect(
        screen.getByRole("heading", { name: "Mathematics" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Physics" }),
      ).toBeInTheDocument();

      // Verify toggle options exist
      const tableToggle = screen.getByRole("button", {
        name: /View as Table/i,
      });
      expect(tableToggle).toBeInTheDocument();

      // Click table toggle to inspect table fallback
      fireEvent.click(tableToggle);

      // Verify table headers and values are visible
      expect(
        screen.getByRole("columnheader", { name: /Excellent/i }),
      ).toBeInTheDocument();
      expect(screen.getByText("100")).toBeInTheDocument();
      expect(screen.getByText("200")).toBeInTheDocument();
      expect(screen.getByText("300")).toBeInTheDocument();
      expect(screen.getByText("400")).toBeInTheDocument();
      expect(screen.getByText("50")).toBeInTheDocument();
    });
  });
});
