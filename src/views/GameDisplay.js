import { ArrayUtils, Timer, EventManager, Iterator } from '../utils/Utils';

import GameModel from '../models/Models';
import Question from './Question';
import ScoreBoard from './ScoreBoard';
import GameEvent from '../models/GameEvent';
import InfoStatus from './InfoStatus';
import Umpire from '../models/Umpire';
import SoundUtil from '../utils/SoundUtil';
import TextUtil from '../utils/TextUtil';
import ButtonUtil from '../utils/ButtonUtil';
import TeamData from '../models/TeamData';

class GameDisplay {
	constructor(param) {
		this.dev = false;
		this.win = param.window;

		this.createjs = param.createjs;
		this.canvas = param.canvas;
		this.exportRoot = param.exportRoot;
		this.lib = param.lib;
		this.stage = param.stage;

		this.stage.enableMouseOver(20);

		GameModel.getInstance().xmlData = param.xmlData;
		GameModel.getInstance().umpire = new Umpire();
		GameModel.getInstance().scoreboard = new ScoreBoard();
		GameModel.getInstance().gameRef = this;
		GameModel.getInstance().gameRef.gamePaused = false;
		GameModel.getInstance().gameRef.canHideBallNote = false;
		this.gameOverSeen = false;

		this.setupEvents();

		this.win.canvasObjRef = {
			startBtn: {},
			htpBtn: {},
			skipBtn: {},
			submitBtn: {},
			continueBtn: {},

			/** Intro callback -----------------------------------------------------------------------*/
			startOfIntro(p) {
				SoundUtil.playSound('MusicMix');

				p.GameDes_txt.color = TextUtil.defaultStyle().color;
				p.GameDes_txt.textAlign = 'left';
				p.GameDes_txt.lineWidth = TextUtil.defaultStyle().width;
				p.GameDes_txt.font = TextUtil.defaultStyle(22, 'r').style; // for Hindi change
				p.GameDes_txt.text = GameModel.getInstance().xmlData.GameContent.Gamedata.GameEdge.descriptionTxt;

				p.GameDes_txt.visible = false;

				this.startBtn = p.getChildByName('startBtnMc');
				this.startBtn.on('click', (evt) => {
					GameModel.getInstance().gameRef.initToss();
				});
				this.startBtn.visible = false;
				ButtonUtil.configure(this.startBtn);

				this.htpBtn = p.getChildByName('howToPlayBtnMc');
				this.htpBtn.on('click', (evt) => {
					GameModel.getInstance().gameRef.showHelpScreen();
				});
				this.htpBtn.visible = false;
				ButtonUtil.configure(this.htpBtn);

				this.skipBtn = p.getChildByName('skipBtn');
				this.skipBtn.on('click', (evt) => {
					p.gotoAndStop('end'); // end
					p.GameDes_txt.visible = true;
					SoundUtil.stopSound('MusicMix');
				});
				ButtonUtil.configure(this.skipBtn);
			},

			hideSkip(p) {
				this.skipBtn.visible = false;
			},
			endOfIntro(p) {
				p.stop();

				p.GameDes_txt.visible = true;

				this.startBtn.visible = this.htpBtn.visible = true;
				this.skipBtn.visible = false;

				SoundUtil.playSound('stadium_noise', 0.08, 0, -1);
			},
			/** Intro callback ends --------------------------------------------------------------- */

			/** Help callback -------------------------------------------------------------------- */
			startOfHelp(p) {
				if (p.viewed === undefined) {
					p.viewed = true;
					this.skipBtn = p.getChildByName('skip');
					this.skipBtn.on('click', (evt) => {
						//SoundUtil.pauseSound("a_helpAudio");
						GameModel.getInstance().gameRef.restartBgSound();
						GameModel.getInstance().gameRef.initToss();
					});
					ButtonUtil.configure(this.skipBtn);
					this.skipBtn.x = 0;

					this.closeBtn = p.getChildByName('close');
					this.closeBtn.on('click', (evt) => {
						GameModel.getInstance().gameRef.restartBgSound();
						GameModel.getInstance().gameRef.initToss();
					});
					this.closeBtn.visible = false;
					ButtonUtil.configure(this.closeBtn);

					this.readBtn = p.getChildByName('more');
					this.readBtn.on('click', (evt) => {
						p.gotoAndStop('readmore');
						GameModel.getInstance().gameRef.restartBgSound();
					});
					this.readBtn.visible = false;
					ButtonUtil.configure(this.readBtn);

					this.htpBtn = p.getChildByName('howToPlayBtnMc');
					this.htpBtn.on('click', (evt) => {
						GameModel.getInstance().gameRef.restartBgSound();
						p.gotoAndPlay('start');
					});
					this.htpBtn.visible = false;
					ButtonUtil.configure(this.htpBtn);
				} else {
					this.skipBtn.visible = true;
					this.readBtn.visible = true;
					this.closeBtn.visible = false;
					this.htpBtn.visible = false;
				}

				//SoundUtil.playSound("a_helpAudio");
			},
			endOfHelp(p) {
				p.stop();
				this.skipBtn.x = -112.4;
				this.readBtn.visible = true;
			},
			onReadMore(p) {
				p.stop();
				//SoundUtil.stopSound("a_helpAudio");
				GameModel.getInstance().gameRef.restartBgSound();
				this.skipBtn.visible = this.readBtn.visible = false;
				this.htpBtn.visible = this.closeBtn.visible = true;
			},

			/** Help callback ends --------------------------------------------------------------- */

			/** Toss callback -------------------------------------------------------------------- */
			startOfToss(p) {
				SoundUtil.playSound('crowd_noise', 0.6);
			},
			onToss(p) {
				p.stop();

				SoundUtil.playSound('a_toss2');

				p.tossBtn.on('click', (evt) => {
					SoundUtil.stopSound('a_toss2');
					GameModel.getInstance().umpire.Toss();
					p.gotoAndPlay('play_toss');
				});
				ButtonUtil.configure(p.tossBtn);

				GameModel.getInstance().gameRef.iStatus.setText('TOSS_INFO');
			},
			onTossDecision(p) {
				p.stop();
				p.gotoAndPlay(GameModel.getInstance().umpire.whoWonToss() + 'WinToss');
			},
			onBlueReadyToBat(p) {
				p.stop();
				GameModel.getInstance().gameRef.startMatch();
			},
			onRedReadyToBat(p) {
				p.stop();
				GameModel.getInstance().gameRef.startMatch();
			},
			/** Toss callback ends --------------------------------------------------------------- */

			/** Game callback -------------------------------------------------------------------- */
			startOfQuestions(p) {
				p.stop();
				/*
                 let bvo = "";
                 if ((GameModel.getInstance().umpire.getMatchStat().inning === 0) && (GameModel.getInstance().umpire.getBattingTeam().getBallCount() === 0)) {
                    bvo = GameModel.getInstance().umpire.getBattingTeam().getBallVO() + "_match"
                } else { 
                    bvo = GameModel.getInstance().umpire.getBattingTeam().getBallVO();
                }*/
				//console.log(GameModel.getInstance().umpire.getMatchStat().inning, " startOfQuestions ", GameModel.getInstance().umpire.getBattingTeam().getBallCount())
				SoundUtil.playSound(
					GameModel.getInstance().umpire.getBattingTeam().getBallVO(),
					1,
					0,
					0,
					GameEvent.ACTIVATE_QUESTION
				); //
			},
			/** Game callback ends --------------------------------------------------------------- */
			/**  the first ball of the innings */
			onInningsStart(p) {
				p.stop();
				GameModel.getInstance().gameRef.umpireDecision();
			},

			/** Shots callback -------------------------------------------------------------------- */

			onSixerEnd(p) {
				//console.log(GameModel.getInstance().gameRef, this.thisRef);
				GameModel.getInstance().gameRef.umpireDecision();
			},
			onBoundaryEnd(p) {
				GameModel.getInstance().gameRef.umpireDecision();
			},
			onDoublesEnd(p) {
				GameModel.getInstance().gameRef.umpireDecision();
			},
			onSinglesEnd(p) {
				GameModel.getInstance().gameRef.umpireDecision();
			},
			onDotEnd(p) {
				GameModel.getInstance().gameRef.umpireDecision();
			},
			onBowledEnd(p) {
				GameModel.getInstance().gameRef.umpireDecision();
			},
			onCaughtEnd(p) {
				GameModel.getInstance().gameRef.umpireDecision();
			},
			onDuck(p) {
				if (GameModel.getInstance().umpire.getBattingTeam().getLastDownScore() === 0) {
					p.duck_anim.gotoAndPlay(1);
					SoundUtil.playSound('basketballhit2', 1, 0.1);
					SoundUtil.playSound('bounce1', 1, 0.5);
					SoundUtil.playSound('sad_down', 1, 0.8);
				}
			},

			onShotCommentry(p) {
				//console.log(" getBallCount-", GameModel.getInstance().umpire.getBattingTeam().getBallCount() - 1, "  vo-", GameModel.getInstance().strike.vo)
				//.. shot played
				if (GameModel.getInstance().gameRef.shot.value !== -1) {
					//.. VO
					SoundUtil.playSound(
						GameModel.getInstance().strike.vo[
							GameModel.getInstance().umpire.getBattingTeam().getBallCount() - 1
						]
					);
					//.. Cheers
					SoundUtil.playSound(GameModel.getInstance().strike.cheers, 0.9, 30);
					SoundUtil.playSound('CrowdCheer', 0.2, 100);
					SoundUtil.playSound('crowd_noise', 0.5, 80);
				} else {
					//... OUT
					//.. VO
					SoundUtil.playSound(
						ArrayUtils.getRandomValue(TeamData[GameModel.getInstance().gameRef.shot.label])
					);
					//.. wicketdown_cheer
					SoundUtil.playSound('wicketdown_cheer', 0.5, 30);
					SoundUtil.playSound('crowd_noise', 0.2, 80);
				}
			},
			/** Shots callback ends --------------------------------------------------------------- */

			onShowTeamPerformance(p) {
				p.stop();

				GameModel.getInstance().scoreboard.scoreUpdate();

				GameModel.getInstance().gameRef.ballNote = p.getChildByName('ballnote');
				GameModel.getInstance().gameRef.canHideBallNote = true;
				GameModel.getInstance().gameRef.ballNote.visible = true;

				let ms = GameModel.getInstance().umpire.getMatchStat();
				//console.log('tp ->', ms, GameModel.getInstance().gameRef.gameOverSeen);

				if (ms.gameover && !GameModel.getInstance().gameRef.gameOverSeen) {
					//.. game over sound
					SoundUtil.playSound('a_game_complete');
					//GameModel.getInstance().gameRef.ballNote.visible = false; //override
					p.txt.text = 'GAME COMPLETED. ' + ms.msg;
				} else {
					SoundUtil.playSound('a_innings_change');
					p.txt.text = ms.msg;
				}

				p.txt.font = TextUtil.defaultStyle(40).style;
				p.txt.visible = true;

				this.continueBtn = p.getChildByName('continue_mc');

				if (!this.continueBtn.hasEventListener('click')) {
					this.continueBtn.on('click', (evt) => {
						ms = GameModel.getInstance().umpire.getMatchStat();

						p.play();

						if (ms.gameover && !GameModel.getInstance().gameRef.gameOverSeen) {
							//.. again one time
							GameModel.getInstance().gameRef.gameOverSeen = true;
							SoundUtil.stopSound('a_game_complete');

							if (GameModel.getInstance().gameRef.screenQuestionObject.done) {
								GameModel.getInstance().umpire.continueNextInnings();
							} else {
								window.setTimeout(() => {
									GameModel.getInstance().gameRef.delegatedumpireDecision();
								}, 150);
							}
						} else {
							//console.log('continue with game');
							GameModel.getInstance().umpire.continueNextInnings();
						}

						SoundUtil.stopSound('a_innings_change'); //optional incsase sound is still playing

						GameModel.getInstance().gameRef.canHideBallNote = false;
						GameModel.getInstance().gameRef.ballNote.visible = true;
					});
					ButtonUtil.configure(this.continueBtn);
				}
				this.continueBtn.visible = true;
			},

			onStartUserFeedback(p) {
				p.stop();

				GameModel.getInstance().gameRef.exportRoot.response_mc.arrowMc.visible = false;
				GameModel.getInstance().gameRef.exportRoot.response_mc.closeMc.visible = false;

				GameModel.getInstance().scoreboard.enableClick(true);

				GameModel.getInstance().gameRef.exportRoot.response_mc.removeChildAt(3);

				GameModel.getInstance().gameRef.resumeQuestionActivity();

				GameModel.getInstance().gameRef.gamePaused = false;
			},

			onLoadUserFeedback() {
				GameModel.getInstance().gameRef.fq = new Question(
					new Iterator([
						GameModel.getInstance().umpire.getBattingTeam().getInningsQuestions()[
							GameModel.getInstance().gameRef.questionFeedback_id
						]
					])
						.iterator()
						.next()
				);

				GameModel.getInstance().gameRef.fq.addResponseScreen(
					GameModel.getInstance().umpire.getBattingTeam().countOver()[
						GameModel.getInstance().gameRef.questionFeedback_id
					].userselect
				); //userselected response

				GameModel.getInstance().gameRef.pauseQuestionActivity();
			},

			onShowUserFeedback(p) {
				p.stop();

				GameModel.getInstance().gameRef.gamePaused = true;

				if (!p.closeMc.hasEventListener('click')) {
					p.closeMc.on('click', (evt) => {
						GameModel.getInstance().gameRef.exportRoot.response_mc.gotoAndStop(0);
					});
					ButtonUtil.configure(p.closeMc);
				}

				GameModel.getInstance().gameRef.exportRoot.response_mc.arrowMc.gotoAndStop(
					GameModel.getInstance().gameRef.questionFeedback_id
				);

				GameModel.getInstance().gameRef.exportRoot.response_mc.arrowMc.visible = true;

				GameModel.getInstance().gameRef.exportRoot.response_mc.closeMc.visible = true;

				GameModel.getInstance().gameRef.exportRoot.response_mc.QuestionSetMc_2.bgMc.gotoAndStop(
					GameModel.getInstance().umpire.getBattingTeam().getTeamId()
				);

				GameModel.getInstance().gameRef.exportRoot.response_mc.addChild(
					GameModel.getInstance().gameRef.fq.getScreen()
				);
			},

			set_iText(p) {
				GameModel.getInstance().gameRef.iStatus.setText('USER_STRIKE');
			}
		};

		this.setupStage();
	}

