
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

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

server.listen(3000,function(){ // Listens to port 3000
    console.log('Listening on '+server.address().port);
});


server.lastPlayerID = 0; // Keep track of the last id assigned to a new player
io.on('connection',function(socket){
   
    socket.on('newplayer',function(name){
        //creating a new player
        socket.player = {
            name: name,
            x: server.lastPlayerID*30,
            y: 0,
            id: server.lastPlayerID++,
        };
        //send all players (including our new one) back to our current player
        socket.emit('allplayers',getAllPlayers());
        socket.emit('thisPlayer',socket.player)
        //send new player to all players
        socket.broadcast.emit('newplayer',socket.player);

        socket.on('updateServerPos',function(position){
        	socket.player.x = position.x;
        	socket.player.y = position.y;
        	socket.broadcast.emit('updatePlayerPos',socket.player)
        })

        socket.on('triggerMove',function(direction){
            socket.player.direction = direction;
            socket.broadcast.emit('movePlayer',socket.player);
        });
        
        socket.on('disconnect',function(){
            io.emit('remove',socket.player.id);
            console.log("player "+socket.player.id+" disconnected")
        });
    });
});


 function getAllPlayers(){

            var players = [];
            $.each(io.sockets.connected,function(index,socket){
                
                    var player = io.sockets.connected[index].player;
                    
                    if(player) players.push(player);
                
            })
            return players;
        }