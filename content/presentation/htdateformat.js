/**
 * HTDateFormat displays week and season next to date
 * @author spambot
 */

FoxtrickHTDateFormat = {

    MODULE_NAME : "HTDateFormat",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
 	PAGES : new Array('transfersTeam','TransfersPlayer','TransferCompare',
					'matches','matchesarchiv','teamPageGeneral','achievements',
					'teamevents','history','arena','league'), 
	ONPAGEPREF_PAGE : 'all', 
    DEFAULT_ENABLED : true,
    NEW_AFTER_VERSION: "0.4.6.2",	
	LASTEST_CHANGE:"Option to set first day of week added",
	OPTIONS :  new Array("LocalSaison","FirstDayOfWeekOffset"), 
	OPTION_TEXTS : true,
	OPTION_TEXTS_DEFAULT_VALUES : new Array("","0"),
	OPTION_TEXTS_DISABLED_LIST : new Array(true,false),

    init : function() {
    },

    run : function(page, doc) {
        dump('HTDateformat RUN\n');
        var httime = doc.getElementById( "time" ).innerHTML;

        Foxtrick.HT_date = Foxtrick.getDatefromCellHTML( httime );
        if (!Foxtrick.HT_date) return;

        var mainBody = doc.getElementById( "mainBody" );
        if (!mainBody) return;
        
		var weekdayoffset = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "FirstDayOfWeekOffset_text"); 
		if (!weekdayoffset) weekdayoffset = this.OPTION_TEXTS_DEFAULT_VALUES[1]; 
			
        switch ( page ) {

            case 'transfersTeam' :
                Foxtrick.modifyDates ( mainBody, true, 'td', '&nbsp;', '',weekdayoffset );
                break;

            case 'TransfersPlayer' :
                Foxtrick.modifyDates ( mainBody, true, 'td', '&nbsp;', '',weekdayoffset );
                break;
/*
            case 'match' :
                this._Foxtrick.modifyDates ( mainBody, false, 'div', '&nbsp;' , '',weekdayoffset );
                break;
*/                
            case 'matches' :
				Foxtrick.modifyDates ( mainBody, false, 'td', '&nbsp;' , '',weekdayoffset );
                //Foxtrick.modifyDates ( mainBody, false, 'td', '<br>' , '',weekdayoffset ); //see FoxtrickMatchTables
                break;

            case 'matchesarchiv' :
                Foxtrick.modifyDates ( mainBody, false, 'span', '&nbsp;' , '',weekdayoffset );
                break;
                
            case 'teamPageGeneral' :
                Foxtrick.modifyDates ( mainBody, false, 'span', '&nbsp;', '',weekdayoffset );
                Foxtrick.modifyDates ( mainBody, false, 'td', '&nbsp;', '',weekdayoffset );
                break;

            case 'TransferCompare' :
                Foxtrick.modifyDates ( mainBody, true, 'td', '&nbsp;', '',weekdayoffset );
                break;
                
            case 'achievements' :
                Foxtrick.modifyDates ( mainBody, true, 'td', '&nbsp;', '',weekdayoffset );
                break;
                
            case 'teamevents' :
                Foxtrick.modifyDates ( mainBody, true, 'td', '&nbsp;', '',weekdayoffset );
                break;
                
            case 'history' :
                Foxtrick.modifyDates ( mainBody, true, 'td', '&nbsp;', '',weekdayoffset );
                break;                

            case 'arena' :
                Foxtrick.modifyDates ( mainBody, true, 'td', '&nbsp;', '' ,weekdayoffset);
                break;
                
            case 'league' :
                Foxtrick.modifyDates ( mainBody, true, 'h3', '&nbsp;', '',weekdayoffset );
                break;
                
                
        }
    },

	change : function( page, doc ) {
        if (doc.getElementById('mainBody').innerHTML.search('ft_HTDateFormat') > -1 ) return;
        else {
            dump('HTDateformat CHG RUN\n');
            this.run(page,doc);
        }
        
	},       
};




