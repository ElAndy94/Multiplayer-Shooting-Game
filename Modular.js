var infoPack = { player: [], bullet: [], target: [], monster: [], meteo: [], hP: [] };
var removePack = { player: [], bullet: [], target: [], monster: [], meteo: [], hP: [] };
var shooter = require('./shooter');

Shared = function () {
  var me = {
    id: "",
    x: 250, // X of the character 
    y: 250, // Y of the character 
    speedX: 0, //speed X defult to 0
    speedY: 0, //speed Y defult to 0
    space: 'blackGal',
  }
  me.update = function () {
    me.updatePos(); //update char or bullet position
  }
  me.updatePos = function () {
    me.x += me.speedX;
    me.y += me.speedY;
  }
  me.getDist = function (pt) {
    return Math.sqrt(Math.pow(me.x - pt.x, 2) + Math.pow(me.y - pt.y, 2)); //calculates distance
  }
  return me;
}

Shared.makeModular = function () { //this is what makes my project modular
  var pack = {
    infoPack: {
      player: infoPack.player, //pack with info for player
      bullet: infoPack.bullet, //pack with info for bullet
      target: infoPack.target, //pack with info for target
      monster: infoPack.monster, //pack with info for special target
      meteo: infoPack.meteo, //pack with meteorite
      hP: infoPack.hP,
    },
    removePack: {
      player: removePack.player, //this is the pack that removes the players info
      bullet: removePack.bullet, //this is the pack that removes the bullet info
      target: removePack.target, //this is the pack that removes the target info
      monster: removePack.monster, // monster
      meteo: removePack.meteo,
      hP: removePack.hP,
    },
    updatePack: {
      player: Player.update(),  //this sends only the basic info (hence update pack)
      bullet: Bullet.update(),  //same for these
      target: Target.update(), //same for this one too
      monster: Monster.update(),
      meteo: Meteo.update(),
      hP: HP.update(),
    }
  };

  infoPack.player = []; //sets to empty so it does not repeat/duplicate
  infoPack.bullet = []; //sets to empty so it does not repeat/duplicate
  infoPack.target = []; //sets to empty so it does not repeat/duplicate
  infoPack.monster = [];
  infoPack.meteo = [];
  infoPack.hP = [];
  removePack.player = [];  //sets to empty so it does not repeat/duplicate
  removePack.bullet = [];  //sets to empty so it does not repeat/duplicate
  removePack.target = [];  //sets to empty so it does not repeat/duplicate
  removePack.monster = [];
  removePack.meteo = [];
  removePack.hP = [];
  return pack;
}

