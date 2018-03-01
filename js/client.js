/**
 * Created by Jerome on 03-03-17.
 */

var Client = {};
Client.socket = io.connect();
var current_players = [];
var connectedPeers ={};

////////////P2P TEST with simple-peer///////////


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

Client.socket.on('thisPlayer',function(data){
 
    Game.setThisPlayer(data.id);
    //start the new peer connection
    peer = new Peer(data.id,{key: '68biajk40f3whfr'});
    //when peer is ready - peer server has responded - and connected, let us know
    peer.on('open', function(id) {
      console.log('My peer ID is: ' + id);
    });


Client.socket.on('allplayers',function(data){
    for(var i = 0; i < data.length; i++){
      current_players.push(data[i].id)
      Game.addNewPlayer(data[i].id,data[i].x,data[i].y,data[i].name);
      //when we get all players attempt a peer connection

      //connect to a peer based on id
      if(data[i].id != MYID){
        console.log("attempting connection to "+data[i].id)
        conn = peer.connect(data[i].id);
        conn.on('open', function(){
          connectedPeers[conn.peer] = conn;
        });
      }
      //add this connection to our list of connected peers
      
      //when we receive a connection from another peer - let us know about it
      peer.on('connection', function(conn) { 
          conn.on('open', function() {
          // Receive messages
          conn.on('data', function(data) {
            //console.log(data);
            Game.updatePlayerPos(data.id,data.x, data.y)
          });         
        });
      });
    }
});
})
Client.socket.on('newplayer',function(data){
    Game.addNewPlayer(data.id,data.x,data.y,data.name);
    current_players.push(data.id)
    console.log("attempting connection to "+data.id)
    conn = peer.connect(data.id);
    conn.on('open', function(){
      connectedPeers[conn.peer] = conn;
    });
})

 

//////////////////////////////////////////////////
////                                          ////
////        Update Player Posisitons          ////
////                                          ////
//////////////////////////////////////////////////
Client.sendPositionPeers = function(position){
    //Client.socket.emit('updateServerPos',position)
    $.each(connectedPeers, function(index, peer){
      if(peer.peer != MYID){
        position.id = MYID;
        peer.send(position);
      }
    
    })
}
Client.sendMovement = function(direction){
   //Client.socket.emit('sendMovementToServer', direction);

};

Client.socket.on('updatePlayerPos',function(data){
    //Game.updatePlayerPos(data.id,data.x, data.y)
})
Client.socket.on('updatePlayerMov',function(data){
    //Game.updatePlayerMov(data.id,data.direction)
})


//////////////////////////////////////////////////
////                                          ////
////               DISCONNECT                 ////
////                                          ////
//////////////////////////////////////////////////



Client.socket.on('remove',function(id){
    Game.removePlayer(id);
});


