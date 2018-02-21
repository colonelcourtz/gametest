
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


server.lastPlayerID = 1; // Keep track of the last id assigned to a new player
io.on('connection',function(socket){
    ;
    socket.on('newplayer',function(name){
        //creating a new player
        socket.player = {
            id: server.lastPlayerID++,
            name: name,
            x: 0,
            y: 0,
        };
        //send all players (including our new one) back to our current player
        socket.emit('allplayers',getAllPlayers());
        socket.emit('thisPlayer',socket.player)
        //send new player to all players
        socket.broadcast.emit('newplayer',socket.player);

        socket.on('triggerMove',function(data){
            socket.player.direction = data.direction;
            socket.player.x = data.position.x;
            socket.player.y = data.position.y;
            io.sockets.emit('movePlayer',socket.player);
        });

        //update all player positions periodically - but not for our own player (coz we know where that is!)
        setInterval(function(){
            socket.broadcast.emit('updatePositions',getAllPlayers()); 
        }, 1000);

        socket.on('disconnect',function(){
            io.emit('remove',socket.player.id);
            server.lastPlayderID--;
            console.log("player "+socket.player.id+" disconnected")
        });
    });
});

function getAllPlayers(){
    var players = [];
    $.each(io.sockets.connected,function(index){
         var player = io.sockets.connected[index].player;
        if(player) players.push(player);
    })
    return players;
}

