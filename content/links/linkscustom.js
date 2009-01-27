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
	_ownBoxBody:"",
	_basepref:"",
	_info:"",
	
    init : function() {
    },
    
    run : function( page, doc ) {	
	},
	
	change : function( page, doc ) { 
	},
	
	add : function( page, doc,ownBoxBody,pagemodule,info ) {
		try {	
			this._info=info;
			Foxtrick.addStyleSheet(doc, "chrome://foxtrick/content/"+
							"resources/css/conference.css");
			Foxtrick.addStyleSheet(doc, "chrome://foxtrick/content/"+
							"resources/css/linkscustom.css");
					
			var basepref="module."+this.MODULE_NAME+'.'+pagemodule;

			if (ownBoxBody==null) {
				ownBoxBody = doc.createElement("div");
				var header = Foxtrickl10n.getString("foxtrick.links.boxheader" );
				var ownBoxId = "foxtrick_" + header + "_box";
				var ownBoxBodyId = "foxtrick_" + header + "_content";
				ownBoxBody.setAttribute( "id", ownBoxBodyId );
                                
				Foxtrick.addBoxToSidebar( doc, header, ownBoxBody, ownBoxId, "first", "");
			}
			
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
						div.setAttribute( "title", Foxtrickl10n.getString("foxtrick.linkscustom.addpersonallink") );
						div.addEventListener( "click", FoxtrickLinksCustomHeaderClick, false );
						//div.addEventListener( "MouseOut", "javascript:this.style.backgroundColor='#FFFFFF';",false);
						FoxtrickLinksCustomHeaderClick.module=this;
						FoxtrickLinksCustomHeaderClick.doc=doc;
						FoxtrickLinksCustomHeaderClick.ownBoxBody=ownBoxBody;
						FoxtrickLinksCustomHeaderClick.basepref=basepref;
						pn.insertBefore(div,pn.firstChild);
						break;
					}
				}
			}
								
			if (Foxtrick.isModuleEnabled(this)) {
				this.showEdit( doc , ownBoxBody, basepref);
			}
			else {
				this.showLinks(doc,ownBoxBody,basepref);
			}
		}
		catch(e){dump("CustomLinks->"+e);}
	},
	
	showLinks : function(doc,ownBoxBody,basepref){
		try { 
			// get custon links from pref
			var keys={};
			var array = FoxtrickPrefs._getElemNames( basepref );
			for (var nl=0;nl<array.length;nl++) {		
				var key=array[nl].replace(basepref+'\.',"");
				if (key.search(/\./)!=-1) {key=key.replace(/\..+/,"");keys[key]=key;}
				else continue; 
			}
			for (key in keys)  { 
				var href=FoxtrickPrefs.getString(basepref+'.'+key+'.href');
				var imgref=FoxtrickPrefs.getString(basepref+'.'+key+'.img');
				var title=FoxtrickPrefs.getString(basepref+'.'+key+'.title');
				if (href==null||imgref==null||title==null) {dump('customLink '+key+' incomplete\n');continue; }				
				// replace tags
				var mykeytag=href.match(/\[\w+\]/ig);
				if (mykeytag && mykeytag.length>0) {
					for (var i=0;i<mykeytag.length;i++)
					{
						var mykey=mykeytag[i].replace(/\[/,"").replace(/\]/,"");
						if (this._info[mykey]) href=href.replace (mykeytag[i],this._info[mykey] );
						else  href=href.replace( mykeytag[i], FoxtrickHelper.OWNTEAMINFO[mykey] );
					}
				} 
				try { // add icons
					var div = doc.createElement ("div");  
					div.setAttribute("style","cursor:pointer; display:inline-block; width: 16; height: 16px; background: url('"+FoxtrickPrefs.getString(basepref+'.'+key+'.img')+"') 50% no-repeat;");
					div.setAttribute( "title", FoxtrickPrefs.getString(basepref+'.'+key+'.title') );
					div.setAttribute("onClick","window.open(\""+href+"\",\"_blank\");");
					div.innerHTML="<img src='chrome://foxtrick/content/resources/linkicons/transparent16.png'>";
					div.setAttribute('id','LinksCustomLinkID'+key);
					ownBoxBody.appendChild(doc.createTextNode(" "));
					ownBoxBody.appendChild(div); 
				} catch(e){dump('showLinks_adddiv: '+e);continue;}
			}
		}
		catch(e){dump("CustomLinks->showLinks->"+e+'\n');}
	},
	
	showEdit : function( doc , ownBoxBody, basepref) {
		try { 			
			// box
			var divED = doc.createElement ("div");
			divED.setAttribute("class", "alert");
			divED.setAttribute("id", "divEDId" );
			
			var table=doc.createElement ("table"); 
			table.width="120px";
			table.setAttribute('id','LinksCustomTableID');					 
			var tr0 = doc.createElement ("tr");
			var th = doc.createElement ("th");
			th.innerHTML =Foxtrickl10n.getString("foxtrick.linkscustom.addpersonallink" );
			th.setAttribute("colspan","5");
			tr0.appendChild(th);
			table.appendChild(tr0);
			
			// get custon links from pref
			var keys={};
			var array = FoxtrickPrefs._getElemNames( basepref );
			for (var nl=0;nl<array.length;nl++) {		
				var key=array[nl].replace(basepref+'\.',"");
				if (key.search(/\./)!=-1) {key=key.replace(/\..+/,"");keys[key]=key;}
				else continue; 
			}
			for (key in keys)  { 
				var href=FoxtrickPrefs.getString(basepref+'.'+key+'.href');
				var imgref=FoxtrickPrefs.getString(basepref+'.'+key+'.img');
				var title=FoxtrickPrefs.getString(basepref+'.'+key+'.title');
				if (href==null||imgref==null||title==null) {continue;}			
				
				var div = doc.createElement ("div"); 
				div.setAttribute("style","cursor:pointer; display:ikeyine-block; width: 16; height: 16px; background: url('"+FoxtrickPrefs.getString(basepref+'.'+key+'.img')+"') 50% no-repeat;");
				div.setAttribute( "title", FoxtrickPrefs.getString(basepref+'.'+key+'.href') );
				div.setAttribute("onClick","window.open(\""+FoxtrickPrefs.getString(basepref+'.'+key+'.href')+"\",\"_blank\");");
				div.innerHTML="<img src='chrome://foxtrick/content/resources/linkicons/transparent16.png'>";
				var tr1 = doc.createElement ("tr");
				var td1 = doc.createElement ("td");
				var td2 = doc.createElement ("td");
				td2.setAttribute("style","vertical-align:middle;");
				td2.width="100%";
				var tdiv = doc.createElement ("div"); 
				var title = doc.createTextNode(FoxtrickPrefs.getString(basepref+'.'+key+'.title').substr(0,8));
				var td3 = doc.createElement ("td");
				td3.setAttribute("style","vertical-align:middle;");
				td3.width="16px";
				var td4 = doc.createElement ("td");
				td4.setAttribute("style","vertical-align:middle;");
				td4.width="16px";
				var td5 = doc.createElement ("td");
				td5.setAttribute("style","vertical-align:middle;");
				td5.width="16px";
				
				td1.appendChild(div);
				tdiv.appendChild(title);
				td2.appendChild(tdiv);
				if (key.length>3) td5.appendChild(FoxtrickLinksGetExportLink(doc,div,basepref+'.'+key)); // prevent export of oldstyle keys
				td3.appendChild(FoxtrickLinksGetEditOldLink(doc,div,basepref+'.'+key));
				td4.appendChild(FoxtrickLinksGetDelLink(doc,div,basepref+'.'+key)); 
				tr1.appendChild(td1);
				tr1.appendChild(td2);
				tr1.appendChild(td5);
				tr1.appendChild(td3);
				tr1.appendChild(td4);
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

			divED.appendChild(table);	
			
			var table2=doc.createElement ("table"); 
			table2.setAttribute('id','LinksCustomTable2ID');					 
			
			var div = doc.createElement ("div"); 
			div.setAttribute("id", "inputImgDivID");
			div.setAttribute( "title", 'Tinntle') ;
			div.innerHTML="<img id='inputImgIDName' src='chrome://foxtrick/content/resources/linkicons/aiga.png'>";
			div.imgref='chrome://foxtrick/content/resources/linkicons/aiga.png';
			div.setAttribute("style","display:inline-block; width: 16; height: 16px; background: url('chrome://foxtrick/content/resources/linkicons/empty16.png') 50% no-repeat;");
				
			// load image button
			var loadIcon = doc.createElement ("a");	
			loadIcon.setAttribute("href", "javascript: void(0);");
			loadIcon.className="inner";
			loadIcon.addEventListener( "click", FoxtrickLinksLoadDialog, false );
			loadIcon.innerHTML = Foxtrickl10n.getString("foxtrick.linkscustom.selecticon");
			loadIcon.parentdoc = doc.defaultView;
			FoxtrickLinksLoadDialog.doc =doc;
			
			var tr1 = doc.createElement ("tr");
			var td1 = doc.createElement ("td");
			td1.width="20px";					
			var td2 = doc.createElement ("td");
			td2.setAttribute("style","vertical-align:middle;");
			td2.width="100%";					
			td1.appendChild(div);
			td2.appendChild(loadIcon);
			td2.setAttribute("colspan","4");
			tr1.appendChild(td1);
			tr1.appendChild(td2);
			table.appendChild(tr1);
				
			
			// titel edit field
			var inputTitle = doc.createElement ("input");
			inputTitle.setAttribute("name", "inputTitle");
			inputTitle.setAttribute("id", "inputTitleID");
			inputTitle.setAttribute("value", "Title");
			inputTitle.setAttribute('onfocus', 'if(this.value==\'Title\')this.value=\'\'');
			inputTitle.setAttribute("type", "text");
			inputTitle.setAttribute("maxlength", "100");
			inputTitle.setAttribute("style","width:100%;");
			var trn4 = doc.createElement ("tr");
			var tdn4 = doc.createElement ("td");
			var divn4 = doc.createElement ("div"); 
			divn4.appendChild(inputTitle);
			tdn4.appendChild(divn4);				
			tdn4.setAttribute("colspan","3");
			trn4.appendChild(tdn4);				
			table2.appendChild(trn4);

			// href edit field
			var inputHref = doc.createElement ("input");
			inputHref.setAttribute("name", "inputHref");
			inputHref.setAttribute("id", "inputHrefID");
			inputHref.setAttribute("value", "http://example.org");
			inputHref.setAttribute('onfocus', 'if(this.value==\'http://example.org\')this.value=\'http://\'');
			inputHref.setAttribute("type", "text");
			inputHref.setAttribute("maxlength", "200");
			inputHref.setAttribute("style","width:100%;");
			inputHref.className ="inner";
			var trn3 = doc.createElement ("tr");
			var tdn3 = doc.createElement ("td");
			var divn3 = doc.createElement ("div"); 
			divn3.appendChild(inputHref);
			tdn3.appendChild(divn3);				
			tdn3.setAttribute("colspan","3");
			trn3.appendChild(tdn3);				
			table2.appendChild(trn3);

			// tag select list
			var selectbox = doc.createElement("select"); 
			selectbox.setAttribute("title",Foxtrickl10n.getString("foxtrick.linkscustom.addtag" ));
			selectbox.setAttribute("id","ft_ownselecttagboxID");
			selectbox.setAttribute("style","width:100%;");
			selectbox.addEventListener('change',FoxtrickLinksCustomSelectBox_Select,false);
			FoxtrickLinksCustomSelectBox_Select.doc=doc;
			var option = doc.createElement("option");
			option.setAttribute("value","");
			option.innerHTML=Foxtrickl10n.getString("foxtrick.linkscustom.tags" );
			selectbox.appendChild(option);	
						
			for (var key in this._info) { 
				var option = doc.createElement("option");
				option.setAttribute("value",key);
				option.innerHTML='['+key+']';
				option.setAttribute("style","width:100%;");
				selectbox.appendChild(option);					
			}
			try {		
				for (var key in FoxtrickHelper.OWNTEAMINFO) { 
				var option = doc.createElement("option");
				option.setAttribute("value",key);
				option.innerHTML='['+key+']';
				option.setAttribute("style","width:100%;");
				selectbox.appendChild(option);					
				}
			} catch(e){dump('tags: ownteaminfo not available\n');}
			var trn2 = doc.createElement ("tr");
			var tdn2 = doc.createElement ("td");
			var divn2 = doc.createElement ("div"); 
			divn2.appendChild(selectbox);
			tdn2.appendChild(divn2);				
			tdn2.setAttribute("colspan","3");
			trn2.appendChild(tdn2);				
			table2.appendChild(trn2);
			
			
			// save link
			FoxtrickLinksCustom.saveMyLink.doc=doc;
			FoxtrickLinksCustom.saveMyLink.basepref=basepref;
			var saveLink = doc.createElement ("a");	
			saveLink.setAttribute("href", "javascript: void(0);");
			saveLink.setAttribute("name", "savelinkname");
			saveLink.addEventListener( "click", FoxtrickLinksCustom.saveMyLink, false );
			saveLink.innerHTML = Foxtrickl10n.getString("foxtrick.linkscustom.addlink" );
			var trn5 = doc.createElement ("tr");
			var tdn5 = doc.createElement ("td");
			tdn5.setAttribute("colspan","2");
			var divn5 = doc.createElement ("div"); 
			divn5.appendChild(saveLink);
			tdn5.appendChild(divn5);
			
			var helpdiv = doc.createElement("div");
			helpdiv.setAttribute("class","foxtrick" +	"Help float_right");
			helpdiv.setAttribute( "title", Foxtrickl10n.getString("foxtrick.linkscustom.help"));
		
			var helplink = doc.createElement ("a");	
			helplink.setAttribute("href", "javascript: alert('"+Foxtrickl10n.getString('foxtrick.linkscustom.helptext')+' \n'+Foxtrickl10n.getString('foxtrick.linkscustom.helptext2')+"');");
			helplink.innerHTML="<img src='chrome://foxtrick/content/resources/linkicons/transparent16.png'>";
			helpdiv.appendChild(helplink);
			
			var tdn5b = doc.createElement ("td");
			tdn5b.appendChild(helpdiv);
			
			trn5.appendChild(tdn5);				
			trn5.appendChild(tdn5b);				
			table2.appendChild(trn5);
			divED.appendChild(table2);

			ownBoxBody.appendChild(divED);
						
		}
		catch (e) {dump("LinksCustom->show_edit->"+e+'\n');}
	},
		
	delMyLink : function (evt) { 
		try {
			var doc = FoxtrickLinksCustom.delMyLink.doc;
			var Check = doc.defaultView.confirm(Foxtrickl10n.getString("foxtrick.linkscustom.confirmremove"));
			if (Check == false) return;

			var mylink = evt["target"]["mylink"];
			var baseprefnl = evt["target"]["baseprefnl"];
			FoxtrickPrefs.delListPref(baseprefnl+'.href'); 
			FoxtrickPrefs.delListPref(baseprefnl+'.title'); 
			FoxtrickPrefs.delListPref(baseprefnl+'.img'); 
			mylink.parentNode.parentNode.parentNode.removeChild(mylink.parentNode.parentNode);
		}
		catch (e) {dump("LinksCustom->edityLink->"+e+'\n');}
	},

	editOldLink : function (evt) { 
		try {
			var doc = FoxtrickLinksCustom.editOldLink.doc;
			
			var baseprefnl = evt["target"]["baseprefnl"];
			doc.getElementById("inputHrefID").value= FoxtrickPrefs.getString(baseprefnl+'.href');
			doc.getElementById("inputTitleID").value= FoxtrickPrefs.getString(baseprefnl+'.title');
			doc.getElementById("inputImgDivID").setAttribute("style","cursor:pointer; display:inline-block; width: 16; height: 16px; background: url('chrome://foxtrick/content/resources/linkicons/ownicons/"+FoxtrickPrefs.getString(baseprefnl+'.img')+"') 50% no-repeat;");
			doc.getElementById('inputImgIDName').src = FoxtrickPrefs.getString(baseprefnl+'.img');
		}
		catch (e) {dump("LinksCustom->editOldLink->"+e+'\n');}
	},

	Export : function (evt) { 
		try {
			var doc = FoxtrickLinksCustom.Export.doc;
			var baseprefnl = evt["target"]["baseprefnl"];		
			
			var locpath=Foxtrick.selectFileSave(doc.defaultView);
			if (locpath==null) {return;}
			var File = Components.classes["@mozilla.org/file/local;1"].
                     createInstance(Components.interfaces.nsILocalFile);
			File.initWithPath(locpath);
			
			var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
                         createInstance(Components.interfaces.nsIFileOutputStream);
			foStream.init(File, 0x02 | 0x08 | 0x10, 0666, 0);  // write, create, append
			var os = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                   .createInstance(Components.interfaces.nsIConverterOutputStream);
			os.init(foStream, "UTF-8", 0, 0x0000);

			var array = FoxtrickPrefs._getElemNames(baseprefnl); 
			for(var i = 0; i < array.length; i++) {
					var value=FoxtrickPrefs.getString(array[i]); 
					if (value!=null) os.writeString('user_pref("extensions.foxtrick.prefs.'+array[i]+'","'+value+'");\n');
					else { value=FoxtrickPrefs.getInt(array[i]);
						if (value==null) value=FoxtrickPrefs.getBool(array[i]);
						os.writeString('user_pref("extensions.foxtrick.prefs.'+array[i]+'",'+value+');\n');
						}
				}
			os.close();
			foStream.close(); 						
		}
		catch (e) {dump("LinksCustom->exportLink->"+e+'\n');}
	},

	saveMyLink : function (evt) { 
		try {
			var doc = FoxtrickLinksCustom.saveMyLink.doc;
			var uniquekey=(Math.random()+"").replace(/0\./,"");
			var baseprefnl = FoxtrickLinksCustom.saveMyLink.basepref+'.'+uniquekey;
			
			FoxtrickPrefs.setString(baseprefnl+'.href',doc.getElementById ("inputHrefID" ).value );
			FoxtrickPrefs.setString(baseprefnl+'.title',doc.getElementById ( "inputTitleID" ).value);
			FoxtrickPrefs.setString(baseprefnl+'.img',doc.getElementById('inputImgDivID').imgref);
				
			var div = doc.createElement ("div"); 
			div.setAttribute("style","cursor:pointer; display:inline-block; width: 16; height: 16px; background: url('"+FoxtrickPrefs.getString(baseprefnl+'.img')+"') 50% no-repeat;");
			div.setAttribute( "title", FoxtrickPrefs.getString(baseprefnl+'.href') );
			div.setAttribute("onClick","window.open(\""+FoxtrickPrefs.getString(baseprefnl+'.href')+"\",\"_blank\");");
			div.innerHTML="<img src='chrome://foxtrick/content/resources/linkicons/transparent16.png'>";
			
			var tr1 = doc.createElement ("tr");
			var td1 = doc.createElement ("td");
			var td2 = doc.createElement ("td");
			td2.setAttribute("style","vertical-align:middle;");
			var tdiv = doc.createElement ("div"); 
			tdiv.setAttribute("style","width:100%;");
			var title = doc.createTextNode(FoxtrickPrefs.getString(baseprefnl+'.title').substr(0,8));
			var td3 = doc.createElement ("td");
			td3.setAttribute("style","vertical-align:middle;");
			var td4 = doc.createElement ("td");
			td4.setAttribute("style","vertical-align:middle; margin-right:10px;");
			var td5 = doc.createElement ("td");
			td5.setAttribute("style","vertical-align:middle; margin-right:10px;");
				
			td1.appendChild(div);
			tdiv.appendChild(title);
			td2.appendChild(tdiv);
			td5.appendChild(FoxtrickLinksGetExportLink(doc,div,baseprefnl));
			td3.appendChild(FoxtrickLinksGetEditOldLink(doc,div,baseprefnl));
			td4.appendChild(FoxtrickLinksGetDelLink(doc,div,baseprefnl));
				
			tr1.appendChild(td1);
			tr1.appendChild(td2);
			tr1.appendChild(td5);
			tr1.appendChild(td3);
			tr1.appendChild(td4);
			
			var table=doc.getElementById("LinksCustomTableID");
			table.width="100px";
			table.insertBefore(tr1,table.lastChild.previousSibling);
		}
		catch(e) {dump("LinksCustom->saveMyLink->"+e+'\n');}
		},
};

