angular.module('independence-day')
.controller('p2-gameplay-ctrl', function() {
  // var game = new Phaser.Game(1640, 807, Phaser.AUTO, 'independence-day', { preload: preload, create: create, update: update });

  function preload (){
    this.game.state.start("Main");
    this.game.load.image('playerShip', 'assets/images/spaceshooter/PNG/playerShip1_blue.png');
    this.game.load.physics('playerShip_physics', 'assets/playerShip_physics.json');
  }

  function create() {
    var independence = this;

    // Set the background colour to blue
    independence.game.stage.backgroundColor = '#ccddff';

    // Start the P2 Physics Engine
    independence.game.physics.startSystem(Phaser.Physics.P2JS);

    // Set the gravity
    independence.game.physics.p2.gravity.y = 1000;

    // Create a random generator
    var seed = Date.now();
    independence.random = new Phaser.RandomDataGenerator([seed]);

  }

  function update() {

  }

  function render() {

  }
});
