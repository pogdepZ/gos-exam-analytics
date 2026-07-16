import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle, Trophy, Medal } from "lucide-react";

export interface GroupARanking {
  registrationNumber: string;
  totalScore: number;
  scores: {
    math: number;
    physics: number;
    chemistry: number;
  };
}

const fetchRankings = async (): Promise<GroupARanking[]> => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const response = await fetch(`${apiUrl}/api/rankings/group-a?limit=10`);
  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error?.message || "Failed to load rankings");
  }

  return json.data;
};

export const RankingsPage = () => {
  const { data, error, isLoading, isError, refetch } = useQuery<
    GroupARanking[],
    Error
  >({
    queryKey: ["rankingsGroupA"],
    queryFn: fetchRankings,
  });

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return (
          <span className="rank-badge gold flex items-center gap-1 justify-center">
            <Trophy size={14} className="text-yellow-400" />
            <span>1st</span>
          </span>
        );
      case 1:
        return (
          <span className="rank-badge silver flex items-center gap-1 justify-center">
            <Medal size={14} className="text-gray-300" />
            <span>2nd</span>
          </span>
        );
      case 2:
        return (
          <span className="rank-badge bronze flex items-center gap-1 justify-center">
            <Medal size={14} className="text-amber-600" />
            <span>3rd</span>
          </span>
        );
      default:
        return <span className="rank-badge standard">{index + 1}th</span>;
    }
  };

  const getRankRowClass = (index: number): string => {
    if (index === 0) return "row-rank-1";
    if (index === 1) return "row-rank-2";
    if (index === 2) return "row-rank-3";
    return "";
  };

  if (isLoading) {
    return (
      <div className="rankings-page text-center py-16 card">
        <Loader2 className="animate-spin spinner-large mx-auto mb-4" />
        <p>Compiling database records and calculating student rankings...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rankings-page text-center py-16 card">
        <AlertCircle className="error-icon mx-auto mb-4" size={48} />
        <h3>Failed to Load Rankings</h3>
        <p className="error-text mb-4">
          {error.message || "An error occurred while loading rankings."}
        </p>
        <button onClick={() => refetch()} className="btn btn-primary mx-auto">
          Retry Loading
        </button>
      </div>
    );
  }

  const rankings = data || [];

  if (rankings.length === 0) {
    return (
      <div className="rankings-page text-center py-16 card">
        <Trophy className="mx-auto mb-4 text-gray-500" size={48} />
        <h3>No Student Rankings Found</h3>
        <p className="text-gray-400">
          There are no eligible student score records to compute rankings.
        </p>
      </div>
    );
  }

  return (
    <div className="rankings-page">
      <div className="rankings-header mb-6">
        <h2>Group A Top 10 Student Rankings</h2>
        <p>
          Students with the highest combined scores of Mathematics, Physics, and
          Chemistry.
        </p>
      </div>

      <div className="table-card card">
        <div className="table-responsive">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>SBD</th>
                <th>Math</th>
                <th>Physics</th>
                <th>Chemistry</th>
                <th>Total score</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((student, index) => (
                <tr
                  key={student.registrationNumber}
                  className={getRankRowClass(index)}
                >
                  <td>{getRankBadge(index)}</td>
                  <td className="font-bold font-mono">
                    {student.registrationNumber}
                  </td>
                  <td>{student.scores.math.toFixed(2)}</td>
                  <td>{student.scores.physics.toFixed(2)}</td>
                  <td>{student.scores.chemistry.toFixed(2)}</td>
                  <td className="font-bold text-accent">
                    {student.totalScore.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
