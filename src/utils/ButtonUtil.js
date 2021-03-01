
class ButtonUtil {

    static configure(btn) {
        btn.on("mouseover", () => {
            btn.overState = true;
            btn.gotoAndStop("_over");
        });
        btn.on("mouseout", () => {
            btn.overState = false;
            btn.gotoAndStop("_up");
        });
        btn.on("mousedown", () => {
            btn.gotoAndStop("_down");
        });
        //btn.on("click", onBtnClick);
        btn.cursor = "pointer";
        btn.mouseChildren = false;
    }
}

export default ButtonUtil