	restartBgSound() {
		SoundUtil.stopAllSounds();
		SoundUtil.playSound('stadium_noise', 0.08, 0, -1);
	}

	setupEvents() {
		//.. Setting up events
		new EventManager(true);

		this.win.eventManager.subscribe(GameEvent.CONTINUE, this.continueGame);

		this.win.eventManager.subscribe(GameEvent.GAME_OVER, this.gameOver);

		this.win.eventManager.subscribe(GameEvent.CLEANUP_SCOREBOARD, this.clearDisplayBoard);

		this.win.eventManager.subscribe(GameEvent.SHOW_TEAM_PERFORMANCE, this.showTeamPerformance);

		this.win.eventManager.subscribe(GameEvent.SHOW_QUESTION_FEEDBACK, this.showQuestionFeedback);

		this.win.eventManager.subscribe(GameEvent.ACTIVATE_QUESTION, this.activateQuestion);
	}

	setupStage() {
		this.baseContainer = new this.createjs.Container();
		this.stage.addChild(this.baseContainer);

		/* this
            .createjs
            .Ticker
            .setFPS(this.lib.properties.fps); */

		this.createjs.Ticker.framerate = this.lib.properties.fps;

		this.createjs.Ticker.addEventListener('tick', this.stage);
	}

	init(config) {
		TeamData.randomize = config.randomize; // override from config settings
		TeamData.timeDivision = TeamData.timeConfig[config.timer];

		if (this.dev) {
			this.startMatch();
		} else {
			this.baseContainer.addChild(this.exportRoot.intro); //
			this.exportRoot.intro.gotoAndPlay(0);
		}
	}

