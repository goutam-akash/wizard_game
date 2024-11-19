var config = {
  type: Phaser.AUTO,
  width: 1067,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var game = new Phaser.Game(config);

var icePlayer, firePlayer;
var cursors, aKey, dKey, wKey, shiftKey, spaceKey;
var background;
var redHealthFill, blueHealthFill;
var isFireAttacking = false;
var isIceAttacking = false;
var redHealth = 100,
  blueHealth = 100; // Initial health for both players
var gameOverText;

function preload() {
  this.load.image("bg", "assets/War.png");
  this.load.image("road", "assets/roadnew.png");
  this.load.image("redhealth", "assets/health/red_meter.png");
  this.load.image("bluehealth", "assets/health/blue_meter.png");
  this.load.image("redfill", "assets/health/redfill.png");
  this.load.image("bluefill", "assets/health/bluefill.png");
  this.load.spritesheet("icePlayerWalk", "assets/icePlayer/Walk1.png", {
    frameWidth: 193,
    frameHeight: 300,
  });
  this.load.spritesheet("ice_attack", "assets/icePlayer/attack_ice.png", {
    frameWidth: 514,
    frameHeight: 300,
  });
  this.load.spritesheet("ice_dead", "assets/icePlayer/dead.png", {
    frameWidth: 406,
    frameHeight: 300,
  });
  this.load.spritesheet("ice_hurt", "assets/icePlayer/Hurt.png", {
    frameWidth: 210,
    frameHeight: 275,
  });
  this.load.spritesheet("fire_walk", "assets/firePlayer/walk_fire123.png", {
    frameWidth: 108,
    frameHeight: 300,
  });
  this.load.spritesheet("fire_attack", "assets/firePlayer/flame_new.png", {
    frameWidth: 504,
    frameHeight: 325,
  });
  this.load.spritesheet("fire_hurt", "assets/firePlayer/hurt_fire1.png", {
    frameWidth: 300,
    frameHeight: 300,
  });
  this.load.spritesheet("fire_dead", "assets/firePlayer/dead_fire1.png", {
    frameWidth: 300,
    frameHeight: 300,
  });
}

function create() {
  // Background and health bars
  background = this.add.tileSprite(0, 0, 3000, 600, "bg").setOrigin(0.5, 0);
  redHealthFill = this.add.image(774, 55, "redfill");
  blueHealthFill = this.add.image(327, 55, "bluefill").setFlipX(true);
  this.add.image(750, 60, "redhealth");
  this.add.image(350, 60, "bluehealth").setFlipX(true);

  var platforms = this.physics.add.staticGroup();
  platforms.create(500, 650, "road").setOrigin(0.5, 0.5);

  // Player setup
  icePlayer = this.physics.add.sprite(167, 100, "icePlayerWalk");
  icePlayer.setBounce(0.2).setCollideWorldBounds(true);
  this.physics.add.collider(icePlayer, platforms);

  firePlayer = this.physics.add.sprite(900, 100, "fire_walk").setFlipX(true);
  firePlayer.setBounce(0.2).setCollideWorldBounds(true);
  this.physics.add.collider(firePlayer, platforms);

  gameOverText = this.add
    .text(400, 300, "GAME OVER", { fontSize: "64px", fill: "#ff0000" })
    .setOrigin(0.5, 0.5);
  gameOverText.setVisible(false); // Initially hidden

  // Animations
  this.anims.create({
    key: "fire_walk",
    frames: this.anims.generateFrameNumbers("fire_walk", { start: 0, end: 5 }),
    frameRate: 10,
    repeat: -1,
  });
  this.anims.create({
    key: "fire_attack",
    frames: this.anims.generateFrameNumbers("fire_attack", {
      start: 0,
      end: 14,
    }),
    frameRate: 10,
    repeat: 0,
  });
  this.anims.create({
    key: "icePlayerWalk",
    frames: this.anims.generateFrameNumbers("icePlayerWalk", {
      start: 0,
      end: 6,
    }),
    frameRate: 10,
    repeat: -1,
  });
  this.anims.create({
    key: "ice_attack",
    frames: this.anims.generateFrameNumbers("ice_attack", { start: 0, end: 8 }),
    frameRate: 10,
    repeat: 0,
  });
  this.anims.create({
    // Input bindings
    key: "ice_hurt",
    frames: this.anims.generateFrameNumbers("ice_hurt", { start: 0, end: 4 }),
    frameRate: 10,
    repeat: 0, // Play the hurt animation once
  });
  this.anims.create({
    key: "ice_dead",
    frames: this.anims.generateFrameNumbers("ice_dead", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: 0, // Play the hurt animation once
  });
  this.anims.create({
    key: "fire_hurt",
    frames: this.anims.generateFrameNumbers("fire_hurt", { start: 0, end: 2 }),
    frameRate: 10,
    repeat: 0, // Play the hurt animation once
  });

  this.anims.create({
    key: "fire_dead",
    frames: this.anims.generateFrameNumbers("fire_dead", { start: 0, end: 5 }),
    frameRate: 10,
    repeat: 0, // Play the hurt animation once
  });

  cursors = this.input.keyboard.createCursorKeys();
  aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  console.log("Space key initialized:", spaceKey); // Debugging


    this.input.keyboard.on('keydown-SHIFT', () => {
        if (!isAttacking) {
            fireAttackSound.play();
        }
    });

    console.log("Space key initialized:", spaceKey); // Debugging
}
function update() {
  // Player movement
  if (aKey.isDown) {
    icePlayer.setVelocityX(-160);
    icePlayer.anims.play("icePlayerWalk", true);
    icePlayer.setFlipX(true);
  } else if (dKey.isDown) {
    icePlayer.setVelocityX(160);
    icePlayer.anims.play("icePlayerWalk", true);
    icePlayer.setFlipX(false);
  } else {
    icePlayer.setVelocityX(0);
    icePlayer.anims.stop();
  }

  if (wKey.isDown && icePlayer.body.touching.down) {
    icePlayer.setVelocityY(-330);
  }

  // Ice attack for player
  if (spaceKey.isDown && !isIceAttacking) {
    console.log("ice attack initiated"); // Debugging
    isIceAttacking = true;
    console.log("Playing ice_attack animation"); // Debugging
    // Play fire attack animation
    icePlayer.anims.play("ice_attack", true);

    // Listen for animation completion
    icePlayer.on("animationcomplete", (animation) => {
      if (animation.key === "ice_attack") {
        console.log("ice attack animation complete"); // Debugging
        isIceAttacking = false; // Reset attack state
      }
    });

    // Check collision during the fire attack
    this.physics.overlap(icePlayer, firePlayer, hitFirePlayer, null, this);
  }

  // FirePlayer movement
  if (!isFireAttacking) {
    if (cursors.right.isDown) {
      firePlayer.setVelocityX(160);
      firePlayer.anims.play("fire_walk", true);
      firePlayer.setFlipX(false);
    } else if (cursors.left.isDown) {
      firePlayer.setVelocityX(-160);
      firePlayer.anims.play("fire_walk", true);
      firePlayer.setFlipX(true);
    } else {
      firePlayer.setVelocityX(0);
      firePlayer.anims.stop();
    }

    if (cursors.up.isDown && firePlayer.body.touching.down) {
      firePlayer.setVelocityY(-330);
    }
  }

  // Fire attack for firePlayer
  if (shiftKey.isDown && !isFireAttacking) {
    console.log("Fire attack initiated"); // Debugging
    isFireAttacking = true;

    // Play fire attack animation
    firePlayer.anims.play("fire_attack", true);

    // Listen for animation completion
    firePlayer.on("animationcomplete", (animation) => {
      if (animation.key === "fire_attack") {
        console.log("Fire attack animation complete"); // Debugging
        isFireAttacking = false; // Reset attack state
      }
    });

    // Check collision during the fire attack
    this.physics.overlap(firePlayer, icePlayer, hitPlayer, null, this);
  }

  // Update health bars
  function updateHealthBars() {
    // Update red health bar
    var redCropWidth = redHealth * 5; // Adjust multiplier if necessary
    redHealthFill.setCrop(
      0,
      0,
      Math.max(0, redCropWidth),
      redHealthFill.height
    ); // Ensure no negative width

    // Update blue health bar
    var blueCropWidth = blueHealth * 2.5; // Adjust multiplier if necessary
    blueHealthFill.setCrop(
      blueHealthFill.width - Math.max(0, blueCropWidth),
      0,
      Math.max(0, blueCropWidth),
      blueHealthFill.height
    );
  }

  // Call this function inside the update function
  updateHealthBars();

    // Fire attack for firePlayer
    if (shiftKey.isDown && !isAttacking) {
        console.log("Fire attack initiated");
        isAttacking = true;
    
        // Play fire attack animation
        firePlayer.anims.play('fire_attack', true);
    
        // Verificar colisão durante a animação
        this.physics.overlap(firePlayer, player, hitPlayer, null, this);
    
        // Listen for animation completion
        firePlayer.on('animationcomplete', (animation) => {
            if (animation.key === 'fire_attack') {
                console.log("Fire attack animation complete");
                isAttacking = false;
            }
        });
    }

    // Update health bars
    function updateHealthBars() {
        // Update red health bar
        var redCropWidth = redHealth * 5; // Adjust multiplier if necessary
        redHealthFill.setCrop(0, 0, Math.max(0, redCropWidth), redHealthFill.height); // Ensure no negative width
    
        // Update blue health bar
        var blueCropWidth = blueHealth * 2.5; // Adjust multiplier if necessary
        blueHealthFill.setCrop(blueHealthFill.width - Math.max(0, blueCropWidth), 0, Math.max(0, blueCropWidth), blueHealthFill.height);
    }
    
    // Call this function inside the update function
    updateHealthBars();
    
}

function hitFirePlayer(icePlayer, firePlayer) {
  if (isIceAttacking) {
    // Reduce red health
    redHealth -= 10;

    console.log("Red health reduced to:", redHealth); // Debugging

    // Ensure health doesn't go below 0
    if (redHealth < 0) {
      redHealth = 0;
    }

    // Update the health bar's crop based on the new health percentage
    redHealthFill.setCrop(
      0,
      0,
      redHealth * (redHealthFill.width / 100),
      redHealthFill.height
    );

    // Play hurt animation
    if (redHealth > 0) {
      firePlayer.anims.play("fire_hurt", true);
    } else {
      // Play death animation and show Game Over text
      firePlayer.anims.play("fire_dead", true);
      gameOverText.setVisible(true);
    }
  }
}

function hitPlayer(firePlayer, icePlayer) {
  if (isFireAttacking) {
    blueHealth -= 10;

    console.log("Blue health reduced to:", blueHealth); // Debugging

    // Ensure health doesn't go below 0
    if (blueHealth < 0) {
      blueHealth = 0;
    }

    // Update the health bar's crop based on the new health percentage
    blueHealthFill.setCrop(
      0,
      0,
      blueHealth * (blueHealthFill.width / 100),
      blueHealthFill.height
    );

    // Play hurt animation
    if (blueHealth > 0) {
      icePlayer.anims.play("ice_hurt", true);
    } else {
      // Play death animation and show Game Over text
      icePlayer.anims.play("ice_dead", true);
      gameOverText.setVisible(true);
    }
  }
}
