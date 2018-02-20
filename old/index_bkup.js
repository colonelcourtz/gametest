
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var count = 0;

app.use('/js', express.static(__dirname + '/js'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/rooms.html');
});


io.on('connection', function(socket){

	console.log("user connected -- should join room on selection")

  socket.on('room',function(room){
    console.log("ROOM:"+room)
    socket.join(room);

     socket.on('message', function(msg){
      console.log(msg)
      io.sockets.in(room).emit('message', msg);
    });
  })
 

  
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
    