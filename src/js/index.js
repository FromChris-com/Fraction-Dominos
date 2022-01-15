import Phaser from 'phaser';
import sceneLoader from './sceneLoader';
import sceneTitle from './sceneTitle';
import sceneMain from './sceneMain';


const config = {
  title: "Espark Learning",
  type: Phaser.AUTO,                                                
  width: 1600,
  height: 900,
  parent: 'phaser-game',
  scene: [sceneLoader,sceneTitle,sceneMain],
  backgroundColor: "#3D86FF",
  physics:{
        default: "arcade",
        arcade: {
          debug: false,
        }
  }, 
  scale:{
        mode: Phaser.Scale.ScaleModes.FIT,
        autoCenter: Phaser.Scale.Center.CENTER_BOTH
  } 
};
	 
const game = new Phaser.Game(config);

game.registry.set({
  timerEvent: null,
  audio: null,  //current audio playing
  music: null, //current music
  sfxVolume: 0.55,//global sfx volume standard
  audioVolume: 0.50, 
  btn_text: null, // stores the button's text for audio
  mx: 0, //mouse X - click
  my: 0, //mouse y - click
  canTap: false, // the player can interact with objs      
  fx_particles: null,
  fx_emitter: null,
  score: 0,
});

export default game;
        
