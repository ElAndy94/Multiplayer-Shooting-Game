var soundID = "Thunder"; //sound

    //signIn/Out
    var signDiv = document.getElementById('signDiv'); //<!-- Sign in Div -->
    var signDivUsername = document.getElementById('signDiv-username'); //<!-- username element -->
    var signDivSignIn = document.getElementById('signDiv-signIn'); //<!-- sign in element -->
    var signDivPassword = document.getElementById('signDiv-password'); //<!-- password element -->
    var signDivUp = document.getElementById('signDiv-signUp'); //<!-- password element -->

    signDivSignIn.onclick = function(){  //<!-- clicking the sign in button does this function -->
        socket.emit('LogIn',{username:signDivUsername.value,password:signDivPassword.value}); //<!-- emits username + password to server -->
        }

    signDivUp.onclick = function(){  //<!-- clicking the sign in button does this function -->
        socket.emit('signUp',{username:signDivUsername.value,password:signDivPassword.value}); //<!-- emits username + password to server -->
        }

    socket.on('LogInResponse',function(data){  // Sign in Response function
        if(data.success){
            signDiv.style.display = 'none'; //display none until the logging has been passed
            gameDiv.style.display = 'inline-block'; //when log in has been passed then it will display the gameDiv
        }  else
            alert("Sign in was unsuccessful!"); //if password or username is wrong, you get this alart
    });

    socket.on('signPlayerRes',function(data){  // Sign UP*** in Response function
        if(data.success){
            alert("Sign up was successful!");
        }  else
            alert("Sign in was unsuccessful!"); // Not signing up
    });


//game

  function loadSound () {
  createjs.Sound.registerSound("/client/shot.mp3", soundID);
  }
  
  function playSound () {
  createjs.Sound.play(soundID);
  }

  var ctx = document.getElementById('ctx').getContext('2d');
  ctx.font = '30px Arial';

  var Img = {}; //creats image array
  Img.grass = new Image(); 
  Img.grass.src = '/client/images/grasses.png'; //loads the background

  var Player = function(startingPack) {
      var self = {}
      self.id = startingPack.id;
      self.number = startingPack.number;
      self.x = startingPack.x;
      self.y = startingPack.y;
      self.healthPoints = startingPack.healthPoints;
      self.score = startingPack.score;
      self.maxHealthPoints = startingPack.maxHealthPoints;
      Player.list[self.id] = self;
      return self;
  }
  Player.list = {};

  var Bullet = function(startingPack) {
      var self = {}
      self.id = startingPack.id;
      self.number = startingPack.number;
      self.x = startingPack.x;
      self.y = startingPack.y;
      Bullet.list[self.id] = self;
      return self;
  }
  Bullet.list = {};

  //player and bullet info big pack
socket.on('starterPack',function(data){
    for(var i = 0; i < data.player.length; i++) //player
        // ctx.fillRect(data.player[i].x,data.player[i].y,10,10);
        new Player(data.player[i]);

    for(var i = 0; i < data.bullet.length; i++) //bullet
        // ctx.fillRect(data.bullet[i].x-1,data.bullet[i].y-1,10,10);
        new Bullet(data.bullet[i]);
  });

// update player and bullet location - id
socket.on('update',function(data){
    for(var i = 0; i < data.player.length; i++){
        var pack = data.player[i];
        var ple = Player.list[pack.id];
        if(ple) {
                if(pack.x !== undefined)
                   ple.x = pack.x;
                if(pack.y !== undefined)
                   ple.y = pack.y;
                if(pack.heatlhPoints !== undefined)
                   ple.healthPoints = pack.healthPoints;
                if(pack.score !== undefined)
                   ple.score = pack.score;
        }
    }

    for(var i = 0; i < data.bullet.length; i++){
        var pack = data.bullet[i];
        var bul = Bullet.list[data.bullet[i].id];
        if(bul) {
                if(pack.x !== undefined)
                   bul.x = pack.x;
                if(pack.y !== undefined)
                   bul.y = pack.y;
        }
    }
});
    
//remove player/bullet
socket.on('remove',function(data){
    for(var i = 0; i < data.player.length; i++){
        delete Player.list[data.player[i]];
    }
    for(var i = 0; i < data.bullet.length; i++){
        delete Bullet.list[data.bullet[i]];
    }
});

//draw
setInterval(function(){
    ctx.clearRect(0,0,500,500);
    drawGrass();
    for(var i in Player.list)
        // var healthPointsWidth = 30 * self.healthPoints / self.maxHealthPoints;

        // ctx.fillRect(self.x - healthPointsWidth/2,self.y - 40,healthPointsWidth,4);
        ctx.fillRect(Player.list[i].x,Player.list[i].y,10,10);
        // ctx.fillText(self.score,self.x,self.y-60);

    for(var i in Bullet.list)
        ctx.fillRect(Bullet.list[i].x-1,Bullet.list[i].y-1,10,10);
},40);



  var drawGrass = function(){
		ctx.drawImage(Img.grass,1,1,500,500); //draws the grass in that area
	}


  document.onkeydown = function(event){ //keyboard controls
      if(event.keyCode === 39) //right arrow
          socket.emit('movementKey' ,{inputId:'right',state:true});
      if(event.keyCode === 40) //down arrow
          socket.emit('movementKey' ,{inputId:'down',state:true});
      if(event.keyCode === 37) //left arrow
          socket.emit('movementKey' ,{inputId:'left',state:true});
      if(event.keyCode === 38) //up arrow
          socket.emit('movementKey' ,{inputId:'up',state:true});
    //   if(event.keyCode === 32) //space bar
    //       socket.emit('movementKey' ,{inputId:'attack',state:true});
    //       playSound();
  }

  document.onkeyup = function(event){
      if(event.keyCode === 39) //right arrow
          socket.emit('movementKey' ,{inputId:'right',state:false});
      if(event.keyCode === 40) //down arrow
          socket.emit('movementKey' ,{inputId:'down',state:false});
      if(event.keyCode === 37) //left arrow
          socket.emit('movementKey' ,{inputId:'left',state:false});
      if(event.keyCode === 38) //up arrow
          socket.emit('movementKey' ,{inputId:'up',state:false});
    //   if(event.keyCode === 32) //space bar up
    //       socket.emit('movementKey' ,{inputId:'attack',state:false});
   }


   document.onmousedown = function(event){
     socket.emit('movementKey',{inputId:'attack',state:true}); //mouse down to attack (click)*

     if(event.target.attributes["id"].value !== "ctx"){ // only plays shot sound once im logged in, had clickdown sound when pressing login!*
         return;
     } else {
         playSound();
     }
   }

   document.onmouseup = function(event){
     socket.emit('movementKey',{inputId:'attack',state:false}); //when not attacking, (unlicked)*
   }

   document.onmousemove = function(event){
      var x = -250 + event.clientX - 8;  //500 being the whole screen
      var y = -250 + event.clientY - 8;
      var angle = Math.atan2(y,x) / Math.PI * 180;
      socket.emit('movementKey',{inputId:'mouseAngle',state:angle});
   }
