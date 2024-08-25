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

// Handle piece selection
function selectPiece(index) {
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => square.classList.remove('selected'));

    if (pieces[index] && pieces[index].startsWith(currentPlayer)) { // Only allow selection of the current player's pieces
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

function enableDiagonalButtons(enable) {
    document.getElementById('move-fl').disabled = !enable;
    document.getElementById('move-fr').disabled = !enable;
    document.getElementById('move-bl').disabled = !enable;
    document.getElementById('move-br').disabled = !enable;
}


// Movement functions
document.getElementById('move-left').addEventListener('click', () => movePiece('L'));
document.getElementById('move-right').addEventListener('click', () => movePiece('R'));
document.getElementById('move-forward').addEventListener('click', () => movePiece('F'));
document.getElementById('move-backward').addEventListener('click', () => movePiece('B'));
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
            step = currentPlayer === 'A' ? -1 : 1; // Player A: Left decreases index, Player B: Left increases index
            break;
        case 'R':
            step = currentPlayer === 'A' ? 1 : -1; // Player A: Right increases index, Player B: Right decreases index
            break;
        case 'F':
            step = currentPlayer === 'A' ? -5 : 5; // Forward: A moves up, B moves down
            break;
        case 'B':
            step = currentPlayer === 'A' ? 5 : -5; // Backward: A moves down, B moves up
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
    // Check out-of-bounds
    if (newIndex < 0 || newIndex >= pieces.length) return false;

    // Check if targeting a friendly character
    if (pieces[newIndex] && pieces[newIndex].startsWith(currentPlayer)) return false;

    // Additional character-specific validation can be added here
    return true;
}

function performMove(piece, index, newIndex, direction) {
    // Combat: Remove any opponent's character in the way or at the destination
    if (piece.includes('H1')) {
        // Hero1: Clear any opponent in the path
        const pathIndices = getPathIndices(index, newIndex, direction, 2);
        pathIndices.forEach(i => {
            if (pieces[i] && !pieces[i].startsWith(currentPlayer)) {
                pieces[i] = ''; // Remove opponent's piece
            }
        });
    } else if (piece.includes('H2')) {
        // Hero2: Clear any opponent in the path
        const pathIndices = getPathIndices(index, newIndex, direction, 2, true);
        pathIndices.forEach(i => {
            if (pieces[i] && !pieces[i].startsWith(currentPlayer)) {
                pieces[i] = ''; // Remove opponent's piece
            }
        });
    } else {
        // Pawn or other character: Only remove the opponent at the destination
        if (pieces[newIndex] && !pieces[newIndex].startsWith(currentPlayer)) {
            pieces[newIndex] = ''; // Remove opponent's piece
        }
    }

    // Perform the move
    pieces[index] = ''; // Clear the old position
    pieces[newIndex] = piece; // Place the piece in the new position
    selectedPiece.index = newIndex; // Update the selected piece's index
    renderBoard(); // Re-render the board to reflect changes
    switchPlayer(); // Switch the turn to the other player and rotate the board
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
    // Switch to the other player
    currentPlayer = currentPlayer === 'A' ? 'B' : 'A';

    // Rotate the board 180 degrees to switch perspectives
    if (currentPlayer === 'B') {
        board.style.transform = 'rotate(180deg)';
        board.childNodes.forEach(child => child.style.transform = 'rotate(180deg)');
    } else {
        board.style.transform = 'rotate(0deg)';
        board.childNodes.forEach(child => child.style.transform = 'rotate(0deg)');
    }

    // Update the current player display
    document.getElementById('current-player').innerText = `Current Player: ${currentPlayer}`;
}

// Initialize the board on page load
renderBoard();
