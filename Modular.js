var infoPack = {player:[],bullet:[],target:[], monster:[]};
var removePack =  {player:[],bullet:[],target:[],monster:[]};

Shared = function(){
    var me = {
      x:250, // X of the character 
      y:250, // Y of the character 
      speedX:0, //speed X defult to 0
      speedY:0, //speed Y defult to 0
      id:"",
    }
    me.update = function(){
      me.updatePos(); //update char or bullet position
    }
    me.updatePos = function(){
      me.x += me.speedX;
      me.y += me.speedY;
    }
    me.getDist = function(pt){
        return Math.sqrt(Math.pow(me.x-pt.x,2) + Math.pow(me.y-pt.y,2)); //calculates distance
     }
     return me;
 }

Shared.makeModular = function(){ //this is what makes my project modular
	var pack = {
		infoPack:{
			player:infoPack.player, //pack with info for player
      bullet:infoPack.bullet, //pack with info for bullet
      target:infoPack.target, //pack with info for target
      monster:infoPack.monster, //pack with info for special target
		},
		removePack:{
			player:removePack.player, //this is the pack that removes the players info
      bullet:removePack.bullet, //this is the pack that removes the bullet info
      target:removePack.target, //this is the pack that removes the target info
      monster:removePack.monster,
		},
		updatePack:{
			player:Player.update(),  //this sends only the basic info (hence update pack)
      bullet:Bullet.update(),  //same for these
      target:Target.update(), //same for this one too
      monster:Monster.update(),
		}
  };
  
infoPack.player = []; //sets to empty so it does not repeat/duplicate
    infoPack.bullet = []; //sets to empty so it does not repeat/duplicate
    infoPack.target = []; //sets to empty so it does not repeat/duplicate
    infoPack.monster = [];
    removePack.player = [];  //sets to empty so it does not repeat/duplicate
    removePack.bullet = [];  //sets to empty so it does not repeat/duplicate
    removePack.target = [];  //sets to empty so it does not repeat/duplicate
    removePack.monster = [];
    return pack;
 }

Player = function(id){
  var me = Shared(); //shared properties between bullet and player
    me.id = id;
    me.number = '' + Math.floor(10 * Math.random());
    me.pRight = false; //moving right auto false
    me.pLeft = false; //moving left auto false
    me.pUp = false; //moving up auto false
    me.pDown = false; //moving down auto false
    me.pAttack = false; //attacking set to fasle which is shooting!
    me.mouseAngle = 0; //mouse or touchpad angle
    me.maxSpeed = 6; //moving speed 10 (need to modify this)***
    me.healthPoints = 10; // player hp
    me.maxHealthPoints = 10; // the max hp a player starts with
    me.score = 0; //score starts at 0, +1 for every kill.
    me.counter = 0; //killing counter
    me.speedCounter = 0;  //speed counter
    me.sCounter = 0; //special monster
    me.sSpeedCounter = 0; //speed for special monster

var second_update = me.update;
me.update = function(){ //this function calls a secondary update
  me.updateSpeed();
    second_update();

if(me.sCounter == 15){ //special monster
      me.addMonster(); //call addMonster function
      me.sCounter = 0; //reset counter back to 0
    }

    if(me.counter == 5){ //if counter is 10 then
      me.addEnemy(); //add enemy
      me.counter = 0; //set counter back to 0
    }

    if(me.speedCounter == 3){ //if counter is 10 then
      me.speedKiller(); //call the speedkiller function below
      me.speedCounter = 0; //set counter back to 0
    }

    if(me.sSpeedCounter == 5){ //if counter is 10 then
      me.speedKillerTwo(); //call the speedkiller function below
      me.sSpeedCounter = 0; //set counter back to 0
    }

if(me.pAttack){ 
      me.fireBullet(me.mouseAngle); //mouse angle attack
    }
  
if(me.x <= 10) {
      me.pLeft = false;
      me.x += 3; 
    }
    if(me.x >= 496) {
      me.pRight = false;
      me.x -=3; 
    }
    if(me.y <= 4) {
      me.pUp = false;
      me.y +=4;
    }
    if(me.y >= 496) {
      me.pDown = false;
      me.y -=4;
    }
  }
    
me.speedKiller = function(data){ //the speed killer function 
    for (var i in Target.list){ //looks into the target list
        var t = Target.list[i] //t for target list
        if(t.speed < 4){
          t.speed += 1; // add 1 to the target.speed that i set in target
        }  //console.log(t.speed + 'speed'); //sorted
    }
 }

 me.speedKillerTwo = function(data){ //the speed killer function 
  for (var i in Monster.list){ //looks into the target list
      var t = Monster.list[i] //t for target list
      if(t.speed < 3){
        t.speed += 1; // add 1 to the target.speed that i set in target
      }  
  }
 }

me.addEnemy = function(data){ //this is what makes the enemy
  var e = Target(data);
  e.x = me.x + 50; //the x of the new enemy
  e.y = me.y + 50; //the y of the new enemy
 }

me.addMonster = function(data){ //this is what makes the enemy
  var e = Monster(data);
  e.x = me.x + 50; //the x of the new enemy
  e.y = me.y + 50; //the y of the new enemy
 }
  
me.fireBullet = function(angle){
    var b = Bullet(me.id,angle); //bullet id, with angle pack
    b.x = me.x;
    b.y = me.y;
  }

me.updateSpeed = function(){
    if(me.pRight)
        me.speedX = me.maxSpeed;
    else if(me.pLeft)
        me.speedX = -me.maxSpeed;
    else
        me.speedX = 0; //reset movement speeds

    if (me.pUp)
        me.speedY = -me.maxSpeed;
    else if(me.pDown)
        me.speedY = me.maxSpeed;
    else
        me.speedY = 0; //reset movement speeds
    }

me.retrieveInfoPack = function(){ //this is what gets the info pack
  return {
          id:me.id, //all the players info ->
          x:me.x,
          y:me.y,
          number:me.number,
          healthPoints:me.healthPoints,
          maxHealthPoints:me.maxHealthPoints,
          score:me.score,
        };
 }

me.retrieveUpdatePack = function(){ //this gets the update pack
  return {
          id:me.id, //all the players updated info ->
          x:me.x,
          y:me.y,
          healthPoints:me.healthPoints,
          score:me.score,
        };
 }
    Player.list[id] = me;
    infoPack.player.push(me.retrieveInfoPack());
    return me;
 }

