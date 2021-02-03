const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const express = require('express');
const formatMessage = require('./util/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./util/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// static folder
app.use(express.static(path.join(__dirname, 'public')));


const botName = 'Admin';
// on client connet this will run
io.on('connection', socket =>{

    socket.on('joinRoom',({username, room})=>{

        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        // Welcome cunrrent user
        socket.emit('message', formatMessage(botName, 'Welcome to JustChat'));

        // on new user Connect
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat!`));
    
        // send user & room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });
    // listen to chat message
    socket.on('chatMessage', msg=>{
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    //on disconnect
    socket.on('disconnect',()=>{
    const user = userLeave(socket.id);

    if(user){
    io.to(user.room).emit('message',formatMessage(botName, `${user.username} has left the chat!`));
    
    // send user & room info
    io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
    });
}
});
}); 

PORT = 3000 || process.env.PORT;

server.listen(PORT, ()=> console.log(`server running at PORT ${PORT}`));