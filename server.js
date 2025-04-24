const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let gameState = {
    board: ["", "", "", "", "", "", "", "", ""],
    currentPlayer: "X",
    gameActive: true,
    players: []
};

// Serve the front-end files
app.use(express.static('public'));

// Handle new connections from players
io.on('connection', (socket) => {
    console.log('A player connected:', socket.id);
    
    // Add the new player to the game
    if (gameState.players.length < 2) {
        gameState.players.push(socket.id);
        socket.emit('player', gameState.players.length === 1 ? 'X' : 'O');
    }

    // Handle player move
    socket.on('makeMove', (data) => {
        const { index, player } = data;
        
        if (gameState.board[index] === "" && gameState.gameActive) {
            gameState.board[index] = player;
            gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
            
            // Emit updated game state to both players
            io.emit('gameUpdate', gameState);

            // Check if the game has a winner or a draw
            checkGameStatus();
        }
    });

    // Restart the game when requested
    socket.on('restartGame', () => {
        gameState.board = ["", "", "", "", "", "", "", "", ""];
        gameState.currentPlayer = "X";
        gameState.gameActive = true;
        io.emit('gameUpdate', gameState);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A player disconnected:', socket.id);
        gameState.players = gameState.players.filter(player => player !== socket.id);
        io.emit('gameUpdate', gameState);
    });
});

// Check for a winner or draw
function checkGameStatus() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (gameState.board[a] && gameState.board[a] === gameState.board[b] && gameState.board[a] === gameState.board[c]) {
            gameState.gameActive = false;
            io.emit('gameUpdate', gameState);
            return;
        }
    }

    if (!gameState.board.includes("")) {
        gameState.gameActive = false;
        io.emit('gameUpdate', gameState); // Draw
    }
}

// Start the server on port 3000
server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
