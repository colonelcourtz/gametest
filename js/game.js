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
//Update positions of each player when triggered by server
Game.updatePositions = function(id, x, y){
    if(typeof Game.playerMap[id] != "undefined"){
        console.log("updating "+id+"with"+x+","+y)
        Game.playerMap[id].x = x;
        Game.playerMap[id].y = y;
    }
}
Game.requestCurrentPos = function(){
    Client.updatePositions(Game.playerMap);
}

Game.update = function(){
    game.physics.arcade.collide(group)
	touchingFloor = [];
	$.each(Game.playerMap,function(index, thisPlayer){
		touchingFloor[index] = game.physics.arcade.collide(thisPlayer,layer[1]);
        var position = {x:thisPlayer.x,y:thisPlayer.y};
         if (cursors.left.isDown){
               Client.triggerMovement("left",position)
               Game.movePlayer(MYID,"left")
        }else if (cursors.right.isDown){
               Client.triggerMovement("right",position)
               Game.movePlayer(MYID,"right")
        }else{
            Client.triggerMovement("stop", position)
            Game.movePlayer(MYID,"stop")
        }
        if (cursors.up.isDown && touchingFloor[index]){
            Client.triggerMovement("jump",position)
            Game.movePlayer(MYID,"jump")
        }
	})
   

}

Game.removePlayer = function(id){
    Game.playerMap[id].destroy();
    delete Game.playerMap[id];
};
