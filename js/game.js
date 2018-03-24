
    var Game = {};
    var cursors;
    var map;
    var MYID;
    var MYTYPE = MYID;
    //type 1 = digger
    //type 2 = constructor
    var layer = [];
    var touchingFloor = false;
    var updateSpeed = 1000;
    var allowStart = false;
    var time = 1000;
    var timetext;

    Game.init = function(){
        game.stage.disableVisibilityChange = true;
        game.add.plugin(PhaserInput.Plugin);
    };

    Game.preload = function() {
        game.load.tilemap('map', '/assets/levels/2player/level_01.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('tiles', '/assets/images/tilesheet.png');
        game.load.image('bg_space', '/assets/images/bg_space.jpg');
        game.load.spritesheet('sprite', '/assets/images/dude.png', 30, 30);
        game.load.spritesheet('timeToken', '/assets/images/timeToken.png', 30, 30);
        game.load.spritesheet('block', '/assets/images/block.png', 30, 30);
        game.load.spritesheet('button', '/assets/images/button.png', 150, 30);
    };

    //////////////////////////////////////////////////
    ////                                          ////
    ////           CREATING OUR WORLD             ////
    ////                                          ////
    //////////////////////////////////////////////////
    Game.create = function(){
        //Style for input box
        var inputStyle= {
            font: '18px Arial',
            fill: '#212121',
            fontWeight: 'bold',
            width: 135,
            padding: 8,
            borderWidth: 1,
            borderColor: '#fff',
            borderRadius: 6
        }
        //add input field for selecting roomname
        Game.input = game.add.inputField(game.world.centerX - (inputStyle.width/2), game.world.centerY-50, inputStyle);
        //button to join room
        Game.button = game.add.button(game.world.centerX - (inputStyle.width/2), game.world.centerY, 'button', actionOnClick, this, 2, 1, );
        function actionOnClick(){
            allowStart = true;
            Client.joinRoom(Game.input.value);
        }
		//SETS ROOM TO DEFAULT -- REMOVE LINE TO CHOOSE ROOM
    	 //Client.joinRoom("default");
    };



    Game.startGame = function(room){
        console.log("YOU ARE IN ROOM:"+room)

        //Text for user        
        var t = game.add.text(30, 20, "In room: "+room,{ font: "32px Arial", fill: "#fff", align: "left" })
        t.fixedToCamera = true;
        t.cameraOffset.setTo(30, 20);


        timetext = game.add.text(30, 80, "Time: "+time,{ font: "32px Arial", fill: "#fff", align: "left" })
        timetext.fixedToCamera = true;
        timetext.cameraOffset.setTo(30, 80);

        //remove input and button
        Game.button.pendingDestroy = true;
        Game.input.pendingDestroy = true;

        //start physics and enable keyboard input
        game.physics.startSystem(Phaser.Physics.ARCADE);
        cursors = game.input.keyboard.createCursorKeys();
        spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        //styling
        game.stage.backgroundColor = '#b5eeff';
        
        bg = game.add.tileSprite(0, 0, 1092, 1080, 'bg_space');
        bg.fixedToCamera = true
        //create the playermap object
        Game.playerMap = {};
        //create the blockmap object
        Game.blockMap = {};
        //create a tilemap
        map = game.add.tilemap('map');
        map.addTilesetImage('tiles', 'tiles');
        map.setCollisionBetween(0, 1023);

        //create the background and main layers
        layer[1] = map.createLayer('MyTerrain');
        layer[2] = map.createLayer('Background')
        layer[1].resizeWorld();
        //layer[1].debug = true;

        //callback when hitting terrain type 622 -- JUST FOR TESTING
        
        

        map.setTileIndexCallback(1019, collectTime, this);

        //player physics group
        playergroup = game.add.physicsGroup();

        //block physics group
        blockgroup = game.add.physicsGroup();
        
        //Create new player - me 
        Client.askNewPlayer("courtney");
         //  Here we create our coins group
        coins = game.add.group();
        coins.enableBody = true;

        map.createFromObjects('objects', 781, 'timeToken', 0, true, false, coins);

        //TESTING -- ON CLICKING A TILE WE GET PROPERTIES -- JUST FOR TESTING
        //game.input.onDown.add(getTileProperties,this)
        // click mouse creates block at mouse position
        
    }
    //useful for finding ids and stuff -- JUST FOR TESTING
    function getTileProperties(){
    	var x = layer[1].getTileX(game.input.activePointer.worldX);
    	var y = layer[1].getTileY(game.input.activePointer.worldY);
    	var tile = map.getTile(x,y,layer[1]);

    	console.log(tile);
    }

    //creates a block either based on the mouseclick position or based on parameters passed
    Game.createBlock = function(pointer,Z,x,y,sendToPeers){
		var id = Object.keys(Game.blockMap).length++;
        var blockX = x || game.input.activePointer.worldX;
        var blockY = y || game.input.activePointer.worldY;
		Game.blockMap[id] = game.add.sprite(blockX,blockY,'block',id);
    	game.physics.arcade.enable(Game.blockMap[id]);
    	blockgroup.add(Game.blockMap[id]);
    	Game.blockMap[id].body.gravity.y = 800;
    	Game.blockMap[id].body.mass = 1;
    	Game.blockMap[id].body.collideWorldBounds = true;
        
        //send new block to other players
        if(sendToPeers){
            Game.createPeerBlock(blockX,blockY);
        }
    }

    

Game.deleteBlock = function(pointer,Z,x,y,sendToPeers){
    var x = x || pointer.worldX
    var y = y || pointer.worldY
    tile = map.getTileWorldXY(x, y)
    //Tiles world coordinates:
    if(tile){
        tile.index = -1;
        tile.collideDown = false;
        tile.collideUp = false;
        tile.collideLeft = false;
        tile.collideRight = false;
        map.forEach(function(tile){})
    }
    if(sendToPeers){
           Game.deletePeerBlock(x,y);
    }


   
   //click at 100, 200 world give you 1, 3
}


    //function for callback when hitting the time-tokens -- JUST FOR TESTING
    function collectTime(player,coin){
        coin.kill();
        console.log(coin)
        time +=10;
        return false;
    }
 
    //////////////////////////////////////////////////
    ////                                          ////
    ////           CREATING NEW PLAYERS           ////
    ////                                          ////
    //////////////////////////////////////////////////
	//Set up any special rules for our own player
    Game.setThisPlayer = function(id){
        var t = game.add.text(30, 50, "Player: "+id,{ font: "32px Arial", fill: "#fff", align: "left" })
        t.fixedToCamera = true;
        t.cameraOffset.setTo(30, 50);
        MYID = id;
        //send our poisition to peers when we're first created
        Game.sendPositionPeers();
        //set up player abilities
        if(MYID == 1){
            game.input.onDown.add(Game.createBlock,this,0,"","",true);
        }else{
            game.input.onDown.add(Game.deleteBlock,this,0,"","",true);
        }
        
        
    }

    //generic function for creating a player on the map (both us and all other players)
    Game.addNewPlayer = function(id,x,y,name,name){

        //add sprtie
        Game.playerMap[id] = game.add.sprite(x,y,'sprite',id);
        Game.playerMap[id].name = "steve";
        game.physics.arcade.enable(Game.playerMap[id]);
        playergroup.add(Game.playerMap[id]);
        
        Game.playerMap[id].body.gravity.y = 800;
        Game.playerMap[id].body.collideWorldBounds = true;
        
        //add player label and add as a child of the player -- JUST FOR TESTING
        text = game.add.text(0,0,id);
        Game.playerMap[id].addChild(text)

        //Make the camera follow our player
        game.camera.follow(Game.playerMap[MYID]);
        console.log(Game.playerMap[id].name)
    };


    

    //////////////////////////////////////////////////
    ////                                          ////
    ////           OUR UPDATE FUNCTION            ////
    ////                                          ////
    //////////////////////////////////////////////////
    Game.update = function(){
        
        
        $.each(Game.playerMap,function(index, box){
            box.body.velocity.x = 0;    
        })
        //allow players to collide with each other
        //every itteration send our movement to all other peers (sendMovementPeers), and update our own movement (updatePlayerMov)
    	touchingFloor = [];
    	touchingCoin = [];
        touchingPlayer = [];
        touchingBlocks = [];
    	$.each(Game.playerMap,function(index, thisPlayer){
            //touching the floor check
    		touchingFloor[index] = game.physics.arcade.collide(thisPlayer,layer[1]);
            //Touching another player check
            touchingPlayer[index] = game.physics.arcade.collide(playergroup);
            touchingBlocks[index] = game.physics.arcade.collide(playergroup,blockgroup);
             game.physics.arcade.overlap(thisPlayer, coins, collectTime, null, this);
             if (cursors.left.isDown){
                   Game.sendMovementPeers("left");
                   Game.updatePlayerMov(MYID,"left")
            }else if (cursors.right.isDown){
                   Game.sendMovementPeers("right");
                   Game.updatePlayerMov(MYID,"right")
            }else{
                Game.sendMovementPeers("stop");
                Game.updatePlayerMov(MYID,"stop")
            }

            if (cursors.up.isDown){
                Game.sendMovementPeers("jump");
                Game.updatePlayerMov(MYID,"jump")
            }  
    	})   
       
       $.each(Game.blockMap,function(index, block){
       		touchingTerrain = game.physics.arcade.collide(block,layer[1]);
            touchingBlocks = game.physics.arcade.collide(blockgroup,blockgroup,function(obj1,obj2){
                obj1.body.immovable = true;
                obj1.body.gravity.y = 0;
                obj1.body.velocity.y = 0;
                obj1.body.velocity.x = 0;

            });
            touchingPlayer = game.physics.arcade.collide(blockgroup,playergroup,function(obj1,obj2){
                 obj1.body.immovable = true;
                 obj1.body.gravity.y = 0;
                 obj1.body.velocity.y = 0;
                obj1.body.velocity.x = 0;
            }); 
       })
       
        
    }
    
    setInterval(function(){
         //Send our position to peers every 200ms -- SHOULD REDUCE THIS IF POSSIBLE
        Game.sendPositionPeers();
        time --;
        timetext.setText("Time: " + time);
    },1000)

    //////////////////////////////////////////////////
    ////                                          ////
    ////        HANDLE UPDATING POSITIONS         ////
    ////                                          ////
    //////////////////////////////////////////////////

    ///////////////////////SEND///////////////////////

    //function which sends our current position to each of our peers (but not us) - (Client.sendPositionPeers)
    //should be called every 200ms above -- SHOULD REDUCE IF POSSIBLE
    Game.sendPositionPeers = function(){
        if(MYID){
            if(typeof Game.playerMap[MYID] !== "undefined"){
                var position = {type:"position",x:Game.playerMap[MYID].x,y:Game.playerMap[MYID].y};
                Client.sendPositionPeers(position);
            }
        }
    }

    //function which sends our movement to each of our peers (but not us) - Client.sendMovementPeers)
    //should be called on update loop with movement sent
    Game.sendMovementPeers = function(movement){
        if(MYID){
            if(typeof Game.playerMap[MYID] !== "undefined"){
                var direction = {type:"movement",id:MYID,movement:movement};
                Client.sendMovementPeers(direction);
            }
        }
    }

    Game.createPeerBlock = function(x,y){
        if(MYID){
            if(typeof Game.playerMap[MYID] !== "undefined"){
                var position = {type:"createBlock",id:MYID,x:x,y:y};
                Client.sendBlockPeers(position);
            }
        }
    }
    Game.deletePeerBlock = function(x,y){
        if(MYID){
            if(typeof Game.playerMap[MYID] !== "undefined"){
                var position = {type:"deleteBlock",id:MYID,x:x,y:y};
                Client.sendBlockPeers(position);
            }
        }
    }


    /////////////////////RECEIVE//////////////////////  

    //updates peer positions on screen based on what has been sent to us
    Game.updatePlayerPos = function(id, x, y){
        if(typeof Game.playerMap!= "undefined" && typeof Game.playerMap[id] !== "undefined"){
            Game.playerMap[id].x = x;
            Game.playerMap[id].y = y;
        }
    }

   

    //update player movements (left, right, jump, stop) - used for both us and data sent from the peers
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


    //Check to see if we are standing still
    Game.standing = function(id){
        player = Game.playerMap[id];
        if((touchingFloor[id] || touchingPlayer[id] || touchingBlocks[id]) && (player.body.blocked.down || player.body.touching.down)){
            return true;
        }
    }


    //////////////////////////////////////////////////
    ////                                          ////
    ////              PLAYER DISCONNECTION         ////
    ////                                          ////
    //////////////////////////////////////////////////
    //remove sprite and player data from our record - SHOULD ALSO REMOVE FROM CONNECTED PEERS IN CLIENT
    Game.removePlayer = function(id){
        Game.playerMap[id].destroy();
        delete Game.playerMap[id];
    };

    //Debug options
    Game.render = function() {
        // Input debug info
       // game.debug.spriteInfo(32, 32);
    }
