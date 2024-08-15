'use strict';
/**
 * rapid-id.js
 * rapid way to view something by id
 * @author ryanli
 */

Foxtrick.modules['RapidId'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	OUTSIDE_MAINBODY: true,
	PAGES: ['all'],
	CSS: Foxtrick.InternalPath + 'resources/css/rapidid.css',

	run: function(doc) {
		var options = [
			{ value: 'manager', text: 'Manager', url: 'Club/Manager/?userId=%n' },
			{ value: 'senior', text: 'RapidId.senior' },
			{ value: 'senior-team', text: 'Team', url: 'Club/?TeamID=%n' },
			{ value: 'senior-series', text: 'Series',
				url: 'World/Series/?LeagueLevelUnitID=%n' },
			{ value: 'senior-player', text: 'Player', url: 'Club/Players/Player.aspx?playerId=%n' },
			{ value: 'senior-match', text: 'Match', url: 'Club/Matches/Match.aspx?matchID=%n' },
			{ value: 'youth', text: 'RapidId.youth' },
			{ value: 'youth-team', text: 'Team', url: 'Club/Youth/?YouthTeamID=%n' },
			{ value: 'youth-series', text: 'Series',
				url: 'World/Series/YouthSeries.aspx?YouthLeagueId=%n' },
			{ value: 'youth-player', text: 'Player',
				url: 'Club/Players/YouthPlayer.aspx?YouthPlayerID=%n' },
			{ value: 'youth-match', text: 'Match',
				url: 'Club/Matches/Match.aspx?matchID=%n&SourceSystem=Youth' },
			{ value: 'tournament', text: 'RapidId.tournaments' },
			{ value: 'match-tournament', text: 'Match',
				url: 'Club/Matches/Match.aspx?matchID=%n&SourceSystem=HTOIntegrated' },
			{ value: 'series-tournament', text: 'RapidId.tournament',
				url: 'Community/Tournaments/Tournament.aspx?tournamentId=%n' },
			{ value: 'match-single', text: 'RapidId.SingleMatch',
				url: 'Club/Matches/Match.aspx?matchID=%n&SourceSystem=HTOIntegrated' },
			{ value: 'match-ladder', text: 'RapidId.LadderMatch',
				url: 'Club/Matches/Match.aspx?matchID=%n&SourceSystem=HTOIntegrated' }
		];
		var setSelected = function(val) {
			Foxtrick.Prefs.setString('module.RapidId.selected', val);
		};
		var getSelected = function() {
			return Foxtrick.Prefs.getString('module.RapidId.selected');
		};
		var view = function(event) {
			var doc = event.target.ownerDocument;
			var select = doc.getElementById('ft_rapidid_select');
			var type = select.options[select.selectedIndex].getAttribute('value');
			var input = doc.getElementsByClassName('ft_rapidid_input')[0];
			var value = input.value;
			value = value.trim();
			// split the value separated by white space to a list
			var idList = value.split(/\s+/);
			// ensure the list is valid
			if (Foxtrick.any(isNaN, idList) || value == '') {
				return;
			}
			setSelected(type);

			let opt = Foxtrick.nth(n => n.value == type, options);
			if (!opt) {
				Foxtrick.log(new Error(`opt is ${opt} for ${type}`));
				return;
			}

			var urlTmpl = doc.location.protocol + '//' + doc.location.host + '/' + opt.url;
			// open in current tab if only one ID, in new tabs if more than one
			Foxtrick.map(function(id) {
				var url = urlTmpl.replace('%n', id);
				if (idList.length == 1)
					doc.location.assign(url);
				else
					Foxtrick.newTab(url);
			}, idList);
		};
		var selectionChange = function(event) {
			// to change the id of input so that auto-complete works correctly
			var doc = event.target.ownerDocument;
			var select = doc.getElementById('ft_rapidid_select');
			var input = doc.getElementsByClassName('ft_rapidid_input')[0];
			input.id = 'ft_rapidid_input_' + select.value;
		};
		var displayForm = function(doc) {
			try {
				var container = doc.getElementById('ft_rapidid');
				var indicator = doc.getElementById('ft_rapidid_indicator');
				container.removeChild(indicator);
				var form = doc.createElement('div');
				container.appendChild(form);

				// form
				form.id = 'ft_rapidid_form';
				var select = doc.createElement('select');
				var input = doc.createElement('input');
				var button = doc.createElement('button');
				button.type = 'button';
				button.id = 'ft_rapidid_btn';
				form.appendChild(select);
				form.appendChild(input);
				form.appendChild(button);

				// the select element
				select.id = 'ft_rapidid_select';
				var currentGroup = null;
				var saved = getSelected();
				var i;
				for (i in options) {
					// if no url, then it's an optgroup
					if (!options[i].url) {
						var optgroup = doc.createElement('optgroup');
						select.appendChild(optgroup);
						optgroup.setAttribute('label', options[i].label);
						currentGroup = optgroup;
					}
					else {
						var option = doc.createElement('option');
						option.setAttribute('value', options[i].value);
						option.appendChild(doc.createTextNode(options[i].label));
						if (saved === options[i].value) {
							option.setAttribute('selected', 'selected');
						}
						if (currentGroup === null) {
							select.appendChild(option);
						}
						else {
							currentGroup.appendChild(option);
						}
					}
				}
				Foxtrick.listen(select, 'change', selectionChange, false);

				// the input element
				input.id = 'ft_rapidid_input_' + select.value;
				input.className = 'ft_rapidid_input';
				input.type = 'text';
				input.setAttribute('size', '9');

				// disable enter to submit HT form
				// redirect to FT button instead
				Foxtrick.listen(input, 'keypress', function(ev) {
					var doc = this.ownerDocument;
					if (ev.keyCode == 13) {
						ev.preventDefault();
						doc.getElementById('ft_rapidid_btn').click();
					}
				});

				button.textContent = Foxtrick.L10n.getString('RapidId.view');
				Foxtrick.onClick(button, view);

				// hide rightnow on demand
				var rightnow = doc.getElementById('ctl00_ctl00_ucOngoingEvents_pnlOngoingEvents');
				if (rightnow)
					Foxtrick.addClass(rightnow, 'hidden');
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};

		// get labels of optgroup and option
		for (let opt of options)
			opt.label = Foxtrick.L10n.getString(opt.text);

		var header = doc.getElementById('header');
		var online = doc.getElementById('online');
		var container = Foxtrick.createFeaturedElement(doc, this, 'div');
		header.insertBefore(container, online.nextSibling);
		container.id = 'ft_rapidid';
		container.className = 'float_right';
		var indicator = doc.createElement('a');
		container.appendChild(indicator);

		// indicator
		indicator.id = 'ft_rapidid_indicator';
		var viewById = Foxtrick.L10n.getString('RapidId.viewById');
		indicator.appendChild(doc.createTextNode(viewById));
		Foxtrick.onClick(indicator, function(ev) {
			displayForm(doc);
		});

	},
};
