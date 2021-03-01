import { Text } from 'createjs-module';

class TextUtil {
	//----------------------------------------------------------------------------------
	//.. Text usage in the canvas font directly
	//----------------------------------------------------------------------------------
	static defaultStyle(_size = 18, _font = 'r', _color = '#FFF', _width = 600) {
		let fontName = 'TISClassEdge_Regular';
		let fontSize = _size;

		switch (_font) {
			case 'shusha':
			case 'Shusha':
			case 'hindi':
			case 'h':
				fontName = 'Shusha';
				fontSize = _size + 8;
				break;

			case 'TIS_Sup':
			case 'TISSup':
				fontName = 'TISSup';
				break;

			case 'TIS_Sub':
			case 'TISSub':
				fontName = 'TISSub';
				break;

			case 'TIS_Symbol':
			case 'TISSymbol':
				fontName = 'TISSup';
				break;

			case 'r':
				fontName = 'TISClassEdge_Regular';
				break;

			case 'b':
				fontName = 'TISClassEdge_Bold';
				break;

			case 'i':
				fontName = 'TISClassEdge_Italics';
				break;

			case 'bi':
			case 'ib':
				fontName = 'TISClassEdge_BoldItalics';
				break;

			default:
				fontName = 'TISClassEdge_Regular';
		}
		return {
			color: _color,
			width: _width,
			size: fontSize,
			font: fontName,
			style: 'normal ' + fontSize + 'px ' + fontName
		};
	}

	//----------------------------------------------------------------------------------

	static hasFontFace(t) {
		return t.indexOf('<FONT FACE') >= 0 ? true : false;
	}

	static createText(x, y, t, f) {
		let txt = new Text();
		txt.x = x;
		txt.y = y;
		txt.font = f.style;
		txt.color = f.color;
		txt.text = t;
		txt.textAlign = 'left';
		txt.lineWidth = f.width;

		return txt;
	}

	static processString(ffName, x, y, t, f, lCanvas) {
		let tmpX = x;

		let arr = [];
		arr = t.split('<FONT FACE="' + ffName + '">');
		let str = arr.join(' ');
		arr = str.split(' ');

		for (var i = 0; i < arr.length; i++) {
			if (arr[i].indexOf('</FONT>') >= 0) {
				let txt = new Text();
				let txtToAdd = arr[i].split('</FONT>')[0];
				txt.x = tmpX;
				txt.y = y;
				txt.text = txtToAdd;
				txt.textAlign = 'left';
				txt.color = f.color;
				txt.font = TextUtil.defaultStyle(f.size, ffName).style;
				txt.lineWidth = f.width;
				lCanvas.addChild(txt);
				tmpX += txt.getMeasuredWidth() + 2;
			} else {
				let txt = TextUtil.createText(tmpX, y, arr[i], TextUtil.defaultStyle(f.size, f.font, f.color, f.width));
				lCanvas.addChild(txt);
				tmpX += txt.getMeasuredWidth() + 2;
			}
		}
	}

	static processHindiString(ffName, x, y, t, f, lCanvas) {
		let str = TextUtil.stripTags(t);
		let txt = TextUtil.createText(x, y, str, TextUtil.defaultStyle(f.size, ffName, f.color, f.width));
		lCanvas.addChild(txt);

		return txt;
	}

	static stripTags(str) {
		return str.replace(/<[^>]+>/g, '');
	}

	//... below 2 functions are for text-break and formatting

	static setText({ x, y, t, f, lCanvas }) {
		if (TextUtil.hasFontFace(t)) {
			TextUtil.formatText({ x, y, t, f, lCanvas });
		} else {
			let txt = TextUtil.createText(x, y, t, f);
			lCanvas.addChild(txt);
		}
	}

	static formatText({ x, y, t, f, lCanvas }) {
		let txt = new Text();
		let tmpX = x;
		if (t.indexOf('{') >= 0) {
			t.replace('{', '$$OPCB$$');
		}
		if (t.indexOf('}') >= 0) {
			t.replace('}', '$$CLCB$$');
		}

		if (t.indexOf('TIS_Sup') >= 0) {
			TextUtil.processString('TIS_Sup', x, y, t, f, lCanvas);
		} else if (t.indexOf('TIS_Sub') >= 0) {
			TextUtil.processString('TIS_Sub', x, y, t, f, lCanvas);
		} else if (t.indexOf('TIS_Symbol') >= 0) {
			TextUtil.processString('TIS_Symbol', x, y, t, f, lCanvas);
		} else if (t.indexOf('Shusha') >= 0) {
			TextUtil.processHindiString('Shusha', x, y, t, f, lCanvas);
		}
	}
}

export default TextUtil;
