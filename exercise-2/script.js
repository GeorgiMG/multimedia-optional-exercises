const words = ["table", "chair", "piano", "mouse", "house", "plant", "brain", "cloud", "beach", "fruit"];

let targetWord;
let currentRow = 0;
let currentGuess = '';
let gameOver = false;
let board = [];
let stats = {
    gamesPlayed: 0,
    wins: 0,
    currentStreak: 0
};

const boardElement = document.getElementById('board');
const inputElement = document.getElementById('guess-input');
const submitBtn = document.getElementById('submit-btn');
const newGameBtn = document.getElementById('new-game-btn');
const messageElement = document.getElementById('message');
const gamesPlayedElement = document.getElementById('games-played');
const winPercentageElement = document.getElementById('win-percentage');
const currentStreakElement = document.getElementById('current-streak');

// Load stats from localStorage
function loadStats() {
    const savedStats = localStorage.getItem('wordleStats');
    if (savedStats) {
        stats = JSON.parse(savedStats);
    }
    updateStatsDisplay();
}

// Save stats to localStorage
function saveStats() {
    localStorage.setItem('wordleStats', JSON.stringify(stats));
}

// Update stats display
function updateStatsDisplay() {
    gamesPlayedElement.textContent = stats.gamesPlayed;
    winPercentageElement.textContent = stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) + '%' : '0%';
    currentStreakElement.textContent = stats.currentStreak;
}

// Initialize board
function initBoard() {
    board = [];
    for (let i = 0; i < 6; i++) {
        board[i] = [];
        for (let j = 0; j < 5; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            boardElement.appendChild(cell);
            board[i][j] = cell;
        }
    }
}

// Start new game
function startNewGame() {
    targetWord = words[Math.floor(Math.random() * words.length)];
    currentRow = 0;
    currentGuess = '';
    gameOver = false;
    inputElement.value = '';
    inputElement.disabled = false;
    submitBtn.disabled = false;
    newGameBtn.style.display = 'none';
    messageElement.textContent = '';
    // Clear board
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 5; j++) {
            board[i][j].textContent = '';
            board[i][j].className = 'cell';
        }
    }
}

// Submit guess
function submitGuess() {
    if (gameOver) return;
    const guess = inputElement.value.toLowerCase().trim();
    if (guess.length !== 5) {
        messageElement.textContent = 'Please enter a 5-letter word.';
        return;
    }
    if (!/^[a-z]+$/.test(guess)) {
        messageElement.textContent = 'Please enter only letters.';
        return;
    }
    messageElement.textContent = '';
    currentGuess = guess;
    checkGuess();
    currentRow++;
    if (currentRow === 6 || currentGuess === targetWord) {
        endGame();
    }
    inputElement.value = '';
}

// Check guess and update board
function checkGuess() {
    const guess = currentGuess;
    const target = targetWord;
    const result = Array(5).fill('absent');
    const targetCounts = {};
    const guessCounts = {};

    // Count letters in target
    for (let char of target) {
        targetCounts[char] = (targetCounts[char] || 0) + 1;
    }

    // First pass: correct positions
    for (let i = 0; i < 5; i++) {
        if (guess[i] === target[i]) {
            result[i] = 'correct';
            targetCounts[guess[i]]--;
        }
    }

    // Second pass: present but wrong position
    for (let i = 0; i < 5; i++) {
        if (result[i] === 'absent' && targetCounts[guess[i]] > 0) {
            result[i] = 'present';
            targetCounts[guess[i]]--;
        }
    }

    // Update board
    for (let i = 0; i < 5; i++) {
        board[currentRow][i].textContent = guess[i].toUpperCase();
        board[currentRow][i].classList.add(result[i]);
    }
}

// End game
function endGame() {
    gameOver = true;
    inputElement.disabled = true;
    submitBtn.disabled = true;
    newGameBtn.style.display = 'block';
    stats.gamesPlayed++;
    if (currentGuess === targetWord) {
        stats.wins++;
        stats.currentStreak++;
        messageElement.textContent = 'Congratulations! You won!';
    } else {
        stats.currentStreak = 0;
        messageElement.textContent = `You lost! The word was: ${targetWord.toUpperCase()}`;
    }
    saveStats();
    updateStatsDisplay();
}

// Event listeners
submitBtn.addEventListener('click', submitGuess);
newGameBtn.addEventListener('click', startNewGame);
inputElement.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submitGuess();
    }
});

// Initialize
loadStats();
initBoard();
startNewGame();