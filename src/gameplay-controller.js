angular.module('independence-day')
  .controller('gameplay-ctrl', function() {
    var game = new Phaser.Game(1640, 807, Phaser.AUTO, 'independence-day', { preload: preload, create: create, update: update });


    // General Variables
    var starfield;
    var player;
    var pawns;
    var cursors;
    var bank;
    var shipTail;
    var explosions;


    // WASD Variables
    var wKey;
    var aKey;
    var sKey;
    var dKey;


    var bullet;
    var bullets;
    var bulletTime = 0;
    var fireButton;

    var ACCELERATION = 200;
    var DRAG = 100;
    var MAXSPEED = 300;


    function preload() {

        game.load.image('background', 'assets/images/spaceshooter/Backgrounds/starfield.png');
        game.load.image('player', 'assets/images/spaceshooter/PNG/playerShip1_blue.png');
        game.load.image('bullet', 'assets/images/spaceshooter/PNG/Lasers/laserGreen16.png');
        game.load.image('pawns', 'assets/images/spaceshooter/PNG/Enemies/enemyBlack1.png');
        game.load.image('tail', 'assets/images/spaceshooter/PNG/Lasers/laserGreen09.png');
        game.load.spritesheet('explosion', 'assets/images/explosions.png', 128, 128);

    }

    function create() {

      // arcade physics system
      game.physics.startSystem(Phaser.Physics.ARCADE);

      // setting game bounds
      game.world.setBounds(0, 0, 1920, 1920);

      // setting background
      starfield = game.add.tileSprite(0,0, 1920, 1920, 'background');


      //  Our ships bullets
      bullets = game.add.group();
      bullets.enableBody = true;
      bullets.physicsBodyType = Phaser.Physics.ARCADE;

      //  All 40 of them
      bullets.createMultiple(40, 'bullet');
      bullets.setAll('anchor.x', 0.5);
      bullets.setAll('anchor.y', 0.5);
      bullets.setAll('scale.x', 0.25);
      bullets.setAll('scale.y', 0.25);

      // creating player
      player = game.add.sprite(300, 300, 'player');
      player.sheilds = 60;
      player.health = 100;
      player.anchor.setTo(0.5, 0.5);
      game.physics.enable(player, Phaser.Physics.ARCADE);
      player.body.maxVelocity.setTo(MAXSPEED, MAXSPEED);
      player.body.drag.setTo(DRAG, DRAG);
      player.rotation = 1.5 * Math.PI;
      player.scale.x = 0.35;
      player.scale.y = 0.35;
      player.body.collideWorldBounds = true;
      game.camera.follow(player);

      // PAWNS
      pawns = game.add.group();
      pawns.enableBody = true;
      pawns.physicsBodyType = Phaser.Physics.ARCADE;
      pawns.createMultiple(20, 'pawns');
      pawns.setAll('anchor.x', 0.5);
      pawns.setAll('anchor.y', 0.5);
      pawns.setAll('scale.x', 0.30);
      pawns.setAll('scale.y', 0.30);
      pawns.setAll('angle', 180);
      pawns.setAll('outOfBoundsKill', true);
      pawns.setAll('checkWorldBounds', true);
      pawns.forEach(function(enemy){
        enemy.body.setSize(enemy.width * 1 / 2, enemy.height * 1 / 2);
        enemy.damageAmount = 10;
      });


      launchPawn();

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
      explosions.physicsBodyType = Phaser.Physics.ARCADE;
      explosions.createMultiple(30, 'explosion');
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
      sheilds = game.add.text(game.camera.width - 300, 10, 'Sheilds: ' + player.sheilds +'%', { font: '20px Arial', fill: '#fff' });
      sheilds.fixedToCamera = true

      sheilds.render = function () {
        sheilds.text = 'Sheilds: ' + Math.max(player.sheilds, 0) + '%';
      };
    }


    function update() {
      // starfield.tilePosition.y += 1;

      //  Reset the player, then check for movement keys
      player.body.acceleration.x = 0;

      pawns.forEach(function(pawn) {
        pawn.rotation = game.physics.arcade.moveToObject(pawn, player, 100, 2000, 2000);
      });


      if (cursors.up.isDown || wKey.isDown)
        {
          game.physics.arcade.accelerationFromRotation(player.rotation, 200, player.body.acceleration);

          // player.body.velocity.y = -ACCELERATION - 100;
          starfield.tilePosition.y += 0.5;
        } else {
          player.body.acceleration.set(0);
        }

      if (cursors.left.isDown || aKey.isDown)
        {
          player.body.angularVelocity = -200;
          // player.body.acceleration.x = -ACCELERATION - 100;
          starfield.tilePosition.x -= 0.5;
        } else if (cursors.right.isDown || dKey.isDown)
          {
            player.body.angularVelocity = 200;
            // player.body.acceleration.x = ACCELERATION + 100;
            starfield.tilePosition.x += 0.5;
          } else {
            player.body.angularVelocity = 0;
            starfield.tilePosition.y += 1;
            }

      if (player.alive && fireButton.isDown)
      {
          fireBullet();
      }

      // screenWrap(player);

      // bullets.forEachExists(screenWrap, this);

      // shipTail.addChild(player);

      //  Check collisions
      game.physics.arcade.overlap(pawns, bullets,  hitEnemy, null, this);
      game.physics.arcade.overlap(player, pawns, shipCollide, null, this);

    }

    function hitEnemy(enemy, bullet) {
        var explosion = explosions.getFirstExists(false);
        explosion.reset(bullet.body.x + bullet.body.halfWidth, bullet.body.y + bullet.body.halfHeight);
        explosion.body.velocity.y = enemy.body.velocity.y;
        explosion.alpha = 0.7;
        explosion.play('explosion', 30, false, true);
        enemy.kill();
        bullet.kill();
    }

    function shipCollide(player, enemy) {
      var explosion = explosions.getFirstExists(false);
      explosion.reset(enemy.body.x + enemy.body.halfWidth, enemy.body.y + enemy.body.halfHeight);
      explosion.body.velocity.y = enemy.body.velocity.y;
      explosion.alpha = 0.7;
      explosion.play('explosion', 30, false, true);
      enemy.kill();


      if (player.sheilds > 0) {
        player.sheilds -= enemy.damageAmount;
        console.log("sheilds", player.sheilds);
        sheilds.render();
      } else {
        console.log('health');
        player.damage(enemy.damageAmount);
        health.render();
      }
    }

    function launchPawn(){
      var minPawnSpacing = 300;
      var maxPawnSpacing = 3000;
      var pawnSpeed = 100;

      var enemy = pawns.getFirstExists(false);
      if (enemy) {
        enemy.reset(game.rnd.integerInRange(0, game.width), -20) ;
        enemy.body.velocity.x = game.rnd.integerInRange(-300, 300);
        enemy.body.velocity.y = pawnSpeed;
        enemy.body.drag.x = 100;

        //  Update function for each enemy ship to update rotation etc
        enemy.update = function(){
          enemy.angle = 180 - game.math.radToDeg(Math.atan2(enemy.body.velocity.x, enemy.body.velocity.y));
        };
      }

      // send another enemy
      game.time.events.add(game.rnd.integerInRange(minPawnSpacing, maxPawnSpacing), launchPawn);
    }

    function fireBullet () {
      var bulletSpacing = 150;
      if (game.time.now > bulletTime)
      {

          bullet = bullets.getFirstExists(false);
          if (bullet)
          {
              bullet.reset(player.body.x + 14, player.body.y + 18);

              bullet.lifespan = 1800;
              bullet.rotation = player.rotation;
              game.physics.arcade.velocityFromRotation(player.rotation, 500, bullet.body.velocity);
              bulletTime = game.time.now + 50;
              bulletTime = game.time.now + bulletSpacing;
          }
      }

    }


    function screenWrap (sprite) {

      if (sprite.x < 0)
      {
          sprite.x = game.width;
      }
      else if (sprite.x > game.width)
      {
          sprite.x = 0;
      }

      if (sprite.y < 0)
      {
          sprite.y = game.height;
      }
      else if (sprite.y > game.height)
      {
          sprite.y = 0;
      }

    }

  function render() {

  }
});
