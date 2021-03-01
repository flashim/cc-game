import GameEvent from '../models/GameEvent';

class SoundUtil {
	static registerSound(src, id) {
		window.createjs.Sound.registerSound(src, id);
	}

	static playSound(id, vol, del, loop, evt = GameEvent.SOUND_COMPLETED) {
		/*
        interrupt - How to interrupt any currently playing instances of audio with the same source, if the maximum number of instances of the sound are already playing. Values are defined as INTERRUPT_TYPE constants on the Sound class, with the default defined by defaultInterruptBehavior.
        delay - The amount of time to delay the start of audio playback, in milliseconds.
        offset - The offset from the start of the audio to begin playback, in milliseconds.
        loop - How many times the audio loops when it reaches the end of playback. The default is 0 (no loops), and -1 can be used for infinite playback.
        volume - The volume of the sound, between 0 and 1. Note that the master volume is applied against the individual volume.
        pan - The left-right pan of the sound (if supported), between -1 (left) and 1 (right).
        startTime - To create an audio sprite (with duration), the initial offset to start playback and loop from, in milliseconds.
        duration - To create an audio sprite (with startTime), the amount of time to play the clip for, in milliseconds.
            */
		let loopVal = loop === undefined ? 0 : loop;
		let volVal = vol === undefined ? 1 : vol;
		let delVal = del === undefined ? 0 : del;

		//console.log('sound: ', id, '   found:', SoundUtil._getSound(id), '  evt: ', evt);

		if (SoundUtil._getSound(id) === undefined) {
			let myInstance = window.createjs.Sound.createInstance(id);
			myInstance.play({
				interrupt: window.createjs.Sound.INTERRUPT_ANY,
				loop: loopVal,
				volume: volVal,
				delay: delVal
			}); //INTERRUPT_ANY, volume: 1, , pan: 0.5
			myInstance.on(
				'complete',
				() => {
					//console.log("snd instance completed playing on ", id, myInstance, evt);
					window.eventManager.dispatch(evt, { id: myInstance });
				},
				false
			);
			SoundUtil.sounds[id] = myInstance;
		} else {
			SoundUtil.resumeSound(id);
		}
	}

	static pauseSound(id) {
		let s = SoundUtil._getSound(id);
		s.paused = true;
	}

	static resumeSound(id) {
		let s = SoundUtil._getSound(id);
		s.play();
	}

	static stopSound(id) {
		let s = SoundUtil._getSound(id);
		s.stop();
	}

	static _getSound(id) {
		return SoundUtil.sounds[id];
	}

	static stopAllSounds() {
		window.createjs.Sound.stop();
	}
}

SoundUtil.sounds = [];

export default SoundUtil;