	config() {
		//.. bg graphic cricket ground
		this.bg_graphic = new this.lib.gr_bg();
		this.bg_graphic.gotoAndStop(0);
		this.bg_graphic.x = 496;
		this.bg_graphic.y = 307.35;
		this.baseContainer.addChild(this.bg_graphic);

		this.win.showConfigScreen();
	}

	showHelpScreen() {
		this.baseContainer.removeAllChildren();
		this.baseContainer.addChild(this.exportRoot.helpAnimMc);
		this.exportRoot.helpAnimMc.gotoAndPlay(1);
	}

	initToss() {
		this.baseContainer.removeAllChildren();
		this.baseContainer.addChild(this.exportRoot.tossMc);

		this.iStatus = new InfoStatus('CLEAR');
		this.baseContainer.addChild(this.iStatus.getClip());
	}

	startMatch() {
		if (this.dev) {
			GameModel.getInstance().umpire.Toss();
			SoundUtil.playSound('stadium_noise', 0.08, 0, -1);
		} else {
			GameModel.getInstance().gameRef.iStatus.setText('USER_STRIKE');
		}

		GameModel.getInstance().umpire.startGame(GameModel.getInstance().xmlData, this.dev);

		this.baseContainer.removeAllChildren();

		//.. bg graphic cricket ground
		this.bg_graphic = new this.lib.gr_bg();
		this.bg_graphic.gotoAndStop(0);
		this.bg_graphic.x = 496;
		this.bg_graphic.y = 307.35;
		this.baseContainer.addChild(this.bg_graphic);

		//.. shots anim clips
		this.baseContainer.addChild(this.exportRoot.shotRed);

		this.baseContainer.addChild(this.exportRoot.shotBlue);

		//.. add feeback mc
		this.baseContainer.addChild(this.exportRoot.feedback_mc);

		//.. timer
		if (this.hasTimer()) {
			this.timer = new Timer();
			this.timer.createTimer(TeamData.timeDivision[0], this.onTimerUpdate, this.onTimerUpdate, this);
		}

		//.. Show innings title
		this.tInfo = new this.lib.TitleInfo();
		this.tInfo.x = 243;
		this.baseContainer.addChild(this.tInfo);
		this.tInfo.infoTxt.font = TextUtil.defaultStyle(25, 'b').style;

		//.. Bottom Over display
		this.wDisplay = new this.lib.BallDisplayMc();
		this.wDisplay.y = 536.5;
		this.baseContainer.addChild(this.wDisplay);

		GameModel.getInstance().scoreboard.connectDisplay(this.wDisplay);

		this.iStatus = new InfoStatus('USER_STRIKE');

		this.baseContainer.addChild(this.iStatus.getClip());

		GameModel.getInstance().gameRef.baseContainer.addChild(GameModel.getInstance().gameRef.exportRoot.response_mc);

		GameModel.getInstance().gameRef.exportRoot.response_mc.x = 18;
		GameModel.getInstance().gameRef.exportRoot.response_mc.y = 172;

		//

		this.umpireDecision();
	}

