/**
 * Created by Jerome on 03-03-17.
 */

var Client = {};
Client.socket = io.connect();
Client.askNewPlayer = function(name){
    console.log("REQUESTING NEW PLAYER");
    //create a new player request to the server
    Client.socket.emit('newplayer',name);
};

Client.triggerMovement = function(direction,position){
   Client.socket.emit('triggerMove', {direction:direction,position:position});
};

Client.socket.on('allplayers',function(data){
    for(var i = 0; i < data.length; i++){
      Game.addNewPlayer(data[i].id,data[i].x,data[i].y,data[i].name);
    }
});
Client.socket.on('newplayer',function(data){
    Game.addNewPlayer(data.id,data.x,data.y,data.name)
})
Client.socket.on('thisPlayer',function(data){
    Game.setThisPlayer(data.id)
})
Client.socket.on('movePlayer',function(data){
	Game.movePlayer(data.id,data.direction)
})

Client.socket.on('updatePositions',function(data){
    Game.updatePositions(data);
})

Client.socket.on('remove',function(id){
    Game.removePlayer(id);
});


