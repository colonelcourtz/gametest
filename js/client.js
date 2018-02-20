/**
 * Created by Jerome on 03-03-17.
 */

var Client = {};
Client.socket = io.connect();
Client.askNewPlayer = function(){
    console.log("REQUESTING NEW PLAYER");
    //create a new player request to the server
    Client.socket.emit('newplayer');
};

Client.triggerMovement = function(direction){
   Client.socket.emit('triggerMove', {direction:direction});
};

Client.socket.on('allplayers',function(data){
    for(var i = 0; i < data.length; i++){
      Game.addNewPlayer(data[i].id,data[i].x,data[i].y);
    }
});
Client.socket.on('newplayer',function(data){
    Game.addNewPlayer(data.id,data.x,data.y)
})
Client.socket.on('thisPlayer',function(data){
    Game.setThisPlayer(data.id)
})
Client.socket.on('movePlayer',function(data){
	Game.movePlayer(data.id,data.direction)
})


Client.socket.on('remove',function(id){
    Game.removePlayer(id);
});


