import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { Search, AlertCircle, CheckCircle2, User, Loader2 } from "lucide-react";

const searchSchema = z.object({
  registrationNumber: z
    .string()
    .min(1, "Registration number is required")
    .regex(/^\d+$/, "Registration number must contain only numbers")
    .min(6, "Must be at least 6 digits")
    .max(12, "Must be at most 12 digits"),
});

type SearchFormValues = z.infer<typeof searchSchema>;

interface ExamResult {
  registrationNumber: string;
  scores: Record<string, number | null>;
}

const fetchExamResult = async (regNum: string): Promise<ExamResult> => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const response = await fetch(`${apiUrl}/api/exam-results/${regNum}`);
  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error?.message || "Failed to fetch score");
  }

  return json.data;
};

// Map db fields to clean display labels
const subjectLabelMap: Record<string, string> = {
  math: "Mathematics",
  literature: "Literature",
  foreignLanguage: "Foreign Language",
  physics: "Physics",
  chemistry: "Chemistry",
  biology: "Biology",
  history: "History",
  geography: "Geography",
  civicEducation: "Civic Education",
};

export const SearchPage = () => {
  const [searchRegNum, setSearchRegNum] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      registrationNumber: "",
    },
  });

  const { data, error, isLoading, isError, refetch } = useQuery<
    ExamResult,
    Error
  >({
    queryKey: ["examResult", searchRegNum],
    queryFn: () => fetchExamResult(searchRegNum!),
    enabled: !!searchRegNum,
    retry: false,
  });

  const onSubmit = (values: SearchFormValues) => {
    // Normalise registration number by trimming
    const regNum = values.registrationNumber.trim();
    setSearchRegNum(regNum);
  };

  const getScoreClass = (score: number | null): string => {
    if (score === null) return "score-null";
    if (score >= 8) return "score-high";
    if (score >= 6) return "score-mid";
    if (score >= 4) return "score-pass";
    return "score-low";
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <h2>Vietnam National High School Exam 2024 Score Search</h2>
        <p>
          Enter your 8-digit registration number to check individual subject
          scores.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="search-form-container">
        <div className="form-group">
          <label htmlFor="regNumInput" className="sr-only">
            Registration Number
          </label>
          <div className="input-with-icon">
            <Search className="input-icon" />
            <input
              id="regNumInput"
              type="text"
              placeholder="e.g. 01000001"
              maxLength={12}
              {...register("registrationNumber")}
              disabled={isLoading}
              autoComplete="off"
            />
          </div>
          {errors.registrationNumber && (
            <span className="error-message">
              <AlertCircle size={14} />
              {errors.registrationNumber.message}
            </span>
          )}
        </div>

        <button type="submit" disabled={isLoading} className="btn btn-primary">
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Searching...
            </>
          ) : (
            "Search Scores"
          )}
        </button>
      </form>

      {/* Loading State */}
      {isLoading && (
        <div className="loading-card card">
          <Loader2 className="animate-spin spinner-large" />
          <p>Retrieving score record from the secure database...</p>
        </div>
      )}

      {/* Error/Not Found States */}
      {isError && (
        <div className="error-card card">
          <AlertCircle className="error-icon" size={48} />
          <h3>Result Not Found</h3>
          <p className="error-text">
            {error.message ||
              "No record matching that registration number was found."}
          </p>
          <button onClick={() => refetch()} className="btn btn-secondary mt-4">
            Try Again
          </button>
        </div>
      )}

      {/* Success Result Display */}
      {data && !isLoading && !isError && (
        <div className="result-card card">
          <div className="result-header">
            <div className="student-info">
              <div className="avatar">
                <User size={24} />
              </div>
              <div>
                <h3>Student SBD: {data.registrationNumber}</h3>
                <span className="badge badge-success">
                  <CheckCircle2 size={14} /> Verified Score Record
                </span>
              </div>
            </div>
          </div>

          <div className="scores-grid">
            {Object.entries(data.scores).map(([key, score]) => {
              const label = subjectLabelMap[key] || key;
              return (
                <div key={key} className="score-item">
                  <span className="score-subject">{label}</span>
                  <div className={`score-value-badge ${getScoreClass(score)}`}>
                    {score !== null && score !== undefined
                      ? score.toFixed(2)
                      : "N/A"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
