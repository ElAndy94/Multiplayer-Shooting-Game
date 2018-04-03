require('./server-logic');
var mongojs = require("mongojs"); //require mongo js packages
var db = mongojs('mongodb://admin:password@ds151908.mlab.com:51908/elandy', ['accounts']);

var express = require('express'); //require the express package
var app = express();  //use the express package
var server = require('http').Server(app);  //require http
var playerName = null;
var path = require('path');

// var db = mongojs('localhost/shooterGame', ['account']);
//db.account.insert({username:"Melissa",password:"Astbury"});
// db.account.remove( {"_id": ObjectId("4d512b45cc9374271b02ec4f")});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));  //use the client file, which contails index.html
app.use(express.static(path.join(__dirname, 'public')));
server.listen(process.env.PORT || 5000);
// server.listen(8081);   //listens to the localhost:8081
console.log("Server started.");  //Sends "sever started" to the server, so i can see when ive connected.

var SOCKET_LIST = {};

var isValidPassword = function (data, cb) { 
  db.accounts.find({ username: data.username, password: data.password }, function (err, res) {
    if (res.length > 0) { //if match then its correct! SO LET USER LOG IN!
      playerName = data.username;
      cb(true);
    }
    else {
      cb(false);
    }
  });
}

function resolveAfter1() {
  return new Promise((resolve, reject) => {
    var scoresFromDb = db.accounts.find({}, { username: 1, score: 1 }).toArray(function (err, result) {
      if (err)
        reject(err);
      else
        resolve(result);
    });
  });
}

resolveAfter1() // resolve function
  .then((result) => { console.log(result); })
  .catch((error) => { console.log(error); })

async function asyncCall() {
  var result = await resolveAfter1();
  return result
}

module.exports.checkInfo = function (obj) {
  db.accounts.findOne({ username: playerName }, function (err, result) {
    if (err) console.log(err);
    var currentHighScore = result.score;
    // Check the new score is higher than current high score
    if (obj.score > currentHighScore) {
      // update the db if it is
      db.accounts.update({ username: playerName },
        {
          $set: {
            // 'username' : playerName,
            'score': obj.score
          }
        })
      console.log('High Score Updated');
    }
  });
}

var takenUser = function (data, cb) {
  db.accounts.find({ username: data.username }, function (err, res) {
    if (res.length > 0) //if match then error
      cb(true);
    else
      cb(false);
  });
}

var addPlayer = function (data, cb) {
  db.accounts.insert({ username: data.username, password: data.password, score: 0 }, function (err, res) {
      cb();
  });
}

var io = require('socket.io')(server, {});
io.sockets.on('connection', function (socket) {
  socket.id = Math.random(); //adds random socket id to player
  SOCKET_LIST[socket.id] = socket;


  socket.on('LogIn', function (data) {
    isValidPassword(data, function (res) {
      if (res) {
        Player.onConnect(socket);
        socket.emit('LogInResponse', { success: true });
      } else {
        socket.emit('LogInResponse', { success: false });
      }
    });
  });

  socket.on('signUp', function (data) {
    takenUser(data, function (res) {
      if (res) {
        socket.emit('signPlayerRes', { success: false });
      } else {
        addPlayer(data, function () {
          socket.emit('signPlayerRes', { success: true });
        });
      }
    });
  });

  socket.on('disconnect', function () { //disconnect by deleting socket id and player
    delete SOCKET_LIST[socket.id];
    Player.onDisconnect(socket);
  });

  asyncCall().then((res) => socket.emit('allScores', res));

});

setInterval(function () {
  var packs = Shared.makeModular();
  for (var i in SOCKET_LIST) {
    var socket = SOCKET_LIST[i];
    socket.emit('starterPack', packs.infoPack);
    socket.emit('update', packs.updatePack);
    socket.emit('remove', packs.removePack);
  }
}, 1000 / 25);
