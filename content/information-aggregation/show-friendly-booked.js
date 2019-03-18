/**
 * show-friendly-booked.js
 * Show whether a team has booked friendly on series page
 * @author ryanli
 */

'use strict';

Foxtrick.modules['ShowFriendlyBooked'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['series'],
	OPTIONS: ['OnDemand'],
	CSS: Foxtrick.InternalPath + 'resources/css/show-friendly-booked.css',

	/** @param {document} doc */
	run: function(doc) {
		const module = this;

		var show = function() {
			let leagueTable = Foxtrick.Pages.Series.getTable(doc);
			let rowCol = leagueTable.getElementsByTagName('tr');

			// remove header row and ownerless teams
			let rows = Foxtrick.filter(function(n) {
				let isHeader = () => n.querySelector('th');
				let inCup = () => n.querySelector('td:nth-of-type(4) img');
				let isOwnerless = () => n.querySelector('shy');

				return !isHeader() && !inCup() && !isOwnerless();
			}, rowCol);

			// see whether friendly booked
			Foxtrick.forEach(function(n) {
				let teamCell = n.getElementsByTagName('td')[2];
				let teamLink = teamCell.getElementsByTagName('a')[0].href;
				let teamId = Foxtrick.util.id.getTeamIdFromUrl(teamLink);

				let destCell = n.getElementsByTagName('td')[3];
				destCell.textContent = Foxtrick.L10n.getString('status.loading.abbr');
				destCell.title = Foxtrick.L10n.getString('status.loading');

				let params = [
					['file', 'teamdetails'],
					['teamId', teamId],
				];
				Foxtrick.util.api.retrieve(doc, params, { cache: 'default' }, (xml, errorText) => {
					if (!xml || errorText) {
						destCell.textContent = Foxtrick.L10n.getString('status.error.abbr');
						destCell.title = errorText;
						Foxtrick.log(errorText);
						return;
					}

					// reset textContent and title
					destCell.textContent = '';
					destCell.removeAttribute('title');

					let friendly = xml.node('FriendlyTeamID');
					if (friendly.getAttribute('Available') != 'True') {
						destCell.textContent = Foxtrick.L10n.getString('status.unknown.abbr');
						destCell.title = Foxtrick.L10n.getString('status.unknown');
					}
					else if (friendly.textContent != '0') {
						// friendly booked
						let img = doc.createElement('img');
						img.src = '/Img/Icons/transparent.gif';
						img.alt = img.title = Foxtrick.L10n.getString('team.status.booked');
						img.className = 'ft_friendly';
						Foxtrick.makeFeaturedElement(img, module);
						destCell.appendChild(img);
					}
				});
			}, rows);
		};

		// add the stuffs
		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'OnDemand')) {
			// show on demand
			let link = Foxtrick.createFeaturedElement(doc, this, 'a');
			link.id = 'ft-show-friendlies';
			link.className = 'float_left ft-link';
			link.textContent = Foxtrick.L10n.getString('ShowFriendlyBooked.ShowFriendlies');
			Foxtrick.onClick(link, function() {
				link.parentNode.removeChild(link);
				show();
			});
			if (Foxtrick.util.layout.isSupporter(doc)) {
				let liveTable = Foxtrick.Pages.Series.getLiveTable(doc);
				liveTable.insertBefore(link, liveTable.querySelector('br').nextSibling);
			}
			else {
				let table = Foxtrick.Pages.Series.getTable(doc);
				let parent = table.parentNode;
				parent.parentNode.insertBefore(link, parent);

				// style.clear needed before the table
				let clear = doc.createElement('div');
				clear.className = 'clear';
				parent.parentNode.insertBefore(clear, parent);
			}
		}
		else {
			// show automatically
			show();
		}
	},
};
