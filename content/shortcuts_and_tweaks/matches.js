/**
 * matches.js
 * adds info on matches page
 * @author taised
 */
////////////////////////////////////////////////////////////////////////////////
var Matches = {
    
    MODULE_NAME : "Matches",
    MODULE_CATEGORY : "shortcutsandtweaks",
    htLanguagesXml : null,
    htCurrenciesXml : null,
    ratingDefs : {},
    
    init : function() {
        Foxtrick.registerPageHandler( 'match',
                                      Matches );
        this.initHtLang();
        this.initHtRatings();
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
                
                var strangediv=sidebar.childNodes[7].childNodes[1].childNodes[7];
                if (strangediv)
                    sidebar.appendChild(this._createBarDiv_extended(doc, percentArray, strangediv));
                else
                {
                    strangediv=sidebar.childNodes[7].childNodes[8];
                    sidebar.appendChild(this._createBarDiv_extended(doc, percentArray, strangediv));
                }
                
                for (var selectedRating in this.ratingDefs) {
                    //If prefs: TODO
                    if (selectedRating!='hatstats') continue;
                    
                    var row = ratingstable.insertRow(8);
                    
                    var cell = row.insertCell(0);
                    cell.className='ch';
                    cell.innerHTML = this.ratingDefs[selectedRating].label;
                    
                    for (i=1;i<3;i++)
                    {
                        var midfieldLevel=this._getStatFromCell(ratingstable.rows[1].cells[i]);
                        var lattack=this._getStatFromCell(ratingstable.rows[2].cells[i]);
                        var cattack=this._getStatFromCell(ratingstable.rows[3].cells[i]);
                        var rattack=this._getStatFromCell(ratingstable.rows[4].cells[i]);
                        var ldefence=this._getStatFromCell(ratingstable.rows[5].cells[i]);
                        var cdefence=this._getStatFromCell(ratingstable.rows[6].cells[i]);
                        var rdefence=this._getStatFromCell(ratingstable.rows[7].cells[i]);
                        var tactics=null; //TO DO
                        var tacticsLevel=null; //TO DO
                        
                        var defenceLevel = ldefence + cdefence + rdefence;
                        var attackLevel = rattack + cattack + lattack;
                        
                        var cell = row.insertCell(i);
                        try {
                            if (typeof (this.ratingDefs[selectedRating]["total2"]) != 'undefined') {
                                if (tactics != null) {
                                cell.innerHTML = "<b>" + 
                                                 this.ratingDefs[selectedRating]["total2"](midfieldLevel, lattack, cattack, rattack,
                                                                                                     ldefence, cdefence, rdefence,
                                                                                                     tactics, tacticsLevel
                                                                                                     )
                                               + "</b>";
                                            }
                            } else {
                                cell.innerHTML = "<b>" + 
                                                 this.ratingDefs[selectedRating]["total"](midfieldLevel, attackLevel, defenceLevel)
                                               + "</b>";
                            }
                         }
                        catch (e) {
                            this.LOG('matches.js rating print: '+e);
                        }
                    }
                    /*insertRatingsRow(ratingstable, this.ratingDefs[selectedRating], "defence",
                          messageBundle.GetStringFromName("foxtrick.matchdetail.defence"), defenceLevel);
                    insertRatingsRow(ratingstable, this.ratingDefs[selectedRating], "special",
                          messageBundle.GetStringFromName("foxtrick.matchdetail.defence"),  rdefence, cdefence, ldefence);
                    
                    insertRatingsRow(ratingstable, this.ratingDefs[selectedRating], "midfield",
                          messageBundle.GetStringFromName("foxtrick.matchdetail.midfield"), midfieldLevel);
                    insertRatingsRow(ratingstable, this.ratingDefs[selectedRating], "mystyle",
                          messageBundle.GetStringFromName("foxtrick.matchdetail.midfield"), midfieldLevel);
                          
                    insertRatingsRow(ratingstable, this.ratingDefs[selectedRating], "attack",
                          messageBundle.GetStringFromName("foxtrick.matchdetail.attack"),  attackLevel);
                    insertRatingsRow(ratingstable, this.ratingDefs[selectedRating], "special",
                          messageBundle.GetStringFromName("foxtrick.matchdetail.attack"),  rattack, cattack, lattack);
                    
                    row = ratingstable.insertRow(ratingstable.rows.length);*/
                }
            }
        } catch (e) {
            this.LOG('matches.js run: '+e);
        }
        
    },
    
    _createBarDiv_extended: function(doc, percentArray, strangediv) {
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
        
        if (percentArray.length>0)
        { 
            var labelArray=new Array(Foxtrickl10n.getString( "foxtrick.matches.right" )+' '+Foxtrickl10n.getString( "foxtrick.matches.defense" )+' - '+Foxtrickl10n.getString( "foxtrick.matches.left" )+' '+Foxtrickl10n.getString( "foxtrick.matches.attack" ),
                           Foxtrickl10n.getString( "foxtrick.matches.center" )+' '+Foxtrickl10n.getString( "foxtrick.matches.defense" )+' - '+Foxtrickl10n.getString( "foxtrick.matches.center" )+' '+Foxtrickl10n.getString( "foxtrick.matches.attack" ),
                           Foxtrickl10n.getString( "foxtrick.matches.left" )+' '+Foxtrickl10n.getString( "foxtrick.matches.defense" )+' - '+Foxtrickl10n.getString( "foxtrick.matches.right" )+' '+Foxtrickl10n.getString( "foxtrick.matches.attack" ),
                           Foxtrickl10n.getString( "foxtrick.matches.right" )+' '+Foxtrickl10n.getString( "foxtrick.matches.attack" )+' - '+Foxtrickl10n.getString( "foxtrick.matches.left" )+' '+Foxtrickl10n.getString( "foxtrick.matches.defense" ),
                           Foxtrickl10n.getString( "foxtrick.matches.center" )+' '+Foxtrickl10n.getString( "foxtrick.matches.attack" )+' - '+Foxtrickl10n.getString( "foxtrick.matches.center" )+' '+Foxtrickl10n.getString( "foxtrick.matches.defense" ),
                           Foxtrickl10n.getString( "foxtrick.matches.left" )+' '+Foxtrickl10n.getString( "foxtrick.matches.attack" )+' - '+Foxtrickl10n.getString( "foxtrick.matches.right" )+' '+Foxtrickl10n.getString( "foxtrick.matches.defense" ),
                           Foxtrickl10n.getString( "foxtrick.matches.indfreekick" )+' '+Foxtrickl10n.getString( "foxtrick.matches.defense" )+' - '+Foxtrickl10n.getString( "foxtrick.matches.attack" ),
                           Foxtrickl10n.getString( "foxtrick.matches.indfreekick" )+' '+Foxtrickl10n.getString( "foxtrick.matches.attack" )+' - '+Foxtrickl10n.getString( "foxtrick.matches.defense" ));
            
            for (i=0;i<percentArray.length;i++)
            {
                bodydiv.appendChild(doc.createTextNode("\n"+labelArray[i]+"\n"));
                bodydiv.appendChild(Matches._createTextBox(doc, percentArray[i]));
                bodydiv.appendChild(doc.createTextNode("\n"));
                var bardiv=doc.createElement('div');
                bardiv.className="possesionbar";
                bardiv.innerHTML='<img alt="" src="/Img/Matches/filler.gif" width="'+percentArray[i]+'" height="10"><img src="/Img/Matches/possesiontracker.gif" alt="">';
                bodydiv.appendChild(bardiv);
                bodydiv.appendChild(doc.createTextNode("\n"));
                bodydiv.appendChild(Matches._createTextBox(doc, 100-percentArray[i]));
                bodydiv.appendChild(doc.createTextNode("\n"));
                
                bodydiv.appendChild(strangediv.cloneNode(true));
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
            var subLevel = Foxtrick.trim(link.parentNode.lastChild.nodeValue);
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
    
    initHtRatings: function () {
        this.ratingDefs["vnukstats"] = { base : 1.0,
                            label : "Vnukstats",
                            title : "Vnukstats",
                            
                         special : function(rattack, cattack, lattack) {
                                                    return this.mystyle(rattack) + " " + this.mystyle(cattack)
                                                     + " " + this.mystyle(lattack);
                                                   },
                                                   
                         total: function(midfieldLevel, attackLevel, defenceLevel) {
                                                    return Math.round(100*(11.0 + 5*midfieldLevel + attackLevel + defenceLevel)/11)/100;
                                    },
                                                    
                         mystyle: function(level) {
                            var lev = this.base+level;
                            var temp = lev + " ";
                            if (temp.search(/\./) > -1) {
                                if (temp.search(/\.25/) > -1) return temp.replace(/\.25/,"-");
                                if (temp.search(/\.5/) > -1)  return temp.replace(/\.5/, "+");
                                if (temp.search(/\.75/) > -1) return temp.replace(/\.75/, "*");
                                
                            } else {
                                return lev+"!";
                            } 
                            
                         }
                       };

    this.ratingDefs["hatstats"] = {   base : 1.0, weight : 4.0, 
                         label : "HatStats",
                         title : "HatStats",
                            
                         attack : function(attackLevel) {
                                                     return (3.0*this.base + this.weight*attackLevel);
                                                   },
                         defence : function(defenceLevel) {
                                                    return (3.0*this.base + this.weight*defenceLevel);
                                                },
                         midfield : function(midfieldLevel) {
                                                    return 3.0*(this.base + this.weight*midfieldLevel);
                                                        },
                         total: function(midfieldLevel, attackLevel, defenceLevel) {
                                                    return this.attack(attackLevel)+
                                                           this.defence(defenceLevel)+
                                                           this.midfield(midfieldLevel);
                                                    }
                       };

    this.ratingDefs["hatstatstotal"] = { label : "HatStats",
                                 title : "HatStats Total only",
                         total: function(midfieldLevel, attackLevel, defenceLevel) {
                                     return this.ratingDefs["hatstats"].total(midfieldLevel, attackLevel, defenceLevel);
                                }
                       };
                       
    this.ratingDefs["ahpoints"] = {   base : 1.0, weight : 4.0, 
                         label : "AH-poeng",
                         title : "AH-poeng",
                            
                         attack : function(attackLevel) {
                                      return (3.0*this.base + this.weight*attackLevel);
                                  },
                         defence : function(defenceLevel) {
                                      return (3.0*this.base + this.weight*defenceLevel);
                                  },
                         midfield : function(midfieldLevel) {
                                      return 3.0*(this.base + this.weight*midfieldLevel);
                                  },
                         total: function(midfieldLevel, attackLevel, defenceLevel) {
                                    return this.attack(attackLevel)+
                                           this.defence( defenceLevel)+
                                           this.midfield(midfieldLevel);
                                }
                       };

    this.ratingDefs["loddarstats"] = {   base : 1.0, weight : 4.0, 
                         label : "LoddarStats",
                         title : "LoddarStats",

                         HQ : function(x) {
                            return 2.0*(x/(x+80));
                         },

                         total2: function( midfieldLevel, lattack, cattack, rattack,
                                                         ldefence, cdefence, rdefence,
                                                        tactics, tacticsLevel
                         ) {

                                midfieldLevel = this.base + this.weight*midfieldLevel;
                                lattack = this.base + this.weight*lattack;
                                cattack = this.base + this.weight*cattack;
                                rattack = this.base + this.weight*rattack;

                                ldefence = this.base + this.weight*ldefence;
                                cdefence = this.base + this.weight*cdefence;
                                rdefence = this.base + this.weight*rdefence;

                                var MFS = 0.0;

                                var VF = 0.47;
                                var AF = 1.0 - VF;

                                var ZG = 0.37;
                                var AG = (1.0 - ZG)/2.0;

                                var KG = 0.25;

                                var MFF = MFS + (1-MFS)*this.HQ(midfieldLevel);

                                var KK = 0;
                                if (tactics == 'ca') {
                                    KK = KG*2*tacticsLevel/(tacticsLevel+20);
                                }

                                var KZG = ZG;
                                if (tactics == 'aim') {
                                    KZG += 0.2*(tacticsLevel - 1.0)/19.0 + 0.2;
                                } else if (tactics == 'aow') {
                                    KZG -= 0.2*(tacticsLevel - 1.0)/19.0 + 0.2;
                                }

                                var KAG = (1.0 - KZG) / 2.0;

                                var attackValue = (AF+KK)*(KZG*this.HQ(cattack) + KAG*(this.HQ(lattack) + this.HQ(rattack)));
                                var defenceValue = VF*(ZG*this.HQ(cdefence) + AG*(this.HQ(ldefence) + this.HQ(rdefence)) );

                                var value = 80*MFF*(attackValue + defenceValue);
                                dump("LoddarStats: " + value);

                                var rounded = Math.round(value*100)/100;

                                //return rounded + " " + getTextRepresentionOfLevel(rounded);
                                return rounded;

                             }

                      };

    this.ratingDefs["peasostats"] = {   base : 1.0, weight : 4.0, 
                         label : "PStats",
                         title : "PStats",
                            
                         total2: function( midfieldLevel, lattack, cattack, rattack,
                                                         ldefence, cdefence, rdefence,
                                                        tactics, tacticsLevel
                         ) {
                            
                                midfieldLevel = this.base + this.weight*midfieldLevel;
                                lattack = this.base + this.weight*lattack;
                                cattack = this.base + this.weight*cattack;
                                rattack = this.base + this.weight*rattack;
                                
                                ldefence = this.base + this.weight*ldefence;
                                cdefence = this.base + this.weight*cdefence;
                                rdefence = this.base + this.weight*rdefence;
                                
                                var value = 0.46*midfieldLevel +
                                0.32*(0.3*(lattack+rattack) + 0.4*cattack) +
                                0.22*(0.3*(ldefence+rdefence) + 0.4*cdefence);
                                
                                var rounded = Math.round(value*100)/100;
                                return rounded;

                             }
                       };

    this.ratingDefs["htitavals"] = {   base : 1.0, weight : 4.0, 
                         label : "HTitaVal",
                         title : "HTitaVal",
                            
                         total2: function( midfieldLevel, lattack, cattack, rattack,
                                                         ldefence, cdefence, rdefence,
                                                        tactics, tacticsLevel
                         ) {
                            
                                midfieldLevel = this.base + this.weight*midfieldLevel;
                                lattack = this.base + this.weight*lattack;
                                cattack = this.base + this.weight*cattack;
                                rattack = this.base + this.weight*rattack;
                                
                                ldefence = this.base + this.weight*ldefence;
                                cdefence = this.base + this.weight*cdefence;
                                rdefence = this.base + this.weight*rdefence;
                                
                                var value = 3*midfieldLevel +
                                0.8*(lattack+rattack) + 1.4*cattack +
                                0.64*(ldefence+rdefence) + 1.12*cdefence;
                                
                                var rounded = Math.round(value*10)/10;
                                return rounded;

                             }
                       };

    this.ratingDefs["gardierstats"] = {
       base : 1.0, weight : 4.0, 
       label : "GardierStats",
       title : "GardierStats",
    
       total2: function(midfield, leftAtt, centralAtt, rightAtt, leftDef, centralDef, rightDef, tactics, tacticsLevel) {
                                
         leftAtt = (this.base + this.weight*leftAtt);
         centralAtt = (this.base + this.weight*centralAtt);
         rightAtt = (this.base + this.weight*rightAtt);
    
         leftDef = (this.base + this.weight*leftDef);
         centralDef = (this.base + this.weight*centralDef);
         rightDef = (this.base + this.weight*rightDef);
    
         midfield = (this.base + this.weight*midfield);
    
         var defense = 0.275*rightDef + 0.45*centralDef + 0.275*leftDef;
         var attack = 0.275*rightAtt + 0.45*centralAtt + 0.275*leftAtt;
         var tempReal = 4.15*midfield + 2.77*attack + 2.08*defense;
          
         if (tactics == 'ca') {
           tempTactica= (tacticsLevel * defense) / 10;
         } else if (tactics == 'aim') {
           tempTactica= (tacticsLevel * centralAtt) / 7;
         } else if (tactics == 'aow') {
           tempTactica= (tacticsLevel * (rightAtt + leftAtt) / 2) / 7;
         } else {
           tempTactica= tempReal / 9;
         }
          
         var value = tempReal + tempTactica;        
         var rounded = Math.round(value);
         return rounded;
    
       }
     };
   }
};