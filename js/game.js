
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
        game.load.spritesheet('sprite', '/assets/images/dude.png', 30, 30);
        game.load.spritesheet('timeToken', '/assets/images/timeToken.png', 30, 30);
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
            borderColor: '#000',
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
    	 Client.joinRoom("default");
    };



    Game.startGame = function(room){
        console.log("YOU ARE IN ROOM:"+room)

        //Text for user        
        var t = game.add.text(30, 20, "In room: "+room,{ font: "32px Arial", fill: "#000", align: "left" })
        t.fixedToCamera = true;
        t.cameraOffset.setTo(30, 20);

        timetext = game.add.text(30, 80, "Time: "+time,{ font: "32px Arial", fill: "#000", align: "left" })
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
        game.stage.backgroundColor = '#787878';

        //create the playermap object
        Game.playerMap = {};

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
        group = game.add.physicsGroup();
        
        //Create new player - me 
        Client.askNewPlayer("courtney");
         //  Here we create our coins group
    coins = game.add.group();
    coins.enableBody = true;

        map.createFromObjects('objects', 781, 'timeToken', 0, true, false, coins);

        //TESTING -- ON CLICKING A TILE WE GET PROPERTIES -- JUST FOR TESTING
        game.input.onDown.add(getTileProperties,this)
    }
    //useful for finding ids and stuff -- JUST FOR TESTING
    function getTileProperties(){
    	var x = layer[1].getTileX(game.input.activePointer.worldX);
    	var y = layer[1].getTileY(game.input.activePointer.worldY);
    	var tile = map.getTile(x,y,layer[1]);
    	console.log(tile);
    }

    //function for when we hit terrain type 622 above -- JUST FOR TESTING
    function dig(sprite,tile){       
        if (spaceKey.isDown){
            tile.index = -1;
            tile.collideDown = false;
            tile.collideUp = false;
            tile.collideLeft = false;
            tile.collideRight = false;
            //layer[1].dirty = true;   
            Game.playerMap[MYID].body.velocity.y = -100;            
            map.forEach(function(tile){})//FOR SOME REASON THIS RESETS THE COLLISION???
        }
        return true;
    }

    function build(sprite,tile){       
        if (spaceKey.isDown){
            tile.index = 622;
            tile.collideDown = true;
            tile.collideUp = true;
            tile.collideLeft = true;
            tile.collideRight = true;
            //layer[1].dirty = true;   
            Game.playerMap[MYID].body.velocity.y = -360;            
            map.forEach(function(tile){})//FOR SOME REASON THIS RESETS THE COLLISION???
        }
        return true;
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
        var t = game.add.text(30, 50, "Player: "+id,{ font: "32px Arial", fill: "#000", align: "left" })
        t.fixedToCamera = true;
        t.cameraOffset.setTo(30, 50);
        MYID = id;
        //send our poisition to peers when we're first created
        Game.sendPositionPeers();

        //set up our player's ability
        if(MYID == 1){
            map.setTileIndexCallback(622, dig, this);
        }else if(MYID == 2){
            map.setTileIndexCallback(-1, build, this);
        }
    }

    //generic function for creating a player on the map (both us and all other players)
    Game.addNewPlayer = function(id,x,y,name){
        //add sprtie
        Game.playerMap[id] = game.add.sprite(x,y,'sprite',id);
        game.physics.arcade.enable(Game.playerMap[id]);
        group.add(Game.playerMap[id]);
        
        Game.playerMap[id].body.gravity.y = 800;
        Game.playerMap[id].body.collideWorldBounds = true;
        
        //add player label and add as a child of the player -- JUST FOR TESTING
        text = game.add.text(0,0,id);
        Game.playerMap[id].addChild(text)

        //Make the camera follow our player
        game.camera.follow(Game.playerMap[MYID]);
    };


    

    //////////////////////////////////////////////////
    ////                                          ////
    ////           OUR UPDATE FUNCTION            ////
    ////                                          ////
    //////////////////////////////////////////////////
    Game.update = function(){
        //allow players to collide with each other
        //every itteration send our movement to all other peers (sendMovementPeers), and update our own movement (updatePlayerMov)
    	touchingFloor = [];
    	touchingCoin = [];
        touchingPlayer = [];
    	$.each(Game.playerMap,function(index, thisPlayer){
    		touchingFloor[index] = game.physics.arcade.collide(thisPlayer,layer[1]);
            touchingPlayer[index] = game.physics.arcade.collide(group);
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
                var position = {x:Game.playerMap[MYID].x,y:Game.playerMap[MYID].y};
                Client.sendPositionPeers(position);
            }
        }
    }

    //function which sends our movement to each of our peers (but not us) - Client.sendMovementPeers)
    //should be called on update loop with movement sent
    Game.sendMovementPeers = function(movement){
        if(MYID){
            if(typeof Game.playerMap[MYID] !== "undefined"){
                var direction = {id:MYID,movement:movement};
                Client.sendMovementPeers(direction);
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
        if((touchingFloor[id] || touchingPlayer[id]) && (player.body.blocked.down || player.body.touching.down)){
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
