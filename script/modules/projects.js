define(['_', 'UT'],function (_, UT) {
	'use strict';

	// Globals
	var projects = [], stage;

	// Functions
	var process, create, createStage, render, init;

	process = function (data) {
		_.forEach(data, function(project) {
			projects.push(create(project));
		});
		return projects;
	};

	create = function (spec) {
		var client = spec.client || '',
			logo = spec.logo || 'placeholder.png',
			link = spec.link || '',
			actual = spec.actual || false,
			screens = spec.screens || [],
			code = spec.code || [],
			year = spec.year || 2015,
			duration = spec.duration || 0,
			contribution = spec.contribution || '';

		var focus = function () {
			stage.focus(elements.item['.detail'].innerHTML, logo);
		}

		var build = function () {
			var template = UT.qs('#template_Project').textContent;
			var linkHtml = '';
			var images = '';
			if (link !== '') {
				if (actual) {
					linkHtml = '<a href="' + link + '">Website</a>';
				} else {
					linkHtml = '<a href="' + link + '">Related</a>';
				}
			}
			_.forEach(screens, function(screen) {
				images += '<img src="/assets/screens/' + screen + '">'
			});
			return UT.buildHTML({
				template: template,
				data: {
					logo: logo,
					client: client,
					link: linkHtml,
					contribution: contribution,
					images: images
				},
				selectors: ['.project', '.logo', '.detail']
			});
		}

		var elements = build();

		UT.on(elements.item['.logo'], 'click', focus);

		return Object.freeze({
			logo: logo,
			elements: elements
		});
	};

	createStage = function (spec) {
		var container = spec.container;
		var logoHeight = 128;
		var logosHeight = 0;
		var open = false;
		var focus = '';

		var build = function () {
			var template = UT.qs('#template_Stage').textContent;
			return UT.buildHTML({
				template: template,
				data: {},
				selectors: ['.stage', '.client-logos', '.list', '.focus', '.focus-content', '.close']
			});
		};

		var render = function () {
			container.innerHTML = '';
			elements.item['.list'].innerHTML = '';
			_.forEach(projects, function(project) {
				elements.item['.list'].appendChild(project.elements.html);
			});
			container.appendChild(elements.item['.stage']);
		}

		var getAllLogoWidth = function () {
			return _.reduce(projects, function(total, project) {
				return total + UT.getWidth(project.elements.html, true);
			}, 0);
		};

		var getLogoPosition = function (logo) {
			var preds = _.takeWhile(projects, function(project) {
				return project.logo !== logo;
			});
			return _.reduce(preds, function(total, project) {
				return total + UT.getWidth(project.elements.html, true);
			}, 0);
		};

		var openFocus = function () {
			var clientLogoStart = elements.item['.client-logos'].clientHeight;
			var targetHeight = elements.item['.focus-content'].clientHeight;
			if (!open) {
				elements.item['.client-logos'].classList.add('open');
				elements.item['.list'].style.width = getAllLogoWidth() + 'px';
				elements.item['.list'].style.height = logoHeight + 'px';
				UT.animate(elements.item['.client-logos'],
					'height', 'px',
					clientLogoStart,
					logoHeight, 32);
			}
			UT.animate(elements.item['.focus'],
				'height', 'px',
				elements.item['.focus'].clientHeight,
				targetHeight, 32, function() {
					open = true;
				});
			gotoFocus();
		};

		var closeFocus = function () {
			elements.item['.client-logos'].classList.remove('open');
			elements.item['.list'].style.width = '';
			elements.item['.list'].style.height = '';
			UT.animate(elements.item['.client-logos'],
				'height', 'px',
				elements.item['.client-logos'].clientHeight,
				logosHeight, 32, function() {
					open = false;
					elements.item['.client-logos'].style.height = '';
					logosHeight = elements.item['.client-logos'].clientHeight;
				});
			UT.animate(elements.item['.focus'],
				'height', 'px',
				elements.item['.focus'].clientHeight,
				0, 32);
		};

		var gotoFocus = function () {
			var curPos = elements.item['.list'].offsetLeft;
			var toPos = -getLogoPosition(focus) + (elements.item['.client-logos'].clientWidth / 2);
			UT.animate(elements.item['.list'], 'left', 'px', curPos, toPos - 76, 22);
		};

		var focus = function (content, logo) {
			focus = logo;
			elements.item['.focus-content'].innerHTML = content;
			openFocus();
		};

		var elements = build();

		closeFocus();

		UT.on(elements.item['.close'], 'click', closeFocus);

		return Object.freeze({
			render: render,
			focus: focus,
			elements: elements
		});
	};

	render = function () {
		stage.render();
	};

	init = function () {
		stage = createStage({
			container: UT.qs('.projects')
		});
	};

	return Object.freeze({
		process: process,
		render: render,
		init: init
	});
});