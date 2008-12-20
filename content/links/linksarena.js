/**
 * linksyouthoverview.js
 * Foxtrick add links to arena pages
 * @author convinced
 */

////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksArena = {
	
    MODULE_NAME : "LinksArena",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	DEFAULT_ENABLED : true,


    init : function() {
            Foxtrick.registerPageHandler( 'arena',
                                          FoxtrickLinksArena );
    },

    run : function( page, doc ) { 
		//addExternalLinksToArenaPage
		
		var alldivs = doc.getElementsByTagName('div');
		for (var j = 0; j < alldivs.length; j++) {
			if (alldivs[j].className=="arenaInfo") {
				var thisdiv = alldivs[j];
				var arenaTable = thisdiv.getElementsByTagName("table")[0];

 				var links = getLinks("arenalink", { "terraces" : Foxtrick.trim(arenaTable.rows[3].cells[1].textContent),
                                            "basic": Foxtrick.trim(arenaTable.rows[4].cells[1].textContent),
                                            "roof" : Foxtrick.trim(arenaTable.rows[5].cells[1].textContent),
                                            "vip" : Foxtrick.trim(arenaTable.rows[6].cells[1].textContent),  }, doc );  
				if (links.length > 0) {
								var ownSidebarBox = doc.createElement("div");
                                ownSidebarBox.className = "sidebarBox";
                                var ownBoxHead = doc.createElement("div");
                                ownBoxHead.className = "boxHead";
                                ownSidebarBox.appendChild(ownBoxHead);
                                var ownBoxLeftHeader = doc.createElement("div");
                                ownBoxLeftHeader.className = "boxLeft";
                                ownBoxHead.appendChild(ownBoxLeftHeader);
                                var ownHeader = doc.createElement("h2");
                                ownHeader.innerHTML = Foxtrickl10n.getString("foxtrick.links.boxheader" );
                                ownBoxLeftHeader.appendChild(ownHeader);
                                var ownBoxBody = doc.createElement("div");
                                ownBoxBody.className = "boxBody";
                                ownSidebarBox.appendChild(ownBoxBody);
                                for (var k = 0; k < links.length; k++) {
									links[k].link.className ="inner";
									
									ownBoxBody.appendChild(doc.createTextNode(" "));
									ownBoxBody.appendChild(links[k].link);
								}
								var ownBoxFooter = doc.createElement("div");
                                ownBoxFooter.className = "boxFooter";
                                ownSidebarBox.appendChild(ownBoxFooter);
                                var ownBoxLeftFooter = doc.createElement("div");
                                ownBoxLeftFooter.className = "boxLeft";
                                ownBoxLeftFooter.innerHTML = "&nbsp;";                       
                                ownBoxFooter.appendChild(ownBoxLeftFooter);
                                
                                // Append the message form to the sidebar
                                var sidebar = doc.getElementById("sidebar");
                                var firstDiv = sidebar.getElementsByTagName("div")[0];
                                var subDivs = firstDiv.getElementsByTagName("div");
                                var divBoxHead;
                                var divBoxBody;
                                for(var j = 0; j < subDivs.length; j++) {
                                        switch(subDivs[j].className) {
                                                case "boxHead":
                                                        divBoxHead = subDivs[j];
                                                        break;
                                                case "boxBody":
                                                        divBoxBody = subDivs[j];
                                                        break;
                                        }
                                }
                                var divBoxLeft = divBoxHead.getElementsByTagName("div")[0];
                                var header = divBoxLeft.getElementsByTagName("h2")[0];
                                sidebar.insertBefore(ownSidebarBox,firstDiv.nextSibling);                                                                
                }
				break;
			}
		}
    }	
 
};