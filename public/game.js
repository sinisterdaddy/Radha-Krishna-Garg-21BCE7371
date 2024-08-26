const board = document.getElementById('board');
const selectedPieceDisplay = document.getElementById('selected-piece');
let selectedPiece = null;
let currentPlayer = 'A';

// Example pieces for demonstration
let pieces = [
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
    let newIndex = index;

    switch (direction) {
        case 'L':
            if (currentPlayer === 'A' && index % 5 !== 0) {
                newIndex -= distance; // Move left for Player A
            } else if (currentPlayer === 'B' && index % 5 !== 4) {
                newIndex += distance; // Move left for Player B (which is actually right in terms of index)
            }
            break;
        case 'R':
            if (currentPlayer === 'A' && index % 5 !== 4) {
                newIndex += distance; // Move right for Player A
            } else if (currentPlayer === 'B' && index % 5 !== 0) {
                newIndex -= distance; // Move right for Player B (which is actually left in terms of index)
            }
            break;
        case 'F':
            if (currentPlayer === 'A' && index >= 5) {
                newIndex -= 5 * distance; // Move forward for Player A
            } else if (currentPlayer === 'B' && index < 20) {
                newIndex += 5 * distance; // Move forward for Player B
            }
            break;
        case 'B':
            if (currentPlayer === 'A' && index < 20) {
                newIndex += 5 * distance; // Move backward for Player A
            } else if (currentPlayer === 'B' && index >= 5) {
                newIndex -= 5 * distance; // Move backward for Player B
            }
            break;
        default:
            return index; // Invalid direction, return the current index
    }

    // Ensure the new index is within bounds
    if (newIndex < 0 || newIndex >= pieces.length) {
        return index;
    }

    return newIndex;
}

function calculateDiagonalNewIndex(index, direction, distance) {
    let newIndex = index;

    switch (direction) {
        case 'FL':
            if (currentPlayer === 'A' && index % 5 !== 0 && index >= 5) {
                newIndex -= 6 * distance; // Forward-Left for Player A
            } else if (currentPlayer === 'B' && index % 5 !== 4 && index < 20) {
                newIndex += 6 * distance; // Forward-Left for Player B (which is actually Backward-Right)
            }
            break;
        case 'FR':
            if (currentPlayer === 'A' && index % 5 !== 4 && index >= 5) {
                newIndex -= 4 * distance; // Forward-Right for Player A
            } else if (currentPlayer === 'B' && index % 5 !== 0 && index < 20) {
                newIndex += 4 * distance; // Forward-Right for Player B (which is actually Backward-Left)
            }
            break;
        case 'BL':
            if (currentPlayer === 'A' && index % 5 !== 0 && index < 20) {
                newIndex += 4 * distance; // Backward-Left for Player A
            } else if (currentPlayer === 'B' && index % 5 !== 4 && index >= 5) {
                newIndex -= 4 * distance; // Backward-Left for Player B (which is actually Forward-Right)
            }
            break;
        case 'BR':
            if (currentPlayer === 'A' && index % 5 !== 4 && index < 20) {
                newIndex += 6 * distance; // Backward-Right for Player A
            } else if (currentPlayer === 'B' && index % 5 !== 0 && index >= 5) {
                newIndex -= 6 * distance; // Backward-Right for Player B (which is actually Forward-Left)
            }
            break;
        default:
            return index; // Invalid direction, return the current index
    }

    // Ensure the new index is within bounds
    if (newIndex < 0 || newIndex >= pieces.length) {
        return index;
    }

    return newIndex;
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

    renderBoard(); // Re-render the board to reflect changes
    checkForWinner(); // Now check if the game has been won
    if (!gameOver) {
        switchPlayer(); // Switch to the next player if the game is not over
    }
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

let gameOver = false;

function checkForWinner() {
    const playerACharacters = pieces.filter(piece => piece.startsWith('A')).length;
    const playerBCharacters = pieces.filter(piece => piece.startsWith('B')).length;

    if (playerACharacters === 0) {
        endGame('B');
    } else if (playerBCharacters === 0) {
        endGame('A');
    }
}

function endGame(winner) {
    gameOver = true; // Set the game over flag
    setTimeout(() => {
        alert(`Player ${winner} wins!`);
        const playAgain = confirm('Do you want to play again?');

        if (playAgain) {
            resetGame();
        } else {
            disableBoard();
        }
    }, 100); // Delay the alert to ensure the last move is rendered
}

function disableBoard() {
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
        square.removeEventListener('click', selectPiece);
    });
}

function resetGame() {
    gameOver = false; // Reset the game over flag

    // Reinitialize the game pieces
    pieces = [
        'B-P1', 'B-P2', 'B-H1', 'B-H2', 'B-P3',
        '', '', '', '', '',
        '', '', '', '', '',
        '', '', '', '', '',
        'A-P1', 'A-P2', 'A-H1', 'A-H2', 'A-P3'
    ];

    selectedPiece = null; // Clear the selected piece
    currentPlayer = 'A'; // Reset the current player to A
    document.getElementById('current-player').innerText = `Current Player: ${currentPlayer}`;

    // Re-render the board to reflect the initial state
    renderBoard();

    // Reset the buttons to the initial state
    enableDiagonalButtons(false);

    // Re-enable the event listeners if they were disabled
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
        square.addEventListener('click', selectPiece);
    });
}



// Initialize the board on page load
renderBoard();