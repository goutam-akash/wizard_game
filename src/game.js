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
var cursors, shiftKey, aKey, dKey, spaceBar, fKey;
var background;
var isTweening = false;
var isJumping = false;
var healthPercentage = 1.0;
var flameJet;
var isCasting = false;  // Control for casting the spell
var cooldown = 3000;    // Cooldown time in milliseconds (3 seconds)
var lastCastTime = 0;   // Control for the last time the spell was cast

function preload() {
    // Load existing assets
    this.load.image('bg', 'assets/War.png');
    this.load.image('road', 'assets/roadnew.png');
    this.load.spritesheet('m1', 'assets/m1/Walk1.png', { frameWidth: 193, frameHeight: 300 });
    this.load.image('redhealth', 'assets/health/red_meter.png');
    this.load.image('bluehealth', 'assets/health/blue_meter.png');
    this.load.image('redfill', 'assets/health/redfill.png');
    this.load.image('bluefill', 'assets/health/bluefill.png');

    // Load firePlayer animations (idle, walk, run, jump, and flame attack)
    this.load.spritesheet('fire_idle', 'assets/m2/idle_fire.png', { frameWidth: 68, frameHeight: 68 });
    this.load.spritesheet('fire_walk', 'assets/m2/walk_fire.png', { frameWidth: 68, frameHeight: 68 });
    this.load.spritesheet('fire_run', 'assets/m2/run_fire.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('fire_jump', 'assets/m2/jump_fire.png', { frameWidth: 72, frameHeight: 72 });
    this.load.spritesheet('fire_dead', 'assets/m2/dead_fire.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('fire_hurt', 'assets/m2/hurt_fire.png', { frameWidth: 64, frameHeight: 64 });

    // Load the flame jet spell
    this.load.spritesheet('flame_jet_fire', 'assets/m2/flame_jet_fire.png', { frameWidth: 118, frameHeight: 118 });
    this.load.spritesheet('fire_attack1', 'assets/m2/attack1_fire.png', { frameWidth: 76, frameHeight: 76 });

}

function create() {
    // Create the background
    background = this.add.tileSprite(0, 0, 3000, 600, 'bg').setOrigin(0.5, 0);
    this.add.image(750, 60, 'redhealth');
    this.add.image(350, 60, 'bluehealth').setFlipX(true);

    redHealthFill = this.add.image(774, 55, 'redfill');
    blueHealthFill = this.add.image(327, 55, 'bluefill').setFlipX(true);

    var platforms = this.physics.add.staticGroup();
    platforms.create(500, 650, 'road').setOrigin(0.5, 0.5);

    // Create player m1
    player = this.physics.add.sprite(100, 100, 'm1');
    this.physics.add.collider(player, platforms);
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    // Create firePlayer
    firePlayer = this.physics.add.sprite(300, 100, 'fire_idle');
    firePlayer.setScale(2);
    this.physics.add.collider(firePlayer, platforms);
    firePlayer.setCollideWorldBounds(true);
    flameJet = this.add.sprite(firePlayer.x, firePlayer.y, 'flame_jet_fire');
    flameJet.setScale(2);
    flameJet.setVisible(false);

    // FirePlayer animations
    this.anims.create({
        key: 'fire_idle',
        frames: this.anims.generateFrameNumbers('fire_idle', { start: 0, end: 6 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'fire_walk',
        frames: this.anims.generateFrameNumbers('fire_walk', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1
    });

    player.body.setGravityY(300);
    gameOverText = this.add.text(config.width / 2, config.height / 2, 'Game Over', {
        fontSize: '64px',
        fill: '#ff0000', 
    }).setOrigin(0.5).setVisible(false);
    
    this.anims.create({
        key: 'fire_run',
        frames: this.anims.generateFrameNumbers('fire_run', { start: 0, end: 5 }),
        frameRate: 12,
        repeat: -1
    });

    this.anims.create({
        key: 'fire_jump',
        frames: this.anims.generateFrameNumbers('fire_jump', { start: 0, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'fire_attack1',
        frames: this.anims.generateFrameNumbers('fire_attack1', { start: 0, end: 5 }), // 6 frames
        frameRate: 10,
        repeat: 0 // Do not repeat
    });

    this.anims.create({
        key: 'fire_dead',
        frames: this.anims.generateFrameNumbers('fire_dead', { start: 0, end: 5 }), // 6 frames
        frameRate: 3,
        repeat: 0
    });

    this.anims.create({
        key: 'fire_hurt',
        frames: this.anims.generateFrameNumbers('fire_hurt', { start: 0, end: 2 }), // 3 frames
        frameRate: 3,
        repeat: 0
    });

    firePlayer.play('fire_idle');

    // Flame jet spell animation
    this.anims.create({
        key: 'flame_jet',
        frames: this.anims.generateFrameNumbers('flame_jet_fire', { start: 0, end: 13 }), // 14 frames (0 to 13)
        frameRate: 15,
        repeat: 0 // The spell should only happen once per activation
    });

    // Add control keys
    cursors = this.input.keyboard.createCursorKeys();
    shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    fKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F); // Key for casting the spell
    attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);  // Key 1 for attack
    hurtKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);   // Key 2 to get hurt
    deadKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE); // Key 3 to die
    aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
}
var isAttacking = false;
var isHurt = false;
var isDead = false;

function update() {
    const currentTime = this.time.now;
    if (isDead || isHurt || isAttacking) {
        // If the player is dead, hurt, or attacking, prevent other controls
        return;
    }
    // FirePlayer controls
    if (shiftKey.isDown && (cursors.right.isDown || cursors.left.isDown)) {
        firePlayer.setVelocityX(cursors.right.isDown ? 240 : -240);
        firePlayer.anims.play('fire_run', true);
        firePlayer.setFlipX(cursors.left.isDown);
    } else if (cursors.right.isDown) {
        firePlayer.setVelocityX(160);
        firePlayer.anims.play('fire_walk', true);
        firePlayer.setFlipX(false);
    } else if (cursors.left.isDown) {
        firePlayer.setVelocityX(-160);
        firePlayer.anims.play('fire_walk', true);
        firePlayer.setFlipX(true);
    } else if (firePlayer.body.touching.down && spaceBar.isDown && !isJumping) {
        firePlayer.setVelocityY(-330); 
        firePlayer.anims.play('fire_jump', true);
        isJumping = true;
    } else if (!firePlayer.body.touching.down) {
        firePlayer.anims.play('fire_jump', true);
    } else {
        firePlayer.setVelocityX(0);
        firePlayer.anims.play('fire_idle', true);
        isJumping = false;
    }

    // Cast the fire spell (F key) with cooldown
    if (Phaser.Input.Keyboard.JustDown(fKey) && !isCasting && currentTime - lastCastTime >= cooldown) {
        isCasting = true;
        lastCastTime = currentTime;

        // Position the flameJet based on firePlayer's position
        flameJet.setPosition(firePlayer.x + (firePlayer.flipX ? -60 : 60), firePlayer.y);
        flameJet.setFlipX(firePlayer.flipX);  // Flip the spell if the player is facing left
        flameJet.setVisible(true);
        flameJet.anims.play('flame_jet');

        flameJet.on('animationcomplete', () => {
            flameJet.setVisible(false);
            isCasting = false;
        });
    }

    // Attacking with Key 1
    if (Phaser.Input.Keyboard.JustDown(attackKey)) {
        isAttacking = true;
        firePlayer.anims.play('fire_attack1', true);
        firePlayer.on('animationcomplete', () => {
            isAttacking = false;
        });
    }

    // Taking damage with Key 2
    if (Phaser.Input.Keyboard.JustDown(hurtKey)) {
        isHurt = true;
        firePlayer.anims.play('fire_hurt', true);
        firePlayer.on('animationcomplete', () => {
            isHurt = false;
        });
    }

    // Dying with Key 3
    if (Phaser.Input.Keyboard.JustDown(deadKey)) {
        isDead = true;
        firePlayer.anims.play('fire_dead', true);
    }
}
