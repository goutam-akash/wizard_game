// Importando a spritesheet e o arquivo JSON
export default class Player01 {
    constructor(scene, x, y, spriteKey) {
        this.scene = scene; // Referência à cena
        this.sprite = this.scene.physics.add.sprite(x, y, spriteKey);
        this.sprite.setBounce(0.2);
        this.sprite.setCollideWorldBounds(true);
     
        // Configurações do player
        this.createAnimations(); // Criar animações
        this.sprite.anims.play('idle');
        // Criando um grupo de teclas para controle
        this.cursors = this.scene.input.keyboard.createCursorKeys();
    }

    createAnimations() {
        // Criando animações com base nos frames do arquivo JSON
        this.scene.anims.create({
            key: 'walk',
            frames: this.scene.anims.generateFrameNames('fire_player', {
                start: 0,
                end: 0, // Atualize para o número de frames para a animação de walk
                prefix: 'Walk_',
                suffix: '.png'
            }),
            frameRate: 10,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'idle',
            frames: [{ key: 'fire_player', frame: 'Idle.png' }],
            frameRate: 20
        });

        this.scene.anims.create({
            key: 'hurt',
            frames: [{ key: 'fire_player', frame: 'Hurt.png' }],
            frameRate: 20
        });

        this.scene.anims.create({
            key: 'run',
            frames: this.scene.anims.generateFrameNames('fire_player', {
                start: 0,
                end: 0, // Atualize para o número de frames para a animação de run
                prefix: 'Run_',
                suffix: '.png'
            }),
            frameRate: 10,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'jump',
            frames: [{ key: 'fire_player', frame: 'Jump.png' }],
            frameRate: 20
        });

        this.scene.anims.create({
            key: 'dead',
            frames: [{ key: 'fire_player', frame: 'Dead.png' }],
            frameRate: 20
        });

        this.scene.anims.create({
            key: 'attack',
            frames: this.scene.anims.generateFrameNames('fire_player', {
                start: 0,
                end: 1, // Atualize para o número de frames para a animação de attack
                prefix: 'Attack_',
                suffix: '.png'
            }),
            frameRate: 10,
            repeat: 0 // Não repetir após a animação de ataque
        });
    }

    update() {
        // Controle do player
        if (this.cursors.left.isDown) {
            this.sprite.setVelocityX(-160);
            this.sprite.anims.play('walk', true);
        } else if (this.cursors.right.isDown) {
            this.sprite.setVelocityX(160);
            this.sprite.anims.play('walk', true); // Ou use 'run' se necessário
        } else {
            this.sprite.setVelocityX(0);
            this.sprite.anims.play('idle');
        }

        if (this.cursors.up.isDown && this.sprite.body.touching.down) {
            this.sprite.setVelocityY(-330);
            this.sprite.anims.play('jump');
        }

        // Lógica para ataque
        if (this.cursors.space.isDown) {
            this.sprite.anims.play('attack');
        }
    }
    takeDamage() {
        // Lógica de dano
        console.log('Player took damage!');
        this.sprite.anims.play('hurt'); // Exemplo de animação de dano
    }
}

