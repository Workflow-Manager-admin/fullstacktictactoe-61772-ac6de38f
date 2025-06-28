import React from "react";

// PUBLIC_INTERFACE
function GameBoard({ board, disabled, onCellClick, mySymbol, winner }) {
  // board: ["", "", "", ...] length 9, each cell "" | "X" | "O"
  function renderCell(idx) {
    return (
      <button
        className={"cell" + (winner && board[idx] && winner !== "draw" && board[idx] === winner ? " winner" : "")}
        key={idx}
        disabled={disabled || !!board[idx]}
        onClick={() => onCellClick(idx)}
        aria-label={`cell ${idx + 1}`}
      >
        {board[idx]}
      </button>
    )
  }

  return (
    <div className="ttt-board">
      {Array(3).fill(0).map((_, row) => (
        <div className="ttt-row" key={row}>
          {Array(3).fill(0).map((_, col) => renderCell(row * 3 + col))}
        </div>
      ))}
    </div>
  );
}

export default GameBoard;
