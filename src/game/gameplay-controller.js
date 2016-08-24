angular.module('independence-day')
  .controller('gameplay-ctrl', function($location, $timeout, $http, $scope, $uibModal, LeaderboardFactory, AuthFactory, FIREBASE_URL) {
          var date = new Date()
          var dateStr = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
          console.log("I AM THE GAME YAAAAAAAY " + dateStr);

          var user = firebase.auth().currentUser;
          if (!user) {
            firebase.auth().signOut();
            $location.path('/');
            $timeout();
          } else {

          $scope.level1ScoresArray = [];

          $http.get(`${FIREBASE_URL}/auth.json`)
            .then((res) => {
              var users = res.data;
              return users;
            })
            .then((users) => {
              for(var key in users) {
                // var currUser = users[key];
                if(user.uid === users[key].uid) {
                  var userInfo = users[key];
                  return userInfo;
                }
              }
            }).then((currentUser) => {

          $scope.animationsEnabled = true;

          $scope.signOutUser = function () {

            logOut();

          };

          $scope.open = function (size) {
            var modalInstance = $uibModal.open({
              animation: $scope.animationsEnabled,
              templateUrl: 'endOfGame/leaderboard.html',
              controller: 'ModalInstanceCtrl',
              size: size,
              resolve: {
                scores: function() {
                  return $scope.scores;
                },
                level1ScoresArray: function() {
                  return $scope.level1ScoresArray;
                },
                currentCompletedTime: function() {
                  return $scope.currentCompletedTime;
                },

                currentTime: function() {
                  return $scope.currentTime;
                }

              }
            });
          };

          $scope.currentUserUsername = currentUser.username;

        var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, 'independence-day');
        var gameState = { preload: preload, create: create, update: update, render:render };
        game.state.add('game', gameState);
        game.state.start('game');

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
        var youWinText;
        var gameTimer;
        var gameTimerDisplay;
        var waveText;
        var bossWaveText;
        var score = 0;
        var shields;
        var enemyCounter = 0;
        var enemyCounterDisplay;
        var waveLaunched = false;
        var firstWaveCompleted = false;
        var secondWaveCompleted = false;
        var bossIsDown = false;
        var leaderboardModalOpen = false;
        var bossHitCount = 0;
        var pad;
        var waveNumber = 1;
        $scope.gameStartTimer = '';
        var timeElapsedSinceFirstWave;
        var timeElapsedSinceFirstWaveInMinutes;
        var bossWaveNotification = 'Boss Wave!!';
        var watchIsOn = false;
        var leaderboardBuilt = false;
        var leftStickX;
        var leftStickY;
        var rightStickX;
        var rightStickY;
        var smallBrownAsteroid;
        var smallGreyAsteroid;
        var medBrownAsteroid;
        var medGreyAsteroid;
        var bigBrownAsteroid;
        var bigGreyAsteroid;
        var healthPowerup;
        var damagePowerup;
        var logOutButton;
        var leaderboardButton;
        var gamePausedDisplay;
        var currentTime;

        // WASD Variables
        var wKey;
        var aKey;
        var sKey;
        var dKey;


        var phaser;
        var phasers;
        var phaserTime = 0;
        var fireButton;

        function preload() {

            game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            game.load.image('background', 'assets/images/spaceshooter/Backgrounds/starfield.png');
            game.load.image('player', 'assets/images/spaceshooter/PNG/playerShip1_blue.png');
            game.load.physics('player_physics', 'assets/playerShipBlue_physics.json');
            game.load.image('phaser', 'assets/images/spaceshooter/PNG/Lasers/laserGreen16.png');
            game.load.image('pawns', 'assets/images/spaceshooter/PNG/Enemies/enemyBlack1.png');
            game.load.physics('pawn_physics', 'assets/pawn_physics.json');
            game.load.image('pawnBullet', 'assets/images/spaceshooter/PNG/Lasers/laserRed15.png');
            game.load.image('destroyerBullet', 'assets/images/spaceshooter/PNG/Lasers/laserRed16.png');
            game.load.spritesheet('explosion', 'assets/images/explosions.png', 128, 128);
            game.load.image('destroyers', 'assets/images/spaceshooter/PNG/ospaceship-main.png');
            game.load.physics('destroyer_physics', 'assets/oShip_physics.json');
            game.load.image('bigBoss', 'assets/images/spaceshooter/PNG/bossShip.png');
            game.load.physics('bigBoss_physics', 'assets/bigBossShip_physics.json');
            game.load.image('playerShield', 'assets/images/spaceshooter/PNG/Effects/shield3.png');
            game.load.image('bossSmallBullet', 'assets/images/spaceshooter/PNG/Lasers/laserRed08.png');
            game.load.image('smallBrownAsteroid', 'assets/images/spaceshooter/PNG/Meteors/meteorBrown_small2.png');
            game.load.image('smallGreyAsteroid', 'assets/images/spaceshooter/PNG/Meteors/meteorGrey_small2.png');
            game.load.image('mediumBrownAsteroid', 'assets/images/spaceshooter/PNG/Meteors/meteorBrown_med3.png');
            game.load.image('mediumGreyAsteroid', 'assets/images/spaceshooter/PNG/Meteors/meteorGrey_med2.png');
            game.load.image('largeBrownAsteroid', 'assets/images/spaceshooter/PNG/Meteors/meteorBrown_big2.png');
            game.load.image('largeGreyAsteroid', 'assets/images/spaceshooter/PNG/Meteors/meteorGrey_big1.png');
            game.load.image('healthPowerUp', 'assets/images/spaceshooter/PNG/Power-ups/pill_green.png');
            game.load.image('damagePowerUp', 'assets/images/spaceshooter/PNG/Power-ups/powerupBlue_bolt.png');
            game.load.image('quit-game', 'assets/gameicons/PNG/White/1x/door.png');
            game.load.image('leaderboard', 'assets/gameicons/PNG/White/1x/leaderboardsComplex.png');

        }

        function create() {

          // arcade physics system
          game.physics.startSystem(Phaser.Physics.P2JS);

          // starting gamepad input
          game.input.gamepad.start();

          pad = game.input.gamepad.pad1;

          // setting game bounds
          game.world.setBounds(0, 0, 2500, 2500);

          // setting background
          starfield = game.add.tileSprite(0,0, 2500, 2500, 'background');

          // set impact events
          game.physics.p2.setImpactEvents(true);

          // setting restitution for sprite.alpha
          game.physics.p2.restitution = 1;

          //creating the logout button
          logOutButton = game.add.button(game.camera.width / 75, game.camera.height / 1.1, 'quit-game', logOut);
          logOutButton.fixedToCamera = true;

          // see leaderboard button
          leaderboardButton = game.add.button(game.camera.width / 20, game.camera.height / 1.1, 'leaderboard', seeLeaderboard);
          leaderboardButton.fixedToCamera = true;

          // player collision group
          var playerCollisionGroup = game.physics.p2.createCollisionGroup();

          // player shield collision group
          var playerShieldCollisionGroup = game.physics.p2.createCollisionGroup();

          // enemy collision group
          var enemyCollisionGroup = game.physics.p2.createCollisionGroup();

          // boss collision group
          var bossCollisionGroup = game.physics.p2.createCollisionGroup();

          // player bullet collision group
          var playerBulletCollisionGroup = game.physics.p2.createCollisionGroup();

          // enemy bullet collision group
          var enemyBulletCollisionGroup = game.physics.p2.createCollisionGroup();

          // asteroid collision group
          var asteroidCollisionGroup = game.physics.p2.createCollisionGroup();

          // powerups collision group
          var powerupsCollisionGroup = game.physics.p2.createCollisionGroup();

          // collision groups collide with world bounds
          game.physics.p2.updateBoundsCollisionGroup();

          // creating player
          player = game.add.sprite(game.world.width / 2, game.world.height / 2, 'player');
          game.physics.p2.enable(player);

          player.health = 3000;
          player.body.damping = 0.5;
          player.body.collideWorldBounds = true;
          game.camera.follow(player);
          player.body.mass = 100;
          player.body.clearShapes();
          player.body.loadPolygon('player_physics', 'playerShip1_blue');
          player.body.setCollisionGroup(playerCollisionGroup);
          player.body.collides(enemyCollisionGroup, shipCollide);
          player.body.collides(bossCollisionGroup, bossCollide);
          player.body.collides(enemyBulletCollisionGroup, enemyBulletHitPlayer);
          player.body.collides(asteroidCollisionGroup);
          player.body.collides(powerupsCollisionGroup);

          // shields for player
          shields = game.add.sprite(0, 0, 'playerShield');
          game.physics.p2.enable(shields);
          shields.enableBody = true;
          shields.hitPoints = 1000;
          shields.anchor.x = 0.5;
          shields.anchor.y = 0.5;
          player.addChild(shields);

          // PAWNS
          pawns = game.add.group();
          pawns.enableBody = true;
          pawns.physicsBodyType = Phaser.Physics.P2JS;
          pawns.createMultiple(50, 'pawns');
          pawns.setAll('anchor.x', 0.5);
          pawns.setAll('anchor.y', 0.5);
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
            enemy.body.collides(asteroidCollisionGroup);
            enemy.body.collides(playerShieldCollisionGroup);
            enemy.body.collides(powerupsCollisionGroup);
            enemy.lastShot = 0;
            enemy.bullets = 1;

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
            enemy.body.clearShapes();
            enemy.body.loadPolygon('destroyer_physics', 'ospaceship-main');
            enemy.body.setCollisionGroup(enemyCollisionGroup);
            enemy.body.collides(playerBulletCollisionGroup, hitEnemy);
            enemy.body.collides(playerCollisionGroup);
            enemy.body.collides(enemyCollisionGroup);
            enemy.body.collides(asteroidCollisionGroup);
            enemy.body.collides(powerupsCollisionGroup);
            enemy.lastShot = 0;
            enemy.bullets = 1;

          });

          // BOSS
          boss = game.add.group();
          boss.enableBody = true;
          boss.physicsBodyType = Phaser.Physics.P2JS;
          boss.createMultiple(1, 'bigBoss');
          boss.setAll('anchor.x', 0.5);
          boss.setAll('anchor.y', 0.5);
          boss.forEach(function(enemy) {

            enemy.damageAmount = 40;
            enemy.body.mass = 2000;
            enemy.body.clearShapes();
            enemy.body.loadPolygon('bigBoss_physics', 'bossShip');
            enemy.body.collideWorldBounds = true;
            enemy.body.setCollisionGroup(bossCollisionGroup);
            enemy.body.collides(enemyCollisionGroup);
            enemy.body.collides(playerBulletCollisionGroup, hitEnemy);
            enemy.body.collides(playerCollisionGroup);
            enemy.body.collides(asteroidCollisionGroup);
            enemy.body.collides(powerupsCollisionGroup);
            enemy.lastShot = 0;
            enemy.bullets = 1;

          });


          game.time.events.add(1000, showWaveText);
          game.time.events.add(4500, hideWaveText);
          game.time.events.add(4500, startTimer);
          game.time.events.add(4500, launchWave);



          // Pawn Bullets
          pawnBullets = game.add.group();
          pawnBullets.enableBody = true;
          pawnBullets.physicsBodyType = Phaser.Physics.P2JS;

          pawnBullets.createMultiple(100, 'pawnBullet');
          pawnBullets.setAll('alpha', 0.9);
          pawnBullets.setAll('anchor.x', 0.5);
          pawnBullets.setAll('anchor.y', 0.5);
          pawnBullets.setAll('outOfBoundsKill', true);
          pawnBullets.setAll('checkWorldBounds', true);
          pawnBullets.forEach(function(bullet){

            bullet.body.mass = 1;
            bullet.body.setRectangleFromSprite();
            bullet.body.setCollisionGroup(enemyBulletCollisionGroup);
            bullet.body.collides(playerCollisionGroup);
            bullet.body.collides(playerShieldCollisionGroup);
            bullet.body.collides(asteroidCollisionGroup, bulletKill);
            bullet.body.collideWorldBounds = false;
            bullet.body.outOfCameraBoundsKill = true;
            bullet.damageAmount = 10;

          });

          // Destroyer Bullets
          destroyerBullets = game.add.group();
          destroyerBullets.enableBody = true;
          destroyerBullets.physicsBodyType = Phaser.Physics.P2JS;

          destroyerBullets.createMultiple(100, 'destroyerBullet');
          destroyerBullets.setAll('alpha', 0.9);
          destroyerBullets.setAll('anchor.x', 0.5);
          destroyerBullets.setAll('anchor.y', 0.5);
          destroyerBullets.setAll('outOfBoundsKill', true);
          destroyerBullets.setAll('checkWorldBounds', true);
          destroyerBullets.forEach(function(bullet){

            bullet.body.mass = 1;
            bullet.body.setRectangleFromSprite();
            bullet.body.setCollisionGroup(enemyBulletCollisionGroup);
            bullet.body.collides(playerCollisionGroup);
            bullet.body.collides(playerShieldCollisionGroup);
            bullet.body.collides(asteroidCollisionGroup, bulletKill);
            bullet.body.collideWorldBounds = false;
            bullet.body.outOfCameraBoundsKill = true;
            bullet.damageAmount = 20;

          });

          // Boss Small Bullets
          bossSmallBullets = game.add.group();
          bossSmallBullets.enableBody = true;
          bossSmallBullets.physicsBodyType = Phaser.Physics.P2JS;

          bossSmallBullets.createMultiple(100, 'bossSmallBullet');
          bossSmallBullets.setAll('alpha', 0.9);
          bossSmallBullets.setAll('anchor.x', 0.5);
          bossSmallBullets.setAll('anchor.y', 4.0);
          bossSmallBullets.setAll('outOfBoundsKill', true);
          bossSmallBullets.setAll('checkWorldBounds', true);
          bossSmallBullets.forEach(function(bullet){

            bullet.body.mass = 1;
            bullet.body.setRectangleFromSprite();
            bullet.body.setCollisionGroup(enemyBulletCollisionGroup);
            bullet.body.collides(playerCollisionGroup);
            bullet.body.collides(playerShieldCollisionGroup);
            bullet.body.collides(asteroidCollisionGroup, bulletKill);
            bullet.body.collideWorldBounds = false;
            bullet.body.outOfCameraBoundsKill = true;
            bullet.damageAmount = 50;

          });

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
            phaser.body.setCollisionGroup(playerBulletCollisionGroup);
            phaser.body.collides(enemyCollisionGroup);
            phaser.body.collides(bossCollisionGroup);
            phaser.body.collides(asteroidCollisionGroup, bulletKill);
            phaser.body.collideWorldBounds = false;
            phaser.body.outOfCameraBoundsKill = true;
            phaser.damageAmount = 10;

          });

          // small brown asteroid
          smallBrownAsteroid = game.add.group();
          smallBrownAsteroid.physicsBodyType = Phaser.Physics.P2JS;
          smallBrownAsteroid.enableBody = true;
          smallBrownAsteroid.createMultiple(20, 'smallBrownAsteroid');
          smallBrownAsteroid.forEach(function(asteroid){

            asteroid.body.setCollisionGroup(asteroidCollisionGroup);
            asteroid.body.collides(playerCollisionGroup);
            asteroid.body.collides(playerBulletCollisionGroup);
            asteroid.body.collides(playerShieldCollisionGroup);
            asteroid.body.collides(enemyCollisionGroup);
            asteroid.body.collides(enemyBulletCollisionGroup);
            asteroid.body.collides(bossCollisionGroup);
            asteroid.body.collides(powerupsCollisionGroup);
            asteroid.body.collides(bossCollisionGroup);
            asteroid.body.mass = 300;

          });

          // med grey asteroid
          medGreyAsteroid = game.add.group();
          medGreyAsteroid.physicsBodyType = Phaser.Physics.P2JS;
          medGreyAsteroid.enableBody = true;
          medGreyAsteroid.createMultiple(10, 'mediumGreyAsteroid');
          medGreyAsteroid.forEach(function(asteroid){

            asteroid.body.setCollisionGroup(asteroidCollisionGroup);
            asteroid.body.collides(playerCollisionGroup);
            asteroid.body.collides(playerBulletCollisionGroup);
            asteroid.body.collides(playerShieldCollisionGroup);
            asteroid.body.collides(enemyCollisionGroup);
            asteroid.body.collides(enemyBulletCollisionGroup);
            asteroid.body.collides(bossCollisionGroup);
            asteroid.body.collides(bossCollisionGroup);
            asteroid.body.collides(powerupsCollisionGroup);
            asteroid.body.mass = 500;

          });

          // big brown asteroid
          bigBrownAsteroid = game.add.group();
          bigBrownAsteroid.physicsBodyType = Phaser.Physics.P2JS;
          bigBrownAsteroid.enableBody = true;
          bigBrownAsteroid.createMultiple(5, 'largeBrownAsteroid');
          bigBrownAsteroid.forEach(function(asteroid){

            asteroid.body.setCollisionGroup(asteroidCollisionGroup);
            asteroid.body.collides(playerCollisionGroup);
            asteroid.body.collides(playerBulletCollisionGroup);
            asteroid.body.collides(playerShieldCollisionGroup);
            asteroid.body.collides(enemyCollisionGroup);
            asteroid.body.collides(enemyBulletCollisionGroup);
            asteroid.body.collides(bossCollisionGroup);
            asteroid.body.collides(bossCollisionGroup);
            asteroid.body.collides(powerupsCollisionGroup);
            asteroid.body.mass = 700;

          });

          // health powerup
          healthPowerup = game.add.group();
          healthPowerup.physicsBodyType = Phaser.Physics.P2JS;
          healthPowerup.enableBody = true;
          healthPowerup.createMultiple(3, 'healthPowerUp');
          healthPowerup.forEach(function(powerup){

            powerup.body.setCollisionGroup(powerupsCollisionGroup);
            powerup.body.collides(playerCollisionGroup, addHealthToPlayer);
            powerup.body.collides(asteroidCollisionGroup);
            powerup.body.collides(enemyCollisionGroup);

          });

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


          currentTime = game.time.now - $scope.gameStartTime;

          });

          //  Health stat

          var startingPlayerHealth = 3000;
          var currentPlayerHealth = player.health;
          health = game.add.text(game.camera.width / 1.1, 10, 'Health: ' + parseFloat((currentPlayerHealth / startingPlayerHealth) * 100).toFixed(0) +'%', { font: '1.75em Arial', fill: '#fff' });
          health.fixedToCamera = true;
          health.render = function () {

              var playerHealthAfterEvent = player.health;
              health.text = 'Health: ' + parseFloat((playerHealthAfterEvent / startingPlayerHealth) * 100).toFixed(0) +'%';
              if(!player.alive){

                health.text = 'Health: 0%';

              }

          };


          // Sheilds stat
          var startingPlayerShields = 1000;
          var currentPlayerShields = shields.hitPoints;
          shieldsText = game.add.text(game.camera.width / 1.25, 10, 'Shields: ' + parseFloat((currentPlayerShields / startingPlayerShields) * 100).toFixed(0) +'%', { font: '1.75em Arial', fill: '#fff' });
          shieldsText.fixedToCamera = true;

          shieldsText.render = function () {

            playerShieldsAfterEvent = shields.hitPoints;
            shieldsText.text = 'Shields: ' + parseFloat((playerShieldsAfterEvent / startingPlayerShields) * 100).toFixed(0) + '%';
            if(player.alive && shields.hitPoints <= 0 ){

              shieldsText.text = 'Shields: 0%';

            }

          };

           // Game over text
          gameOver = game.add.text(game.camera.width / 2, game.camera.height / 2, 'GAME OVER!', { font: '84px Arial', fill: '#fff' });
          gameOver.anchor.setTo(0.5, 0.5);
          gameOver.visible = false;
          gameOver.fixedToCamera = true;

          // you win text
          youWinText = game.add.text(game.camera.width / 2, game.camera.height / 2, 'YOU WIN', {font: '84px Arial', fill: '#fff'});
          youWinText.anchor.setTo(0.5, 0.5);
          youWinText.visible = false;
          youWinText.fixedToCamera = true;

          clickToRestart = game.add.text(game.camera.width / 2, game.camera.height / 1.5, 'Click to Restart', {font: '45px Arial', fill: '#fff'});
          clickToRestart.anchor.setTo(0.5, 0.5);
          clickToRestart.visible = false;
          clickToRestart.fixedToCamera = true;

          // enemy counter
          enemyCounterDisplay = game.add.text(game.camera.width / 1.46, 10, 'Enemies left: ' + enemyCounter, { font: '1.75em Arial', fill: '#fff'} );
          enemyCounterDisplay.fixedToCamera = true;

          enemyCounterDisplay.render = function(){
            enemyCounterDisplay.text = 'Enemies Left: ' + enemyCounter;
          };

          // wave number text
          waveText = game.add.text(game.camera.width / 2, game.camera.height / 2.5, 'Wave ' + waveNumber, { font: '84px Arial', fill: '#fff' });
          waveText.anchor.setTo(0.5, 0.5);
          waveText.visible = false;
          waveText.fixedToCamera = true;
          waveText.render = function() {

            waveText.text = 'Wave ' + waveNumber;

          };

          // boss wave text
          bossWaveText = game.add.text(game.camera.width / 2, game.camera.height / 2.5, bossWaveNotification, { font: '84px Arial', fill: '#fff' });
          bossWaveText.anchor.setTo(0.5, 0.5);
          bossWaveText.visible = false;
          bossWaveText.fixedToCamera = true;

          // game timer
          gameTimer = '0 min 0.0 sec';
          gameTimerDisplay = game.add.text(game.camera.width / 75, 10, `${currentUser.username}'s time: ${gameTimer}`, {font: '1.75em Arial', fill: '#fff'});
          gameTimerDisplay.fixedToCamera = true;
          gameTimerDisplay.visible = true;
          gameTimerDisplay.render = function() {

            var updatedTime = game.time.now - $scope.gameStartTime;
            var updatedTimeInSeconds = updatedTime / 1000;
            var minutes = parseInt( updatedTimeInSeconds / 60) % 60;
            var seconds = parseFloat(updatedTimeInSeconds % 60).toFixed(1);
            $scope.currentTime = minutes + " min " + seconds + " sec";
            gameTimerDisplay.text = currentUser.username + "'s time: " + $scope.currentTime;

          };

          gamePausedDisplay = game.add.text((game.camera.width / 2) - 200, game.camera.height / 2, `Game Paused. Click Game To Continue`, {font: '3em Comic Sans', fill: '#fff'});
          gamePausedDisplay.fixedToCamera = true;
          gamePausedDisplay.visible = false;

        };


        function update() {



          starfield.tilePosition.y += 0.25;

          pawns.forEach(function(pawn) {
            if(Math.abs(player.position.x - pawn.position.x) <= 900 && Math.abs(player.position.y - pawn.position.y) <= 500 || pawn.engaged){

            pawn.engaged = true;
            moveEnemies(pawn, 80);
            if(pawn.engaged){

              firePawnBullet(pawn);

            }

            }

          });

          destroyers.forEach(function(destroyer){

            if(Math.abs(player.position.x - destroyer.position.x) <= 700 && Math.abs(player.position.y - destroyer.position.y) <= 700 || destroyer.engaged){
              destroyer.engaged = true;
              moveEnemies(destroyer, 1500);
              if(destroyer.engaged){

                fireDestroyerBullet(destroyer);

              }

            }

          });

          boss.forEach(function(boss) {
              if(Math.abs(player.position.x - boss.position.x) <= 700 && Math.abs(player.position.y - boss.position.y) <= 700 || boss.engaged){
              boss.engaged = true;
              moveEnemies(boss, 1500);
              if(boss.engaged){

                fireBossSmallBullet(boss);

              }
              }
          });

          if(player.alive && watchIsOn){

            gameTimerDisplay.render();

          }


          if (cursors.up.isDown || wKey.isDown || pad.isDown(Phaser.Gamepad.PS3XC_DPAD_UP) || pad.isDown(Phaser.Gamepad.XBOX360_DPAD_UP) || pad.axis(Phaser.Gamepad.PS3XC_STICK_LEFT_Y) < -0.5){

              player.body.thrust(50000);

            } else if (cursors.down.isDown || sKey.isDown || pad.isDown(Phaser.Gamepad.PS3XC_DPAD_DOWN) || pad.isDown(Phaser.Gamepad.XBOX360_DPAD_DOWN) || pad.axis(Phaser.Gamepad.PS3XC_STICK_LEFT_Y) > 0.5) {

                player.body.reverse(35000);

              } else {

                  player.body.thrust(0);

                }

          if (cursors.left.isDown || aKey.isDown || pad.isDown(Phaser.Gamepad.XBOX360_DPAD_LEFT) || pad.isDown(Phaser.Gamepad.XBOX360_DPAD_LEFT) || pad.axis(Phaser.Gamepad.PS3XC_STICK_RIGHT_X) < -0.1) {

              player.body.rotateLeft(100);

            } else if (cursors.right.isDown || dKey.isDown || pad.isDown(Phaser.Gamepad.PS3XC_DPAD_RIGHT) || pad.isDown(Phaser.Gamepad.XBOX360_DPAD_RIGHT) || pad.axis(Phaser.Gamepad.PS3XC_STICK_RIGHT_X) > 0.1){

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
            clickToRestart.visible = true;
            game.input.onDown.addOnce(restart, self);

          }

          boss.forEach(function(enemy) {

            if(enemy.healthPoints <= 0){

                bossIsDown = true;
                modalOpen = false;
                waveLaunched = true;
            }

          });

          // console.log('alive?', player.alive, 'boss?', bossIsDown);

          // wave over
          if(player.alive && enemyCounter <= 0 && bossIsDown && !leaderboardModalOpen){

            leaderboardModalOpen = true;

            gameTimerDisplay.visible = false;
            var timeCompleted = game.time.now - $scope.gameStartTime;
            gameTimer = timeCompleted;
            var timeCompletedInSeconds = timeCompleted / 1000;
            var minutes = parseInt(timeCompletedInSeconds / 60) % 60;
            var seconds = parseFloat(timeCompletedInSeconds % 60).toFixed(3);
            var timeCompletedFinal = minutes + " min " + seconds + " sec ";

            $scope.currentCompletedTime = timeCompletedFinal;

            youWinText.visible = true;
            clickToRestart.visible = true;
            game.input.onDown.addOnce(restart, self);


            LeaderboardFactory.postToLevel1Leaderboard($scope.currentUserUsername, timeCompletedFinal)
            .then( () => {
              LeaderboardFactory.getLeaderboard()
              .then((res) => {
                $scope.scores = res.data;
                for(var fbKey in $scope.scores){
                  $scope.level1ScoresArray.push($scope.scores[fbKey]);
                }
                return $scope.level1ScoresArray;

                })
              .then(() => {
                  $scope.open('lg');
                });
            });

          } else if(enemyCounter <= 0 && secondWaveCompleted && !waveLaunched){

            showBossWaveText();
            setTimeout(hideBossWaveText, 4500);
            $timeout();
            launchWave(5, 1, 1);
            waveLaunched = true;


          } else if(enemyCounter <= 0 && firstWaveCompleted && !waveLaunched){

            increaseWaveNumber();
            showWaveText();
            setTimeout(hideWaveText, 4500);
            $timeout();
            launchWave(10, 3, 0);
            waveLaunched = false;
            secondWaveCompleted = true;

          } else if (enemyCounter <= 0 && waveLaunched){

            waveLaunched = false;
            firstWaveCompleted = true;

          }

        }

        function increaseWaveNumber(){
          waveNumber += 1;
          waveText.render();
        }

        function showWaveText() {

          waveText.visible = true;

        }

        function hideWaveText() {
          waveText.visible = false;
        }

        function showBossWaveText () {

          bossWaveText.visible = true;

        }

        function hideBossWaveText () {

          bossWaveText.visible = false;

        }

        function launchWave (pawns, destroyers, boss, smallBrownAsteroids, medGreyAsteroids, bigBrownAsteroids, moreHealth) {

          enemyCounter = 0;
          enemyCounterDisplay.render();
          waveLaunched = true;

          // if argument exists use it... if not use number
          pawns = pawns ? pawns : 6;
          destroyers = destroyers ? destroyers : 1;
          boss = boss ? boss : 0;
          smallBrownAsteroids = smallBrownAsteroids ? smallBrownAsteroids : 8;
          medGreyAsteroids = medGreyAsteroids ? medGreyAsteroids : 4;
          bigBrownAsteroids = bigBrownAsteroids ? bigBrownAsteroids : 3;
          moreHealth = moreHealth ? moreHealth : 3;


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

          for(var c = 0; c < smallBrownAsteroids; c++){
            randomlyGenerateSmallBrownAsteroids();
          }

          for(var d = 0; d < medGreyAsteroids; d++){
            randomlyGenerateMedGreyAsteroids();
          }

          for(var e = 0; e < bigBrownAsteroids; e++){
            randomlyGenerateBigBrownAsteroids();
          }

          for(var f = 0; f < moreHealth; f++){
            randomlyGenerateHealthPowerups();
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

                enemy.sprite.kill();
                setOffExplosions(enemy);
                enemyCounter -= 1;

              }

            }

              if(bossHitCount % 40 === 0){
                enemy.reset(game.rnd.integerInRange(202, game.world.width - 202), game.rnd.integerInRange(202, game.world.height - 202));
              }

            enemyCounterDisplay.render();

        }

        function enemyBulletHitPlayer(player, bullet) {

          bullet.sprite.kill();
          if (shields.hitPoints > 0) {

              console.log('shields.hitPoints', shields.hitPoints);
              shields.hitPoints -= bullet.sprite.damageAmount;
              shieldsText.render();
              destroyShield();

            } else {

              player.sprite.health -= bullet.sprite.damageAmount;
              health.render();
              if (player.sprite.health <= 0){
                player.sprite.kill();
              }

            }
        }

        function restart(){
          game.state.clearCurrentState();
          game.state.start('game', true, true);
        }

        function shipCollide(player, enemy) {

          enemy.sprite.kill();
          setOffExplosions(enemy);
          if(!enemy.sprite.hasHit){
            enemyCounter -= 1;
            enemyCounterDisplay.render();
            enemy.sprite.hasHit = true;
            if (shields.hitPoints > 0) {
              shields.hitPoints -= enemy.sprite.damageAmount;
              shields.alpha -= 1;
              shieldsText.render();
              destroyShield()

            } else {

              player.sprite.health -= enemy.sprite.damageAmount;
              health.render();
              if (player.sprite.health <= 0){
                player.sprite.kill();
              }

            }
          }
        }

        function bossCollide(player, boss) {
          player.sprite.kill();
          setOffExplosions(player);
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
            enemy.healthPoints = 800;
            enemy.engaged = true;
            var enemyX = game.world.randomX;
            var enemyY = game.world.randomY;
            while((enemyX > player.x - 500 && enemyX < player.x + 500) && (enemyY > player.y - 500 && enemyY < player.y + 500)) {
              enemyX = game.world.randomX;
              enemyY = game.world.randomY;
            }
            enemy.reset(enemyX, enemyY);
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
            enemy.healthPoints = 150;
            enemy.engaged = false;
            var enemyX = game.world.randomX;
            var enemyY = game.world.randomY;
            while((enemyX > player.x - 500 && enemyX < player.x + 500) && (enemyY > player.y - 500 && enemyY < player.y + 500)) {
              enemyX = game.world.randomX;
              enemyY = game.world.randomY;
            }
            enemy.reset(enemyX, enemyY);
          }

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

        //  Fire Pawn Bullet
        function firePawnBullet(pawn){

          var pawnBulletSpacing = 1200;
          if(game.time.now > pawn.lastShot){

            enemyBullet = pawnBullets.getFirstExists(false);

            pawn1 = new Phaser.Point(pawn.x, pawn.y);
            pawn2 = new Phaser.Point(pawn.x, pawn.y - 20);
            pawn2.rotate(pawn1.x, pawn1.y, pawn.rotation, false);
            if (enemyBullet && pawn.alive) {

                enemyBullet.reset(pawn2.x, pawn2.y);
                enemyBullet.body.fixedRotation = true;
                enemyBullet.lifespan = 1500;
                enemyBullet.rotation = pawn.rotation;
                var radians = game.math.degToRad(pawn.angle);
                enemyBullet.body.applyImpulseLocal([-Math.sin(radians) * 40, Math.cos(radians) * 40], 0, 0);
                pawn.lastShot = game.time.now + pawnBulletSpacing;

            }

          }

        }

        //  Fire Destroyer Bullet
        function fireDestroyerBullet(destroyer){

          var destroyerBulletSpacing = 1600;
          if(game.time.now > destroyer.lastShot){

            enemyBullet = destroyerBullets.getFirstExists(false);

            destroyer1 = new Phaser.Point(destroyer.x, destroyer.y);
            destroyer2 = new Phaser.Point(destroyer.x, destroyer.y - 20);
            destroyer2.rotate(destroyer1.x, destroyer1.y, destroyer.rotation, false);
            if (enemyBullet && destroyer.alive) {

                enemyBullet.reset(destroyer2.x, destroyer2.y);
                enemyBullet.body.fixedRotation = true;
                enemyBullet.lifespan = 2000;
                enemyBullet.rotation = destroyer.rotation;
                var radians = game.math.degToRad(destroyer.angle);
                enemyBullet.body.applyImpulseLocal([-Math.sin(radians) * 40, Math.cos(radians) * 40], 0, 0);
                destroyer.lastShot = game.time.now + destroyerBulletSpacing;

            }

          }

        }

        //  Fire Boss Bullet
        function fireBossSmallBullet(boss){

          var bossBulletSpacing = 1400;
          if(game.time.now > boss.lastShot){

            enemyBullet = bossSmallBullets.getFirstExists(false);

            boss1 = new Phaser.Point(boss.x, boss.y);
            boss2 = new Phaser.Point(boss.x, boss.y - 20);
            boss2.rotate(boss1.x, boss1.y, boss.rotation, false);
            if (enemyBullet && boss.alive) {

                enemyBullet.reset(boss2.x, boss2.y);
                enemyBullet.body.fixedRotation = true;
                enemyBullet.lifespan = 2000;
                enemyBullet.rotation = boss.rotation;
                var radians = game.math.degToRad(boss.angle);
                enemyBullet.body.applyImpulseLocal([-Math.sin(radians) * 40, Math.cos(radians) * 40], 0, 0);
                boss.lastShot = game.time.now + bossBulletSpacing;

            }

          }

        }

        function randomlyGenerateSmallBrownAsteroids() {

          var smallBrownMeteor = smallBrownAsteroid.getFirstExists(false);
          if(smallBrownMeteor){
            var smallBrownMeteorX = game.world.randomX;
            var smallBrownMeteorY = game.world.randomY;
            while((smallBrownMeteorX > player.x - 500 && smallBrownMeteorX < player.x + 500) && (smallBrownMeteorY > player.y - 500 && smallBrownMeteorY < player.y + 500)) {
              smallBrownMeteorX = game.world.randomX;
              smallBrownMeteorY = game.world.randomY;
            }
            smallBrownMeteor.reset(smallBrownMeteorX, smallBrownMeteorY);
          }
        }

        function randomlyGenerateMedGreyAsteroids() {

          var medGreyMeteor = medGreyAsteroid.getFirstExists(false);
          if(medGreyMeteor){
            var medGreyMeteorX = game.world.randomX;
            var medGreyMeteorY = game.world.randomY;
            while((medGreyMeteorX > player.x - 500 && medGreyMeteorX < player.x + 500) && (medGreyMeteorY > player.y - 500 && medGreyMeteorY < player.y + 500)) {
              medGreyMeteorX = game.world.randomX;
              medGreyMeteorY = game.world.randomY;
            }
            medGreyMeteor.reset(medGreyMeteorX, medGreyMeteorY);
          }
        }

        function randomlyGenerateBigBrownAsteroids() {

          var bigBrownMeteor = bigBrownAsteroid.getFirstExists(false);
          if(bigBrownMeteor){
            var bigBrownMeteorX = game.world.randomX;
            var bigBrownMeteorY = game.world.randomY;
            while((bigBrownMeteorX > player.x - 500 && bigBrownMeteorX < player.x + 500) && (bigBrownMeteorY > player.y - 500 && bigBrownMeteorY < player.y + 500)) {
              bigBrownMeteorX = game.world.randomX;
              bigBrownMeteorY = game.world.randomY;
            }
            bigBrownMeteor.reset(bigBrownMeteorX, bigBrownMeteorY);
          }
        }

        function randomlyGenerateHealthPowerups() {
          var moreHealth = healthPowerup.getFirstExists(false);
          if(moreHealth){
            var moreHealthX = game.world.randomX;
            var moreHealthY = game.world.randomY;
            while((moreHealthX > player.x - 500 && moreHealthX < player.x + 500) && (moreHealthY > player.y - 500 && moreHealthY < player.y + 500)) {
              moreHealthX = game.world.randomX;
              moreHealthY = game.world.randomY;
            }
            moreHealth.reset(moreHealthX, moreHealthY);
          }
        }

        function addHealthToPlayer(powerup, player){
          if(player.sprite.health < 3000 && shields.hitPoints <= 0) {
            shields.hitPoints = 0;
            player.sprite.health += 100;
            health.render();
            powerup.sprite.kill();
          }

          if(player.sprite.health >= 3000) {
            player.sprite.health = 3000;
            shields.hitPoints += 50;
            player.sprite.addChild(shields);
            health.render();
            shieldsText.render();
            powerup.sprite.kill();
          }

          if(shields.hitPoints >= 1000 && player.sprite.health === 3000){
            shields.hitPoint = 1000;
            player.sprite.health = 3000;
            health.render();
            shieldsText.render();
            powerup.sprite.kill();
          }

          if(shields.hitPoints >= 1000 && player.sprite.health < 3000){
            shields.hitPoints = 1000;
            player.sprite.health += 100;
            health.render();
            shieldsText.render();
            powerup.sprite.kill();
          }

          if(shields.hitPoints > 1000){
            shields.hitPoints = 1000;
            shieldsText.render();
            powerup.sprite.kill();
          }

        }

        function startTimer(){
          watchIsOn = true;
          $scope.gameStartTime = game.time.now;
          gameTimerDisplay.render();
        }

        function removeTimer(){
          game.time.removeAll();
        }

        function bulletKill(bullet){
          bullet.sprite.kill();
        }

        function logOut() {
          firebase.auth().signOut();
          $location.path('/');
          game.destroy();
          $timeout();
        }

        function seeLeaderboard() {
          console.log('gamePaused');
          LeaderboardFactory.getLeaderboard()
            .then((res) => {
              $scope.scores = res.data;
              for(var fbKey in $scope.scores){
                $scope.level1ScoresArray.push($scope.scores[fbKey]);
              }
              return $scope.level1ScoresArray;

              })
            .then(() => {
                $scope.open('lg');
              }
            );
          gamePausedDisplay.visible = true;
          enemyCounterDisplay.visible = false;
          gameTimerDisplay.visible = false;
          shieldsText.visible = false;
          health.visible = false;
          logOutButton.visible = false;
          leaderboardButton.visible = false;
          game.paused = true;
          game.input.onDown.addOnce(resumeGame, self);
        }

        function resumeGame() {
          console.log('game resumed');
          gamePausedDisplay.visible = false;
          enemyCounterDisplay.visible = true;
          gameTimerDisplay.visible = true;
          shieldsText.visible = true;
          health.visible = true;
          logOutButton.visible = true;
          leaderboardButton.visible = true;
          game.paused = false;
        }

        function destroyShield() {
          if(shields.hitPoints > 800) {
            shields.alpha = 1;
          }
          else if(shields.hitPoints <= 800 && shields.hitPoints > 600) {
            shields.alpha = 0.9;
          }
          else if(shields.hitPoints <= 600 && shields.hitPoints > 400) {
            shields.alpha = 0.8;
          }
          else if(shields.hitPoints <= 400 && shields.hitPoints > 200) {
            shields.alpha = 0.7;
          }
          else if(shields.hitPoints <= 200 && shields.hitPoints > 0) {
            shields.alpha = 0.5;
          }
          else {
            shields.alpha = 0;
          }
        }

        function render() {
          // destroyers.forEach(function(destroyer) {
          //   destroyer.body.debug = true;
          // });

          // pawns.forEach(function (pawn) {
          //   pawn.body.debug = true;
          // });

          // player.body.debug = true;

          // phasers.forEach(function(phaser) {
          //   phaser.body.debug = true;
          // });

          // shields.body.debug = true;


        }
  });
  }

});