Player = function (id) {
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
  me.healthPoints = 1; // player hp
  me.maxHealthPoints = 8; // the max hp a player starts with
  me.score = 0; //score starts at 0, +1 for every kill.
  me.counter = 0; //killing counter
  me.speedCounter = 0;  //speed counter
  me.sCounter = 0; //special monster
  me.sSpeedCounter = 0; //speed for special monster
  me.specialCounter = 0;
  me.dead = false;
  me.spaceReset = false
  me.shootingSpeed = 0;

  var second_update = me.update;
  me.update = function () { //this function calls a secondary update
    me.updateSpeed();
    second_update();
    me.resetEverything(); //reset game

    if (me.sCounter == 6) { //special monster
      me.addMonster(); //call addMonster function
      me.addHP();
      me.sCounter = 0; //reset counter back to 0
    }

    if (me.counter == 5) { //if counter is 5 then
      me.specialCounter++;
      if (me.specialCounter <= 4) {
        me.addEnemy(); //add enemy
        me.counter = 0; //set counter back to 0
      }
    }

    if (me.speedCounter == 3) { //if counter is 3 then
      me.speedKiller(); //call the speedkiller function below
      me.addMeteo();
      me.speedCounter = 0; //set counter back to 0
    }

    if (me.sSpeedCounter == 5) { //if counter is 5 then
      me.speedKillerTwo(); //call the speedkiller function below
      me.sSpeedCounter = 0; //set counter back to 0
    }

    if (me.pAttack) {
      me.fireBullet(me.mouseAngle); //mouse angle attack
    }
    if (me.x <= 10) {
      me.pLeft = false;
      me.x += 3;
    }
    if (me.x >= 496) {
      me.pRight = false;
      me.x -= 3;
    }
    if (me.y <= 4) {
      me.pUp = false;
      me.y += 4;
    }
    if (me.y >= 496) {
      me.pDown = false;
      me.y -= 4;
    }
  }

  me.speedKiller = function (data) { //the speed killer function 
    for (var i in Target.list) { //looks into the target list
      var t = Target.list[i] //t for target list
      if (t.speed < 2) {
        t.speed += 1; // add 1 to the target.speed that i set in target
      }
    }
  }
  me.resetEverything = function (data) {
    if (me.healthPoints <= 0) {
      me.dead = true;
      me.pAttack = false; //attacking set to fasle which is shooting!
      me.counter = 0; //killing counter
      me.speedCounter = 0;  //speed counter
      me.sCounter = 0; //special monster
      me.sSpeedCounter = 0; //speed for special monster
      me.specialCounter = 0; //stops creating too many targets
      me.x = 250;
      me.y = 250;
      //checkInfo();
      shooter.checkInfo(me);

      for (var i in Monster.list) { //looks into the target list
        var m = Monster.list[i] //t for target list
        m.toRemove = true;
      }
      for (var i in Target.list) { //looks into the target list
        var t = Target.list[i] //t for target list
        t.toRemove = true;
      }
      if (me.spaceReset == true) { //if i press spacebar when I die this will reset it
        me.healthPoints = 10; // player hp
        me.maxHealthPoints = 10; // the max hp a player starts with
        me.score = 0; //score starts at 0, +1 for every kill.
        me.dead = false; //reset to not dead
        me.addEnemy();
      }
    }
  }
  me.speedKillerTwo = function (data) { //the speed killer function 
    for (var i in Monster.list) { //looks into the target list
      var t = Monster.list[i] //t for target list
      if (t.speed < 2) {
        t.speed += 1; // add 1 to the target.speed that i set in target
      }
    }
  }
  me.addEnemy = function (data) { //this is what makes the enemy
    var e = Target(data);
    e.x = 1; //the x of the new enemy
    e.y = Math.random() * 500; //the y of the new enemy
  }
  me.addMonster = function (data) { //this is what makes the enemy
    var e = Monster(data);
    e.x = Math.random() * 500; //the x of the new enemy
    e.y = 1; //the y of the new enemy
  }
  me.addMeteo = function (data) { //this is what makes the meteo
    var e = Meteo(data);
    e.x = Math.random() * 500; //the x of the new meteo
    e.y = 1; //the y of the new meteo
  }
  me.addHP = function (data) { //this is what makes the meteo
    var e = HP(data);
    e.x = Math.random() * 200; //the x of the new meteo
    e.y = Math.random() * 300; //the y of the new meteo
  }
  me.fireBullet = function (angle) {
    me.shootingSpeed++;
    if (me.shootingSpeed == 4) {
      var b = Bullet(me.id, angle); //bullet id, with angle pack
      b.x = me.x;
      b.y = me.y;
      me.shootingSpeed = 0;
    }
  }
  me.updateSpeed = function () {
    if (me.pRight)
      me.speedX = me.maxSpeed;
    else if (me.pLeft)
      me.speedX = -me.maxSpeed;
    else
      me.speedX = 0; //reset movement speeds

    if (me.pUp)
      me.speedY = -me.maxSpeed;
    else if (me.pDown)
      me.speedY = me.maxSpeed;
    else
      me.speedY = 0; //reset movement speeds
  }
  me.retrieveInfoPack = function () { //this is what gets the info pack
    return {
      id: me.id, //all the players info ->
      x: me.x,
      y: me.y,
      number: me.number,
      healthPoints: me.healthPoints,
      maxHealthPoints: me.maxHealthPoints,
      score: me.score,
      space: me.space,
      dead: me.dead,
    };
  }
  me.retrieveUpdatePack = function () { //this gets the update pack
    return {
      id: me.id, //all the players updated info ->
      x: me.x,
      y: me.y,
      healthPoints: me.healthPoints,
      score: me.score,
      space: me.space,
      dead: me.dead,
    };
  }
  Player.list[id] = me;
  infoPack.player.push(me.retrieveInfoPack());
  return me;
}

