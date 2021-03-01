import GameDisplay from './GameDisplay';
import SoundUtil from '../utils/SoundUtil';

class App {
	start() {
		this.window = window;
		this.document = window.document;
		this.createjs = window.createjs;
		this.AdobeAn = window.AdobeAn;

		this.progressElement = null;
		this.progressText = null;
		this.loadCheck = false;

		this.loadData();
	}

	loadData() {
		this.canvas = this.document.getElementById('canvas');
		this.anim_container = this.document.getElementById('animation_container');
		this.dom_overlay_container = this.document.getElementById('dom_overlay_container');

		var comp = this.AdobeAn.getComposition('A30E223B12428B4F8D0612006303F8DA');
		this.comp = comp;

		this.createjs.MotionGuidePlugin.install();

		this.loader = new this.createjs.LoadQueue(false);

		this.loader.installPlugin(this.createjs.Sound);

		this.loader.loadFile({ src: './assets/CricketChallengeXmlStructure.xml', id: 'gameData' });

		this.lib = this.comp.getLibrary();
		this.loader.loadManifest(this.lib.properties.manifest);

		this.loader.addEventListener('fileload', (evt) => {
			this.handleFileLoad(evt);
		});

		this.progressElement = this.document.getElementById('progress');
		this.progressElement.style.setProperty('width', '100%');

		//old technique
		this.loader.addEventListener('progress', (evt) => {
			//this.progressElement = this.document.getElementById('progress');
			this.progressText = this.document.getElementById('pText');
			let progressVal = Math.ceil(evt.progress * 100);
			//this.progressElement.style.setProperty('width', progressVal + '%');

			this.progressText.textContent = 'Loading Assets - ' + progressVal + '%';
		});

		this.loader.addEventListener('complete', (evt) => {
			this.handleComplete(evt);
		});
	}

	handleFileLoad(evt) {
		var images = this.comp.getImages();
		if (evt && evt.item.type === 'image') {
			images[evt.item.id] = evt.result;
		}
		if (evt && evt.item.type === 'sound') {
			//console.log(evt.item.id, "loading ", this.loader); //._parsePath(evt.item.src)
			SoundUtil.registerSound(evt.item.src, evt.item.id);
		}
		this.loader.crossOrigin = 'Anonymous';
		//console.log(evt.item.id, " load ", this.loader);
		//this.progressElement.textContent = "Loading Asset (" + evt.item.id + ") of type [" + evt.item.type + "]";
	}

	handleComplete(evt) {
		this.loader.removeAllEventListeners();

		this.assetLoadedCheck(); //used with old tehnique

		let _data = new this.window.X2JS({ keepCData: true });
		this.xmlData = _data.xml2json(this.loader.getResult('gameData'));

		let lib = this.comp.getLibrary();
		let ss = this.comp.getSpriteSheet();

		let queue = evt.target;
		let ssMetadata = lib.ssMetadata;
		for (let i = 0; i < ssMetadata.length; i++) {
			ss[ssMetadata[i].name] = new this.createjs.SpriteSheet({
				images: [ queue.getResult(ssMetadata[i].name) ],
				frames: ssMetadata[i].frames
			});
		}

		this.AdobeAn.compositionLoaded(lib.properties.id);
	}

	assetLoadedCheck() {
		/* let progress = (this.loader.getItems(true)).length / (this.loader.getItems(false)).length;
    let progressPer = Math.ceil(progress * 100); */

		this.progressText.textContent = 'Wait';

		this.delayInterval = window.setTimeout(() => {
			if (this.loader.getItems(true).length === this.loader.getItems(false).length) {
				window.clearInterval(this.delayInterval);

				this.progressElement.style.setProperty('display', 'none');

				this.startGame();
			} else {
				this.assetLoadedCheck();
			}
		}, 1000);
	}

	startGame() {
		let lib = this.comp.getLibrary();

		this.exportRoot = new lib.fl_assets();
		this.stage = new lib.Stage(this.canvas);
		//this.stage = new this.createjs.StageGL("canvas");

		var game = new GameDisplay({
			window: this.window,
			createjs: this.createjs,
			canvas: this.canvas,
			stage: this.stage,
			exportRoot: this.exportRoot,
			lib: this.lib,
			xmlData: this.xmlData
		});
		game.config();

		this.window.playGame = function(p) {
			game.init(p);
		};
	}
}

export default App;
