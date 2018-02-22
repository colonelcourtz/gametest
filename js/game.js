var Game = {};
var cursors;
var map;
var layer = [];
var touchingFloor = false;
var MYID;
Game.init = function(){
    game.stage.disableVisibilityChange = true;
};

Game.preload = function() {
    game.load.tilemap('map', '/assets/level1.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', '/assets/tilesheet.png');
    game.load.spritesheet('sprite', '/assets/dude.png', 30, 30);
    
};

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


Game.addNewPlayer = function(id,x,y,name){
    
    Game.playerMap[id] = game.add.sprite(x,y,'sprite',id);
    game.physics.arcade.enable(Game.playerMap[id]);
    Game.playerMap[id].body.gravity.y = 800;
    Game.playerMap[id].body.collideWorldBounds = true;
    console.log("creating player "+id)
    //add player to physics group
    group.add(Game.playerMap[id]);
};
Game.setThisPlayer = function(id){
    game.camera.follow(Game.playerMap[id]);
    console.log("I AM PLAYER "+id)
    MYID = id;
    Game.updateServerPos();
}

Game.movePlayer = function(id,direction){  
    if(Game.playerMap){
      var player = Game.playerMap[id];
      if(player){
            switch(direction){
                case "left": player.body.velocity.x = -150;break;
                case "right": player.body.velocity.x = +150;break;
                case "jump": 
                if(touchingFloor[id]){
                    player.body.velocity.y = -300;
                }
                break;
                case "stop": player.body.velocity.x = 0;break;
                default:player.body.velocity.x = 0;break;
            }
        
        }
    }    
};

Game.update = function(){
    //allow players to collide with each other
    game.physics.arcade.collide(group)
	touchingFloor = [];
	$.each(Game.playerMap,function(index, thisPlayer){
		touchingFloor[index] = game.physics.arcade.collide(thisPlayer,layer[1]);
         if (cursors.left.isDown){
               Client.triggerMovement("left")
               Game.movePlayer(MYID,"left")
        }else if (cursors.right.isDown){
               Client.triggerMovement("right")
               Game.movePlayer(MYID,"right")
        }else{
            Client.triggerMovement("stop")
            Game.movePlayer(MYID,"stop")
        }
        if (cursors.up.isDown && touchingFloor[index]){
            Client.triggerMovement("jump")
            Game.movePlayer(MYID,"jump")
        }  
	})   
}
setInterval(function(){
    Game.updateServerPos();
},200);

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

Game.removePlayer = function(id){
    Game.playerMap[id].destroy();
    delete Game.playerMap[id];
};

Game.render = function() {
    // Input debug info
   // game.debug.spriteInfo(32, 32);
   

}