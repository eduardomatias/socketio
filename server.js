const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const chat = createChat();

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {

    console.log('> Connected: ' + socket.id);
    chat.addUser(socket.id);

    socket.on('disconnect', () => {
        chat.removeUser(socket.id);
        console.log('> Disconnected: ' + socket.id);
    });

    socket.on('chat message', (msg) => {
        io.emit('chat message', socket.id + ": " + msg);
    });

    socket.emit('init', chat);

    // envia informações para os outros sobre o novo usuário
    socket.broadcast.emit('new user', socket.id);
    socket.broadcast.emit('chat message', "<strong>New user: " + socket.id + "</strong>");

});

http.listen(3000, () => {
    console.log('listening on *:3000');
});

function createChat() {

    const chat = {
        users: {},
        addUser,
        removeUser
    }

    function addUser(socketId) {
        return chat.users[socketId] = Date.now();
    }

    function removeUser(socketId) {
        delete chat.users[socketId];
    }

    return chat;

}