const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

const io = require('socket.io')(server, {
    cors: { origin: "*" }
});

io.on('connection', (socket) => {
    socket.on('joinRoom', (data, cb) => {
        console.log('User joined in ' + data);
        socket.join(data);
        cb(`You have joined the room: ${data}`);
        io.to(data).emit('logmessage', `A new user has joined`);
    });
    
    socket.on('message', (message, room) => {
        io.to(room).emit('message', message, room);
    });

    socket.on('sendChoice', (data, room, numberAsString, clickedValidField) => {
        console.log(data);
        // socket.to(room).emit('getChoice', data);
        socket.broadcast.emit('getChoice', data, room, numberAsString, clickedValidField);
    });
});

const PORT = 8080;
server.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));