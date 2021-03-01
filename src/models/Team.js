import Player from "./Player";

class Team {

    constructor(id, name) {
        this.id = id;
        this.name = name;

        this.innings = [];
        this.runs = 0;
        this.over = [];
        this.wickets = 0;

        this.players = [];
        this.playerCounter = 0;
        this.lastPlayerDown = -1;

        this.ballVO = [
            'a_ball1',
            'a_ball2',
            'a_ball3',
            'a_ball4',
            'a_ball5',
            'a_ball6'
        ]

        this.createWickets();
    }

    setQuestions(q, t) {
        this
            .innings
            .push({ 'questions': q, 'title': t, 'completed': false, 'runs': 0 });
    }

    getInningTitle() {
        return this.innings[0].title
    }

    getInningsQuestions() {
        return this.innings[0].questions
    }

    setInningCompleted() {
        this.innings[0].completed = true;
    }

    isInningCompleted() {
        return (this.innings[0].completed)
            ? true
            : false
    }

    createWickets() {
        for (let i = 0; i < 11; i++) {
            let player = new Player(i);
            player.setStatus("DISABLE");
            this
                .players
                .push(player);
        }

        this.setStriker(this.playerCounter);
        this.playerCounter++;
        this.setRunner(this.playerCounter);
    }

    getPlayerStates() {
        return this.players
    }

    getTeamName() {
        return this
            .name
            .toString();
    }

    getTeamId() {
        return this.id;
    }

    addRun(run) {
        this.runs += run;
    }

    getScore() {
        return this.runs
    }

    wicketsDown() {
        return this.wickets
    }

    remainingWickets() {
        return (this.players.length - this.wickets)
    }

    message() {
        return "team message"
    }

    countOver() {
        return this.over
    }

    getBallCount() {
        return this.over.length
    }

    getBallVO() {
        return this.ballVO[this.over.length]
    }

    rotateStrike() {
        let tmp = this.getStriker();
        this.striker = this.runner;
        this
            .striker
            .setStatus("STRIKE");
        this.runner = tmp;
        this
            .runner
            .setStatus("RUNNER");
    }

    setStriker(p) {
        this.striker = this.players[p];
        this
            .striker
            .setStatus("STRIKE");
    }
    getStriker() {
        return this.striker
    }

    setRunner(p) {
        this.runner = this.players[p];
        this
            .runner
            .setStatus("RUNNER");

    }
    getRunner() {
        return this.runner
    }

    getLastDownScore() {
        return this
            .players[this.lastPlayerDown]
            .getPlayerScore()
    }

    strokePlayed(stroke) {

        let ballValue;

        if (stroke.value === -1) {
            ballValue = "W";
            this.wickets++;
            (this.getStriker()).setStatus("OUT");
            this.lastPlayerDown = this
                .getStriker()
                .id;
            this.playerCounter++;
            this.setStriker(this.playerCounter);
        } else {
            ballValue = stroke.value;
            this.addRun(ballValue);
            this
                .getStriker()
                .scoreRun(ballValue);

            if (ballValue === 1) {
                this.rotateStrike();
            }
        }

        this.over.push({ ballValue: ballValue, userselect: stroke.userselect });
        //console.log("this.over ", this.over);
    }

}

export default Team