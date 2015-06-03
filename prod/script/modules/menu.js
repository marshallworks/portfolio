define(['_', 'UT'],function (_, UT) {
	'use strict';

	// Globals
	var header;

	// Functions
	var initMainMenu, create, init;

	initMainMenu = function () {
		var closeNav, openNav, updateNavHeight, create_navItem, toggleButton, afixHeader;
		var navItems = [];
		var page = UT.qs('div.page');
		var header = UT.qs('header.main');
		var menuButton = UT.qs('.nav-toggle');
		var navContainer = UT.qs('.nav-container');
		var navLinks = UT.qs('.nav-links', navContainer);
		var navHeight = 0;
		var navOpenHeight = navLinks.clientHeight;
		var navCloseHeight = 0;
		var headerAfixed = false;

		closeNav = function () {
			UT.animate(navLinks, 'height', navOpenHeight, navCloseHeight, 24);
			navHeight = navCloseHeight;
		};

		openNav = function () {
			UT.animate(navLinks, 'height', navCloseHeight, navOpenHeight, 24);
			navHeight = navOpenHeight;
		};

		updateNavHeight = function (heightChange) {
			UT.animate(navLinks, 'height', navHeight, navHeight + heightChange, 24);
			navHeight = navHeight + heightChange;
			navOpenHeight += heightChange;
		};

		toggleButton = function (event) {
			event.preventDefault();
			menuButton.classList.toggle('active');
			if (navLinks.style.height === navCloseHeight + 'px') {
				openNav();
			} else {
				closeNav();
			}
		};

		create_navItem = function (attr) {
			var element = attr.element;
			var dropdown = UT.qs('.dropdown-container', element);
			var openHeight = attr.openHeight || dropdown.clientHeight;
			var closeHeight = attr.closeHeight || 0;

			var close = function () {
				UT.animate(dropdown, 'height', openHeight, closeHeight, 24);
				if (window.outerWidth < 1200) {
					updateNavHeight(-openHeight);
				}
			};

			var open = function () {
				UT.animate(dropdown, 'height', closeHeight, openHeight, 24);
				if (window.outerWidth < 1200) {
					updateNavHeight(openHeight);
				}
			};

			var toggle = function (event) {
				element.classList.toggle('open');
				if (dropdown.style.height === closeHeight + 'px') {
					event.preventDefault();
					open();
				} else {
					close();
				}
			};

			var reset = function () {
				dropdown.style.height = '';
				openHeight = dropdown.clientHeight;
			};

			var resize = function () {
				if (window.outerWidth >= 1200) {
					UT.off(element, 'click', toggle);
					UT.on(element, 'mouseenter', open);
					UT.on(element, 'mouseleave', close);
				} else {
					UT.on(element, 'click', toggle);
					UT.off(element, 'mouseenter', open);
					UT.off(element, 'mouseleave', close);
				}
				navOpenHeight -= openHeight;
				dropdown.style.height = 0;
			};

			resize();

			return Object.freeze({
				reset: reset,
				resize: resize
			});
		};

		afixHeader = function(afix, animate) {
			if (afix !== headerAfixed) {
				if (afix) {
					headerAfixed = true;
					header.style.position = 'fixed';
					header.style.top = '-' + header.clientHeight + 'px';
					page.style.marginTop = header.clientHeight + 'px';
					if (animate) {
						UT.animate(header, 'top', -header.clientHeight, 0, 24);
					} else {
						header.style.top = '0px';
					}
				} else {
					headerAfixed = false;
					header.style.top = '0px';
					if (animate) {
						UT.animate(header, 'top', 0, -header.clientHeight, 24, function () {
							header.style.position = 'relative';
							header.style.top = '0px';
							page.style.marginTop = '0px';
						});
					} else {
						header.style.position = 'relative';
						page.style.marginTop = '0px';
					}
				}
			}
		};

		UT.qsa('nav.primary li.top-level').forEach(function (element) {
			if (UT.qs('.dropdown-container', element)) {
				element.classList.add('has-dropdown');
				navItems.push(create_navItem({ element: element }));
			}
		});

		var resize = function () {
			navItems.forEach(function(item) {
				item.reset();
			});
			navHeight = 0;
			navLinks.style.height = '';
			navOpenHeight = navLinks.clientHeight;
			if (window.outerWidth < 1200) {
				navLinks.style.height = 0;
				UT.on(menuButton, 'click', toggleButton);
			} else {
				navLinks.style.height = '';
				UT.off(menuButton, 'click', toggleButton);
			}
			navItems.forEach(function(item) {
				item.resize();
			});
		};

		var scroll = function (data) {
			var afix = !data.down && data.pos.top >= navContainer.clientHeight ? true : false;
			var animate = data.pos.top < navContainer.clientHeight ? false : true;
			afixHeader(afix, animate);
		};

		dist.register('resize', resize);
		dist.register('scroll', scroll);
		resize();
	};

	create = function (container) {
		var button = UT.qs('.nav-toggle', container);
		var nav = UT.qs('nav.site', container);
		var openHeight = nav.clientHeight;

		var toggle = function () {
			button.classList.toggle('active');
			if (nav.style.height === '0px') {
				UT.animate(nav, 'height', 'px', 0, openHeight, 28);
				nav.classList.add('active');
			} else {
				UT.animate(nav, 'height', 'px', openHeight, 0, 28, function() {
					nav.classList.remove('active');
				});
			}
		};

		nav.style.height = '0px';

		UT.on(button, 'click', toggle);
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