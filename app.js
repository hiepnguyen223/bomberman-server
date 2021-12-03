const express = require("express");
const { isObject } = require("util");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server, {
    cors: {
      origin: '*',
    }
});

server.listen(3000);

let maxRoomId = 100000;
const clientRooms = {};

io.on("connection", async (socket) => {
    
    console.log("new user connected");

    socket.on("create", (args) => {
        const roomId = ++maxRoomId;
        if(clientRooms[socket.id]) {
            socket.leave(clientRooms[socket.id]);
        } else {
            clientRooms[socket.id] = roomId.toString();
        }
        socket.join(roomId.toString());
        io.to(socket.id).emit('create', roomId.toString());
    })

    socket.on("join", (args) => {
        if(io.sockets.adapter.rooms.get(args) && io.sockets.adapter.rooms.get(args).size <= 2) {
            socket.join(args);
            if(clientRooms[socket.id]) {
                socket.leave(clientRooms.clientRooms[socket.id]);
            } else {
                clientRooms[socket.id] = args;
            }
            io.to(socket.id).emit('join', 'success');
        }  else {
            io.to(socket.id).emit('join', 'error');
        }
    })


    socket.on("action", (args) => {
        const roomId = clientRooms[socket.id];
        if(roomId) {
            socket.broadcast.to(roomId).emit("action", args);
        }
    })

})