/**
 * matches.js
 * adds info on matches page
 * @author taised
 */
////////////////////////////////////////////////////////////////////////////////
var Matches = {
    
    MODULE_NAME : "Matches",
    
    init : function() {
        Foxtrick.registerPageHandler( 'match',
                                      Matches );
    },

    run : function( page, doc ) {
        
        var sidebar = doc.getElementById('sidebar');
        if (sidebar.childNodes.length>7)
        {
            //match is ended
            
            var percentArray=Matches._getPercentArray(doc);
            
            var strangediv=sidebar.childNodes[7].childNodes[1].childNodes[7];
            
            sidebar.appendChild(Matches._createBarDiv(doc, percentArray, strangediv));
        }
        
    },
    
    _createBarDiv: function(doc, percentArray, strangediv) {
    	
    	var maindiv=doc.createElement('div');
    	maindiv.className='sidebarBox';
    	
    	var headdiv=doc.createElement('div');
    	headdiv.className='boxHead';
    	
    	var leftdiv=doc.createElement('div');
    	leftdiv.className='boxLeft';
    	
    	var leftdivcontent=doc.createElement('h2');
    	leftdivcontent.innerHTML="Attack vs Defense bars";//FoxtrickPrefs.getString( "attackdefensebars" );
    	
    	leftdiv.appendChild(leftdivcontent);
    	headdiv.appendChild(leftdiv);
    	maindiv.appendChild(headdiv);
    	
    	var bodydiv=doc.createElement('div');
        bodydiv.className='boxBody';
        
        var labelArray=new Array('Right def - Left att',
                       'Central def - Central att',
                       'Left def - Right att',
                       'Right att - Left def',
                       'Central att - Central def',
                       'Left att - Right def',
                       'Ind. free kicks: def-att',
                       'Ind. free kicks: att-def');
        
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
            
            /*var enddiv=doc.createElement('div');
            enddiv.className="clear: both;";
            enddiv.innerHTML="\n";
            bodydiv.appendChild(enddiv);*/
            bodydiv.appendChild(strangediv.cloneNode(true));
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
    
    _getPercentArray: function(doc) {
        var tables=doc.getElementById('mainBody').childNodes[3].getElementsByTagName('div');
        
        var values=new Array();
        
        var stamp='';
        
        for (i=0;i<tables.length;i++)
        {
            if (tables[i].className=='mainBox')
            {
                var table=tables[i].getElementsByTagName('table').item(0);
                
                for (j=2;j<8;j++)
                {
                    var val1=Matches._getStatFromCell(table.rows[j].cells[1]);
                    var val2=Matches._getStatFromCell(table.rows[9-j].cells[2]);
                    var percentage=(val1/(val1+val2))*100;
                    //values.push(percentage.toFixed(2)); //TOO large
                    values.push(Math.round(percentage));
                    stamp+=val1+' '+val2+' ';
                }
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
    },
    
    _getStatFromCell: function(cell)
    {
        var link = cell.firstChild;
        var baseValue = parseInt(link.href.replace(/.+lt=skill/i, "").replace(/.+ll=/i, "").match(/^\d+/)) - 1;
        var subLevelValue=0;
        /*try {
          var lang = PrefsBranch.getCharPref("htLanguage");
        } catch (e) {
          lang = "en";
        }
        
        var subLevel = trim(link.parentNode.textContent.replace(link.textContent, ""));
        var path = "hattricklanguages/language[@name='" + lang + "']/ratingSubLevels/sublevel[@text='" + subLevel + "']";
        var obj = htLanguagesXml.evaluate(path,htLanguagesXml,null,htLanguagesXml.DOCUMENT_NODE,null).singleNodeValue;
        subLevelValue = parseFloat(obj.attributes.getNamedItem("value").textContent);
        
        */
        
        return baseValue+subLevelValue;
    }
};