	showQuestion() {
		if (!GameModel.getInstance().gameRef.wDisplay.visible) {
			GameModel.getInstance().gameRef.wDisplay.visible = true;
		}

		this.exportRoot.shotRed.gotoAndStop(1);

		this.exportRoot.shotBlue.gotoAndStop(1);

		this.q = new Question(this.screenQuestionObject);
		this.q.addQuestionScreen();

		this.baseContainer.addChildAt(this.q.getScreen(), 1);

		SoundUtil.playSound('imageappear');

		//..

		if (this.hasTimer()) {
			GameModel.getInstance().gameRef.timer.startTimer();
			SoundUtil.playSound('countdown_tick', 0.2, 0, -1);

			GameModel.getInstance().strike = GameModel.getInstance().gameRef.getStrikeName(TeamData.timeDivision[0]);

			this.q.updateSubmitBtnState({
				txt: GameModel.getInstance().strike.txt,
				time: TeamData.timeDivision[0] + ' Sec'
			});

			window.setTimeout(() => {
				GameModel.getInstance().gameRef.pauseQuestionActivity();
			}, 150);
		} else {
			GameModel.getInstance().strike = GameModel.getInstance().gameRef.getStrikeName(1);

			this.q.updateSubmitBtnState({
				txt: GameModel.getInstance().strike.txt,
				time: ''
			});
		}
	}

