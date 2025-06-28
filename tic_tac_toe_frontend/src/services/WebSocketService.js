class WebSocketService {
  constructor(token) {
    // Assumes ws:// protocol on dev, wss:// in production
    const backendHost = (process.env.REACT_APP_BACKEND_WS || "ws://localhost:3001/ws");
    const wsUrl =
      backendHost.startsWith("ws")
        ? backendHost + `?token=${token}`
        : `ws://${backendHost}/ws?token=${token}`;
    this.socket = new window.WebSocket(wsUrl);
    this.listeners = [];
    this.socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        this.listeners.forEach(fn => fn(msg));
      } catch { /* ignore */ }
    };
  }
  addListener(fn) {
    this.listeners.push(fn);
  }
  removeListener(fn) {
    this.listeners = this.listeners.filter(f => f !== fn);
  }
  send(msg) {
    if (this.socket.readyState === 1) {
      this.socket.send(JSON.stringify(msg));
    }
  }
  close() {
    this.socket.close();
  }
}
export default WebSocketService;
