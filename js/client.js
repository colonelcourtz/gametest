/**
 * Created by Jerome on 03-03-17.
 */

var Client = {};
Client.socket = io.connect();

////////////P2P TEST with simple-peer///////////



p = new SimplePeer({ initiator: location.hash === '#1', trickle: false });

console.log(p)
p.on('connect', function () {
  console.log('CONNECT')
  p.send('whatever' + Math.random())
})
p.on('error', function (err) { console.log('error', err) })

p.on('signal', function (data) {
  console.log('SIGNAL', JSON.stringify(data))
  document.querySelector('#outgoing').textContent = JSON.stringify(data)
})

  p.signal("hello")

/////////////////p2p tst end///////////////

//////////////////////////////////////////////////
////                                          ////
////          Add players to game             ////
////                                          ////
//////////////////////////////////////////////////

Client.joinRoom = function(room){
    Client.socket.emit('room',room)
}
Client.askNewPlayer = function(name){
    console.log("REQUESTING NEW PLAYER");
    //create a new player request to the server
    Client.socket.emit('newplayer',name);
};

Client.socket.on('playerRoom',function(room){
    Game.startGame(room);
})

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


//////////////////////////////////////////////////
////                                          ////
////        Update Player Posisitons          ////
////                                          ////
//////////////////////////////////////////////////
Client.updateServerPos = function(position){
    Client.socket.emit('updateServerPos',position)
}
Client.sendMovement = function(direction){
   Client.socket.emit('sendMovementToServer', direction);
};

Client.socket.on('updatePlayerPos',function(data){
    Game.updatePlayerPos(data.id,data.x, data.y)
})
Client.socket.on('updatePlayerMov',function(data){
    Game.updatePlayerMov(data.id,data.direction)
})


//////////////////////////////////////////////////
////                                          ////
////               DISCONNECT                 ////
////                                          ////
//////////////////////////////////////////////////



Client.socket.on('remove',function(id){
    Game.removePlayer(id);
});


