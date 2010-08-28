/**
 * election.js
 * some more infos on election page
 * @author spambot
 */

var FoxtrickElectionTable = {

    MODULE_NAME : "ElectionTable",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('election'),
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.8.1",
	LATEST_CHANGE:"adds percentage to election tables",

    run : function( page, doc ) {
        var tbl_election = (doc.getElementById("ft_election")!=null);
        if (tbl_election) return;

        try {
            var sum = 0;
            var div = doc.getElementById('mainBody');

            tbl_election = div.getElementsByTagName('TABLE')[0];
            if (!tbl_election) return;
            tbl_election.id = 'ft_election';

            var tblBodyObj = tbl_election.tBodies[0];
            if (!tblBodyObj) return;


            for (var i=0; i<tblBodyObj.rows.length; i++) {
                if (tblBodyObj.rows[i].cells[2]) {
                    sum += parseInt(Foxtrick.trim(tblBodyObj.rows[i].cells[2].innerHTML));
                }
            }

            for (var i=0; i<tblBodyObj.rows.length; i++) {
                if (tblBodyObj.rows[i].cells[2]) {
                    var content = parseInt(Foxtrick.trim(tblBodyObj.rows[i].cells[2].innerHTML));
                    var result = '(' + Math.floor(content/sum*1000)/10 + '%) ';
                    tblBodyObj.rows[i].cells[3].innerHTML += result;
                }
            }
            var cnt = doc.createElement('div');
            cnt.innerHTML = '<b>&Sigma: ' + Foxtrick.formatNumber(sum,'.') + '</b>';
            cnt.setAttribute('style', 'padding-top: 10px;');
            div.appendChild(cnt);

        } catch(e) {Foxtrick.dump(this.MODULE_NAME + ':' + e + '\n');}

	},

	change : function( page, doc ) {
		var id = "ft_election";
		if(!doc.getElementById(id)) {
			this.run( page, doc );
		}
	}
};
