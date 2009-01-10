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
	
	HeaderClick : function(evt) {
		try { 
			var module=FoxtrickLinksCustom.HeaderClick.module;
			var doc=FoxtrickLinksCustom.HeaderClick.doc;
			FoxtrickPrefs.setBool( "module." + module.MODULE_NAME + ".enabled", !Foxtrick.isModuleEnabled(module) );
			doc.location.reload();
		}
		catch(e) { dump("LinksCustom->HeaderClick->"+e); }
	},

//extensions.foxtrick.prefs.module.AddDefaultFaceCard.enabled 
//foxtrick_Links_box
	add : function( page, doc,ownBoxBody,pagemodule ) {
		try {			
			var alldivs = doc.getElementsByTagName('div');
			for (var j = 0; j < alldivs.length; j++) {
				if (alldivs[j].className=="sidebarBox" ) {
					var header = alldivs[j].getElementsByTagName("h2")[0];
					if (header.innerHTML == Foxtrickl10n.getString("foxtrick.links.boxheader" )) { 
						var pn=header.parentNode;
						var hh=pn.removeChild(header);
						var div = doc.createElement("div");
						div.appendChild(hh);
						div.setAttribute("style","cursor:pointer;");
						div.setAttribute("id", "ownselectboxHeaderID");
						div.addEventListener( "click", this.HeaderClick, false );
						FoxtrickLinksCustom.HeaderClick.module=this;
						FoxtrickLinksCustom.HeaderClick.doc=doc;
						pn.insertBefore(div,pn.firstChild);
					}
				}
			}
					
			var basepref="module."+this.MODULE_NAME+'.'+pagemodule;
			// get number of personal links
			var num_personal_links=FoxtrickPrefs.getInt(basepref+'.num_personal_links');
			if (num_personal_links==null) {
				FoxtrickPrefs.setInt(basepref+'.num_personal_links',0);
				num_personal_links=0;
			}
			if (Foxtrick.isModuleEnabled(this)) {
				// show options
				this.show_edit( doc , ownBoxBody, basepref);
			}
			else {
				// just show links
				for (var nl=1;nl<num_personal_links+1;nl++) {		
				if (FoxtrickPrefs.getString(basepref+'.'+nl+'.href')==null) {continue;}				

				var div = doc.createElement ("div"); 
				div.setAttribute("style","cursor:pointer; display:inline-block; width: 16; height: 16px; background: url('chrome://foxtrick/content/resources/linkicons/ownicons/"+FoxtrickPrefs.getString(basepref+'.'+nl+'.img')+"') 50% no-repeat;");
				div.setAttribute( "title", FoxtrickPrefs.getString(basepref+'.'+nl+'.title') );
				div.setAttribute("onClick","window.open(\""+FoxtrickPrefs.getString(basepref+'.'+nl+'.href')+"\",\"_blank\");");
				div.innerHTML="<img src='chrome://foxtrick/content/resources/linkicons/transparent16.png'>";
				ownBoxBody.appendChild(doc.createTextNode(" "));
				ownBoxBody.appendChild(div);
				}
			}
		}
		catch(e){dump("CustomLinks->"+e);}
	},
	
	show_edit : function( doc , ownBoxBody, basepref) {
		try {
			var num_personal_links=FoxtrickPrefs.getInt(basepref+'.num_personal_links');

			// box
			var divED = doc.createElement ("DIV");
			divED.setAttribute("class", "alert");
			divED.setAttribute("id", "divEDId" );
			
			var table=doc.createElement ("table"); 
			table.setAttribute('id','LinksCustomTableID');					 
			var tr0 = doc.createElement ("tr");
			var th = doc.createElement ("th");
			th.innerHTML =Foxtrickl10n.getString("foxtrick.linkscustom.addpersonallink" );
			th.setAttribute("colspan","2");
			tr0.appendChild(th);
			table.appendChild(tr0);
			for (var nl=1;nl<num_personal_links+1;nl++) {		
				if (FoxtrickPrefs.getString(basepref+'.'+nl+'.href')==null) {continue;}				

				var div = doc.createElement ("div"); 
				div.setAttribute("style","cursor:pointer; display:inline-block; width: 16; height: 16px; background: url('chrome://foxtrick/content/resources/linkicons/ownicons/"+FoxtrickPrefs.getString(basepref+'.'+nl+'.img')+"') 50% no-repeat;");
				div.setAttribute( "title", FoxtrickPrefs.getString(basepref+'.'+nl+'.title') );
				div.setAttribute("onClick","window.open(\""+FoxtrickPrefs.getString(basepref+'.'+nl+'.href')+"\",\"_blank\");");
				div.innerHTML="<img src='chrome://foxtrick/content/resources/linkicons/transparent16.png'>";
				var tr1 = doc.createElement ("tr");
				tr1.height=20;
				var td1 = doc.createElement ("td");
				td1.width=20;					
				var td2 = doc.createElement ("td");
				td2.setAttribute("style","vertical-align:middle;");
				td1.appendChild(div);
				td2.appendChild(FoxtrickLinksGetDelLink(doc,div,basepref+'.'+nl));
				tr1.appendChild(td1);
				tr1.appendChild(td2);
				table.appendChild(tr1);
			}		
			var trn = doc.createElement ("tr");
			trn.height=20;
			var tdn = doc.createElement ("td");
			var divn = doc.createElement ("div"); 
			divn.innerHTML="<img src='chrome://foxtrick/content/resources/linkicons/transparent16.png'>";
			tdn.appendChild(divn);				
			trn.appendChild(tdn);				
			table.appendChild(trn);				
			
			var div = doc.createElement ("div"); 
			div.imgref="";
			div.setAttribute("id", "inputImgID");
			div.setAttribute( "title", 'Title') ;
			div.innerHTML="<img src='chrome://foxtrick/content/resources/linkicons/transparent16.png'>";
			div.setAttribute("style","display:inline-block; width: 16; height: 16px; background: url('chrome://foxtrick/content/resources/linkicons/empty16.png') 50% no-repeat;");
								
			// load image button
			var loadIcon = doc.createElement ("a");	
			loadIcon.setAttribute("href", "javascript: void(0);");
			loadIcon.className="inner";
			loadIcon.addEventListener( "click", FoxtrickLinksLoadDialog, false );
			loadIcon.innerHTML = Foxtrickl10n.getString("foxtrick.linkscustom.selecticon");
			loadIcon.parentdoc = doc.defaultView;
			loadIcon.result = div; 
		
			var tr1 = doc.createElement ("tr");
			tr1.height=20;
			var td1 = doc.createElement ("td");
			td1.width=20;					
			var td2 = doc.createElement ("td");
			td2.setAttribute("style","vertical-align:middle;");
			td1.appendChild(div);
			td2.appendChild(loadIcon);
			tr1.appendChild(td1);
			tr1.appendChild(td2);
			table.appendChild(tr1);
				
			divED.appendChild(table);	
		
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

			// save link
			FoxtrickLinksCustom.saveMyLink.doc=doc;
			FoxtrickLinksCustom.saveMyLink.basepref=basepref;
		
			var saveLink = doc.createElement ("a");	
			saveLink.setAttribute("href", "javascript: void(0);");
			saveLink.setAttribute("name", "savelinkname");
			saveLink.addEventListener( "click", FoxtrickLinksCustom.saveMyLink, false );
			saveLink.innerHTML = Foxtrickl10n.getString("foxtrick.linkscustom.addlink" );
			divED.appendChild(saveLink);
		
			ownBoxBody.appendChild(divED);
		}
		catch (e) {dump("LinksCustom->show_edit->"+e);}
	},
		
	delMyLink : function (evt) { 
		var mylink = evt["target"]["mylink"];
		var baseprefnl = evt["target"]["baseprefnl"];
		FoxtrickPrefs.delListPref(baseprefnl+'.href');
		FoxtrickPrefs.delListPref(baseprefnl+'.title');
		FoxtrickPrefs.delListPref(baseprefnl+'.img');
		mylink.parentNode.parentNode.parentNode.removeChild(mylink.parentNode.parentNode);
	},

	saveMyLink : function (evt) { 
		try {
			var doc = FoxtrickLinksCustom.saveMyLink.doc;
			var basepref = FoxtrickLinksCustom.saveMyLink.basepref;
			var nl=FoxtrickPrefs.getInt(basepref+'.num_personal_links');
			nl+=1;
			FoxtrickPrefs.setString(basepref+'.'+nl+'.href',doc.getElementById ("inputHrefID" ).value );
			FoxtrickPrefs.setString(basepref+'.'+nl+'.title',doc.getElementById ( "inputTitleID" ).value);
			FoxtrickPrefs.setString(basepref+'.'+nl+'.img',doc.getElementById ( "inputImgID" ).imgref);
			FoxtrickPrefs.setInt(basepref+'.num_personal_links',nl);
				
			var div = doc.createElement ("div"); 
			div.setAttribute("style","cursor:pointer; display:inline-block; width: 16; height: 16px; background: url('chrome://foxtrick/content/resources/linkicons/ownicons/"+FoxtrickPrefs.getString(basepref+'.'+nl+'.img')+"') 50% no-repeat;");
			div.setAttribute( "title", FoxtrickPrefs.getString(basepref+'.'+nl+'.title') );
			div.setAttribute("onClick","window.open(\""+FoxtrickPrefs.getString(basepref+'.'+nl+'.href')+"\",\"_blank\");");
			div.innerHTML="<img src='chrome://foxtrick/content/resources/linkicons/transparent16.png'>";
			
			var tr1 = doc.createElement ("tr");
			tr1.height=20;
			var td1 = doc.createElement ("td");
			td1.width=20;					
			var td2 = doc.createElement ("td");
			td2.setAttribute("style","vertical-align:middle;");
			td1.appendChild(div);
			td2.appendChild(FoxtrickLinksGetDelLink(doc,div,basepref+'.'+nl));
			tr1.appendChild(td1);
			tr1.appendChild(td2);
			var table=doc.getElementById("LinksCustomTableID");
			table.insertBefore(tr1,table.lastChild.previousSibling);
		}
		catch(e) {dump("LinksCustom->saveMyLink->"+e);}
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
		evt["target"]["result"].setAttribute("style","display:inline-block; width: 16; height: 16px; background: url('chrome://foxtrick/content/resources/linkicons/ownicons/"+imgfile+"') 100% no-repeat;");
	}
