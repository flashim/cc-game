import GameModel from '../models/Models';
import SoundUtil from '../utils/SoundUtil';
import TextUtil from '../utils/TextUtil';

class Question {
	constructor(screendata) {
		this.userSelectedValue = null;
		this.optionArr = [];
		this.isOptionSelected = false;
		this.alertOn = false;
		this.active = false;
		this.timeUp = false;
		this.screenData = screendata;

		this.lib = GameModel.getInstance().gameRef.lib;
		this.createjs = GameModel.getInstance().gameRef.createjs;
	}

	addQuestionScreen() {
		this.active = true;
		this.addBg();
		this.addQuestion();
		this.addInstruction();
		this.addOptions(true);
		this.update();
	}

	addResponseScreen(p) {
		this.userSelectedValue = p;
		this.active = true;

		this.qscreen = new this.createjs.Container();

		this.addQuestion();
		this.addOptions(false);

		this.setXY(16, -170);
	}

	getScreen() {
		return this.qscreen;
	}

	update() {
		this.setXY(16, 55);
		this.updateBatsmanStates();
	}

	setXY(x, y) {
		this.qscreen.x = x;
		this.qscreen.y = y;
	}

	updateSubmitBtnState(p) {
		this.qscreen.submit.shot_txt.text = p.txt;
		this.qscreen.submit.shot_txt.font = TextUtil.defaultStyle(20, 'r').style;

		this.qscreen.submit.countdown.txt.text = p.time;
		this.qscreen.submit.countdown.txt.font = TextUtil.defaultStyle(18, 'r').style;
	}

	triggerAlert() {
		if (GameModel.getInstance().gameRef.hasTimer()) {
			if (!this.alertOn) {
				this.alertOn = true;
				SoundUtil.playSound('Spaceso', 0.8, 0, -1);
				this.qscreen.submit.countdown.alertMc.play();
			}
		}
	}

	stopAlert() {
		if (GameModel.getInstance().gameRef.hasTimer()) {
			SoundUtil.stopSound('countdown_tick');
			if (this.alertOn) {
				SoundUtil.stopSound('Spaceso');
			}
			this.qscreen.submit.countdown.alertMc.gotoAndStop(0);
		}
		this.alertOn = false;
		this.timeUp = true;
		this.active = false;
	}

	updateBatsmanStates() {
		GameModel.getInstance().umpire.getBattingTeam().getPlayerStates().forEach((el) => {
			let mc = this.qscreen['wk_' + el.id];
			mc.gotoAndStop(el.state);
			mc.txt.text = el.run;
			mc.txt.font = TextUtil.defaultStyle().style;
		});
	}

	removeScreen() {
		this.stopAlert();
		this.qscreen.removeAllChildren();
	}

	addBg() {
		this.qscreen = new this.lib.QScreen();

		this.qscreen.gotoAndStop('Question' + GameModel.getInstance().umpire.getBattingTeam().getTeamId());

		this.qscreen.team_txt.text = GameModel.getInstance().umpire.getBattingTeam().getTeamName();
		this.qscreen.team_txt.font = TextUtil.defaultStyle(34, 'b', '#FFF', 200).style;

		this.qscreen.submit.cursor = 'pointer';
		this.qscreen.submit.on('mouseover', (event) => {
			if (this.isOptionSelected) {
				this.qscreen.submit.gotoAndStop('over');
			}
		});
		this.qscreen.submit.on('mouseout', (event) => {
			if (this.isOptionSelected) {
				this.qscreen.submit.gotoAndStop('normal');
			}
		});
		this.qscreen.submit.addEventListener('click', (e) => {
			if (this.isOptionSelected) {
				this.stopAlert();
				GameModel.getInstance().gameRef.playShot(this.playedShot);
			}
		});
	}

