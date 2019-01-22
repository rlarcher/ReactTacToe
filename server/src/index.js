const express = require("express");
const bodyParser = require("body-parser");

const server = express();
const port = process.env.PORT || 8323;

let currentPlayer;
let board;
let joinedPlayers = [];

const createNewGame = () => {
  currentPlayer = 0;
  board = new Array(9).fill(null);
}

const getGameState = () => {
  if (!board) {
    createNewGame();
  }
  return {
    currentPlayer,
    board: board,
    winner: getWinner(),
  }
}

// return number of current winner if there is one, else null
const getWinner = () => {
  // check rows
  for (let i = 0; i < 9; i = i + 3) {
    if (board[i] === board[i + 1] && board[i] === board[i + 2]) {
      return board[i];
    }
  }
  // check columns
  for (let i = 0; i < 3; i = i + 1) {
    if (board[i] === board[i + 3] && board[i] === board[i + 6]) {
      return board[i];
    }
  }
  // check diags
  if (board[0] === board[4] && board[0] === board[8]) {
    return board[0];
  }
  if (board[2] === board[4] && board[4] === board[6]) {
    return board[2];
  }
};

server.use(bodyParser.json());

server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  next();
});

server.get("/", (req, res) => {
  res.send("Hello");
});

const switchCurrentPlayer = () => {
  if (currentPlayer === 0) {
    currentPlayer = 1;
    return;
  }
  currentPlayer = 0;
}

server.get("/current-player", (req, res) => {
  res.json({
    "currentPlayer": currentPlayer,
  });
});

server.get("/new-game", (req, res) => {
  createNewGame();
  res.json(getGameState());
});

server.post("/make-move", (req, res) => {
  if (req.body.player !== currentPlayer) {
    res.json({
      success: false,
      message: "You are not the current player",
    });
    return;
  }
  const clientBoard = req.body.board;
  // check if only one move has been made and in unoccupied square
  let numberMoves = 0;
  for (let i = 0; i < 9; i++) {
    const clientSquare = clientBoard[i];
    const serverSquare = board[i];
    if (clientSquare !== serverSquare) {
      if (!serverSquare && numberMoves === 0) {
        // user places move
        board[i] = currentPlayer;
        numberMoves = 1;
      } else {
        res.json({
          success: false,
          message: "Not a valid move",
        });
        return;
      }
    }
  }
  switchCurrentPlayer();
  res.json({
    success: true,
    ...getGameState(),
  });
});

server.get("/join-game", (req, res) => {
  if (joinedPlayers.length > 2) {
    res.json({
      "success": false,
      "data": getGameState(),
      "message": "Already multiple players have joined"
    });
  } else {
    const playerIndex = joinedPlayers.length;
    joinedPlayers.push(playerIndex);
    const gameState = getGameState();
    res.json({
      ...gameState,
      player: playerIndex,
      "success": true,
      "message": `You are player ${playerIndex}`
    })
  }
});

server.get("/game-state", (req, res) => {
  res.json(getGameState());
})

server.listen(port);
