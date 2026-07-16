import { Link, Outlet, useLocation } from "react-router-dom";
import { Search, BarChart3, Trophy, GraduationCap } from "lucide-react";

export const Layout = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <div className="layout">
      <header className="navbar">
        <div className="logo-section">
          <GraduationCap className="logo-icon" size={28} />
          <span className="brand-name">GOS Exam Analytics</span>
        </div>
        <nav className="nav-links">
          <Link to="/" className={`nav-item ${isActive("/")}`}>
            <Search size={18} />
            <span>Score Lookup</span>
          </Link>
          <Link to="/reports" className={`nav-item ${isActive("/reports")}`}>
            <BarChart3 size={18} />
            <span>Score Distribution</span>
          </Link>
          <Link to="/rankings" className={`nav-item ${isActive("/rankings")}`}>
            <Trophy size={18} />
            <span>Group A Rankings</span>
          </Link>
        </nav>
      </header>
      <main className="content-container">
        <Outlet />
      </main>
      <footer className="footer">
        <p>
          © 2026 GOS Exam Analytics. Vietnam National High School Exam 2024
          Score Analysis.
        </p>
      </footer>
    </div>
  );
};