	addQuestion() {
		TextUtil.setText({
			x: GameModel.getInstance().xmlData.GameContent.Gamedata.GameEdge.GameSettings.position.question.x,
			y: GameModel.getInstance().xmlData.GameContent.Gamedata.GameEdge.GameSettings.position.question.y,
			t: this.screenData.value.qtag.__cdata,
			f: TextUtil.defaultStyle(20, 'r', '#000', 850),
			lCanvas: this.qscreen
		});
	}

	addInstruction() {
		/* this.qscreen.qinfotxt_mc.txt.text = this.screenData.value.skill.__cdata.replace(/<[^>]+>/g, ''); //this.screenData.value._skill;
		this.qscreen.qinfotxt_mc.txt.font = TextUtil.defaultStyle(22, 'r', '#333').style;
		this.qscreen.qinfotxt_mc.txt.color = TextUtil.defaultStyle(22, 'r', '#333').color; */

		this.qscreen.qinfotxt_mc.txt.text = '';

		let instTxt = '';

		if (this.screenData.value._skill === undefined) {
			if (this.screenData.value.skill === undefined) {
				console.log('arrtibute cdata none found');
			} else {
				instTxt = this.screenData.value.skill.__cdata;
			}
		} else {
			//.. attribute found
			instTxt = this.screenData.value._skill;
		}

		TextUtil.setText({
			x: this.qscreen.qinfotxt_mc.txt.x,
			y: this.qscreen.qinfotxt_mc.txt.y,
			t: instTxt,
			f: TextUtil.defaultStyle(20, 'r', '#000', 850),
			lCanvas: this.qscreen.qinfotxt_mc
		});
	}

	addOptions(p) {
		let oStartPoint = 217;
		let optiongap = 35;
		let o = this.screenData.value.option;
		let t;

		o.forEach((each, i) => {
			let omc = new this.lib.OptionMc1();

			omc.x = 120;
			omc.y = oStartPoint + optiongap * i;
			omc.name = 'opt' + (i + 1);
			omc.id = i;

			this.optionArr.push(omc);

			TextUtil.setText({
				x: GameModel.getInstance().xmlData.GameContent.Gamedata.GameEdge.GameSettings.position.options.x,
				y: GameModel.getInstance().xmlData.GameContent.Gamedata.GameEdge.GameSettings.position.options.y,
				t: each.__cdata,
				f: TextUtil.defaultStyle(18, 'r', '#000', 850),
				lCanvas: omc
			});

			omc.selected = false;
			omc.correctAns = each._correctans === 'true' ? i : -1;
			//console.log('option-', i, omc.correctAns);

			if (p) {
				omc.validateMc.visible = false;
				omc.cursor = 'pointer';
				omc.addEventListener('mouseover', (event) => {
					if (!omc.selected) {
						omc.gotoAndStop('over'); // assetFix
					}
				});
				omc.addEventListener('mouseout', (event) => {
					if (!omc.selected) {
						omc.gotoAndStop('normal'); // assetFix
					}
				});
				omc.addEventListener('click', (event) => {
					this.deselectAllOptions();
					this.playedShot = omc;

					omc.gotoAndStop('selected');
					omc.selected = true;
					this.isOptionSelected = true;
					this.qscreen.submit.gotoAndStop('normal');
				});
			} else {
				if (i == this.userSelectedValue) {
					if (each._correctans) {
					} else {
						omc.validateMc.visible = true;
						omc.validateMc.tick.visible = false;
					}
				} else {
					omc.validateMc.visible = false;
				}

				if (each._correctans === 'true') {
					omc.validateMc.visible = true;
					omc.validateMc.cross.visible = false;
				}
			}
			this.qscreen.addChild(omc);
		});

		this.disableScreen(true);
	}

	deselectAllOptions() {
		this.optionArr.forEach((each, i) => {
			each.gotoAndStop('normal');
			each.selected = false;
		});
	}

	disableScreen(p) {
		this.optionArr.forEach((each, i) => {
			each.mouseEnabled = each.mouseChildren = !p;
		});
		this.qscreen.mouseEnabled = this.qscreen.mouseChildren = !p;
	}

	isQuestionActive() {
		return !this.timeUp && this.active;
	}
}

export default Question;
