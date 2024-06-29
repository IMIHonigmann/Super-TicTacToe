const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

const io = require('socket.io')(server, {
    cors: { origin: "*" }
});

io.on('connection', (socket) => {
    console.log('client connected');
    const onlineCount = io.engine.clientsCount;
    io.emit('sendPlayerCount', onlineCount);
    socket.on('joinRoom', (data, cb) => {
        const roomSize = io.sockets.adapter.rooms.get(data)?.size || 0;
        if(roomSize < 2) {
            console.log('User joined in ' + data);
            socket.join(data);
            socket.to(data).emit('logmessage', `A new user has joined`);
            cb(`You have successfully joined the room: ${data}`);
        }
        else {
            cb(`You cannot join because room: ${data} is full`);
        }
    });

    socket.on('disconnect', () => {
        console.log('client disconnected');
        const onlineCount = io.engine.clientsCount;
        io.emit('sendPlayerCount', onlineCount);
    });
    
    socket.on('message', (message, room) => {
        io.to(room).emit('message', message, room);
    });

    socket.on('sendChoice', (socketID, data, room, numberAsString, clickedValidField) => {
        const roomIdentifier = io.sockets.adapter.rooms.get(room);
        if (typeof roomIdentifier !== "undefined") if(roomIdentifier.has(socketID)) socket.to(room).emit('getChoice', data, room, numberAsString, clickedValidField);
        // socket.broadcast.emit('getChoice', data, room, numberAsString, clickedValidField);
    });
});

const PORT = 8080;
server.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));