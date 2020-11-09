import { useState, useCallback } from 'react';

import { checkCollision, STAGE_WIDTH } from '../gameHelpers';
import { TETROMINOS, randomTetromino } from '../tetrominos';

export const usePlayer = () => {
  const [player, setPlayer] = useState({
    pos: { x: 0, y: 0 },
    tetromino: TETROMINOS[0].shape,
    collided: false,
  });

  // function to rotate a matrix
  const rotate = (matrix, dir) => {
    // Make the rows become cols (transpose); matrix = tetromino
    const rotatedTetro = matrix.map((_, index) =>
      matrix.map((col) => col[index])
    );
    // Reverse each row to get a rotated matrix; dir>0 is a clockwise rotation
    if (dir > 0) return rotatedTetro.map((row) => row.reverse());
    return rotatedTetro.reverse();
  };

  const playerRotate = (stage, dir) => {
    // to avoid mutation on the state, we make a complete clone using JSON.parse(JSON.stringify())
    const clonedPlayer = JSON.parse(JSON.stringify(player));
    clonedPlayer.tetromino = rotate(clonedPlayer.tetromino, dir);

    // smart collision detection : we check for collisions when we try to rotate the tetromino
    const pos = clonedPlayer.pos.x;
    let offset = 1;
    // checkCollision checks collisions throughout the tetromino's length
    while (checkCollision(clonedPlayer, stage, { x: 0, y: 0 })) {
      clonedPlayer.pos.x += offset;
      // ternary operator allowing us to check collisions left and right of the tetromino
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > clonedPlayer.tetromino[0].length) {
        // if there is a collision, we rotate the player again (return to initial state)
        rotate(clonedPlayer.tetromino, -dir);
        clonedPlayer.pos.x = pos;
        return;
      }
    }

    setPlayer(clonedPlayer);
  };

  const updatePlayerPos = ({ x, y, collided }) => {
    setPlayer((prev) => ({
      ...prev,
      pos: { x: (prev.pos.x += x), y: (prev.pos.y += y) },
      collided,
    }));
  };

  const resetPlayer = useCallback(() => {
    setPlayer({
      pos: { x: STAGE_WIDTH / 2 - 2, y: 0 },
      tetromino: randomTetromino().shape,
      collided: false,
    });
  }, []);

  return [player, updatePlayerPos, resetPlayer, playerRotate];
  /* const playerState = useState();
     const player = playerState[0];
     const setPlayer = playerState[1];
     => ES6 destructuring syntax is more convenient
     */
};
