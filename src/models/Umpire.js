import { ArrayUtils, Iterator } from '../utils/Utils';
import Team from './Team';
import TeamData from './TeamData';
import GameEvent from './GameEvent';

class Umpire {
	whoWonToss() {
		return this.teamWonToss;
	}

	Toss() {
		//.. decision for toss
		this.teamWonToss = ArrayUtils.getRandomBool() ? 'Red' : 'Blue';
		//this.teamWonToss = "Red";

		this.teamOrder = [];
		this.teamOrderInc = 0;
		this.setTeam();
	}

	getBattingTeam() {
		return this.battingTeam;
	}

	setTeam() {
		this.teamA1 = new Team('Red', 'Team 2');
		this.teamB1 = new Team('Blue', 'Team 1');
		this.teamA2 = new Team('Red', 'Team 2');
		this.teamB2 = new Team('Blue', 'Team 1');

		if (this.teamWonToss === 'Red') {
			this.teamOrder = [ this.teamA1, this.teamB1, this.teamA2, this.teamB2 ];
		} else {
			this.teamOrder = [ this.teamB1, this.teamA1, this.teamB2, this.teamA2 ];
		}
		this.battingTeam = this.teamOrder[this.teamOrderInc];
	}

	startGame(xml, devMode) {
		let q_arr = xml.GameContent.Gamedata.GameEdge.game.questions.question;

		/* -- randomize questions and options -- */
		// taken from xml -------------
		//let toRandomize = xml.GameContent.metadata.gameRules._randomizeQmode == 'true' ? true : false;
		// ----------------------------
		let toRandomize = TeamData.randomize; // from user config

		if (toRandomize) {
			q_arr.forEach((each, i) => {
				q_arr[i].option = ArrayUtils.shuffleArray(each.option);
			});
			q_arr = ArrayUtils.shuffleArray(xml.GameContent.Gamedata.GameEdge.game.questions.question);
		}

		let _start = 0;
		let _inc = devMode ? 2 : 6;
		//let _inc = 2;
		let _end = _start + _inc;
		let slicingArrTitle = [ 'First Innings', 'First Innings', 'Second Innings', 'Second Innings' ];

		this.teamOrder.forEach((team, id) => {
			team.setQuestions(q_arr.slice(_start, _end), slicingArrTitle[id]);
			//console.log("(", _start, ", ", _end, ")");
			_start = _end;
			_end = _start + _inc;
		});

		this.getInningsOver();
	}

	setInningTitle() {
		this.inningsTitle = this.getBattingTeam().getInningTitle();
	}

	getInningTitle() {
		return this.inningsTitle;
	}

	getMatchStat() {
		return this.getStats();
	}

