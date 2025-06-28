import React from "react";

// PUBLIC_INTERFACE
function Sidebar({ theme, onThemeToggle, currentUser, onLogout, data, isAuthenticated }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="app-title">Tic Tac Toe</h1>
        <button
          className="theme-toggle"
          onClick={onThemeToggle}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </div>
      <div className="sidebar-user">
        {isAuthenticated && currentUser ? (
          <>
            <div className="user-info">
              <span>👤 {currentUser.username}</span>
            </div>
            <button className="btn btn-small" style={{ marginTop: 6 }} onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <span style={{ color: "#888" }}>Not signed in</span>
        )}
      </div>
      <div className="sidebar-section">
        <h4>Recent Games</h4>
        <ul className="history-list">
          {(data.recentGames || []).slice(0, 10).map((g) => (
            <li key={g.id} title={`Game ${g.id}`}>
              <div>
                <span>{g.playerX} vs {g.playerO || <em>?</em>}</span>
                {g.winner
                  ? <span className="history-result">Result: {g.winner === "draw" ? "Draw" : g.winner + " won"}</span>
                  : <span className="history-result">Ongoing</span>
                }
              </div>
            </li>
          ))}
        </ul>
      </div>
      <footer className="sidebar-footer">
        <span style={{ fontSize: 12, color: "#aaa" }}>
          &copy; {new Date().getFullYear()} TicTacToe Fullstack
        </span>
      </footer>
    </aside>
  );
}

export default Sidebar;
