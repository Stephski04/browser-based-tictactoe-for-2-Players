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
    players: [],
    playerSymbols: {} // { socket.id: 'X' or 'O' }
};

// Serve front-end
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    // Only allow 2 players
    if (gameState.players.length < 2) {
        gameState.players.push(socket.id);
        const assignedSymbol = gameState.players.length === 1 ? 'X' : 'O';
        gameState.playerSymbols[socket.id] = assignedSymbol;
        socket.emit('player', assignedSymbol);
        console.log(`Assigned ${assignedSymbol} to ${socket.id}`);

        // Send initial state
        socket.emit('gameUpdate', gameState);
    } else {
        socket.emit('full');
        return;
    }

    // Handle move
    socket.on('makeMove', ({ index }) => {
        const player = gameState.playerSymbols[socket.id];

        // Validate move
        if (
            gameState.gameActive &&
            player === gameState.currentPlayer &&
            gameState.board[index] === ""
        ) {
            gameState.board[index] = player;
            gameState.currentPlayer = player === 'X' ? 'O' : 'X';
            checkGameStatus();
            io.emit('gameUpdate', gameState);
        }
    });

    // Restart game
    socket.on('restartGame', () => {
        if (gameState.players.includes(socket.id)) {
            gameState.board = ["", "", "", "", "", "", "", "", ""];
            gameState.currentPlayer = "X";
            gameState.gameActive = true;
            io.emit('gameUpdate', gameState);
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        gameState.players = gameState.players.filter(p => p !== socket.id);
        delete gameState.playerSymbols[socket.id];

        // Reset game
        gameState.board = ["", "", "", "", "", "", "", "", ""];
        gameState.currentPlayer = "X";
        gameState.gameActive = true;

        io.emit('gameUpdate', gameState);
    });
});

function checkGameStatus() {
    const wins = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];
    for (const [a, b, c] of wins) {
        if (
            gameState.board[a] &&
            gameState.board[a] === gameState.board[b] &&
            gameState.board[a] === gameState.board[c]
        ) {
            gameState.gameActive = false;
            return;
        }
    }

    if (!gameState.board.includes("")) {
        gameState.gameActive = false; // Draw
    }
}

// Start server
server.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
