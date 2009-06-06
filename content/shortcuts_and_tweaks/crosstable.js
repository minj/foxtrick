/**
 * crosstable.js
 * adds cross table to fixtures
 * @author spambot
 */

var FoxtrickCrossTable = {

    MODULE_NAME : "CrossTable",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('fixtures'), 
	DEFAULT_ENABLED : true,
    OPTIONS :  new Array("cut_long_teamnames"),
    OPTION_TEXTS : true,
    OPTION_TEXTS_DEFAULT_VALUES : new Array ("-1"),
	NEW_AFTER_VERSION: "0.4.8.2",
	LASTEST_CHANGE:"some style options",

    _week : 14,
	init : function() {
    },

    run : function( page, doc ) {
        var tbl_cross = (doc.getElementById("ft_cross")!=null);
		if (tbl_cross) return;

		//var DefaultShow = Foxtrick.isModuleFeatureEnabled( this, "DefaultShow" );

        try {
            var width = 540;
            var cutafter = 6;
            var cutlong = false
            if (!Foxtrick.isStandardLayout( doc ) ) { width = 440; cutafter = 5;}
            if (Foxtrick.isModuleFeatureEnabled( this, this.OPTIONS[0]  ) ) {
                var dummy = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + this.OPTIONS[0] + "_text");
                dummy = parseInt(dummy);
                if (dummy > 1) cutlong = dummy;
                // dump(dummy + '|' +cutlong+ '<<\n');
            }

            var div = doc.getElementById('mainBody');
            var tbl_fix = div.getElementsByTagName('TABLE')[0];

            tbl_fix.id = 'ft_fixture';

            var cross = new Array(  new Array( '', -1 , -1 , -1 , -1 , -1, -1 , -1 , -1),
                                    new Array( '', -1 , -1 , -1 , -1 , -1, -1 , -1 , -1),
                                    new Array( '', -1 , -1 , -1 , -1 , -1, -1 , -1 , -1),
                                    new Array( '', -1 , -1 , -1 , -1 , -1, -1 , -1 , -1),
                                    new Array( '', -1 , -1 , -1 , -1 , -1, -1 , -1 , -1),
                                    new Array( '', -1 , -1 , -1 , -1 , -1, -1 , -1 , -1),
                                    new Array( '', -1 , -1 , -1 , -1 , -1, -1 , -1 , -1),
                                    new Array( '', -1 , -1 , -1 , -1 , -1, -1 , -1 , -1));

            var crossgame = new Array(  new Array( '', -1 , -1 , -1 , -1 , -1, -1 , -1 , -1),
                                    new Array( '', -1 , -1 , -1 , -1 , -1, -1 , -1 , -1),
                                    new Array( '', -1 , -1 , -1 , -1 , -1, -1 , -1 , -1),
                                    new Array( '', -1 , -1 , -1 , -1 , -1, -1 , -1 , -1),
                                    new Array( '', -1 , -1 , -1 , -1 , -1, -1 , -1 , -1),
                                    new Array( '', -1 , -1 , -1 , -1 , -1, -1 , -1 , -1),
                                    new Array( '', -1 , -1 , -1 , -1 , -1, -1 , -1 , -1),
                                    new Array( '', -1 , -1 , -1 , -1 , -1, -1 , -1 , -1));

            var week =  new Array(  new Array( '', 0 , 0 , 0 , 0 , 0, 0 , 0 , 0, 0 , 0 , 0 , 0 , 0, 0),
                                    new Array( '', 0 , 0 , 0 , 0 , 0, 0 , 0 , 0, 0 , 0 , 0 , 0 , 0, 0),
                                    new Array( '', 0 , 0 , 0 , 0 , 0, 0 , 0 , 0, 0 , 0 , 0 , 0 , 0, 0),
                                    new Array( '', 0 , 0 , 0 , 0 , 0, 0 , 0 , 0, 0 , 0 , 0 , 0 , 0, 0),
                                    new Array( '', 0 , 0 , 0 , 0 , 0, 0 , 0 , 0, 0 , 0 , 0 , 0 , 0, 0),
                                    new Array( '', 0 , 0 , 0 , 0 , 0, 0 , 0 , 0, 0 , 0 , 0 , 0 , 0, 0),
                                    new Array( '', 0 , 0 , 0 , 0 , 0, 0 , 0 , 0, 0 , 0 , 0 , 0 , 0, 0),
                                    new Array( '', 0 , 0 , 0 , 0 , 0, 0 , 0 , 0, 0 , 0 , 0 , 0 , 0, 0));
            //Teams
            var tblBodyObj = tbl_fix.tBodies[0];
            for (var i = 0; i < 4; i++) {
                var dummy = tblBodyObj.rows[i+1].cells[1].innerHTML;
                dummy = dummy.split('">')[1].split('</a>')[0].split('&nbsp;-&nbsp;');
                // dump('['+ dummy + ']\n');

                cross[i*2][0] = dummy[0]; crossgame[i*2][0] = dummy[0]; week[i*2][0] = dummy[0];
                cross[i*2 + 1][0] = dummy[1]; crossgame[i*2+1][0] = dummy[1]; week[i*2+1][0] = dummy[1];
                // dump('' + cross[i*2] + '\n' + cross[i*2+1]+'\n');
            }

            //results
            var row = 0; points_aw = 0; points_hm = 0;
            for (var j = 0; j<14; j++){ //day
                // dump(j + ' [--------------------------------\n');
                for (var i = 0; i<4 ; i++) { //row
                    row = j*5 + i+1;

                    var dummy = tblBodyObj.rows[row].cells[1].innerHTML;

                    dummy = dummy.split('">')[1].split('</a>')[0].split('&nbsp;-&nbsp;');

                    var crossID = tblBodyObj.rows[row].cells[1].innerHTML.split('matchID=')[1].split('&amp;TeamId=')[0];
                    // dump('row [' + row + ']  "'+ dummy[0] + '" "' + dummy[1] + '"\n');
                    var home = -1;
                    var away = -1;
                    var homegame = false;

                    //Team 1-2
                    for (var k = 0; k<8; k++){ //vs
                        if (dummy[0] == cross[k][0]) {home = k; homegame = true;}
                        if (dummy[1] == cross[k][0]) {away = k}
                        if ((home != -1) && (away != -1)) {

                            var result = tblBodyObj.rows[row].cells[2].innerHTML.split('-');

                            crossgame[home][away+1] = crossID;

                            if (!result[1]) {
                                result[0] = -1;
                                result[1] = -1;

                            }
                            else {
                                result[0] = parseInt(Foxtrick.trim(result[0]));
                                result[1] = parseInt(Foxtrick.trim(result[1]));
                                tblBodyObj.rows[row].cells[2].innerHTML = result[0] + ' - ' + result[1];
                            }
                            if ((homegame) && (result[0] != -1)) {
                                cross[home][away+1] = result[0] + '-' + result[1];
                                var points_hm = 1, points_aw = 1;
                                if (result[0] > result[1]) {points_hm = 3; points_aw = 0;}
                                if (result[0] < result[1]) {points_hm = 0; points_aw = 3;}
                                if (j == 0) {var old_hm = 0; var old_aw = 0;} else {old_hm = week[home][j]; old_aw = week[away][j];}
                                week[home][j+1] = points_hm *1000 + old_hm + result[0] - result[1];
                                week[away][j+1] = points_aw *1000 + old_aw + result[1] - result[0];

                            }
                            else {
                                cross[home][away+1] = '-';
                                week[home][j+1] = week[home][j];
                                week[away][j+1] = week[away][j];

                            }
                            //dump ('[' + home + ' - '+ away+'] ' + result[0]+':'+result[1] + '|' + crossgame[home][away+1] + '\n');
                            break;
                        }
                    }
                }
                // dump('>>>>>>' + week + '<<<<<<\n\n');
			}

			var dayhead=0;
			for (var j = 0; j<tblBodyObj.rows.length; j++){
				if (dayhead==0) {
					tblBodyObj.rows[j].cells[1].innerHTML = '<br/>'+tblBodyObj.rows[j].cells[0].innerHTML;
					tblBodyObj.rows[j].cells[1].setAttribute('class','ch');
					tblBodyObj.rows[j].setAttribute('style','margin-top:10px;');
				}
				++dayhead;
				if  (dayhead==5) dayhead=0;
				tblBodyObj.rows[j].deleteCell(3);
				tblBodyObj.rows[j].deleteCell(0);
			}


            var crosstable = doc.createElement('table');
            crosstable.id = 'ft_cross';
            crosstable.setAttribute("style", "width:"+width+"px;margin:10px 0px 10px -10px;border:1px dotted #EEEEEE;font-size:10px;");
            var tb=doc.createElement("tbody");

            crosstable.appendChild(tb);
            for (var x=0; x < 8; x++){
                var row = doc.createElement("tr");
                row.id = "ft_ct_row"+x;
                tb.appendChild(row);
                if (x==0) { //head
                    var cell = doc.createElement("th");
                    var cnt = doc.createTextNode('');
                    cell.appendChild(cnt);
                    row.appendChild(cell);

                    for (var i = 0; i<8; i++){
                        var cell = doc.createElement("th");
                        cell.setAttribute("style", "text-align:center;");
                        var cnt = doc.createTextNode(cross[i][0].substring(0,cutafter).replace(/\s/i,""));
                        cell.appendChild(cnt);
                        row.appendChild(cell);
                    }
                    var row = doc.createElement("tr");
                    row.id = "ft_ct_row"+x;
                    tb.appendChild(row);
                }
                for (var y=0; y < 9; y++){ //zeile
                    if (y==0) var cell = doc.createElement("th"); //left head
                    else var cell = doc.createElement("td"); //inner result
                    if (cross[x][y] != -1) { //result
                            if (y ==0) //teamnames
                                if (!cutlong) var cnt = doc.createTextNode(cross[x][y])
                                else {
                                    // if (cross[x][y].length > cutlong) var dot = '…'; else var dot = '';
                                    var cnt = doc.createTextNode(cross[x][y].substring(0,cutlong));
                                }
                            else {
                                cell.setAttribute("style", "text-align:center");
                                var a = doc.createElement("a");
                                a.title = cross[x][y];
                                a.innerHTML = cross[x][y];
                                if (cross[x][y].split('-')[0] > cross[x][y].split('-')[1] && (y!=0))
                                    a.setAttribute("style", "font-weight:bold;text-align:center;color:green;text-decoration:none;");
                                if (cross[x][y].split('-')[0] == cross[x][y].split('-')[1] && (y!=0))
                                    a.setAttribute("style", "font-weight:bold;text-align:center;color:gray;text-decoration:none;");
                                if (cross[x][y].split('-')[0] < cross[x][y].split('-')[1] && (y!=0))
                                    a.setAttribute("style", "font-weight:bold;text-align:center;color:red;text-decoration:none;");
                                a.href = '/Club/Matches/Match.aspx?matchID=' + crossgame[x][y];
                                var cnt = a;
                            }
                        }
                    else
                        var cnt = doc.createTextNode('');
                    cell.appendChild(cnt);
                    row.appendChild(cell);
                }
            }
            div.insertBefore(crosstable, div.getElementsByTagName('h1')[0].nextSibling);

            var divmap = doc.createElement('div');
            divmap.id = 'ft_graph';
            divmap.className = 'ft_graph_div';
            divmap.setAttribute('style', 'border : 1px dotted #EEEEEE; width:440px; height:200px;margin:10px 0px 10px -10px;');
            div.insertBefore(divmap, div.getElementsByTagName('h1')[0].nextSibling);
            for (var draw=0; draw <= 14; draw++) {
                this._week = draw;
                //week.sort(this.numComparisonDesc);
                this.qsort(week, 0, 7);

                for(var act = 0; act<8; act++) {
                    if (draw>0) week[act][draw] = act+1;
                }
                dump('\n>' +' - ' + this._week + ' - '+ week + '<\n\n');                
            }
            var position = ''; teams = '';
            for (var ii = 0; ii<8; ii++) {
                for(var jj = 1; jj<14; jj++) {
                    position += (9-week[ii][jj]) + ',';
                }
                if (ii < 7) {position += (9-week[ii][14]) + '|';}
                else {position += (9-week[ii][14]);}
            }
            for (var ii = 0; ii<8; ii++) {
                if (ii < 7) {teams += escape(week[ii][0]).substring(0,12).replace(/\ /g,'+').replace(/\%.{2}/g,'+') + '|';}
                else {teams += escape(week[ii][0]).substring(0,12).replace(/\ /g,'+').replace(/\%.{2}/g,'+');}
            }            

            var url = "http://chart.apis.google.com/chart?cht=lc&chs="+width+"x200&chds=0.5,8.5&chxt=x,y&chxl=1:|8|7|6|5|4|3|2|1|0:|1|2|3|4|5|6|7|8|9|10|11|12|13|14&chxp=1,6.25,18.5,31.75,44,56.25,68.25,81.5,93.75&chg=7.692,12.5,1,10,0,6.25&chf=bg,s,FAFAFA&chma=10,10,10,10&chco=FF0000,00FF00,0000FF,FF8800,FF0088,880000,000000,338800&chf=c,lg,90,DDDDCC,0.5,FFFFFF,0|bg,s,EFEFEF&chd=t:"+ position + "&chdl="+ teams;
            // Foxtrick.alert('URL: [' + url + ']\n')
            dump('\n' + url + '\n');
            var image = doc.createElement('img');
            image.src = url;
            image.title = doc.getElementsByTagName('h1')[0].textContent.replace(/(\ )|(\&nbsp\;)/g,'');
            image.alt = doc.getElementsByTagName('h1')[0].textContent.replace(/(\ )|(\&nbsp\;)/g,'');
            divmap.appendChild(image);
            
        } catch(e) {dump(this.MODULE_NAME + ':' + e + '\n');}
	},

	change : function( page, doc ) {
		var id = "ft_cross";
		if(!doc.getElementById(id)) {
			this.run( page, doc );
		}
	},

    numComparisonDesc : function(a, b)	{
        // dump(b[this._week] +'[this._week]' + a[this._week]);
        return b[this._week]-a[this._week];
    },
    
    qsort : function (feld,anfang,ende) {
    	try{
            var i=0;
            var pivot,mitte,tmp;
            if(ende < anfang) return feld;
            pivot = anfang;
            mitte = anfang;
            for (var i = anfang+1; i <= ende; i++) {
                if(feld[i][this._week] > feld[pivot][this._week]) {
                    mitte++;
                    tmp = feld[i];
                    feld[i] = feld[mitte];
                    feld[mitte] = tmp;
                }
            }
            tmp = feld[mitte]
            feld[mitte] = feld[pivot];
            feld[pivot] = tmp;
            feld = this.qsort(feld,anfang,mitte-1);
            feld = this.qsort(feld,mitte+1,ende);
            return feld;
        } catch(eee) {dump('sort: '+eee + '\n');}
	}    
};