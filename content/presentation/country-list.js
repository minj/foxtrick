'use strict';
/**
* country-list.js
* displays country names in dropdown in different way
* @author spambot
*/

Foxtrick.modules['CountryList'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['all'],
	OPTIONS: ['SelectBoxes', 'TeamPage', 'ManagerPage', 'HideFlagOntop'],
	CSS: Foxtrick.InternalPath + 'resources/css/CountyList.css',

	run: function(doc) {
		var list = doc.getElementById('ft_countrylist');
		if (list != null)
			return;
		if (FoxtrickPrefs.isModuleOptionEnabled('CountryList', 'SelectBoxes')) {
			if (Foxtrick.isPage('transferSearchForm', doc)) {
				this._changelist(doc, 'ctl00_ctl00_CPContent_CPMain_ddlZone', 10);
				this._changelist(doc, 'ctl00_ctl00_CPContent_CPMain_ddlBornIn', 1);
			}
			else if (Foxtrick.isPage('country', doc)) {
				this._changelist(doc, 'ctl00_ctl00_CPContent_CPMain_ucLeaguesDropdown_ddlLeagues',
				                 0);
			}
			else if (Foxtrick.isPage('press', doc)) {
				this._changelist(doc, 'ctl00_ctl00_CPContent_CPSidebar_ucLeagues2_ddlLeagues', 1);
			}
			else if (Foxtrick.isPage('statsTransfersBuyers', doc)) {
				this._changelist(doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues', 1);
			}
			else if (Foxtrick.isPage('statsTeams', doc)) {
				this._changelist(doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues_ddlLeagues', 0);
			}
			else if (Foxtrick.isPage('statsPlayers', doc)) {
				this._changelist(doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues_ddlLeagues', 0);
			}
			else if (Foxtrick.isPage('statsRegions', doc)) {
				this._changelist(doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues_ddlLeagues', 0);
			}
			else if (Foxtrick.isPage('statsNationalTeams', doc)) {
				this._changelist(doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues_ddlLeagues', 0);
			}
			else if (Foxtrick.isPage('statsConfs', doc)) {
				this._changelist(doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues_ddlLeagues', 0);
			}
			else if (Foxtrick.isPage('statsBookmarks', doc)) {
				this._changelist(doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues_ddlLeagues', 0);
			}
			else if (Foxtrick.isPage('trainingStats', doc)) {
				this._changelist(doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues', 1);
			}
			else if (Foxtrick.isPage('statsArena', doc)) {
				this._changelist(doc, 'ctl00_ctl00_CPContent_CPMain_ucLeaguesDropdown_ddlLeagues',
				                 0);
			}
			else if (Foxtrick.isPage('helpContact', doc)) {
				this._changelist(doc, 'ctl00_ctl00_CPContent_CPMain_ucLeaguesDropdown_ddlLeagues',
				                 3);
			}
		}
		else {
			if (Foxtrick.isPage('transferSearchForm', doc)) {
				this._activate(doc, 'ctl00_ctl00_CPContent_CPMain_ddlZone');
				this._activate(doc, 'ctl00_ctl00_CPContent_CPMain_ddlBornIn');
			}
			else if (Foxtrick.isPage('country', doc)) {
				this._activate(doc, 'ctl00_ctl00_CPContent_CPMain_ucLeaguesDropdown_ddlLeagues');
			}
			else if (Foxtrick.isPage('press', doc)) {
				this._activate(doc, 'ctl00_ctl00_CPContent_CPSidebar_ucLeagues2_ddlLeagues');
			}
			else if (Foxtrick.isPage('statsTransfersBuyers', doc)) {
				this._activate(doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues');
			}
			else if (Foxtrick.isPage('statsTeams', doc)) {
				this._activate(doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues_ddlLeagues');
			}
			else if (Foxtrick.isPage('statsPlayers', doc)) {
				this._activate(doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues_ddlLeagues');
			}
			else if (Foxtrick.isPage('statsRegions', doc)) {
				this._activate(doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues_ddlLeagues');
			}
			else if (Foxtrick.isPage('statsNationalTeams', doc)) {
				this._activate(doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues_ddlLeagues');
			}
			else if (Foxtrick.isPage('statsConfs', doc)) {
				this._activate(doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues_ddlLeagues');
			}
			else if (Foxtrick.isPage('statsBookmarks', doc)) {
				this._activate(doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues_ddlLeagues');
			}
			else if (Foxtrick.isPage('trainingStats', doc)) {
				this._activate(doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues');
			}
			else if (Foxtrick.isPage('statsArena', doc)) {
				this._activate(doc, 'ctl00_ctl00_CPContent_CPMain_ucLeaguesDropdown_ddlLeagues');
			}
			else if (Foxtrick.isPage('helpContact', doc)) {
				this._activate(doc, 'ctl00_ctl00_CPContent_CPMain_ucLeaguesDropdown_ddlLeagues');
			}
		}

		if (FoxtrickPrefs.isModuleOptionEnabled('CountryList', 'TeamPage')) {
			if (Foxtrick.isPage('teamPage', doc)) {
				this._placeCountry(doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues', 1);
			}
			else if (Foxtrick.isPage('teamPageBrowser', doc)) {
				this._placeCountry(doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues', 1);
			}
		}

		if (FoxtrickPrefs.isModuleOptionEnabled('CountryList', 'ManagerPage')) {
			if (Foxtrick.isPage('managerPage', doc))
				this._placeCountry(doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues', 1);
		}

	},

	_placeCountry: function(doc) {
		var cntr = doc.getElementById('ft_cntr_fix');
		if (cntr == null) {
			var league = doc.getElementsByClassName('main')[0].getElementsByClassName('flag')[0];
			if (!league) return;
			if (FoxtrickPrefs.isModuleOptionEnabled('CountryList', 'HideFlagOntop')) {
				league.setAttribute('style', 'display:none');
			}
			Foxtrick.dump(league.href + '\n');
			var leagueId = league.href.match(/LeagueID=(\d+)/i)[1];
			var htname = league.firstChild.title;
			htname = Foxtrick.util.id.getLeagueDataFromId(leagueId).LeagueName;
			league.firstChild.title = htname;

			var byline = doc.getElementsByClassName('byline')[0];
			var a = Foxtrick.createFeaturedElement(doc, Foxtrick.modules.CountryList, 'a');
			byline.insertBefore(a, byline.firstChild);
			a.id = 'ft_cntr_fix';
			a.href = league.href;
			a.textContent = htname;
			byline.insertBefore(doc.createTextNode(', '), a.nextSibling);
		}
	},

	_changelist: function(doc, id, start) {
		var selectbox = doc.getElementById(id);
		if (selectbox == null) return;
		Foxtrick.dump('id: ' + id + '   start: ' + start + '\n');
		var options = selectbox.options;
		var countries = options.length;
		var selected = selectbox.selectedIndex;
		var id_sel = 0;
		try {
			for (var i = start; i < countries; i++) {
				if (Foxtrick.arch == 'Sandboxed') {
					if (options[i].getAttribute('selected'))
						id_sel = options[i].value;
				}
				else {
					if (i == selected) id_sel = options[i].value;
				}
				try {
					if (id.search(/leagues/i) != -1 || id.search(/zone/i) != -1) {
						var league = options[i].value;
					}
					else {
						var league = Foxtrick.XMLData.getLeagueIdByCountryId(options[i].value);
					}
					var htname = options[i].text;
					htname = Foxtrick.util.id.getLeagueDataFromId(league).LeagueName;
					if (!htname) return -1;
					options[i].text = htname;

				} catch (exml) {
					Foxtrick.dump('country-list.js countries: ' + exml + '\n');
				}
			}
			Foxtrick.makeFeaturedElement(selectbox, Foxtrick.modules.CountryList);
		} catch (e) {Foxtrick.dump('countrylist: ' + e + '\n');}


		var opt_array = [];
		try {
			for (var i = start; i < options.length; i++) {
				var oldopt = ['-1', '-1'];
				oldopt[0] = options[i].value;
				oldopt[1] = options[i].text;
		//		Foxtrick.dump(i+'  '+oldopt[0]+' '+oldopt[1]+'\n');
				opt_array.push(oldopt);
			}
		} catch (epush) {Foxtrick.dump('countrylist: EPUSH ' + epush + '\n');}

		function sortByOptionText(a, b) {
			var x = a[1];
			x = (x.search(/.+sland/) == 0) ? 'Island' :
				((x.search(/.+esk.+republika/) != -1) ? 'Ceska republika' : x);
			var y = b[1];
			y = (y.search(/.+sland/) == 0) ? 'Island' :
				((y.search(/.+esk.+republika/) != -1) ? 'Ceska republika' : y);
			//if (parseInt(a[0]) <= 0 || parseInt(b[0]) <= 0) return -1;
			//not working well in chrome. should be compare values also
			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		}

		opt_array.sort(sortByOptionText);
		for (var i = 0; i < options.length; i++) {
			if (i >= start) {
				if (opt_array[i - start][0] == id_sel)
					selectbox.selectedIndex = i;
				options[i].value = opt_array[i - start][0];
				options[i].text = opt_array[i - start][1];
		//		Foxtrick.dump(i+'  '+options[i].value+' '+options[i].text+'\n');
			}
		}
		selectbox.style.display = 'inline';
	},

	_activate: function(doc, id) {
		var selectbox = doc.getElementById(id);
		if (selectbox == null) return;
		selectbox.style.display = 'inline';
		Foxtrick.dump('country select activated.\n');
	}
};
