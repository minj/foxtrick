/**
 * links-box.js
 * Utilities for adding link-boxes
 * @author convinced
 */

if (!Foxtrick) var Foxtrick = {};
if (!Foxtrick.util) Foxtrick.util = {};

Foxtrick.util.links = {
	add : function(doc, ownBoxBody, pagemodule, info) {
		try {
			Foxtrick.util.links._info=info;

			var basepref = "module.LinksCustom." + pagemodule;

			if (ownBoxBody==null) {
				ownBoxBody = doc.createElement("div");
				var ownBoxBodyId = "foxtrick_links_content";
				var header = Foxtrickl10n.getString("foxtrick.links.boxheader");
				ownBoxBody.id = ownBoxBodyId;

				var box = Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, -20);
				box.id = "ft-links-box";
			}

			var expanded = false;
			var headerClick = function() {
				try {
					expanded = !expanded;
					// remove old
					var editbox=doc.getElementById("divEDId");
					if (editbox) editbox.parentNode.removeChild(editbox);
					var keys={};
					var array = FoxtrickPrefs.getAllKeysOfBranch(basepref);
					for (var nl=0;nl<array.length;nl++) {
						var key=array[nl].replace(basepref+'\.',"");
						if (key.search(/\./)!=-1) {
							key = key.replace(/\..+/,"");
							keys[key] = key;
						}
						else
							continue;
					}
					for (key in keys) {
						var href=FoxtrickPrefs.getString(basepref+'.'+key+'.href');
						var imgref=FoxtrickPrefs.getString(basepref+'.'+key+'.img');
						var title=FoxtrickPrefs.getString(basepref+'.'+key+'.title');
						if (href==null||imgref==null||title==null)
							continue;
						var mylink=doc.getElementById('LinksCustomLinkID'+key);
						if (mylink)
							mylink.parentNode.removeChild(mylink);
					}

					if (expanded) {
						Foxtrick.util.links.showEdit(doc,ownBoxBody,basepref);
					}
					else {
						Foxtrick.util.links.showLinks(doc,ownBoxBody,basepref);
					}
				}
				catch(e) {
					Foxtrick.log(e);
				}
			};

			var alldivs = doc.getElementsByTagName('div');
			for (var j = 0; j < alldivs.length; j++) {
				if (alldivs[j].className=="sidebarBox" ) {
					var header = alldivs[j].getElementsByTagName("h2")[0];
					if (header.textContent == Foxtrickl10n.getString("foxtrick.links.boxheader")) {
						var pn=header.parentNode;
						var hh=pn.removeChild(header);
						var div = doc.createElement("div");
						div.appendChild(hh);
						div.title = Foxtrickl10n.getString("foxtrick.linkscustom.addpersonallink");
						div.addEventListener("click", headerClick, false);
						ownBoxBody.setAttribute("basepref", basepref);
						pn.insertBefore(div,pn.firstChild);
						break;
					}
				}
			}

			var all_links=ownBoxBody.getElementsByTagName('a');
			for (var i=0;i<all_links.length;++i) {
				var key = all_links[i].getAttribute('key');
				var module_name = all_links[i].getAttribute('module');
				if (key && module_name) {
					var delLink = doc.createElement("span");
					delLink.className = "ft_actionicon foxtrickRemove";
					delLink.title = Foxtrickl10n.getString("foxtrick.linkscustom.remove");
					delLink.addEventListener("click", Foxtrick.util.links.delStdLink, false);
					var img = doc.createElement("img");
					img.src = "/Img/Icons/transparent.gif";
					img.height = "16";
					img.width = "16";
					delLink.appendChild(img);
					ownBoxBody.insertBefore(delLink,all_links[i].nextSibling);
				}
			}

			Foxtrick.util.links.showLinks(doc, ownBoxBody, basepref);
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	showLinks : function(doc,ownBoxBody,basepref){
		try {
			var ownBoxId = "ft-links-box";
			var div=doc.getElementById(ownBoxId).firstChild;
			div.className = "boxHead ft-expander-unexpanded";
			if (Foxtrick.util.layout.isRtl(doc))
				div.className = "boxHead ft-expander-unexpanded_rtl";

			var foxtrickRemove = ownBoxBody.getElementsByClassName('foxtrickRemove');
			for (var i=0; i<foxtrickRemove.length; ++i) {
				Foxtrick.toggleClass(foxtrickRemove[i], "hidden");
			}

			// get custon links from pref
			var keys={};
			var array = FoxtrickPrefs.getAllKeysOfBranch( basepref );
			for (var nl=0;nl<array.length;nl++) {
				var key=array[nl].replace(basepref+'\.',"");
				if (key.search(/\./)!=-1) {
					key=key.replace(/\..+/,"");
					keys[key]=key;
				}
				else
					continue;
			}
			for (key in keys)  {
				var href=FoxtrickPrefs.getString(basepref+'.'+key+'.href');
				var imgref=FoxtrickPrefs.getString(basepref+'.'+key+'.img');
				var title=FoxtrickPrefs.getString(basepref+'.'+key+'.title');
				if (href==null||imgref==null||title==null) {
					Foxtrick.dump('customLink '+key+' incomplete\n');
					continue;
				}
				// replace tags

				var mykeytag=href.match(/\[\w+\]/ig);
				if (mykeytag && mykeytag.length>0) {
					for (var i=0;i<mykeytag.length;i++) {
						var mykey=mykeytag[i].replace(/\[/,"").replace(/\]/,"");
						if (Foxtrick.util.links._info[mykey])
							href=href.replace(mykeytag[i], Foxtrick.util.links._info[mykey]);
						else {
							var ownteam = {};
							for (var key in Foxtrick.util.module.get("Core").getSelfTeamInfo())
								ownteam['own'+key] = Foxtrick.util.module.get("Core").getSelfTeamInfo()[key];
							href = href.replace(mykeytag[i], ownteam[mykey]);
						}
					}
				}
				try { // add icons
					var a = doc.createElement("a");
					a.id = 'LinksCustomLinkID'+key;
					a.className = "inner";
					a.title = FoxtrickPrefs.getString(basepref+'.'+key+'.title');
					a.href = href;
					a.setAttribute("target", "_blank");
					var img = doc.createElement("img");
					img.style.width = img.style.height = "16px";
					img.src = FoxtrickPrefs.getString(basepref+'.'+key+'.img');
					img.alt = FoxtrickPrefs.getString(basepref+'.'+key+'.title');
					a.appendChild(img);
					ownBoxBody.appendChild(a);
				}
				catch(e) {
					Foxtrick.log(e);
					continue;
				}
			}
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	showEdit : function( doc , ownBoxBody, basepref) {
		try {
			// box
			var ownBoxId = "ft-links-box";
			var div=doc.getElementById(ownBoxId).firstChild;
			div.setAttribute("class","boxHead ft-expander-expanded");
			if (Foxtrick.util.layout.isRtl(doc)) div.setAttribute("class","boxHead  ft-expander-expanded_rtl");

			var foxtrickRemove = ownBoxBody.getElementsByClassName('foxtrickRemove');
			for (var i=0; i<foxtrickRemove.length; ++i) {
				Foxtrick.toggleClass(foxtrickRemove[i], "hidden");
			}

			var divED = doc.createElement("div");
			divED.id = "divEDId";
			divED.className = "ft-note";

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
			var array = FoxtrickPrefs.getAllKeysOfBranch( basepref );
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

				var a = doc.createElement("a");
				a.title = FoxtrickPrefs.getString(basepref+'.'+key+'.title');
				a.href = FoxtrickPrefs.getString(basepref+'.'+key+'.href');
				a.setAttribute("target", "_blank");
				var img = doc.createElement("img");
				img.className = "ft-links-custom-icon-edit";
				img.src = FoxtrickPrefs.getString(basepref+'.'+key+'.img');
				img.alt = FoxtrickPrefs.getString(basepref+'.'+key+'.title');
				a.appendChild(img);

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

				td1.appendChild(a);
				tdiv.appendChild(title);
				td2.appendChild(tdiv);
				td3.appendChild(Foxtrick.util.links.GetEditOldLink(doc,a,basepref+'.'+key));
				td4.appendChild(Foxtrick.util.links.GetDelLink(doc,a,basepref+'.'+key));
				tr1.appendChild(td1);
				tr1.appendChild(td2);
				tr1.appendChild(td5);
				tr1.appendChild(td3);
				tr1.appendChild(td4);
				table.appendChild(tr1);
			}

			divED.appendChild(table);

			// load image
			var div = doc.createElement("div");
			div.id = "inputImgDivID";
			div.className = "ft_icon foxtrickBrowse inner";
			var img = doc.createElement("img");
			img.src = "/Img/Icons/transparent.gif";
			img.height = "16";
			img.width = "16";
			div.appendChild(img);
			divED.appendChild(div);
			var div = doc.createElement("div");
			divED.appendChild(doc.createTextNode(' '+Foxtrickl10n.getString("foxtrick.linkscustom.selecticon")));
			divED.appendChild(div);

			var div = doc.createElement("div");
			div.id = "inputDiv";
			divED.appendChild(div);
			Foxtrick.util.links.LoadDialog(doc, divED);

			// titel edit field
			var table2=doc.createElement ("table");
			table2.setAttribute('id','LinksCustomTable2ID');
			var inputTitle = doc.createElement ("input");
			inputTitle.setAttribute("name", "inputTitle");
			inputTitle.setAttribute("id", "inputTitleID");
			inputTitle.setAttribute("value", "Title");
			inputTitle.setAttribute('onfocus', 'if(Foxtrick.util.links.value==\'Title\')Foxtrick.util.links.value=\'\'');
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
			inputHref.setAttribute('onfocus', 'if(Foxtrick.util.links.value==\'http://example.org\')Foxtrick.util.links.value=\'http://\'');
			inputHref.setAttribute("type", "text");
			inputHref.setAttribute("maxlength", "5000");
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
			Foxtrick.listen(selectbox, 'change', Foxtrick.util.links.SelectBox_Select, false);
			var option = doc.createElement("option");
			option.setAttribute("value","");
			option.innerHTML=Foxtrickl10n.getString("foxtrick.linkscustom.tags");
			selectbox.appendChild(option);

			for (var key in Foxtrick.util.links._info) {
				var option = doc.createElement("option");
				option.setAttribute("value",key);
				option.innerHTML='['+key+']';
				option.setAttribute("style","width:100%;");
				selectbox.appendChild(option);
			}
			try {
				var ownteam = {};
				for (var key in Foxtrick.util.module.get("Core").getSelfTeamInfo())
					ownteam['own'+key] = Foxtrick.util.module.get("Core").getSelfTeamInfo()[key];
				for (var key in ownteam) {
					var option = doc.createElement("option");
					option.setAttribute("value",key);
					option.innerHTML='['+key+']';
					option.setAttribute("style","width:100%;");
					selectbox.appendChild(option);
					}
			}
			catch (e) {
				Foxtrick.dump('tags: ownteaminfo not available\n');
			}
			var trn2 = doc.createElement ("tr");
			var tdn2 = doc.createElement ("td");
			var divn2 = doc.createElement ("div");
			divn2.appendChild(selectbox);
			tdn2.appendChild(divn2);
			tdn2.setAttribute("colspan","3");
			trn2.appendChild(tdn2);
			table2.appendChild(trn2);


			// save link
			var saveLink = doc.createElement ("a");
			saveLink.setAttribute("href", "javascript: void(0);");
			saveLink.setAttribute("name", "savelinkname");
			saveLink.setAttribute("basepref", basepref);
			Foxtrick.listen(saveLink, "click", Foxtrick.util.links.saveMyLink, false );
			saveLink.innerHTML = Foxtrickl10n.getString("foxtrick.linkscustom.addlink" );
			var trn5 = doc.createElement ("tr");
			var tdn5 = doc.createElement ("td");
			tdn5.setAttribute("colspan","2");
			var divn5 = doc.createElement ("div");
			divn5.appendChild(saveLink);
			tdn5.appendChild(divn5);

			var helplink = doc.createElement("a");
			helplink.className = "ft_actionicon foxtrickHelp float_right";
			helplink.title = Foxtrickl10n.getString("foxtrick.linkscustom.help");
			helplink.href = "javascript: alert('"+Foxtrickl10n.getString('foxtrick.linkscustom.helptext')+' \n'+Foxtrickl10n.getString('foxtrick.linkscustom.helptext2')+"');";

			var tdn5b = doc.createElement ("td");
			tdn5b.appendChild(helplink);

			trn5.appendChild(tdn5);
			trn5.appendChild(tdn5b);
			table2.appendChild(trn5);
			divED.appendChild(table2);

			ownBoxBody.appendChild(divED);

		}
		catch (e) {
			Foxtrick.log(e);
		}
	},


	delStdLink : function (evt) {
		try {
			var doc = evt.target.ownerDocument;

			var key = evt["target"].previousSibling.getAttribute("key");
			var module_name = evt["target"].previousSibling.getAttribute("module");
			var par=evt["target"].parentNode;
			par.removeChild(evt["target"].previousSibling);
			par.removeChild(evt["target"]);
			FoxtrickPrefs.setBool( "module." + module_name+'.'+key + ".enabled",false);
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	delMyLink : function (evt) {
		try {
			var doc = evt.target.ownerDocument;
			var Check = doc.defaultView.confirm(Foxtrickl10n.getString("foxtrick.linkscustom.confirmremove"));
			if (Check == false) return;

			var mylink = evt["target"]["mylink"];
			var baseprefnl = evt["target"]["baseprefnl"];
			FoxtrickPrefs.deleteValue(baseprefnl+'.href');
			FoxtrickPrefs.deleteValue(baseprefnl+'.title');
			FoxtrickPrefs.deleteValue(baseprefnl+'.img');
			mylink.parentNode.parentNode.parentNode.removeChild(mylink.parentNode.parentNode);
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},


	editOldLink : function (evt) {
		try {
			var doc = evt.target.ownerDocument;
			var baseprefnl = evt["target"]["baseprefnl"];
			doc.getElementById("inputHrefID").value= FoxtrickPrefs.getString(baseprefnl+'.href');
			doc.getElementById("inputTitleID").value= FoxtrickPrefs.getString(baseprefnl+'.title');
			doc.getElementById("inputImgDivID").style.backgroundImage = "url('" + FoxtrickPrefs.getString(baseprefnl+'.img') +"')";
			doc.getElementById("inputImgDivID").imgref=FoxtrickPrefs.getString(baseprefnl+'.img');
			doc.getElementById('inputImgIDName').src = FoxtrickPrefs.getString(baseprefnl+'.img');
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},


	saveMyLink : function (evt) {
		try {
			var doc = evt.target.ownerDocument;
			var uniquekey=(Math.random()+"").replace(/0\./,"");
			var ownBoxBody = doc.getElementById('foxtrick_links_content');
			var basepref = ownBoxBody.getAttribute("basepref");
			var baseprefnl = basepref+'.'+uniquekey;

			FoxtrickPrefs.setString(baseprefnl+'.href',doc.getElementById ("inputHrefID" ).value );
			FoxtrickPrefs.setString(baseprefnl+'.title',doc.getElementById ( "inputTitleID" ).value);
			FoxtrickPrefs.setString(baseprefnl+'.img',doc.getElementById('inputImgDivID').imgref);

			var a = doc.createElement("a");
			a.title = FoxtrickPrefs.getString(baseprefnl+'.title');
			a.href = FoxtrickPrefs.getString(baseprefnl+'.href');
			a.setAttribute("target", "_blank");
			var img = doc.createElement("img");
			img.className = "ft-links-custom-icon-edit";
			img.src = FoxtrickPrefs.getString(baseprefnl+'.img');
			img.alt = FoxtrickPrefs.getString(baseprefnl+'.title');
			a.appendChild(img);

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

			td1.appendChild(a);
			tdiv.appendChild(title);
			td2.appendChild(tdiv);
			td3.appendChild(Foxtrick.util.links.GetEditOldLink(doc,a,baseprefnl));
			td4.appendChild(Foxtrick.util.links.GetDelLink(doc,a,baseprefnl));

			tr1.appendChild(td1);
			tr1.appendChild(td2);
			tr1.appendChild(td5);
			tr1.appendChild(td3);
			tr1.appendChild(td4);

			var table=doc.getElementById("LinksCustomTableID");
			table.width="100px";
			table.insertBefore(tr1,table.lastChild.previousSibling);
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	GetDelLink  : function(doc,mylink,baseprefnl) {
		try {
			var delLink = doc.createElement("div");
			delLink.setAttribute("class","ft_actionicon foxtrickRemove");
			delLink.setAttribute( "title", Foxtrickl10n.getString("foxtrick.linkscustom.remove"));
			Foxtrick.listen(delLink, "click", Foxtrick.util.links.delMyLink, false );
			delLink.baseprefnl = baseprefnl;
			delLink.mylink = mylink;
			return delLink;
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},


	GetEditOldLink  : function(doc,mylink,baseprefnl) {
		try {
			var editOld = doc.createElement("div");
			editOld.setAttribute("class","ft_actionicon foxtrickCopy float_right");
			editOld.setAttribute( "title", Foxtrickl10n.getString("foxtrick.linkscustom.copy"));
			Foxtrick.listen(editOld, "click", Foxtrick.util.links.editOldLink, false );
			editOld.baseprefnl = baseprefnl;
			editOld.mylink = mylink;
			return editOld;
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	LoadDialog  : function(doc, divED)
	{		// load image select
		var form = Foxtrick.filePickerForDataUrl(doc, function(url) {
			if (url.length>5000) {Foxtrick.alert("Image too large.");return;}
			var div=doc.getElementById('inputImgDivID');
			div.imgref=url;
			div.style.backgroundImage = "url('" + url + "')";
		});
		divED.appendChild(form);
	},

	SelectBox_Select : function(evt) {
		try {
			var doc = evt.target.ownerDocument;
			var value = doc.getElementById ( "inputHrefID" ).value;
			if (value.search(/\?/)==-1) value+="\?"; else  value+="&";
			value+=evt["target"]["value"]+'=['+evt["target"]["value"]+']';
			doc.getElementById ( "inputHrefID" ).value=value;
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	getLinkOptions : function(module, linktype, extra_options) {
		try {
			var options = [];
			var country_options = [];

			for (var key in Foxtrick.util.module.get("Links").stats) {
				var stat = Foxtrick.util.module.get("Links").stats[key];
				if (stat[linktype]!=null) {
					var title = stat["title"];

					var filters = stat[linktype]["filters"];
					var countries='';

					for (var i=0; i<filters.length; i++) {
						var filtertype = filters[i];
						if (filtertype == "countryid"
							&& stat["countryidranges"]
							&& stat["countryidranges"].length!=0) {

								var k=0,range;
								while (range = stat["countryidranges"][k++]) {
									var r0=String(range[0]);
									if (k==1) {
										if (r0.length==2) r0='0'+r0;
										else if (r0.length==1) r0='00'+r0;
									}
									if (String(range[0])!=String(range[1])) countries += '[' + r0+'-'+ range[1]+ ']';
									else countries += '[' + r0+']';
									if (stat["countryidranges"][k]) 	countries+=',';
								}
						}
					}
					for (var i=0; i<filters.length; i++) {
						var filtertype = filters[i];
						if (filtertype == "owncountryid"
							&& stat["owncountryidranges"]
							&& stat["owncountryidranges"].length!=0) {
							var k=0,range;
							while (range = stat["owncountryidranges"][k++]) {
								var r0=String(range[0]);
								if (k==1) {
									if (r0.length==2) r0='0'+r0;
									else if (r0.length==1) r0='00'+r0;
								}
								if (String(range[0])!=String(range[1])) countries += '[' + r0+'-'+ range[1]+ ']';
								else countries += '[' + r0+']';
								if (stat["owncountryidranges"][k]) 	countries+=',';
							}
						}
					}
					if (countries!='')
						country_options.push({"key":key,"title":countries+' : '+title});
					else
						options.push({"key":key,"title":title});
				}
			}
			var keysortfunction = function(a, b) {
				return a["title"].localeCompare(b["title"]);
			}
			options.sort(keysortfunction);
			country_options.sort(keysortfunction);
			var i=0,country_option;
			while (country_option = country_options[i++]) {
				options.push({
					"key":country_option.key,
					"title":country_option.title.replace(/^\[0+/,'[')
				});
			}
			for (var key in extra_options) {
				options.push({
					"key":key,
					"title":extra_options[key]
				});
			}
			return options;
		}
		catch (e) {
			Foxtrick.log(e);
			return null;
		}
	},

	getLinkOptionsArray : function(module, linktypes) {
		try {
			var options = [];
			var country_options = [];
			for (var linktype=0; linktype< linktypes.length; linktype++) {
				for (var key in Foxtrick.util.module.get("Links").stats) {
					var stat = Foxtrick.util.module.get("Links").stats[key];
					if (stat[linktypes[linktype]]!=null) {
						var title = stat["title"];
						var filters = stat[linktypes[linktype]]["filters"];
						var countries='';
						for (var i=0; i<filters.length; i++) {
							var filtertype = filters[i];
							if (filtertype == "nationality")
								if (stat["nationalityranges"] && stat["nationalityranges"].length!=0) {
									var k=0,range;
									while (range = stat["nationalityranges"][k++]) {
										var r0=String(range[0]);
										if (countries=='') {
											if (r0.length==2) r0='0'+r0;
											else if (r0.length==1) r0='00'+r0;
										}
										if (String(range[0])!=String(range[1])) countries += '[' + r0+'-'+ range[1]+ ']';
										else countries += '[' + r0+']';
										if (stat["nationalityranges"][k]) 	countries+=',';
									}
								}
							}
							if (filtertype == "countryid"
								&& stat["countryidranges"]
								&& stat["countryidranges"].length!=0) {
								var k=0,range;
								while (range = stat["countryidranges"][k++]) {
									var r0=String(range[0]);
									if (countries=='') {
										if (r0.length==2) r0='0'+r0;
										else if (r0.length==1) r0='00'+r0;
									}
									if (String(range[0])!=String(range[1])) countries += '[' + r0+'-'+ range[1]+ ']';
									else countries += '[' + r0+']';
									if (stat["countryidranges"][k]) 	countries+=',';
								}
							}
						var has_entry=false;
						for (var i = 0; i < options.length; i++)
							if (options[i]["key"]==key)
								has_entry=true;
						if (!has_entry) {
							if (countries!='')
								country_options.push({"key":key,"title":countries+' : '+title});
							else
								options.push({"key":key,"title":title});
						}
					}
				}
			}
			var keysortfunction = function(a, b) {
				return a["title"].localeCompare(b["title"]);
			}
			options.sort(keysortfunction);
			options.sort(keysortfunction);
			var i=0,country_option;
			while (country_option = country_options[i++]) {
				options.push({
					"key":country_option.key,
					"title":country_option.title.replace(/^\[0+/,'[')
				});
			}
			return options;
		}
		catch (e) {
			Foxtrick.log(e);
			return null;
		}
	},

	getOptionsHtml : function(doc, module, array, linkType, extraOptions) {
		var options = array ? Foxtrick.util.links.getLinkOptionsArray(module, linkType)
			: Foxtrick.util.links.getLinkOptions(module, linkType, extraOptions);
		var list = doc.createElement("ul");
		for (var i in options) {
			var item = doc.createElement("li");
			list.appendChild(item);

			var label = doc.createElement("label");
			item.appendChild(label);

			var check = doc.createElement("input");
			check.type = "checkbox";
			check.setAttribute("module", module.MODULE_NAME);
			check.setAttribute("option", options[i]["key"]);
			label.appendChild(check);
			label.appendChild(doc.createTextNode(options[i]["title"]));
		}
		return list;
	}
};