function FoxtrickLinksGetDelLink (doc,mylink,baseprefnl) { 
	try {	
		var delLink = doc.createElement("div");
		delLink.setAttribute("class","foxtrick" +	"LeaveConf");
		delLink.setAttribute( "title", Foxtrickl10n.getString("foxtrick.linkscustom.remove"));
		delLink.addEventListener( "click", FoxtrickLinksCustom.delMyLink, false );
		delLink.baseprefnl = baseprefnl;
		delLink.mylink = mylink; 
		FoxtrickLinksCustom.delMyLink.doc=doc;
		return delLink;
	} 
	catch(e) {dump("LinksCustom->FoxtrickLinksGetDelLink->"+e+'\n');}		
}



function FoxtrickLinksGetEditOldLink (doc,mylink,baseprefnl) { 
	try {	
		var editOld = doc.createElement("div");
		editOld.setAttribute("class","foxtrick" +	"Copy float_right");
		editOld.setAttribute( "title", Foxtrickl10n.getString("foxtrick.linkscustom.copy"));
		editOld.addEventListener( "click", FoxtrickLinksCustom.editOldLink, false );
		editOld.baseprefnl = baseprefnl;
		editOld.mylink = mylink; 
		FoxtrickLinksCustom.editOldLink.doc=doc;
		return editOld;
	} 
	catch(e) {dump("LinksCustom->FoxtrickLinksGetEditOldLink->"+e+'\n');}		
}

