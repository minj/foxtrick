/**
 * teamselectbox.js
 * Foxtrick team select box
 * @author convinced
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickTeamSelectBox= {
    
    MODULE_NAME : "TeamSelectBox",
        MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
        DEFAULT_ENABLED : true,

    init : function() {
            Foxtrick.registerPageHandler( 'players',
                                          FoxtrickTeamSelectBox);
    },

    run : function( page, doc ) {
	try {
		if (doc.location.href.search(/TeamID=/i)==-1) {return;}
		FoxtrickPrefs.setBool("ShowPlayerAsList",false);
		dump(Foxtrickl10n.getString("foxtrick.tweaks.overview" )+'\n');
     	var alldivs = doc.getElementsByTagName('div');
		for (var j = 0; j < alldivs.length; j++) {
			if (alldivs[j].className=="sidebarBox" ) {
				var header = alldivs[j].getElementsByTagName("h2")[0];
				if (header.innerHTML == Foxtrickl10n.getString("foxtrick.tweaks.overview" )) { 
					var pn=header.parentNode;
					var hh=pn.removeChild(header);
					var div = doc.createElement("div");
					div.appendChild(hh);
					div.setAttribute("style","cursor:pointer;");
					div.setAttribute("id", "ownselectboxHeaderID");
					div.addEventListener( "click", this.HeaderClick, false );
					FoxtrickTeamSelectBox.HeaderClick.doc=doc;
					pn.insertBefore(div,pn.firstChild);
					
					if (doc.location.href.search(/YouthPlayers/i)!=-1) {FoxtrickPrefs.setBool("ShowPlayerAsList",true);;}
					else {this.toSelectBox(doc);}
					break;
				}
			}
		}
	} catch (e) {dump("SelectBox->run: "+e+'\n');}
	},
	
    toSelectBox : function( doc ) {  dump("do:toSelectBox\n");
	try {	var alldivs = doc.getElementsByTagName('div');
		for (var j = 0; j < alldivs.length; j++) {
			if (alldivs[j].className=="sidebarBox" ) {
				var header = alldivs[j].getElementsByTagName("h2")[0];
				if (header.innerHTML == Foxtrickl10n.getString("foxtrick.tweaks.overview" )) { 
					var selectbox = doc.createElement("select"); 
					selectbox.setAttribute("id","ft_ownselectboxID");
					selectbox.addEventListener('change',FoxtrickTeamSelectBox_Select,false);
					FoxtrickTeamSelectBox_Select.doc=doc;
					
					var option = doc.createElement("option");
					option.setAttribute("value","");
					option.innerHTML=Foxtrickl10n.getString("foxtrick.tweaks.selectplayer" );
					selectbox.appendChild(option);	
						
					    var player = alldivs[j].getElementsByTagName("a")[0];
                        var pn=player.parentNode;
                        while (player!=null){ 
                            var option = doc.createElement("option");
                            option.setAttribute("value",player.href);
                            option.innerHTML=player.innerHTML;
                            selectbox.appendChild(option);
                            pn.removeChild(player);	
                            player=alldivs[j].getElementsByTagName("a")[0];																
                        }
                        pn.appendChild(selectbox);
                        break;
				}
			}
		}
	}
	 catch (e) {dump("SelectBox->toSelectBox: "+e+'\n');}	
	},
    
	toList : function( doc ) { dump("do:tolist\n");
	try {
		var alldivs = doc.getElementsByTagName('div');
		for (var j = 0; j < alldivs.length; j++) {
			if (alldivs[j].className=="sidebarBox" ) {
				var header = alldivs[j].getElementsByTagName("h2")[0];
				if (header.innerHTML == Foxtrickl10n.getString("foxtrick.tweaks.overview" )) { 
					    var option = alldivs[j].getElementsByTagName("option")[0];
						var pn=option.parentNode;
                        pn.removeChild(option);	
                        option=alldivs[j].getElementsByTagName("option")[0];
                        while (option!=null){ 
                            var player = doc.createElement("a");
                            player.href=option.value;
                            player.innerHTML=option.innerHTML;
                            pn.parentNode.appendChild(player);
                            pn.removeChild(option);	
                            option=alldivs[j].getElementsByTagName("option")[0];																
                        }
                        var selectbox = alldivs[j].getElementsByTagName("select")[0];
                        pn.parentNode.removeChild(selectbox);
                        break; 					
				}
			}
		}
	} catch (e) {dump("SelectBox->toList: "+e+'\n');}	
	},
	
    change : function( page, doc ) {
		if( !doc.getElementById ( "ownselectboxHeaderID" ) ) {
			this.run( page, doc );
		}	
	},

	HeaderClick : function(evt) {
	try {
	var doc=FoxtrickTeamSelectBox.HeaderClick.doc;
		FoxtrickPrefs.setBool("ShowPlayerAsList",!FoxtrickPrefs.getBool("ShowPlayerAsList"));
		if (FoxtrickPrefs.getBool("ShowPlayerAsList")) {FoxtrickTeamSelectBox.toList(doc);}
		else {FoxtrickTeamSelectBox.toSelectBox(doc);}		
	} catch (e) {dump("SelectBox->HeaderClick: "+e+'\n');}
	},

};

function FoxtrickTeamSelectBox_Select(evt) {
try {
			var doc=FoxtrickTeamSelectBox_Select.doc;
		doc.location.href=evt["target"]["value"];						
	} catch (e) {dump("FoxtrickTeamSelectBox_Select: "+e+'\n');}
}
