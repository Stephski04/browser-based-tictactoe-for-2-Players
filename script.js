// Define initial game state
let board = ["", "", "", "", "", "", "", "", ""]; // Empty cells
let currentPlayer = "X"; // Player X starts the game
let gameActive = true; // To check if the game is ongoing

// Select DOM elements
const cells = document.querySelectorAll('.cell'); // All the cells in the grid
const restartButton = document.getElementById('restart-button');

// Function to handle cell clicks
function handleCellClick(event) {
    const cellIndex = event.target.getAttribute("data-index");
    
    // Only proceed if the cell is empty and the game is still active
    if (board[cellIndex] === "" && gameActive) {
        // Mark the cell with the current player's symbol
        board[cellIndex] = currentPlayer;
        event.target.textContent = currentPlayer;

        // Check for a win or draw
        checkGameStatus();

        // Switch player for the next move
        currentPlayer = currentPlayer === "X" ? "O" : "X";
    }
}

// Function to check if the game has a winner or if it's a draw
function checkGameStatus() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
    ];

    // Check each win pattern
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            // A player wins
            gameActive = false;
            alert(`${currentPlayer} wins!`);
            return;
        }
    }

    // Check if the board is full (draw)
    if (!board.includes("")) {
        gameActive = false;
        alert("It's a draw!");
    }
}

// Function to restart the game
function restartGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    gameActive = true;
    cells.forEach(cell => cell.textContent = ""); // Clear the cells
}

// Event listeners
cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick); // Listen for player moves
});

restartButton.addEventListener('click', restartGame); // Listen for restart button click
