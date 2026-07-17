import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Search,
  BarChart3,
  Trophy,
  GraduationCap,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Score Lookup", icon: Search },
  { to: "/reports", label: "Score Distribution", icon: BarChart3 },
  { to: "/rankings", label: "Group A Rankings", icon: Trophy },
];

export const Layout = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close sidebar whenever route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isActive = (path: string) =>
    location.pathname === path ? "active" : "";

  return (
    <div className="layout">
      {/* ── Top Navbar ── */}
      <header className="navbar">
        <div className="logo-section">
          <GraduationCap className="logo-icon" size={28} />
          <span className="brand-name">GOS Exam Analytics</span>
        </div>

        {/* Desktop nav */}
        <nav className="nav-links">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className={`nav-item ${isActive(to)}`}>
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="hamburger-btn"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* ── Mobile Sidebar Overlay ── */}
      <div
        className={`sidebar-overlay ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* ── Mobile Sidebar Drawer ── */}
      <aside className={`mobile-sidebar ${menuOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <GraduationCap size={24} className="logo-icon" />
          <span className="brand-name">GOS Exam</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`sidebar-nav-item ${isActive(to)}`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <p className="sidebar-footer">Vietnam THPT Exam 2024</p>
      </aside>

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
