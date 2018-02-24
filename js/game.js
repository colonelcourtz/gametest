
    var Game = {};
    var cursors;
    var map;
    var layer = [];
    var touchingFloor = false;
    var MYID;
    var updateSpeed = 1000;
    var allowStart = false;
    Game.init = function(){
        game.stage.disableVisibilityChange = true;
        game.add.plugin(PhaserInput.Plugin);
    };

    Game.preload = function() {
        game.load.tilemap('map', '/assets/level_01.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('tiles', '/assets/tilesheet.png');
        game.load.spritesheet('sprite', '/assets/dude.png', 30, 30);
        game.load.spritesheet('button', '/assets/button.png', 150, 30);
        
    };

    //////////////////////////////////////////////////
    ////                                          ////
    ////           CREATING OUR WORLD             ////
    ////                                          ////
    //////////////////////////////////////////////////
    Game.create = function(){
        var inputStyle= {
    font: '18px Arial',
    fill: '#212121',
    fontWeight: 'bold',
    width: 135,
    padding: 8,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 6
}
        Game.input = game.add.inputField(game.world.centerX - (inputStyle.width/2), game.world.centerY-50, inputStyle);
        Game.button = game.add.button(game.world.centerX - (inputStyle.width/2), game.world.centerY, 'button', actionOnClick, this, 2, 1, );
        function actionOnClick(){
            allowStart = true;
            Client.joinRoom(Game.input.value);
            //Game.startGame();
        }
    	
    };
    Game.startGame = function(room){
        console.log("YOU ARE IN ROOM:"+room)
        
        
        var t = game.add.text(30, 20, "In room: "+room,{ font: "32px Arial", fill: "#000", align: "left" })
        t.fixedToCamera = true;
        t.cameraOffset.setTo(30, 20);

        Game.button.pendingDestroy = true;
        Game.input.pendingDestroy = true;
        game.physics.startSystem(Phaser.Physics.ARCADE);
        cursors = game.input.keyboard.createCursorKeys();
        game.stage.backgroundColor = '#787878';
        Game.playerMap = {};
        map = game.add.tilemap('map');
        map.addTilesetImage('tiles', 'tiles');
        map.setCollisionBetween(0, 1200);
<<<<<<< HEAD
        //map.setTileIndexCallback(622, hitCoin, this);
=======
       
>>>>>>> 0ae05660e04dac597503e16e0691a5c27ecb4023
        
        //  This will set the map location 2, 0 to call the function
        //map.setTileLocationCallback(1, 3, 1, 1, hitCoin, this);

        //player physics group
        group = game.add.physicsGroup();
        
        for(var i = 0; i < map.layers.length; i++) {
            layer[0] = map.createLayer(i);
        }
        layer[1] = map.createLayer('MyTerrain');
        layer[2] = map.createLayer('Background')
        layer[1].resizeWorld();
        //Create new player - me
        Client.askNewPlayer("courtney");
         map.setTileIndexCallback(622, hitTerrain, this);
    }
    function hitTerrain(sprite,tile){
        tile.alpha = 0.2;

        
    

        return true;
    }
 
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
      
        //add player to physics group
        group.add(Game.playerMap[id]);
        //add player label and add as a child of the player
        text = game.add.text(0,0,id);
        Game.playerMap[id].addChild(text)
    };

    //Set up any special rules for our own player
    Game.setThisPlayer = function(id){
        game.camera.follow(Game.playerMap[id]);
        var t = game.add.text(30, 50, "Player: "+id,{ font: "32px Arial", fill: "#000", align: "left" })
        t.fixedToCamera = true;
        t.cameraOffset.setTo(30, 50);
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
       
        
    }
    setInterval(function(){
         //SEND OUR POSITION TO SERVER
        Game.updateServerPos();
    },1000)

    //////////////////////////////////////////////////
    ////                                          ////
    ////        HANDLE UPDATING POSITIONS         ////
    ////                                          ////
    //////////////////////////////////////////////////

    //function which sends our current position up to the server to be broadcast to all other players
    Game.updateServerPos = function(){
        if(MYID){
            if(typeof Game.playerMap[MYID] !== "undefined"){
                var position = {x:Game.playerMap[MYID].x,y:Game.playerMap[MYID].y};
                Client.updateServerPos(position);
            }
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
                            player.body.velocity.y = -350;
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
