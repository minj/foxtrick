/**
 * local-time.js
 * Show time in local time zone
 * @author ryanli
 */

'use strict';

Foxtrick.modules.LocalTime = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	OUTSIDE_MAINBODY: true,
	PAGES: ['all'],
	NICE: -10, // place before HTDateFormat, below everything that adds dates
	CSS: Foxtrick.InternalPath + 'resources/css/local-time.css',

	/** @param {document} doc */
	run: function(doc) {
		const module = this;

		// icon for Hattrick time zone
		var time = doc.getElementById('time');
		time.title = Foxtrick.L10n.getString('LocalTime.hattrick.title');
		time = Foxtrick.makeFeaturedElement(time, module);

		// set up local time div at the header
		var localTime = Foxtrick.createFeaturedElement(doc, module, 'div');
		localTime.id = 'ft-local-time';

		var updateTime = function() {
			localTime.textContent = Foxtrick.util.time.buildDate(void 0, { showSecs: true });
		};

		// Chrome needs characterData, FF needs childList
		Foxtrick.onChange(time, updateTime, { characterData: true });

		localTime.title = Foxtrick.L10n.getString('LocalTime.local.title');
		time.parentNode.insertBefore(localTime, time);

		// to tell whether #time or #ft-local-time should be hidden
		if (Foxtrick.Prefs.getBool('module.LocalTime.local')) {
			updateTime();
			Foxtrick.addClass(time, 'hidden');
		}
		else {
			Foxtrick.addClass(localTime, 'hidden');
		}

		// add on-click events for toggling between local/user times
		/** @type {Listener<HTMLElement, MouseEvent>} */
		var toggleDisplay = function() {
			let local = Foxtrick.Prefs.getBool('module.LocalTime.local');
			Foxtrick.Prefs.setBool('module.LocalTime.local', !local);
			Foxtrick.toggleClass(time, 'hidden');
			Foxtrick.toggleClass(localTime, 'hidden');
			// eslint-disable-next-line no-invalid-this
			module.updatePage(this.ownerDocument);
		};
		Foxtrick.onClick(time, toggleDisplay);
		Foxtrick.onClick(localTime, toggleDisplay);

		module.updatePage(doc);
	},

	/** @param {document} doc */
	change: function(doc) {
		this.updatePage(doc);
	},

	/**
	 * updates all dates within the page
	 * @param {document} doc
	 */
	updatePage: function(doc) {
		// only deal with nodes with class date in mainBody
		let mainBody = doc.getElementById('mainBody');
		if (!mainBody)
			return;

		// extract local and HT dates
		/** @type {NodeListOf<HTMLElement>} */
		let col = mainBody.querySelectorAll('.date');

		// if text doesn't have time (hours and minutes) in it,
		// ignore it
		var dates = [...col].filter(n => Foxtrick.util.time.hasTime(n.textContent));

		/**
		 * @param {HTMLElement} el
		 * @return {boolean}
		 */
		var isLocalDate = el => !!el.dataset.localTime;

		let localDates = dates.filter(isLocalDate);
		let userDates = dates.filter(n => !isLocalDate(n));

		if (Foxtrick.Prefs.getBool('module.LocalTime.local')) {
			// turn User dates to local dates
			for (let date of userDates) {
				date.dataset.localTime = '1';

				let userDate = Foxtrick.util.time.getDateFromText(date.textContent);
				if (!userDate)
					return; // may only contain time without date

				let localDate = Foxtrick.util.time.toLocal(doc, userDate);
				if (!localDate)
					return;

				let ddl = date.querySelector('.ft-deadline');

				// always build strings with hours and seconds, but without seconds
				let newText = Foxtrick.util.time.buildDate(localDate);
				let texts = Foxtrick.getTextNodes(date);
				let targets = texts.filter(t => t.textContent.indexOf(newText) > -1);
				targets.forEach((t) => {
					t.textContent = Foxtrick.util.time.buildDate(localDate);
				});

				if (ddl)
					date.appendChild(ddl);

				// set original time as attribute for reference from other modules
				date.dataset.userDate = String(userDate.getTime());
			}
		}
		else {
			// turn local dates to user dates
			for (let date of localDates) {
				let timestamp = new Date(Number(date.dataset.userDate));
				let ddl = date.querySelector('.ft-deadline');
				date.textContent = Foxtrick.util.time.buildDate(timestamp);
				if (ddl)
					date.appendChild(ddl);

				date.removeAttribute('data-local-time');
				date.removeAttribute('data-user-date');
			}
		}
	},
};
