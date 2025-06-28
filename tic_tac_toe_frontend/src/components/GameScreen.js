import React, { useEffect, useState } from "react";
import GameBoard from "./GameBoard";

// PUBLIC_INTERFACE
function GameScreen({ currentUser, wsService, apiService, sidebarRefresh }) {
  // UI state: null = show join/start UI, otherwise show game play
  const [activeGame, setActiveGame] = useState(null);
  const [mySymbol, setMySymbol] = useState(null); // "X" or "O"
  const [moveError, setMoveError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [waitingToJoin, setWaitingToJoin] = useState(false);

  // When joining or creating a game
  async function startNewGame() {
    setStatusMsg("Creating new game...");
    setMoveError("");
    try {
      const game = await apiService.startGame();
      setActiveGame(game);
      setMySymbol(game.playerX === currentUser.username ? "X" : "O");
      setStatusMsg("");
    } catch {
      setMoveError("Failed to create game. Try again.");
    }
  }

  async function joinExistingGame(gameId) {
    setStatusMsg("Joining game...");
    setMoveError("");
    try {
      const game = await apiService.joinGame(gameId);
      setActiveGame(game);
      setMySymbol(game.playerO === currentUser.username ? "O" : "X");
      setStatusMsg("");
    } catch {
      setMoveError("Failed to join game. Game might be already full.");
    }
  }

  // Listen to WebSocket game update events
  useEffect(() => {
    if (!wsService) return;
    function handler(msg) {
      if (!activeGame) return;
      // Only update if it matches current active game
      if (msg.type === "game_update" && msg.payload.id === activeGame.id) {
        setActiveGame(msg.payload);
        setStatusMsg("");
        sidebarRefresh();
      }
      if (msg.type === "game_end" && msg.payload.id === activeGame.id) {
        setStatusMsg("Game finished: " + msg.payload.result);
        setActiveGame(msg.payload);
        sidebarRefresh();
      }
    }
    wsService.addListener(handler);
    return () => wsService.removeListener(handler);
  }, [wsService, activeGame, sidebarRefresh]);

  // PUBLIC_INTERFACE
  async function handleMove(cellIdx) {
    try {
      setMoveError("");
      setStatusMsg("Sending...");
      const updatedGame = await apiService.makeMove(activeGame.id, cellIdx);
      setStatusMsg("");
      if (updatedGame) setActiveGame(updatedGame);
      sidebarRefresh();
    } catch (err) {
      setMoveError("Invalid move or server error.");
      setStatusMsg("");
    }
  }

  // Allow to "abandon" current game (back to start)
  const resetGame = () => {
    setActiveGame(null);
    setStatusMsg("");
    setMoveError("");
    setWaitingToJoin(false);
    sidebarRefresh();
  };

  if (!activeGame) {
    // Entry UI: Start new/join existing
    return (
      <div className="game-flow-selector">
        <h2>Welcome, {currentUser.username}</h2>
        {moveError && <div className="form-error">{moveError}</div>}
        <button className="btn btn-large" style={{ marginBottom: 20 }} onClick={startNewGame}>
          Start New Game
        </button>
        <p style={{ margin: "12px" }}>OR</p>
        <JoinGamePanel apiService={apiService} onJoinGame={joinExistingGame} />
        {statusMsg && <p style={{ marginTop: 16 }}>{statusMsg}</p>}
      </div>
    );
  }

  // Main game UI
  const winner = activeGame.winner || null;
  const yourTurn = (
    (activeGame.nextTurn === "X" && mySymbol === "X") ||
    (activeGame.nextTurn === "O" && mySymbol === "O")
  );

  let statusBanner = "";
  if (winner) {
    statusBanner = `Game Over: ${winner === "draw" ? "Draw" : `${winner} wins!`}`;
  } else if (yourTurn) {
    statusBanner = "Your turn!";
  } else if (activeGame.playerO && activeGame.playerX) {
    statusBanner = `Waiting for opponent's move...`;
  } else {
    statusBanner = "Waiting for second player to join...";
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <h3>Tic Tac Toe vs {mySymbol === "X" ? activeGame.playerO || "waiting..." : activeGame.playerX}</h3>
        <p><b>Your symbol:</b> {mySymbol}</p>
        <span className="status-banner">{statusBanner}</span>
        {statusMsg && <em>{statusMsg}</em>}
      </div>
      <GameBoard
        board={activeGame.board}
        disabled={!yourTurn || !!winner}
        onCellClick={handleMove}
        mySymbol={mySymbol}
        winner={winner}
      />
      <div className="game-footer">
        {moveError && <div className="form-error">{moveError}</div>}
        <button className="btn" style={{ marginTop: 16 }} onClick={resetGame}>
          {winner ? "Play Again" : "Back"}
        </button>
      </div>
    </div>
  );
}

// Component for listing/joining open games
function JoinGamePanel({ apiService, onJoinGame }) {
  const [games, setGames] = useState([]);
  const [fetching, setFetching] = useState(false);
  useEffect(() => {
    setFetching(true);
    apiService.listOpenGames().then((res) => {
      setGames(res || []);
      setFetching(false);
    });
  }, [apiService]);
  if (fetching) return <p>Loading open games...</p>;
  return (
    <div>
      <h4>Join Existing Game</h4>
      {games.length === 0 ? (
        <p>No open games found.</p>
      ) : (
        <ul className="join-list">
          {games.map((g) => (
            <li className="join-item" key={g.id}>
              <span>vs {g.playerX}</span>
              <button className="btn" onClick={() => onJoinGame(g.id)}>Join</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default GameScreen;
