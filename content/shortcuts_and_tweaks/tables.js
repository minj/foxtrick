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