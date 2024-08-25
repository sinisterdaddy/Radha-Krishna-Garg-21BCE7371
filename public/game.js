const board = document.getElementById('board');
const selectedPieceDisplay = document.getElementById('selected-piece');
let selectedPiece = null;
let currentPlayer = 'A';

// Example pieces for demonstration
const pieces = [
    'B-P1', 'B-P2', 'B-H1', 'B-H2', 'B-P3',
    '', '', '', '', '',
    '', '', '', '', '',
    '', '', '', '', '',
    'A-P1', 'A-P2', 'A-H1', 'A-H2', 'A-P3'
];

// Populate the board with pieces
function renderBoard() {
    board.innerHTML = '';
    pieces.forEach((piece, index) => {
        const square = document.createElement('div');
        square.classList.add('square');
        if (piece) {
            square.innerText = piece;
        }
        square.addEventListener('click', () => selectPiece(index));
        board.appendChild(square);
    });
}
function enableDiagonalButtons(enable) {
    const diagonalButtons = ['move-fl', 'move-fr', 'move-bl', 'move-br'];
    const basicButtons = ['move-left', 'move-right', 'move-forward', 'move-backward'];

    // Show diagonal buttons and hide basic buttons if enable is true
    diagonalButtons.forEach(id => {
        document.getElementById(id).style.display = enable ? 'inline-block' : 'none';
    });

    // Hide diagonal buttons and show basic buttons if enable is false
    basicButtons.forEach(id => {
        document.getElementById(id).style.display = enable ? 'none' : 'inline-block';
    });
}

// Handle piece selection
function selectPiece(index) {
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => square.classList.remove('selected'));

    if (pieces[index] && pieces[index].startsWith(currentPlayer)) {
        selectedPiece = { piece: pieces[index], index };
        squares[index].classList.add('selected');
        selectedPieceDisplay.innerText = `Selected: ${pieces[index]}`;

        // Enable or disable diagonal movement buttons based on the selected piece
        if (selectedPiece.piece.includes('H2')) {
            enableDiagonalButtons(true);
        } else {
            enableDiagonalButtons(false);
        }
    } else {
        alert(`It's not your turn or you selected the wrong piece! Current Player: ${currentPlayer}`);
    }
}

// Movement functions
function movePiece(direction) {
    if (!selectedPiece) {
        alert('Please select a piece first');
        return;
    }

    const { piece, index } = selectedPiece;
    let newIndex = index;

    // Calculate movement based on character type and direction
    switch (true) {
        case piece.includes('P'): // Pawn
            newIndex = calculateNewIndex(index, direction, 1);
            break;
        case piece.includes('H1'): // Hero1
            newIndex = calculateNewIndex(index, direction, 2);
            break;
        case piece.includes('H2'): // Hero2
            newIndex = calculateDiagonalNewIndex(index, direction, 2);
            break;
        default:
            alert('Invalid piece type');
            return;
    }

    // Validate the move
    if (isValidMove(piece, index, newIndex)) {
        performMove(piece, index, newIndex, direction);
    } else {
        alert('Invalid move!');
    }
}

function calculateNewIndex(index, direction, distance) {
    let step;
    switch (direction) {
        case 'L':
            step = currentPlayer === 'A' ? -1 : 1;
            break;
        case 'R':
            step = currentPlayer === 'A' ? 1 : -1;
            break;
        case 'F':
            step = currentPlayer === 'A' ? -5 : 5;
            break;
        case 'B':
            step = currentPlayer === 'A' ? 5 : -5;
            break;
        default:
            alert('Invalid direction');
            return index;
    }

    return index + (step * distance);
}

