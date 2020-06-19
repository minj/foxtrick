/**
 * header-toggle.js
 * Foxtrick team select box
 * @author convinced
 */

'use strict';

Foxtrick.modules['HeaderToggle'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['all'],
	NICE: +20, // after we add own h2s
	CSS: Foxtrick.InternalPath + 'resources/css/header-toggle.css',

	addToggle: function(doc, header) {

		var pathname = doc.location.pathname;
		if (pathname.search(/\/$/) != -1)
			pathname += 'Default.aspx';

		var getH2TextContent = function(h2) {
			// remove some of our content to get original textContent of h2
			var h2Clone = Foxtrick.cloneElement(h2, true);
			var highlight = h2Clone.getElementsByClassName('highlight')[0];
			if (highlight)
				highlight.parentNode.removeChild(highlight);
			var ftpopuplist = h2Clone.getElementsByClassName('ft-popup-list')[0];
			if (ftpopuplist)
				ftpopuplist.parentNode.removeChild(ftpopuplist);
			return h2Clone.textContent;
		};

		var toggle = function(h2) {
			Foxtrick.toggleClass(h2, 'ft-expander-expanded');
			Foxtrick.toggleClass(h2, 'ft-expander-unexpanded');

			var key = ('HeaderToggle.' + pathname + '.' + getH2TextContent(h2) + '.folded')
				.replace(/\s+/g, '');
			if (Foxtrick.hasClass(h2, 'ft-expander-expanded'))
				Foxtrick.Prefs.deleteValue(key);
			else
				Foxtrick.Prefs.setBool(key, true);

			// eslint-disable-next-line complexity
			var toggleSiblings = function(header) {
				var parent = header.parentNode;
				var el = header.nextSibling;
				var forumThreads = {}, numUnread = 0;
				while (el) {
					// if text node, wrap in span on first encounter
					if (el.nodeType == Foxtrick.NodeTypes.TEXT_NODE) {
						if (el.nodeValue.trim().length) {
							let target = el.nextSibling;
							let span = doc.createElement('span');
							span.appendChild(el);
							el = parent.insertBefore(span, target);
						}
						else {
							el = el.nextSibling;
							continue;
						}
					}

					if (el.nodeType != Foxtrick.NodeTypes.ELEMENT_NODE) {
						el = el.nextSibling;
						continue;
					}

					// stop with next header or dedicated parentNode mainBox
					if ((el.className == 'mainBox' && el.querySelector('h2'))
						|| el.nodeName == 'H1'
						|| (el.nodeName == 'H2' && !Foxtrick.hasClass(el, 'info'))
						|| (el.querySelector('h2') &&
						    !Foxtrick.hasClass(el.querySelector('h2'), 'info'))) {
						break;
					}

					//use our own hidden class so we overrule ht but won't show stuff that is hidden for another reason
					Foxtrick.toggleClass(el, 'ft-headertoggle-hidden');

					// count new forum postings
					if (Foxtrick.hasClass(el, 'ft-headertoggle-hidden') &&
					    el.querySelector('.fplThreadInfo')) {
						var rows = el.getElementsByClassName('fplThreadInfo');
						Foxtrick.map(function(n) {
							var unread = n.querySelector('.highlight');
							if (unread) {
								var tid = unread.getAttribute('onclick').match(/'read\|(\d+)'/)[1];
								if (!forumThreads[tid])
									numUnread += Number(unread.textContent);
								forumThreads[tid] = true;
							}
						}, rows);
					}
					el = el.nextSibling;
				}

				// show new forum postings
				if (numUnread && h2.querySelector('.highlight')) {
					// var page_num = 0;
					// var pages = h2.parentNode.getElementsByClassName('page');
					// for (var i = 0; i < pages.length; ++i) {
					// 	if (pages[i].getAttribute('disabled') == 'disabled') {
					// 		page_num = Number(pages[i].textContent) - 1;
					// 	}
					// }

					let span = doc.createElement('span');
					span.className = 'highlight ft-dummy';
					span.textContent = '(' + numUnread + ')';
					Foxtrick.makeFeaturedElement(span, Foxtrick.modules.HeaderToggle);

					h2.appendChild(doc.createTextNode(' '));
					h2.appendChild(span);
				}
			};

			toggleSiblings(h2);
			if (h2.parentNode.nodeName == 'TD') {
				// in tables we also toggle sibling rows
				toggleSiblings(h2.parentNode.parentNode);
			}
		};

		// exclude new native colappse
		if (header.querySelector('i.icon-caret-down, i.icon-caret-up'))
			return;

		// exclude h2 of type info (eg training coach)
		let excludedClasses = ['info', 'ft-expander-expanded', 'ft-expander-unexpanded'];
		let excludedSelector = excludedClasses.map(c => `.${c}`).join(',');
		if (header.matches(excludedSelector))
			return;

		Foxtrick.onClick(header, function(ev) {
			toggle(ev.target);
		});

		Foxtrick.addClass(header, 'ft-expander-expanded');
		Foxtrick.makeFeaturedElement(header, Foxtrick.modules.HeaderToggle);
		var key = ('HeaderToggle.' + pathname + '.' + getH2TextContent(header) + '.folded')
			.replace(/\s+/g, '');
		if (Foxtrick.Prefs.getBool(key))
			toggle(header);
		else if (Foxtrick.isPage(doc, 'forumDefault')) {
			toggle(header);
			toggle(header);
		}
	},

	/** @param {document} doc */
	run: function(doc) {
		// add listener to all h2s in mainBody
		let h2s = [...doc.querySelectorAll('#mainBody h2')];
		for (let h2 of h2s.filter(h => !h.matches('.htbox-header') && !!h.closest('ng-app')))
			Foxtrick.modules.HeaderToggle.addToggle(doc, h2);
	},

	change: function(doc) {
		this.run(doc);
	}
};
