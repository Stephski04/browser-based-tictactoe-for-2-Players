const socket = io();

// Variables to track game state
let currentPlayer = '';
let gameActive = true;

// Listen for the game state update from the server
socket.on('gameUpdate', (gameState) => {
    updateGameBoard(gameState.board);
    gameActive = gameState.gameActive;
    currentPlayer = gameState.currentPlayer;
});

// Update the game board on the client side
function updateGameBoard(board) {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        cell.textContent = board[index];  // Update the content of each cell
    });
}

// Handle cell click (send the move to the server)
document.querySelectorAll('.cell').forEach((cell, index) => {
    cell.addEventListener('click', () => {
        if (gameActive && cell.textContent === "") {
            socket.emit('makeMove', { index, player: currentPlayer });
        }
    });
});

// Restart the game when clicked
document.getElementById('restart-button').addEventListener('click', () => {
    socket.emit('restartGame');
});
