var express = require('express');
const app = express();
const socketio = require('socket.io');

let namespaces = require('./data/namespaces');
// console.log(namespaces);



app.use(express.static(__dirname + '/public'));

const expressServer = app.listen(9000);
const io = socketio(expressServer);


io.on('connection', (socket) => {
  //build an array to send back with the img and endpoint for the each NS
  let nsData = namespaces.map((ns) => {
    return {
      img: ns.img,
      endpoint: ns.endpoint
    }
  });
  // console.log(nsData);
  socket.emit('nsList', nsData);
})

// loop through each namespace and listen for a connection
namespaces.forEach((namespace) => {
  // console.log(namespace);
  //server listening on specified endpoint for event = connection
  io.of(namespace.endpoint).on('connection', (nsSocket) => {
    const username = nsSocket.handshake.query.username;
    // console.log(`${nsSocket.id} has join ${namespace.endpoint}`);
    // a socket has connected to one of our chatgroup namespaces. send that ns group info back
    nsSocket.emit('nsRoomLoad', namespace.rooms)
    nsSocket.on('joinRoom', (roomToJoin, numberOfUsersCallback) => {
      // leave prevoius rooms to join new
      const roomToLeave = Object.keys(nsSocket.rooms)[1];
      nsSocket.leave(roomToLeave);
      updateUsersInRoom(namespace, roomToLeave);
      //deal with history....once we have it
      nsSocket.join(roomToJoin);
      // io.of('/wiki').in(roomToJoin).clients((error, clients) => {
      //   console.log(clients.length);
      //   numberOfUsersCallback(clients.length);
      // })
      const nsRoom = namespace.rooms.find((room) => {
        return room.roomTitle === roomToJoin;
      })
      nsSocket.emit('historyCatchup', nsRoom.history);
      updateUsersInRoom(namespace, roomToJoin);
    })
    nsSocket.on('newMessageToServer', (msg) => {
      const fullMsg = {
        text: msg.text,
        time: Date.now(),
        username: username,
        avatar: 'https://via.placeholder.com/30'
      }
      // console.log(fullMsg);
      //Send this message to all the sockets that are present in the room that this socket is in.
      // how can we find out what rooms this socket is in?
      // console.log(nsSocket.rooms);
      //this user will be in the 2nd room in the object list 
      // this is bcoz the socket always joins its own room on connection
      //get the keys of rooms object
      const roomTitle = Object.keys(nsSocket.rooms)[1];
      // we need to find the Room object for this room
      const nsRoom = namespace.rooms.find((room) => {
        return room.roomTitle === roomTitle;
      })
      // console.log("!!!!!!!!!!!!!");
      // console.log(nsRoom);
      nsRoom.addMessage(fullMsg);
      io.of(namespace.endpoint).to(roomTitle).emit('messageToClients', fullMsg);
    })
  })
})

function updateUsersInRoom(namespace, roomToJoin) {
  // send back the number of users in this room to all sockets connected to this room
  io.of(namespace.endpoint).in(roomToJoin).clients((error, clients) => {
    // console.log(`There are ${clients.length} in this room`);
    io.of(namespace.endpoint).in(roomToJoin).emit('updateMembers', clients.length);
  })
}