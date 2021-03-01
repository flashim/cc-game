import GameModel from '../models/Models';
import GameEvent from '../models/GameEvent';
import TextUtil from '../utils/TextUtil';

class ScoreBoard {
	connectDisplay(boardDisplay) {
		this.bd = boardDisplay;
	}

	scoreUpdate() {
		this.cleanupScoreBoard();

		let team = GameModel.getInstance().umpire.getBattingTeam();

		this.ballCount = team.countOver().length > 0 ? team.countOver().length : 0;

		this.bd.TeamTxt.text = team.getTeamName();
		this.bd.TeamTxt.font = TextUtil.defaultStyle(20, 'b').style;

		this.bd.ScoreMc.txt.text = team.getScore();
		this.bd.ScoreMc.txt.font = TextUtil.defaultStyle(20, 'r').style;
		this.bd.ScoreMc.txt.y = -9;

		this.bd.WicketsMc.txt.text = team.wicketsDown();
		this.bd.WicketsMc.txt.font = TextUtil.defaultStyle(20, 'r').style;
		this.bd.WicketsMc.txt.y = -9;

		this.bd.MsgTxt.font = TextUtil.defaultStyle().style;
		this.bd.MsgTxt.text = GameModel.getInstance().umpire.getMatchStat().s_msg;

		//console.log(team.countOver(), " -- ballCount ", this.ballCount);

		if (this.ballCount === 0) {
			this.bd['bl_0'].gotoAndStop(1);
		} else {
			team.countOver().forEach((ball, id) => {
				let el = this.bd['bl_' + id];
				el.gotoAndStop(2);
				el.id = id;
				el.txt.text = ball.ballValue;
				el.txt.font = TextUtil.defaultStyle(20, 'b').style;

				el.cursor = 'pointer';
				//el.mouseChildren = el.mouseEnabled = true; // = el.mouseEnabled
				if (!el.hasEventListener('click')) {
					el.on('click', (evt) => {
						//this.enableClick(true);
						//console.log(evt.target);
						//evt.target.mouseChildren = false;
						//evt.target.mouseEnabled = false;
						//evt.target.cursor = "default";
						window.eventManager.dispatch(GameEvent.SHOW_QUESTION_FEEDBACK, { id: el.id });
					});
				}
			});
		}

		if (this.ballCount < 6) {
			// console.log("ballCount ", this.ballCount);
			this.bd['bl_' + this.ballCount].gotoAndStop(1);
		}
	}

	enableClick(p) {
		for (let i = 0; i < this.ballCount; i++) {
			//console.log(i, " enabling ... ", this.bd["bl_" + i]);
			this.bd['bl_' + i].mouseChildren = p;
			//.. below enabled by me
			this.bd['bl_' + i].mouseEnabled = p;
			this.bd['bl_' + i].cursor = 'pointer';
		}
	}

	cleanupScoreBoard() {
		let ball = this.bd;

		ball.TeamTxt.text = '';
		ball.ScoreMc.txt.text = '';
		ball.WicketsMc.txt.text = '';
		ball.MsgTxt.text = '';
		for (let i = 0; i < 6; i++) {
			ball['bl_' + i].txt.text = '';
			ball['bl_' + i].gotoAndStop(0);
			if (ball['bl_' + i].hasEventListener('click')) {
				ball['bl_' + i].removeAllEventListeners('click');
			}
		}
	}
}

export default ScoreBoard;
