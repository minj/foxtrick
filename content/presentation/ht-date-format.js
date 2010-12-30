/**
 * HTDateFormat displays week and season next to date
 * @author spambot
 */

FoxtrickHTDateFormat = {
	MODULE_NAME : "HTDateFormat",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : ['transfersTeam','transfersPlayer','transfer','transferCompare','match',
		'matches','matchesarchiv','teamPageGeneral','achievements','playerevents',
		'teamevents','history','arena','league','hallOfFame','statsMatchesHeadToHead'],
	ONPAGEPREF_PAGE : 'all',
	OPTIONS : ["LocalSeason", "FirstDayOfWeekOffset"],
	OPTION_TEXTS : true,
	OPTION_TEXTS_DISABLED_LIST : [true, false],

	run : function(page, doc) {
		var mainBody = doc.getElementById("mainBody");
		if (!mainBody) return;

		switch ( page ) {
			case 'transfersTeam' :
				this.modifyDates(mainBody, true, 'td', '&nbsp;', '');
				break;

			case 'transfersPlayer' :
				this.modifyDates(mainBody, true, 'td', '&nbsp;', '');
				break;

			case 'transfer' :
				this.modifyDates(mainBody, true, 'td', '&nbsp;', '');
				break;

			case 'playerevents' :
				this.modifyDates(mainBody, false, 'h3', '&nbsp;' , '&nbsp;');
				break;

			case 'match' :
				this.modifyDates(mainBody, false, 'div', '&nbsp;' , '&nbsp;', true);
				break;

			case 'matches' :
				this.modifyDates(mainBody, false, 'td', '&nbsp;' , '');
				break;

			case 'matchesarchiv' :
				this.modifyDates(mainBody, true, 'td', '&nbsp;' , '');
				break;

			case 'teamPageGeneral' :
				if (doc.location.href.search(/Club\/Matches\/Live.aspx/i)!=-1) return;
				this.modifyDates(mainBody, false, 'td', '&nbsp;', '');
				break;

			case 'transferCompare' :
				this.modifyDates(mainBody, true, 'td', '&nbsp;', '');
				break;

			case 'achievements' :
				this.modifyDates(mainBody, true, 'td', '&nbsp;', '');
				break;

			case 'teamevents' :
				this.modifyDates(mainBody, true, 'td', '&nbsp;', '');
				break;

			case 'history' :
				this.modifyDates(mainBody, true, 'td', '&nbsp;', '');
				break;

			case 'arena' :
				this.modifyDates(mainBody, true, 'td', '&nbsp;', '');
				break;

			case 'league' :
				this.modifyDates(mainBody, true, 'h3', '&nbsp;', '');
				break;

			case 'HallOfFame' :
				this.modifyDates(mainBody, true, 'p', '&nbsp;', '', true);
				break;

			case 'statsMatchesHeadToHead' :
				this.modifyDates(mainBody, false, 'td', '&nbsp;', '');
				break;
		}
	},

	/*
		modify dates in HTML
		useShort == true => Date is without time.
		don't use span as elm! use next outer nodetype instead
	*/
	modifyDates : function (doc, useShort, elm, before, after, strip) {
		const useLocal = Foxtrick.isModuleFeatureEnabled(this, "LocalSeason");
		const weekOffset = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "FirstDayOfWeekOffset_text")
		var tds = doc.getElementsByTagName(elm);
		for (var i = 0; tds[i] != null; ++i) {
			var node = tds[i];
			if (node.getElementsByTagName('span').length!=0)
				node = node.getElementsByTagName('span')[0];

			// not nested
			if (node.getElementsByTagName(elm).length!=0) {
				continue;
			}

			if (Foxtrick.hasClass(node, "ft-date")) return;
			if (!strip) var dt_inner = Foxtrick.trim(node.innerHTML);
			else var dt_inner = Foxtrick.trim(Foxtrick.stripHTML(node.innerHTML));

			if ((dt_inner.length <= 11 && useShort) || (dt_inner.length <= 17 && !useShort) || strip) {
				var date = Foxtrick.util.time.getDateFromText(dt_inner);
				if (date) {
					var htDate = Foxtrick.util.time.gregorianToHT(date, weekOffset, useLocal);
					Foxtrick.addClass(node, "ft-date");
					if (!strip)
						node.innerHTML = dt_inner + before + "(" + htDate.week + "/" + htDate.season + ")" + after;
					else
						node.innerHTML = node.innerHTML + before + "(" + htDate.week + "/" + htDate.season + ")" + after;
				}
			}
		}
	}
};
