import React from "react";
import TicTacToe from "./components/Board";
import { createNewGame, joinGame, submitMove, getGameState } from "./request";

const App = () => (
	<div>
		<TicTacToe
			name="Set Value"
			getGameState={() => getGameState()}
			createNewGame={() => createNewGame()}
			joinGame={() => joinGame()}
			submitMove={(board, player) => submitMove(board, player)}
		></TicTacToe>
	</div>
);

export default App;