/**
 * promotion.js
 * adds goal difference to promotion table
 * @author spambot
 */

var FoxtrickPromotionTable = {

    MODULE_NAME : "GoaldifferenceToPromotion",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.8",	
	SCREENSHOT:"",
	PREF_SCREENSHOT:"",
	LASTEST_CHANGE:"adds goal difference to promotion table",    

	init : function() {
        Foxtrick.registerPageHandler( 'promotion', this );
    },
    
    run : function( page, doc ) {
        var tbl_promo = (doc.getElementById("ft_promo")!=null);
		if (tbl_promo) return;
        
        try {
            var div = doc.getElementById('ctl00_CPMain_pnlViewPromotion');
            tbl_promo = doc.getElementsByTagName('TABLE')[0];
            tbl_promo.id = 'ft_promo';
            
            var newTH = doc.createElement('th');
            newTH.setAttribute("style", "text-align:center");
            tbl_promo.rows[0].appendChild(newTH);
            newTH.innerHTML = Foxtrickl10n.getString("foxtrick.seasonstats.goaldiff");

            var tblBodyObj = tbl_promo.tBodies[0];
            for (var i=1; i<tblBodyObj.rows.length; i++) {
                if (tblBodyObj.rows[i].cells[2]) {
                    var newCell = tblBodyObj.rows[i].insertCell(-1);
                    newCell.setAttribute("style", "text-align:center");
                    var content = Foxtrick.trim(tblBodyObj.rows[i].cells[2].innerHTML).split("-");
                    var result = Foxtrick.trim(content[0]) - Foxtrick.trim(content[1]);
                    if (result > 0) newCell.innerHTML = '<span style="color:green>' + result + '</span>';
                    if (result = 0) newCell.innerHTML = '<span style="color:black">' + result + '</span>';
                    if (result < 0) newCell.innerHTML = '<span style="color:red">' + result + '</span>';
                }
            }        
        } catch(e) {dump(this.MODULE_NAME + ':' + e + '\n');}
	},
	
	change : function( page, doc ) {
		var id = "ft_promo";
		if(!doc.getElementById(id)) {
			this.run( page, doc );
		}
	}
};