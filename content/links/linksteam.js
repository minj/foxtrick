/**
 * linksteam.js
 * Foxtrick add links to team pages
 * @author convinced
 */
////////////////////////////////////////////////////////////////////////////////

var FoxtrickLinksTeam = {
	
    MODULE_NAME : "LinksTeam",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	DEFAULT_ENABLED : true,
	OPTIONS : {}, 
	
	saveSkills : function (evt) { 
		var doc = FoxtrickLinksTeam.saveSkills.doc;
		var module = FoxtrickLinksTeam.saveSkills.module;
		var nl=FoxtrickPrefs.getInt(module+'.num_personal_links')+1;
		FoxtrickPrefs.setString(module+'.mylink'+nl+'.href',doc.getElementById ("inputHrefID" ).value );
		FoxtrickPrefs.setString(module+'.mylink'+nl+'.title',doc.getElementById ( "inputTitleID" ).value);
		FoxtrickPrefs.setString(module+'.mylink'+nl+'.img',doc.getElementById ( "inputImgID" ).name);
						
		var mylink = doc.createElement ("a");
		mylink.setAttribute("name", "mylink");
		mylink.className ="inner";
		
		mylink.setAttribute("href", FoxtrickPrefs.getString(module+'.mylink'+nl+'.href'));
		mylink.setAttribute("title", FoxtrickPrefs.getString(module+'.mylink'+nl+'.title'));
		mylink.innerHTML="<img src='chrome://foxtrick/content/resources/linkicons/"+FoxtrickPrefs.getString(module+'.mylink'+nl+'.img')+"'>";
		var elem=doc.getElementById("showEditID");
		elem.parentNode.insertBefore(mylink,elem);
		FoxtrickPrefs.setInt(module+'.num_personal_links',nl);
	},	

    init : function() {
            Foxtrick.registerPageHandler( 'teamPageGeneral',
                                          FoxtrickLinksTeam );
			Foxtrick.initOptionsLinks(this,"teamlink");
    },

    run : function( page, doc ) {
		var boxleft=doc.getElementById('ctl00_pnlSubMenu');
		if (boxleft==null) {return;}
		var teamid=FoxtrickHelper.findTeamId(boxleft); 
		if (teamid=="") {return;}
		if (doc.location.href.search(/\/Club\/Players\//i)!=-1  
		&& doc.location.href.search(/redir=true/i)!=-1 ) { 
			// redirect to coach
			var alldivs = doc.getElementsByTagName('div');
			for (var j = 0; j < alldivs.length; j++) {
				if (alldivs[j].className=="sidebarBox") { 
					var CoachId = FoxtrickHelper.findPlayerId(alldivs[j]);
					var serv = doc.location.href.match(/(\S+)Club/i)[0]; 
					var tar = serv+"/Players/Player.aspx?playerId="+CoachId;
					doc.location.replace(tar);
					break;					
				}
			}
		}				
		if (teamid!=FoxtrickHelper.ownteamid) {				
				// last lineup
				var bl_header=boxleft.getElementsByTagName('li');
				var li = doc.createElement("li");
				var lastmatchlink = doc.createElement("a");
				lastmatchlink.setAttribute('href', '/Club/Matches/MatchLineup.aspx?MatchID=&TeamID='+teamid+'&useArchive=True');
				lastmatchlink.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'LastLineup' )));
				var ownlastmatchlinkId = "foxtrick_content_lastmatch";
				lastmatchlink.setAttribute( "id", ownlastmatchlinkId );
				li.appendChild(lastmatchlink);
                    
				bl_header[0].parentNode.appendChild(li);

				// coach make link
				if (doc.location.href.search(/\/Club\/NationalTeam\//i)==-1) {
					if (teamid<3000||teamid>=5000) { // no matchpages of NTs
						var li2 = doc.createElement("li");
						var coachlink = doc.createElement("a");
						coachlink.setAttribute('href', '/Club/Players/?TeamID='+teamid+'&redir=true');
						coachlink.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'Coach' )));
						var owncoachlinkId = "foxtrick_content_coach";
						coachlink.setAttribute( "id", owncoachlinkId );
						li2.appendChild(coachlink);
						bl_header[0].parentNode.appendChild(li2);					
					}
				}
				else {
					var ntinfo=doc.getElementById('teamInfo');
					var CoachId = FoxtrickHelper.findPlayerId(ntinfo);
					var li2 = doc.createElement("li");
					var coachlink = doc.createElement("a");
					coachlink.setAttribute('href','/Club/Players/Player.aspx?playerId='+CoachId);
					coachlink.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'Coach' )));
					var owncoachlinkId = "foxtrick_content_coach";
					coachlink.setAttribute( "id", owncoachlinkId );
					li2.appendChild(coachlink);
					bl_header[0].parentNode.appendChild(li2);
				}
			}
				
		if (!this.isTeamPage(doc)) {return;}
		var alldivs = doc.getElementsByTagName('div');
		for (var j = 0; j < alldivs.length; j++) {
			if (alldivs[j].className=="main mainRegular") {
				var teaminfo = this.gatherLinks( alldivs[j], doc ); 
		
				var links = getLinks("teamlink", teaminfo, doc, this );				
				if (links.length > 0) {
					var ownBoxBody = doc.createElement("div");
					var header = Foxtrickl10n.getString("foxtrick.links.boxheader" );
					var ownBoxId = "foxtrick_" + header + "_box";
					var ownBoxBodyId = "foxtrick_" + header + "_content";
					ownBoxBody.setAttribute( "id", ownBoxBodyId );
               		                 
					for (var k = 0; k < links.length; k++) {
						links[k].link.className ="inner";
						ownBoxBody.appendChild(doc.createTextNode(" "));
						ownBoxBody.appendChild(links[k].link);
					}
					Foxtrick.addBoxToSidebar( doc, header, ownBoxBody, ownBoxId, "first", ""); 

					// get number of personal links
					var num_personal_links=FoxtrickPrefs.getInt(this.MODULE_NAME+'.num_personal_links');
					if (num_personal_links==null) {
						FoxtrickPrefs.setInt(this.MODULE_NAME+'.num_personal_links',0);
						num_personal_links=0;
					}
					// check if personal icons still in chrome & if not resore them
					var MY_ID = "{9d1f059c-cada-4111-9696-41a62d64e3ba}";
					var em2 = Components.classes["@mozilla.org/extensions/manager;1"].
							getService(Components.interfaces.nsIExtensionManager);
					var file = em2.getInstallLocation(MY_ID).getItemFile(MY_ID, "content");
					file.append("resources");
					file.append("linkicons");
					file.append("ownicons");
					if (!file.exists()) {
						var aFile = Components.classes["@mozilla.org/file/directory_service;1"]
								.getService(Components.interfaces.nsIProperties)
								.get("ProfD", Components.interfaces.nsIFile);
						aFile.append("foxtrick");
						aFile.append("ownicons");
						for (var nl=1;nl<num_personal_links+1;nl++) {
							try{
								aFile.append(FoxtrickPrefs.getString(this.MODULE_NAME+'.mylink'+nl+'.img'));
								aFile.copyTo(file);
							}
							catch(e){}
						}
					}	
					// add personal links
					for (var nl=1;nl<num_personal_links+1;nl++) {		
						var mylink = doc.createElement ("a");
						mylink.setAttribute("name", "mylink");
						mylink.className ="inner";
						mylink.setAttribute("href", FoxtrickPrefs.getString(this.MODULE_NAME+'.mylink'+nl+'.href'));
						mylink.setAttribute("title", FoxtrickPrefs.getString(this.MODULE_NAME+'.mylink'+nl+'.title'));
						mylink.innerHTML="<img src='chrome://foxtrick/content/resources/linkicons/"+FoxtrickPrefs.getString(this.MODULE_NAME+'.mylink'+nl+'.img')+"'>";		
						ownBoxBody.appendChild(doc.createTextNode(" "));
						ownBoxBody.appendChild(mylink);
					}

					this.show_edit( doc , ownBoxBody);
				}
			}
		}
	},

	
	show_edit : function( doc , ownBoxBody) {
		var divEDId="divEDId";

		// edit box
		var divED = doc.createElement ("DIV");
		divED.setAttribute("class", "alert");
		divED.setAttribute("id", divEDId );
		divED.setAttribute("style", "display: none;");
		divED.innerHTML ="Add personal links";
		
		// href edit field
		var inputHref = doc.createElement ("input");
		inputHref.setAttribute("name", "inputHref");
		inputHref.setAttribute("id", "inputHrefID");
		inputHref.setAttribute("value", "http://example.org/mylink.html");
		inputHref.setAttribute("type", "text");
		inputHref.setAttribute("maxlength", "200");
		inputHref.setAttribute("size", "25");
		inputHref.className ="inner";
		divED.appendChild (inputHref);

		// titel edit field
		var inputTitle = doc.createElement ("input");
		inputTitle.setAttribute("name", "inputTitle");
		inputTitle.setAttribute("id", "inputTitleID");
		inputTitle.setAttribute("value", "title");
		inputTitle.setAttribute("type", "text");
		inputTitle.setAttribute("maxlength", "100");
		inputTitle.setAttribute("size", "10");
		divED.appendChild (inputTitle);

		var myimg = doc.createElement ("a");
		myimg.setAttribute("name", "myimg");
		myimg.setAttribute("id", "inputImgID");
		myimg.className ="inner";
		var src="";
		myimg.innerHTML =src;
		
		// load image button
		var buttonnode= doc.createElement('input');
		buttonnode.setAttribute('type','button');
		buttonnode.setAttribute('name','button');
		buttonnode.setAttribute('value','get icon');
		buttonnode.className ="inner";
		buttonnode.parentdoc=doc.defaultView;
		buttonnode.result=myimg;
		buttonnode.addEventListener('click',LoadDialog,false);
		
		divED.appendChild(buttonnode);
		divED.appendChild (myimg);

		// save link
		FoxtrickLinksTeam.saveSkills.doc=doc;
		FoxtrickLinksTeam.saveSkills.module=this.MODULE_NAME;
		
		var saveLink = doc.createElement ("a");	
		saveLink.setAttribute("href", "javascript: void(0); showHide('" + divEDId +"');");
		saveLink.setAttribute("name", "savelinkname");
		saveLink.className ="inner";
		saveLink.addEventListener( "click", FoxtrickLinksTeam.saveSkills, false );
		saveLink.innerHTML = "save";
		divED.appendChild(saveLink);

		// add link
		var showEditLink = doc.createElement ("a");
		showEditLink.setAttribute("href", "javascript: showHide('" + divEDId + "');");
    	showEditLink.innerHTML ="add link";
		showEditLink.setAttribute("id", "showEditID");
		showEditLink.className ="inner";

		ownBoxBody.appendChild(doc.createTextNode(" "));
		ownBoxBody.appendChild(showEditLink);		  
		ownBoxBody.appendChild(divED);
	},

	change : function( page, doc ) {
		var header = Foxtrickl10n.getString("foxtrick.links.boxheader" );
		var ownBoxId = "foxtrick_" + header + "_box";
		var owncoachlinkId = "foxtrick_content_coach";
		var ownlastmatchlinkId = "foxtrick_content_lastmatch";
						if( !doc.getElementById ( ownBoxId ) 
						&& !doc.getElementById ( owncoachlinkId )
						&& !doc.getElementById ( ownlastmatchlinkId ) ) {
			this.run( page, doc );
		}
	},
	
	isTeamPage : function(doc) {
        var site=doc.location.href;
        var remain=site.substr(site.search(/Club\//i)+5);
    return (remain=="" || remain.search(/TeamID=/i)==1);
	},
	
	gatherLinks : function( thisdiv, doc ) {
		var countryid = FoxtrickHelper.findCountryId(thisdiv);
  		var teamid = FoxtrickHelper.findTeamId(thisdiv);
		var teamname = FoxtrickHelper.extractTeamName(thisdiv);
		var leaguename = FoxtrickHelper.extractLeagueName(thisdiv);
		var levelnum = FoxtrickHelper.getLevelNum(leaguename, countryid);
      
		if (!leaguename.match(/^[A-Z]+\.\d+/i)) {
			leaguename="I";
		} 
       
		return { "teamid": teamid, "teamname": teamname, "countryid" : countryid, "levelnum" : levelnum  };
	},
};
	

function LoadDialog(evt)
{	
	var path="file://"+Foxtrick.selectFile(evt["target"]["parentdoc"]);
	var pathdel="\\";
	if (path.charAt(7)=="/") {pathdel="/";}
	var imgfile=path.substr(path.lastIndexOf(pathdel)+1);
	
	var pngBinary;		
	// load from file
	try {
		var ios = Components.classes["@mozilla.org/network/io-service;1"]
                    .getService(Components.interfaces.nsIIOService);
		var url = ios.newURI(path, null, null);
		if (!url || !url.schemeIs("file")) {throw "Expected a file URL.";}
		var pngFile = url.QueryInterface(Components.interfaces.nsIFileURL).file;
		var istream = Components.classes["@mozilla.org/network/file-input-stream;1"]
                        .createInstance(Components.interfaces.nsIFileInputStream);
		istream.init(pngFile, -1, -1, false);
		var bstream = Components.classes["@mozilla.org/binaryinputstream;1"]
                        .createInstance(Components.interfaces.nsIBinaryInputStream);
		bstream.setInputStream(istream);
		pngBinary = bstream.readBytes(bstream.available());
	}
	catch(e) {Foxtrick.alert(aFileURL+" not found");return;}

	// save to preference folder
	try {
		var aFile = Components.classes["@mozilla.org/file/directory_service;1"]
                     .getService(Components.interfaces.nsIProperties)
                     .get("ProfD", Components.interfaces.nsIFile);
		aFile.append("foxtrick");
		aFile.append("ownicons");
		aFile.append(imgfile);
		aFile.create( Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 600);
		var stream = Components.classes["@mozilla.org/network/safe-file-output-stream;1"]
                       .createInstance(Components.interfaces.nsIFileOutputStream);
		stream.init(aFile, 0x04 | 0x08 | 0x20, 0600, 0); // write, create, truncate
		stream.write(pngBinary, pngBinary.length);
		if (stream instanceof Components.interfaces.nsISafeOutputStream) {
			stream.finish();
		} else {
			stream.close();
		}
	}
	catch(e) {}
	
	// save to extension folder
	try{
			var MY_ID = "{9d1f059c-cada-4111-9696-41a62d64e3ba}";
			var em2 = Components.classes["@mozilla.org/extensions/manager;1"].
					getService(Components.interfaces.nsIExtensionManager);
			// returns nsIFile for the extension's install.rdf
			var file = em2.getInstallLocation(MY_ID).getItemFile(MY_ID, "content");
			file.append("resources");
			file.append("linkicons");
			file.append("ownicons");
			file.append(imgfile);
			file.create( Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 600);
			var filestring = file.path; 
			var stream2 = Components.classes["@mozilla.org/network/safe-file-output-stream;1"]
                       .createInstance(Components.interfaces.nsIFileOutputStream);
			stream2.init(file, 0x04 | 0x08 | 0x20, 0600, 0); // write, create, truncate
			stream2.write(pngBinary, pngBinary.length);
			if (stream2 instanceof Components.interfaces.nsISafeOutputStream) {
				stream2.finish();
			} else {
				stream2.close();
			} 
	} catch(e){}
	
	//return 
	evt["target"]["result"].innerHTML="<img src='chrome://foxtrick/content/resources/linkicons/ownicons/"+imgfile+"'>";
	evt["target"]["result"].setAttribute("name", imgfile);
}
 
