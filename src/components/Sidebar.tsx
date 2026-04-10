import React from "react";
import type { HistoryItem } from "../types";
import "./Sidebar.css";

interface SidebarProps {
  history: HistoryItem[];
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
  onHistoryClick: (item: HistoryItem) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  history,
  darkMode,
  setDarkMode,
  onHistoryClick,
}) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-card theme-card">
        <h3>Toetry ny fampisehoana</h3>
        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "☀️ Mazava" : "🌙 Maizina"}
        </button>
      </div>

      <div className="history-section">
        <h2>Novakianao farany</h2>
        {history.length === 0 ? (
          <div className="sidebar-card empty-history">
            <p>Tsy mbola nisy vakiteny.</p>
          </div>
        ) : (
          <div className="history-list">
            {history.map((item, index) => (
              <div
                key={index}
                className="history-card"
                onClick={() => onHistoryClick(item)}
              >
                <div className="history-dot"></div>
                <div className="history-book">{item.bookName}</div>
                <div className="history-chapter">{item.chapterNumber}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
