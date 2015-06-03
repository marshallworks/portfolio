require.config({
	paths: {
		UT: 'helpers/utilities',
		'_': 'lib/lodash'
	}
});

require(['_', 'UT', 'modules/menu', 'modules/projects', 'modules/creative', 'modules/code'],
	function(_, UT, Menu, Projects, Creative, Code) {
	'use strict';

	// Primary Function Names
	var processData, updateView, init;

	processData = function (data) {
		Projects.process(data['projects']);
		Creative.process(data['images']);
		Code.process(data['code']);
		updateView();
	};

	updateView = function() {
		Projects.render();
		Creative.render();
	};

	// Primary Function Declerations
	init = function () {
		Menu.init();
		Projects.init();
		Creative.init();
		Code.init();
		UT.getJSON('data/main.json', processData);
		return true;
	};

	UT.on(window, 'load', init);
});
