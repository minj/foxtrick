/**
 * matches.js
 * adds att vs def bars on matches page
 * @author taised, Jestar
 */
////////////////////////////////////////////////////////////////////////////////
var AttVsDef = {

	MODULE_NAME : "AttVsDef",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	DEFAULT_ENABLED : true,
	RADIO_OPTIONS : new Array("newstyle", "oldstyle"),

	init : function() {
		Foxtrick.registerPageHandler( 'match', this );
		Matches.init();
	},

	run : function( page, doc ) {
		try {
			var sidebar = doc.getElementById('sidebar');
			var ratingstable = Matches._getRatingsTable(doc);
			if ((ratingstable == null) || (Matches._getStatFromCell(ratingstable.rows[2].cells[1]) == 0)) return;
			
			var percentArray=this._getPercentArray(doc, ratingstable);

			var midfieldLevel=new Array(Matches._getStatFromCell(ratingstable.rows[1].cells[1]), Matches._getStatFromCell(ratingstable.rows[1].cells[2]));
			var rdefence=new Array(Matches._getStatFromCell(ratingstable.rows[2].cells[1]), Matches._getStatFromCell(ratingstable.rows[2].cells[2]));
			var cdefence=new Array(Matches._getStatFromCell(ratingstable.rows[3].cells[1]), Matches._getStatFromCell(ratingstable.rows[3].cells[2]));
			var ldefence=new Array(Matches._getStatFromCell(ratingstable.rows[4].cells[1]), Matches._getStatFromCell(ratingstable.rows[4].cells[2]));
			var rattack=new Array(Matches._getStatFromCell(ratingstable.rows[5].cells[1]), Matches._getStatFromCell(ratingstable.rows[5].cells[2]));
			var cattack=new Array(Matches._getStatFromCell(ratingstable.rows[6].cells[1]), Matches._getStatFromCell(ratingstable.rows[6].cells[2]));
			var lattack=new Array(Matches._getStatFromCell(ratingstable.rows[7].cells[1]), Matches._getStatFromCell(ratingstable.rows[7].cells[2]));
			
			var ratingsArray;
			if (ratingstable.rows.length > 12) {
				var ifkdefence=new Array(Matches._getStatFromCell(ratingstable.rows[10].cells[1]), Matches._getStatFromCell(ratingstable.rows[10].cells[2]));
				var ifkattack=new Array(Matches._getStatFromCell(ratingstable.rows[11].cells[1]), Matches._getStatFromCell(ratingstable.rows[11].cells[2]));

				ratingsArray = new Array(rdefence, cdefence, ldefence, rattack, cattack, lattack, ifkdefence, ifkattack);
			}
			else  {
				ratingsArray = new Array(rdefence, cdefence, ldefence, rattack, cattack, lattack);
			}
			
			var rdefenceText=new Array(ratingstable.rows[2].cells[1], ratingstable.rows[2].cells[2]);
			var cdefenceText=new Array(ratingstable.rows[3].cells[1], ratingstable.rows[3].cells[2]);
			var ldefenceText=new Array(ratingstable.rows[4].cells[1], ratingstable.rows[4].cells[2]);
			var rattackText=new Array(ratingstable.rows[5].cells[1], ratingstable.rows[5].cells[2]);
			var cattackText=new Array(ratingstable.rows[6].cells[1], ratingstable.rows[6].cells[2]);
			var lattackText=new Array(ratingstable.rows[7].cells[1], ratingstable.rows[7].cells[2]);
			
			var ratingsTextArray;
			if (ratingstable.rows.length > 12) {
				var ifkdefenceText=new Array(ratingstable.rows[10].cells[1], ratingstable.rows[10].cells[2]);
				var ifkattackText=new Array(ratingstable.rows[11].cells[1], ratingstable.rows[11].cells[2]);
				ratingsTextArray = new Array(rdefenceText, cdefenceText, ldefenceText, rattackText, cattackText, lattackText, ifkdefenceText, ifkattackText);
			}
			else {
				ratingsTextArray = new Array(rdefenceText, cdefenceText, ldefenceText, rattackText, cattackText, lattackText);
			}

			var strangediv=sidebar.childNodes[7].childNodes[1].childNodes[7];
			if (strangediv) {
				sidebar.insertBefore(this._createBarDiv_extended(doc, percentArray, strangediv, ratingsArray, ratingsTextArray), sidebar.childNodes[8]);
			} else {
				strangediv=sidebar.childNodes[7].childNodes[8];
				sidebar.insertBefore(this._createBarDiv_extended(doc, percentArray, strangediv, ratingsArray, ratingsTextArray), sidebar.childNodes[8]);
			}
		} catch (e) {
			dump('attvsdef.js run: '+e+"\n");
		}

	},

	_createBarDiv_extended: function(doc, percentArray, strangediv, ratingsArray, ratingsTextArray) {
		//Create a bar div for extended layout

		var maindiv=doc.createElement('div');
		maindiv.className='sidebarBox';

		var headdiv=doc.createElement('div');
		headdiv.className='boxHead';

		var leftdiv=doc.createElement('div');
		leftdiv.className='boxLeft';

		var leftdivcontent=doc.createElement('h2');
		leftdivcontent.innerHTML=Foxtrickl10n.getString( "foxtrick.matches.attackdefensebars" );

		leftdiv.appendChild(leftdivcontent);
		headdiv.appendChild(leftdiv);
		maindiv.appendChild(headdiv);

		var bodydiv=doc.createElement('div');
		bodydiv.className='boxBody';

		if (percentArray.length > 0) {
			if (FoxtrickPrefs.getInt("module." + this.MODULE_NAME + ".value") == 1) {
				this._oldStyleBars(doc, bodydiv, ratingsArray, ratingsTextArray);
			}
			else {
				this._newStyleBars(doc, bodydiv, percentArray, strangediv);
			}
		} else {
			bodydiv.innerHTML=Foxtrickl10n.getString( "foxtrick.matches.wronglang" );
		}

		maindiv.appendChild(bodydiv);

		var footerdiv = doc.createElement('div');
		footerdiv.className="boxFooter";
		footerdiv.innerHTML='<div class="boxLeft">&nbsp;</div>';
		maindiv.appendChild(footerdiv);

		return maindiv;
	},
	
	_oldStyleBars: function (doc, bodydiv, ratingsArray, ratingsTextArray) {
		Foxtrick.addStyleSheet(doc, "chrome://foxtrick/content/resources/css/matchgraphs.css");
		
		var rText = Foxtrickl10n.getString( "foxtrick.matchdetail.rightshort" );
		var cText = Foxtrickl10n.getString( "foxtrick.matchdetail.centershort" );
		var lText = Foxtrickl10n.getString( "foxtrick.matchdetail.leftshort" );
		var iText = Foxtrickl10n.getString( "foxtrick.matchdetail.ifkshort" );

		var barsdiv = doc.createElement("div");
		barsdiv.className = "foxtrick-showgraphs";

		var tablediv = doc.createElement("div");
		tablediv.className = "foxtrick-graphs-table";
		var p = doc.createElement('div');
		p.className = "foxtrick-graphs-header";
		p.innerHTML = Foxtrickl10n.getString( "foxtrick.matches.defense" ) + " - " + Foxtrickl10n.getString( "foxtrick.matches.attack" );
		barsdiv.appendChild(p);
		AttVsDef._createGraphRow(doc, tablediv, ratingsArray[0][0], ratingsArray[5][1], rText, lText, ratingsTextArray[0][0], ratingsTextArray[5][1]);
		AttVsDef._createGraphRow(doc, tablediv, ratingsArray[1][0], ratingsArray[4][1], cText, cText, ratingsTextArray[1][0], ratingsTextArray[4][1]);
		AttVsDef._createGraphRow(doc, tablediv, ratingsArray[2][0], ratingsArray[3][1], lText, rText, ratingsTextArray[2][0], ratingsTextArray[3][1]);
		if (ratingsArray.length > 6) {
			tablediv.appendChild(doc.createElement('br'));
			AttVsDef._createGraphRow(doc, tablediv, ratingsArray[6][0], ratingsArray[7][1], iText, iText, ratingsTextArray[6][0], ratingsTextArray[7][1]);
		}
		barsdiv.appendChild(tablediv);
		barsdiv.appendChild(doc.createElement('br'));

		var tablediv = doc.createElement("div");
		tablediv.className = "foxtrick-graphs-table";
		var p = doc.createElement('div');
		p.className = "foxtrick-graphs-header";
		p.innerHTML = Foxtrickl10n.getString( "foxtrick.matches.attack" ) + " - " + Foxtrickl10n.getString( "foxtrick.matches.defense" );
		barsdiv.appendChild(p);
		AttVsDef._createGraphRow(doc, tablediv, ratingsArray[3][0], ratingsArray[2][1], rText, lText, ratingsTextArray[3][0], ratingsTextArray[2][1]);
		AttVsDef._createGraphRow(doc, tablediv, ratingsArray[4][0], ratingsArray[1][1], cText, cText, ratingsTextArray[4][0], ratingsTextArray[1][1]);
		AttVsDef._createGraphRow(doc, tablediv, ratingsArray[5][0], ratingsArray[0][1], lText, rText, ratingsTextArray[5][0], ratingsTextArray[0][1]);
		if (ratingsArray.length > 6) {
			tablediv.appendChild(doc.createElement('br'));
			AttVsDef._createGraphRow(doc, tablediv, ratingsArray[7][0], ratingsArray[6][1], iText, iText, ratingsTextArray[7][0], ratingsTextArray[6][1]);
		}
		barsdiv.appendChild(tablediv);
		barsdiv.appendChild(doc.createElement('br'));

		bodydiv.appendChild(barsdiv);
	},
	
	_newStyleBars: function (doc, bodydiv, percentArray, strangediv) {
		var rdefText = Foxtrickl10n.getString( "foxtrick.matches.right" )+' '+Foxtrickl10n.getString( "foxtrick.matches.defense" );
		var lattText = Foxtrickl10n.getString( "foxtrick.matches.left" )+' '+Foxtrickl10n.getString( "foxtrick.matches.attack" );
		var cdefText = Foxtrickl10n.getString( "foxtrick.matches.center" )+' '+Foxtrickl10n.getString( "foxtrick.matches.defense" );
		var cattText = Foxtrickl10n.getString( "foxtrick.matches.center" )+' '+Foxtrickl10n.getString( "foxtrick.matches.attack" );
		var rattText = Foxtrickl10n.getString( "foxtrick.matches.right" )+' '+Foxtrickl10n.getString( "foxtrick.matches.attack" );
		var ldefText = Foxtrickl10n.getString( "foxtrick.matches.left" )+' '+Foxtrickl10n.getString( "foxtrick.matches.defense" );
		var ifkdefText = Foxtrickl10n.getString( "foxtrick.matches.indfreekick" )+' '+Foxtrickl10n.getString( "foxtrick.matches.defense" );
		var ifkattText = Foxtrickl10n.getString( "foxtrick.matches.indfreekick" )+' '+Foxtrickl10n.getString( "foxtrick.matches.attack" );
		
		var labelArray=new Array(	rdefText+' - '+lattText,
									cdefText+' - '+cattText,
									ldefText+' - '+rattText,
									rattText+' - '+ldefText,
									cattText+' - '+cdefText,
									lattText+' - '+rdefText,
									ifkdefText+' - '+Foxtrickl10n.getString( "foxtrick.matches.attack" ),
									ifkattText+' - '+Foxtrickl10n.getString( "foxtrick.matches.defense" ));
		
		for (i=0;i<percentArray.length;i++) {
			bodydiv.appendChild(doc.createTextNode("\n"+labelArray[i]+"\n"));
			bodydiv.appendChild(this._createTextBox(doc, percentArray[i]));
			bodydiv.appendChild(doc.createTextNode("\n"));
			var bardiv=doc.createElement('div');
			bardiv.className="possesionbar";
			bardiv.innerHTML='<img alt="" src="/Img/Matches/filler.gif" width="'+percentArray[i]+'" height="10"><img src="/Img/Matches/possesiontracker.gif" alt="">';
			bodydiv.appendChild(bardiv);
			bodydiv.appendChild(doc.createTextNode("\n"));
			bodydiv.appendChild(this._createTextBox(doc, 100-percentArray[i]));
			bodydiv.appendChild(doc.createTextNode("\n"));

			bodydiv.appendChild(strangediv.cloneNode(true));
		}
	},

	_createTextBox: function(doc, percentage) {
			var textdiv=doc.createElement('div');
			textdiv.className='float_left shy smallText';

			if (percentage>50)
				textdiv.innerHTML='<strong>'+percentage+'%</strong>';
			else
				textdiv.innerHTML=' '+percentage+'%';

			return textdiv;
	},

	_displayableRatingLevel: function(val) {
		val = new String(val);
		if (val.search(/\./i) == -1) return val + "--";
		val = val.replace(/\.75/i, "++");
		val = val.replace(/\.5/i, "+");
		val = val.replace(/\.25/i, "-");

		return val;
	},

		_createGraphRow: function (doc, div, val1, val2, text1, text2, tooltip1, tooltip2) {

				var color1 = "#FFFFFF";
				var color2 = "#000000";
				var fgcolor1 = "#000000";
				var fgcolor2 = "#FFFFFF";

				var pt1 = Math.round(100 * val1 / (val1 + val2));
				var pt2 = 100 - pt1;

			 var cellwidth = 50;

			 row = doc.createElement("div");
			 row.className = "foxtrick-graphs-row";
			 div.appendChild(row);

			 var cell = doc.createElement("div");
			 cell.className = "foxtrick-graphs-cell";
			 cell.innerHTML =  pt1 + "%";
			 row.appendChild(cell);

			 cell = doc.createElement("div");
			 row.appendChild(cell);
			 cell.className = "foxtrick-graphs-left-bar";

			 var innercellA = doc.createElement("div");
			 innercellA.className = "foxtrick-graphs-bar-container";
			 innercellA.style.backgroundColor = color1;
			 cell.appendChild(innercellA);

			 var innercellB = doc.createElement("div");
			 innercellB.className = "foxtrick-graphs-bar-inner";
			 innercellB.style.backgroundColor = color2;
			 innercellA.appendChild(innercellB);

			 var span = doc.createElement("span");
			 span.innerHTML = "&nbsp;";
			 innercellA.appendChild(span);

			 var innercellC = doc.createElement("div");
			 innercellC.className = "foxtrick-graphs-bar-values";
			 innercellA.appendChild(innercellC);
			 innercellC.innerHTML = text1 + " " + AttVsDef._displayableRatingLevel(val1+1);
			 innercellC.style.color = fgcolor1;

			 var val = Math.round((pt1/50)*cellwidth);

			 innercellB.style.left = val + "px";
			 innercellB.style.width = ((50-val > 0) ? 50-val  : 0) + "px";

			 cell.title = tooltip1.textContent;

			 cell = doc.createElement("div");
			 row.appendChild(cell);
			 cell.className = "foxtrick-graphs-right-bar";
			 cell.style.backgroundColor = color2;
			 val = Math.round((pt2/50)*cellwidth);
			 val = (cellwidth-val);

			 innercellA = doc.createElement("div");
			 innercellA.className = "foxtrick-graphs-bar-container";
			 innercellA.style.backgroundColor = color2;
			 cell.appendChild(innercellA);

			 innercellB = doc.createElement("div");
			 innercellB.className = "foxtrick-graphs-bar-inner";
			 innercellB.style.backgroundColor = color1;
			 innercellB.style.width = (val > 0 ? val : 0) + "px";
			 innercellA.appendChild(innercellB);

			 span = doc.createElement("span");
			 span.innerHTML = "&nbsp;";
			 innercellA.appendChild(span);

			 innercellC = doc.createElement("div");
			 innercellC.className = "foxtrick-graphs-bar-values";
			 innercellA.appendChild(innercellC);
			 innercellC.innerHTML = AttVsDef._displayableRatingLevel(val2+1) + " " + text2;
			 innercellC.style.textAlign = "right";
			 innercellC.style.color = fgcolor2;

			 cell.title = tooltip2.textContent;

			 cell = doc.createElement("div");
			 cell.className = "foxtrick-graphs-cell";
			 cell.innerHTML = pt2 + "%";
			 row.appendChild(cell);
		},

	_getPercentArray: function(doc, table) {
		var values=new Array();

		var stamp='';

		//checking if language is correctly set
		if (Matches._getStatFromCell(table.rows[2].cells[1])>0)
		{
			for (j=2;j<8;j++)
			{
				var val1=Matches._getStatFromCell(table.rows[j].cells[1]);
				var val2=Matches._getStatFromCell(table.rows[9-j].cells[2]);
				var percentage=(val1/(val1+val2))*100;
				//values.push(percentage.toFixed(2)); //TOO large
				values.push(Math.round(percentage));
				stamp+=val1+' '+val2+' ';
			}
			if (table.rows.length > 12) {
				val1=Matches._getStatFromCell(table.rows[10].cells[1]);
				val2=Matches._getStatFromCell(table.rows[11].cells[2]);
				percentage=(val1/(val1+val2))*100;
				//values.push(percentage.toFixed(2));
				values.push(Math.round(percentage));
				val1=Matches._getStatFromCell(table.rows[11].cells[1]);
				val2=Matches._getStatFromCell(table.rows[10].cells[2]);
				percentage=(val1/(val1+val2))*100;
				//values.push(percentage.toFixed(2));
				values.push(Math.round(percentage));
			}
		}

		//alert(stamp);

		return values;
	}
};