	activateQuestion() {
		GameModel.getInstance().gameRef.q.disableScreen(false);

		if (GameModel.getInstance().gameRef.gamePaused) {
			window.setTimeout(() => {
				GameModel.getInstance().gameRef.pauseQuestionActivity();
			}, 150);
		} else {
			GameModel.getInstance().gameRef.resumeQuestionActivity();
		}
	}

	showQuestionFeedback(p) {
		SoundUtil.playSound('imageappear');

		GameModel.getInstance().gameRef.exportRoot.response_mc.gotoAndStop(0);

		GameModel.getInstance().gameRef.questionFeedback_id = p.id;

		GameModel.getInstance().gameRef.exportRoot.response_mc.gotoAndPlay(1);

		if (GameModel.getInstance().gameRef.canHideBallNote) {
			GameModel.getInstance().gameRef.ballNote.visible = false;
		}
	}

	continueGame() {
		//console.log('continueGame');
		GameModel.getInstance().gameRef.tInfo.infoTxt.text = GameModel.getInstance().umpire.getInningTitle();

		GameModel.getInstance().gameRef.exportRoot[
			'shot' + GameModel.getInstance().umpire.getBattingTeam().getTeamId()
		].gotoAndPlay('start');

		GameModel.getInstance().gameRef.wDisplay.visible = false;
	}

