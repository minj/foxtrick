/**
 * linksteam.js
 * Foxtrick add links to team pages
 * @author convinced
 */

 function chromeToPath (aPath) {
Foxtrick.alert(aPath);
   if (!aPath || !(/^chrome:/.test(aPath)))
      return; //not a chrome url
Foxtrick.alert("1");
   var rv;
   
      var ios = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces["nsIIOService"]);
Foxtrick.alert("2");
        var uri = ios.newFileURI(aPath, "UTF-8", null);
Foxtrick.alert(uri);
        var cr = Components.classes['@mozilla.org/chrome/chrome-registry;1'].getService(Components.interfaces["nsIChromeRegistry"]);
Foxtrick.alert("4");
        rv = cr.convertChromeURL(uri).spec;
Foxtrick.alert("5");

        if (/^file:/.test(rv))
          rv = this.urlToPath(rv);
        else
          rv = this.urlToPath("file://"+rv);

      return rv;
}

function urlToPath (aPath) {

    if (!aPath || !/^file:/.test(aPath))
      return ;
    var rv;
   var ph = Components.classes["@mozilla.org/network/protocol;1?name=file"]
        .createInstance(Components.interfaces.nsIFileProtocolHandler);
    rv = ph.getFileFromURLSpec(aPath).path;
    return rv;
}
////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksTeam = {
	
    MODULE_NAME : "LinksTeam",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	DEFAULT_ENABLED : true,
	OPTIONS : {}, 

    init : function() {
            Foxtrick.registerPageHandler( 'teamPageGeneral',
                                          FoxtrickLinksTeam );
			Foxtrick.initOptionsLinks(this,"teamlink");
    },

    run : function( page, doc ) {
		if (!this.isTeamPage(doc)) {return;}
           	
		var alldivs = doc.getElementsByTagName('div');
		for (var j = 0; j < alldivs.length; j++) {
			if (alldivs[j].className=="main mainRegular") {
				var links = this.gatherLinks( alldivs[j], doc );
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
				}
				
			
			var divEDId=625262;

			var showEditLink = doc.createElement ("a");
	  //showEditLink.setAttribute("href", "javascript: showHide('" + divEDId+ "');");
		showEditLink.setAttribute("href", "javascript:alert(document.lastModified);");
						
//	  showEditLink.setAttribute("style", "margin-top: 30px;position:relative;");
	  	  showEditLink.innerHTML ="edit";

//Foxtrick.alert("in");

//Foxtrick.alert(document.location.href);document.location="kj";

/*var ioService = Components.classes["@mozilla.org/network/io-service;1"]
                          .getService(Components.interfaces.nsIIOService);
var resProt = ioService.getProtocolHandler("resource")
                       .QueryInterface(Components.interfaces.nsIResProtocolHandler);

var aliasFile = Components.classes["@mozilla.org/file/local;1"]
                          .createInstance(Components.interfaces.nsILocalFile);
aliasFile.initWithPath("c://");

var aliasURI = ioService.newFileURI(aliasFile);
resProt.setSubstitution("myalias", aliasURI);
Foxtrick.alert(aliasURI.spec);*/
		  
		var divED = doc.createElement ("DIV");
		divED.setAttribute("class", "alert");
		divED.setAttribute("id", divEDId );
		divED.setAttribute("style", "display: none; float:left;");//width: 100px; 
		divED.innerHTML ="ggnnj<img title='gg' src='resource://nrg.png' >";
		
//#resource myres resource/ contentaccessible=yes
//resource myres resource/ contentaccessible=yes

		//Foxtrick.alert(divED.innerHTML);
	var inputGK = doc.createElement ("input");
	  inputGK.setAttribute("name", "inpGK");
	  inputGK.setAttribute("id", "YskillGK");
	  inputGK.setAttribute("value", "http://alltid.org");
	  inputGK.setAttribute("type", "text");
	  inputGK.setAttribute("maxlength", "200");
	  inputGK.setAttribute("size", "20");
		divED.appendChild (inputGK);
	  
	  var saveLink = doc.createElement ("a");
	  saveLink.setAttribute("href", "javascript: void(0); showHide('" + divEDId
		+"');");
	  FoxtrickLinksTeam.saveSkills.doc = doc;
	  saveLink.setAttribute("name", "savelinkname");
	  saveLink.addEventListener( "click", FoxtrickLinksTeam.saveSkills, false );
	  saveLink.setAttribute("style", "float: right");
	  saveLink.innerHTML = "save";

	  
var tmpFile = Components.classes["@mozilla.org/file/directory_service;1"]
                     .getService(Components.interfaces.nsIProperties)
                     .get("ProfD", Components.interfaces.nsIFile);
var ios = Components.classes["@mozilla.org/network/io-service;1"]
                    .getService(Components.interfaces.nsIIOService);
var url = ios.newFileURI(tmpFile);
var src="gbz<img title='gg' src='"+url.spec+"mypicture.png' >";
src="gjj<img title='gg' src='chrome://foxtrick/content/resources/linkicons/nrg.png'>";

//var ttt=chromeToPath('chrome://nrg.png');

//Foxtrick.alert(ttt);
//var src=ios.newFileURI(tmpFile);//"file:\\\\"+tmpFile.path+"\\mypicture.png";
//var src=PrefD;
 var mylink = doc.createElement ("a");
	  mylink.setAttribute("name", "mylink");
	  mylink.setAttribute("style", "float: right");
	  mylink.setAttribute("href", this.getSkill());
	  mylink.innerHTML =src;

	  ownBoxBody.appendChild(mylink);
	  ownBoxBody.appendChild(showEditLink);
	  ownBoxBody.appendChild(divED);
	  ownBoxBody.appendChild(saveLink);
				break;
			}
		}
	},
	getSkill: function()  {
	    var ret;
	    try{
	    	ret = FoxtrickPrefs.getString("mylink1");
		}
		catch(ex){
			ret = "unknown";
		} 
		return ret;
	},
	
	saveSkills : function (ev) {
		var doc = FoxtrickLinksTeam.saveSkills.doc;
		FoxtrickPrefs.setString("mylink1",doc.getElementById("YskillGK").value);

var aFileURL="file:///c:/nrg.png";	

var ios = Components.classes["@mozilla.org/network/io-service;1"]
                    .getService(Components.interfaces.nsIIOService);
var url = ios.newURI(aFileURL, null, null);
if (!url || !url.schemeIs("file")) {Foxtrick.alert("1.1");throw "Expected a file URL.";}
var pngFile = url.QueryInterface(Components.interfaces.nsIFileURL).file;
var istream = Components.classes["@mozilla.org/network/file-input-stream;1"]
                        .createInstance(Components.interfaces.nsIFileInputStream);
istream.init(pngFile, -1, -1, false);
var bstream = Components.classes["@mozilla.org/binaryinputstream;1"]
                        .createInstance(Components.interfaces.nsIBinaryInputStream);
bstream.setInputStream(istream);

var pngBinary = bstream.readBytes(bstream.available());
Foxtrick.alert(pngBinary.length);		
Foxtrick.alert(pngBinary[4]);		

var tmp;
for (var i=0;i<pngBinary.length;i++)
{tmp+=pngBinary[i];}
Foxtrick.alert(tmp);		
        var prefs = Components.classes[ "@mozilla.org/preferences-service;1"].
                           getService( Components.interfaces.nsIPrefService );

        var _pref_branch = prefs.getBranch( "extensions.foxtrick.prefs." );
        var str = Components.classes[ "@mozilla.org/supports-string;1" ].
                     createInstance( Components.interfaces.nsISupportsString );
        str.data = tmp;
        _pref_branch.setComplexValue( "any",
                                Components.interfaces.nsISupportsString, str );
Foxtrick.alert("11");		
 var pngBinary2 = _pref_branch.getComplexValue( "any",
                                 Components.interfaces.nsISupportsString ).data;
  
 
// the extension's id from install.rdf
/*var MY_ID = "{9d1f059c-cada-4111-9696-41a62d64e3ba}";
var em = Components.classes["@mozilla.org/extensions/manager;1"].
         getService(Components.interfaces.nsIExtensionManager);
// the path may use forward slash ("/") as the delimiter
// returns nsIFile for the extension's install.rdf
var afile = em.getInstallLocation(MY_ID).getItemFile(MY_ID, "mypic.png");
var filestring = afile.path;
Foxtrick.alert(filestring);		
*/

/*
// pngBinary already exists
var aFile = Components.classes["@mozilla.org/file/directory_service;1"]
                     .getService(Components.interfaces.nsIProperties)
                     .get("ProfD", Components.interfaces.nsIFile);
aFile.append("mypicture.png");
aFile.createUnique( Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 600);
var stream = Components.classes["@mozilla.org/network/safe-file-output-stream;1"]
                       .createInstance(Components.interfaces.nsIFileOutputStream);
stream.init(aFile, 0x04 | 0x08 | 0x20, 0600, 0); // write, create, truncate
stream.write(pngBinary, pngBinary.length);
if (stream instanceof Components.interfaces.nsISafeOutputStream) {
    stream.finish();
} else {
    stream.close();
}
Foxtrick.alert("2");		
*/

// the extension's id from install.rdf
var MY_ID = "{9d1f059c-cada-4111-9696-41a62d64e3ba}";
var em2 = Components.classes["@mozilla.org/extensions/manager;1"].
         getService(Components.interfaces.nsIExtensionManager);
// the path may use forward slash ("/") as the delimiter
// returns nsIFile for the extension's install.rdf
var file = em2.getInstallLocation(MY_ID).getItemFile(MY_ID, "content");
file.append("resources");
file.append("linkicons");
file.append("my.png");
var filestring = file.path;
var stream2 = Components.classes["@mozilla.org/network/safe-file-output-stream;1"]
                       .createInstance(Components.interfaces.nsIFileOutputStream);
stream2.init(file, 0x04 | 0x08 | 0x20, 0600, 0); // write, create, truncate
stream2.write(pngBinary2, pngBinary2.length);
if (stream2 instanceof Components.interfaces.nsISafeOutputStream) {
    stream2.finish();
} else {
    stream2.close();
}
Foxtrick.alert("3");		


	},
	
	change : function( page, doc ) {
		var header = Foxtrickl10n.getString("foxtrick.links.boxheader" );
		var ownBoxId = "foxtrick_" + header + "_box";
		if( !doc.getElementById ( ownBoxId ) ) {
			this.run( page, doc );
		}
	},
	
	isTeamPage : function(doc) {
        var site=doc.location.href;
        var remain=site.substr(site.search('Club\/')+5);
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
       
		return getLinks("teamlink", { "teamid": teamid, "teamname": teamname, "countryid" : countryid, "levelnum" : levelnum  }, doc, this );
	}
 
};