const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";

let authToken = null;

const ApiService = {
  setToken: (token) => {
    authToken = token;
  },
  // PUBLIC_INTERFACE
  async getProfile() {
    const resp = await fetch(`${BACKEND_URL}/users/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!resp.ok) throw new Error("Not authenticated");
    return resp.json();
  },
  // PUBLIC_INTERFACE
  async startGame(roomName = "Quick match") {
    const resp = await fetch(`${BACKEND_URL}/games`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ room_name: roomName })
    });
    if (!resp.ok) throw new Error("Failed to start game");
    // Backend resp is GameState; add compatibility mapping if needed
    const data = await resp.json();
    // Map backend field names to frontend expectation:
    return {
      ...data,
      id: data.game_id,
      board: (Array.isArray(data.board) && Array.isArray(data.board[0]))
        ? data.board.flat()
        : data.board,
      playerX: data.players?.[0] || "",
      playerO: data.players?.[1] || null,
      nextTurn: (data.players?.[0] === data.turn ? "X" : "O"),
      winner: (data.draw ? "draw" : data.winner)
    };
  },
  // PUBLIC_INTERFACE
  async joinGame(gameId) {
    const resp = await fetch(`${BACKEND_URL}/games/join`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ room_id: gameId })
    });
    if (!resp.ok) throw new Error("Failed to join game");
    const data = await resp.json();
    return {
      ...data,
      id: data.game_id,
      board: (Array.isArray(data.board) && Array.isArray(data.board[0]))
        ? data.board.flat()
        : data.board,
      playerX: data.players?.[0] || "",
      playerO: data.players?.[1] || null,
      nextTurn: (data.players?.[0] === data.turn ? "X" : "O"),
      winner: (data.draw ? "draw" : data.winner)
    };
  },
  // PUBLIC_INTERFACE
  async listOpenGames() {
    const resp = await fetch(`${BACKEND_URL}/games`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!resp.ok) return [];
    const games = await resp.json();
    return Array.isArray(games)
      ? games.map(g => ({
          id: g.game_id,
          board: (Array.isArray(g.board) && Array.isArray(g.board[0]))
            ? g.board.flat()
            : g.board,
          playerX: g.players?.[0] || "",
          playerO: g.players?.[1] || null,
          nextTurn: (g.players?.[0] === g.turn ? "X" : "O"),
          winner: (g.draw ? "draw" : g.winner)
        }))
      : [];
  },
  // PUBLIC_INTERFACE
  async getRecentGames() {
    const resp = await fetch(`${BACKEND_URL}/games/history`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!resp.ok) return [];
    const games = await resp.json();
    return Array.isArray(games)
      ? games.map(g => ({
          id: g.game_id,
          board: (Array.isArray(g.board) && Array.isArray(g.board[0]))
            ? g.board.flat()
            : g.board,
          playerX: g.players?.[0] || "",
          playerO: g.players?.[1] || null,
          nextTurn: (g.players?.[0] === g.turn ? "X" : "O"),
          winner: (g.draw ? "draw" : g.winner)
        }))
      : [];
  },
  // PUBLIC_INTERFACE
  async makeMove(gameId, cellIdx) {
    // Backend expects x and y, convert cellIdx
    const x = Math.floor(cellIdx / 3), y = cellIdx % 3;
    const resp = await fetch(`${BACKEND_URL}/games/move`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ game_id: gameId, x, y })
    });
    if (!resp.ok) throw new Error("Invalid move");
    const data = await resp.json();
    return {
      ...data,
      id: data.game_id,
      board: (Array.isArray(data.board) && Array.isArray(data.board[0]))
        ? data.board.flat()
        : data.board,
      playerX: data.players?.[0] || "",
      playerO: data.players?.[1] || null,
      nextTurn: (data.players?.[0] === data.turn ? "X" : "O"),
      winner: (data.draw ? "draw" : data.winner)
    };
  }
};

export default ApiService;
