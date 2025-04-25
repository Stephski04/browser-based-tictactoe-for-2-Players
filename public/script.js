const socket = io();

let playerSymbol = '';
let currentTurn = '';
let gameActive = false;

// Receive assigned symbol
socket.on('player', (symbol) => {
    playerSymbol = symbol;
    document.getElementById('turn-indicator').textContent = `You are player ${symbol}`;
});

// Receive game state updates
socket.on('gameUpdate', (gameState) => {
    updateBoard(gameState.board);
    currentTurn = gameState.currentPlayer;
    gameActive = gameState.gameActive;

    const status = !gameActive
        ? getGameResult(gameState.board)
        : currentTurn === playerSymbol
            ? "Your turn"
            : "Opponent's turn";

    document.getElementById('turn-indicator').textContent = status;
});

// Game full
socket.on('full', () => {
    alert("Game is full. Try again later.");
});

// Board UI update
function updateBoard(board) {
    document.querySelectorAll('.cell').forEach((cell, i) => {
        cell.textContent = board[i];
    });
}

// Click logic
document.querySelectorAll('.cell').forEach((cell, index) => {
    cell.addEventListener('click', () => {
        if (gameActive && currentTurn === playerSymbol && cell.textContent === "") {
            socket.emit('makeMove', { index });
        }
    });
});

// Restart
document.getElementById('restart-button').addEventListener('click', () => {
    socket.emit('restartGame');
});

// Win/draw result
function getGameResult(board) {
    const wins = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];

    for (let [a, b, c] of wins) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return `Player ${board[a]} wins!`;
        }
    }

    return "It's a draw!";
}
