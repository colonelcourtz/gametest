var Game = {};
var cursors;
var map;
var layer = [];
var touchingFloor = false;
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
   	
    for(var i = 0; i < map.layers.length; i++) {
        layer[0] = map.createLayer(i);
    }
    
    layer[1] = map.createLayer('MyTerrain');
    layer[1].resizeWorld();

    //Create new player - me
    Client.askNewPlayer("courtney");
    
};


Game.addNewPlayer = function(id,x,y,name){
    console.log("Adding new player "+id+name)
    Game.playerMap[id] = game.add.sprite(x,y,'sprite');
    game.physics.arcade.enable(Game.playerMap[id]);
    Game.playerMap[id].body.gravity.y = 800;
    Game.playerMap[id].body.collideWorldBounds = true;

     
  };
  Game.setThisPlayer = function(id){
    console.log("setting this player: "+id)
     game.camera.follow(Game.playerMap[id]);
     Game.playerMap[id].frame = id;  
  }

Game.movePlayer = function(id,direction){  
    if(Game.playerMap){
      var player = Game.playerMap[id];
      if(player){
          switch(direction){
            case "left": player.body.velocity.x = -150;break;
            case "right": player.body.velocity.x = +150;break;
            case "jump": 
                if(touchingFloor){player.body.velocity.y = -300};
            break;
            case "stop": player.body.velocity.x = 0;break;
            default:player.body.velocity.x = 0;break;
        }
        
    }
}
    
    
};

Game.update = function(){
	
	$.each(Game.playerMap,function(index, thisPlayer){
		touchingFloor = game.physics.arcade.collide(thisPlayer,layer[1]);
	})
	if (cursors.left.isDown){
     	   Client.triggerMovement("left")
    }else if (cursors.right.isDown){
    	   Client.triggerMovement("right")
    }else{
    	Client.triggerMovement("stop")
    }
    if (cursors.up.isDown && touchingFloor){
        Client.triggerMovement("jump")
    }
}
/*
Game.removePlayer = function(id){
    Game.playerMap[id].destroy();
    delete Game.playerMap[id];
};
*/