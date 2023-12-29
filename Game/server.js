const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

const rooms = {};

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        socket.room = roomId;

        if (!rooms[roomId]) {
            rooms[roomId] = { players: {} };
        }

        // Assign a symbol ('X' or 'O') to the player
        const symbols = ['X', 'O'];
        const symbol = symbols[Object.keys(rooms[roomId].players).length % 2];
        rooms[roomId].players[socket.id] = { symbol };

        io.to(socket.id).emit('joinedRoom', roomId, symbol);

        // Broadcast to other players that a new player has joined
        socket.to(roomId).emit('playerJoined', socket.id, symbol);

        console.log(`User ${socket.id} joined room ${roomId} as ${symbol}`);
    });

    socket.on('disconnect', () => {
        const roomId = socket.room;
        if (rooms[roomId] && rooms[roomId].players[socket.id]) {
            socket.to(roomId).emit('playerLeft', socket.id);
            delete rooms[roomId].players[socket.id];
            console.log(`User ${socket.id} left room ${roomId}`);
        }
    });

    socket.on('makeMove', (index) => {
        const roomId = socket.room;
        if (rooms[roomId]) {
            socket.to(roomId).emit('moveMade', socket.id, index);
        }
    });
});

const PORT = process.env.PORT || 5500;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