Player.list = {};
Player.onConnect = function(socket){
    var player = Player(socket.id);
    var target = Target(socket.id); //appears when the player logs in, enemy gets put in too!
    var monster = Monster(socket.id);
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
        meId:socket.id, //sends the id over to the client
        player:Player.mergePack(),  //sends player info pack to client
        bullet:Bullet.mergePack(), //sends bullet info pack to client
        target:Target.mergePack(), //sends target info pack to client
        monster:Monster.mergePack(),
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
    var me = Shared(); //uses shared properties with player
    me.id = Math.random(); //random id
    me.speedX = Math.cos(angle/180*Math.PI) * 10; 
    me.speedY = Math.sin(angle/180*Math.PI) * 10;
    me.parent = parent; //so you dont shoot yourself.
    me.timer = 0; //bullet timer - dies at 100.
    me.toRemove = false; //if shot yourself then = true.
    var second_update = me.update;
    
me.update = function(){
        if(me.timer++ > 60) //timeout on bullet traveling
          me.toRemove = true; //removes it
        second_update();

for (var i in Player.list){
  var p = Player.list[i]
  if(me.getDist(p) < 32 && me.parent !== p.id){ //gets distance
    p.healthPoints -= 1; //takes away 1hp if you get hit by bullet
    if(p.healthPoints <= 0){  //if healthpoints are lower than 0 or = to 0 then this happens ->
      var enemy = Player.list[me.parent];
    if(enemy) 
      enemy.score += 1;  //enemy who shot you gets 1 point
      p.healthPoints = p.maxHealthPoints; // you get 10 healthpoints again
      p.x = Math.random() * 500; //you spawn random x
      p.y = Math.random() * 500; //spawn random y after dying.
      p.score = 0;
    }
      me.toRemove = true;
  }
 }
for (var i in Target.list){ //WORKING BULLET COLLISION WITH TARGET **
  var t = Target.list[i]
    if(me.getDist(t) < 20 && me.parent !== t.id){ //gets distance
      t.life -= 1; //takes away 1hp if you get hit by bullet
      if(t.life <= 0){  //if healthpoints are lower than 0 or = to 0 then this happens ->
      var enemy = Player.list[me.parent];
        if(enemy) 
          enemy.score += 1;  //enemy who shot you gets 1 point
          enemy.counter +=1;
          enemy.speedCounter +=1;
          t.life = t.maxLife; // you get 10 healthpoints again
          t.x = Math.random() * 500; //enemy spawn random x
          t.y = Math.random() * 500; //enemy random y after dying.
        }
        me.toRemove = true; //remove bullet when it hits target
    }
  }
for (var i in Monster.list){ //WORKING BULLET COLLISION WITH Monster **
  var t = Monster.list[i]
    if(me.getDist(t) < 20 && me.parent !== t.id){ //gets distance
      t.life -= 1; //takes away 1hp if you get hit by bullet

      if(t.life <= 0){  //if healthpoints are lower than 0 or = to 0 then this happens ->
        var enemy = Player.list[me.parent];
        if(enemy) 
          enemy.score += 10;  //enemy who shot you gets 1 point
          enemy.sCounter +=1;
          enemy.sSpeedCounter +=1;
          t.life = t.maxLife; // you get 10 healthpoints again
          t.x = Math.random() * 500; //enemy spawn random x
          t.y = Math.random() * 500; //enemy random y after dying.
        }
        me.toRemove = true; //remove bullet when it hits target
      }
    }
  }
    me.retrieveInfoPack = function(){ //retrives the info pack for the bullet
      return {
              id:me.id, //bullets ID, x and y
              x:me.x,
              y:me.y,
            };
     }

    me.retrieveUpdatePack = function(){ //retrives the UPDATE pack for the bullet
      return {
              id:me.id, //Updated bullets ID, x and y
              x:me.x,
              y:me.y,
            };
     }

    Bullet.list[me.id] = me;
    infoPack.bullet.push(me.retrieveInfoPack());
    return me;
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
  var me = Shared(); //uses shared properties with player
  me.life = 10;
  me.maxLife = 10;
  me.id = Math.random(); //random id
  me.speed = 1; //enemy speed

var second_update = me.update;
me.update = function(){ //this function calls a secondary update
  second_update();

for (var i in Player.list){ ////ENEMY movement
      var p = Player.list[i]

        var differenceX = p.x - me.x; //players x - targets x
        var differenceY = p.y - me.y; //players y - targets y

        if(differenceX > 0) //this is what makes the target move towards the player.
          me.x += me.speed;
        else
          me.x -= me.speed;

        if(differenceY > 0)
          me.y += me.speed;
        else
          me.y -= me.speed;
 }

for (var i in Player.list){ ////ENEMY DETEC
    var p = Player.list[i]
    
    if(me.getDist(p) < 32 && me.target !== p.id){ //gets distance (!== p.id)
      p.healthPoints -= 1; //takes away 1hp if you get hit by bullet
      
      if(p.healthPoints <= 0){  //if healthpoints are lower than 0 or = to 0 then this happens ->
        p.healthPoints = p.maxHealthPoints; // you get 10 healthpoints again
        p.x = Math.random() * 500; //you spawn random x
        p.y = Math.random() * 500; //spawn random y after dying.
        p.score = 0;
      }
        me.x = Math.random() * 500; //sets the target at random x
        me.y = Math.random() * 500; //sets the target at random y
    }
 }
 }

me.retrieveInfoPack = function(){ //info pack for the target
    return {
            id:me.id, //targets id, x and y 
            x:me.x,
            y:me.y,
          };
  }

  me.retrieveUpdatePack = function(){ //update pack for the target
    return {
            id:me.id, //targets UPDATED id, x and y 
            x:me.x,
            y:me.y,
          };
  }

Target.list[me.id] = me;

  infoPack.target.push(me.retrieveInfoPack()); //pushes the info pack on the target
  return me;
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

Monster = function(){ //Target 
  var me = Shared(); //uses shared properties with player
  me.life = 30;
  me.maxLife = 30;
  me.id = Math.random(); //random id
  me.speed = 2; //enemy speed

var second_update = me.update;
me.update = function(){ //this function calls a secondary update
  second_update();

for (var i in Player.list){ ////ENEMY movement
      var p = Player.list[i]

        var differenceX = p.x - me.x; //players x - monsters x
        var differenceY = p.y - me.y; //players y - monsters y

        if(differenceX > 0) //this is what makes the monster move towards the player.
          me.x += me.speed;
        else
          me.x -= me.speed;

        if(differenceY > 0)
          me.y += me.speed;
        else
          me.y -= me.speed;
 }

for (var i in Player.list){ ////ENEMY DETEC
    var p = Player.list[i]
    if(me.getDist(p) < 32 && me.monster !== p.id){ //gets distance (!== p.id)
      p.healthPoints -= 1; //takes away 1hp if you get hit by bullet
      if(p.healthPoints <= 0){  //if healthpoints are lower than 0 or = to 0 then this happens ->
        p.healthPoints = p.maxHealthPoints; // you get 10 healthpoints again
        p.x = Math.random() * 500; //you spawn random x
        p.y = Math.random() * 500; //spawn random y after dying.
        p.score = 0;
      }
        me.x = Math.random() * 500; //sets the monster at random x
        me.y = Math.random() * 500; //sets the monster at random y
    }
 }
 }

me.retrieveInfoPack = function(){ //info pack for the monster
    return {
            id:me.id, //monster id, x and y 
            x:me.x,
            y:me.y,
          };
  }

  me.retrieveUpdatePack = function(){ //update pack for the monster
    return {
            id:me.id, //monster UPDATED id, x and y 
            x:me.x,
            y:me.y,
          };
  }

Monster.list[me.id] = me;

  infoPack.monster.push(me.retrieveInfoPack()); //pushes the info pack on the target
  return me;
 }
Monster.list = {}; //monster

Monster.update = function(){  //pushes monster
  var pack = [];
  for(var i in Monster.list){
    var monster = Monster.list[i];
      monster.update(); //cals for the update on the target INFO
      if(monster.toRemove){ //if triggered it will remove the Target pack but its currently disabled!
        delete Monster.list[i]
        removePack.monster.push(socket.id);
      } else
          pack.push(monster.retrieveUpdatePack()); //pushes the UPDATE pack for the target
  }
  return pack;
 }

Monster.mergePack = function(){ 
 var monster = [];
  for(var i in Monster.list)
  monster.push(Monster.list[i].retrieveInfoPack()); //pushes the info pack for the target
      return monster;
 }