function FoxtrickLinksGetExportLink (doc,mylink,baseprefnl) { 
	try {	
		var ExportLink = doc.createElement("div");
		ExportLink.setAttribute("class","foxtrick" +	"Export float_right");
		ExportLink.setAttribute( "title", Foxtrickl10n.getString("foxtrick.linkscustom.export"));
		ExportLink.addEventListener( "click", FoxtrickLinksCustom.Export, false );
		ExportLink.baseprefnl = baseprefnl;
		ExportLink.mylink = mylink; 
		FoxtrickLinksCustom.Export.doc=doc;
		return ExportLink;
	} 
	catch(e) {dump("LinksCustom->FoxtrickLinksGetExpostLink->"+e+'\n');}		
}

function FoxtrickLinksLoadDialog (evt)
	{	
		var path="file://"+Foxtrick.selectFile(evt["target"]["parentdoc"]);
		var doc=FoxtrickLinksLoadDialog.doc;
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
			var image=generateDataURI(pngFile); 
			if (image.length>2000) {Foxtrick.alert("Image too large.");return;}
			var div=doc.getElementById('inputImgDivID');
			div.imgref=image;
			div.setAttribute("style","cursor:pointer; display:inline-block; width: 16; height: 16px; background: url('"+div.imgref+"') 50% no-repeat;");
			div.innerHTML="<img src='chrome://foxtrick/content/resources/linkicons/transparent16.png'>";
			 			
 		}
		catch(e) {dump('FoxtrickLinksLoadDialog->'+e);Foxtrick.alert(aFileURL+" not found");return;}
}

	
	function FoxtrickLinksCustomHeaderClick(evt) {
		try { 
			var module=FoxtrickLinksCustomHeaderClick.module; 
			var doc=FoxtrickLinksCustomHeaderClick.doc;
			var ownBoxBody=FoxtrickLinksCustomHeaderClick.ownBoxBody;
			var basepref=FoxtrickLinksCustomHeaderClick.basepref;
			FoxtrickPrefs.setBool( "module." + module.MODULE_NAME + ".enabled", !Foxtrick.isModuleEnabled(module) );
			
			if (Foxtrick.isModuleEnabled(module)) { 
				var keys={};
				var array = FoxtrickPrefs._getElemNames( basepref );
				for (var nl=0;nl<array.length;nl++) {		
					var key=array[nl].replace(basepref+'\.',"");
					if (key.search(/\./)!=-1) {key = key.replace(/\..+/,""); keys[key] = key;}
					else continue; 
				}
				for (key in keys)  { 
					var href=FoxtrickPrefs.getString(basepref+'.'+key+'.href');
					var imgref=FoxtrickPrefs.getString(basepref+'.'+key+'.img');
					var title=FoxtrickPrefs.getString(basepref+'.'+key+'.title');
					if (href==null||imgref==null||title==null) {continue; }				
					var mylink=doc.getElementById('LinksCustomLinkID'+key);
					mylink.parentNode.removeChild(mylink);
				}
				FoxtrickLinksCustom.showEdit(doc,ownBoxBody,basepref);							
			}
			else { 		
				var editbox=doc.getElementById("divEDId");
				editbox.parentNode.removeChild(editbox);
				FoxtrickLinksCustom.showLinks(doc,ownBoxBody,basepref);
			}
		}
		catch(e) { dump("LinksCustom->HeaderClick->"+e+'\n'); }
	}
	
	function FoxtrickLinksCustomSelectBox_Select(evt) {
	try {
		var doc=FoxtrickLinksCustomSelectBox_Select.doc;
		var value =doc.getElementById ( "inputHrefID" ).value;
		if (value.search(/\?/)==-1) value+="\?"; else  value+="&";
		value+=evt["target"]["value"]+'=['+evt["target"]["value"]+']';
		doc.getElementById ( "inputHrefID" ).value=value;
	} catch (e) {dump("FoxtrickLinksCustomSelectBox_Select: "+e+'\n');}
}


function generateDataURI(file) {
try { 
  var contentType = Components.classes["@mozilla.org/mime;1"]
                              .getService(Components.interfaces.nsIMIMEService)
                              .getTypeFromFile(file);
  var inputStream = Components.classes["@mozilla.org/network/file-input-stream;1"]
                              .createInstance(Components.interfaces.nsIFileInputStream);
  inputStream.init(file, 0x01, 0600, 0);
  var stream = Components.classes["@mozilla.org/binaryinputstream;1"]
                         .createInstance(Components.interfaces.nsIBinaryInputStream);
  stream.setInputStream(inputStream);
  var encoded = btoa(stream.readBytes(stream.available()));
  return "data:" + contentType + ";base64," + encoded;
} catch (e) {dump("FoxtrickLinks generateDataURI: "+e+'\n');}
}
