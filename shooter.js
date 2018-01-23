require('./Modular');
var mongojs = require("mongojs"); //require mongo js packages
var db = mongojs('localhost/shooterGame', ['account','score']);
var express = require('express'); //require the express package
var app = express();  //use the express package
var server = require('http').Server(app);  //require http

//db.account.insert({username:"Melissa",password:"Astbury"});

app.get('/',function(req, res){
  res.sendFile(__dirname + '/client/index.html');
});
  app.use('/client' ,express.static(__dirname + '/client'));  //use the client file, which contails index.html
// connection.connect();

server.listen(8081);   //listens to the localhost:8081
console.log("Server started.");  //Sends "sever started" to the server, so i can see when ive connected.

var SOCKET_LIST = {};

// var enemyTarget = {
// 	x:Math.random() * 500, //random location for the enemy
//   y:Math.random() * 500,  //random location for the enemy
//   hp:10,
// }

var isValidPassword = function(data,cb){ //data + call back
  db.account.find({username:data.username,password:data.password},function(err,res){
      if(res.length > 0) //if match then its correct! SO LET USER LOG IN!
        cb(true);
      else
        cb(false);
  });
}

var takenUser = function(data,cb){
  db.account.find({username:data.username},function(err,res){
    if(res.length > 0) //if match then its correct! SO LET USER LOG IN!
      cb(true);
    else
      cb(false);
});
}

var addPlayer = function(data,cb){ 
  db.account.insert({username:data.username,password:data.password},function(err,res){
    if(res.length > 0) //if match then its correct! SO LET USER LOG IN!
      cb();
    });
}

var io = require('socket.io')(server,{});
io.sockets.on('connection', function(socket){
    socket.id = Math.random(); //adds random socket id to player
    SOCKET_LIST[socket.id] = socket;

    socket.on('LogIn',function(data){
      isValidPassword(data,function(res){
        if(res){
        Player.onConnect(socket);
        socket.emit('LogInResponse',{success:true});
      } else {
         socket.emit('LogInResponse',{success:false});
      }
    });
  });

    socket.on('signUp',function(data){
      takenUser(data,function(res){
        if(res){
         socket.emit('signPlayerRes',{success:false});
      } else {
        addPlayer(data,function(){
         socket.emit('signPlayerRes',{success:true});
        });
      }
    });
  });

    socket.on('disconnect',function(){ //disconnect by deleting socket id and player
      delete SOCKET_LIST[socket.id];
      Player.onDisconnect(socket);
    });


 });

 setInterval(function(){
	var packs = Shared.getFrameUpdateData();
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('starterPack',packs.initPack);
		socket.emit('update',packs.updatePack);
		socket.emit('remove',packs.removePack);
	}
// setInterval(function(){
//   var pack = {
//       player:Player.update(), //refreshes player intervals
//       bullet:Bullet.update(), //refreshes bullets intervals
//   }

//   for (var i in SOCKET_LIST){
//     var socket = SOCKET_LIST[i];
//     socket.emit('starterPack',initPack);
//     socket.emit('update',pack); //emits new positions
//     socket.emit('remove',removePack);
//     // socket.emit('enemyTarget',enemyTarget);
//   }
//   initPack.player = []; //sets everything to 0 so it doesnt repeat / replicate
//   initPack.bullet = []; //sets everything to 0 so it doesnt repeat / replicate
//   removePack.player = []; //sets everything to 0 so it doesnt repeat / replicate
//   removePack.bullet = []; //sets everything to 0 so it doesnt repeat / replicate


},1000/25);
