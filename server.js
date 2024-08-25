const express = require('express');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from the 'public' directory
app.use(express.static('public'));

// In-memory storage for game state
let gameState = {
  board: [
    // Initial game board setup
  ],
  players: [],
  currentPlayer: 0,
};

wss.on('connection', (ws) => {
  console.log('A new player has connected');

  // Add player to the game
  gameState.players.push(ws);

  // Send initial game state to the new player
  ws.send(JSON.stringify({ type: 'init', state: gameState }));

  ws.on('message', (message) => {
    const msg = JSON.parse(message);

    if (msg.type === 'move') {
      processMove(msg.move);
      broadcast(JSON.stringify({ type: 'update', state: gameState }));
    }
  });

  ws.on('close', () => {
    console.log('A player has disconnected');
    gameState.players = gameState.players.filter(player => player !== ws);
  });
});

function processMove(move) {
  // Implement your game logic here
  gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
}

function broadcast(message) {
  gameState.players.forEach(player => {
    if (player.readyState === WebSocket.OPEN) {
      player.send(message);
    }
  });
}

server.listen(8080, () => {
  console.log('Server is running on http://localhost:8080');
});
