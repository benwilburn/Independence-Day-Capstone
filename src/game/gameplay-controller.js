angular.module('independence-day')
  .controller('gameplay-ctrl', function() {
    var game = new Phaser.Game(1640, 807, Phaser.AUTO, 'independence-day', { preload: preload, create: create, update: update, render:render });


    // General Variables
    var starfield;
    var player;
    var pawns;
    var destroyers;
    var destroyerBullets;
    var cursors;
    var bank;
    var shipTail;
    var explosions;
    var pawnLauchTimer;
    var destroyerLaunchTimer;
    var gameOver;
    var score = 0;
    var enemyCounter = 0;
    var enemyCounterDisplay;
    var waveLaunched = false;

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
        game.load.image('bullet', 'assets/images/spaceshooter/PNG/Lasers/laserGreen16.png');
        game.load.image('pawns', 'assets/images/spaceshooter/PNG/Enemies/enemyBlack1.png');
        game.load.image('destroyers', 'assets/images/spaceshooter/PNG/redshipr.png');
        game.load.image('destroyerBullet', 'assets/images/spaceshooter/PNG/Lasers/laserBlue16.png');
        game.load.spritesheet('explosion', 'assets/images/explosions.png', 128, 128);

    }

    function create() {

      // arcade physics system
      game.physics.startSystem(Phaser.Physics.P2JS);

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
      phasers.createMultiple(40, 'bullet');
      phasers.setAll('anchor.x', 0.5);
      phasers.setAll('anchor.y', 0.5);
      phasers.setAll('scale.x', 0.25);
      phasers.setAll('scale.y', 0.25);
      phasers.forEach(function(phaser) {

        phaser.body.mass = 1;
        phaser.body.setRectangleFromSprite();
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
      player.rotation = 1.5 * Math.PI;
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
      pawns.createMultiple(30, 'pawns');
      pawns.setAll('anchor.x', 0.5);
      pawns.setAll('anchor.y', 0.5);
      pawns.setAll('scale.x', 0.30);
      pawns.setAll('scale.y', 0.30);
      pawns.forEach(function(enemy) {

        enemy.damageAmount = 10;
        enemy.scorePoints = 5;
        enemy.isHit = false;
        enemy.hasHit = false;
        enemy.body.collideWorldBounds = true;
        enemy.body.setRectangleFromSprite();
        enemy.body.setCollisionGroup(enemyCollisionGroup);
        enemy.body.collides(playerBulletCollisionGroup, hitEnemy);
        enemy.body.collides(playerCollisionGroup);

      });

      // DESTROYERS
      destroyers = game.add.group();
      destroyers.enableBody = true;
      destroyers.physicsBodyType = Phaser.Physics.P2JS;
      destroyers.createMultiple(3, 'destroyers');
      destroyers.setAll('anchor.x', 0.5);
      destroyers.setAll('anchor.y', 0.5);
      destroyers.setAll('health', 120);
      destroyers.forEach(function(enemy) {

        enemy.damageAmount = 40;
        enemy.scorePoints = 10;
        enemy.isHit = false;
        enemy.hasHit = false;
        enemy.body.mass = 100;
        enemy.body.collideWorldBounds = true;
        enemy.body.setRectangleFromSprite();
        enemy.body.setCollisionGroup(enemyCollisionGroup);
        enemy.body.collides(playerBulletCollisionGroup, hitEnemy);
        enemy.body.collides(playerCollisionGroup);

      });


      // game.time.events.add(1000, launchPawns);
      // game.time.events.add(3000, launchDestroyers);

      game.time.events.add(5000, launchWave);

      // // Destroyer Bullets
      // destroyerBullets = game.add.group();
      // destroyerBullets.enableBody = true;
      // destroyerBullets.physicsBodyType = Phaser.Physics.P2JS;
      // destroyerBullets.createMultiple(10, 'destroyerBullet');
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
      enemyCounterDisplay = game.add.text(game.camera.width -800, 10, 'Enemies Left: ' + enemyCounter, { font: '20px Arial', fill: '#fff'} );
      enemyCounterDisplay.fixedToCamera = true;

      enemyCounterDisplay.render = function(){
        enemyCounterDisplay.text = 'Enemies Left: ' + Math.max(enemyCounter, 0);
      };

    }


    function update() {
      starfield.tilePosition.y += 0.25;

      pawns.forEach(function(pawn) {
        if(Math.abs(player.position.x - pawn.position.x) <= 500 && Math.abs(player.position.y - pawn.position.y) <= 500 || pawn.engaged){

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

      if (cursors.up.isDown || wKey.isDown)
        {

          player.body.thrust(500);

        } else if (cursors.down.isDown || sKey.isDown) {

            player.body.reverse(200);

          } else {

              player.body.thrust(0);

            }

      if (cursors.left.isDown || aKey.isDown) {

          player.body.rotateLeft(125);

        } else if (cursors.right.isDown || dKey.isDown){

            player.body.rotateRight(125);

          } else {

            player.body.setZeroRotation();

          }

      if (player.alive && fireButton.isDown)
      {
          firePhaser();
      }

      if (!game.camera.atLimit.x) {

        starfield.tilePosition.x -= (player.body.velocity.x * game.time.physicsElapsed);

      }

      if (!game.camera.atLimit.y) {

        starfield.tilePosition.y -= (player.body.velocity.y * game.time.physicsElapsed);
      }

      // wave over
      if(enemyCounter <= 0 && waveLaunched ){
        console.log('waveOver');
        waveLaunched = false;
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
    }


    function launchWave (pawns, destroyers) {

      alert('launchWave');

      waveLaunched = true;

      // if argument exists use it... if not use number
      pawns = pawns ? pawns : 15;
      destroyers = destroyers ? destroyers : 2;

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


          if(enemy.sprite.healthPoints > 0){

            enemy.sprite.isHit = false;

          } else{

            score += enemy.sprite.scorePoints;
            enemy.sprite.kill();
            setOffExplosions(enemy);
            enemyCounter -= 1;

          }
        }

        enemyCounterDisplay.render();
        gameScore.render();


    }


    function restart () {

      //  Reset the enemies
      pawns.callAll('kill');
      enemyCounterDisplay.render();
      game.time.events.remove(pawnLaunchTimer);
      game.time.events.add(1000, launchPawns);

      //  Revive the player
      player.revive();
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
        enemy.reset(game.rnd.integerInRange(0, game.world.width), game.rnd.integerInRange(0, game.world.height));
      }

      // send another enemy
      // pawnLaunchTimer = game.time.events.add(game.rnd.integerInRange(minPawnSpacing, maxPawnSpacing), launchPawns);
    }

    function moveEnemies (enemy, speed) {
     accelerateToObject(enemy,player,speed);  //start accelerateToObject on every bullet
    }

    function accelerateToObject(obj1, obj2, speed) {
      if (typeof speed === 'undefined') { speed = 60; }
      var angle = Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x);
      obj1.body.rotation = angle + game.math.degToRad(90);  // correct angle of angry enemies (depends on the sprite used)
      obj1.body.force.x = Math.cos(angle) * speed;    // accelerateToObject
      obj1.body.force.y = Math.sin(angle) * speed;
    }



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
