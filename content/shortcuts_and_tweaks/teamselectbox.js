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
		OPTIONS : new Array("AlsoYouthPlayers"), 
		listbox:"",

    init : function() {
            Foxtrick.registerPageHandler( 'players',this);
            Foxtrick.registerPageHandler( 'YouthPlayers',this);
    },

    run : function( page, doc ) {
		try {
			if (doc.location.href.search(/TeamID=/i)==-1) {return;}
			
			if (Foxtrick.isStandardLayout(doc) )
				Foxtrick.addStyleSheet(doc, "chrome://foxtrick/content/resources/css/linkscustom_std.css");
			else Foxtrick.addStyleSheet(doc, "chrome://foxtrick/content/resources/css/linkscustom_simple.css");

			FoxtrickPrefs.setBool("ShowPlayerAsList",false);
			//dump(Foxtrickl10n.getString("foxtrick.tweaks.overview" )+'\n');
			this.listbox=null;
			var listbox2=null;
			var maxlinks=0;
			var alldivs = doc.getElementsByTagName('div');
			for (var j = 0; j < alldivs.length; j++) {
				if (alldivs[j].className=="sidebarBox" ) {
					var header = alldivs[j].getElementsByTagName("h2")[0];
					if (header.innerHTML == Foxtrickl10n.getString("foxtrick.tweaks.overview" )) { 
						this.listbox=alldivs[j];					
					}
					if (alldivs[j].getElementsByTagName("a").length > maxlinks) {
						maxlinks=alldivs[j].getElementsByTagName("a").length;
						listbox2=alldivs[j];
					}
				}
			}
			// fallback
			if (this.listbox==null){ this.listbox=listbox2;} // playerbox not found by string, take the one with most links which should be the one with the players
            
			// add headerclick
			var header = this.listbox.getElementsByTagName("h2")[0];
			var pn=header.parentNode;
			var div=null;
			if (pn.className!='boxLeft') {
				var hh=pn.removeChild(header);
				div = doc.createElement("div");
				div.appendChild(hh);
				pn.insertBefore(div,pn.firstChild);
			}
			else div=pn.parentNode;
			div.setAttribute("style","cursor:pointer;");
            div.setAttribute("id", "ownselectboxHeaderID");
            if (FoxtrickPrefs.getBool("ShowPlayerAsList")) div.setAttribute("class","boxHead sidebarBoxUnfolded");
            else div.setAttribute("class","boxHead sidebarBoxCollapsed");
			div.addEventListener( "click", this.HeaderClick, false );
            FoxtrickTeamSelectBox.HeaderClick.doc=doc;
                                       
            if (doc.location.href.search(/YouthPlayers/i)!=-1 && !Foxtrick.isModuleFeatureEnabled( this, "AlsoYouthPlayers" ) ) 
				{FoxtrickPrefs.setBool("ShowPlayerAsList",true);}
            else {this.toSelectBox(doc);}
		} 
		catch (e) {dump("SelectBox->run: "+e+'\n');}
	},
	
    toSelectBox : function( doc ) { // dump("do:toSelectBox\n");
	try {	
	if (this.listbox!=null) {
			var selectbox = doc.createElement("select"); 
			selectbox.setAttribute("id","ft_ownselectboxID");
			selectbox.addEventListener('change',FoxtrickTeamSelectBox_Select,false);
			FoxtrickTeamSelectBox_Select.doc=doc;
		var option = doc.createElement("option");
		option.setAttribute("value","");
		option.innerHTML=Foxtrickl10n.getString("foxtrick.tweaks.selectplayer" );
		selectbox.appendChild(option);	
						
		var player = this.listbox.getElementsByTagName("a")[0];
		var pn=player.parentNode;
		while (player!=null){ 
            var option = doc.createElement("option");
            option.setAttribute("value",player.href);
            option.innerHTML=player.innerHTML;
            selectbox.appendChild(option);
            pn.removeChild(player);	
            player=this.listbox.getElementsByTagName("a")[0];																
            }
        pn.appendChild(selectbox);        
	}
	}
	 catch (e) {dump("SelectBox->toSelectBox: "+e+'\n');}	
	},
    
	toList : function( doc ) { //dump("do:tolist\n");
		try {	
			if (this.listbox!=null) {
					    var option = this.listbox.getElementsByTagName("option")[0];
						var pn=option.parentNode;
                        pn.removeChild(option);	
                        option=this.listbox.getElementsByTagName("option")[0];
                        while (option!=null){ 
                            var player = doc.createElement("a");
                            player.href=option.value;
                            player.innerHTML=option.innerHTML;
                            pn.parentNode.appendChild(player);
                            pn.removeChild(option);	
                            option=this.listbox.getElementsByTagName("option")[0];																
                        }
                        var selectbox = this.listbox.getElementsByTagName("select")[0];
                        pn.parentNode.removeChild(selectbox);
			}
		} 
		catch (e) {dump("SelectBox->toList: "+e+'\n');}	
	},
	
    change : function( page, doc ) {
		
		/*if( !doc.getElementById ( "ownselectboxHeaderID" ) ) {  // no good check as not allways available
			this.run( page, doc ); 
		}	*/
	},

	HeaderClick : function(evt) {
		try { 
			var doc=FoxtrickTeamSelectBox.HeaderClick.doc;
			FoxtrickPrefs.setBool("ShowPlayerAsList",!FoxtrickPrefs.getBool("ShowPlayerAsList"));
			var div=doc.getElementById("ownselectboxHeaderID");
            
			if (FoxtrickPrefs.getBool("ShowPlayerAsList")) {
				FoxtrickTeamSelectBox.toList(doc);
				div.setAttribute("class","boxHead sidebarBoxUnfolded");
			}
			else {FoxtrickTeamSelectBox.toSelectBox(doc);
				div.setAttribute("class","boxHead sidebarBoxCollapsed");}	
		} 
		catch (e) {dump("SelectBox->HeaderClick: "+e+'\n');}
	},

};

function FoxtrickTeamSelectBox_Select(evt) {
	try {
		var doc=FoxtrickTeamSelectBox_Select.doc;
		doc.location.href=evt["target"]["value"];						
	} catch (e) {dump("FoxtrickTeamSelectBox_Select: "+e+'\n');}
}