	gameOver() {
		let ms = GameModel.getInstance().umpire.getMatchStat();
		let toplay = '';
		//console.log('GAME OVER - overup', ms);

		GameModel.getInstance().scoreboard.scoreUpdate(); //added now for last ball update

		GameModel.getInstance().gameRef.baseContainer.addChildAt(
			GameModel.getInstance().gameRef.exportRoot.GameOverFeedback_mc,
			1
		);

		if (ms.winner === 'None') {
			if (ms.TeamRed === 0 && ms.TeamBlue === 0) {
				toplay = 'NoRunScore';
				SoundUtil.playSound('a_zero_runs');
			} else {
				toplay = 'AllTeamLost';
				SoundUtil.playSound('a_drawn');
			}
		} else {
			toplay = 'Win';
			SoundUtil.playSound('a_cong_won');
			SoundUtil.playSound('win_bg_music', 0.8);
			GameModel.getInstance().gameRef.exportRoot.GameOverFeedback_mc.teamnameMC.txt.text = ms.msg;
			GameModel.getInstance().gameRef.exportRoot.GameOverFeedback_mc.teamnameMC.txt.font = TextUtil.defaultStyle(
				36
			).style;
		}
		GameModel.getInstance().gameRef.exportRoot.GameOverFeedback_mc.gotoAndPlay(toplay);
		GameModel.getInstance().gameRef.iStatus.setText('CLEAR');
	}

	showTeamPerformance(p) {
		//GameModel.getInstance().gameRef.performanceType = p;
		//GameModel.getInstance().gameRef.baseContainer.getChildByName('feedback_mc').gotoAndPlay(1);

		if (p === null || p === undefined) {
			GameModel.getInstance().gameRef.baseContainer.getChildByName('feedback_mc').gotoAndPlay(1);
		} else {
			if (p.overup) {
				window.eventManager.dispatch(GameEvent.GAME_OVER, 'null');
			} else {
				GameModel.getInstance().gameRef.baseContainer.getChildByName('feedback_mc').gotoAndPlay(1);
			}
		}
	}

	pauseQuestionActivity() {
		if (GameModel.getInstance().gameRef.q.isQuestionActive()) {
			if (GameModel.getInstance().gameRef.hasTimer()) {
				GameModel.getInstance().gameRef.timer.pauseTimer();
				SoundUtil.pauseSound('countdown_tick');
				if (GameModel.getInstance().gameRef.q.alertOn) {
					SoundUtil.stopSound('Spaceso');
				}
			}
		}
	}

