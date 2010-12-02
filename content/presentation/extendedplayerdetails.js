/**
 * ExtendedPlayerDetails (displays wage without 20% Bouns and time since player joined a team)
 * @author spambot
 */

FoxtrickExtendedPlayerDetails = {
    MODULE_NAME : "ExtendedPlayerDetails",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('playerdetail'),
	NEW_AFTER_VERSION: "0.4.8.2",
	LATEST_CHANGE:"Bonus and wage moved to seperate modules and made optional",
    RADIO_OPTIONS : new Array( "SWD", "SW", "SD", "WD", "D" ),

    run : function(page, doc) {
        this._Player_Joined ( doc );
    },

    _Player_Joined  : function ( doc ) {
        // Player in team since...
        var processed = doc.getElementsByClassName("ft_since");
        if (processed.length > 0)
        	return;

        var div = doc.getElementsByClassName("playerInfo")[0];
        var joined_elm = div.getElementsByClassName("shy")[0];

        var dateObj = Foxtrick.util.time.getDateFromText(joined_elm.textContent);
        var season_week = Foxtrick.util.time.gregorianToHT(dateObj);

		var htDate = Foxtrick.util.time.getHtDate(doc)

        var joined_s = Math.floor((htDate.getTime() - dateObj.getTime()) / 1000); //Sec

        var JoinedText = 'NaN';
        try {
            JoinedText = Foxtrick.util.time.timeDifferenceToText (joined_s , true);
        }
        catch(ee) {
            Foxtrick.dump('  JoinedText >' + ee + '\n');
        }

        if (JoinedText.search("NaN") == -1) {
            var part1 = Foxtrick.substr(joined_elm.innerHTML, 0, Foxtrick.strrpos( joined_elm.innerHTML, ")"));
            part1 = part1.replace('(', '<span class="date smallText ft_since"><br>(');
            joined_elm.innerHTML = part1 + ' <span>('+ season_week.week + '/' + season_week.season + ')</span>, ' + JoinedText + ')</span>';
        }
        else Foxtrick.dump('  Could not create jointime (NaN)\n');
    }
};


FoxtrickExtendedPlayerDetailsWage = {

    MODULE_NAME : "ExtendedPlayerDetailsWage",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('playerdetail'),
	NEW_AFTER_VERSION: "0.4.8.2",
	LATEST_CHANGE:"Bonus and wage moved to seperate modules and made optional",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
    OPTIONS : new Array( "WageWithoutBonus", "SeasonWage"),

    run : function(page, doc) {
        this._Player_Bonus ( doc );
    },

    _Player_Bonus  : function ( doc ) {

		var div = doc.getElementById( "ft_bonuswage" );
        if (div != null) return;

        var div = doc.getElementsByClassName("playerInfo")[0];
        try {
            var table_elm_bonus = div.getElementsByTagName( "table" )[0].rows[2].cells[1];
        } catch(e) {Foxtrick.dump('    >' + e + '\n');}

        var has_bonus=false;
		var table_inner = Foxtrick.trim(table_elm_bonus.innerHTML);
        if (Foxtrick.strrpos( table_inner, "%") > 0 ) {
            has_bonus=true;
        }

		table_inner = table_elm_bonus.innerHTML;

        var currency = Foxtrick.util.currency.getSymbol();
		var cl = currency.length;

        var part = Foxtrick.substr(table_inner, 0, table_inner.indexOf(currency)+ cl);

        var part_1_save = part;
        var part_2_save = table_inner.substring(table_inner.indexOf(currency)+ cl);

		//this loop removing 10 &nbsp;  From 15 000 000 make 15000000  BUG FIXED BY SMATES
             var part = Foxtrick.trim(part);
             for ( var i=0; i<10; i++ ) {
              var part = part.replace('&nbsp;', '');
             }

		var wage = parseInt(part.replace('&nbsp;', '').replace(/ /g, ''));
        part =  Math.floor( wage / 1.2);
        part = Foxtrick.formatNumber (part, '&nbsp;');

		// get space before currency symbol
		part_1_save=part_1_save.replace(" " + currency, currency);
		part_1_save=part_1_save.replace("&nbsp;" + currency, currency);
		part_1_save=part_1_save.replace(currency, "&nbsp;" + currency);

		if (part != 'NaN')
        {    if (has_bonus && Foxtrick.isModuleFeatureEnabled( this, "WageWithoutBonus") ) {
				table_elm_bonus.innerHTML =
                part_1_save +//'&nbsp;'+
                '&nbsp;<span id="ft_bonuswage" style="direction: ltr !important; color:#666666; ">(' +
                part +'&nbsp;' + currency + ')</span> ' +
                part_2_save;
			}
			if (Foxtrick.isModuleFeatureEnabled( this, "SeasonWage") )
				table_elm_bonus.innerHTML += '<br>'+Foxtrick.formatNumber (wage*16, '&nbsp;')+"&nbsp;"+currency+Foxtrickl10n.getString('foxtrick.ExtendedPlayerDetails.perseason');
         }
    }
};
