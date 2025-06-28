import React, { useState, useEffect } from "react";
import "./App.css";
import AuthScreen from "./components/AuthScreen";
import GameScreen from "./components/GameScreen";
import { getStoredToken, removeStoredToken } from "./utils/token";
import Sidebar from "./components/Sidebar";
import ApiService from "./services/ApiService";
import WebSocketService from "./services/WebSocketService";

// PUBLIC_INTERFACE
function App() {
  // Manage dark/light theme + user session, global loading/error states
  const [theme, setTheme] = useState("light");
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
    token: null
  });
  const [globalError, setGlobalError] = useState("");
  const [sidebarData, setSidebarData] = useState({ recentGames: [] });
  const [wsService, setWsService] = useState(null);

  // Theme effect
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // On load, check local token
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      ApiService.setToken(token);
      ApiService.getProfile()
        .then((resp) => {
          setAuth({
            isAuthenticated: true,
            user: resp.user,
            token
          });
        })
        .catch(() => {
          // Invalid token
          removeStoredToken();
          setAuth({
            isAuthenticated: false,
            user: null,
            token: null
          });
        });
    }
  }, []);

  // Sidebar data fetch
  useEffect(() => {
    if (auth.isAuthenticated) {
      ApiService.getRecentGames()
        .then((games) => setSidebarData({ recentGames: games }))
        .catch(() => setSidebarData({ recentGames: [] }));
    }
  }, [auth]);

  // WebSocket manager for real-time
  useEffect(() => {
    let ws = null;
    if (auth.isAuthenticated) {
      ws = new WebSocketService(auth.token);
      setWsService(ws);
    }
    return () => {
      if (ws) ws.close();
    }
  }, [auth]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  // PUBLIC_INTERFACE
  const handleLogout = () => {
    setAuth({
      isAuthenticated: false,
      user: null,
      token: null
    });
    removeStoredToken();
    ApiService.setToken(null);
    setSidebarData({ recentGames: [] });
  };

  return (
    <div className="App" style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar
        theme={theme}
        onThemeToggle={toggleTheme}
        currentUser={auth.user}
        onLogout={handleLogout}
        data={sidebarData}
        isAuthenticated={auth.isAuthenticated}
      />
      <div className="main-content">
        <header className="App-header">
          {globalError && <div className="error-banner">{globalError}</div>}
          {auth.isAuthenticated ? (
            <GameScreen
              currentUser={auth.user}
              wsService={wsService}
              apiService={ApiService}
              sidebarRefresh={() => {
                // Refetch games to update sidebar on game changes
                ApiService.getRecentGames().then((games) =>
                  setSidebarData({ recentGames: games })
                );
              }}
            />
          ) : (
            <AuthScreen
              onAuthSuccess={(user, token) => {
                setAuth({
                  isAuthenticated: true,
                  user,
                  token
                });
                ApiService.setToken(token);
              }}
              setGlobalError={setGlobalError}
            />
          )}
        </header>
      </div>
    </div>
  );
}

export default App;
