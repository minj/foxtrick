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

