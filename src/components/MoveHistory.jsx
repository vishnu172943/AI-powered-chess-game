import React, { useContext } from 'react';
import { ChessContext } from "../context/ChessContext";

const MoveHistory = () => {
  const { moves = [] } = useContext(ChessContext);

  const formatMove = (move, index) => {
    const moveNumber = Math.floor(index / 2) + 1;
    const isWhite = index % 2 === 0;
    const color = move.color === 'w' ? 'White' : 'Black';
    const colorSymbol = move.color === 'w' ? '⬜' : '⬛';

    return (
      <div key={index} className={`move-entry ${isWhite ? 'white' : 'black'}`}>
        {isWhite && <span className="move-number">{moveNumber}.</span>}
        <span className="piece-move">
          {colorSymbol} {color} moved {move.from} → {move.to}
          {move.captured && ' (captured)'}
        </span>
      </div>
    );
  };

  return (
    <div className="move-history">
      <h3>Game Moves</h3>
      <div className="moves-container">
        {moves.length === 0 ? (
          <p className="no-moves">No moves yet</p>
        ) : (
          moves.map((move, index) => formatMove(move, index))
        )}
      </div>
    </div>
  );
};

export default MoveHistory;
