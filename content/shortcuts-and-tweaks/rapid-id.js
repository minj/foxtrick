'use strict';
/**
 * rapid-id.js
 * rapid way to view something by id
 * @author ryanli
 */

Foxtrick.modules['RapidId'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
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
			FoxtrickPrefs.setString('module.RapidId.selected', val);
		};
		var getSelected = function() {
			return FoxtrickPrefs.getString('module.RapidId.selected');
		};
		var view = function(event) {
			// prevent the form from being submitted
			event.preventDefault();
			var doc = event.target.ownerDocument;
			var select = doc.getElementById('ft_rapidid_select');
			var type = select.options[select.selectedIndex].getAttribute('value');
			var input = doc.getElementsByClassName('ft_rapidid_input')[0];
			var value = input.value;
			value = Foxtrick.trim(value);
			// split the value separated by white space to a list
			var idList = value.split(/\s+/);
			// ensure the list is valid
			if (Foxtrick.any(isNaN, idList) || value == '') {
				return;
			}
			setSelected(type);
			var urlTmpl = doc.location.protocol + '//' + doc.location.host + '/' +
				Foxtrick.nth(0, function(n) { return n.value == type; }, options).url;
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
				var button = doc.createElement('input');
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

				// the <input type='button' /> element
				button.setAttribute('type', 'submit');
				button.setAttribute('value', Foxtrickl10n.getString('RapidId.view'));
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

		var rightnow = doc.getElementById('ctl00_ctl00_ucOngoingEvents_pnlOngoingEvents');
		if (rightnow) {
			rightnow.setAttribute('style', 'overflow:hidden; white-space:nowrap; width:300px;');
		}
		// get labels of optgroup and option
		for (var i = 0; i < options.length; ++i) {
			options[i].label = Foxtrickl10n.getString(options[i].text);
		}

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
		var viewById = Foxtrickl10n.getString('RapidId.viewById');
		indicator.appendChild(doc.createTextNode(viewById));
		Foxtrick.onClick(indicator, function(ev) {
				ev.preventDefault();
				displayForm(doc);
			});
	}
};
