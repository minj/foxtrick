/**
 * tables.js
 * adds goal difference to tables
 * @author spambot
 */

var FoxtrickTables = {

    MODULE_NAME : "GoaldifferenceToTables",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('promotion','oldseries','marathon'),
    DEFAULT_ENABLED : true,
    NEW_AFTER_VERSION : "0.5.0.5",
    LATEST_CHANGE : "Fixed goal differences when it's positive",

    CSS : Foxtrick.ResourcePath + "resources/css/goal-diff.css",

    run : function( page, doc ) {
        var tbl_goaldiff = (doc.getElementById("ft_goaldiff")!=null);
        if (tbl_goaldiff) return;

        var goalcell = 2;
        var div = doc.getElementById('ctl00_CPMain_pnlViewPromotion');
        if (!div) {div = doc.getElementById('mainBody'); goalcell = 3;}

		var tbl_promo = div.getElementsByTagName('TABLE')[0];
        tbl_promo.id = 'ft_goaldiff';

        var newTH = doc.createElement('th');
        newTH.className = "right";
        tbl_promo.rows[0].appendChild(newTH);
        newTH.textContent = Foxtrickl10n.getString("foxtrick.seasonstats.goaldiff");

        var tblBodyObj = tbl_promo.tBodies[0];
        for (var i=1; i<tblBodyObj.rows.length; i++) {
            if (tblBodyObj.rows[i].cells[goalcell]) {
                var newCell = tblBodyObj.rows[i].insertCell(-1);
                newCell.className = "right";
                var content = Foxtrick.trim(tblBodyObj.rows[i].cells[goalcell].textContent).split("-");
                if (Foxtrick.trim(content[0]) == '') {
                    content[0] = Foxtrick.trim(tblBodyObj.rows[i].cells[goalcell-1].textContent);
                    content[1] = Foxtrick.trim(tblBodyObj.rows[i].cells[goalcell+1].textContent);
                }
                var result = Foxtrick.trim(content[0]) - Foxtrick.trim(content[1]);
                newCell.textContent = result;
                if (result > 0)
                    Foxtrick.addClass(newCell, "ft-gd-positive");
                else if (result == 0)
                    Foxtrick.addClass(newCell, "ft-gd-zero");
                else // result < 0
                    Foxtrick.addClass(newCell, "ft-gd-negative")
            }
        }
    },

    change : function( page, doc ) {
        var id = "ft_goaldiff";
        if(!doc.getElementById(id)) {
            this.run( page, doc );
        }
    }
};

var FoxtrickMatchTables = {

    MODULE_NAME : "MatchTables",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('matchesarchiv', 'matches','league','youthleague'),
    DEFAULT_ENABLED : false,
    NEW_AFTER_VERSION: "0.4.8.2",
    LATEST_CHANGE:"removes white space on match tables",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	OPTIONS :  new Array("RemoveTime"),

    run : function( page, doc ) {
        if (Foxtrick.isStandardLayout(doc)) return;

		// adjust league table
		if (page=='league' || page== 'youthleague') {
			Foxtrick.addStyleSheet(doc,Foxtrick.ResourcePath+"resources/css/FoxtrickMatchTables_league.css");
			return;
		}

		// adjust matchtable, keep hour
		if (!Foxtrick.isModuleFeatureEnabled( this, "RemoveTime" ) ) {
			if (page=='matchesarchiv' || page== 'matches') Foxtrick.addStyleSheet(doc,Foxtrick.ResourcePath+"resources/css/FoxtrickMatchTables_matches.css");
			return;
		}

		// adjust matchtable, remove hour
		var id = "ft_matchtable";
        if (doc.getElementById(id)) return;

        var div = doc.getElementById('mainBody');
        if (!div) return;
        var tbl = div.getElementsByTagName('TABLE')[0];
        if (!tbl) return;
        tbl.id = 'ft_matchtable';
        tbl.setAttribute('class', '');
        tbl.setAttribute('style', 'margin-left:-6px; margin-right:-6px; padding:0px;width:440px;');

        var tblBodyObj = tbl.tBodies[0];
        var section = 0;
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
                        if (content.search(/\(/) > -1) cell.innerHTML = ar[1] + '.' + ar[3] + '.' + ar[5].substring(2,4)  + '&nbsp;<span id="ft_HTDateFormat">(' + content.split('(')[1] + '</span>';
                        else cell.innerHTML = ar[1] + '.' + ar[3] + '.' + ar[5].substring(2,4);
                        if (ar.length>7) cell.title = ar[7] + ar[8] + ar[9] + ar[10];
                        break;
                    case 'mmddyyyy':
                        if (content.search(/\(/) > -1) cell.innerHTML = ar[1] + '.' + ar[3] + '.' + ar[5].substring(2,4)  + '&nbsp;<span id="ft_HTDateFormat">(' + content.split('(')[1] + '</span>';
                        else cell.innerHTML = ar[1] + '.' + ar[3] + '.' + ar[5].substring(2,4);
                        if (ar.length>7) cell.title = ar[7] + ar[8] + ar[9] + ar[10];
                        break;
                    case 'yyyymmdd':
                        if (content.search(/\(/) > -1) cell.innerHTML = ar[1] + '-' + ar[3] + '-' + ar[5].substring(2,4)  + '&nbsp;<span id="ft_HTDateFormat">(' + content.split('(')[1] + '</span>';
                        else cell.innerHTML = ar[1] + '-' + ar[3] + '-' + ar[5].substring(2,4);
                        if (ar.length>7) cell.title = ar[7] + ar[8] + ar[9] + ar[10];
                        break;
                }
                cell.setAttribute('style', "font-size:9px; text-align:center;padding:2px 0px 2px 0px;vertical-align:middle;");
                cell.setAttribute('class', "date");
                if (section == 2) {
                    tblBodyObj.rows[i].deleteCell(3);
                    tblBodyObj.rows[i].cells[2].setAttribute('colspan', 2);
                }
                for(var j = 1; j < 7; j++) {
                    var cell = tblBodyObj.rows[i].cells[j];
                    if (cell) {

                        cell.setAttribute('style', "padding:1px; margin:0px;font-size:10px;vertical-align:middle;text-align:center");
                        if (j != 2)
                            cell.innerHTML = cell.innerHTML.replace(/\&nbsp\;/gi, '').replace(' - ', ':');
                        else
                            cell.innerHTML = cell.innerHTML.replace(' - ', ':')
                    }
                }
            } else section++;
        }
    },

    change : function( page, doc ) {
        var id = "ft_matchtable";
        if(!doc.getElementById(id)) {
            this.run( page, doc );
        }
    }
};
