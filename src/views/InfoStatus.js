import { Text, Shape, Container } from 'createjs-module';
import TextUtil from '../utils/TextUtil';

class InfoStatus {
	constructor(param) {

		this.msg = {
			CLEAR: '',
			USER_STRIKE: 'Select the correct option and click Strike.',
			TOSS_INFO: 'Click Toss to toss the coin and see which team will begin.'
		};

		this.x = 0;
		this.y = 580;
		this.w = 993;
		this.h = 29;

		this.base = new Container();

		this.s = new Shape();

		this.s.graphics
			.setStrokeStyle(1)
			.beginStroke('#ccc')
			.drawRect(this.x, this.y, this.w, this.h)
			.beginFill('#eee')
			.drawRect(this.x, this.y, this.w, this.h)
			.endFill();

		this.base.addChild(this.s);

		this.addText({
			x: this.x + 10,
			y: this.y + 6,
			t: this.msg[param],
			f: TextUtil.defaultStyle(20, 'r', '#006')
		});
	}

	getClip() {
		return this.base;
	}

	setText(param) {
		this.txt.text = this.msg[param];
	}

	addText({ x, y, t, f }) {
		this.txt = new Text(); //tis_subregular
		this.txt.x = x;
		this.txt.y = y;
		this.txt.font = f.style;
		this.txt.color = f.color;
		this.txt.text = t;
		this.txt.textAlign = 'left';
		this.txt.lineWidth = 850;

		this.base.addChild(this.txt);
	}
}

export default InfoStatus;
