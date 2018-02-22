var Game = {};
var cursors;
var map;
var layer = [];
var touchingFloor = false;
var MYID;
var updateSpeed = 1000;
Game.init = function(){
    game.stage.disableVisibilityChange = true;
};

Game.preload = function() {
    game.load.tilemap('map', '/assets/level1.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', '/assets/tilesheet.png');
    game.load.spritesheet('sprite', '/assets/dude.png', 30, 30);
    
};

//////////////////////////////////////////////////
////                                          ////
////           CREATING OUR WORLD             ////
////                                          ////
//////////////////////////////////////////////////
Game.create = function(){
	game.physics.startSystem(Phaser.Physics.ARCADE);
	cursors = game.input.keyboard.createCursorKeys();
	game.stage.backgroundColor = '#787878';
    Game.playerMap = {};
    map = game.add.tilemap('map');
    map.addTilesetImage('tiles', 'tiles');
    map.setCollisionBetween(0, 1200);
    //player physics group
    group = game.add.physicsGroup();
   	
    for(var i = 0; i < map.layers.length; i++) {
        layer[0] = map.createLayer(i);
    }
    layer[1] = map.createLayer('MyTerrain');
    layer[1].resizeWorld();
    //Create new player - me
    Client.askNewPlayer("courtney");
};

//////////////////////////////////////////////////
////                                          ////
////           CREATING NEW PLAYERS           ////
////                                          ////
//////////////////////////////////////////////////

//generic function for creating a player on the map (both us and all other players)
Game.addNewPlayer = function(id,x,y,name){
    Game.playerMap[id] = game.add.sprite(x,y,'sprite',id);
    game.physics.arcade.enable(Game.playerMap[id]);
    Game.playerMap[id].body.gravity.y = 800;
    Game.playerMap[id].body.collideWorldBounds = true;
    console.log("creating player "+id)
    //add player to physics group
    group.add(Game.playerMap[id]);
};

//Set up any special rules for our own player
Game.setThisPlayer = function(id){
    game.camera.follow(Game.playerMap[id]);
    console.log("I AM PLAYER "+id)
    MYID = id;
    Game.updateServerPos();
}

//////////////////////////////////////////////////
////                                          ////
////           OUR UPDATE FUNCTION            ////
////                                          ////
//////////////////////////////////////////////////
Game.update = function(){
    //allow players to collide with each other
    
	touchingFloor = [];
    touchingPlayer = [];
	$.each(Game.playerMap,function(index, thisPlayer){
		touchingFloor[index] = game.physics.arcade.collide(thisPlayer,layer[1]);
        touchingPlayer[index] =game.physics.arcade.collide(group)
         if (cursors.left.isDown){
               Client.sendMovement("left")
               Game.updatePlayerMov(MYID,"left")
        }else if (cursors.right.isDown){
               Client.sendMovement("right")
               Game.updatePlayerMov(MYID,"right")
        }else{
            Client.sendMovement("stop")
            Game.updatePlayerMov(MYID,"stop")
        }
       
        
        if (cursors.up.isDown ){
            Client.sendMovement("jump")
            Game.updatePlayerMov(MYID,"jump")
        }  
	})   
    Game.updateServerPos();
}

//////////////////////////////////////////////////
////                                          ////
////        HANDLE UPDATING POSITIONS         ////
////                                          ////
//////////////////////////////////////////////////
setInterval(function(){
    
},updateSpeed);
//function which sends our current position up to the server to be broadcast to all other players
Game.updateServerPos = function(){
    if(MYID){
        var position = {x:Game.playerMap[MYID].x,y:Game.playerMap[MYID].y};
        Client.updateServerPos(position);
    }
}
Game.updatePlayerPos = function(id, x, y){
    if(typeof Game.playerMap!= "undefined" && typeof Game.playerMap[id] !== "undefined"){
        Game.playerMap[id].x = x;
        Game.playerMap[id].y = y;
    }
}
Game.standing = function(id){
    player = Game.playerMap[id];
    if((touchingFloor[id] || touchingPlayer[id]) && (player.body.blocked.down || player.body.touching.down)){
        return true;
    }
}

Game.updatePlayerMov = function(id,direction){  
    if(Game.playerMap){
        var player = Game.playerMap[id];
        if(player){
            switch(direction){
                case "left": player.body.velocity.x = -150;break;
                case "right": player.body.velocity.x = +150;break;
                case "jump":
                    if(Game.standing(id)){
                        player.body.velocity.y = -300;
                    }
                break;
                case "stop": player.body.velocity.x = 0;break;
                default:player.body.velocity.x = 0;break;
            }
        }
    }    
};

//////////////////////////////////////////////////
////                                          ////
////              PLAYER DISCONNECTION         ////
////                                          ////
//////////////////////////////////////////////////
Game.removePlayer = function(id){
    Game.playerMap[id].destroy();
    delete Game.playerMap[id];
};

Game.render = function() {
    // Input debug info
   // game.debug.spriteInfo(32, 32);
   

}