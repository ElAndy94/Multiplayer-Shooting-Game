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
      //   if(self.x <= 2 || self.x >= 498 || self.y <= 2 || self.y >= 498 ) //this is the collision to the edges
		  // {
      //   self.healthPoints -=10;
      //   console.log(self.healthPoints);
      // }
    }
    self.getDist = function(pt){
        return Math.sqrt(Math.pow(self.x-pt.x,2) + Math.pow(self.y-pt.y,2)); //calculates distance
     }
     return self;
}

Shared.makeModular = function(){ //this is what makes my project modular
	var pack = {
		infoPack:{
			player:infoPack.player, //pack with info for player
      bullet:infoPack.bullet, //pack with info for bullet
      target:infoPack.target, //pack with info for target
		},
		removePack:{
			player:removePack.player, //this is the pack that removes the players info
      bullet:removePack.bullet, //this is the pack that removes the bullet info
      target:removePack.target, //this is the pack that removes the target info
		},
		updatePack:{
			player:Player.update(),  //this sends only the basic info (hence update pack)
      bullet:Bullet.update(),  //same for these
      target:Target.update(), //same for this one too
		}
  };
  
infoPack.player = []; //sets to empty so it does not repeat/duplicate
    infoPack.bullet = []; //sets to empty so it does not repeat/duplicate
    infoPack.target = []; //sets to empty so it does not repeat/duplicate
    removePack.player = [];  //sets to empty so it does not repeat/duplicate
    removePack.bullet = [];  //sets to empty so it does not repeat/duplicate
    removePack.target = [];  //sets to empty so it does not repeat/duplicate
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
    self.counter = 0;
    // if(self.x <= 2 || self.x >= 498 || self.y <= 2 || self.y >= 498 ) //this is the collision to the edges
		// { }    

var second_update = self.update;
    self.update = function(){ //this function calls a secondary update
        self.updateSpeed();
        second_update();

        if(self.counter == 3){ //if counter is 3 then
          self.addEnemy(); //add enemy
          self.counter = 0; //set counter back to 0
        }

        if(self.pAttack){ 
            self.fireBullet(self.mouseAngle); //mouse angle attack
        }
  }

self.addEnemy = function(data){ //this is what makes the enemy
  var e = Target(data);
  e.x = self.x + 20; //the x of the new enemy
  e.y = self.y + 20; //the y of the new enemy
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

self.retrieveInfoPack = function(){ //this is what gets the info pack
      return {
              id:self.id, //all the players info ->
              x:self.x,
              y:self.y,
              number:self.number,
              healthPoints:self.healthPoints,
              maxHealthPoints:self.maxHealthPoints,
              score:self.score,
            };
}

self.retrieveUpdatePack = function(){ //this gets the update pack
      return {
              id:self.id, //all the players updated info ->
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
    var target = Target(socket.id); //appears when the player logs in, enemy gets put in too!
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
        player:Player.mergePack(),  //sends player info pack to client
        bullet:Bullet.mergePack(), //sends bullet info pack to client
        target:Target.mergePack(), //sends target info pack to client
    })
}

Player.mergePack = function(){
  var players = [];
  for(var i in Player.list)
      players.push(Player.list[i].retrieveInfoPack()); //this pushes the info pack
      return players;
}

Player.onDisconnect = function(socket){ 
    delete Player.list[socket.id]; //delete player from players list
    delete Target.list[socket.id]; ///////////////////////////////////////NEED TO FIX THIS
    removePack.player.push(socket.id);
    removePack.target.push(socket.id); //not really working
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
        for (var i in Target.list){ //WORKING BULLET COLLISION WITH TARGET **
          var t = Target.list[i]
            if(self.getDist(t) < 20 && self.parent !== t.id){ //gets distance
              t.life -= 1; //takes away 1hp if you get hit by bullet

              if(t.life <= 0){  //if healthpoints are lower than 0 or = to 0 then this happens ->
                var enemy = Player.list[self.parent];
                  if(enemy) 
                    enemy.score += 1;  //enemy who shot you gets 1 point
                    enemy.counter +=1;
                    t.life = t.maxLife; // you get 10 healthpoints again
                    t.x = Math.random() * 500; //enemy spawn random x
                    t.y = Math.random() * 500; //enemy random y after dying.
                  }
                  self.toRemove = true; //remove bullet when it hits target
              }
            }
        }
    self.retrieveInfoPack = function(){ //retrives the info pack for the bullet
      return {
              id:self.id, //bullets ID, x and y
              x:self.x,
              y:self.y,
            };
    }

    self.retrieveUpdatePack = function(){ //retrives the UPDATE pack for the bullet
      return {
              id:self.id, //Updated bullets ID, x and y
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
      bullet.update(); //calls for the update on the pack
      if(bullet.toRemove){ 
        delete Bullet.list[i] //remove the bullet list if .toRemove is triggered at the collision stage.
        removePack.bullet.push(bullet.id);
      } else
          pack.push(bullet.retrieveUpdatePack()); //pushes the bullet updated pack
  }
  return pack;
}

Bullet.mergePack = function(){
  var bullets = [];
    for(var i in Bullet.list)
        bullets.push(Bullet.list[i].retrieveInfoPack()); //pushes the bullet info pack
        return bullets;
}

Target = function(){ //Target 
  var self = Shared(); //uses shared properties with player
  self.life = 10;
  self.maxLife = 10;
  self.id = Math.random(); //random id
  newTar = false;
  // newEnemy = new Array();
  // var visho = [];
  // self.toRemove = false; //removed from screen

var second_update = self.update;
self.update = function(){ //this function calls a secondary update
  second_update();

for (var i in Player.list){ ////ENEMY DETEC
      var p = Player.list[i]

        var differenceX = p.x - self.x; //players x - targets x
        var differenceY = p.y - self.y; //players y - targets y

        if(differenceX > 0) //this is what makes the target move towards the player.
          self.x += 3;
        else
          self.x -= 3;

        if(differenceY > 0)
          self.y +=3;
        else
          self.y -=3;
}

for (var i in Player.list){ ////ENEMY DETEC
    var p = Player.list[i]
    
    if(self.getDist(p) < 32 && self.target !== p.id){ //gets distance (!== p.id)
      p.healthPoints -= 1; //takes away 1hp if you get hit by bullet
      
      if(p.healthPoints <= 0){  //if healthpoints are lower than 0 or = to 0 then this happens ->
        p.healthPoints = p.maxHealthPoints; // you get 10 healthpoints again
        p.x = Math.random() * 500; //you spawn random x
        p.y = Math.random() * 500; //spawn random y after dying.
      }
        self.x = Math.random() * 500; //sets the target at random x
        self.y = Math.random() * 500; //sets the target at random y
        self.newTar = true;
        // infoPack.target.push({x: self.x +5, y: self.y +5, life: self.life = 10, maxLife: self.maxLife = 10, id: self.id = Math.random()});
        // new Target = (socket.id);
        // infoPack.target.push(socket.id);
        // infoPack.target.push({x: self.x +5, y: self.y +5});
        // Target.push({x: self.x +5, y: self.y +5});
    }
}
}

self.retrieveInfoPack = function(){ //info pack for the target
    return {
            id:self.id, //targets id, x and y 
            x:self.x,
            y:self.y,
          };
  }

self.retrieveUpdatePack = function(){ //update pack for the target
    return {
            id:self.id, //targets UPDATED id, x and y 
            x:self.x,
            y:self.y,
          };
  }

Target.list[self.id] = self;

  infoPack.target.push(self.retrieveInfoPack()); //pushes the info pack on the target
  return self;
}
Target.list = {}; //target

Target.update = function(){  //pushes target
  var pack = [];
  for(var i in Target.list){
    var target = Target.list[i];
      target.update(); //cals for the update on the target INFO
      if(target.toRemove){ //if triggered it will remove the Target pack but its currently disabled!
        delete Target.list[i]
        removePack.target.push(socket.id);
      } else
          pack.push(target.retrieveUpdatePack()); //pushes the UPDATE pack for the target
  }
  return pack;
}

Target.mergePack = function(){ 
 var target = [];
  for(var i in Target.list)
      target.push(Target.list[i].retrieveInfoPack()); //pushes the info pack for the target
      return target;
}
