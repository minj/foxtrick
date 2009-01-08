/**
 * teamStats.js
 * Foxtrick team overview
 * @author OBarros
 */
////////////////////////////////////////////////////////////////////////////////
var FTTeamStats= {
    
    MODULE_NAME : "FTTeamStats",
        MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
        DEFAULT_ENABLED : true,

    init : function() {
            Foxtrick.registerPageHandler( 'players',
                                          FTTeamStats);
    },

    run : function( page, doc ) {

   		 var specs = {};
		// var elemsover = doc.getElementById("ctl00_CPSidebar_UpdatePanel1");
		// elemsover.style.display="none";
		var allDivs2 = doc.getElementsByTagName( "div" );
		for( var i = 0; i < allDivs2.length; i++ ) {
			
			if( allDivs2[i].className == "playerInfo" ) {
				var specc = allDivs2[i];
				if(specc) {
					
					    // specialities

              var specMatch = specc.textContent.match(/\[\D+\]/g);
              if (specMatch != null) {
                var spec = specMatch[0];
                if (typeof(specs[spec]) == 'undefined') {
                  specs[spec] = 1;
                } else {
                  specs[spec]++;
                }
          	  }

					
					
					
				}
			}
		}

		var boxrightt=doc.getElementById('ctl00_CPSidebar_UpdatePanel1');
	//	boxrightt.style.display='none';

		var txt;

        var specsTable = "";
        for (var spec in specs) {
          specsTable += "<tr><th>" + spec.replace(/\[|\]/g,"") + "</th><td>" + specs[spec] + "</td></tr>";
        }
        
        var injuries = getElementsByClass( "injuryBruised", doc );
        if (injuries.length > 0) {
          specsTable += "<tr><th>Pflaster </th><td>" + injuries.length + "</td></tr>";
        }

        var injuries = getElementsByClass( "injuryInjured", doc );

        if (injuries) {
            var weeks = 0;
            try {
                for (var j = 0; j < injuries.length; j++) {
                    var head = injuries[j].parentNode;
                    weeks += parseInt(substr(head.innerHTML, strrpos( head.innerHTML, "<span>")+6, 1));              
                }
            } 
            catch(e) {
                dump(e);
            }
        }
        
        if (weeks > 0) specsTable += "<tr><th>Verletzt </th><td>" + injuries.length +  " (" + weeks + " w)" + "</td></tr>";
        if (specsTable != "") txt = '<table class="foxtrick-playerlist foxtrick-playerlistspecs">' + specsTable + "</table>";

		

		var contentDiv = boxrightt.innerHTML;

		var NovaVar; 
		
		NovaVar = '<div class="sidebarBox">';
		NovaVar += '<div class="boxHead">';
		NovaVar += '<div class="boxLeft">';
		NovaVar += '<h2 class="">'+ Foxtrickl10n.getString("foxtrick.FTTeamStats.label") + '</h2>';
		NovaVar += '</div>';
		NovaVar += '</div>';
		NovaVar += '<div class="boxBody">';
		if (txt !="") NovaVar += "<br>" + txt;
		NovaVar += '</div>';
		NovaVar += '<div class="boxFooter"><div class="boxLeft">&nbsp;</div>';
		NovaVar += '</div>';
		NovaVar += '</div>';

		boxrightt.innerHTML = NovaVar + contentDiv;
        },
        
        change : function( page, doc ) {
        
        }
};

function strrpos( haystack, needle, offset){
    var i = (haystack+'').lastIndexOf( needle, offset ); // returns -1
    return i >= 0 ? i : false;
}
function substr( f_string, f_start, f_length ) {
    // http://kevin.vanzonneveld.net
    // +     original by: Martijn Wieringa
    // +     bugfixed by: T.Wild
    // +      tweaked by: Onno Marsman
    // *       example 1: substr('abcdef', 0, -1);
    // *       returns 1: 'abcde'
    // *       example 2: substr(2, 0, -6);
    // *       returns 2: ''
 
    f_string += '';
 
    if(f_start < 0) {
        f_start += f_string.length;
    }
 
    if(f_length == undefined) {
        f_length = f_string.length;
    } else if(f_length < 0){
        f_length += f_string.length;
    } else {
        f_length += f_start;
    }
 
    if(f_length < f_start) {
        f_length = f_start;
    }
 
    return f_string.substring(f_start, f_length);
}