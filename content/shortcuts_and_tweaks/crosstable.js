/**
 * promotion.js
 * adds cross table to fixtures
 * @author spambot
 */

var FoxtrickCrossTable = {

    MODULE_NAME : "CrossTable",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.8.1",
	SCREENSHOT:"",
	PREF_SCREENSHOT:"",
	LASTEST_CHANGE:"adds cross table to fixtures",

	init : function() {
        Foxtrick.registerPageHandler( 'fixtures', this );
    },

    run : function( page, doc ) {
        var tbl_cross = (doc.getElementById("ft_cross")!=null);
		if (tbl_cross) return;

        try {
            var div = doc.getElementById('mainBody');
            tbl_fix = div.getElementsByTagName('TABLE')[0];

            tbl_fix.id = 'ft_fixture';

            var cross = new Array(  new Array( '', -1 , -1 , -1 , -1 , -1, -1 , -1 , -1),
                                    new Array( '', -1 , -1 , -1 , -1 , -1, -1 , -1 , -1),
                                    new Array( '', -1 , -1 , -1 , -1 , -1, -1 , -1 , -1),
                                    new Array( '', -1 , -1 , -1 , -1 , -1, -1 , -1 , -1),
                                    new Array( '', -1 , -1 , -1 , -1 , -1, -1 , -1 , -1),
                                    new Array( '', -1 , -1 , -1 , -1 , -1, -1 , -1 , -1),
                                    new Array( '', -1 , -1 , -1 , -1 , -1, -1 , -1 , -1),
                                    new Array( '', -1 , -1 , -1 , -1 , -1, -1 , -1 , -1));

            //Teams
            var tblBodyObj = tbl_fix.tBodies[0];
            for (var i = 0; i < 4; i++) {
                var dummy = tblBodyObj.rows[i+1].cells[1].innerHTML;
                dummy = dummy.split('">')[1].split('</a>')[0].split('&nbsp;-&nbsp;');
                // dump('['+ dummy + ']\n');

                cross[i*2][0] = dummy[0];
                cross[i*2 + 1][0] = dummy[1];
                // dump('' + cross[i*2] + '\n' + cross[i*2+1]+'\n');
            }

            //results
            var row = 0;
            for (var j = 0; j<14; j++){ //day
                // dump(j + ' [--------------------------------\n');
                for (i = 0; i<4 ; i++) { //row
                    row = j*5 + i+1;

                    var dummy = tblBodyObj.rows[row].cells[1].innerHTML;

                    dummy = dummy.split('">')[1].split('</a>')[0].split('&nbsp;-&nbsp;');
                    // dump('row [' + row + ']  "'+ dummy[0] + '" "' + dummy[1] + '"\n');
                    var home = -1;
                    var away = -1;
                    var homegame = false;

                    //Team 1-2
                    for (var k = 0; k<8; k++){ //vs
                        if (dummy[0] == cross[k][0]) {home = k; homegame = true;}
                        if (dummy[1] == cross[k][0]) {away = k}
                        if ((home != -1) && (away != -1)) {

                            result = tblBodyObj.rows[row].cells[2].innerHTML.split('-');

                            if (!result[1]) {
                                result[0] = -1;
                                result[1] = -1;
                            }
                            else {
                                result[0] = Foxtrick.trim(result[0]);
                                result[1] = Foxtrick.trim(result[1]);
                                tblBodyObj.rows[row].cells[2].innerHTML = result[0] + ':' + result[1];
                            }
                            if ((homegame) && (result[0] != -1))
                                cross[home][away+1] = result[0] + '-' + result[1];
                                else cross[home][away+1] = '-';
                            // dump ('[' + home + ' - '+ away+'] ' + result[0]+':'+result[1] + '\n');
                            break;
                        }
                    }
                }
            }


            var crosstable = doc.createElement('table');
            crosstable.id = 'ft_cross';
            crosstable.setAttribute("style", "100%");
            var tb=doc.createElement("tbody");

            crosstable.appendChild(tb);
            for (var x=0; x < 8; x++){
                var row = doc.createElement("tr");
                row.id = "ft_ct_row"+x;
                tb.appendChild(row);
                if (x==0) {
                    var cell = doc.createElement("th");
                    var cnt = doc.createTextNode('');
                    cell.appendChild(cnt);
                    row.appendChild(cell);

                    for (i = 0; i<8; i++){
                        var cell = doc.createElement("th");
                        cell.setAttribute("style", "text-align:center;width:20%");
                        var cnt = doc.createTextNode(cross[i][0].substring(0,6).replace(/\s/i,""));
                        cell.appendChild(cnt);
                        row.appendChild(cell);
                    }
                    var row = doc.createElement("tr");
                    row.id = "ft_ct_row"+x;
                    tb.appendChild(row);
                }
                for (var y=0; y < 9; y++){
                    if (y==0) var cell = doc.createElement("th");
                    else var cell = doc.createElement("td");
                    if (cross[x][y] != -1) {
                            if (cross[x][y].split('-')[0] > cross[x][y].split('-')[1])
                                cell.setAttribute("style", "font-weight:bold;text-align:center;color:green");
                            if (cross[x][y].split('-')[0] == cross[x][y].split('-')[1])
                                cell.setAttribute("style", "font-weight:bold;text-align:center;color:gray");
                            if (cross[x][y].split('-')[0] < cross[x][y].split('-')[1])
                                cell.setAttribute("style", "font-weight:bold;text-align:center;color:red");
                            var cnt = doc.createTextNode(cross[x][y]);
                        }
                    else
                        var cnt = doc.createTextNode('');
                    cell.appendChild(cnt);
                    row.appendChild(cell);
                }
            }
            div.appendChild(crosstable);
        } catch(e) {dump(this.MODULE_NAME + ':' + e + '\n');}
	},

	change : function( page, doc ) {
		var id = "ft_cross";
		if(!doc.getElementById(id)) {
			this.run( page, doc );
		}
	}
};