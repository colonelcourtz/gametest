
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var count = 0;
var lastPlayerID = 0;

app.use('/js', express.static(__dirname + '/js'));
app.use('/assets', express.static(__dirname + '/assets'));
app.get('/', function(req, res){
	res.sendFile(__dirname + '/index_game.html');
});


io.on('connection', function(socket){
  socket.on('room',function(room){
    console.log("ROOM:"+room)
    socket.join(room);

     socket.on('movement',function(data){
      socket.player.x = data.x;
      socket.player.x = data.y;
      socket.broadcast.to(room).emit('movement',socket.player)
     })
     socket.on('newplayer',function(){
    count ++;
    socket.player = {
      id:lastPlayerID++,
      x:count*27,
      y:0
    };
    socket.to(room).emit('allplayers',getAllPlayers());
    socket.broadcast.to(room).emit('newplayer',socket.player);
  })


  })

  

 

  
});
function getAllPlayers(){
  var players = [];
  Object.keys(io.sockets.connected).forEach(function(socketID){
    console.log(socketID)
    var player = io.sockets.connected[socketID].player;
    if(player){
      players.push(player);
    }

  })
   console.log(players)
    return players;
}

http.listen(3000, function(){
  console.log('listening on *:3000');
});
    