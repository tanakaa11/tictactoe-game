const socket = io();

let symbol;
let isMyTurn = false;

function joinRoom(roomId) {
    socket.emit('joinRoom', roomId);
}

socket.on('joinedRoom', (roomId, playerSymbol) => {
    console.log(`Joined room ${roomId} as ${playerSymbol}`);
    symbol = playerSymbol;
    // Update UI or perform actions after successfully joining a room
});

socket.on('playerJoined', (playerId, playerSymbol) => {
    console.log(`Player ${playerId} joined as ${playerSymbol}`);
    // Update UI to reflect the new player
});

socket.on('playerLeft', (playerId) => {
    console.log(`Player ${playerId} left`);
    // Update UI to reflect the player leaving
});

socket.on('moveMade', (playerId, index) => {
    console.log(`Player ${playerId} made a move at index ${index}`);
    // Update the game board to reflect the move
    handleRemoteMove(index);
    isMyTurn = true; // Set the turn to the local player after a remote move
});

function handleCellClick(index) {
    if (!isMyTurn || cells[index] !== null) {
        return;
    }

    // Make a move
    cells[index] = symbol;
    const cellElement = cellElements[index];
    cellElement.textContent = symbol;
    cellElement.classList.add('active');

    buttonClickSound.play();

    const result = checkWin();
    if (result !== null) {
        gameOver(result);
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    isMyTurn = false; // Set the turn to the other player after a local move

    // Emit the move to other players in the room
    socket.emit('makeMove', index);
}

// Add other functions and game logic as needed
