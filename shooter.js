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

var Shared = function(){
    var self = {
      x:Math.random() * 500, // X of the character or bullet
      y:Math.random() * 500, // Y of the character or bullet
      speedX:0, //speed X defult to 0
      speedY:0, //speed Y defult to 0
      id:"",
    }
    self.update = function(){
        self.updatePos(); //update char or bullet position
    }
    self.updatePos = function(){
        self.x += self.speedX;
        self.y += self.speedY;
    }
    self.getDist = function(pt){
        return Math.sqrt(Math.pow(self.x-pt.x,2) + Math.pow(self.y-pt.y,2)); //calculates distance
    }
    return self;
}


var Player = function(id){
  var self = Shared(); //shared properties between bullet and player
    self.id = id;
    self.number = '' + Math.floor(10 * Math.random());
    self.pRight = false; //moving right auto false
    self.pLeft = false; //moving left auto false
    self.pUp = false; //moving up auto false
    self.pDown = false; //moving down auto false
    self.pAttack = false; //attacking set to fasle which is shooting!
    self.mouseAngle = 0; //mouse or touchpad angle
    self.maxSpeed = 3; //moving speed 10 (need to modify this)***
    self.healthPoints = 10; // player hp
    self.maxHealthPoints = 10; // the max hp a player starts with
    self.score = 0; //score starts at 0, +1 for every kill.

  
    var second_update = self.update;
    self.update = function(){
        self.updateSpeed();
        second_update();

        if(self.pAttack){ 
            self.fireBullet(self.mouseAngle);
        }
  }
  self.fireBullet = function(angle){
    var b = Bullet(self.id,angle); //bullet id, with angle pack
    b.x = self.x;
    b.y = self.y;
  }


  self.updateSpeed = function(){
    if(self.pRight)
          self.speedX = self.maxSpeed;
    else if(self.pLeft)
          self.speedX = -self.maxSpeed;
    else
          self.speedX = 0; //reset movement speeds
          // self.speedY = 0;

    if (self.pUp)
          self.speedY = -self.maxSpeed;
    else if(self.pDown)
          self.speedY = self.maxSpeed;
    else
          self.speedY = 0; //reset movement speeds
          // self.speedX = 0;
    }

    self.retriveStarterPack = function(){
      return {
              id:self.id,
              x:self.x,
              y:self.y,
              number:self.number,
              healthPoints:self.healthPoints,
              maxHealthPoints:self.maxHealthPoints,
              score:self.score,
            };
    }

    self.getUpdatePack = function(){
      return {
              id:self.id,
              x:self.x,
              y:self.y,
              healthPoints:self.healthPoints,
              score:self.score,
            };
    }

    Player.list[id] = self;

    starterPack.player.push(self.retriveStarterPack());
    
    return self;
}

Player.list = {};
Player.onConnect = function(socket){
    var player = Player(socket.id);
    socket.on('movementKey',function(data){
      if(data.inputId === 'left')
          player.pLeft = data.state; //moving left
      else if(data.inputId === 'right')
          player.pRight = data.state; //moving right
      else if(data.inputId === 'up')
          player.pUp = data.state; //moving up
      else if(data.inputId === 'down')
          player.pDown = data.state; //moving down on keyboard
      else if(data.inputId === 'attack')
          player.pAttack = data.state; //if click = true
      else if(data.inputId === 'mouseAngle')
          player.mouseAngle = data.state; //mouse angle (direction of shooting)
    });


    socket.emit('starter',{
        player:Player.startPack(),
        bullet:Bullet.startPack(),
    })
}

Player.startPack = function(){
  var players = [];
  for(var i in Player.list)
      players.push(Player.list[i].retriveStarterPack());
      return players;
}

Player.onDisconnect = function(socket){ 
    delete Player.list[socket.id]; //delete player from players list
    deletePack.player.push(socket.id);
}
Player.update = function(){
  var pack = [];
  for(var i in Player.list){
    var player = Player.list[i];
    player.update(); //update player
    pack.push(player.getUpdatePack());//push player number, x & y
  }
  return pack;
}

var Bullet = function(parent,angle){ //bullet 
    var self = Shared(); //uses shared properties with player
    self.id = Math.random(); //random id
    self.speedX = Math.cos(angle/180*Math.PI) * 10; 
    self.speedY = Math.sin(angle/180*Math.PI) * 10;
    self.parent = parent; //so you dont shoot yourself.
    self.timer = 0; //bullet timer - dies at 100.
    self.toRemove = false; //if shot yourself then = true.
    var second_update = self.update;
    
    self.update = function(){
        if(self.timer++ > 100) //timeout on bullet traveling
          self.toRemove = true; //removes it
        second_update();

        for (var i in Player.list){
          var p = Player.list[i]
          if(self.getDist(p) < 32 && self.parent !== p.id){ //gets distance
            p.healthPoints -= 1;

            if(p.healthPoints <= 0){
              var enemy = Player.list[self.parent];
            if(enemy)
              enemy.score += 1;
              p.healthPoints = p.maxHealthPoints;
              p.x = Math.random() * 500;
              p.y = Math.random() * 500;
            }
              self.toRemove = true;
          }
        }
    }

    self.retriveStarterPack = function(){
      return {
              id:self.id,
              x:self.x,
              y:self.y,
            };
    }

    self.getUpdatePack = function(){
      return {
              id:self.id,
              x:self.x,
              y:self.y,
            };
    }

    Bullet.list[self.id] = self;
    starterPack.bullet.push(self.retriveStarterPack());
    return self;
}
Bullet.list = {}; //bullet 

Bullet.update = function(){  //pushes bullet
  var pack = [];
  for(var i in Bullet.list){
    var bullet = Bullet.list[i];
      bullet.update();
      if(bullet.toRemove){
        delete Bullet.list[i]
        deletePack.bullet.push(bullet.id);
      } else
          pack.push(bullet.getUpdatePack());
  }
  return pack;
}

Bullet.startPack = function(){
  var bullets = [];
    for(var i in Bullet.list)
        bullets.push(Bullet.list[i].retriveStarterPack());
        return bullets;
}


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

var starterPack = {player:[],bullet:[]};
var deletePack =  {player:[],bullet:[]};


setInterval(function(){
  var pack = {
      player:Player.update(), //refreshes player intervals
      bullet:Bullet.update(), //refreshes bullets intervals
  }

  for (var i in SOCKET_LIST){
    var socket = SOCKET_LIST[i];
    socket.emit('starterPack',starterPack);
    socket.emit('update',pack); //emits new positions
    socket.emit('deletePack',deletePack);
  }
  starterPack.player = []; //sets everything to 0 so it doesnt repeat / replicate
  starterPack.bullet = []; //sets everything to 0 so it doesnt repeat / replicate
  deletePack.player = []; //sets everything to 0 so it doesnt repeat / replicate
  deletePack.bullet = []; //sets everything to 0 so it doesnt repeat / replicate


},1000/25);
