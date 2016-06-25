angular.module('independence-day')
  .controller('gameplay-ctrl', function() {
    var game = new Phaser.Game(1640, 807, Phaser.AUTO, 'independence-day', { preload: preload, create: create, update: update, render:render });


    // General Variables
    var starfield;
    var player;
    var pawns;
    var destroyers;
    var boss;
    var destroyerBullets;
    var cursors;
    var shipTail;
    var explosions;
    var pawnLauchTimer;
    var destroyerLaunchTimer;
    var gameOver;
    var score = 0;
    var enemyCounter = 0;
    var enemyCounterDisplay;
    var waveLaunched = false;
    var firstWaveCompleted = false;
    var secondWaveCompleted = false;
    var bossIsDown = false;
    var bossHitCount = 0;
    var pad;
    // var leftTriggerButton;
    // var rightTriggerButton = pad.getButton(Phaser.Gamepad.PS3XC_R2);
    var leftStickX;
    var leftStickY;
    var rightStickX;
    var rightStickY;


    // WASD Variables
    var wKey;
    var aKey;
    var sKey;
    var dKey;


    var phaser;
    var phasers;
    var phaserTime = 0;
    var fireButton;

    // var ACCELERATION = 200;
    // var DRAG = 50;
    // var MAXSPEED = 300;


    function preload() {

        game.load.image('background', 'assets/images/spaceshooter/Backgrounds/starfield.png');
        game.load.image('player', 'assets/images/spaceshooter/PNG/playerShip1_blue.png');
        game.load.physics('player_physics', 'assets/playerShipBlue_physics.json');
        game.load.image('phaser', 'assets/images/spaceshooter/PNG/Lasers/laserGreen16.png');
        // game.load.physics('phaser_physics', 'assets/phaser_physics.json');
        game.load.image('pawns', 'assets/images/spaceshooter/PNG/Enemies/enemyBlack1.png');
        game.load.physics('pawn_physics', 'assets/pawn_physics.json');
        // game.load.image('destroyers', 'assets/images/spaceshooter/PNG/redshipr.png');
        game.load.image('destroyerBullet', 'assets/images/spaceshooter/PNG/Lasers/laserBlue16.png');
        game.load.spritesheet('explosion', 'assets/images/explosions.png', 128, 128);
        game.load.image('destroyers', 'assets/images/spaceshooter/PNG/ospaceship-main.png');
        game.load.physics('destroyer_physics', 'assets/oShip_physics.json');
        game.load.image('bigBoss', 'assets/images/spaceshooter/PNG/bossShip.png');
        game.load.physics('bigBoss_physics', 'assets/bigBossShip_physics.json');

    }

    function create() {

      // arcade physics system
      game.physics.startSystem(Phaser.Physics.P2JS);

      // starting gamepad input
      game.input.gamepad.start();

      pad = game.input.gamepad.pad1;
      // pad.addCallbacks(this, { onConnect: addButtons });

      // setting game bounds
      game.world.setBounds(0, 0, 2500, 2500);

      // setting background
      starfield = game.add.tileSprite(0,0, 2500, 2500, 'background');

      // set impact events
      game.physics.p2.setImpactEvents(true);

      // player collision group
      var playerCollisionGroup = game.physics.p2.createCollisionGroup();

      // enemy collision group
      var enemyCollisionGroup = game.physics.p2.createCollisionGroup();

      // player bullet collision group
      var playerBulletCollisionGroup = game.physics.p2.createCollisionGroup();

      // enemy bullet collisionGroup
      var enemyBulletCollisionGroup = game.physics.p2.createCollisionGroup();

      // // explosions collision group
      // var explosionCollisionGroup = game.physics.p2.createCollisionGroup();

      // collision groups collide with world bounds
      game.physics.p2.updateBoundsCollisionGroup();


      //  Our ships bullets
      phasers = game.add.group();
      phasers.enableBody = true;
      phasers.physicsBodyType = Phaser.Physics.P2JS;

      //  All 40 of them
      phasers.createMultiple(40, 'phaser');
      phasers.setAll('anchor.x', 0.5);
      phasers.setAll('anchor.y', 0.5);
      phasers.setAll('scale.x', 0.25);
      phasers.setAll('scale.y', 0.25);
      phasers.forEach(function(phaser) {

        phaser.body.mass = 1;
        phaser.body.setRectangleFromSprite();
        // phaser.body.clearShapes();
        // phaser.body.loadPolygon('phaser_physics', 'laserGreen01')
        phaser.body.setCollisionGroup(playerBulletCollisionGroup);
        phaser.body.collides(enemyCollisionGroup);
        phaser.body.collideWorldBounds = false;
        phaser.body.outOfCameraBoundsKill = true;
        phaser.damageAmount = 10;

      });

      // creating player
      player = game.add.sprite(game.world.width / 2, game.world.height / 2, 'player');
      game.physics.p2.enable(player);


      player.shields = 60;
      player.health = 100;
      player.body.damping = 0.5;
      // player.rotation = 1.5 * Math.PI;
      player.body.collideWorldBounds = true;
      game.camera.follow(player);
      player.body.clearShapes();
      player.body.loadPolygon('player_physics', 'playerShip1_blue');
      player.body.setCollisionGroup(playerCollisionGroup);
      player.body.collides(enemyCollisionGroup, shipCollide);

      // PAWNS
      pawns = game.add.group();
      pawns.enableBody = true;
      pawns.physicsBodyType = Phaser.Physics.P2JS;
      pawns.createMultiple(50, 'pawns');
      pawns.setAll('anchor.x', 0.5);
      pawns.setAll('anchor.y', 0.5);
      // pawns.setAll('scale.x', 0.30);
      // pawns.setAll('scale.y', 0.30);
      pawns.forEach(function(enemy) {

        enemy.damageAmount = 10;
        enemy.scorePoints = 5;
        enemy.isHit = false;
        enemy.hasHit = false;
        enemy.body.collideWorldBounds = true;
        enemy.body.clearShapes();
        enemy.body.loadPolygon('pawn_physics', 'enemyBlack1');
        enemy.body.setCollisionGroup(enemyCollisionGroup);
        enemy.body.collides(playerBulletCollisionGroup, hitEnemy);
        enemy.body.collides(playerCollisionGroup);
        enemy.body.collides(enemyCollisionGroup);

      });

      // DESTROYERS
      destroyers = game.add.group();
      destroyers.enableBody = true;
      destroyers.physicsBodyType = Phaser.Physics.P2JS;
      destroyers.createMultiple(20, 'destroyers');
      destroyers.setAll('anchor.x', 0.5);
      destroyers.setAll('anchor.y', 0.5);
      destroyers.setAll('health', 120);
      destroyers.forEach(function(enemy) {

        enemy.damageAmount = 20;
        enemy.scorePoints = 10;
        enemy.isHit = false;
        enemy.hasHit = false;
        enemy.body.mass = 100;
        enemy.body.collideWorldBounds = true;
        enemy.rotation = 1.5 * Math.PI;
        // enemy.body.setRectangleFromSprite();
        enemy.body.clearShapes();
        enemy.body.loadPolygon('destroyer_physics', 'ospaceship-main');
        enemy.body.setCollisionGroup(enemyCollisionGroup);
        enemy.body.collides(playerBulletCollisionGroup, hitEnemy);
        enemy.body.collides(playerCollisionGroup);
        enemy.body.collides(enemyCollisionGroup);

      });

      // BOSS
      // boss = game.add.sprite(game.rnd.integerInRange(0, game.world.width), game.rnd.integerInRange(0, game.world.height), 'bigBoss');
      // game.physics.p2.enable(boss, true);
      boss = game.add.group();
      boss.enableBody = true;
      boss.physicsBodyType = Phaser.Physics.P2JS;
      boss.createMultiple(1, 'bigBoss');
      boss.setAll('anchor.x', 0.5);
      boss.setAll('anchor.y', 0.5);
      boss.forEach(function(enemy) {

        // enemy.rotation =
        // enemy.healthPoints = 2000;
        enemy.damageAmount = 40;
        enemy.body.mass = 2000;
        enemy.body.clearShapes();
        enemy.body.loadPolygon('bigBoss_physics', 'bossShip');
        enemy.body.collideWorldBounds = true;
        enemy.body.setCollisionGroup(enemyCollisionGroup);
        enemy.body.collides(playerBulletCollisionGroup, hitEnemy);
        enemy.body.collides(playerCollisionGroup);

      });

      game.time.events.add(5000, launchWave);

      // // Destroyer Bullets
      // destroyerBullets = game.add.group();
      // destroyerBullets.enableBody = true;
      // destroyerBullets.physicsBodyType = Phaser.Physics.P2JS;
      // destroyerBullets.createMultiple(50, 'destroyerBullet');
      // destroyerBullets.setAll('alpha', 0.9);
      // destroyerBullets.setAll('anchor.x', 0.5);
      // destroyerBullets.setAll('anchor.y', 0.5);
      // destroyerBullets.setAll('outOfBoundsKill', true);
      // destroyerBullets.setAll('checkWorldBounds', true);
      // destroyerBullets.forEach(function(enemy){
      //   // enemy.body.setSize(20,20);
      //   enemy.body.setRectangle(3,3);
      //   enemy.body.setCollisionGroup(bulletCollisionGroup);
      // });

      // basic player movment
      cursors = game.input.keyboard.createCursorKeys();
      // adds these keys for Phaser to recognize
      wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
      aKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
      sKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
      dKey = game.input.keyboard.addKey(Phaser.Keyboard.D);

      fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

      //  An explosion pool
      explosions = game.add.group();
      explosions.enableBody = true;
      explosions.physicsBodyType = Phaser.Physics.P2JS;
      explosions.createMultiple(50, 'explosion');
      explosions.setAll('anchor.x', 0.5);
      explosions.setAll('anchor.y', 0.5);
      explosions.forEach( function(explosion) {
        explosion.animations.add('explosion');
      });

      //  Health stat
      health = game.add.text(game.camera.width - 150, 10, 'Health: ' + player.health +'%', { font: '20px Arial', fill: '#fff' });

      health.fixedToCamera = true;

      health.render = function () {
        health.text = 'health: ' + Math.max(player.health, 0) +'%';
      };


      // Sheilds stat
      shields = game.add.text(game.camera.width - 300, 10, 'Shields: ' + player.shields +'%', { font: '20px Arial', fill: '#fff' });
      shields.fixedToCamera = true;

      shields.render = function () {
        shields.text = 'Shields: ' + Math.max(player.shields, 0) + '%';
      };

      // score stat
      gameScore = game.add.text(game.camera.width -500, 10, 'Score: ' + score, {font: '20px Arial', fill:' #fff'});
      gameScore.fixedToCamera = true;

      gameScore.render = function () {
        gameScore.text = 'Score: ' + Math.max(score, 0);
      };

       // Game over text
      gameOver = game.add.text(game.camera.width / 2, game.camera.height / 2, 'GAME OVER!', { font: '84px Arial', fill: '#fff' });
      gameOver.anchor.setTo(0.5, 0.5);
      gameOver.visible = false;
      gameOver.fixedToCamera = true;

      // enemy counter
      enemyCounterDisplay = game.add.text(game.camera.width -800, 10, 'Enemies in Wave: ' + enemyCounter, { font: '20px Arial', fill: '#fff'} );
      enemyCounterDisplay.fixedToCamera = true;

      enemyCounterDisplay.render = function(){
        enemyCounterDisplay.text = 'Enemies Left: ' + Math.max(enemyCounter, 0);
      };

    }


    function update() {
      starfield.tilePosition.y += 0.25;

      pawns.forEach(function(pawn) {
        if(Math.abs(player.position.x - pawn.position.x) <= 900 && Math.abs(player.position.y - pawn.position.y) <= 500 || pawn.engaged){

        pawn.engaged = true;
        moveEnemies(pawn, 80);

        }

      });

      destroyers.forEach(function(destroyer){

        if(Math.abs(player.position.x - destroyer.position.x) <= 700 && Math.abs(player.position.y - destroyer.position.y) <= 700 || destroyer.engaged){
          destroyer.engaged = true;
          moveEnemies(destroyer, 1500);

        }

      });

      boss.forEach(function(boss) {
          if(Math.abs(player.position.x - boss.position.x) <= 700 && Math.abs(player.position.y - boss.position.y) <= 700 || boss.engaged){
          boss.engaged = true;
          moveEnemies(boss, 1500);
          }
      });


      if (cursors.up.isDown || wKey.isDown || pad.isDown(Phaser.Gamepad.PS3XC_DPAD_UP) || pad.isDown(Phaser.Gamepad.XBOX360_DPAD_UP) || pad.axis(Phaser.Gamepad.PS3XC_STICK_RIGHT_Y) < -0.5)
        {

          player.body.thrust(400);

        } else if (cursors.down.isDown || sKey.isDown || pad.isDown(Phaser.Gamepad.PS3XC_DPAD_DOWN) || pad.isDown(Phaser.Gamepad.XBOX360_DPAD_DOWN) || pad.axis(Phaser.Gamepad.PS3XC_STICK_RIGHT_Y) > 0.5) {

            player.body.reverse(200);

          } else {

              player.body.thrust(0);

            }

      if (cursors.left.isDown || aKey.isDown || pad.isDown(Phaser.Gamepad.XBOX360_DPAD_LEFT) || pad.isDown(Phaser.Gamepad.XBOX360_DPAD_LEFT) || pad.axis(Phaser.Gamepad.PS3XC_STICK_LEFT_X) < -0.1) {

          player.body.rotateLeft(100);

        } else if (cursors.right.isDown || dKey.isDown || pad.isDown(Phaser.Gamepad.PS3XC_DPAD_RIGHT) || pad.isDown(Phaser.Gamepad.XBOX360_DPAD_RIGHT) || pad.axis(Phaser.Gamepad.PS3XC_STICK_LEFT_X) > 0.1){

            player.body.rotateRight(100);

          } else {

            player.body.setZeroRotation();

          }

      if (player.alive && fireButton.isDown || pad.isDown(Phaser.Gamepad.PS3XC_R2))
      {
          firePhaser();
      }

      if (!game.camera.atLimit.x) {

        starfield.tilePosition.x -= (player.body.velocity.x * game.time.physicsElapsed);

      }

      if (!game.camera.atLimit.y) {

        starfield.tilePosition.y -= (player.body.velocity.y * game.time.physicsElapsed);
      }

      //  Game over?
      if (!player.alive && gameOver.visible === false) {

        gameOver.visible = true;
        console.log('gameOver', gameOver);
        var fadeInGameOver = game.add.tween(gameOver);
        console.log('fadeInGameOver', fadeInGameOver);
        fadeInGameOver.to({alpha: 1}, 1000, Phaser.Easing.Quintic.Out);
        fadeInGameOver.onComplete.add(setResetHandlers);
        fadeInGameOver.start();

      }

      boss.forEach(function(enemy) {

        if(enemy.healthPoints <= 0){

            bossIsDown = true;

        }

      });

      // wave over
      if(bossIsDown){

        // alert('you win');
        // if (player.alive && gameOver.visible === false) {

          gameOver.visible = true;
          console.log('gameOver', gameOver);
          var fadeInBossKilled = game.add.tween(gameOver);
          console.log('fadeInGameOver', fadeInBossKilled);
          fadeInKilled.to({alpha: 1}, 1000, Phaser.Easing.Quintic.Out);
          fadeInBossKilled.onComplete.add(setResetHandlers);
          fadeInBossKilled.start();

        // }

      } else if(enemyCounter <= 0 && secondWaveCompleted){

        launchWave(10, 3, 1);
        waveLaunched = false;


      } else if(enemyCounter <= 0 && firstWaveCompleted){

        launchWave(20, 5, 0);
        waveLaunched = false;
        secondWaveCompleted = true;

      } else if (enemyCounter <= 0 && waveLaunched){

        waveLaunched = false;
        firstWaveCompleted = true;

      } else {

      }

    }

    // function addButtons() {
    //   // leftTriggerButton = pad.getButton(Phaser.Gamepad.PS4_LEFT_TRIGGER);

    //   //   leftTriggerButton.onDown.add(onLeftTrigger);
    //   //   leftTriggerButton.onUp.add(onLeftTrigger);
    //   //   leftTriggerButton.onFloat.add(onLeftTrigger);

    //   rightTriggerButton = pad.getButton(Phaser.Gamepad.PS3XC_R2);

    //     rightTriggerButton.onDown.add(onRightTrigger);
    //     rightTriggerButton.onUp.add(onRightTrigger);
    //     rightTriggerButton.onFloat.add(onRightTrigger);

    //   leftStickX = pad.getButton(Phaser.Gamepad.PS3XC_STICK_LEFT_X);
    //   leftStickX = pad.getButton(Phaser.Gamepad.PS3XC_STICK_LEFT_Y);

    //   rightStickX = pad.getButton(Phaser.Gamepad.PS3XC_STICK_RIGHT_X);
    //   rightStickX = pad.getButton(Phaser.Gamepad.PS3XC_STICK_RIGHT_Y);

    // }

    // function onRightTrigger() {
    //   firePhaser();
    // }


    function launchWave (pawns, destroyers, boss) {

      alert('launchWave');

      waveLaunched = true;

      // if argument exists use it... if not use number
      pawns = pawns ? pawns : 15;
      destroyers = destroyers ? destroyers : 2;
      boss = boss ? boss : 0;

      for(var i = 0; i < pawns; i++){
        launchPawns();
        enemyCounter++;
        enemyCounterDisplay.render();
      }

      for(var a = 0; a < destroyers; a++){
        launchDestroyers();
        enemyCounter++;
        enemyCounterDisplay.render();
      }

      for(var b = 0; b < boss; b++){
        launchBoss();
        enemyCounter++;
        enemyCounterDisplay.render();
      }

    }



    function setResetHandlers() {

        //  The "click to restart" handler
        tapRestart = game.input.onTap.addOnce(_restart,this);
        spaceRestart = fireButton.onDown.addOnce(_restart,this);
        function _restart() {

          tapRestart.detach();
          spaceRestart.detach();
          restart();

        }
    }

    function hitEnemy(enemy, bullet) {
        if(!enemy.sprite.isHit){

          bullet.sprite.kill();
          enemy.sprite.isHit = true;
          enemy.sprite.healthPoints -= bullet.sprite.damageAmount;
          bossHitCount++;


          if(enemy.sprite.healthPoints > 0){

            enemy.sprite.isHit = false;

          } else{

            score += enemy.sprite.scorePoints;
            enemy.sprite.kill();
            setOffExplosions(enemy);
            enemyCounter -= 1;

          }

        }
        // enemy.forEach(function(enemy){

          console.log('boss health', enemy.sprite.healthPoints);

          if(bossHitCount % 30 === 0){
            enemy.reset(game.rnd.integerInRange(0, game.world.width), game.rnd.integerInRange(0, game.world.height));
            console.log('boss health', enemy.sprite.healthPoints);
          }

        // });

        enemyCounterDisplay.render();
        gameScore.render();

    }


    function restart () {

      //  Reset the enemies
      pawns.callAll('kill');
      destroyers.callAll('kill');
      boss.callAll('kill');
      score = 0;
      gameScore.render();
      enemyCounter = 0;
      enemyCounterDisplay.render();
      waveLaunched = false;
      firstWaveCompleted = false;
      secondWaveCompleted = false;
      bossIsDown = false;
      game.time.events.add(5000, launchWave);

      //  Revive the player
      player.revive();
      player.shields = 60;
      player.health = 100;
      health.render();

      //  Hide the text
      gameOver.visible = false;

    }

    function shipCollide(player, enemy) {

      enemy.sprite.kill();
      setOffExplosions(enemy);
      if(!enemy.sprite.hasHit){
        score += enemy.sprite.scorePoints;
        gameScore.render();
        enemyCounter -= 1;
        enemyCounterDisplay.render();
        enemy.sprite.hasHit = true;
        if (player.sprite.shields > 0) {

          player.sprite.shields -= enemy.sprite.damageAmount;
          shields.render();

        } else {

          player.sprite.health -= enemy.sprite.damageAmount;
          health.render();
          if (player.sprite.health <= 0){
            player.sprite.kill();
          }

        }
      }
    }

    function setOffExplosions(enemy) {
      var explosion = explosions.getFirstExists(false);
      explosion.reset(enemy.x, enemy.y);
      explosion.alpha = 0.7;
      explosion.play('explosion', 30, false, true);
    }

    function launchBoss() {
      var enemy = boss.getFirstExists(false);
      if(enemy) {
        enemy.hasHit = false;
        enemy.isHit = false;
        enemy.healthPoints = 2000;
        enemy.engaged = true;
        enemy.reset(game.rnd.integerInRange(0, game.world.width), game.rnd.integerInRange(0, game.world.height));
      }
    }

    function launchDestroyers(){
      var minDestroyerSpacing = 500;
      var maxDestroyerSpacing = 1000;
      var timeBetweenDestroyers = 7000;

      var enemy = destroyers.getFirstExists(false);
      if(enemy){
        enemy.hasHit = false;
        enemy.isHit = false;
        enemy.healthPoints = 120;
        enemy.engaged = false;
        enemy.reset(game.rnd.integerInRange(0, game.world.width), game.rnd.integerInRange(0, game.world.height));
      }

      // send another destroyer soon
      // destroyerLaunchTimer = game.time.events.add(game.rnd.integerInRange(minDestroyerSpacing, maxDestroyerSpacing), launchDestroyers);
    }

    function launchPawns(){
      var minPawnSpacing = 300;
      var maxPawnSpacing = 3000;

      var enemy = pawns.getFirstExists(false);
      if (enemy) {
        enemy.hasHit = false;
        enemy.isHit = false;
        enemy.healthPoints = 10;
        enemy.engaged = false;
        var enemyX = game.world.randomX;
        var enemyY = game.world.randomY;
        while((enemyX > player.x - 500 && enemyX < player.x + 500) && (enemyY > player.y - 500 && enemyY < player.y + 500)) {
          enemyX = game.world.randomX;
          enemyY = game.world.randomY;
        }
        enemy.reset(enemyX, enemyY);
      }

      // send another enemy
      // pawnLaunchTimer = game.time.events.add(game.rnd.integerInRange(minPawnSpacing, maxPawnSpacing), launchPawns);
    }

    function moveEnemies (enemy, speed) {
     accelerateToObject(enemy,player,speed);  //start accelerateToObject on every enemy
    }

    function accelerateToObject(obj1, obj2, speed) {
      if (typeof speed === 'undefined') { speed = 60; }
      var angle = Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x);
      obj1.body.rotation = angle + game.math.degToRad(90);  // correct angle of angry enemies (depends on the sprite used)
      obj1.body.force.x = Math.cos(angle) * speed;    // accelerateToObject
      obj1.body.force.y = Math.sin(angle) * speed;
    }

    // function bossMovement(boss) {

    //   if(Math.abs(player.position.x - boss.position.x) <= 1000 && Math.abs(player.position.y - boss.position.y) <= 1000 || boss.engaged){
    //     boss.engaged = true;
    //     moveEnemies(boss, 2000);
    //   }

    // }

    function firePhaser () {
      var phaserSpacing = 150;
      if (game.time.now > phaserTime) {

        phaser = phasers.getFirstExists(false);
        p1 = new Phaser.Point(player.x, player.y);
        p2 = new Phaser.Point(player.x, player.y - 20);
        p2.rotate(p1.x, p1.y, player.rotation, false);

        if (phaser) {

          phaser.reset(p2.x, p2.y);
          phaser.body.fixedRotation = true;
          phaser.lifespan = 2000;
          phaser.rotation = player.rotation;
          var radians = game.math.degToRad(player.angle);
          phaser.body.applyImpulseLocal([-Math.sin(radians) * 75, Math.cos(radians) * 75], 0, 0);
          phaserTime = game.time.now + phaserSpacing;

        }
      }

    }


  function render() {
    destroyers.forEach(function(destroyer) {
      destroyer.body.debug = true;
    });

    pawns.forEach(function (pawn) {
      pawn.body.debug = true;
    });

    player.body.debug = true;

    phasers.forEach(function(phaser) {
      phaser.body.debug = true;
    });


  }
});
