var infoPack = {player:[],bullet:[],target:[]};
var removePack =  {player:[],bullet:[],target:[]};

Shared = function(){
    var self = {
      x:Math.random() * 500, // X of the character 
      y:Math.random() * 500, // Y of the character 
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

Shared.makeModular = function(){ //this is what makes my project modular
	var pack = {
		infoPack:{
			player:infoPack.player, 
      bullet:infoPack.bullet,
      target:infoPack.target, 
		},
		removePack:{
			player:removePack.player,
      bullet:removePack.bullet,
      target:removePack.target,
		},
		updatePack:{
			player:Player.update(),
      bullet:Bullet.update(),
      target:Target.update(),
		}
  };
  
infoPack.player = []; //sets to empty so it does not repeat/duplicate
    infoPack.bullet = []; //sets to empty so it does not repeat/duplicate
    // infoPack.target = []; //sets to empty so it does not repeat/duplicate
    removePack.player = [];  //sets to empty so it does not repeat/duplicate
    removePack.bullet = [];  //sets to empty so it does not repeat/duplicate
    // removePack.target = [];  //sets to empty so it does not repeat/duplicate
    return pack;
}

Player = function(id){
  var self = Shared(); //shared properties between bullet and player
    self.id = id;
    self.number = '' + Math.floor(10 * Math.random());
    self.pRight = false; //moving right auto false
    self.pLeft = false; //moving left auto false
    self.pUp = false; //moving up auto false
    self.pDown = false; //moving down auto false
    self.pAttack = false; //attacking set to fasle which is shooting!
    self.mouseAngle = 0; //mouse or touchpad angle
    self.maxSpeed = 10; //moving speed 10 (need to modify this)***
    self.healthPoints = 10; // player hp
    self.maxHealthPoints = 10; // the max hp a player starts with
    self.score = 0; //score starts at 0, +1 for every kill.

    

var second_update = self.update;
    self.update = function(){ //this function calls a secondary update
        self.updateSpeed();
        second_update();

        if(self.pAttack){ 
            self.fireBullet(self.mouseAngle); //mouse angle attack
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

self.retrieveInfoPack = function(){
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

    self.retrieveUpdatePack = function(){
      return {
              id:self.id,
              x:self.x,
              y:self.y,
              healthPoints:self.healthPoints,
              score:self.score,
            };
    }

    Player.list[id] = self;

    infoPack.player.push(self.retrieveInfoPack());
    
    return self;
}

Player.list = {};
Player.onConnect = function(socket){
    var player = Player(socket.id);
    var target = Target(socket.id);
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


    socket.emit('starterPack',{
        selfId:socket.id, //sends the id over to the client
        player:Player.getAllInitPack(),  //sends player info pack to client
        bullet:Bullet.getAllInitPack(), //sends bullet info pack to client
        target:Target.getAllInitPack(),
    })
}

Player.getAllInitPack = function(){
  var players = [];
  for(var i in Player.list)
      players.push(Player.list[i].retrieveInfoPack());
      return players;
}

Player.onDisconnect = function(socket){ 
    delete Player.list[socket.id]; //delete player from players list
    removePack.player.push(socket.id);
}
Player.update = function(){
  var pack = [];
  for(var i in Player.list){
    var player = Player.list[i];
    player.update(); //update player
    pack.push(player.retrieveUpdatePack());//push player number, x & y
  }
  return pack;
}

Bullet = function(parent,angle){ //bullet 
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
            p.healthPoints -= 1; //takes away 1hp if you get hit by bullet

            if(p.healthPoints <= 0){  //if healthpoints are lower than 0 or = to 0 then this happens ->
              var enemy = Player.list[self.parent];
            if(enemy) 
              enemy.score += 1;  //enemy who shot you gets 1 point
              p.healthPoints = p.maxHealthPoints; // you get 10 healthpoints again
              p.x = Math.random() * 500; //you spawn random x
              p.y = Math.random() * 500; //spawn random y after dying.
            }
              self.toRemove = true;
          }
        }
    }

    self.retrieveInfoPack = function(){
      return {
              id:self.id,
              x:self.x,
              y:self.y,
            };
    }

    self.retrieveUpdatePack = function(){
      return {
              id:self.id,
              x:self.x,
              y:self.y,
            };
    }

    Bullet.list[self.id] = self;
    infoPack.bullet.push(self.retrieveInfoPack());
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
        removePack.bullet.push(bullet.id);
      } else
          pack.push(bullet.retrieveUpdatePack());
  }
  return pack;
}

Bullet.getAllInitPack = function(){
  var bullets = [];
    for(var i in Bullet.list)
        bullets.push(Bullet.list[i].retrieveInfoPack());
        return bullets;
}

Target = function(){ //bullet 
  var self = Shared(); //uses shared properties with player
  self.id = Math.random(); //random id
  self.pRight = false; //moving right auto false
  self.pLeft = false; //moving left auto false
  self.pUp = false; //moving up auto false
  self.pDown = false; //moving down auto false
  // self.speedX = Math.cos(angle/180*Math.PI) * 10; 
  // self.speedY = Math.sin(angle/180*Math.PI) * 10;
  self.toRemove = false; //if shot yourself then = true.
  

var second_update = self.update;
    self.update = function(){ //this function calls a secondary update
        // self.updateSpeed();
        second_update();
    }

self.retrieveInfoPack = function(){
    return {
            id:self.id,
            x:self.x,
            y:self.y,
          };
  }

self.retrieveUpdatePack = function(){
    return {
            id:self.id,
            x:self.x,
            y:self.y,
          };
  }

Target.list[self.id] = self;

  infoPack.target.push(self.retrieveInfoPack());
  return self;
}
Target.list = {}; //target

Target.update = function(){  //pushes target
var pack = [];
for(var i in Target.list){
  var target = Target.list[i];
    target.update();
    if(target.toRemove){
      delete Target.list[i]
      removePack.target.push(target.id);
    } else
        pack.push(target.retrieveUpdatePack());
}
return pack;
}

Target.getAllInitPack = function(){
var target = [];
  for(var i in Target.list)
      target.push(Target.list[i].retrieveInfoPack());
      return target;
}
