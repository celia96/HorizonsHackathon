const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose');

var http = require('http')
var socketio = require('socket.io');
var server = http.Server(app);
var websocket = socketio(server);
server.listen(3000, () => console.log('listening on *:3000'));

mongoose.connect(process.env.MLAB);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Mapping objects to easily map sockets and users.
var clients = {};
var users = {};

// This represents a unique chatroom.
// For this example purpose, there is only one chatroom;

const User = mongoose.model('User', {
   name: String,
   // inGame: Boolean,
   // gameId: String,
   invitation: Object
})

const Game = mongoose.model('Game', {
 player1: Object,
 player2: Object
})

websocket.on('connection', (socket) => {
    clients[socket.id] = socket;
    socket.on('userJoined', (username) => {
       new User({
         name: username,
       }).save()
         .then((product) => socket.emit('userCreated', product._id))
         .catch((err) => {
           console.log(err)
           res.json({success:false})
         })
      })

    socket.on('playerList', () => {
      User.find()
      .then(arr => socket.emit('players', arr))
    });

    socket.on('invite', (obj) => {
      let inv = {id:obj.id,name:obj.name}
      User.findByIdAndUpdate(obj.opp, {invitation: inv})
          .then(socket.broadcast.emit('invited', inv))
          .catch(err=>console.log(err))
    })

    socket.on('game', (obj) => {
      var game = new Game({
         player1: {
           name: obj.me,
           id: obj.myid,
           life: 5
         },
         player2: {
           name: obj.opp,
           id: obj.oppid,
           life: 5
         }
       })
       game.save()
       .then(websocket.emit('gameplay', game))
       .catch((err) => {
         console.log(err)
      })
    })

});
