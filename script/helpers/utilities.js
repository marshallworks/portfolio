define(['_'], function (_) {
	'use strict';

	// Setup
	var framesPerSecond = 1000 / 60;
	_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

	var init, qs, qsa, on, off, distributor, dist,
		getJSON, getFile, buildHTML, getWidth, getHeight,
		windowResize, windowScroll,
		animate, fadeIn, fadeOut, runFade, easeInOutCubic;

	qs = function (selector, scope) {
		return (scope || document).querySelector(selector);
	};

	qsa = function (selector, scope) {
		return (scope || document).querySelectorAll(selector);
	};

	on = function (target, type, callback, useCapture) {
		target.addEventListener(type, callback, !!useCapture);
	};

	off = function (target, type, callback, useCapture) {
		target.removeEventListener(type, callback, !!useCapture);
	};

	distributor = function () {
		var listeners = {};
		var register = function (key, cb, scope) {
			if (!listeners.hasOwnProperty(key)) {
				listeners[key] = [];
			}
			listeners[key].push({
				cb: cb,
				scope: scope
			});
		};
		var fire = function (key, data) {
			if (listeners.hasOwnProperty(key)) {
				listeners[key].forEach(function(func) {
					func.cb(data, func.scope);
				});
			}
		};
		return Object.freeze({
			register: register,
			fire: fire
		});
	};

	getJSON = function(url, cb, scope) {
		var xmlRequest = new XMLHttpRequest();

		xmlRequest.onreadystatechange = function() {
			if (xmlRequest.readyState == 4 && xmlRequest.status == 200) {
				var data = JSON.parse(xmlRequest.responseText);
				cb(data, scope);
			}
		};

		xmlRequest.open('GET', url, true);
		xmlRequest.send();
	};

	getFile = function(url, cb, scope) {
		var xmlRequest = new XMLHttpRequest();

		xmlRequest.onreadystatechange = function() {
			if (xmlRequest.readyState == 4 && xmlRequest.status == 200) {
				var data = xmlRequest.responseText;
				cb(data, scope);
			}
		};

		xmlRequest.open('GET', url, true);
		xmlRequest.send();
	};

	buildHTML = function (spec) {
		var item = {}, html;
		var processor = document.createElement('div');
		var compiled = _.template(_.trim(spec.template));
		processor.innerHTML = compiled(spec.data);
		_.forEach(spec.selectors, function(selector) {
			item[selector] = qs(selector, processor);
		});
		return {
			html: processor.firstChild,
			item: item
		};
	};

	getWidth = function(element, withMargin) {
		var computedStyle = window.getComputedStyle(element);
		var width = parseInt(computedStyle.width);
		width += parseInt(computedStyle.paddingLeft) + parseInt(computedStyle.paddingRight);
		width += parseInt(computedStyle.borderLeftWidth) + parseInt(computedStyle.borderRightWidth);
		if (withMargin) {
			width += parseInt(computedStyle.marginLeft) + parseInt(computedStyle.marginRight);
		}
		return width;
	}

	getHeight = function(element, withMargin) {
		var computedStyle = window.getComputedStyle(element);
		var height = parseInt(computedStyle.height);
		height += parseInt(computedStyle.paddingTop) + parseInt(computedStyle.paddingBottom);
		height += parseInt(computedStyle.borderTopWidth) + parseInt(computedStyle.borderBottomWidth);
		if (withMargin) {
			height += parseInt(computedStyle.marginTop) + parseInt(computedStyle.marginBottom);
		}
		return height;
	}

	windowResize = function () {
		var resizeTimeOut = null;
		on(window, 'resize', function () {
			if (resizeTimeOut !== null) {
				clearTimeout(resizeTimeOut);
				resizeTimeOut = null;
			}
			resizeTimeOut = setTimeout(function () {
				dist.fire('resize', {
					width: window.innerWidth,
					height: window.innerHeight
				});
			}, 400);
		});
	};

	windowScroll = function () {
		var body = qs('body');
		var posTop = body.scrollTop;
		var posBottom = body.scrollTop + window.innerHeight;
		var scrollTimeOut = null;
		on(window, 'scroll', function () {
			if (scrollTimeOut !== null) {
				clearTimeout(scrollTimeOut);
				scrollTimeOut = null;
			}
			scrollTimeOut = setTimeout(function () {
				var scrollDown = posTop <= body.scrollTop ? true : false;
				posTop = body.scrollTop;
				posBottom = body.scrollTop + window.innerHeight;
				dist.fire('scroll', {
					pos: {
						top: posTop,
						bottom: posBottom
					},
					down: scrollDown
				});
			}, 200);
		});
	};

	animate = function (element, value, unit, start, stop, frames, cb, scope) {
		var currentPos = start;
		var currentFrame = 0;
		var change = stop - start;
		var tick = window.setInterval(function () {
			if (currentFrame < frames) {
				if (value.indexOf('scroll') !== - 1) {
					element[value] = currentPos;
				} else {
					element.style[value] = currentPos + unit;
				}
				currentPos = easeInOutCubic(currentFrame, start, change, frames);
				currentFrame += 1;
			}
			else {
				if (value.indexOf('scroll') !== - 1) {
					element[value] = stop;
				} else {
					element.style[value] = stop + unit;
				}
				clearInterval(tick);
				if (cb) {
					cb(scope);
				}
			}
		}, framesPerSecond);
	};

	fadeIn = function (element, frames, cb, scope) {
		runFade(element, frames, 0, 1, cb, scope);
	};

	fadeOut = function (element, frames, cb, scope) {
		runFade(element, frames, 1, 0, cb, scope);
	};

	runFade = function (element, frames, start, stop, cb, scope) {
		var currentValue = start;
		var currentFrame = 0;
		var change = (stop - start) / frames;
		var tick = window.setInterval(function () {
			if (currentFrame < frames) {
				element.style.opacity = currentValue.toString();
				currentValue += change;
				currentFrame += 1;
			}
			else {
				element.style.opacity = stop.toString();
				clearInterval(tick);
				if (cb) {
					cb(scope);
				}
			}
		}, framesPerSecond);
	};

	// t: currentTime, b: beginningValue, c: changeInValue, d: duration
	easeInOutCubic = function (t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t + b;
		return c/2*((t-=2)*t*t + 2) + b;
	};

	init = function () {
		dist = distributor();
		windowScroll();
		windowResize();
	};

	init();

	return Object.freeze({
		init: init,
		qs: qs,
		qsa: qsa,
		on: on,
		off: off,
		dist: dist,
		getJSON: getJSON,
		getFile: getFile,
		buildHTML: buildHTML,
		getWidth: getWidth,
		getHeight: getHeight,
		animate: animate,
		fadeIn: fadeIn,
		fadeOut: fadeOut
	});
});