angular.module('independence-day')
  .controller('gameplay-ctrl', function() {
    var game = new Phaser.Game(1024, 768, Phaser.AUTO, 'independence-day', { preload: preload, create: create, update: update });

    var starfield;
    var player;
    var boss;

    function preload() {

        game.load.image('background', 'assets/images/spaceshooter/Backgrounds/blue.png');
        game.load.image('player', 'assets/images/spaceshooter/PNG/playerShip1_blue.png');
        game.load.image('boss', 'assets/images/spaceshooter/PNG/ufoRed.png');

    }

    function create() {

      // arcade physics system
      game.physics.startSystem(Phaser.Physics.ARCADE);

      // setting background
      starfield = game.add.tileSprite(0,0, 800, 600, 'background');

      starfield.scale.setTo(2,2);

      // creating player
      player = game.add.sprite(300, 300, 'player');
      player.anchor.setTo(0.5, 0.5);

      // creating boss
      game.add.sprite(300, 0, 'boss');
    }

    function update() {
      starfield.tilePosition.y += 2;

    }
  });
