import Phaser from 'phaser';
import game from './index.js';


export default class sceneLoader extends Phaser.Scene {
    constructor() { // on scene creation
        //super('sceneLoader');
        super({
            key: "sceneLoader",
            active: true,
            pack:{
                files: [{
                    type: "image",
                    key: "logo",
                    url: "./espark/logo.png"
                }
                ]
            }
        });
            
    }
    
   

    preload() //load images & sounds
    {
        this.loadFont("arial_bold", "./fonts/arial_bold.ttf");
        this.loadFont("free_serif", "./fonts/free_serif.otf");
        this.add.image(game.config.width/2,game.config.height/3 + 50,"logo").setScale(1);
        

    	this.load.path = "./img/";
        const arr_images = [ 
         "bg", 'deco1', 'deco2', 'line', 'clock', 'clockHighlight',
        'hDomino', 'vDomino', 'btn_replay',
        'btn_start','fx_star', 'highlight1', 'highlight2',
        'title','tracker0','tracker1', 
        ];

        for (var i = 0; i < arr_images.length; i++){
            this.load.image(arr_images[i],arr_images[i] + ".png");
            //console.log(arr_images[i])
        }

        this.load.path = "./img/spritesheets";
        this.load.multiatlas('intro','/intro.json','./img/spritesheets');
        

        this.load.path = "./voice/";
        const arr_audio = ["c1","c2","c3","directions","end","help","intro","title","w1","w2"];

        for (var i = 0; i < arr_audio.length; i++){
            this.load.audio(arr_audio[i],arr_audio[i] + ".mp3");
            //console.log(arr_audio[i])
        }


        this.load.path = "./sounds/";
        const arr_sfx = ["sfx_grab","sfx_arrowShoot","sfx_correct0","sfx_correct1","sfx_powerUp","sfx_wrong","sfx_tile","sfx_win"];

        for (var i = 0; i < arr_sfx.length; i++){
            this.load.audio(arr_sfx[i],arr_sfx[i] + ".mp3");
            //console.log(arr_audio[i])
        }

        this.load.audio("sfx_music_MacNCheese","/sfx_music_MacNCheese.mp3");


        //Progress bar 
        var progressBox = this.add.graphics();
        var progressBar = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.5);
        progressBox.fillRect(game.config.width/2 - 160 , game.config.height/2 + 150, 320, 16);
        

        this.load.on('progress', function (value) {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(game.config.width/2 - 160, game.config.height/2 + 154, 320 * value, 8);

        });

        /* //Possible use in the future
        this.load.on('fileprogress', function (file) {
            console.log(file.src);
        });
        */

        this.load.on('complete', function () {
            //console.log('complete');
            this.scene.start("sceneTitle");
            //this.scene.start("sceneMain");
            //this.scene.start("sceneEnd");
        },this);
    }

    create(){}

    loadFont(name, url) {
        var newFont = new FontFace(name, `url(${url})`);
        newFont.load().then(function (loaded) {
            document.fonts.add(loaded);
        }).catch(function (error) {
            return error;
        });
    }


}





