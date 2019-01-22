import React from "react";

const Square = ({ player, onClick }) => (
  <button
    onClick={onClick}
    style={{ height: "80px", width: "80px", border: "1px solid black", fontSize: "20px", textAlign: "center"}}
  >
    {player}
  </button>
);

const Board = ({ squaresArr, squareClick }) => {
  // TODO: could clean this up into a loop rather than going by row
	const top = squaresArr.slice(0, 3);
	const middle = squaresArr.slice(3, 6);
  const bottom = squaresArr.slice(6, 9);
	
	return (
		<div style={{ display: "flex", flexDirection: "column", marginBottom: "2rem"}}>
			<div style={{ display: "flex" }}>
				{top.map((player, index) => <Square player={player} onClick={() => squareClick(index)}></Square>)}
			</div>
			<div style={{ display: "flex" }}>
				{middle.map((player, index) => <Square player={player} onClick={() => squareClick(3+index)}></Square>)}
			</div>
			<div style={{ display: "flex" }}>
				{bottom.map((player, index) => <Square player={player} onClick={() => squareClick(6+index)}></Square>)}
			</div>
		</div>
	);
};

class TicTacToe extends React.Component {
	constructor(props) {
	  super(props);
	  this.state = {
		  board: Array(9).fill(null),
		  hasPlacedMoved: false,
      player: null,
      isPlayerTurn: false,
    };
  
    this.placeMove = this.placeMove.bind(this);
    this.createGame = this.createGame.bind(this);
    this.joinGame = this.joinGame.bind(this);
    this.setCurrentPlayer = this.setCurrentPlayer.bind(this);
    this.submitMove = this.submitMove.bind(this);
    this.pollingInterval = null;
  }

  placeMove(index) {
	  if (hasPlacedMoved) {
		  return;
	  }
	  this.setState((state) => ({
      ...state,
      hasPlacedMoved: true,
    }));
  }

  setBoard(board) {
    this.setState((state) => ({
	  ...state,
	  board,
    }));
  }
  
  setCurrentPlayer(currentPlayer) {
    console.log("set current play", currentPlayer);
    this.setState((state) => ({
      ...state,
      isPlayerTurn: currentPlayer === state.player,
    }));
    console.log(this.state);
  }

  setPlayer(player) {
    this.setState((state) => ({
      ...state,
      player,
    }));
  }
  
  createGame(event) {
    // creates a new game; essentially server reset
    event.preventDefault();
    this.props.createNewGame().then((data) => {
      this.setBoard(data.board);
    });
  }

  setPlaying(playing) {
    this.setState((state) => ({
      ...state,
      playing,
    }));
  }

  joinGame(event) {
    event.preventDefault();
    this.props.joinGame().then((res) => {
      if (res.data.success) {
        this.setBoard(res.data.board);
        this.setPlayer(res.data.player);
        console.log(res.data, this.state);
        this.setCurrentPlayer(res.data.currentPlayer);
        this.setPlaying(res.data.player < 2);
      } else {
        alert("You did not join");
      }
    });
    // set up polling for game state
    this.pollingInterval = setInterval(() => {
      if (!this.state.isPlayerTurn) {
        this.props.getGameState().then((res) => {
          if (res.status === 200) {
            this.setBoard(res.data.board);
            this.setCurrentPlayer(res.data.currentPlayer);
            if (res.data.winner !== null) {
              if (res.data.winner === this.state.player) {
                alert("You won!");
              } else {
                alert(`You lost! Player ${res.data.winner} won`);
              }
              clearInterval(this.pollingInterval);
            }
          }
        });
      }
    }, 200);
  }

  squareChange(index) {
    this.setState((state) => {
      const board = state.board;
      board[index] = this.state.player;
      return {
        ...state,
        board,
      }
    });
  }

  getStatusString() {
    console.log("status", this.state);
    if (!this.state.playing) {
      return "You are watching";
    }
    if (!this.state.isPlayerTurn) {
      return "It is not your turn";
    }
    return "It is your turn";
  }

  getPlayerString() {
    if (this.state.player === null) {
      return "You are not playing";
    }
    return `You are player ${this.state.player}`;
  }

  submitMove() {
    this.props.submitMove(this.state.board, this.state.player)
      .then((res) => {
        if (!res.data.success) {
          alert("Not a valid move");
          return;
        }
        this.setBoard(res.data.board);
        this.setCurrentPlayer(res.data.currentPlayer);
      });
  }
  
	render() {
	  return (
    <div>
      <Board
        squaresArr={this.state.board}
        squareClick={(index) => this.state.playing && this.squareChange(index)}>
      </Board>
      <div>
        <button type="button" onClick={this.submitMove}> Submit Move </button>
        <button type="button" onClick={this.joinGame}> Join Game</button>
        <button type="button" onClick={this.createGame}>Create New Game</button>
      </div>
      <p>{this.getPlayerString()}</p>
      <p>{this.getStatusString()}</p>
    </div>
	  );
	}
  }

export default TicTacToe;