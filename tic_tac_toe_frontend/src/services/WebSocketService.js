class WebSocketService {
  constructor(token) {
    // FastAPI backend: ws://<host>:<port>/ws/game/{game_id}
    // We keep the socket as null initially. Connect per game.
    this.token = token;
    this.socket = null;
    this.listeners = [];
    this.currentGameId = null;
  }

  connect(gameId) {
    this.currentGameId = gameId;
    const wsProto =
      window.location.protocol === "https:" ? "wss:" : "ws:";
    const hostPort =
      process.env.REACT_APP_BACKEND_WS ||
      `${wsProto}//${window.location.hostname}:3001`;
    // Compose correct URL for FastAPI (add JWT if needed for auth)
    const url =
      hostPort.endsWith("/")
        ? `${hostPort}ws/game/${gameId}`
        : `${hostPort}/ws/game/${gameId}`;
    const wsUrl =
      url.startsWith("ws") ? url : wsProto + url.replace(/^https?:/, "");
    this.socket = new window.WebSocket(wsUrl);
    this.socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        this.listeners.forEach(fn => fn(msg));
      } catch {}
    };
    // Optionally add handlers for error/close
  }

  addListener(fn) {
    this.listeners.push(fn);
  }
  removeListener(fn) {
    this.listeners = this.listeners.filter(f => f !== fn);
  }
  send(msg) {
    if (this.socket && this.socket.readyState === 1) {
      this.socket.send(JSON.stringify(msg));
    }
  }
  close() {
    if (this.socket) this.socket.close();
    this.socket = null;
    this.currentGameId = null;
  }
}
export default WebSocketService;
