//var io = require('socket.io')(80);
// var io = require('socket.io')(server);
var io = require('socket.io')(server,{});



    var WIDTH = 500;
	  var HEIGHT = 500;
    var socket = io(); // socket io
    var soundID = "Thunder"; //sound

    //signIn/Out
    var signDiv = document.getElementById('signDiv'); //<!-- Sign in Div -->
    var signDivUsername = document.getElementById('signDiv-username'); //<!-- username element -->
    var signDivSignIn = document.getElementById('signDiv-signIn'); //<!-- sign in element -->
    var signDivPassword = document.getElementById('signDiv-password'); //<!-- password element -->

    signDivSignIn.onclick = function(){  //<!-- clicking the sign in button does this function -->
        socket.emit('signIn',{username:signDivUsername.value,password:signDivPassword.value}); //<!-- emits username + password to server -->
        }

    socket.on('signInResponse',function(data){  // Sign in Response function
        if(data.success){
            signDiv.style.display = 'none'; //display none until the logging has been passed
            gameDiv.style.display = 'inline-block'; //when log in has been passed then it will display the gameDiv
        }  else
            alert("Sign in was unsuccessful!"); //if password or username is wrong, you get this alart
    });

    //Chat
    var chatText = document.getElementById('chat-text'); //chat text
    var chatInput = document.getElementById('chat-input'); //chat input
    var chatForm = document.getElementById('chat-form'); //the chat form

    socket.on('addToChat',function(data){  //this adds the message to chat
       chatText.innerHTML += '<div>' + data + '</div>';
    });

    socket.on('evalAnswer',function(data){  //evalutation answer
       console.log(data);
    });

    chatForm.onsubmit = function(e) {
        e.preventDefault(); //prevents ""
        if(chatInput.value[0] === '/')
		{
            socket.emit('evalServer',chatInput.value.slice(1)); //to evaluate
		}
        else
            socket.emit('sendMsgToSever',chatInput.value); //this is to send message to sever
        chatInput.value = ''; //resets ""
    }



//game

  function loadSound () {
  createjs.Sound.registerSound("assets/thunder.mp3", soundID);
  }

  function playSound () {
  createjs.Sound.play(soundID);
  }

  var ctx = document.getElementById('ctx').getContext('2d');
  ctx.font = '30px Arial';


  socket.on('newPositions', function(data){
    ctx.clearRect(0,0,500,500);
    for(var i = 0; i < data.player.length; i++) //player
        ctx.fillText(data.player[i].number,data.player[i].x,data.player[i].y);


    for(var i = 0; i < data.bullet.length; i++) //bullet
        ctx.fillRect(data.bullet[i].x-5,data.bullet[i].y-5,10,10);
  });

  document.onkeydown = function(event){ //keyboard controls
      if(event.keyCode === 39) //right arrow
          socket.emit('keyPress' ,{inputId:'right',state:true});
      if(event.keyCode === 40) //down arrow
          socket.emit('keyPress' ,{inputId:'down',state:true});
      if(event.keyCode === 37) //left arrow
          socket.emit('keyPress' ,{inputId:'left',state:true});
      if(event.keyCode === 38) //up arrow
          socket.emit('keyPress' ,{inputId:'up',state:true});
  }

  document.onkeyup = function(event){
      if(event.keyCode === 39) //right arrow
          socket.emit('keyPress' ,{inputId:'right',state:false});
      if(event.keyCode === 40) //down arrow
          socket.emit('keyPress' ,{inputId:'down',state:false});
      if(event.keyCode === 37) //left arrow
          socket.emit('keyPress' ,{inputId:'left',state:false});
      if(event.keyCode === 38) //up arrow
          socket.emit('keyPress' ,{inputId:'up',state:false});
   }

   document.onmousedown = function(event){
     socket.emit('keyPress',{inputId:'attack',state:true});
   }
   document.onmouseup = function(event){
     socket.emit('keyPress',{inputId:'attack',state:false});
   }

   document.onmousemove = function(event){
      var x = -250 + event.clientX - 8;  //500 being the whole screen
      var y = -250 + event.clientY - 8;
      var angle = Math.atan2(y,x) / Math.PI * 180;
      socket.emit('keyPress',{inputId:'mouseAngle',state:angle});
   }
