// src/index.js
import Player01 from './Player01';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Inicializa o jogo com a configuração
new Phaser.Game(config);

let player1;
let cursors;

function preload() {
    this.load.atlas('fire_player', 'assets/characters/fire_wizard/fire_player.png', 'assets/characters/fire_wizard/fire_player.json');
    // Adicione outras cargas de ativos aqui
}

function create() {
    cursors = this.input.keyboard.createCursorKeys();
    player1 = new Player01(this, 100, 450, 'fire_player');
}

function update() {
    if (player1) {
        player1.update(cursors);
        if (this.input.keyboard.checkDown(this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE), 500)) {
            player1.takeDamage();
        }
    }
}
