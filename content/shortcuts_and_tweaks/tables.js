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
    NEW_AFTER_VERSION: "0.4.8.1",	
    LASTEST_CHANGE:"adds goal difference to tables",    

    init : function() {
    },
    
    run : function( page, doc ) {
        var tbl_goaldiff = (doc.getElementById("ft_goaldiff")!=null);
        if (tbl_goaldiff) return;
        
        try {
            var goalcell = 2;
            var div = doc.getElementById('ctl00_CPMain_pnlViewPromotion');
            if (!div) {div = doc.getElementById('mainBody'); goalcell = 3;}
            // Foxtrick.alert(div.innerHTML);
            var tbl_promo = div.getElementsByTagName('TABLE')[0];
            tbl_promo.id = 'ft_goaldiff';
            
            var newTH = doc.createElement('th');
            newTH.setAttribute("style", "text-align:center");
            tbl_promo.rows[0].appendChild(newTH);
            newTH.innerHTML = Foxtrickl10n.getString("foxtrick.seasonstats.goaldiff");

            var tblBodyObj = tbl_promo.tBodies[0];
            for (var i=1; i<tblBodyObj.rows.length; i++) {
                if (tblBodyObj.rows[i].cells[goalcell]) {
                    var newCell = tblBodyObj.rows[i].insertCell(-1);
                    newCell.setAttribute("style", "text-align:right");
                    var content = Foxtrick.trim(tblBodyObj.rows[i].cells[goalcell].innerHTML).split("-");
                    if (Foxtrick.trim(content[0]) == '') { 
                        content[0] = Foxtrick.trim(tblBodyObj.rows[i].cells[goalcell-1].innerHTML); 
                        content[1] = Foxtrick.trim(tblBodyObj.rows[i].cells[goalcell+1].innerHTML);
                    }
                    var result = Foxtrick.trim(content[0]) - Foxtrick.trim(content[1]);
                    if (result > 0) newCell.innerHTML = '<span style="color:green>' + result + '</span>';
                    if (result == 0) newCell.innerHTML = '<span style="color:black">' + result + '</span>';
                    if (result < 0) newCell.innerHTML = '<span style="color:red">' + result + '</span>';
                }
            }        
        } catch(e) {dump(this.MODULE_NAME + ':' + e + '\n');}
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
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('matchesarchiv', 'matches'), 
    DEFAULT_ENABLED : true,
    NEW_AFTER_VERSION: "0.4.8.3",	
    LASTEST_CHANGE:"removes white space on match tables",    

    init : function() {
    },
    
    run : function( page, doc ) {
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
                            cell.innerHTML = ar[1] + '.' + ar[3] + '.' + ar[5].substring(2,4) + '&nbsp;<span id="ft_HTDateFormat">(' + content.split('(')[1] + '</span>';
                            break;
                        case 'mmddyyyy':
                            cell.innerHTML = ar[1] + '.' + ar[3] + '.' + ar[5].substring(2,4) + '&nbsp;(' + content.split('(')[1];
                            break;
                        case 'yyyymmdd':
                            cell.innerHTML = ar[1] + '-' + ar[3] + '-' + ar[5].substring(2,4) + '&nbsp;(' + content.split('(')[1];
                            break;
                    }
                    cell.setAttribute('style', "font-size:6px; text-align:center;padding:2px 0px 2px 0px;vertical-align:middle;");
                    cell.setAttribute('class', "date");
                    
                    for(var j = 1; j < 7; j++) {
                        var cell = tblBodyObj.rows[i].cells[j];
                        if (cell) {
                            cell.setAttribute('style', "padding:1px; margin:0px;font-size:8px;vertical-align:middle;");
                            cell.innerHTML = cell.innerHTML.replace(/\&nbsp\;/gi, '').replace(' - ', ':');
                        }
                    }
                }
            }        
        } catch(e) {dump(this.MODULE_NAME + ':' + e + '\n');}
    },
    
    change : function( page, doc ) {
        var id = "ft_matchtable";
        if(!doc.getElementById(id)) {
            this.run( page, doc );
        }
    }
};