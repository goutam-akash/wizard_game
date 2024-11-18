//const { styleText } = require("util");

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
var player;
var cursors;
var spaceBar;
var background;
var isTweening = false;
let healthPercentage = 1.0; 


function preload() {
    this.load.image('bg', 'assets/War.png');
    this.load.image('road', 'assets/roadnew.png');
    this.load.spritesheet('m1', 'assets/m1/Walk1.png', { frameWidth: 193, frameHeight: 300 });
    this.load.image('redhealth', 'assets/health/red_meter.png');
    this.load.image('bluehealth', 'assets/health/blue_meter.png');
    this.load.image('redfill', 'assets/health/redfill.png');
    this.load.image('bluefill', 'assets/health/bluefill.png');
}

function create() {
    background = this.add.tileSprite(0, 0, 3000, 600, 'bg').setOrigin(0.5, 0);
    this.add.image(750, 60, 'redhealth');
    this.add.image(350, 60, 'bluehealth').setFlipX(true);

    // Create the health bar fills
    redHealthFill = this.add.image(774, 55, 'redfill');
    blueHealthFill = this.add.image(327, 55, 'bluefill').setFlipX(true);

    var platforms = this.physics.add.staticGroup();
    platforms.create(500, 650, 'road').setOrigin(0.5, 0.5);

    player = this.physics.add.sprite(100, 100, 'm1');
    this.physics.add.collider(player, platforms);

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    cursors = this.input.keyboard.createCursorKeys();
    spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
   


    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('m1', { start: 1, end: 6 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'stay',
        frames: [{ key: 'm1', frame: 0 }],
        frameRate: 20
    });

    player.body.setGravityY(300);
    gameOverText = this.add.text(config.width / 2, config.height / 2, 'Game Over', {
        fontSize: '64px',
        fill: '#ff0000', 
    }).setOrigin(0.5).setVisible(false);
    
}

function update() {
    const threshold = config.width * 0.3; // Threshold for moving the background

    // Simulate an attack event (for testing)
    // Make sure the player continues moving while health decreases
    

    if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('walk', true);
        player.setFlipX(false);

        if (player.x > config.width - threshold && !isTweening) {
            isTweening = true;
            this.tweens.add({
                targets: [background, player],
                tilePositionX: background.tilePositionX + 350, // Background moves left
                x: config.width / 3, // Player moves to center
                duration: 1600,
                ease: 'Power2',
                onComplete: () => { isTweening = false; } // Reset tween flag
            });
        }
    } else if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('walk', true);
        player.setFlipX(true);

        if (player.x < threshold && !isTweening) {
            isTweening = true;
            this.tweens.add({
                targets: [background, player],
                tilePositionX: background.tilePositionX - 350, // Background moves right
                x: config.width / 2 + config.width / 3, // Player moves to center
                duration: 1600,
                ease: 'Power2',
                onComplete: () => { isTweening = false; }
            });
        }
    } else {
        player.setVelocityX(0);
        player.anims.play('stay', true);
    }

    if ((cursors.up.isDown) && player.body.touching.down) {
        player.setVelocityY(-330);
    }
    
    if (Phaser.Input.Keyboard.JustDown(spaceBar) && healthPercentage > 0.0) {
        
        
        // Reduce health by 10% each time space is pressed
        healthPercentage -= 0.1;
        blueHealthFill.setCrop(0, 0, blueHealthFill.width * healthPercentage, blueHealthFill.height);
        console.log(healthPercentage);

        // Crop the health bar based on the updated health percentage
        
    }
    
    if (healthPercentage <= 0) {
        gameOverText.setVisible(true); // Display the Game Over screen
    }
}

