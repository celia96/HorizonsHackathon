const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose');

// var http = require('http')
// var socketio = require('socket.io');
// var server = http.Server(app);
// var websocket = socketio(server);
// server.listen(3000, () => console.log('listening on *:3000'));

mongoose.connect(process.env.MLAB);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// // Mapping objects to easily map sockets and users.
// var clients = {};
// var users = {};
//
// // This represents a unique chatroom.
// // For this example purpose, there is only one chatroom;
// var chatId = 1;
//
// websocket.on('connection', (socket) => {
//     clients[socket.id] = socket;
//     socket.on('userJoined', (userId) => onUserJoined(userId, socket));
//     socket.on('message', (message) => onMessageReceived(message, socket));
// });

const User = mongoose.model('User', {
   name: String,
   inGame: Boolean,
   gameId: String,
   invitation: Object
})

const Game = mongoose.model('Game', {
 player1: Object,
 player2: Object
})

app.post('/deleteInvitation', (req,res)=> {
  User.findByIdAndUpdate(req.body.id, {invitation:{}})
    .then(res.json({success:true}))
    .catch(err=>res.json({success:false}))
})

app.post('/giveInvitation', (req,res) => {
  console.log('giving invitation')
  User.findByIdAndUpdate(req.body.player2.id, {invitation:req.body.player1})
    .then(res.json({success:true}))
    .catch(err=>res.json({success:false}))
})

app.post('/getInvitation', (req,res) => {
  console.log("Getting Invitation", 'myID'+ req.body.id);
  User.findById(req.body.id)
    .then((result) => {
      console.log("Invitation: ", result);
      var inv = {};
      if (result.invitation) {
        var inv = result.invitation
      }
      return inv;
    })
    .then((inv) => {
      User.findByIdAndUpdate(req.body.id, {invitation: {}})
        .then(() => {
          res.json({success:true, invitation:inv})
        })
    })
})

app.post('/nickname', (req,res)=> {
 console.log(req.body);
 new User({
   name: req.body.name,
   invitation: {},
   inGame:false,
   gameId: ''
 })
   .save()
   .then((product) => res.json({success: true, id: product._id}))
   .catch((err) => {
     console.log(err)
     res.json({success:false})
   })
})

app.get('/users', (req,res) => {
 User.find()
   .then((arr) => res.send(arr))
})

app.post('/gamestart', (req,res) => {
 var gameID = '';
 new Game({
   player1: {
     name: req.body.player1.name,
     id: req.body.player1.id,
     life: 5
   },
   player2: {
     name: req.body.player2.name,
     id: req.body.player2.id,
     life: 5
   }
 }).save()
 .then((product) => {gameID = product._id})
 .then(() => User.findByIdAndUpdate(req.body.player1.id, {inGame:true, gameId:gameID}))
 .then(() => User.findByIdAndUpdate(req.body.player2.id, {inGame:true, gameId:gameID}))
 // .then(User.findByIdAndUpdate(req.body.player2.id, {inGame:true, gameId:gameID}))
 .catch((err) => {
   console.log(err)
   res.json({success:false})
 })
})

app.post('/checkingame', (req,res)=> {
  console.log('checking');
    User.findById(req.body.id)
      .then((result)=> {
        res.json({game:result.game})
      })
      .catch(err=>console.log(err))
  })

app.post('/decreaseLife', (req,res) => {
 Game.findById(req.body.game, (err,obj) => {
   var gameover = false
   var winner;
   for (var item in obj) {
     item.id!==req.body.myId ? obj.item.life = obj.item.life-1 : null
     if (obj.item.life === 0) {
       gameover = true
       winner = obj.item.name
     }
   }
   Game.findByIdAndUpdate(req.body.game, obj, (err2) => {
     if (err2) {
       console.log(err2)
       res.json({success: false})
     } else {
       res.json({success:true, game: obj, winner: winner, gameover: gameover})
     }
   })
 })
})


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}!`);
});
