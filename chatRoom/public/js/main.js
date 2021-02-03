
const ChatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// getting username and room name from URL with QS library via CDN
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

// join Chat room

socket.emit('joinRoom', {username, room});

// get room & users

socket.on('roomUsers',({room, users})=>{
    outputRoomName(room);
    outputUsers(users);
});

// Message from server
socket.on('message', message=>{
    console.log(message);
    outputMessage(message);

    // scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

//message listner
ChatForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    
    // get text from from
    const msg = e.target.elements.msg.value;

    // emit message to server
    socket.emit('chatMessage', msg);

    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// output message DOM
function outputMessage (message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

// add room to DOM
function outputRoomName (room) {
    roomName.innerHTML = room;
}

// add users to DOM
function outputUsers (users) {
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}