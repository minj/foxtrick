/**
 * show-friendly-booked.js
 * Show whether a team has booked friendly on series page
 * @author ryanli, LA-MJ
 */

'use strict';

Foxtrick.modules.ShowFriendlyBooked = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['series'],
	OPTIONS: ['OnDemand'],
	CSS: Foxtrick.InternalPath + 'resources/css/show-friendly-booked.css',

	/** @param {document} doc */
	run: function(doc) {
		const module = this;
		let leagueTable = Foxtrick.Pages.Series.getTable(doc);
		if (!leagueTable)
			return;

		var show = function() {
			let rowCol = leagueTable.querySelectorAll('tr');

			// remove header row and ownerless teams
			let rows = Foxtrick.filter(function(n) {
				let isHeader = () => !!n.querySelector('th');
				let isOwnerless = () => !!n.querySelector('.shy');
				let inCup = () => !!n.querySelector('img[src*="cup"i]');

				return !isHeader() && !inCup() && !isOwnerless();
			}, rowCol);

			// see whether friendly booked
			for (let row of rows) {
				let teamCell = row.cells[3];
				let teamLink = teamCell.querySelector('a').href;
				let teamId = Foxtrick.util.id.getTeamIdFromUrl(teamLink);

				let destCell = row.cells[4];
				destCell.textContent = Foxtrick.L10n.getString('status.loading.abbr');
				destCell.title = Foxtrick.L10n.getString('status.loading');

				/** @type {CHPPParams} */
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
			}
		};

		// add the stuffs
		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'OnDemand')) {
			// show on demand
			let link = Foxtrick.createFeaturedElement(doc, module, 'a');
			link.id = 'ft-show-friendlies';
			link.className = 'float_left ft-link';
			link.textContent = Foxtrick.L10n.getString(`${module.MODULE_NAME}.ShowFriendlies`);

			Foxtrick.onClick(link, function() {
				// eslint-disable-next-line no-invalid-this
				this.remove();
				try {
					show();
				}
				catch (e) {
					Foxtrick.catch(module)(e);
				}
			});

			if (Foxtrick.util.layout.isSupporter(doc)) {
				let updPnlLiveLeagueTable = Foxtrick.Pages.Series.getLiveTable(doc);
				Foxtrick.insertBefore(link, updPnlLiveLeagueTable.querySelector('br'));
			}
			else {
				let table = Foxtrick.Pages.Series.getTable(doc);
				let parent = table.parentNode;
				Foxtrick.insertBefore(link, parent);

				// style.clear needed before the table
				let clear = doc.createElement('div');
				clear.className = 'clear';
				Foxtrick.insertBefore(clear, parent);
			}
		}
		else {
			// show automatically
			show();
		}
	},
};