var FoxtrickMatchTables = {

    MODULE_NAME : "MatchTables",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('matchesarchiv', 'matches'), 
    DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.8.3",	
    LASTEST_CHANGE:"removes white space on match tables",    

    init : function() {
    },
    
    run : function( page, doc ) { 

		if (!Foxtrick.isStandardLayout(doc)) Foxtrick.addStyleSheet(doc,"chrome://foxtrick/content/resources/css/FoxtrickMatchTables_simple.css");
	
		return; //= right now CSS only. may need a <br> in htdateformat
    
		var id = "ft_matchtable";
        if (doc.getElementById(id)) return;
        
        try {
            var div = doc.getElementById('mainBody');
            if (!div) return;
            var tbl = div.getElementsByTagName('TABLE')[0];
            if (!tbl) return;
            tbl.id = 'ft_matchtable';
            tbl.setAttribute('class', '');
            tbl.setAttribute('style', 'margin-left:-6px; margin-right:-6px; padding:0px;width:440px;');
            
            var tblBodyObj = tbl.tBodies[0];
            for (var i=0; i<tblBodyObj.rows.length; i++) {
                if (tblBodyObj.rows[i].cells[1]) {
                    var cell = tblBodyObj.rows[i].cells[0];
                    var content = Foxtrick.trim(cell.innerHTML);
                    var reg = /(\d{1,4})(.*?)(\d{1,2})(.*?)(\d{1,4})(.*?)/i;
                    if (content.search(':') > -1) reg = /(\d{1,4})(.*?)(\d{1,2})(.*?)(\d{1,4})(.*?)(\d{2})(.*?)(\d{2})(.*?)/i;
                    var ar = reg.exec(content);
                    var DATEFORMAT = FoxtrickPrefs.getString("htDateformat");
                    if  (DATEFORMAT == null ) DATEFORMAT = 'ddmmyyyy';

                    switch ( DATEFORMAT ) {
                        case 'ddmmyyyy': 
                            if (content.search(/\(/) > -1) cell.innerHTML = ar[1] + '.' + ar[3] + '.' + ar[5].substring(2,4) + '&nbsp;<span id="ft_HTDateFormat">(' + content.split('(')[1] + '</span>'; 
                            else cell.innerHTML = ar[1] + '.' + ar[3] + '.' + ar[5].substring(2,4);
                            break;
                        case 'mmddyyyy':
                            if (content.search(/\(/) > -1) cell.innerHTML = ar[1] + '.' + ar[3] + '.' + ar[5].substring(2,4) + '&nbsp;<span id="ft_HTDateFormat">(' + content.split('(')[1] + '</span>'; 
                            else cell.innerHTML = ar[1] + '.' + ar[3] + '.' + ar[5].substring(2,4);
                            break;
                        case 'yyyymmdd':
                            if (content.search(/\(/) > -1) cell.innerHTML = ar[1] + '-' + ar[3] + '-' + ar[5].substring(2,4) + '&nbsp;<span id="ft_HTDateFormat">(' + content.split('(')[1] + '</span>'; 
                            else cell.innerHTML = ar[1] + '-' + ar[3] + '-' + ar[5].substring(2,4);
                            break;
                    }
                    cell.setAttribute('style', "font-size:6px; text-align:center;padding:2px 0px 2px 0px;vertical-align:middle;");
                    cell.setAttribute('class', "date");
                    
                    for(var j = 1; j < 7; j++) {
                        var cell = tblBodyObj.rows[i].cells[j];
                        if (cell) {
                            cell.setAttribute('style', "padding:1px; margin:0px;font-size:8px;vertical-align:middle;text-align:center");
                            cell.innerHTML = cell.innerHTML.replace(/\&nbsp\;/gi, '').replace(' - ', ':');
                        }
                    }
                }
            }        
        } catch(e) {dump(this.MODULE_NAME + ':' + e + '\n');}
    },
    
    change : function( page, doc ) { return;
        var id = "ft_matchtable";
        if(!doc.getElementById(id)) {
            this.run( page, doc );
        }
    }
};