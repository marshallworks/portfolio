define(['_', 'UT'],function (_, UT) {
	'use strict';

	// Globals
	var images = [], stage;

	// Functions
	var process, create, render, init;

	process = function (data) {
		_.forEach(data, function(image) {
			images.push(create(image));
		});
		return images;
	};

	create = function (spec) {
		var title = spec.title || '',
			description = spec.description || '',
			file = spec.file || '';

		var build = function () {
			var template = UT.qs('#template_Image').textContent;
			return UT.buildHTML({
				template: template,
				data: {
					title: title,
					description: description,
					file: file
				},
				selectors: []
			});
		}

		var buildModal = function () {
			var processor = document.createElement('div');
			processor.appendChild(elements.html);
			var template = UT.qs('#template_FullScreen').textContent;
			var image = processor.innerHTML;
			return UT.buildHTML({
				template: template,
				data: {
					title: title,
					description: description,
					image: image
				},
				selectors: ['.close']
			});
		};

		var open = function () {
			var body = UT.qs('body');
			body.appendChild(modal.html);
			UT.fadeIn(modal.html, 32);
		};

		var close = function () {
			var body = UT.qs('body');
			UT.fadeOut(modal.html, 32, function() {
				body.removeChild(modal.html);
			});
		};

		var elements = build();
		var modal = buildModal();

		UT.on(elements.html, 'click', open);
		UT.on(modal.item['.close'], 'click', close);

		return Object.freeze({
			elements: elements
		});
	};

	render = function () {
		stage.innerHTML = '';
		_.forEach(images, function(image) {
			stage.appendChild(image.elements.html);
		});
	};

	init = function () {
		stage = UT.qs('.creative');
	};

	return Object.freeze({
		process: process,
		render: render,
		init: init
	});
});