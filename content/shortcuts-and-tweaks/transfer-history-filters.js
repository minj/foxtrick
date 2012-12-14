'use strict';
/**
 * transfer-history-filters.js
 * filter options for transfer history
 * @author CatzHoek
 */

Foxtrick.modules['TransferHistoryFilters'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['transfersTeam'],
	CSS: Foxtrick.InternalPath + 'resources/css/transfer-history-filters.css',

	run: function(doc) {

		var options = ['all', 'bought', 'sold'];

		var before = doc.getElementById('ctl00_ctl00_CPContent_CPMain_ucPagerTop_divWrapper');

		var container = Foxtrick.createFeaturedElement(doc, this, 'div');
		var select = doc.createElement('select');
		var label = doc.createElement('label');
		label.setAttribute('for', 'ft-transfer-history-filter');
		label.textContent = Foxtrickl10n.getString('TransferHistoryFilters.filter');
		Foxtrick.addClass(label, 'ft-transfer-history-filter-label');
		Foxtrick.addClass(label, 'strong');
		select.setAttribute('id', 'ft-transfer-history-filter');
		select.setAttribute('name', 'select');
		select.id = 'ft-transfer-history-filter';
		var o;
		for (o in options) {
			var option = doc.createElement('option');
			option.textContent = Foxtrickl10n.getString('TransferHistoryFilters.' + options[o]);
			option.setAttribute('value', options[o]);
			select.appendChild(option);
		}
		container.appendChild(label);
		container.appendChild(select);
		Foxtrick.addClass(container, 'ft-transfer-history-filter-container');
		before.parentNode.insertBefore(container, before);

		var clear = Foxtrick.createFeaturedElement(doc, this, 'div');
		Foxtrick.addClass(clear, 'ft-clear-both');
		before.parentNode.insertBefore(clear, before);

		Foxtrick.listen(select, 'change', function() {
			try {
				Foxtrick.log(select.value);
				switch (select.value) {
					case 'sold':
					showAll(); hideBought(); break;
					case 'bought':
					showAll(); hideSold(); break;
					case 'all':
					showAll();break;
				}
			}
			catch (e) {
				Foxtrick.log(e);
			}
		}, false);

		var table = doc.getElementById('mainBody').getElementsByTagName('table')[1];

		var showAll = function() {
			Foxtrick.log('show all');
			var images = table.getElementsByTagName('img');
			for (var i = 0; i < images.length; i++)
				Foxtrick.removeClass(images[i].parentNode.parentNode, 'hidden');
		};
		var hideBought = function() {
			Foxtrick.log('hide bought');
			var images = table.getElementsByTagName('img');
			for (var i = 0; i < images.length; i++) {
				if (images[i].src.search('transfer_in.gif') > -1)
					Foxtrick.addClass(images[i].parentNode.parentNode, 'hidden');
			}
		};
		var hideSold = function() {
			Foxtrick.log('hide sold');
			var images = table.getElementsByTagName('img');
			for (var i = 0; i < images.length; i++) {
				if (images[i].src.search('transfer_out.gif') > -1)
					Foxtrick.addClass(images[i].parentNode.parentNode, 'hidden');
			}
		};
	}
};
