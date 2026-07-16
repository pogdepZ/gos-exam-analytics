import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Loader2, AlertCircle, BarChart3, Table } from "lucide-react";
import { useState } from "react";

import { transformSubjectData, RawReportSubject } from "../utils/reports";

const fetchScoreDistribution = async (): Promise<RawReportSubject[]> => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const response = await fetch(`${apiUrl}/api/reports/score-distribution`);
  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error?.message || "Failed to load report");
  }

  return json.data;
};

// Curated colors for each range: GTE_8 (emerald), GTE_6_LT_8 (blue), GTE_4_LT_6 (amber), LT_4 (rose)
const RANGE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#f43f5e"];

export const ReportsPage = () => {
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");

  const { data, error, isLoading, isError, refetch } = useQuery<
    RawReportSubject[],
    Error
  >({
    queryKey: ["scoreDistribution"],
    queryFn: fetchScoreDistribution,
  });

  if (isLoading) {
    return (
      <div className="reports-page text-center py-16 card">
        <Loader2 className="animate-spin spinner-large mx-auto mb-4" />
        <p>Calculating exam score distributions and statistical ranges...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="reports-page text-center py-16 card">
        <AlertCircle className="error-icon mx-auto mb-4" size={48} />
        <h3>Failed to Load Reports</h3>
        <p className="error-text mb-4">
          {error.message ||
            "An error occurred while fetching score statistics."}
        </p>
        <button onClick={() => refetch()} className="btn btn-primary mx-auto">
          Retry Loading
        </button>
      </div>
    );
  }

  const reports = data || [];

  if (reports.length === 0) {
    return (
      <div className="reports-page text-center py-16 card">
        <BarChart3 className="mx-auto mb-4 text-gray-500" size={48} />
        <h3>No Data Available</h3>
        <p className="text-gray-400">
          There are no exam results currently stored in the database.
        </p>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="reports-header flex justify-between items-center mb-6">
        <div>
          <h2>2024 Score Distribution by Subject</h2>
          <p>
            Statistical breakdown of scores grouped into key performance bands.
          </p>
        </div>
        <div className="toggle-container flex gap-2">
          <button
            onClick={() => setViewMode("chart")}
            className={`btn btn-toggle ${viewMode === "chart" ? "active" : ""}`}
            aria-label="View as Charts"
          >
            <BarChart3 size={16} />
            <span>Charts</span>
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`btn btn-toggle ${viewMode === "table" ? "active" : ""}`}
            aria-label="View as Table"
          >
            <Table size={16} />
            <span>Table Fallback</span>
          </button>
        </div>
      </div>

      {/* Accessible Table Fallback Mode */}
      {viewMode === "table" && (
        <div className="table-card card">
          <div className="table-responsive">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Excellent (score &gt;= 8.0)</th>
                  <th>Good (6.0 &lt;= score &lt; 8.0)</th>
                  <th>Average (4.0 &lt;= score &lt; 6.0)</th>
                  <th>Weak (score &lt; 4.0)</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.subject}>
                    <td className="font-bold">{report.label}</td>
                    <td>{report.levels.GTE_8.toLocaleString()}</td>
                    <td>{report.levels.GTE_6_LT_8.toLocaleString()}</td>
                    <td>{report.levels.GTE_4_LT_6.toLocaleString()}</td>
                    <td>{report.levels.LT_4.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recharts Mode */}
      {viewMode === "chart" && (
        <>
          {/* Legend and visual guide */}
          <div className="chart-legend-guide card flex flex-wrap gap-6 justify-center mb-6">
            <div className="legend-item flex items-center gap-2">
              <span
                className="color-dot"
                style={{ backgroundColor: "#10b981" }}
              />
              <span>Excellent (score &gt;= 8)</span>
            </div>
            <div className="legend-item flex items-center gap-2">
              <span
                className="color-dot"
                style={{ backgroundColor: "#3b82f6" }}
              />
              <span>Good (6 &lt;= score &lt; 8)</span>
            </div>
            <div className="legend-item flex items-center gap-2">
              <span
                className="color-dot"
                style={{ backgroundColor: "#f59e0b" }}
              />
              <span>Average (4 &lt;= score &lt; 6)</span>
            </div>
            <div className="legend-item flex items-center gap-2">
              <span
                className="color-dot"
                style={{ backgroundColor: "#f43f5e" }}
              />
              <span>Weak (score &lt; 4)</span>
            </div>
          </div>

          <div className="charts-grid">
            {reports.map((report) => {
              const chartData = transformSubjectData(report);
              return (
                <div key={report.subject} className="chart-card card">
                  <h3 className="chart-title mb-4">{report.label}</h3>
                  <div className="chart-container" style={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                          dataKey="range"
                          stroke="#94a3b8"
                          fontSize={11}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#94a3b8"
                          fontSize={11}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            borderColor: "#475569",
                            color: "#f8fafc",
                            borderRadius: "6px",
                          }}
                          formatter={(value: any) => [
                            Number(value).toLocaleString(),
                            "Students",
                          ]}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {chartData.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={RANGE_COLORS[index % RANGE_COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Screen Reader Table Fallback (always rendered but visually hidden if viewMode === 'chart' to satisfy absolute accessibility compliance) */}
      {viewMode === "chart" && (
        <div className="sr-only">
          <h3>Accessible Score Data Table</h3>
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>score &gt;= 8</th>
                <th>6 &lt;= score &lt; 8</th>
                <th>4 &lt;= score &lt; 6</th>
                <th>score &lt; 4</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.subject}>
                  <td>{report.label}</td>
                  <td>{report.levels.GTE_8}</td>
                  <td>{report.levels.GTE_6_LT_8}</td>
                  <td>{report.levels.GTE_4_LT_6}</td>
                  <td>{report.levels.LT_4}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
