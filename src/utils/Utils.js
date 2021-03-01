class Timer {

	createTimer(time, updateCall, callbackFunc, ref) {
		this.timerParam = {
			time,
			updateCall,
			callbackFunc,
			ref
		};
	}

	startTimer() {
		// this.createTimer(this.timerParam.time, this.timerParam.updateCall,
		// this.timerParam.callbackFunc, this.timerParam.ref) this.stopTimer();

		this.seconds = this.timerParam.time + 1;
		this.stopTimer();

		this.countdownTimer = window.setInterval(() => {
			if (!this.timerPaused) {
				if (this.seconds < 1) {
					console.log("Time's up!");
					this.timerParam.callbackFunc(this.timerParam.ref);
					this.stopTimer();
				} else {
					//console.log("counting >> ", this.seconds);
					this.seconds--;
					this
						.timerParam
						.updateCall(this.timerParam.ref);
				}
			}
		}, 1000);
	}

	pauseTimer() {
		this.timerPaused = true;
	}

	resumeTimer() {
		this.timerPaused = false;
	}

	stopTimer() {
		if (this.countdownTimer) {
			clearInterval(this.countdownTimer);
			this.countdownTimer = null;
			//this.timerPaused = false;
		}
	}

	getTime() {
		return this.seconds;

	}
	getFormattedTime() {
		let pad = function (input) {
			return input < 10
				? "0" + input + " Sec"
				: input + " Sec";
		}
		return pad(this.getTime());

	}
	getConvertedTime() {
		return this.convertTime(this.seconds);
	}

	convertTime(input, separator) {
		let pad = function (input) {
			return input < 10
				? "0" + input
				: input;
		};
		return [
			/*pad(Math.floor(input / 3600)),*/
			pad(Math.floor(input % 3600 / 60)),
			pad(Math.floor(input % 60))
		].join(typeof separator !== 'undefined'
			? separator
			: ':');
	}
}

class ArrayUtils {
	static getRandomBool() {
		return (Math.random() > 0.5)
			? 1
			: 0
	}

	static shuffleArray(arr) {
		let a = ArrayUtils.copyArray(arr);
		let l = a.length;
		let i = 0;
		for (i; i < l; i++) {
			let tmp = a[i];
			let rand = Math.floor(Number(Math.random() * l));
			//alert(rand)
			a[i] = a[rand];
			a[rand] = tmp;
		}
		return a
	}

	static getRandomValue(arr) {
		return arr[Math.floor(Math.random() * arr.length)]
	}

	static copyArray(a) {
		return a.slice()
	}
}

class DisplayUtils {

	static setTransform(target_mc, x, y, regX, regY) {
		target_mc.setTransform(x, y, 1, 1, 0, 0, 0, regX, regY);
	}
}

class XMLUtils {

	static xmlToJson(xml) {

		// Create the return object
		var obj = {};

		if (xml.nodeType === 1) { // element
			// do attributes
			if (xml.attributes.length > 0) {
				obj["@attributes"] = {};
				for (var j = 0; j < xml.attributes.length; j++) {
					var attribute = xml
						.attributes
						.item(j);
					obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
				}
			}
		} else if (xml.nodeType === 3) { // text
			obj = xml.nodeValue;
		}

		// do children If just one text node inside
		if (xml.hasChildNodes() && xml.childNodes.length === 1 && xml.childNodes[0].nodeType === 3) {
			obj = xml.childNodes[0].nodeValue;
		} else if (xml.hasChildNodes()) {
			for (var i = 0; i < xml.childNodes.length; i++) {
				var item = xml
					.childNodes
					.item(i);
				var nodeName = item.nodeName;
				if (typeof (obj[nodeName]) === "undefined") {
					obj[nodeName] = this.xmlToJson(item);
				} else {
					if (typeof (obj[nodeName].push) === "undefined") {
						var old = obj[nodeName];
						obj[nodeName] = [];
						obj[nodeName].push(old);
					}
					obj[nodeName].push(this.xmlToJson(item));
				}
			}
		}
		return obj;
	}

}

class Iterator {
	constructor(elements) {
		if (!Array.isArray(elements))
			throw new Error('Parameter to constructor must be array');

		this.elements = elements;

	} * iterator() {

		for (let key in this.elements) {
			var value = this.elements[key];
			yield value;
		}
	}

	get(key) {
		return this.elements[key];
	} [Symbol.iterator]() {
		return this.iterator();
	}
}

class EventManager {
	constructor(isSingleton) {
		// console.log("EventManager: starting"); Collection of {event,
		// [subscribedCallbacks]}
		this.subscriptions = []
		// if isSingleton is true, the object is attached to the document (only once)
		if (isSingleton) {
			if (window.eventManager === undefined) {
				//console.log("EventManager: creating singleton");
				window.eventManager = this
			} else {
				//console.log("EventManager: already instantiated");
			}
		} else {
			//console.log("EventManager: is not a singleton");
		}

	}

	subscribe(eventToSubscribe, callback) {
		var eventObject = this.isCallbackSubscribed(eventToSubscribe, callback)
		if (eventObject === undefined) {
			var eventFound = false
			this
				.subscriptions
				.forEach(function (e) {
					if (e._event === eventToSubscribe) {
						eventFound = true
						e
							.subscribedCallbacks
							.push(callback)
					}
				})

			if (!eventFound) {
				var subscribedCallbacks = [callback]
				this
					.subscriptions
					.push({ _event: eventToSubscribe, subscribedCallbacks: subscribedCallbacks })
			}
		} else {
			console.log("EventManager: callback already subscribed to event " + eventToSubscribe);
		}
	}

	unsubscribe(eventToUnubscribe, callback) {
		var eventObj = this.isCallbackSubscribed(eventToUnubscribe, callback);
		if (eventObj !== undefined) {
			this
				.subscriptions[eventObj.eventIndex]
				.subscribedCallbacks
				.pop(eventObj.callbackIndex)
		}
		console.log("EventManager: callback unsubscribed from " + eventToUnubscribe);
	}

	isCallbackSubscribed(event, callback) {
		var result = undefined
		this
			.subscriptions
			.forEach(function (e, i) {
				if (e._event === event) {
					e
						.subscribedCallbacks
						.forEach(function (c, j) {
							if (c.toString() === callback.toString()) {
								result = {
									eventIndex: i,
									callbackIndex: j
								}
							}
						})
				}
			})
		return result
	}

	dispatch(eventToDispatch, payload) {
		/* console.log("EventManager: dispatching");
		console.log({_event: eventToDispatch, payload: payload}); */
		this
			.subscriptions
			.forEach(function (e) {
				if (e._event === eventToDispatch) {
					e
						.subscribedCallbacks
						.forEach(function (c) {
							c(payload)
						})
				}
			})
	}

	showAllSubsriptions() {
		//console.log($.extend(true, {}, this.subscriptions));
	}
}

export {
	DisplayUtils,
	XMLUtils,
	ArrayUtils,
	Timer,
	Iterator,
	EventManager
}