Player.list = {};
Player.onConnect = function (socket) {
  var player = Player(socket.id);
  var target = Target(socket.id); //appears when the player logs in, enemy gets put in too!
  socket.on('movementKey', function (data) {
    if (data.inputId === 'left')
      player.pLeft = data.state; //moving left
    else if (data.inputId === 'right')
      player.pRight = data.state; //moving right
    else if (data.inputId === 'up')
      player.pUp = data.state; //moving up
    else if (data.inputId === 'down')
      player.pDown = data.state; //moving down on keyboard
    else if (data.inputId === 'attack')
      player.pAttack = data.state; //if click = true
    else if (data.inputId === 'mouseAngle')
      player.mouseAngle = data.state; //mouse angle (direction of shooting)
    else if (data.inputId === 'space')
      player.spaceReset = data.state;
  });

  var space = 'blackGal';
  socket.on('changeMode', function (data) {
    if (player.space === 'blackGal')
      player.space = 'galy';
    else
      player.space = 'blackGal';
  })

  for (var i in Monster.list) {
    var t = Monster.list[i]
  }

  for (var i in Meteo.list) {
    var t = Meteo.list[i]
  }

  for (var i in HP.list) {
    var t = HP.list[i]
  }
  // if(me.counter = 5){
  // var monster = Monster(socket.id);
  // Math.random() * 500;
  // }}

  socket.emit('starterPack', {
    meId: socket.id, //sends the id over to the client
    player: Player.mergePack(),  //sends player info pack to client
    bullet: Bullet.mergePack(), //sends bullet info pack to client
    target: Target.mergePack(), //sends target info pack to client
    monster: Monster.mergePack(), //sends monster info pack to client
    meteo: Meteo.mergePack(), //sends meteo pack
  })
}

Player.mergePack = function () {
  var players = [];
  for (var i in Player.list)
    players.push(Player.list[i].retrieveInfoPack()); //this pushes the info pack
  return players;
}