	resumeQuestionActivity() {
		if (GameModel.getInstance().gameRef.q.isQuestionActive()) {
			if (GameModel.getInstance().gameRef.hasTimer()) {
				GameModel.getInstance().gameRef.timer.resumeTimer();
				SoundUtil.resumeSound('countdown_tick');
				if (GameModel.getInstance().gameRef.q.alertOn) {
					SoundUtil.resumeSound('Spaceso');
				}
			}
		}
	}

	clearDisplayBoard() {
		GameModel.getInstance().scoreboard.cleanupScoreBoard();
	}

	umpireDecision() {
		this.exportRoot.shotRed.gotoAndStop(0); // change for RED and BLUE
		this.exportRoot.shotBlue.gotoAndStop(0);

		//console.log(GameModel.getInstance().umpire.getMatchStat(), 'umpireDecision1 ', GameModel.getInstance().gameRef);

		this.screenQuestionObject = GameModel.getInstance().umpire.nextBall();

		if (GameModel.getInstance().umpire.getMatchStat().gameover && !GameModel.getInstance().gameRef.gameOverSeen) {
			//.. onetime game completed event dispatch
			let o = { overup: this.screenQuestionObject.done };
			GameModel.getInstance().umpire.gameOver(o);
			return;
		}
		this.delegatedumpireDecision();

		window.setTimeout(() => {
			GameModel.getInstance().scoreboard.scoreUpdate();
		}, 250);
	}

	delegatedumpireDecision() {
		if (this.screenQuestionObject.done) {
			let o = { overup: this.screenQuestionObject.done };
			GameModel.getInstance().umpire.overUp(o);
		} else {
			GameModel.getInstance().gameRef.showQuestion();
		}
	}

	playShot(s) {
		if (this.hasTimer()) {
			this.timer.stopTimer();
		}

		this.q.removeScreen();

		this.baseContainer.removeChildAt(1);

		//.. shot logic
		let shot = {
			label: '',
			value: 0,
			userselect: s.id
		};

		if (s.id === s.correctAns) {
			shot.label = GameModel.getInstance().strike.label;
			shot.value = GameModel.getInstance().strike.value;
		} else {
			shot.label = ArrayUtils.getRandomBool() ? 'caught' : 'bowled';
			shot.value = -1;
		}

		this.exportRoot['shot' + GameModel.getInstance().umpire.getBattingTeam().getTeamId()].gotoAndPlay(shot.label);

		GameModel.getInstance().umpire.captureShot(shot);

		GameModel.getInstance().gameRef.shot = shot;
	}

	getStrikeName(time) {
		//console.log("getBallCount ", GameModel.getInstance().umpire.getBattingTeam().getBallCount());
		if (time > TeamData.timeDivision[1]) {
			let ballIdx = GameModel.getInstance().umpire.getBattingTeam().getBallCount();
			return ballIdx === 0 || ballIdx === 1 || ballIdx === 5 ? TeamData.strikeName[0] : TeamData.strikeName[1];
		}
		if (time > TeamData.timeDivision[2]) {
			return TeamData.strikeName[2];
		}
		if (time > TeamData.timeDivision[3]) {
			return TeamData.strikeName[3];
		}
		if (time > TeamData.timeDivision[4]) {
			return TeamData.strikeName[4];
		}
		if (time === TeamData.timeDivision[4]) {
			return TeamData.strikeName[5];
		}
	}

	onTimerUpdate(e) {
		if (e.timer.getTime() == 6) {
			// console.log("trigger alert");
			e.q.triggerAlert();
		}

		if (e.timer.getTime() == 0) {
			//console.log("stop alert");
			e.q.stopAlert();
		}

		GameModel.getInstance().strike = e.getStrikeName(e.timer.getTime());

		e.q.updateSubmitBtnState({
			time: e.timer.getFormattedTime(),
			txt: GameModel.getInstance().strike.txt
		});
	}

	hasTimer() {
		return TeamData.timeDivision[0] !== 0;
	}
}

export default GameDisplay;
