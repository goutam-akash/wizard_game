var config = {
    type: Phaser.AUTO,
    width: 1067,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

var player, firePlayer;
var cursors, aKey, dKey, wKey, shiftKey;
var background;
var redHealthFill, blueHealthFill;
var isAttacking = false;
var redHealth = 100, blueHealth = 100; // Initial health for both players
var gameOverText;

function preload() {
    this.load.image('bg', 'assets/War.png');
    this.load.image('road', 'assets/roadnew.png');
    this.load.spritesheet('m1', 'assets/m1/Walk1.png', { frameWidth: 193, frameHeight: 300 });
    this.load.image('redhealth', 'assets/health/red_meter.png');
    this.load.image('bluehealth', 'assets/health/blue_meter.png');
    this.load.image('redfill', 'assets/health/redfill.png');
    this.load.image('bluefill', 'assets/health/bluefill.png');
    this.load.spritesheet('fire_walk', 'assets/m2/walk_fire123.png', { frameWidth: 108, frameHeight: 300 });
    this.load.spritesheet('fire_attack', 'assets/m2/flame_new.png', { frameWidth: 504, frameHeight: 325 });
    this.load.spritesheet('ice_hurt','assets/m1/Hurt.png', { frameWidth: 210, frameHeight: 275 });
    this.load.spritesheet('ice_dead','assets/m1/dead.png', { frameWidth: 406, frameHeight: 300 });
    this.load.spritesheet('fire_hurt', 'assets/m2/hurt_fire1.png', { frameWidth: 300, frameHeight: 300 });
    this.load.spritesheet('fire_dead', 'assets/m2/dead_fire1.png', { frameWidth: 300, frameHeight: 300 });
}

function create() {
    background = this.add.tileSprite(0, 0, 3000, 600, 'bg').setOrigin(0.5, 0);
    redHealthFill = this.add.image(774, 55, 'redfill');
    blueHealthFill = this.add.image(327, 55, 'bluefill')
    this.add.image(750, 60, 'redhealth');
    this.add.image(350, 60, 'bluehealth').setFlipX(true);

    

    var platforms = this.physics.add.staticGroup();
    platforms.create(500, 650, 'road').setOrigin(0.5, 0.5);

    player = this.physics.add.sprite(167, 100, 'm1');
    player.setBounce(0.2).setCollideWorldBounds(true);
    this.physics.add.collider(player, platforms);

    firePlayer = this.physics.add.sprite(900, 100, 'fire_walk').setFlipX(true);
    firePlayer.setBounce(0.2).setCollideWorldBounds(true);
    this.physics.add.collider(firePlayer, platforms);
    gameOverText = this.add.text(400, 300, 'GAME OVER', { fontSize: '64px', fill: '#ff0000' }).setOrigin(0.5, 0.5);
    gameOverText.setVisible(false); // Initially hidden

    // Animations
    this.anims.create({
        key: 'fire_walk',
        frames: this.anims.generateFrameNumbers('fire_walk', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'fire_attack',
        frames: this.anims.generateFrameNumbers('fire_attack', { start: 0, end: 14 }),
        frameRate: 10,
        repeat: 0 // Play the attack animation once
    });
    this.anims.create({
        key: 'm1',
        frames: this.anims.generateFrameNumbers('m1', { start: 0, end: 6 }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'ice_hurt',
        frames: this.anims.generateFrameNumbers('ice_hurt', { start: 0, end: 4 }),
        frameRate: 10,
        repeat: 0 // Play the hurt animation once
    });
    this.anims.create({
        key: 'ice_dead',
        frames: this.anims.generateFrameNumbers('ice_dead', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: 0 // Play the hurt animation once
    });
    this.anims.create({
        key: 'fire_hurt',
        frames: this.anims.generateFrameNumbers('fire_hurt', { start: 0, end: 2 }),
        frameRate: 10,
        repeat: 0 // Play the hurt animation once
    });
    
    this.anims.create({
        key: 'fire_dead',
        frames: this.anims.generateFrameNumbers('fire_dead', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: 0 // Play the hurt animation once
    });
    
    
    cursors = this.input.keyboard.createCursorKeys();
    aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
}

function update() {
    // Movement for firePlayer
    if (!isAttacking) {
        if (cursors.right.isDown) {
            firePlayer.setVelocityX(160);
            firePlayer.anims.play('fire_walk', true);
            firePlayer.setFlipX(false);
        } else if (cursors.left.isDown) {
            firePlayer.setVelocityX(-160);
            firePlayer.anims.play('fire_walk', true);
            firePlayer.setFlipX(true);
        } else {
            firePlayer.setVelocityX(0);
            firePlayer.anims.stop();
        }

        // Jump for firePlayer using UP arrow
        if (cursors.up.isDown && firePlayer.body.touching.down) {
            firePlayer.setVelocityY(-330);
        }
    }

    // Fire attack for firePlayer using SHIFT
    if (shiftKey.isDown && !isAttacking) {
        isAttacking = true;
        firePlayer.anims.play('fire_attack', true);
        firePlayer.on('animationcomplete', () => {
            isAttacking = false; // Reset attack state after animation ends
        });

        // Collision check for attack
        this.physics.overlap(firePlayer, player, hitPlayer, null, this);
    }

    // Movement for player
    if (aKey.isDown) {
        player.setVelocityX(-160);
        player.anims.play('m1', true); // Update to player animation if needed
        player.setFlipX(true);
    } else if (dKey.isDown) {
        player.setVelocityX(160);
        player.anims.play('m1', true); // Update to player animation if needed
        player.setFlipX(false);
    } else {
        player.setVelocityX(0);
        player.anims.stop();
    }

    // Jump for player using W key
    if (wKey.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }

    // Update health bars using setCrop
    redHealthFill.setCrop(0, 0, redHealth * 5, redHealthFill.height);
    blueHealthFill.setFlipX(true);
    // Calculate the width based on the health percentage
    var cropWidth = blueHealth * 2.5;  // Adjust based on scaling factor

// Set origin to the right (to crop from left)
  // Align the health bar to the right

// Set the crop so that the left part is cut, but the right corner stays intact
    blueHealthFill.setCrop(blueHealthFill.width - cropWidth, 0, cropWidth, blueHealthFill.height);

}

// Collision function for fire attack
// Adjust this part to ensure the health bar updates properly:
function hitPlayer(firePlayer, player) {
    if (isAttacking) {
        // Reduce health by 10% when firePlayer hits player
        blueHealth -= 10;

        // Ensure health doesn't go below 0
        if (blueHealth < 0) {
            blueHealth = 0;
        }

        // Update the health bar's crop based on the new health percentage
        blueHealthFill.setCrop(0, 0, blueHealth * (blueHealthFill.width / 100), blueHealthFill.height);

        // Play hurt animation
        if (blueHealth > 0) {
            player.anims.play('ice_hurt', true);
        } else {
            // Play death animation and show Game Over text
            player.anims.play('ice_dead', true);
            gameOverText.setVisible(true);
            
        }
    }
}
