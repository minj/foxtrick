/**
 * supportership-expiration-date.js
 * supplies ways to figure out what 'xyz days left' actually means
 * like translating it to an actual date etc.
 * @author CatzHoek
 */

'use strict';

Foxtrick.modules['SupportershipExpirationDate'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['dashboard'],

	/** @param {document} doc */
	run: function(doc) {
		if (!Foxtrick.util.layout.isSupporter(doc))
			return;

		// get the content, translate days to date
		let packageType =
			doc.getElementById('ctl00_ctl00_CPContent_CPSidebar_pnlSubscriptionPackageType');

		if (!packageType)
			return;

		let box = packageType.closest('.sidebarBox');

		/** @type {HTMLElement} */
		let container = box.querySelector('.myAccountCounter .flex-grow');

		// feature highlight
		Foxtrick.makeFeaturedElement(container, this);

		let dMatch = container.textContent.match(/\d+/);
		let days = parseInt(dMatch.toString(), 10);
		let now = Foxtrick.util.time.getDate(doc);
		if (!now) {
			Foxtrick.log('User time missing');
			return;
		}

		let endDate = Foxtrick.util.time.addDaysToDate(now, days);

		// get date in localized/correct format
		let printDate = Foxtrick.util.time.buildDate(endDate, { showTime: false });
		let newText = doc.createTextNode(printDate);

		// grab original text
		let img = container.querySelector('img');
		let prevText = img.nextSibling;

		// put text in containers
		let prevContainer = doc.createElement('div');
		let newContainer = doc.createElement('div');
		prevContainer.appendChild(prevText);
		newContainer.appendChild(newText);
		prevContainer.id = 'ft-supportershipexpirationdate-days';
		newContainer.id = 'ft-supportershipexpirationdate-date';

		// default visibility
		Foxtrick.addClass(newContainer, 'hidden');

		container.appendChild(prevContainer);
		container.appendChild(newContainer);

		// don't wanna have to create a css for that
		prevContainer.setAttribute('style', 'cursor:pointer;');
		newContainer.setAttribute('style', 'cursor:pointer;');

		// title l10n
		prevContainer.title =
			Foxtrick.L10n.getString('SupportershipExpirationDate.showExpirationDate');
		newContainer.title =
			Foxtrick.L10n.getString('SupportershipExpirationDate.showRemainingDayCount');

		// listener to switch
		var toggle = () => {
			let days = doc.getElementById('ft-supportershipexpirationdate-days');
			let date = doc.getElementById('ft-supportershipexpirationdate-date');
			Foxtrick.toggleClass(days, 'hidden');
			Foxtrick.toggleClass(date, 'hidden');
		};

		Foxtrick.onClick(prevContainer, toggle);
		Foxtrick.onClick(newContainer, toggle);
	},
};
