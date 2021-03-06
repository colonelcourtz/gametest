
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

//include jQuery
require("jsdom/lib/old-api").env("", function(err, window) {
    if (err) {
        console.error(err);
        return;
    }
    $ = require("jquery")(window);
});

//set up where our assets can be accessed
app.use('/js', express.static(__dirname + '/js'));
app.use('/assets', express.static(__dirname + '/assets'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

//set up our index
app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

//start the server on port 3000
server.listen(3000,function(){ // Listens to port 3000
    console.log('Listening on '+server.address().port);
});






io.on('connection',function(socket){
   socket.on('room',function(room){
   		//join the specified room - if no room, it creates a new one
	    socket.join(room);
	    socket.emit('playerRoom',room); //send this room to our player
	    socket.on('newplayer',function(name){
	    	id = io.sockets.adapter.rooms[room].length;
	        //creating a new player
	        socket.player = {
	            name: name,
	            room:room,
	            x: id*30,
	            y: 0,
	            id: id,
	        };
	        //send all players (including our new one) back to our current player
	        socket.emit('thisPlayer',socket.player)
	        socket.emit('allPlayers',getAllPlayers(room));
	        //send new player to all players
	        
	        socket.broadcast.in(room).emit('newplayer',socket.player);
	        
	        socket.on('disconnect',function(){
	            io.emit('remove',socket.player.id);
	            console.log("player "+socket.player.id+" disconnected")
	        });
	    });
    });
});


function getAllPlayers(room){
	var clients = io.sockets.adapter.rooms[room];
    var players = [];
    $.each(clients.sockets,function(index,socket){
        var player = io.sockets.connected[index].player;
        if(player) players.push(player);
    })
    return players;
}