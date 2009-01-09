/**
 * linkscustom.js
 * Allows to adds custom links 
 * @author convinced
 */

 ////////////////////////////////////////////////////////////////////////////////
 
 
 
var FoxtrickLinksCustom = {

    MODULE_NAME : "LinksCustom",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	DEFAULT_ENABLED : false,

    init : function() {
	
		// check if personal icons still in chrome & if not resore them
		var MY_ID = "{9d1f059c-cada-4111-9696-41a62d64e3ba}";
		var file = Components.classes["@mozilla.org/extensions/manager;1"].
					getService(Components.interfaces.nsIExtensionManager).
					getInstallLocation(MY_ID).getItemFile(MY_ID, "content");
		file.append("resources");
		file.append("linkicons");
		file.append("ownicons");
		if ( !file.exists() || !file.isDirectory() ) {   // if it doesn't exist, create
			try{file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 600);					
			} catch(e){}
				
			var aFile = Components.classes["@mozilla.org/file/directory_service;1"]
						.getService(Components.interfaces.nsIProperties)
						.get("ProfD", Components.interfaces.nsIFile);
			aFile.append("foxtrick");
			aFile.append("ownicons");
			var items = aFile.directoryEntries;
			while (items.hasMoreElements()) {
				var item = items.getNext().QueryInterface(Components.interfaces.nsIFile);
				if (item.isFile()) {
					item.copyTo(file,"");
				}
			}
		}
    },
    
    run : function( page, doc ) {	
	},
	
	change : function( page, doc ) {
	},

	add : function( page, doc,ownBoxBody,pagemodule ) {
					
			var basepref="module."+this.MODULE_NAME+'.'+pagemodule;
			// get number of personal links
			var num_personal_links=FoxtrickPrefs.getInt(basepref+'.num_personal_links');
			if (num_personal_links==null) {
				FoxtrickPrefs.setInt(basepref+'.num_personal_links',0);
				num_personal_links=0;
			}
			// add personal links
			for (var nl=1;nl<num_personal_links+1;nl++) {		
				if (FoxtrickPrefs.getString(basepref+'.'+nl+'.href')==null) {continue;}				

				var div = doc.createElement ("div"); 
				div.setAttribute("style","cursor:pointer; display:inline-block; width: 26; height: 26px; background: url('chrome://foxtrick/content/resources/linkicons/ownicons/"+FoxtrickPrefs.getString(basepref+'.'+nl+'.img')+"') 50% no-repeat;");
				div.setAttribute( "title", FoxtrickPrefs.getString(basepref+'.'+nl+'.title') );
				div.setAttribute("onClick","window.open(\""+FoxtrickPrefs.getString(basepref+'.'+nl+'.href')+"\",\"_blank\");");
				div.innerHTML="<img src='chrome://foxtrick/content/resources/linkicons/transparent20.png'>";
				ownBoxBody.appendChild(doc.createTextNode(" "));
				ownBoxBody.appendChild(div);

				if (Foxtrick.isModuleEnabled(this)) {
					ownBoxBody.appendChild(FoxtrickLinksGetDelLink(doc,div,basepref+'.'+nl));
				}
			}

			if (Foxtrick.isModuleEnabled(this)) {
				this.show_edit( doc , ownBoxBody, basepref);
			}
	},
	
	show_edit : function( doc , ownBoxBody, basepref) {
		var divEDId="divEDId";

		// edit box
		var divED = doc.createElement ("DIV");
		divED.setAttribute("class", "alert");
		divED.setAttribute("id", divEDId );
		divED.setAttribute("style", "display: none;");
		divED.innerHTML =Foxtrickl10n.getString("foxtrick.linkscustom.addpersonallink" );
		
		// href edit field
		var inputHref = doc.createElement ("input");
		inputHref.setAttribute("name", "inputHref");
		inputHref.setAttribute("id", "inputHrefID");
		inputHref.setAttribute("value", "http://example.org");
		inputHref.setAttribute("type", "text");
		inputHref.setAttribute("maxlength", "200");
		//inputHref.setAttribute("size", "20");
		inputHref.className ="inner";
		divED.appendChild (inputHref);

		// titel edit field
		var inputTitle = doc.createElement ("input");
		inputTitle.setAttribute("name", "inputTitle");
		inputTitle.setAttribute("id", "inputTitleID");
		inputTitle.setAttribute("value", "Title");
		inputTitle.setAttribute("type", "text");
		inputTitle.setAttribute("maxlength", "100");
		//inputTitle.setAttribute("size", "20");
		divED.appendChild (inputTitle);

		var div = doc.createElement ("div"); 
		div.imgref="";
		div.setAttribute("id", "inputImgID");
		div.setAttribute( "title", 'Title') ;
		div.innerHTML="<img src='chrome://foxtrick/content/resources/linkicons/transparent20.png'>";
		div.setAttribute("style","cursor: pointer; display: inline-block; margin-left: 6px; width: 28px; height: 28px; background: url('chrome://foxtrick/content/resources/linkicons/empty20.png') 50% no-repeat;");
								
		// load image button
		var buttonnode= doc.createElement('input');
		buttonnode.setAttribute('type','button');
		buttonnode.setAttribute('name','button');
		buttonnode.setAttribute('value',Foxtrickl10n.getString("foxtrick.linkscustom.selecticon" ));
		buttonnode.className ="inner";
		buttonnode.parentdoc=doc.defaultView;
		buttonnode.result=div;
		buttonnode.addEventListener('click',FoxtrickLinksLoadDialog,false);
		
		divED.appendChild(buttonnode);
		divED.appendChild (div);
		
		// save link
		FoxtrickLinksCustom.saveMyLink.doc=doc;
		FoxtrickLinksCustom.saveMyLink.basepref=basepref;
		
		var saveLink = doc.createElement ("a");	
		saveLink.setAttribute("href", "javascript: void(0); showHide('" + divEDId +"');");
		saveLink.setAttribute("name", "savelinkname");
		saveLink.addEventListener( "click", FoxtrickLinksCustom.saveMyLink, false );
		saveLink.innerHTML = Foxtrickl10n.getString("foxtrick.prefs.buttonSave" );
		divED.appendChild(saveLink);

		// add link
		var showEditLink = doc.createElement ("a");
		showEditLink.setAttribute("href", "javascript: showHide('" + divEDId + "');");
    	showEditLink.innerHTML =Foxtrickl10n.getString("foxtrick.linkscustom.addlink" );
		showEditLink.setAttribute("id", "showEditID");

		ownBoxBody.appendChild(doc.createTextNode(" "));
		ownBoxBody.appendChild(showEditLink);		  
		ownBoxBody.appendChild(divED);
	},
		
	delMyLink : function (evt) { 
		var mylink = evt["target"]["mylink"];
		var baseprefnl = evt["target"]["baseprefnl"];
		FoxtrickPrefs.delListPref(baseprefnl+'.href');
		FoxtrickPrefs.delListPref(baseprefnl+'.title');
		FoxtrickPrefs.delListPref(baseprefnl+'.img');
		mylink.parentNode.removeChild(mylink.previousSibling);
		mylink.parentNode.removeChild(mylink.nextSibling);
		mylink.parentNode.removeChild(mylink);
	},

	saveMyLink : function (evt) { 
		var doc = FoxtrickLinksCustom.saveMyLink.doc;
		var basepref = FoxtrickLinksCustom.saveMyLink.basepref;
		var nl=FoxtrickPrefs.getInt(basepref+'.num_personal_links');
		nl+=1;
		FoxtrickPrefs.setString(basepref+'.'+nl+'.href',doc.getElementById ("inputHrefID" ).value );
		FoxtrickPrefs.setString(basepref+'.'+nl+'.title',doc.getElementById ( "inputTitleID" ).value);
		FoxtrickPrefs.setString(basepref+'.'+nl+'.img',doc.getElementById ( "inputImgID" ).imgref);
		FoxtrickPrefs.setInt(basepref+'.num_personal_links',nl);
				
		var div = doc.createElement ("div"); 
		div.setAttribute("style","cursor:pointer; display:inline-block; width: 16px; height: 16px; background: url('chrome://foxtrick/content/resources/linkicons/ownicons/"+FoxtrickPrefs.getString(basepref+'.'+nl+'.img')+"') 50% no-repeat;");
		div.setAttribute( "title", FoxtrickPrefs.getString(basepref+'.'+nl+'.title') );
		div.setAttribute("onClick","window.open(\""+FoxtrickPrefs.getString(basepref+'.'+nl+'.href')+"\",\"_blank\");");
		div.innerHTML="<img src='chrome://foxtrick/content/resources/linkicons/transparent20.png'>";
		
		//div.className ="inner";
		var elem=doc.getElementById("showEditID").previousSibling;
		elem.parentNode.insertBefore(doc.createTextNode(" "),elem);
		elem.parentNode.insertBefore(div,elem);
		var dellink=FoxtrickLinksGetDelLink(doc,div,basepref+'.'+nl);
		elem.parentNode.insertBefore(dellink,elem);	
		},
};

function FoxtrickLinksGetDelLink (doc,mylink,baseprefnl) { 
		var delLink = doc.createElement ("a");	
		delLink.setAttribute("href", "javascript: void(0);");
		delLink.setAttribute("name", "dellinkname");
		delLink.className="inner";
		delLink.addEventListener( "click", FoxtrickLinksCustom.delMyLink, false );
		delLink.innerHTML = Foxtrickl10n.getString("foxtrick.linkscustom.remove");
		delLink.baseprefnl = baseprefnl;
		delLink.mylink = mylink; 
		return delLink;
}


function FoxtrickLinksLoadDialog (evt)
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
			var file = Components.classes["@mozilla.org/extensions/manager;1"].
					getService(Components.interfaces.nsIExtensionManager).
					getInstallLocation(MY_ID).getItemFile(MY_ID, "content");
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
		evt["target"]["result"].imgref=imgfile;
		evt["target"]["result"].setAttribute("style","cursor:pointer; display:inline-block; margin-left: 6px; width: 28px; height: 28px; background: url('chrome://foxtrick/content/resources/linkicons/ownicons/"+imgfile+"') 100% no-repeat;");
	}
