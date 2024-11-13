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
var isCasting = false;  // Controle de lançamento da magia
var cooldown = 3000;    // Tempo de recarga em milissegundos (3 segundos)
var lastCastTime = 0;   // Controle do último tempo de lançamento da magia

function preload() {
    // Carregar os assets existentes
    this.load.image('bg', 'assets/War.png');
    this.load.image('road', 'assets/roadnew.png');
    this.load.spritesheet('m1', 'assets/m1/Walk1.png', { frameWidth: 193, frameHeight: 300 });
    this.load.image('redhealth', 'assets/health/red_meter.png');
    this.load.image('bluehealth', 'assets/health/blue_meter.png');
    this.load.image('redfill', 'assets/health/redfill.png');
    this.load.image('bluefill', 'assets/health/bluefill.png');

    // Carregar as animações do firePlayer (idle, walk, run, jump, e flame attack)
    this.load.spritesheet('fire_idle', 'assets/m2/idle_fire.png', { frameWidth: 68, frameHeight: 68 });
    this.load.spritesheet('fire_walk', 'assets/m2/walk_fire.png', { frameWidth: 68, frameHeight: 68 });
    this.load.spritesheet('fire_run', 'assets/m2/run_fire.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('fire_jump', 'assets/m2/jump_fire.png', { frameWidth: 72, frameHeight: 72 });

    // Carregar a magia flame jet
    this.load.spritesheet('flame_jet_fire', 'assets/m2/flame_jet_fire.png', { frameWidth: 118, frameHeight: 118 });
}

function create() {
    // Criação do cenário
    background = this.add.tileSprite(0, 0, 3000, 600, 'bg').setOrigin(0.5, 0);
    this.add.image(750, 60, 'redhealth');
    this.add.image(350, 60, 'bluehealth').setFlipX(true);

    redHealthFill = this.add.image(774, 55, 'redfill');
    blueHealthFill = this.add.image(327, 55, 'bluefill').setFlipX(true);

    var platforms = this.physics.add.staticGroup();
    platforms.create(500, 650, 'road').setOrigin(0.5, 0.5);

    // Criação do player m1
    player = this.physics.add.sprite(100, 100, 'm1');
    this.physics.add.collider(player, platforms);
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    // Criação do firePlayer
    firePlayer = this.physics.add.sprite(300, 100, 'fire_idle');
    firePlayer.setScale(2);
    this.physics.add.collider(firePlayer, platforms);
    firePlayer.setCollideWorldBounds(true);

    // Animações do firePlayer
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

    firePlayer.play('fire_idle');

    // Animação de magia (flame jet)
    this.anims.create({
        key: 'flame_jet',
        frames: this.anims.generateFrameNumbers('flame_jet_fire', { start: 0, end: 13 }), // 14 frames (0 a 13)
        frameRate: 15,
        repeat: 0 // A magia só deve acontecer uma vez por ativação
    });

    // Adiciona as teclas de controle
    cursors = this.input.keyboard.createCursorKeys();
    shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    fKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F); // Tecla para lançar a magia

    aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
}

function update() {
    const currentTime = this.time.now;

    // Controles do firePlayer
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

    // Lançar a magia de fogo (tecla F) com cooldown
    if (Phaser.Input.Keyboard.JustDown(fKey) && !isCasting && currentTime - lastCastTime >= cooldown) {
        isCasting = true;
        lastCastTime = currentTime;

        // Criação da magia flameJet
        flameJet = this.add.sprite(firePlayer.x + (firePlayer.flipX ? -60 : 60), firePlayer.y, 'flame_jet_fire');
        flameJet.setScale(2);
        flameJet.anims.play('flame_jet', true);

        // Destrói a magia após a animação
        flameJet.on('animationcomplete', () => {
            flameJet.destroy();
            isCasting = false;  // Permite lançar a magia novamente após a destruição
        });
    }
}
