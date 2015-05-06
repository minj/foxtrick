'use strict';
/*
 * supportership-expiration-date.js
 * supplies ways to figure out what 'xyz days left' actually means like translating it to an actual date etc.
 * @author CatzHoek
 */

Foxtrick.modules['SupportershipExpirationDate'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['dashboard'],

	run: function(doc) {
		//get the content, translate days to date
		var container = doc.getElementById('ctl00_ctl00_CPContent_CPSidebar_pnlSupporterDays');

		//feature highlight
		Foxtrick.makeFeaturedElement(container, this);

		var days = container.textContent.match(/\d+/);
		var now = new Date();
		var endDate = Foxtrick.util.time.addDaysToDate(now, days);

		//get date in localized/correct format
		var printDate = Foxtrick.util.time.buildDate(endDate, { showTime: false });
		var newText = doc.createTextNode(printDate);

		//grab original text
		var prevText = container.firstChild.nextSibling.nextSibling;

		//put text in containers
		var prevContainer = doc.createElement('div');
		var newContainer = doc.createElement('div');
		prevContainer.appendChild(prevText);
		newContainer.appendChild(newText);
		prevContainer.setAttribute('id', 'ft-supportershipexpirationdate-days');
		newContainer.setAttribute('id', 'ft-supportershipexpirationdate-date');

		//default visibility
		Foxtrick.addClass(newContainer, 'hidden');

		container.appendChild(prevContainer);
		container.appendChild(newContainer);

		//don't wanna have to create a css for that shit
		prevContainer.setAttribute('style', "cursor:pointer;");
		newContainer.setAttribute('style', "cursor:pointer;");

		//title l10n n shit
		prevContainer.setAttribute('title', Foxtrick.L10n.getString('SupportershipExpirationDate.showExpirationDate') );
		newContainer.setAttribute('title', Foxtrick.L10n.getString('SupportershipExpirationDate.showRemainingDayCount') );

		//listener to switch the shit
		Foxtrick.onClick(prevContainer, function(ev){
			Foxtrick.toggleClass(doc.getElementById('ft-supportershipexpirationdate-days'), 'hidden');
			Foxtrick.toggleClass(doc.getElementById('ft-supportershipexpirationdate-date'), 'hidden')
		});
		Foxtrick.onClick(newContainer, function(ev){
			Foxtrick.toggleClass(doc.getElementById('ft-supportershipexpirationdate-days'), 'hidden');
			Foxtrick.toggleClass(doc.getElementById('ft-supportershipexpirationdate-date'), 'hidden');
		});
	}
};
