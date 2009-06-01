/**
 * ExtendedPlayerDetails (displays wage without 20% Bouns and time since player joined a team)
 * @author spambot
 */

FoxtrickExtendedPlayerDetails = {

    MODULE_NAME : "ExtendedPlayerDetails",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
    DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.8.2",
	LASTEST_CHANGE:"Bonus and wage moved to seperate modules and made optional",
    RADIO_OPTIONS : new Array( "SWD", "SW", "SD", "WD", "D" ),

    init : function() {
        Foxtrick.registerPageHandler('playerdetail', this); 
    },

    run : function(page, doc) {

        switch ( page ) {

            case 'playerdetail' : 

                this._Player_Joined ( doc );
                break;
        }
    },

	change : function( page, doc ) {

	},

    _Player_Joined  : function ( doc ) {
        // Player in team since...
        var div = doc.getElementById( "ft_since" );
        if (div != null) return;
        
        try {
            var div = doc.getElementById( "ctl00_CPMain_pnlplayerInfo" );
            if (div == null) return;
            
            var joined_elm = getElementsByClass( "shy", div )[0];
            if (joined_elm == null) return;            
            //dump('\n'+joined_elm.parentNode.innerHTML+'\n');

            joinedtimeInner = Foxtrick.trim(joined_elm.innerHTML);

            var reg = /(\d+)(.*?)(\d+)(.*?)(\d+)(.*?)/i;
            var ar = reg.exec(joinedtimeInner);

            var joinedtime = ar[0] + '.' + ar[2] + '.' + ar[4] + ' 00.00.01';

            joinedtime = substr(joinedtime, strrpos( joinedtime, ";"), joinedtime.length);

            // dump('  Joindate: ' + joinedtime + '\n');
            // dump('  HT Week: ' + this._gregorianToHT(joinedtime) + '\n');

            var ht_week = gregorianToHT(joinedtime);

            JT_date = getDatefromCellHTML( joinedtime );
            if (!JT_date) return;

            var joined_s = Math.floor( (HT_date.getTime() - JT_date.getTime()) / 1000); //Sec
            
            var JoinedText = 'NaN';
            try {
                JoinedText = TimeDifferenceToText (joined_s , true);
            } 
            catch(ee) {
                dump('  JoinedText >' + ee + '\n');
            }
    
            if (JoinedText.search("NaN") == -1) {
                part1 = substr(joined_elm.innerHTML, 0, strrpos( joined_elm.innerHTML, ")"));
                part1 = part1.replace('(', '<span class="date smallText" id ="ft_since"><br>(');
                joined_elm.innerHTML = part1 + ' <span id="ft_HTDateFormat">'+ ht_week + '</span>, ' + JoinedText + ')</span>';
            }
            else dump('  Could not create jointime (NaN)\n');
        } catch (e) {
            dump('FoxtrickExtendedPlayerDetails'+e);
        }
    },

};


FoxtrickExtendedPlayerDetailsWage = {

    MODULE_NAME : "ExtendedPlayerDetailsWage",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
    DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.8.2",
	LASTEST_CHANGE:"Bonus and wage moved to seperate modules and made optional",
    OPTIONS : new Array( "WageWithoutBonus", "SeasonWage"),

	    init : function() {
        Foxtrick.registerPageHandler('playerdetail', this); 
    },

    run : function(page, doc) {

        switch ( page ) {

            case 'playerdetail' : 

                this._Player_Bonus ( doc );
                break;
        }
    },

	change : function( page, doc ) {

	},
    _Player_Bonus  : function ( doc ) {
        // Player in team since...
        var div = doc.getElementById( "ft_bonuswage" );
        if (div != null) return;
        
        try {
            var div = doc.getElementById( 'ctl00_CPMain_pnlplayerInfo' );
            try {
                var table_elm_bonus = div.getElementsByTagName( "table" )[0].rows[2].cells[1];
            } catch(e) {dump('    >' + e + '\n');}
			
            var has_bonus=false;
			var table_inner = Foxtrick.trim(table_elm_bonus.innerHTML);
            if (strrpos( table_inner, "%") > 0 ) {
                has_bonus=true;
            }
            
			table_inner = table_elm_bonus.innerHTML;

            var part = substr(table_inner, 0, table_inner.search('/'));

            var part_1_save = part;
            var part_2_save = table_inner.substring(table_inner.search('/'));

			//this loop removing 10 &nbsp;  From 15 000 000 make 15000000  BUG FIXED BY SMATES
                 var part = Foxtrick.trim(part);
                 for ( i=0; i<10; i++ ) { 
                  var part = part.replace('&nbsp;', ''); 
                 }
            
			var wage = parseInt(part.replace('&nbsp;', '').replace(/ /g, '')); 
            part =  Math.floor( wage / 1.2);
            part = ReturnFormatedValue (part, '&nbsp;');
			
			part_1_save=part_1_save.replace(" "+FoxtrickPrefs.getString("oldCurrencySymbol"),FoxtrickPrefs.getString("oldCurrencySymbol"));
			part_1_save=part_1_save.replace("&nbsp;"+FoxtrickPrefs.getString("oldCurrencySymbol"),FoxtrickPrefs.getString("oldCurrencySymbol"));
			part_1_save=part_1_save.replace(FoxtrickPrefs.getString("oldCurrencySymbol"),"&nbsp;"+FoxtrickPrefs.getString("oldCurrencySymbol"));
			
            if (part != 'NaN') 
            {    if (has_bonus && Foxtrick.isModuleFeatureEnabled( this, "WageWithoutBonus") ) {
					table_elm_bonus.innerHTML = 
                    part_1_save +//'&nbsp;'+ 
                    '&nbsp;<span id="ft_bonuswage" style="direction: ltr !important; color:#666666; ">(' + 
                    part +'&nbsp;'+FoxtrickPrefs.getString("oldCurrencySymbol")+			
                    ')</span> ' + 
                    part_2_save;//.replace(FoxtrickPrefs.getString("oldCurrencySymbol"),'');
				}
				if (has_bonus && Foxtrick.isModuleFeatureEnabled( this, "SeasonWage") ) 
						table_elm_bonus.innerHTML += '<br>'+ReturnFormatedValue (wage*16, '&nbsp;')+"&nbsp;"+FoxtrickPrefs.getString("oldCurrencySymbol")+' '+Foxtrickl10n.getString('foxtrick.ExtendedPlayerDetails.perseason'); 
             }   
				
        } catch (e) {
            dump('  PlayerBonus: ' + e + '\n');
        }
    }

};