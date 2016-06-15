angular.module('independence-day')
  .controller('gameplay-ctrl', function() {
    var game = new Phaser.Game(1640, 807, Phaser.AUTO, 'independence-day', { preload: preload, create: create, update: update });

    var starfield;
    var player;
    var boss;
    var cursors;
    var bank;

    var ACCELERATION = 300;
    var DRAG = 100;
    var MAXSPEED = 500;


    function preload() {

        game.load.image('background', 'assets/images/spaceshooter/Backgrounds/starfield.png');
        game.load.image('player', 'assets/images/spaceshooter/PNG/playerShip1_blue.png');
        game.load.image('boss', 'assets/images/spaceshooter/PNG/ufoRed.png');

    }

    function create() {

      // arcade physics system
      game.physics.startSystem(Phaser.Physics.ARCADE);

      // setting background
      starfield = game.add.tileSprite(0,0, 1640, 807, 'background');

      starfield.scale.setTo(2,2);

      // creating player
      player = game.add.sprite(300, 300, 'player');
      player.anchor.setTo(0.5, 0.5);
      game.physics.enable(player, Phaser.Physics.ARCADE);
      player.body.maxVelocity.setTo(MAXSPEED, MAXSPEED);
      player.body.drag.setTo(DRAG, DRAG);
      player.rotation = 1.5 * Math.PI;
      player.scale.x = 0.5;
      player.scale.y = 0.5;

      // creating boss
      game.add.sprite(300, 0, 'boss');

      // basic player movment
      cursors = game.input.keyboard.createCursorKeys();
    }


    function update() {
      starfield.tilePosition.y += 1;

      // this.wasd = {
      //   up: game.input.keyboard.addKey(Phaser.Keyboard.W),
      //   down: game.input.keyboard.addKey(Phaser.Keyboard.S),
      //   left: game.input.keyboard.addKey(Phaser.Keyboard.A),
      //   right: game.input.keyboard.addKey(Phaser.Keyboard.D),
      // };
      //  Reset the player, then check for movement keys
      player.body.acceleration.x = 0;

      if (cursors.up.isDown)
        {
          game.physics.arcade.accelerationFromRotation(player.rotation, 200, player.body.acceleration);
          // player.body.velocity.y = -ACCELERATION - 100;
          starfield.tilePosition.y += 0.5;
        } else {
          player.body.acceleration.set(0);
        }

      if (cursors.down.isDown)
        {
          player.body.velocity.y = ACCELERATION -100;
          starfield.tilePosition.y -= 0.5;
        }

      if (cursors.left.isDown)
        {
          player.body.angularVelocity = -200;
          // player.body.acceleration.x = -ACCELERATION - 100;
          starfield.tilePosition.x -= 0.5;
        } else if (cursors.right.isDown)
          {
            player.body.angularVelocity = 200;
            // player.body.acceleration.x = ACCELERATION + 100;
            starfield.tilePosition.x += 0.5;
          } else {
            player.body.angularVelocity = 0;
            starfield.tilePosition.y += 1;
            }

      screenWrap(player);
      // else if(cursors.up.isDown && cursors.left.isDown) {
      //   player.body.velocity.y = -ACCELERATION;
      //   player.body.velocity.x = -ACCELERATION;
      //   starfield.tilePosition.y += 1;
      //   starfield.tilePosition.x -= 1;
      // }
      // else if(cursors.up.isDown && cursors.right.isDown) {
      //   player.body.velocity.y = -ACCELERATION;
      //   player.body.velocity.x = ACCELERATION;
      //   starfield.tilePosition.y += 1;
      //   starfield.tilePosition.x += 1;
      // }

      //  Turn and rotate ship for illusion of "banking"
      // bank = player.body.velocity.x / MAXSPEED;
      // player.scale.x = 1 - Math.abs(bank) / 2;
      // player.angle = bank * 10;



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
  });
