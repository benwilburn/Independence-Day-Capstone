angular.module('independence-day')
  .controller('gameplay-ctrl', function($location, $timeout, $scope, $uibModal, LeaderboardFactory, AuthFactory) {

    firebase.auth().onAuthStateChanged((user) => {
      if(user){
          // var canvas = document.getElementsByTagName('canvas');
          // console.log('canvas', canvas.parentNode);


        var currentPlayer = '';

        var currentUser = user.uid;
        $scope.currentUserUsername = '';
        $scope.level1ScoresArray = [];

        firebase.database().ref('/auth').once('value', function (arg) {

            var authObject = arg.val();

            for(var authObjectUser in authObject){
              var userObject = authObject[authObjectUser];
              // console.log('authObjectUser', userObject.uid);
              if(currentUser === userObject.uid){
                $scope.currentUserUsername = userObject.username;
                currentPlayer = $scope.currentUserUsername;
                // $timeout();
                console.log('scope.currentUserUsername', $scope.currentUserUsername);

              }
            }



        $scope.animationsEnabled = true;

        $scope.signOutUser = function () {
          firebase.auth().signOut();
          game.destroy();
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
              }

          }
        });
      };


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
        var youWinText;
        var gameTimer;
        var gameTimerDisplay;
        var waveText;
        var bossWaveText;
        var score = 0;
        // var health;
        // var sheilds;
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
            game.load.image('pawnBullet', 'assets/images/spaceshooter/PNG/Lasers/laserRed15.png');
            game.load.image('destroyerBullet', 'assets/images/spaceshooter/PNG/Lasers/laserRed16.png');
            game.load.spritesheet('explosion', 'assets/images/explosions.png', 128, 128);
            game.load.image('destroyers', 'assets/images/spaceshooter/PNG/ospaceship-main.png');
            game.load.physics('destroyer_physics', 'assets/oShip_physics.json');
            game.load.image('bigBoss', 'assets/images/spaceshooter/PNG/bossShip.png');
            game.load.physics('bigBoss_physics', 'assets/bigBossShip_physics.json');
            game.load.image('playerShield', 'assets/images/PNG/Effects/shield1.png');

        }

        function create() {



          // arcade physics system
          game.physics.startSystem(Phaser.Physics.P2JS);

          // starting gamepad input
          game.input.gamepad.start();

          pad = game.input.gamepad.pad1;
          // pad.addCallbacks(this, { onConnect: addButtons });

          // setting game bounds
          game.world.setBounds(0, 0, 1650, 800);

          // setting background
          starfield = game.add.tileSprite(0,0, 1650, 800, 'background');

          // set impact events
          game.physics.p2.setImpactEvents(true);

          // player collision group
          var playerCollisionGroup = game.physics.p2.createCollisionGroup();

          // enemy collision group
          var enemyCollisionGroup = game.physics.p2.createCollisionGroup();

          // boss collision group
          var bossCollisionGroup = game.physics.p2.createCollisionGroup();

          // player bullet collision group
          var playerBulletCollisionGroup = game.physics.p2.createCollisionGroup();

          // enemy bullet collisionGroup
          var enemyBulletCollisionGroup = game.physics.p2.createCollisionGroup();

          // collision groups collide with world bounds
          game.physics.p2.updateBoundsCollisionGroup();

          // creating player
          player = game.add.sprite(game.world.width / 2, game.world.height / 2, 'player');
          player.shields = game.add.sprite(game.world.width / 2, game.world.height / 2, 'playerShields');
          game.physics.p2.enable(player);
          player.shields = 60;

          player.health = 3000;
          player.body.damping = 0.5;
          // player.rotation = 1.5 * Math.PI;
          player.body.collideWorldBounds = true;
          game.camera.follow(player);
          player.body.mass = 100;
          player.body.clearShapes();
          player.body.loadPolygon('player_physics', 'playerShip1_blue');
          player.body.setCollisionGroup(playerCollisionGroup);
          player.body.collides(enemyCollisionGroup, shipCollide);
          player.body.collides(bossCollisionGroup, bossCollide);
          player.body.collides(enemyBulletCollisionGroup, enemyBulletHitPlayer);

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
            // enemy.body.setRectangleFromSprite();
            enemy.body.clearShapes();
            enemy.body.loadPolygon('destroyer_physics', 'ospaceship-main');
            enemy.body.setCollisionGroup(enemyCollisionGroup);
            enemy.body.collides(playerBulletCollisionGroup, hitEnemy);
            enemy.body.collides(playerCollisionGroup);
            enemy.body.collides(enemyCollisionGroup);

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
            enemy.body.collides(playerBulletCollisionGroup, hitEnemy);
            // enemy.body.collides(playerCollisionGroup);

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
            // enemy.body.setSize(20,20);
            // enemy.body.setRectangle(3,3);
            bullet.body.mass = 1;
            bullet.body.setRectangleFromSprite();
            bullet.body.setCollisionGroup(enemyBulletCollisionGroup);
            bullet.body.collides(playerCollisionGroup);
            bullet.body.collideWorldBounds = false;
            bullet.body.outOfCameraBoundsKill = true;
            bullet.damageAmount = 15;
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
            // enemy.body.setSize(20,20);
            // enemy.body.setRectangle(3,3);
            bullet.body.mass = 1;
            bullet.body.setRectangleFromSprite();
            bullet.body.setCollisionGroup(enemyBulletCollisionGroup);
            bullet.body.collides(playerCollisionGroup);
            bullet.body.collideWorldBounds = false;
            bullet.body.outOfCameraBoundsKill = true;
            bullet.damageAmount = 30;
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
            phaser.body.collideWorldBounds = false;
            phaser.body.outOfCameraBoundsKill = true;
            phaser.damageAmount = 10;

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
          });

          //  Health stat

          var startingPlayerHealth = 3000;
          console.log('startingPlayerHealth', startingPlayerHealth);
          var currentPlayerHealth = player.health;
          console.log('currentPlayerHealth', currentPlayerHealth);
          health = game.add.text(game.camera.width - 150, 10, 'Health: ' + parseFloat((currentPlayerHealth / startingPlayerHealth) * 100).toFixed(0) +'%', { font: '20px Arial', fill: '#fff' });
          health.fixedToCamera = true;
          health.render = function () {
              var playerHealthAfterEvent = player.health;
              health.text = 'health: ' + parseFloat((playerHealthAfterEvent / startingPlayerHealth) * 100).toFixed(0) +'%';
          };


          // Sheilds stat
          shields = game.add.text(game.camera.width - 300, 10, 'Shields: ' + player.shields +'%', { font: '20px Arial', fill: '#fff' });
          shields.fixedToCamera = true;

          shields.render = function () {
            shields.text = 'Shields: ' + Math.max(player.shields, 0) + '%';
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

          // enemy counter
          enemyCounterDisplay = game.add.text(game.camera.width -500, 10, 'Enemies left: ' + enemyCounter, { font: '20px Arial', fill: '#fff'} );
          enemyCounterDisplay.fixedToCamera = true;

          enemyCounterDisplay.render = function(){
            enemyCounterDisplay.text = 'Enemies Left: ' + Math.max(enemyCounter, 0);
          };

          // wave number text
          waveText = game.add.text(game.camera.width / 2, game.camera.height / 2 - 200, 'Wave ' + waveNumber, { font: '84px Arial', fill: '#fff' });
          waveText.anchor.setTo(0.5, 0.5);
          waveText.visible = false;
          waveText.fixedToCamera = true;
          waveText.render = function() {
            waveText.text = 'Wave ' + Math.max(waveNumber, 0);
          };

          // boss wave text
          bossWaveText = game.add.text(game.camera.width / 2, game.camera.height / 2, bossWaveNotification, { font: '84px Arial', fill: '#fff' });
          bossWaveText.anchor.setTo(0.5, 0.5);
          bossWaveText.visible = false;
          bossWaveText.fixedToCamera = true;

          // game timer
          gameTimer = '0 min 0.0 sec';
          gameTimerDisplay = game.add.text(game.camera.width -1575, 10, `${currentPlayer}'s time: ${gameTimer}`, {font: '20px Arial', fill: '#fff'});
          gameTimerDisplay.fixedToCamera = true;
          gameTimerDisplay.visible = true;
          gameTimerDisplay.render = function() {
            var updatedTime = game.time.now - $scope.gameStartTime;
            var updatedTimeInSeconds = updatedTime / 1000;
            var minutes = parseInt( updatedTimeInSeconds / 60) % 60;
            var seconds = parseFloat(updatedTimeInSeconds % 60).toFixed(1);
            gameTimerDisplay.text = currentPlayer + "'s time: " + minutes + " min " + seconds + " sec";
          };

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

            }

          });

          boss.forEach(function(boss) {
              if(Math.abs(player.position.x - boss.position.x) <= 700 && Math.abs(player.position.y - boss.position.y) <= 700 || boss.engaged){
              boss.engaged = true;
              moveEnemies(boss, 1500);
              }
          });

          if(player.alive && watchIsOn){
            gameTimerDisplay.render();
          }


          if (cursors.up.isDown || wKey.isDown || pad.isDown(Phaser.Gamepad.PS3XC_DPAD_UP) || pad.isDown(Phaser.Gamepad.XBOX360_DPAD_UP) || pad.axis(Phaser.Gamepad.PS3XC_STICK_LEFT_Y) < -0.5)
            {

              player.body.thrust(90000);

            } else if (cursors.down.isDown || sKey.isDown || pad.isDown(Phaser.Gamepad.PS3XC_DPAD_DOWN) || pad.isDown(Phaser.Gamepad.XBOX360_DPAD_DOWN) || pad.axis(Phaser.Gamepad.PS3XC_STICK_LEFT_Y) > 0.5) {

                player.body.reverse(50000);

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
                modalOpen = false;
                waveLaunched = true;
            }

          });

          // console.log('alive?', player.alive, 'boss?', bossIsDown);

          // wave over
          if(player.alive && enemyCounter <= 0 && bossIsDown && !leaderboardModalOpen){

            leaderboardModalOpen = true;
            console.log('player.alive', player.alive);
            console.log('enemyCounter', enemyCounter);
            console.log('bossIsDown', bossIsDown);
            console.log('leaderboardModalOpen', leaderboardModalOpen);

            gameTimerDisplay.visible = false;
            var timeCompleted = game.time.now - $scope.gameStartTime;
            removeTimer();
            console.log('timeCompleted', timeCompleted);
            var timeCompletedInSeconds = timeCompleted / 1000;
            var minutes = parseInt(timeCompletedInSeconds / 60) % 60;
            var seconds = parseFloat(timeCompletedInSeconds % 60).toFixed(3);
            var timeCompletedFinal = minutes + " min " + seconds + " sec ";
            console.log('timeCompletedFinal', timeCompletedFinal);
            var timeCompletedFinalString = timeCompletedFinal.toString();
            console.log('timeCompletedFinalString', timeCompletedFinalString);

            $scope.currentCompletedTime = timeCompletedFinalString;

            youWinText.visible = true;
            LeaderboardFactory.postToLevel1Leaderboard($scope.currentUserUsername, timeCompletedFinalString)
              .then(LeaderboardFactory.getLeaderboard()
                .then((res) => {
                  console.log('res', res);
                  $scope.scores = res.data;
                  for(var fbKey in $scope.scores){
                    $scope.level1ScoresArray.push($scope.scores[fbKey]);
                  }
                  console.log('$scope.level1ScoresArray', $scope.level1ScoresArray);
                  // $timeout();
                  // leaderboardBuilt = true;
                  // $scope.open('lg');
                  // console.log('leaderboardModalOpen', leaderboardModalOpen);
                  return $scope.level1ScoresArray;

                  }
                ).then(() => {
                  $scope.open('lg');
                  }
                )
              );
                // bossIsDown = false;
            } else if(enemyCounter <= 0 && secondWaveCompleted && !waveLaunched){

            showBossWaveText();
            setTimeout(hideBossWaveText, 4500);
            $timeout();
            launchWave(0, 0, 1);
            console.log('boss wave Game Time', game.time.now);
            waveLaunched = true;


          } else if(enemyCounter <= 0 && firstWaveCompleted && !waveLaunched){

            increaseWaveNumber();
            showWaveText();
            setTimeout(hideWaveText, 4500);
            $timeout();
            launchWave(1, 0, 0);
            console.log('2nd Game Time', game.time.now);
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

        function launchWave (pawns, destroyers, boss) {

          waveLaunched = true;

          // if argument exists use it... if not use number
          pawns = pawns ? pawns : 1;
          destroyers = destroyers ? destroyers : 0;
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

              if(bossHitCount % 30 === 0){
                enemy.reset(game.rnd.integerInRange(202, game.world.width - 202), game.rnd.integerInRange(202, game.world.height - 202));
              }

            enemyCounterDisplay.render();

        }

        function enemyBulletHitPlayer(player, bullet) {

          bullet.sprite.kill();
          if (player.sprite.shields > 0) {

              player.sprite.shields -= bullet.sprite.damageAmount;
              shields.render();

            } else {

              player.sprite.health -= bullet.sprite.damageAmount;
              health.render();
              if (player.sprite.health <= 0){
                player.sprite.kill();
              }

            }

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
          bossHitCount = 0;
          game.time.events.add(1000, showWaveText);
          game.time.events.add(4500, hideWaveText);
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
            enemy.healthPoints = 10;
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

        //  Fire
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
                // console.log('enemyBullet', enemyBullet);
                // pawn.bullets--;
                // enemyBullet.reset(this.x, this.y + this.height / 2);
                // enemyBullet.damageAmount = this.damageAmount;
                // var angle = game.physics..moveToObject(enemyBullet, player, bulletSpeed);
               // enemyBullet.angle = game.math.radToDeg(angle);
            }

          }

        }

        function startTimer(){
          watchIsOn = true;
          $scope.gameStartTime = game.time.now;
          console.log('$scope.gameStartTime', $scope.gameStartTime);
          // $timeout();
        }

        function removeTimer(){
          game.time.removeAll();
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
      } else {
        $scope.currentUser = null;
        $location.path('/');
        $timeout();
      }
    });
});
