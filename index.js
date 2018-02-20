
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

 count = 0;

app.use('/js', express.static(__dirname + '/js'));
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

server.listen(3000,function(){ // Listens to port 3000
    console.log('Listening on '+server.address().port);
});


server.lastPlayderID = 0; // Keep track of the last id assigned to a new player
io.on('connection',function(socket){
    console.log("player "+(server.lastPlayderID++)+" connected")
    socket.on('newplayer',function(){
        //creating a new player
        socket.player = {
            id: server.lastPlayderID++,
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
            io.sockets.emit('movePlayer',socket.player);
        });

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
    console.log(players)
    return players;
}

