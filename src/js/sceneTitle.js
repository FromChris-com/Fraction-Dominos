import Phaser from 'phaser';
import game from './index.js';


export default class sceneTitle extends Phaser.Scene {
    constructor(){
        super("sceneTitle");

    }

    create(){
        //console.log("Title Loaded")
        let bg = this.add.tileSprite(0,0, game.config.width, game.config.height, "bg");
        bg.setOrigin(0,0);

        //decorations
        this.add.image(game.config.width - 20, game.config.height - 55, 'deco1');
        this.add.image(25, game.config.height - 55, 'deco2');

        //intro Animation Dominos
        this.introAnim = this.add.sprite(game.config.width / 2 + 32, game.config.height * 0.82,'intro', 'idle_00.png');

        let introIdle = this.anims.generateFrameNames('intro',{
            start: 0, end: 7, zeroPad: 2,
            prefix: 'idle_', suffix: '.png',
        });

        this.anims.create({key: 'idle', frames: introIdle, frameRate: 10, repeat: -1});


        let introJump = this.anims.generateFrameNames('intro',{
            start: 1, end: 12, zeroPad: 2,
            prefix: 'intro_', suffix: '.png',
        });

        this.anims.create({key: 'jump', frames: introJump, frameRate: 8, repeat: 0});

        this.introAnim.play('idle');



        //title logo
        this.add.sprite(game.config.width/2,64, "title").setScale(0.85).setOrigin(0.5,0);
        
        let btn_start = this.add.sprite(game.config.width/2,game.config.height * 0.55, "btn_start");
        btn_start.setInteractive();

        btn_start.on("pointerdown", function(pointer){
            this.scene.get("sceneMain").play_sfx("grab");
            this.play_music("music_MacNCheese")
            btn_start.destroy();

            this.scene.get("sceneMain").play_audio("title");

            this.time.addEvent({ 
                delay: 4000,
                callback: ()=> this.scene.get("sceneMain").play_audio("intro"), 
                loop: false,
                callbackScope: this,
            });
            
            this.time.addEvent({delay: 7300,callback: () => this.introAnim.play('jump')});

        },this);


        this.pulse = this.tweens.add({
            targets: btn_start,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 1000,
            yoyo: true,
            loop: -1,
            ease: Phaser.Math.Easing.Quadratic.InOut
        });
    }

    play_music(name){
        if (game.registry.values.music == null){
            game.registry.values.music = this.sound.add("sfx_" + name,{volume: 0.02, loop: true});
            game.registry.values.music.play(); 
        } 
    }
    
    gameStart(){
        this.scene.start("sceneMain");
    };

}