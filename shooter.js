var express = require('express'); //require the express package
var app = express();  //use the express package
var server = require('http').Server(app);  //require http


app.get('/',function(req, res){
  res.sendFile(__dirname + '/client/index.html');
});
  app.use('/client' ,express.static(__dirname + '/client'));  //use the client file, which contails index.html
// connection.connect();

server.listen(8081);   //listens to the localhost:8081
console.log("Server started.");  //Sends "sever started" to the server, so i can see when ive connected.

var SOCKET_LIST = {};
//var PLAYER_LIST = {};

var Shared = function(){
    var self = {
      x:250,
      y:250,
      speedX:0,
      speedY:0,
      id:"",
    }
    self.update = function(){
        self.updatePos();
    }
    self.updatePos = function(){
        self.x += self.speedX;
        self.y += self.speedY;
    }
    self.getDist = function(pt){
        return Math.sqrt(Math.pow(self.x-pt.x,2) + Math.pow(self.y-pt.y,2));
    }
    return self;
}


var Player = function(id){
  var self = Shared();
    self.id = id;
    self.number = '' + Math.floor(10 * Math.random());
    self.pRight = false;
    self.pLeft = false;
    self.pUp = false;
    self.pDown = false;
    self.pAttack = false;
    self.mouseAngle = 0;
    self.maxSpeed = 10;

    var second_update = self.update;
    self.update = function(){
        self.updateSpeed();
        second_update();

        if(self.pAttack){
            self.fireBullet(self.mouseAngle);
        }
  }
  self.fireBullet = function(angle){
    var b = Bullet(self.id,angle);
    b.x = self.x;
    b.y = self.y;
  }

  self.updateSpeed = function(){
    if(self.pRight)
          self.speedX = self.maxSpeed;
    else if(self.pLeft)
          self.speedX = -self.maxSpeed;
    else
          self.speedX = 0;

    if (self.pUp)
          self.speedY = -self.maxSpeed;
    else if(self.pDown)
          self.speedY = self.maxSpeed;
    else
          self.speedY = 0;
    }
    Player.list[id] = self;
    return self;
}

Player.list = {};
Player.onConnect = function(socket){
    var player = Player(socket.id);
    socket.on('movementKey',function(data){
      if(data.inputId === 'left')
          player.pLeft = data.state;
      else if(data.inputId === 'right')
          player.pRight = data.state;
      else if(data.inputId === 'up')
          player.pUp = data.state;
      else if(data.inputId === 'down')
          player.pDown = data.state;
      else if(data.inputId === 'attack')
          player.pAttack = data.state;
      else if(data.inputId === 'mouseAngle')
          player.mouseAngle = data.state;
    });
}
Player.onDisconnect = function(socket){
    delete Player.list[socket.id];
}
Player.update = function(){
  var pack = [];
  for(var i in Player.list){
    var player = Player.list[i];
    player.update();
    pack.push({
      x:player.x,
      y:player.y,
      number:player.number
    });
  }
  return pack;
}

var Bullet = function(parent,angle){
    var self = Shared();
    self.id = Math.random();
    self.speedX = Math.cos(angle/180*Math.PI) * 10;
    self.speedY = Math.sin(angle/180*Math.PI) * 10;
    self.parent = parent;
    self.timer = 0;
    self.toRemove = false;
    var second_update = self.update;
    self.update = function(){
        if(self.timer++ > 100)
          self.toRemove = true;
        second_update();

        for (var i in Player.list){
          var p = Player.list[i]
          if(self.getDist(p) < 32 && self.parent !== p.id){
              self.toRemove = true;
          }
        }
    }
    Bullet.list[self.id] = self;
    return self;
}
Bullet.list = {};

Bullet.update = function(){
  var pack = [];
  for(var i in Bullet.list){
    var bullet = Bullet.list[i];
      bullet.update();
      if(bullet.toRemove)
        delete Bullet.list[i]
      else
          pack.push({
          x:bullet.x,
          y:bullet.y
      });
  }
  return pack;
}

var DEBUG = true;

var ONLINEUSERS = {
  'andy':'peliza',
  'a':'p',
  'andrew':'peliza',
}

var isValidPassword = function(data){
    return ONLINEUSERS[data.username] === data.password;
}

var io = require('socket.io')(server,{});
io.sockets.on('connection', function(socket){
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;

    socket.on('LogIn',function(data){
      if(isValidPassword(data)){
         Player.onConnect(socket);
         socket.emit('LogInResponse',{success:true});
      } else {
         socket.emit('LogInResponse',{success:false});
      }
    })


    socket.on('disconnect',function(){
      delete SOCKET_LIST[socket.id];
      Player.onDisconnect(socket);
    });
    socket.on('sendMsgToSever',function(data){
      var playerName = ('' + socket.id).slice(2,7);
      for(var i in SOCKET_LIST) {
        SOCKET_LIST[i].emit('addToChat',playerName + ': ' + data);
      }
    });
    socket.on('evalServer',function(data){
      if(!DEBUG)
              return;

      var res = eval(data);
      socket.emit('evalAnswer',res);
    })

});

setInterval(function(){
  var pack = {
      player:Player.update(),
      bullet:Bullet.update(),
  }

  for (var i in SOCKET_LIST){
    var socket = SOCKET_LIST[i];
    socket.emit('newPos',pack);
  }
},1000/25);
