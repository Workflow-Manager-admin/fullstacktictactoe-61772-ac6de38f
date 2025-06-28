const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";

let authToken = null;

const ApiService = {
  setToken: (token) => {
    authToken = token;
  },
  // PUBLIC_INTERFACE
  async getProfile() {
    const resp = await fetch(`${BACKEND_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!resp.ok) throw new Error("Not authenticated");
    return resp.json();
  },
  // PUBLIC_INTERFACE
  async startGame() {
    const resp = await fetch(`${BACKEND_URL}/games/start`, {
      method: "POST",
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!resp.ok) throw new Error("Failed to start game");
    return resp.json();
  },
  // PUBLIC_INTERFACE
  async joinGame(gameId) {
    const resp = await fetch(`${BACKEND_URL}/games/join/${gameId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!resp.ok) throw new Error("Failed to join game");
    return resp.json();
  },
  // PUBLIC_INTERFACE
  async listOpenGames() {
    const resp = await fetch(`${BACKEND_URL}/games/open`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!resp.ok) return [];
    return resp.json();
  },
  // PUBLIC_INTERFACE
  async getRecentGames() {
    const resp = await fetch(`${BACKEND_URL}/games/history`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!resp.ok) return [];
    return resp.json();
  },
  // PUBLIC_INTERFACE
  async makeMove(gameId, cellIdx) {
    const resp = await fetch(`${BACKEND_URL}/games/move/${gameId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ cell: cellIdx })
    });
    if (!resp.ok) throw new Error("Invalid move");
    return resp.json();
  }
};

export default ApiService;
