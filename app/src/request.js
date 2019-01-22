import axios from "axios";

const url = "http://localhost:8323";

export const joinGame = () =>
  axios.get(`${url}/join-game`);

export const createNewGame = () =>
  axios.get(`${url}/new-game`);

export const submitMove = (board, player) =>
  axios.post(`${url}/make-move`, {
	  player,
	  board,
  });

export const getGameState = () =>
  axios.get(`${url}/game-state`);