define(['_', 'UT'],function (_, UT) {
	'use strict';

	// Globals
	var header;

	// Functions
	var create, init;

	create = function (container) {
		var body = document.body;
		var button = UT.qs('.nav-toggle', container);
		var nav = UT.qs('nav.site', container);
		var openHeight = nav.clientHeight;
		var headerAfixed = false;

		var navLink = function (element) {
			var anchor = UT.qs('a', element);
			var target = anchor.hash;

			var scrollTo = function (event) {
				event.preventDefault();
				UT.animate(body, 'scrollTop', 'px', body.scrollTop, UT.qs(target).offsetTop - 68, 32);
				if (window.innerWidth <= 660) {
					close();
				}
			};

			UT.on(element, 'click', scrollTo);
		};

		var open = function () {
			button.classList.add('active');
			UT.animate(nav, 'height', 'px', 0, openHeight, 28);
			nav.classList.add('active');
		};

		var close = function () {
			button.classList.remove('active');
			UT.animate(nav, 'height', 'px', openHeight, 0, 28, function() {
				nav.classList.remove('active');
			});
		};

		var toggle = function () {
			if (nav.style.height === '0px') {
				open();
			} else {
				close();
			}
		};

		var afixHeader = function(afix, animate) {
			if (afix !== headerAfixed) {
				if (afix) {
					headerAfixed = true;
					container.style.position = 'fixed';
					container.style.top = '-' + container.clientHeight + 'px';
					body.style.paddingTop = container.clientHeight + 'px';
					if (animate) {
						UT.animate(header, 'top', 'px', -container.clientHeight, 0, 24);
					} else {
						container.style.top = '0px';
					}
				} else {
					headerAfixed = false;
					container.style.top = '0px';
					if (animate) {
						UT.animate(header, 'top', 'px', 0, -container.clientHeight, 24, function () {
							container.style.position = 'relative';
							container.style.top = '0px';
							body.style.paddingTop = '0px';
						});
					} else {
						container.style.position = 'relative';
						body.style.paddingTop = '0px';
					}
				}
			}
		};

		var resize = function (data) {
			if (data.width > 660) {
				nav.style.height = '';
				container.classList.add('desktop');
				nav.classList.remove('active');
			} else {
				nav.style.height = '0px';
				container.classList.remove('desktop');
				button.classList.remove('active');
			}
		};

		var scroll = function (data) {
			var afix = !data.down && data.pos.top >= container.clientHeight ? true : false;
			var animate = data.pos.top < container.clientHeight ? false : true;
			afixHeader(afix, animate);
		};

		UT.on(button, 'click', toggle);

		UT.dist.register('resize', resize);
		UT.dist.register('scroll', scroll);

		resize({
			width: window.innerWidth,
			height: window.innerHeight
		});

		_.forEach(UT.qsa('li', container), function(link) {
			navLink(link);
		});

		return Object.freeze({});
	};

	init = function () {
		header = UT.qs('header.main');
		create(header);
	};

	return Object.freeze({
		init: init
	});
});