function calculateDiagonalNewIndex(index, direction, distance) {
    let step;
    switch (direction) {
        case 'FL':
            step = currentPlayer === 'A' ? -6 : 6; // Forward-Left
            break;
        case 'FR':
            step = currentPlayer === 'A' ? -4 : 4; // Forward-Right
            break;
        case 'BL':
            step = currentPlayer === 'A' ? 4 : -4; // Backward-Left
            break;
        case 'BR':
            step = currentPlayer === 'A' ? 6 : -6; // Backward-Right
            break;
        default:
            alert('Invalid direction');
            return index;
    }

    return index + (step * distance);
}

function isValidMove(piece, index, newIndex) {
    if (newIndex < 0 || newIndex >= pieces.length) return false;

    if (pieces[newIndex] && pieces[newIndex].startsWith(currentPlayer)) return false;

    return true;
}

function performMove(piece, index, newIndex, direction) {
    if (piece.includes('H1')) {
        const pathIndices = getPathIndices(index, newIndex, direction, 2);
        pathIndices.forEach(i => {
            if (pieces[i] && !pieces[i].startsWith(currentPlayer)) {
                pieces[i] = ''; // Remove opponent's piece
            }
        });
    } else if (piece.includes('H2')) {
        const pathIndices = getPathIndices(index, newIndex, direction, 2, true);
        pathIndices.forEach(i => {
            if (pieces[i] && !pieces[i].startsWith(currentPlayer)) {
                pieces[i] = ''; // Remove opponent's piece
            }
        });
    } else {
        if (pieces[newIndex] && !pieces[newIndex].startsWith(currentPlayer)) {
            pieces[newIndex] = '';
        }
    }

    pieces[index] = '';
    pieces[newIndex] = piece;
    selectedPiece.index = newIndex;
    renderBoard();
    checkForWinner(); // Check if the game has been won after each move
    switchPlayer();
}
function getPathIndices(startIndex, endIndex, direction, distance, diagonal = false) {
    const indices = [];
    let currentIndex = startIndex;

    for (let i = 1; i <= distance; i++) {
        if (diagonal) {
            currentIndex = calculateDiagonalNewIndex(startIndex, direction, i);
        } else {
            currentIndex = calculateNewIndex(startIndex, direction, i);
        }
        indices.push(currentIndex);
    }

    return indices;
}
function switchPlayer() {
    currentPlayer = currentPlayer === 'A' ? 'B' : 'A';
    document.getElementById('current-player').innerText = `Current Player: ${currentPlayer}`;

    // Rotate the board to give the current player the correct perspective
    if (currentPlayer === 'B') {
        board.classList.add('rotated');
    } else {
        board.classList.remove('rotated');
    }

    enableDiagonalButtons(false); // Reset to basic buttons at the start of each turn
}


function checkForWinner() {
    const playerACharacters = pieces.filter(piece => piece.startsWith('A')).length;
    const playerBCharacters = pieces.filter(piece => piece.startsWith('B')).length;

    if (playerACharacters === 0) {
        alert('Player B wins!');
        endGame('B');
    } else if (playerBCharacters === 0) {
        alert('Player A wins!');
        endGame('A');
    }
}

function endGame(winner) {
    alert(`Player ${winner} wins!`);
    const playAgain = confirm('Do you want to play again?');

    if (playAgain) {
        resetGame();
    } else {
        // Optionally, you could disable the board or buttons here to prevent further moves.
        disableBoard();
    }
}

function disableBoard() {
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
        square.removeEventListener('click', selectPiece);
    });
}

function resetGame() {
    // Reset the game to its initial state
    pieces = [
        'B-P1', 'B-P2', 'B-H1', 'B-H2', 'B-P3',
        '', '', '', '', '',
        '', '', '', '', '',
        '', '', '', '', '',
        'A-P1', 'A-P2', 'A-H1', 'A-H2', 'A-P3'
    ];

    selectedPiece = null;
    currentPlayer = 'A';
    document.getElementById('current-player').innerText = `Current Player: ${currentPlayer}`;
    renderBoard();
    enableDiagonalButtons(false); // Reset the buttons
}

// Initialize the board on page load
renderBoard();
