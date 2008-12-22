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
    htLanguagesXml : null,
    htCurrenciesXml : null,

    init : function() {
        Foxtrick.registerPageHandler( 'match',
                                      AttVsDef );
        this.initHtLang();
    },

    run : function( page, doc ) {
            try {
            var sidebar = doc.getElementById('sidebar');
            if (sidebar.childNodes.length>7)
            {
                //match is ended

                //finding the right table
                var ratingstable;
                var tables;
                if (doc.getElementById('mainBody').childNodes.length>3)
                    tables=doc.getElementById('mainBody').childNodes[3].getElementsByTagName('div');
                else
                    tables=doc.getElementById('mainBody').childNodes[1].getElementsByTagName('div');
                for (i=0;i<tables.length;i++)
                {
                    if (tables[i].className=='mainBox')
                        ratingstable=tables[i].getElementsByTagName('table').item(0);
                }

                var percentArray=this._getPercentArray(doc, ratingstable);

                                var midfieldLevel=new Array(this._getStatFromCell(ratingstable.rows[1].cells[1]),
                                                                                        this._getStatFromCell(ratingstable.rows[1].cells[2]));
                                var rdefence=new Array(this._getStatFromCell(ratingstable.rows[2].cells[1]),
                                                                                        this._getStatFromCell(ratingstable.rows[2].cells[2]));
                                var cdefence=new Array(this._getStatFromCell(ratingstable.rows[3].cells[1]),
                                                                                        this._getStatFromCell(ratingstable.rows[3].cells[2]));
                                var ldefence=new Array(this._getStatFromCell(ratingstable.rows[4].cells[1]),
                                                                                        this._getStatFromCell(ratingstable.rows[4].cells[2]));
                                var rattack=new Array(this._getStatFromCell(ratingstable.rows[5].cells[1]),
                                                                                        this._getStatFromCell(ratingstable.rows[5].cells[2]));
                                var cattack=new Array(this._getStatFromCell(ratingstable.rows[6].cells[1]),
                                                                                        this._getStatFromCell(ratingstable.rows[6].cells[2]));
                                var lattack=new Array(this._getStatFromCell(ratingstable.rows[7].cells[1]),
                                                                                        this._getStatFromCell(ratingstable.rows[7].cells[2]));
								if (ratingstable.rows.length > 12) {
	                                var ifkdefence=new Array(this._getStatFromCell(ratingstable.rows[10].cells[1]),
	                                                                                        this._getStatFromCell(ratingstable.rows[10].cells[2]));
	                                var ifkattack=new Array(this._getStatFromCell(ratingstable.rows[11].cells[1]),
	                                                                                        this._getStatFromCell(ratingstable.rows[11].cells[2]));
	                                var tactics=new Array(this._getTacticsFromCell(ratingstable.rows[14].cells[1]),
	                                                                                        this._getTacticsFromCell(ratingstable.rows[14].cells[2]));
	                                var tacticsLevel=new Array(this._getTacticsLevelFromCell(ratingstable.rows[15].cells[1]),
	                                                                                        this._getTacticsLevelFromCell(ratingstable.rows[15].cells[2]));

	                                var ratingsArray = new Array(rdefence, cdefence, ldefence, rattack, cattack, lattack, ifkdefence, ifkattack);
								}
								else  {
									var tactics=new Array(this._getTacticsFromCell(ratingstable.rows[9].cells[1]),
	                                                                                        this._getTacticsFromCell(ratingstable.rows[9].cells[2]));
	                                var tacticsLevel=new Array(this._getTacticsLevelFromCell(ratingstable.rows[10].cells[1]),
	                                                                                        this._getTacticsLevelFromCell(ratingstable.rows[10].cells[2]));
									var ratingsArray = new Array(rdefence, cdefence, ldefence, rattack, cattack, lattack);
								}
								
                                var rdefenceText=new Array(ratingstable.rows[2].cells[1], ratingstable.rows[2].cells[2]);
                                var cdefenceText=new Array(ratingstable.rows[3].cells[1], ratingstable.rows[3].cells[2]);
                                var ldefenceText=new Array(ratingstable.rows[4].cells[1], ratingstable.rows[4].cells[2]);
                                var rattackText=new Array(ratingstable.rows[5].cells[1], ratingstable.rows[5].cells[2]);
                                var cattackText=new Array(ratingstable.rows[6].cells[1], ratingstable.rows[6].cells[2]);
                                var lattackText=new Array(ratingstable.rows[7].cells[1], ratingstable.rows[7].cells[2]);
								if (ratingstable.rows.length > 12) {
	                                var ifkdefenceText=new Array(ratingstable.rows[10].cells[1], ratingstable.rows[10].cells[2]);
	                                var ifkattackText=new Array(ratingstable.rows[11].cells[1], ratingstable.rows[11].cells[2]);
									var ratingsTextArray = new Array(rdefenceText, cdefenceText, ldefenceText, rattackText, cattackText, lattackText, ifkdefenceText, ifkattackText);
								}
								else {
									var ratingsTextArray = new Array(rdefenceText, cdefenceText, ldefenceText, rattackText, cattackText, lattackText);
								}

                var strangediv=sidebar.childNodes[7].childNodes[1].childNodes[7];
                if (strangediv)
                    sidebar.insertBefore(this._createBarDiv_extended(doc, percentArray, strangediv, ratingsArray, ratingsTextArray), sidebar.childNodes[8]);
                else
                {
                    strangediv=sidebar.childNodes[7].childNodes[8];
                    sidebar.insertBefore(this._createBarDiv_extended(doc, percentArray, strangediv, ratingsArray, ratingsTextArray), sidebar.childNodes[8]);
                }

                if (percentArray.length>0)
                {
                    //this.LOG(  tactics[0]+' '+tactics[1]+' '+tacticsLevel[0]+' '+tacticsLevel[1]);
                    var defenceLevel = new Array();
                    defenceLevel[0]=ldefence[0] + cdefence[0] + rdefence[0];
                    defenceLevel[1]=ldefence[1] + cdefence[1] + rdefence[1];
                    var attackLevel = new Array();
                    attackLevel[0]= rattack[0] + cattack[0] + lattack[0];
                    attackLevel[1]= rattack[1] + cattack[1] + lattack[1];
                    for (var selectedRating in this.ratingDefs) {
                        if (!FoxtrickPrefs.getBool("matchstat."+selectedRating)) continue;
                        //if (selectedRating!='hatstats') continue;

                        var row = ratingstable.insertRow(8);

                        var cell = row.insertCell(0);
                        cell.className='ch';
                        cell.innerHTML = this.ratingDefs[selectedRating].label;

                        for (i=0;i<2;i++)
                        {
                            var cell = row.insertCell(i+1);
                            try {
                                if (typeof (this.ratingDefs[selectedRating]["total2"]) != 'undefined') {
                                    if (tactics[i] != null) {
                                    cell.innerHTML = "<b>" +
                                                     this.ratingDefs[selectedRating]["total2"](midfieldLevel[i], lattack[i], cattack[i], rattack[i],
                                                                                                         ldefence[i], cdefence[i], rdefence[i],
                                                                                                         tactics[i], tacticsLevel[i]
                                                                                                         )
                                                   + "</b>";
                                                }
                                } else {
                                    cell.innerHTML = "<b>" +
                                                     this.ratingDefs[selectedRating]["total"](midfieldLevel[i], attackLevel[i], defenceLevel[i])
                                                   + "</b>";
                                }
                             }
                            catch (e) {
                                this.LOG('attvsdef.js error in rating print ('+selectedRating+'): '+e);
                            }
                            //this.LOG(selectedRating+' : '+this.dumpObj(this.ratingDefs[selectedRating], 'rat', ' ', 3));

                        this.insertRatingsDet(cell, this.ratingDefs[selectedRating], "defence",
                              Foxtrickl10n.getString( "foxtrick.matchdetail.defence" ), defenceLevel[i]);
                        this.insertRatingsDet(cell, this.ratingDefs[selectedRating], "special",
                              Foxtrickl10n.getString( "foxtrick.matchdetail.defence" ),  rdefence[i], cdefence[i], ldefence[i]);

                        this.insertRatingsDet(cell, this.ratingDefs[selectedRating], "midfield",
                              Foxtrickl10n.getString( "foxtrick.matchdetail.midfield" ), midfieldLevel[i]);
                        this.insertRatingsDet(cell, this.ratingDefs[selectedRating], "mystyle",
                              Foxtrickl10n.getString( "foxtrick.matchdetail.midfield" ), midfieldLevel[i]);

                        this.insertRatingsDet(cell, this.ratingDefs[selectedRating], "attack",
                              Foxtrickl10n.getString( "foxtrick.matchdetail.attack" ),  attackLevel[i]);
                        this.insertRatingsDet(cell, this.ratingDefs[selectedRating], "special",
                              Foxtrickl10n.getString( "foxtrick.matchdetail.attack" ),  rattack[i], cattack[i], lattack[i]);
                        }
                    }
                }
            }
        } catch (e) {
            this.LOG('attvsdef.js run: '+e);
        }

    },

    insertRatingsDet: function (cell, rating, ratingType, label, midfieldLevel, attackLevel, defenceLevel) {

  if (typeof(rating[ratingType]) == 'undefined') return;

  //var row = table.insertRow(table.rows.length);

  //row.insertCell(0).innerHTML = label;
  //row.insertCell(1).innerHTML= "<b>" + rating[ratingType](midfieldLevel, attackLevel, defenceLevel) + " </b>";
  cell.innerHTML+="<br>"+label+':'+"<b>" + rating[ratingType](midfieldLevel, attackLevel, defenceLevel) + " </b>";

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

        if (percentArray.length > 0)
        {
                        var rdefText = Foxtrickl10n.getString( "foxtrick.matches.right" )+' '+Foxtrickl10n.getString( "foxtrick.matches.defense" );
                        var lattText = Foxtrickl10n.getString( "foxtrick.matches.left" )+' '+Foxtrickl10n.getString( "foxtrick.matches.attack" );
                        var cdefText = Foxtrickl10n.getString( "foxtrick.matches.center" )+' '+Foxtrickl10n.getString( "foxtrick.matches.defense" );
                        var cattText = Foxtrickl10n.getString( "foxtrick.matches.center" )+' '+Foxtrickl10n.getString( "foxtrick.matches.attack" );
                        var rattText = Foxtrickl10n.getString( "foxtrick.matches.right" )+' '+Foxtrickl10n.getString( "foxtrick.matches.attack" );
                        var ldefText = Foxtrickl10n.getString( "foxtrick.matches.left" )+' '+Foxtrickl10n.getString( "foxtrick.matches.defense" );
                        var ifkdefText = Foxtrickl10n.getString( "foxtrick.matches.indfreekick" )+' '+Foxtrickl10n.getString( "foxtrick.matches.defense" );
                        var ifkattText = Foxtrickl10n.getString( "foxtrick.matches.indfreekick" )+' '+Foxtrickl10n.getString( "foxtrick.matches.attack" );

                        if (FoxtrickPrefs.getInt("module." + AttVsDef.MODULE_NAME + ".value") == 1) {
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
                        }
            else {
                                var labelArray=new Array(rdefText+' - '+lattText,
                           cdefText+' - '+cattText,
                           ldefText+' - '+rattText,
                           rattText+' - '+ldefText,
                           cattText+' - '+cdefText,
                           lattText+' - '+rdefText,
                           ifkdefText+' - '+Foxtrickl10n.getString( "foxtrick.matches.attack" ),
                           ifkattText+' - '+Foxtrickl10n.getString( "foxtrick.matches.defense" ));
                                for (i=0;i<percentArray.length;i++)
                    {
                        bodydiv.appendChild(doc.createTextNode("\n"+labelArray[i]+"\n"));
                        bodydiv.appendChild(AttVsDef._createTextBox(doc, percentArray[i]));
                        bodydiv.appendChild(doc.createTextNode("\n"));
                        var bardiv=doc.createElement('div');
                        bardiv.className="possesionbar";
                        bardiv.innerHTML='<img alt="" src="/Img/Matches/filler.gif" width="'+percentArray[i]+'" height="10"><img src="/Img/Matches/possesiontracker.gif" alt="">';
                        bodydiv.appendChild(bardiv);
                        bodydiv.appendChild(doc.createTextNode("\n"));
                        bodydiv.appendChild(AttVsDef._createTextBox(doc, 100-percentArray[i]));
                        bodydiv.appendChild(doc.createTextNode("\n"));

                        bodydiv.appendChild(strangediv.cloneNode(true));
                    }
                        }
        }
        else
        {
            bodydiv.innerHTML=Foxtrickl10n.getString( "foxtrick.matches.wronglang" );
        }

            maindiv.appendChild(bodydiv);

        var footerdiv = doc.createElement('div');
        footerdiv.className="boxFooter";
        footerdiv.innerHTML='<div class="boxLeft">&nbsp;</div>';
        maindiv.appendChild(footerdiv);

        return maindiv;
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
        if (this._getStatFromCell(table.rows[2].cells[1])>0)
        {
            for (j=2;j<8;j++)
            {
                var val1=this._getStatFromCell(table.rows[j].cells[1]);
                var val2=this._getStatFromCell(table.rows[9-j].cells[2]);
                var percentage=(val1/(val1+val2))*100;
                //values.push(percentage.toFixed(2)); //TOO large
                values.push(Math.round(percentage));
                stamp+=val1+' '+val2+' ';
            }
			if (table.rows.length > 12) {
	            val1=this._getStatFromCell(table.rows[10].cells[1]);
	            val2=this._getStatFromCell(table.rows[11].cells[2]);
	            percentage=(val1/(val1+val2))*100;
	            //values.push(percentage.toFixed(2));
	            values.push(Math.round(percentage));
	            val1=this._getStatFromCell(table.rows[11].cells[1]);
	            val2=this._getStatFromCell(table.rows[10].cells[2]);
	            percentage=(val1/(val1+val2))*100;
	            //values.push(percentage.toFixed(2));
	            values.push(Math.round(percentage));
			}
        }

        //alert(stamp);

        return values;
    },

    _getStatFromCell: function(cell)
    {
		var link = cell.firstChild;
        var baseValue = parseInt(link.href.replace(/.+lt=skill/i, "").replace(/.+ll=/i, "").match(/^\d+/)) - 1;
        var subLevelValue=0;
        try {
          var lang = FoxtrickPrefs.getString("htLanguage");
        } catch (e) {
          lang = "en";
        }

        //var subLevel = Foxtrick.trim(link.parentNode.textContent.replace(link.textContent, ""));
        try {
            var subLevel = Foxtrick.trim(link.parentNode.textContent.substring(link.textContent.length));
            var path = "hattricklanguages/language[@name='" + lang + "']/ratingSubLevels/sublevel[@text='" + subLevel + "']";
            //this.LOG('matches.js path: '+path);
            var obj = this.htLanguagesXml.evaluate(path,this.htLanguagesXml,null,this.htLanguagesXml.DOCUMENT_NODE,null).singleNodeValue;
            if (obj)
                subLevelValue = parseFloat(obj.attributes.getNamedItem("value").textContent);
            else
                return -1;
        } catch (e) {
            this.LOG('matches.js _getStatFromCell: '+e);
        }

        return baseValue+subLevelValue;
    },

    _getTacticsLevelFromCell: function(cell) {
        var basevalue=0;
        if (cell.firstChild.nodeName=='A')
            basevalue=parseInt(cell.firstChild.href.replace(/.+lt=skill/i, "").replace(/.+ll=/i, "").match(/^\d+/));
        return basevalue;
    },

    _getTacticsFromCell: function(cell) {
        var tactics=Foxtrick.trim(cell.innerHTML);
        try {
            var lang = FoxtrickPrefs.getString("htLanguage");
        } catch (e) {
            lang = "en";
        }

        try {

            var path = "hattricklanguages/language[@name='" + lang + "']/tactics/tactic[@value=\"" + tactics + "\"]";
            var obj = this.htLanguagesXml.evaluate(path,this.htLanguagesXml,null,this.htLanguagesXml.DOCUMENT_NODE,null).singleNodeValue;

            return obj.attributes.getNamedItem("type").textContent;

        } catch (e) {
            return null;
        }

    },

    initHtLang: function ()
    {
            try {
            this.htLanguagesXml = this._loadXmlIntoDOM("chrome://foxtrick/content/htlocales/htlang.xml");
        } catch (e) {
                this.LOG('matches.js initHtLang: '+e);
        }

        try {
            this.htCurrenciesXml = this._loadXmlIntoDOM("chrome://foxtrick/content/htlocales/htcurrency.xml");
        } catch (e) {
                this.LOG('matches.js initHtLang: '+e);
        }
    },

    _loadXmlIntoDOM: function(url) {
            var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
            req.open("GET", url, false);
            req.send(null);
            var doc = req.responseXML;
            if (doc.documentElement.nodeName == "parsererror") {
                this.LOG("error parsing " + url);
                return null;
            }
            return doc;
    },

    LOG: function (msg) {
        var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                                 .getService(Components.interfaces.nsIConsoleService);
        consoleService.logStringMessage(msg);
    },
    dumpObj: function (obj, name, indent, depth) {

              if (depth > 10) {
                     return indent + name + ": <Maximum Depth Reached>\n";
              }
              if (typeof obj == "object") {
                     var child = null;
                     var output = indent + name + "\n";
                     indent += "\t";
                     for (var item in obj)
                     {
                           try {
                                  child = obj[item];
                           } catch (e) {
                                  child = "<Unable to Evaluate>";
                           }
                           if (typeof child == "object") {
                                  output += dumpObj(child, item, indent, depth + 1);
                           } else {
                                  output += indent + item + ": " + child + "\n";
                           }
                     }
                     return output;
              } else {
                     return obj;
              }
       }
};