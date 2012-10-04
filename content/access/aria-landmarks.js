'use strict';
/**
 * aria-landmarks.js
 * adds landmarks to the website
 * @author catzhoek
 */

Foxtrick.modules['ARIALandmarks'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.ACCESSIBILITY,
	PAGES: ['all'],
	NICE: 50, //after everything

	run: function(doc) {

		var addLandmarks = function(doc) {
			//header/banner
			try {
				doc.getElementById('header').setAttribute('role', 'banner');
			} catch (e) {}

			//Foxtrick needs auth
			try {
				doc.getElementById('ctl00_ctl00_CPContent_ucNotifications_updNotifications')
					.setAttribute('role', 'main');
			} catch (e) {}

			//main navigation
			try {
				doc.getElementById('menu').setAttribute('role', 'navigation');
			} catch (e) {}

			//team navigation
			try {
				doc.getElementsByClassName('subMenu')[0].setAttribute('role', 'navigation');
			} catch (e) {}

			//main
			try {
				doc.getElementById('mainWrapper').setAttribute('role', 'main');
			} catch (e) {}

			//main in forum
			try {
				doc.getElementById('ctl00_ctl00_CPContent_mainWrapper').setAttribute('role', 'main');
			} catch (e) {}

			//forum list
			try {
				doc.getElementsByClassName('subMenuBox')[0].setAttribute('role', 'navigation');
			} catch (e) {}

			//sidebars
			try {
				var sidebars = doc.getElementsByClassName('sidebarBox');
				for (var i = 0; i < sidebars.length; i++)
					sidebars[i].setAttribute('role', 'complementary');
			} catch (e) {}

			//search
			try {
				var header = doc.getElementById('header');
				var links = header.getElementsByTagName('a');
				for (var i = 0; i < links.length; i++)
					if (links[i].href.search('/Search/') > -1)
						links[i].setAttribute('role', 'search');
			} catch (e) {}

			//forum search
			try {
				var sidebars = doc.getElementsByClassName('forumSearch');
				for (var i = 0; i < sidebars.length; i++)
					sidebars[i].setAttribute('role', 'search');
			} catch (e) {}

			//footer
			try {
				doc.getElementById('footer').setAttribute('role', 'contentinfo');
			} catch (e) {}
		};
		addLandmarks(doc);
	}
};
