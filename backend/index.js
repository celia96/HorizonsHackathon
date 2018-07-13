const express = require('express/')
const app = express()
const mongoose = require('mongoose');
mongoose.connect(process.env.MLAB);



const User = mongoose.model('User', {
  name: String
})

const Game = mongoose.model('Game', {
  player1: Object,
  player2: Object
})



app.post('/nickname', (req,res)=> {
  new User(req.body)
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
  .then((product) => res.json({success: true, game: product._id}))
  .catch((err) => {
    console.log(err)
    res.json({success:false})
})

app.post('/decreaseLife', (req,res) => {
  Game.findById(req.body.game, (err,obj) => {
    var gameover = false
    for (var item in obj) {
      item.id!==req.body.myId ? obj.item.life = obj.item.life-1 : null
      obj.item.life === 0 ? gameover = true : null
    }
    Game.findByIdAndUpdate(req.game, obj, (err2) => {
      if (err2) {
        console.log(err2)
        res.json({success: false})
      } else {
        res.json({success:true, game: obj, gameover: gameover})
      }
    })
  })
})


app.listen(process.env.PORT || 3000);