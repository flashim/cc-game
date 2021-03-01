class Player {

    constructor(id) {
        this.id = id;

        this.run = '';

        this.states = {
            "INIT": "init",
            "RUNNER": "runner",
            "OUT": "out",
            "STRIKE": "strike",
            "DISABLE": "disable"
        }
    }

    scoreRun(run) {
        this.run += run;
    }

    getPlayerScore() {
        return this.run
    }

    setStatus(status) {
        this.state = this.states[status];
        if ((this.state === this.states["STRIKE"]) || (this.state === this.states["RUNNER"])) {
            if (this.run === '') {
                this.run = 0;
            }
        }
    }
}

export default Player