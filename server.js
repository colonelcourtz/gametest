
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


app.use('/js', express.static(__dirname + '/js'));
app.use('/assets', express.static(__dirname + '/assets'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

server.listen(3000,function(){ // Listens to port 3000
    console.log('Listening on '+server.address().port);
});


server.lastPlayerID = 0; // Keep track of the last id assigned to a new player
io.on('connection',function(socket){
   socket.on('room',function(room){
	    console.log("ROOM:"+room)
	    socket.join(room);
	    socket.emit('playerRoom',room);
	    socket.on('newplayer',function(name){
	        //creating a new player
	        socket.player = {
	            name: name,
	            room:room,
	            x: server.lastPlayerID*30,
	            y: 0,
	            id: server.lastPlayerID++,
	        };
	        //send all players (including our new one) back to our current player
	        socket.emit('allplayers',getAllPlayers(room));
	        socket.emit('thisPlayer',socket.player)
	        //send new player to all players
	        socket.broadcast.in(room).emit('newplayer',socket.player);

	        socket.on('updateServerPos',function(position){
	        	socket.player.x = position.x;
	        	socket.player.y = position.y;
	        	socket.broadcast.in(room).emit('updatePlayerPos',socket.player)
	        })

	        socket.on('sendMovementToServer',function(direction){
	            socket.player.direction = direction;
	            socket.broadcast.in(room).emit('updatePlayerMov',socket.player);
	        });
	        
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