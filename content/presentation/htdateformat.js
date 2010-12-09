/**
 * HTDateFormat displays week and season next to date
 * @author spambot
 */

FoxtrickHTDateFormat = {

    MODULE_NAME : "HTDateFormat",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
 	PAGES : new Array('transfersTeam','transfersPlayer','transfer','transferCompare','match',
					'matches','matchesarchiv','teamPageGeneral','achievements','playerevents',
					'teamevents','history','arena','league','hallOfFame','statsMatchesHeadToHead'),
	ONPAGEPREF_PAGE : 'all',
	OPTIONS :  new Array("LocalSaison","FirstDayOfWeekOffset"),
	OPTION_TEXTS : true,
	OPTION_TEXTS_DEFAULT_VALUES : new Array("","0"),
	OPTION_TEXTS_DISABLED_LIST : new Array(true,false),

    run : function(page, doc) {
        //Foxtrick.dump('HTDateformat RUN '+page+'\n');
        var httime = doc.getElementById( "time" ).innerHTML;

        Foxtrick.HT_date = Foxtrick.util.time.getDateFromText( httime );
        if (!Foxtrick.HT_date) return;

        var mainBody = doc.getElementById( "mainBody" );
        if (!mainBody) return;

		var weekdayoffset = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "FirstDayOfWeekOffset_text");
		if (!weekdayoffset) weekdayoffset = this.OPTION_TEXTS_DEFAULT_VALUES[1];

        switch ( page ) {

            case 'transfersTeam' :
                this.modifyDates ( mainBody, true, 'td', '&nbsp;', '',weekdayoffset );
                break;

            case 'transfersPlayer' :
                this.modifyDates ( mainBody, true, 'td', '&nbsp;', '',weekdayoffset );
                break;

            case 'transfer' :
                this.modifyDates ( mainBody, true, 'td', '&nbsp;', '',weekdayoffset );
                break;

            case 'playerevents' :
                this.modifyDates ( mainBody, false, 'h3', '&nbsp;' , '&nbsp;',weekdayoffset );
                break;

			case 'match' :
                this.modifyDates ( mainBody, false, 'div', '&nbsp;' , '&nbsp;',weekdayoffset, true );
                break;

            case 'matches' :
				this.modifyDates ( mainBody, false, 'td', '&nbsp;' , '',weekdayoffset );
                //this.modifyDates ( mainBody, false, 'td', '<br>' , '',weekdayoffset ); //see FoxtrickMatchTables
                break;

            case 'matchesarchiv' :
                this.modifyDates ( mainBody, true, 'td', '&nbsp;' , '',weekdayoffset );
                break;

            case 'teamPageGeneral' :
				if (doc.location.href.search(/Club\/Matches\/Live.aspx/i)!=-1) return;
				//this.modifyDates ( mainBody, false, 'span', '&nbsp;', '',weekdayoffset );
                this.modifyDates ( mainBody, false, 'td', '&nbsp;', '',weekdayoffset );
                break;

            case 'transferCompare' :
                this.modifyDates ( mainBody, true, 'td', '&nbsp;', '',weekdayoffset );
                break;

            case 'achievements' :
                this.modifyDates ( mainBody, true, 'td', '&nbsp;', '',weekdayoffset );
                break;

            case 'teamevents' :
                this.modifyDates ( mainBody, true, 'td', '&nbsp;', '',weekdayoffset );
                break;

            case 'history' :
                this.modifyDates ( mainBody, true, 'td', '&nbsp;', '',weekdayoffset );
                break;

            case 'arena' :
                this.modifyDates ( mainBody, true, 'td', '&nbsp;', '' ,weekdayoffset);
                break;

            case 'league' :
                this.modifyDates ( mainBody, true, 'h3', '&nbsp;', '',weekdayoffset );
                break;

            case 'HallOfFame' :
                this.modifyDates ( mainBody, true, 'p', '&nbsp;', '',weekdayoffset, true );
                break;

			case 'statsMatchesHeadToHead' :
                this.modifyDates ( mainBody, false, 'td', '&nbsp;', '',weekdayoffset );
                break;
        }
    },

	/*
		modify dates in HTML
		useShort == true => Date is without time.
		don't use span as elm! use next outer nodetype instead
	*/
    modifyDates : function (doc, useShort, elm, before, after ,weekdayoffset, strip) {
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
					var htDate = Foxtrick.util.time.gregorianToHT(date, weekdayoffset);
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
