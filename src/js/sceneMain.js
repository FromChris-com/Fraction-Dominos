
import game from "./index.js";
import Phaser from "phaser";

const tt = 42; //text offsets for dominos

export default class sceneMain extends Phaser.Scene {
  constructor() { // on scene creation
    super("sceneMain");
  }

  preload() //load images & sounds
  {

    this.topText = [];
    this.nomText = [];
    this.line = [];
    this.domText = [];
    this.questionNumber = 0;
    this.fraction;
    this.attempts = 0; //wrong count
    this.isEnd = false;

    this.num_top = []; //Building out the array for randomized questions see createNumbers();
    this.num_nom = [];
    this.num_dom = [];

    this.placeX; //coords of the last placed dominos
    this.placeY;
    this.placeHorizontal = true; //is the prev domino horizontal or vertical

    this.debug = 0;
    //Particle Manager
    game.registry.values.fx_particles = this.add.particles("fx_star");

    this.introAnim;
  }




  create() { // define objects



    this.createNumbers();

    //Create Layers
    const layer_bg = this.add.layer();
    const layer_main= this.add.layer();
    const layer_hud = this.add.layer();

    //this.cameras.main.zoom = 0.5;

    //background
    let bg = this.add.tileSprite(0,0, game.config.width, game.config.height, "bg").setDepth(-2);
    bg.setOrigin(0,0);

    //decorations
    this.add.image(game.config.width - 20, game.config.height - 55, "deco1");
    this.add.image(25, game.config.height - 55, "deco2");

    //this.font_btn_style = {font: '34px open_sans', fill: "black"};
    this.font_btn_style = {font: "32px free_serif", fill: "black"};
    this.font_timer_style = {font: "48px free_serif", fill: "White"};
    this.font_Question_style = {font: "64px arial_bold", fill: "White"};

    this.button = [];
    this.tracker = [];
    this.startPosition = [];


    //Star trackers
    for (let i = 0; i < 8; i++){

      const xx = game.config.width;

      this.tracker[i] = this.add.sprite((i*100) + 450, 40, "tracker0");

    }

    //For the stopwatch
    this.timeCount = 0;
    this.textTime =  this.add.text(game.config.width - 100, 100, this.timeCount, this.font_timer_style).setOrigin(0.5,0.5);
    this.clock = this.add.image(this.textTime.x,this.textTime.y - 10,"clock");
    this.textTime.text = "0:0";
    this.timerTime = this.time.addEvent({
      delay: 1000,
      callback: ()=> this.onTimer(),
      callbackScope: this,
      loop: true
    });


    //Creating the dominos
    for (let i = 0; i < 12; i++){


      if (i <= 5) {
        this.button[i] = this.physics.add.sprite((((game.config.width / 8)* i) + 250), game.config.height * 0.70).setScale(0.75,0.75);
      } else {
        this.button[i] = this.physics.add.sprite((((game.config.width / 8)* (i - 5)) + 150), game.config.height * 0.88).setScale(0.75,0.75);
      }


    }

    //viable domino drop zone
    let zone = this.add.zone(350, 175, 300, 300).setRectangleDropZone(300, 300);

    // Just a visual display of the drop zone
    /*
        let graphics = this.add.graphics();
        graphics.lineStyle(2, 0xffff00);
        graphics.strokeRect(zone.x - zone.input.hitArea.width / 2, zone.y - zone.input.hitArea.height / 2, zone.input.hitArea.width, zone.input.hitArea.height);
        */

    this.button.forEach( function(btn, index){
      //setting the texture for the btn_sprites
      btn.tag = index;
      btn.startPos = [];
      btn.startPos[0] = btn.x;
      btn.startPos[1] = btn.y;


      btn.placed = false; //when placed

      btn.setTexture(this.choose("vDomino", "hDomino"));
      btn.setInteractive();
      btn.in = false;
      this.input.setDraggable(btn, true);

      this.input.on("dragstart", function (pointer, gameObject) {

        this.children.bringToTop(gameObject);
        this.children.bringToTop(this.topText[gameObject.tag]);
        this.children.bringToTop(this.nomText[gameObject.tag]);
        this.children.bringToTop(this.domText[gameObject.tag]);
        this.children.bringToTop(this.line[gameObject.tag]);

      }, this);


      this.input.on("drag", function (pointer, gameObject, dragX, dragY) {

        gameObject.x = dragX;
        gameObject.y = dragY;

      });

      btn.on("dragenter", function( pointer, dropzone){
        btn.in = true;

      },this);

      btn.on("dragleave", function(pointer, dropzone){
        btn.in = false;

      },this);


      btn.on("dragend", function (pointer) {
        //console.log(this.topText[btn.tag].text);
        this.play_sfx("tile");
        //When the correct domino is placed in the right location
        if (btn.in == true && this.topText[btn.tag].text == this.fraction){
          this.attempts = 0;

          this.input.setDraggable(btn, false);
          this.fraction = Number(this.nomText[btn.tag].text) / Number(this.domText[btn.tag].text);

          if (this.placeHorizontal == true){
            btn.setTexture("vDomino");
            btn.x = this.placeX + (btn.width / 2) + 54;
            btn.y = this.placeY + (btn.height / 6) - 5;

          } else {
            btn.setTexture("hDomino");
            btn.x = this.placeX + (btn.width / 2) + 8;
            btn.y = this.placeY + (btn.height / 4);
          }

          this.highlightCorrect(this.placeX,this.placeY,btn.x,btn.y);

          zone.setPosition(btn.x + 150,btn.y + 50);
          this.placeX = btn.x;
          this.placeY = btn.y;

          if (btn.texture.key == "hDomino"){

            this.placeHorizontal = true;

          } else {

            this.placeHorizontal = false;}

          this.highlightNext(this.highlight1);

        } else {

          btn.x = btn.startPos[2]; //Odd bug when trying to overlap original Array pos, so using [2] & [3] respectively
          btn.y = btn.startPos[3];

          this.attempts++;
          if (this.attempts >= 2){
            this.play_audio("w2");
          } else {
            this.play_audio("w1");
          }
        }

      }, this);


      //Place text ontop of each button, assign a tag to match the txt to btn
      this.nomText[index] = this.add.text(btn.x,btn.y, this.num_nom[index], this.font_btn_style);
      this.nomText[index].setOrigin(0.5,0.5);
      this.nomText[index].tag = btn.tag;

      this.line[index] = this.add.image(btn.x,btn.y,"line");
      this.line[index].displayWidth = 32;

      this.domText[index] = this.add.text(btn.x,btn.y, this.num_dom[index], this.font_btn_style);
      this.domText[index].setOrigin(0.5,0.5);
      this.domText[index].tag = btn.tag;

      this.checkNumbers(index); //

      //Making sure there are no matches / duplicates
      this.topText[index] = this.add.text(btn.x, btn.y, this.num_top[0], this.font_btn_style);
      this.topText[index].setOrigin(0.5,0.5);
      this.topText[index].tag = btn.tag;
      this.num_top.splice(0, 1);


      if (index === 0){

        this.input.setDraggable(btn, false);
        btn.setPosition(250,150); //Using this below for new highlight starting spot
        this.placeX = btn.x;
        this.placeY = btn.y;
        btn.setTexture("hDomino");
        btn.in = true;
        //this.topText[index].destroy();
        this.fraction = this.num_nom[index] / this.num_dom[index];
        //console.log("starting Q: " + this.fraction);

      } else {
        this.startPosition.push(btn.startPos);
      }

    },this);

    //Game start timer
    //game.registry.values.timerEvent = this.time.addEvent({delay: 100, callback: this.nextQuestion, callbackScope: this});
    //console.log(this.num_top);

    //Randomize the location of the dominoes
    Phaser.Utils.Array.Shuffle(this.startPosition);

    this.button.forEach( function(btn, index){

      if (btn.tag != 0){
        //console.log(this.startPosition.length);
        //console.log(this.startPosition);
        btn.x = this.startPosition[index - 1][0];
        btn.y = this.startPosition[index - 1][1];

        btn.startPos[2] = btn.x; //Odd bug when trying to overlap original Array pos, so using [2] & [3] respectively
        btn.startPos[3] = btn.y;
        //console.log(btn.x + " // " + btn.startPos[0]);

      }

    },this);

    this.highlight1 = this.add.image(0,0,"highlight1").setScale(0.90).setAlpha(0.25).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: this.highlight1,
      duration: 3500,
      alpha: 0.15,
      yoyo: true,
      loop: true,
    });

    //Highlights on the first domino for kids to learn mechanic only
    this.correctHighlight1 = this.add.image(250,150,"highlight2").setScale(0.90).setAlpha(0.75).setAngle(90).setBlendMode(Phaser.BlendModes.ADD);
    this.correctHighlight2 = this.add.image(0,0,"highlight2").setScale(0.90).setAlpha(0).setAngle(90).setBlendMode(Phaser.BlendModes.ADD);


    this.highlightNext(this.highlight1, false);

  }


  highlightNext(btn){
    btn.tag = 1;

    if (this.placeHorizontal == true){
      btn.setAngle(0);
      btn.x = this.placeX + (btn.width / 2) + 58;
      btn.y = this.placeY + (btn.height / 6) - 5;

    } else {
      btn.setAngle(90);
      btn.x = this.placeX + (btn.width) - 8;
      btn.y = this.placeY + (btn.height / 5);
    }
  }

  highlightCorrect(prevX,prevY,newX,newY){
    this.highlight1.setAlpha(0);
    this.call_tracker();
    this.correctHighlight1.setAngle(0); //Fixing angle from the starting position

    if (this.placeHorizontal === true){
      this.correctHighlight2.setPosition(prevX,prevY).setAlpha(0.75);
      this.correctHighlight1.setPosition(newX,newY).setAlpha(0.75);

    } else {
      this.correctHighlight1.setPosition(prevX,prevY).setAlpha(0.75);
      this.correctHighlight2.setPosition(newX,newY).setAlpha(0.75);
    }

    this.tweens.add({
      targets: [this.correctHighlight1, this.correctHighlight2],
      alpha: 0,
      delay: 1000,
      duration: 2000,
      callback: () => this.highlight1.setAlpha(0.25)
    });

  }



  checkNumbers(index){

    if (this.num_nom[index] / 100 == this.num_top[0]){
      //console.log("same: " + this.num_top[0]);
      //console.log(this.num_top);
      Phaser.Utils.Array.Shuffle(this.num_top);
      //console.log(this.num_top);
      this.checkNumbers();

    } else {

    }

  }

  onTimer(){
    if (this.isEnd == false){

      this.timeCount += 1;
      let minutes = Math.floor(this.timeCount / 60);
      let seconds = Math.floor(this.timeCount % 60);

      if (seconds <=9){
        this.textTime.text =  minutes + ":" + "0" + seconds;
      } else {
        this.textTime.text =  minutes + ":" + seconds;
      }
    }
    //console.log("onTimer");

  }

  createNumbers(){ //Setting up all the numbers for the dominos

    let numbers = []; // used to check if the number exists

    for (let i = 0; i < 12; i++){

      let decimal = Phaser.Math.CeilTo(Phaser.Math.FloatBetween(0,99));

      if (!numbers.includes(decimal)){
        numbers.push(decimal);
        this.num_nom[i] = decimal;

        if (this.num_nom[i].toString().length === 1){
          this.num_dom[i] = 10;
          this.num_top[i] = decimal / 10;

        } else {
          this.num_dom[i] = 100;
          this.num_top[i] = decimal / 100;

        }
        //console.log(this.num_top[i]);
        //console.log(this.num_nom[i] + "/" + this.num_dom[i]);
      } else {
        i--;
        //console.log("match: " + decimal);
      }
    }
    //console.log(numbers.length)
    //Phaser.Utils.Array.Shuffle(this.num_top); //Randomize the decimal "top" number for the dominos so they don't all automatically match
    this.num_top.unshift(0.88); //Adds a number to the "TopText" for the starting game tile
    //console.log(this.num_top);
  }


  //Every Tick
  update() {


    //keeps the text ontop of each domino
    this.button.forEach( function(btn, index){

      if (btn.texture.key == "vDomino"){
        //vertical dominos
        this.topText[index].setPosition(btn.x + 1 ,btn.y - tt + 3);

        this.nomText[index].setPosition(btn.x + 1 ,btn.y + tt - 20).setScale(0.9);
        this.domText[index].setPosition(btn.x + 1 ,btn.y + tt + 13).setScale(0.9);

        this.line[index].setPosition(btn.x, btn.y + tt  - 4 );

      } else {
        //horizontal dominos
        this.topText[index].setPosition(btn.x - tt + 4,btn.y);

        this.nomText[index].setPosition(btn.x + tt - 2 ,btn.y - 19 ).setScale(0.9);
        this.domText[index].setPosition(btn.x + tt - 2 ,btn.y + 18 ).setScale(0.9);

        this.line[index].setPosition(btn.x  + tt - 2, btn.y);

      }

    },this);

  }


  // Audio / SFX Management
  play_sfx(name, volume){
    //pass in the name, without the prefix "sfx_"
    if (volume == null){volume = game.registry.values.sfxVolume;}

    let sfx = this.sound.add( "sfx_" + name, {volume: volume});
    sfx.play();
    //console.log("sfx: " + name);
  }

  play_audio(name, volume){
    if(game.registry.values.audio != null){this.stop_audio();}
    if (volume == null){volume = game.registry.values.audioVolume;}

    game.registry.values.audio = this.sound.add(name, {volume: volume});
    game.registry.values.audio.on("complete", this.audio_end, this);
    game.registry.values.audio.play();
    //console.log("audioStart: " + name);
  }

  stop_audio(){
    game.registry.values.audio.stop();
    //console.log("Stopped: " + audio.key);
    game.registry.values.audio = null;
  }


  audio_end(){

    //console.log("audioEnd: " + audio.key);

    switch(game.registry.values.audio.key){

    case "intro":
      //Need to add a timer delay
      //console.log("jump");
      this.scene.start("sceneMain");
      this.time.addEvent({
        delay: 1000,
        callback: () => this.play_audio("directions"),
      });
      break;

    default:
      ////console.log("default")
      break;
    }
  }

  call_tracker(){
    let star = this.tracker[this.questionNumber];
    star.setTexture("tracker1");
    star.setScale(1.2).setAngle(this.choose(-45,45));
    this.play_sfx("correct0");

    this.tweens.add({
      targets: star,
      scale: 1,
      duration: 400,
      angle: 0,
    });
    this.call_fx(star.x,star.y);

    this.questionNumber++;

    if (this.questionNumber >= 8){

      this.button.forEach( function(btn, index){
        this.input.setDraggable(btn, false);
      },this);

      this.endGame();
    } else {
      this.play_audio(this.choose("c1","c2","c3"));
    }
  }

  endGame(){

    //Highlight clock / pause time
    this.isEnd = true;
    this.play_audio("end");

    this.time.addEvent({
      delay: 2000,
      callback: ()=> this.clock.setTexture("clockHighlight").setAlpha(0.75),
      loop: false,
    });

    this.tweens.add({
      targets: this.clock,
      alpha: 0.55,
      duration: 800,
      yoyo: true,
      loop: -1,
    });

    //create Restart button
    this.time.addEvent({
      delay: 8000,
      callback: ()=> this.create_restart_btn(),
    });

    this.highlight1.destroy();
    //Highlight the placed buttons
    this.button.forEach( function(btn, index){
      let endHighlights = [];

      if (btn.in === true){
        endHighlights[index] = this.add.image(btn.x,btn.y, "highlight2").setScale(0.85).setDepth(-1);
        if (btn.texture.key == "hDomino"){endHighlights[index].setAngle(90);}

        this.tweens.add({
          targets: btn,
          angle: this.choose(-2,2),
          duration: Phaser.Math.Between(400,450),
          loop: -1,
          yoyo: true,
        });
      }

    },this);
  }

  create_restart_btn(){
    let btn_replay = this.add.image(game.config.width/2, game.config.height/2, "btn_replay");
    btn_replay.setInteractive();

    btn_replay.on("pointerdown", function(pointer){
      this.scene.get("sceneMain").play_sfx("grab");
      btn_replay.destroy();

      this.time.addEvent({
        delay: 500,
        callback: this.game_restart() ,
        callbackScope: this});
    },this);
  }

  game_restart(){
    this.scene.get("sceneMain").stop_audio();
    this.scene.start("sceneTitle");
  }


  choose(arg1,arg2,arg3,arg4){
    let array = [];

    for(let i = 0; i < 4; i++){
      if (arguments[i] != null){array.push(arguments[i]);}
    }
    Phaser.Utils.Array.Shuffle(array);
    return array[0];
  }

  call_fx(xx,yy){
    game.registry.values.fx_emitter = game.registry.values.fx_particles.createEmitter({
      x: xx,
      y: yy,
      speed: {min: 50, max: 150},
      lifespan: 1500,
      blendMode: "ADD",
      frequency: 15,
      maxParticles: 10,
      scale: {start: 1, end: 0, random: true},
      alpha: {start:1, end: 0},
      rotate: {start:0, end: 180, random: true},
    });

    game.registry.values.fx_particles.setDepth(1);

  }
}