Player.onDisconnect = function (socket) {
  delete Player.list[socket.id]; //delete player from players list
  delete Target.list[socket.id]; //NEED TO FIX THIS
  delete Monster.list[socket.id];
  removePack.player.push(socket.id);
  removePack.target.push(socket.id); //not really working
  removePack.monster.push(socket.id);
  for (var i in Target.list) { //WORKING BULLET COLLISION WITH METEORITE **
    var t = Target.list[i]
    t.toRemove = true;
  }

  Player.update = function () {
    var pack = [];
    for (var i in Player.list) {
      var player = Player.list[i];
      player.update(); //update player
      pack.push(player.retrieveUpdatePack());//push player number, x & y
    }
    return pack;
  }

  Bullet = function (parent, angle) { //bullet 
    var me = Shared(); //uses shared properties with player
    me.id = Math.random(); //random id
    me.speedX = Math.cos(angle / 180 * Math.PI) * 10;
    me.speedY = Math.sin(angle / 180 * Math.PI) * 10;
    me.parent = parent; //so you dont shoot yourself.
    me.timer = 0; //bullet timer - dies at 100.
    me.toRemove = false; //if shot yourself then = true.
    var second_update = me.update;

    me.update = function () {
      if (me.timer++ > 40) //timeout on bullet traveling
        me.toRemove = true; //removes it
      second_update();

      for (var i in Player.list) {
        var p = Player.list[i]
        if (me.getDist(p) < 32 && me.parent !== p.id) { //gets distance
          p.healthPoints -= 1; //takes away 1hp if you get hit by bullet
          if (p.healthPoints <= 0) {  //if healthpoints are lower than 0 or = to 0 then this happens ->
            var enemy = Player.list[me.parent];
            if (enemy)
              enemy.score += 1;  //enemy who shot you gets 1 point
            p.healthPoints = p.maxHealthPoints; // you get 10 healthpoints again
            p.x = Math.random() * 500; //you spawn random x
            p.y = Math.random() * 500; //spawn random y after dying.
            p.score = 0;
          }
          me.toRemove = true;
        }
      }
      for (var i in Target.list) { //WORKING BULLET COLLISION WITH TARGET **
        var t = Target.list[i]
        if (me.getDist(t) < 20 && me.parent !== t.id) { //gets distance
          t.life -= 1; //takes away 1hp if you get hit by bullet
          if (t.life <= 0) {  //if healthpoints are lower than 0 or = to 0 then this happens ->
            var enemy = Player.list[me.parent];
            if (enemy)
              enemy.score += 5;  //enemy who shot you gets 1 point
            enemy.counter += 1; //add counter after every kill
            enemy.speedCounter += 1; //add speed after every kill
            enemy.sCounter += 1; //special enemy
            t.life = t.maxLife; // you get 10 healthpoints again
            t.x = 1; //enemy spawn random x
            t.y = Math.random() * 500; //enemy random y after dying.
            // t.toRemove = true;
          }
          me.toRemove = true; //remove bullet when it hits target
        }
      }
      for (var i in Monster.list) { //WORKING BULLET COLLISION WITH Monster **
        var t = Monster.list[i]
        if (me.getDist(t) < 20 && me.parent !== t.id) { //gets distance
          t.life -= 1; //takes away 1hp if you get hit by bullet

          if (t.life <= 0) {  //if healthpoints are lower than 0 or = to 0 then this happens ->
            var enemy = Player.list[me.parent];
            if (enemy)
              enemy.score += 15;  //enemy who shot you gets 1 point
            enemy.sCounter += 1; //add 1 to counter after every kill
            enemy.sSpeedCounter += 1; //add speed after every kill
            t.life = t.maxLife; // you get 10 healthpoints again
            t.x = Math.random() * 500; //enemy spawn random x
            t.y = Math.random() * 500; //enemy random y after dying.
            t.toRemove = true; //removes monster
          }
          me.toRemove = true; //remove bullet when it hits target
        }
      }
      for (var i in Meteo.list) { //WORKING BULLET COLLISION WITH METEORITE **
        var t = Meteo.list[i]
        if (me.getDist(t) < 20 && me.parent !== t.id) { //gets distance
          t.life -= 1; //takes away 1hp if you get hit by bullet

          if (t.life <= 0) {  //if healthpoints are lower than 0 or = to 0 then this happens ->
            var enemy = Player.list[me.parent];
            if (enemy)
              enemy.score += 30;  //enemy who shot you gets 30 point
            t.toRemove = true; //removes monster
            enemy.addMeteo(); //adds another meteorite
          }
          me.toRemove = true; //remove bullet when it hits target
        }
      }
    }
    me.retrieveInfoPack = function () { //retrives the info pack for the bullet
      return {
        id: me.id, //bullets ID, x and y
        x: me.x,
        y: me.y,
      };
    }

    me.retrieveUpdatePack = function () { //retrives the UPDATE pack for the bullet
      return {
        id: me.id, //Updated bullets ID, x and y
        x: me.x,
        y: me.y,
      };
    }

    Bullet.list[me.id] = me;
    infoPack.bullet.push(me.retrieveInfoPack());
    return me;
  }
  Bullet.list = {}; //bullet 

  Bullet.update = function () {  //pushes bullet
    var pack = [];
    for (var i in Bullet.list) {
      var bullet = Bullet.list[i];
      bullet.update(); //calls for the update on the pack
      if (bullet.toRemove) {
        delete Bullet.list[i] //remove the bullet list if .toRemove is triggered at the collision stage.
        removePack.bullet.push(bullet.id);
      } else
        pack.push(bullet.retrieveUpdatePack()); //pushes the bullet updated pack
    }
    return pack;
  }

  Bullet.mergePack = function () {
    var bullets = [];
    for (var i in Bullet.list)
      bullets.push(Bullet.list[i].retrieveInfoPack()); //pushes the bullet info pack
    return bullets;
  }

  Target = function () { //Target 
    var me = Shared(); //uses shared properties with player
    me.x = 1;
    me.y = Math.random() * 500;
    me.life = 10;
    me.maxLife = 10;
    me.id = Math.random(); //random id
    me.speed = 1; //target speed
    me.targetAim = 0; //target aim

    var second_update = me.update;
    me.update = function () { //this function calls a secondary update
      second_update();

      for (var i in Player.list) { ////TARGET movement
        var p = Player.list[i]

        var differenceX = p.x - me.x; //players x - targets x
        var differenceY = p.y - me.y; //players y - targets y

        me.targetAim = Math.atan2(differenceX, differenceY) / Math.PI * 180 // TARGET AIM, NEED TO SORT IT OUT**

        if (differenceX > 0) //this is what makes the target move towards the player.
          me.x += me.speed;
        else
          me.x -= me.speed;

        if (differenceX = 0)
          me.x = 0;

        if (differenceY > 0)
          me.y += me.speed;
        else
          me.y -= me.speed;

        if (differenceY = 0)
          me.y = 0;
      }

      for (var i in Player.list) { ////ENEMY DETEC
        var p = Player.list[i]
        // var t = Monster.list[i]
        if (me.getDist(p) < 20 && me.target !== p.id) { //gets distance (!== p.id)
          p.healthPoints -= 1; //takes away 1hp if you get hit by bullet    
          // if(p.healthPoints <= 0){  //if healthpoints are lower than 0 or = to 0 then this happens ->
          //   p.healthPoints = p.maxHealthPoints; // you get 10 healthpoints again
          //   p.x = Math.random() * 500; //you spawn random x
          //   p.y = Math.random() * 500; //spawn random y after dying.
          //   p.score = 0;
          //   me.toRemove = true;
          //   Monster.toRemove = true;
          // }
          me.x = Math.random() * 500; //sets the target at random x
          me.y = 1; //sets the target at random y
        }
      }
    }

    me.retrieveInfoPack = function () { //info pack for the target
      return {
        id: me.id, //targets id, x and y 
        x: me.x,
        y: me.y,
      };
    }

    me.retrieveUpdatePack = function () { //update pack for the target
      return {
        id: me.id, //targets UPDATED id, x and y 
        x: me.x,
        y: me.y,
      };
    }

    Target.list[me.id] = me;

    infoPack.target.push(me.retrieveInfoPack()); //pushes the info pack on the target
    return me;
  }
  Target.list = {}; //target

  Target.update = function () {  //pushes target
    var pack = [];
    for (var i in Target.list) {
      var target = Target.list[i];
      target.update(); //cals for the update on the target INFO
      if (target.toRemove) { //if triggered it will remove the Target pack but its currently disabled!
        delete Target.list[i]
        removePack.target.push(target.id);
      } else
        pack.push(target.retrieveUpdatePack()); //pushes the UPDATE pack for the target
    }
    return pack;
  }

  Target.mergePack = function () {
    var target = [];
    for (var i in Target.list)
      target.push(Target.list[i].retrieveInfoPack()); //pushes the info pack for the target
    return target;
  }

  Monster = function () { //Target 
    var me = Shared(); //uses shared properties with player
    me.life = 30;
    me.maxLife = 30;
    me.id = Math.random(); //random id
    me.speed = 2; //enemy speed
    me.toRemove = false; //if shot yourself then = true.

    var second_update = me.update;
    me.update = function () { //this function calls a secondary update
      second_update();

      for (var i in Player.list) { ////ENEMY movement
        var p = Player.list[i]

        var differenceX = p.x - me.x; //players x - monsters x
        var differenceY = p.y - me.y; //players y - monsters y

        if (differenceX > 0) //this is what makes the monster move towards the player.
          me.x += me.speed;
        else
          me.x -= me.speed;

        if (differenceY > 0)
          me.y += me.speed;
        else
          me.y -= me.speed;
      }

      for (var i in Player.list) { ////ENEMY DETEC
        var p = Player.list[i]
        if (me.getDist(p) < 20 && me.monster !== p.id) { //gets distance (!== p.id)
          p.healthPoints -= 5; //takes away 1hp if you get hit by bullet
          // if(p.healthPoints <= 0){  //if healthpoints are lower than 0 or = to 0 then this happens ->
          //   p.healthPoints = p.maxHealthPoints; // you get 10 healthpoints again
          //   p.x = Math.random() * 500; //you spawn random x
          //   p.y = Math.random() * 500; //spawn random y after dying.
          //   p.score = 0;
          //   me.toRemove = true;
          //   Target.toRemove = true;
          // }
          me.x = Math.random() * 500; //sets the monster at random x
          me.y = 1; //sets the monster at random y
        }
      }
    }

    me.retrieveInfoPack = function () { //info pack for the monster
      return {
        id: me.id, //monster id, x and y 
        x: me.x,
        y: me.y,
      };
    }

    me.retrieveUpdatePack = function () { //update pack for the monster
      return {
        id: me.id, //monster UPDATED id, x and y 
        x: me.x,
        y: me.y,
      };
    }

    Monster.list[me.id] = me;

    infoPack.monster.push(me.retrieveInfoPack()); //pushes the info pack on the target
    return me;
  }
  Monster.list = {}; //monster

  Monster.update = function () {  //pushes monster
    var pack = [];
    for (var i in Monster.list) {
      var monster = Monster.list[i];
      monster.update(); //cals for the update on the target INFO
      if (monster.toRemove) { //if triggered it will remove the Target pack but its currently disabled!
        delete Monster.list[i]
        removePack.monster.push(monster.id);
      } else
        pack.push(monster.retrieveUpdatePack()); //pushes the UPDATE pack for the target
    }
    return pack;
  }

  Monster.mergePack = function () {
    var monster = [];
    for (var i in Monster.list)
      monster.push(Monster.list[i].retrieveInfoPack()); //pushes the info pack for the target
    return monster;
  }

  Meteo = function () { //meteorite 
    var me = Shared(); //uses shared properties with player
    me.life = 10;
    me.maxLife = 10;
    me.id = Math.random(); //random id
    me.toRemove = false; //if shot yourself then = true.
    me.xSpeed = 1;
    me.ySpeed = 4;

    var second_update = me.update;
    me.update = function () { //this function calls a secondary update
      second_update();

      me.x = me.x + me.xSpeed;
      me.y = me.y + me.ySpeed;

      var checkX = me.x;
      var checkY = me.y;

      // if(checkX || checkY == -30|| 530){
      //   console.log('letmeknow');
      //   // me.toRemove = true;
      // }

      if (checkX <= -30) {
        console.log('x - 30');
        // me.toRemove = true;
      }
      if (checkY <= -30) {
        console.log('y - 30');
        // me.toRemove = true;
      }
      if (checkX >= 505 || checkY >= 505) {
        // console.log('x PAST 530');
        me.toRemove = true;
      }

      for (var i in Player.list) { ////ENEMY DETEC
        var p = Player.list[i]
        if (me.getDist(p) < 20 && me.meteo !== p.id) { //gets distance (!== p.id)
          p.healthPoints -= 8; //takes away 8hp if you get hit by bullet
          me.toRemove = true;
        }
      }
      for (var i in Monster.list) { ////ENEMY DETEC
        var p = Monster.list[i]
        if (me.getDist(p) < 20 && me.meteo !== p.id) { //gets distance (!== p.id)
          p.healthPoints -= 10; //takes away 10hp if you get hit by bullet
          // me.toRemove = true;
        }
      }
      for (var i in Target.list) { ////ENEMY DETEC
        var p = Target.list[i]
        if (me.getDist(p) < 20 && me.meteo !== p.id) { //gets distance (!== p.id)
          p.healthPoints -= 5; //takes away 5hp if you get hit by bullet
          // me.toRemove = true;
        }
      }

    }

    me.retrieveInfoPack = function () { //info pack for the monster
      return {
        id: me.id, //monster id, x and y 
        x: me.x,
        y: me.y,
      };
    }

    me.retrieveUpdatePack = function () { //update pack for the monster
      return {
        id: me.id, //monster UPDATED id, x and y 
        x: me.x,
        y: me.y,
      };
    }

    Meteo.list[me.id] = me;

    infoPack.meteo.push(me.retrieveInfoPack()); //pushes the info pack on the target
    return me;
  }
  Meteo.list = {}; //monster

  Meteo.update = function () {  //pushes meteorite
    var pack = [];
    for (var i in Meteo.list) {
      var meteo = Meteo.list[i];
      meteo.update(); //cals for the update on the meteorite INFO
      if (meteo.toRemove) { //if triggered it will remove the meteorite pack but its currently disabled!
        delete Meteo.list[i]
        removePack.meteo.push(meteo.id);
      } else
        pack.push(meteo.retrieveUpdatePack()); //pushes the UPDATE pack for the meteorite
    }
    return pack;
  }

  Meteo.mergePack = function () {
    var meteo = [];
    for (var i in Meteo.list)
      meteo.push(Meteo.list[i].retrieveInfoPack()); //pushes the info pack for the meteorite
    return meteo;
  }

  HP = function () { //hp
    var me = Shared(); //uses shared properties with player
    me.id = Math.random(); //random id
    me.toRemove = false; // to remove heart


    var second_update = me.update;
    me.update = function () { //this function calls a secondary update
      second_update();


      for (var i in Player.list) { ////ENEMY DETEC
        var p = Player.list[i]
        if (me.getDist(p) < 20 && me.meteo !== p.id) { //gets distance (!== p.id)
          p.healthPoints += 1; //takes away 8hp if you get hit by bullet
          me.toRemove = true;
        }
      }
      // for (var i in Monster.list) { ////ENEMY DETEC
      //   var p = Monster.list[i]
      //   if (me.getDist(p) < 20 && me.meteo !== p.id) { //gets distance (!== p.id)
      //     p.healthPoints -= 10; //takes away 10hp if you get hit by bullet
      //     // me.toRemove = true;
      //   }
      // }
      // for (var i in Target.list) { ////ENEMY DETEC
      //   var p = Target.list[i]
      //   if (me.getDist(p) < 20 && me.meteo !== p.id) { //gets distance (!== p.id)
      //     p.healthPoints -= 5; //takes away 5hp if you get hit by bullet
      //     // me.toRemove = true;
      //   }
      // }

    }

    me.retrieveInfoPack = function () { //info pack for the hp
      return {
        id: me.id, //hp id, x and y 
        x: me.x,
        y: me.y,
      };
    }

    me.retrieveUpdatePack = function () { //update pack for the hp
      return {
        id: me.id, //hp UPDATED id, x and y 
        x: me.x,
        y: me.y,
      };
    }

    HP.list[me.id] = me;

    infoPack.hP.push(me.retrieveInfoPack()); //pushes the info pack on the hp
    return me;
  }
  HP.list = {}; //hp

  HP.update = function () {  //pushes hp
    var pack = [];
    for (var i in HP.list) {
      var hP = HP.list[i];
      hP.update(); //cals for the update on the meteorite INFO
      if (hP.toRemove) { //if triggered it will remove the meteorite pack but its currently disabled!
        delete HP.list[i]
        removePack.hP.push(hP.id);
      } else
        pack.push(hP.retrieveUpdatePack()); //pushes the UPDATE pack for the meteorite
    }
    return pack;
  }

  HP.mergePack = function () {
    var hP = [];
    for (var i in HP.list)
      hP.push(HP.list[i].retrieveInfoPack()); //pushes the info pack for the meteorite
    return hP;
  }