	getStats() {
		this.gameStat = {
			FirstBatted: this.teamOrder[0].getTeamId(),
			SecondBatted: this.teamOrder[1].getTeamId(),
			TeamBatting: this.getBattingTeam(),
			winner: {},
			inning: this.teamOrderInc,
			TeamRed: 0,
			TeamBlue: 0,
			runDiff: 0,
			r_msg: '',
			msg: '',
			s_msg: '',
			gameover: false
		};

		this.teamOrder.forEach((each, i) => {
			this.gameStat['Team' + each.getTeamId()] += each.getScore();
		});

		this.gameStat.runDiff =
			this.gameStat['Team' + this.gameStat.FirstBatted] - this.gameStat['Team' + this.gameStat.SecondBatted];

		let m = '';
		let runsLiteral = Math.abs(this.gameStat.runDiff) > 1 ? ' runs' : ' run';

		switch (this.teamOrderInc) {
			case 0:
				this.gameStat.msg =
					this.teamOrder[0].getTeamName() +
					' scored ' +
					this.gameStat.runDiff +
					runsLiteral +
					'. You need to score many more runs to lead in the match.';
				this.gameStat.s_msg = ''; //"Runs: " + Math.abs(this.gameStat.runDiff);
				break;

			case 1:
				this.gameStat.msg =
					this.teamOrder[0].getTeamName() +
					' scored ' +
					this.gameStat['Team' + this.gameStat.FirstBatted] +
					runsLiteral +
					'. ' +
					this.teamOrder[1].getTeamName() +
					' scored ' +
					this.gameStat['Team' + this.gameStat.SecondBatted] +
					runsLiteral +
					'.';
				/* this.gameStat.msg = this.gameStat.SecondBatted + " is " + ((this.gameStat.runDiff < 0)
                    ? " leading by "
                    : " trailling by ") + Math.abs(this.gameStat.runDiff) + " runs."; */
				m = this.gameStat.runDiff < 1 ? 'Lead: ' : 'Trail: ';

				this.gameStat.s_msg = m + Math.abs(this.gameStat.runDiff) + runsLiteral;
				break;

			case 2:
				if (this.teamOrder[2].isInningCompleted()) {
					if (
						this.gameStat['Team' + this.gameStat.SecondBatted] >
						this.gameStat['Team' + this.gameStat.FirstBatted]
					) {
						this.gameStat.msg =
							this.teamOrder[1].getTeamName() +
							' won by ' +
							Math.abs(this.gameStat.runDiff) +
							runsLiteral +
							'.';
						this.gameStat.gameover = true;
						this.gameStat.winner = this.gameStat.SecondBatted;
					} else {
						this.gameStat.msg =
							this.teamOrder[0].getTeamName() +
							' scored ' +
							this.gameStat['Team' + this.gameStat.FirstBatted] +
							runsLiteral +
							'. You need to score ' +
							(Math.abs(this.gameStat.runDiff) + 1) +
							' more runs to win the match.';
					}
				}

				m = this.gameStat.runDiff > -1 ? 'Lead: ' : 'Trail: ';

				this.gameStat.s_msg = this.gameStat.gameover
					? this.gameStat.msg
					: m + Math.abs(this.gameStat.runDiff) + runsLiteral;

				break;

			case 3:
				if (
					this.gameStat['Team' + this.gameStat.SecondBatted] >
					this.gameStat['Team' + this.gameStat.FirstBatted]
				) {
					//this.gameStat.msg = this.teamOrder[3].getTeamName() + " won by " + this.teamOrder[3].remainingWickets() + " wickets.";
					this.gameStat.msg =
						this.teamOrder[3].getTeamName() + ' won by ' + Math.abs(this.gameStat.runDiff) + runsLiteral;
					this.gameStat.gameover = true;
					this.gameStat.winner = this.gameStat.SecondBatted;
				}

				if (this.teamOrder[this.teamOrderInc].isInningCompleted()) {
					//final check
					if (
						this.gameStat['Team' + this.gameStat.FirstBatted] >
						this.gameStat['Team' + this.gameStat.SecondBatted]
					) {
						this.gameStat.msg =
							this.teamOrder[0].getTeamName() +
							' won by ' +
							Math.abs(this.gameStat.runDiff) +
							runsLiteral +
							'.';
						this.gameStat.winner = this.teamOrder[0];
					} else if (
						this.gameStat['Team' + this.gameStat.SecondBatted] >
						this.gameStat['Team' + this.gameStat.FirstBatted]
					) {
						this.gameStat.msg =
							this.teamOrder[3].getTeamName() +
							' won by ' +
							Math.abs(this.gameStat.runDiff) +
							runsLiteral +
							'.';
						this.gameStat.winner = this.teamOrder[3];
					} else if (
						this.gameStat['Team' + this.gameStat.SecondBatted] ===
						this.gameStat['Team' + this.gameStat.FirstBatted]
					) {
						this.gameStat.msg = 'Game drawn';
						this.gameStat.winner = 'None';
					}
					this.gameStat.gameover = true;
				}

				let runsLiteral2 = Math.abs(this.gameStat.runDiff) + 1 > 1 ? ' runs' : ' run';

				this.gameStat.s_msg = this.gameStat.gameover
					? this.gameStat.msg
					: 'Target: ' + (this.gameStat.runDiff + 1) + runsLiteral2;

				break;

			default:
		}
		//console.log(this.teamOrderInc, this.gameStat);
		return this.gameStat;
	}

	getInningsOver() {
		this.inningsQuestions = new Iterator(this.getBattingTeam().getInningsQuestions()).iterator();
	}

	continueNextInnings() {
		//console.log("this innings: ", this.teamOrderInc, '   ', this.teamOrder.length, "getBallCount: ", this.getBattingTeam().getBallCount())

		//if (!this.gameStat.gameover) {
		if (this.teamOrderInc === this.teamOrder.length - 1) {
			window.eventManager.dispatch(GameEvent.GAME_OVER, 'null');
		} else {
			this.switchBatting();
			this.setInningTitle();
			this.getInningsOver();
			this.continueInnings();
		}
	}

	overUp() {
		this.getBattingTeam().setInningCompleted();
		//.. check if gameover
		if (this.teamOrderInc === this.teamOrder.length - 1) {
			window.eventManager.dispatch(GameEvent.GAME_OVER, 'null');
		} else {
			window.eventManager.dispatch(GameEvent.SHOW_TEAM_PERFORMANCE, null);
		}
	}

	gameOver(p) {
		window.eventManager.dispatch(GameEvent.SHOW_TEAM_PERFORMANCE, p);
	}

	nextBall() {
		let thisBall = this.inningsQuestions.next();
		/* if (thisBall.done) {
            this.getBattingTeam().setInningCompleted();
            this.getStats();
        } */
		return thisBall;
	}

	switchBatting() {
		this.teamOrderInc++;
		this.battingTeam = this.teamOrder[this.teamOrderInc];
	}

	continueInnings() {
		window.eventManager.dispatch(GameEvent.CONTINUE, 'null');
	}

	captureShot(s) {
		this.getBattingTeam().strokePlayed(s);
	}
}

export default Umpire;
