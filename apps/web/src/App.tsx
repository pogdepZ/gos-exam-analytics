import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "./components/Layout";
import { SearchPage } from "./pages/SearchPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// Placeholder components to ensure builds and routers resolve before subsequent features are added
const ReportsPlaceholder = () => (
  <div className="card text-center p-8">
    <h2 className="text-xl font-bold mb-2">Score Distribution Reports</h2>
    <p className="text-gray-400">Feature coming soon...</p>
  </div>
);

const RankingsPlaceholder = () => (
  <div className="card text-center p-8">
    <h2 className="text-xl font-bold mb-2">Top 10 Group A Student Rankings</h2>
    <p className="text-gray-400">Feature coming soon...</p>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<SearchPage />} />
            <Route path="reports" element={<ReportsPlaceholder />} />
            <Route path="rankings" element={<RankingsPlaceholder />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
