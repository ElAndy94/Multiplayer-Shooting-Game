require('./Modular');
var mongojs = require("mongojs"); //require mongo js packages
// var db = mongojs('localhost/shooterGame', ['account']);
var db = mongojs('mongodb://admin:password@ds151908.mlab.com:51908/elandy', ['accounts']);
var express = require('express'); //require the express package
var app = express();  //use the express package
var server = require('http').Server(app);  //require http
var playerName = null;

//db.account.insert({username:"Melissa",password:"Astbury"});
// db.account.remove( {"_id": ObjectId("4d512b45cc9374271b02ec4f")});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));  //use the client file, which contails index.html
// connection.connect();

server.listen(5000);   //listens to the localhost:8081
console.log("Server started.");  //Sends "sever started" to the server, so i can see when ive connected.

var SOCKET_LIST = {};

var isValidPassword = function (data, cb) { //data + call back
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

// asyncCall().then(result => console.log(result));

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
// asyncCall().then((res) => console.log(res)); *****************************

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
      //   console.log('before' + obj.highestScore);
      // obj.highestScore = obj.score;
      // console.log(obj.highestScore);
      console.log('High Score Updated');
    }
  });
}

var takenUser = function (data, cb) {
  db.accounts.find({ username: data.username }, function (err, res) {
    if (res.length > 0) //if match then its correct! SO LET USER LOG IN!
      cb(true);
    else
      cb(false);
  });
}

var addPlayer = function (data, cb) {
  db.accounts.insert({ username: data.username, password: data.password, score: 0 }, function (err, res) {
    if (res.length > 0) //if match then its correct! SO LET USER LOG IN!
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
        // socket.emit('playerData',(data.username));
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

  // socket.emit('allScores', asyncCall());
  // asyncCall.then((res) => socket.emit('allScores', res))
  asyncCall().then((res) => socket.emit('allScores', res));

});

setInterval(function () {
  var packs = Shared.makeModular();
  for (var i in SOCKET_LIST) {
    var socket = SOCKET_LIST[i];
    socket.emit('starterPack', packs.infoPack);
    socket.emit('update', packs.updatePack);
    socket.emit('remove', packs.removePack);
    // socket.emit('allScores', getAllScores);
  }
}, 1000 / 25);

// module.exports = checkInfo;
