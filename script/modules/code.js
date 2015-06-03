define(['_', 'UT'],function (_, UT) {
	'use strict';

	// Static
	var CODE_ORDER = ['typescript', 'javascript', 'coffee', 'scss', 'html', 'python', 'ruby', 'go', 'haskell'];
	var LANG_TITLE = {
		typescript: 'TypeScript',
		javascript: 'JavaScript',
		coffee: 'CoffeeScript',
		scss: 'Sass',
		html: 'HTML',
		python: 'Python',
		ruby: 'Ruby',
		go: 'Go',
		haskell: 'Haskell'
	};

	// Globals
	var codeFiles = [], codeLangs = [], codeZone;

	// Functions
	var process, create, createLang, createZone, getLangCounts, init;

	process = function (data) {
		var langCounts;
		_.forEach(data, function(codeFile) {
			codeFiles.push(create(codeFile));
		});
		langCounts = getLangCounts(codeFiles);
		_.forEach(CODE_ORDER, function(lang) {
			codeLangs.push(createLang({
				lang: lang,
				count: langCounts[lang]
			}));
		});
		codeZone.render();
		return codeFiles;
	};

	create = function (spec) {
		var name = spec.name || '',
			description = spec.description || '',
			lang = spec.lang || 'plain',
			file = spec.file;
		var text = '';
		var anchor = document.createElement('a');
		anchor.innerHTML = name;

		var getText = function (event) {
			event.preventDefault();
			if (text === '') {
				UT.getFile('/assets/code/' + file, setText);
			} else {
				setText();
			}
		};

		var setText = function (data) {
			if (data !== null) {
				text = _.escape(data);
			}
			if (anchor.classList.contains('active')) {
				codeZone.showCode('', '');
			} else {
				codeZone.showCode('<pre><code class="' + lang + '">' + text + '</code></pre>', name);
			}
		};

		var init = function () {
			UT.on(anchor, 'click', getText);
		};

		init();

		return Object.freeze({
			name: name,
			description: description,
			lang: lang,
			anchor: anchor
		});
	};

	createLang = function (spec) {
		var lang = spec.lang,
			title = LANG_TITLE[lang],
			icon = lang + '.png',
			count = spec.count || 0;

		var filter = function () {
			if (elements.item['.language'].classList.contains('active')) {
				codeZone.filterCode('');
			} else {
				codeZone.filterCode(lang);
			}
		};

		var activate = function () {
			elements.item['.language'].classList.add('active');
		};

		var deactivate = function () {
			elements.item['.language'].classList.remove('active');
		};

		var build = function () {
			var template = UT.qs('#template_Language').textContent;
			return UT.buildHTML({
				template: template,
				data: {
					file: icon,
					title: title,
					count: count
				},
				selectors: ['.language']
			});
		};

		var elements = build();

		UT.on(elements.item['.language'], 'click', filter);

		return Object.freeze({
			elements: elements,
			activate: activate,
			deactivate: deactivate,
			lang: lang
		});
	};

	createZone = function () {

		var container = UT.qs('.code-section');

		var filterCode = function (target) {
			_.forEach(codeLangs, function(codeLang) {
				if (codeLang.lang === target) {
					codeLang.activate();
				} else {
					codeLang.deactivate();
				}
			});
			elements.item['.sample-list'].innerHTML = '';
			_.forEach(codeFiles, function(codeFile) {
				if (codeFile.lang === target || target === '') {
					elements.item['.sample-list'].appendChild(codeFile.anchor);
				}
			});
		};

		var showCode = function (content, target) {
			var targetHeight = 0;
			var sampleContent = '';
			_.forEach(codeFiles, function(codeFile) {
				if (codeFile.name === target) {
					codeFile.anchor.classList.add('active');
					sampleContent = '<h4>' + codeFile.name + ' &mdash; ' + LANG_TITLE[codeFile.lang] + '</h4>';
					sampleContent += '<p>' + codeFile.description + '</p>'
				} else {
					codeFile.anchor.classList.remove('active');
				}
			});
			elements.item['.code'].innerHTML = content;
			elements.item['.sample-detail'].innerHTML = sampleContent;
			if (content !== '') {
				targetHeight = UT.qs('pre', elements.item['.code']).clientHeight  + 16;
				hljs.highlightBlock(elements.item['.code']);
			} else {
				elements.item['.code'].classList.remove('hljs');
			}
			UT.animate(elements.item['.code'],
				'height', 'px',
				elements.item['.code'].clientHeight,
				targetHeight, 32);
		};

		var build = function () {
			var template = UT.qs('#template_Code').textContent;
			return UT.buildHTML({
				template: template,
				data: {},
				selectors: ['.languages', '.sample-list', '.sample-detail', '.code']
			});
		}

		var render = function () {
			var langCounts = getLangCounts(codeFiles);
			container.innerHTML = '';
			elements.item['.sample-list'].innerHTML = '';
			elements.item['.languages'].innerHTML = '';
			_.forEach(codeFiles, function(codeFile) {
				elements.item['.sample-list'].appendChild(codeFile.anchor);
			});
			_.forEach(codeLangs, function(codeLang) {
				elements.item['.languages'].appendChild(codeLang.elements.html);
			});
			container.appendChild(elements.html);
		};

		var elements = build();
		elements.item['.code'].style.height = '0px';

		return Object.freeze({
			showCode: showCode,
			filterCode: filterCode,
			render: render
		});
	};

	getLangCounts = function (codes) {
		var result = {};
		codes.forEach(function(codeFile) {
			if (result.hasOwnProperty(codeFile.lang)) {
				result[codeFile.lang] += 1;
			} else {
				result[codeFile.lang] = 1;
			}
		});
		return result;
	};

	init = function () {
		hljs.configure({
			tabReplace: '    ',
			style: 'mono-blue'
		});
		codeZone = createZone();
	};

	return Object.freeze({
		process: process,
		init: init
	});
});