'use strict';
/**
 * links-box.js
 * Utilities for adding link-boxes
 * @author convinced
 */

if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.util)
	Foxtrick.util = {};

Foxtrick.util.links = {
	add: function(doc, ownBoxBody, pagemodule, info, isNewSidebar) {
		try {
			Foxtrick.util.links._info = info;
			var ownTeam = Foxtrick.modules['Core'].getSelfTeamInfo(), ownInfo = {}, key;
			for (key in ownTeam)
				ownInfo['own' + key] = ownTeam[key];

			Foxtrick.util.links._ownInfo = ownInfo;

			var basepref = 'module.LinksCustom.' + pagemodule;

			if (ownBoxBody == null) {
				ownBoxBody =
					Foxtrick.createFeaturedElement(doc, Foxtrick.modules[pagemodule],'div');
				var ownBoxBodyId = 'foxtrick_links_content';
				var header = Foxtrick.L10n.getString('links.boxheader');
				ownBoxBody.id = ownBoxBodyId;

				var box = Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, -20);
				box.id = 'ft-links-box';
			}

			var expanded = false;
			var headerClick = function() {
				try {
					expanded = !expanded;
					// remove old
					var editbox = doc.getElementById('divEDId');
					if (editbox)
						editbox.parentNode.removeChild(editbox);
					var keys = {};
					var array = Foxtrick.Prefs.getAllKeysOfBranch(basepref);
					// format: module.LinksCustom.<module>.<random>.<title|href|img>
					for (var nl = 0; nl < array.length; nl++) {
						var key = array[nl].replace(basepref + '.', '');
						if (key.search(/\./) != -1) {
							key = key.replace(/\..+/, '');
							keys[key] = key;
						}
						else
							continue;
					}
					var key;
					for (key in keys) {
						var href = Foxtrick.Prefs.getString(basepref + '.' + key + '.href');
						var imgref = Foxtrick.Prefs.getString(basepref + '.' + key + '.img');
						var title = Foxtrick.Prefs.getString(basepref + '.' + key + '.title');
						if (href == null || imgref == null || title == null)
							continue;
						var mylink = doc.getElementById('LinksCustomLinkID' + key);
						if (mylink)
							mylink.parentNode.removeChild(mylink);
					}

					if (expanded) {
						Foxtrick.util.links.showEdit(doc, ownBoxBody, basepref);
					}
					else {
						Foxtrick.util.links.showLinks(doc, ownBoxBody, basepref);
					}
				}
				catch (e) {
					Foxtrick.log(e);
				}
			};

			Foxtrick.stopListenToChange(doc);
			var alldivs = doc.querySelectorAll(isNewSidebar ? 'div.ft-newSidebarBox' :
											   'div.sidebarBox');
			for (var j = 0; j < alldivs.length; j++) {
				var header = alldivs[j].getElementsByTagName(isNewSidebar ? 'h4' : 'h2')[0];
				if (header.textContent == Foxtrick.L10n.getString('links.boxheader')) {
					var hh = header.cloneNode(true);
					var div = doc.createElement('div');
					div.appendChild(hh);
					div.title = Foxtrick.L10n.getString('links.custom.addpersonallink');
					Foxtrick.onClick(div, headerClick);

					ownBoxBody.setAttribute('basepref', basepref);
					var pn = header.parentNode;
					pn.replaceChild(div, header);
					break;
				}
			}

			var all_links = ownBoxBody.getElementsByTagName('a');
			all_links = Foxtrick.map(function(a) { return a; }, all_links);
			for (var i = 0; i < all_links.length; ++i) {
				var linkContainer = doc.createElement('span');
				Foxtrick.addClass(linkContainer, 'ft-link-span');
				linkContainer.appendChild(all_links[i]);
				var key = all_links[i].getAttribute('key');
				var module_name = all_links[i].getAttribute('module');
				if (key && module_name) {
					var delLink = doc.createElement('span');
					delLink.className = 'ft_actionicon foxtrickRemove';
					delLink.title = Foxtrick.L10n.getString('links.custom.remove');
					Foxtrick.onClick(delLink, Foxtrick.util.links.delStdLink);
					var img = doc.createElement('img');
					img.src = '/Img/Icons/transparent.gif';
					img.height = '16';
					img.width = '16';
					delLink.appendChild(img);
					linkContainer.appendChild(delLink);
				}
				ownBoxBody.appendChild(linkContainer);
			}
			Foxtrick.startListenToChange(doc);

			Foxtrick.util.links.showLinks(doc, ownBoxBody, basepref);
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	showLinks: function(doc, ownBoxBody, basepref) {
		try {
			var ownBoxId = 'ft-links-box';
			var div = doc.getElementById(ownBoxId).firstChild;
			Foxtrick.removeClass(div, 'ft-expander-unexpanded');
			Foxtrick.addClass(div, 'ft-expander-expanded');


			var foxtrickRemove = ownBoxBody.getElementsByClassName('foxtrickRemove');
			for (var i = 0; i < foxtrickRemove.length; ++i) {
				Foxtrick.toggleClass(foxtrickRemove[i], 'hidden');
			}

			// get custon links from pref
			var keys = {};
			var array = Foxtrick.Prefs.getAllKeysOfBranch(basepref);
			// format: module.LinksCustom.<module>.<random>.<title|href|img>
			for (var nl = 0; nl < array.length; nl++) {
				var key = array[nl].replace(basepref + '.', '');
				if (key.search(/\./) != -1) {
					key = key.replace(/\..+/, '');
					keys[key] = key;
				}
				else
					continue;
			}
			var key;
			for (key in keys) {
				var href = Foxtrick.Prefs.getString(basepref + '.' + key + '.href');
				var imgref = Foxtrick.Prefs.getString(basepref + '.' + key + '.img');
				var title = Foxtrick.Prefs.getString(basepref + '.' + key + '.title');
				if (href == null || imgref == null || title == null) {
					Foxtrick.dump('customLink ' + key + ' incomplete\n');
					continue;
				}
				// replace tags

				var mykeytag = href.match(/\[\w+\]/g);
				if (mykeytag && mykeytag.length > 0) {
					for (var i = 0; i < mykeytag.length; i++) {
						var mykey = mykeytag[i].replace(/[[\]]/g, '');
						if (Foxtrick.util.links._info[mykey])
							href = href.replace(mykeytag[i], Foxtrick.util.links._info[mykey]);
						else {
							href = href.replace(mykeytag[i], Foxtrick.util.links._ownInfo[mykey]);
						}
					}
				}
				try { // add icons
					var a = doc.createElement('a');
					a.id = 'LinksCustomLinkID' + key;
					a.className = 'inner';
					a.title = title;
					a.href = href;
					a.target = '_blank';
					var img = doc.createElement('img');
					//img.style.width = img.style.height = '16px';
					// undefined is a string here: comes from prefs
					img.src = imgref !== 'undefined' ? imgref : null;
					img.alt = title;
					a.appendChild(img);
					ownBoxBody.appendChild(a);
				}
				catch (e) {
					Foxtrick.log(e);
					continue;
				}
			}
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	showEdit: function(doc , ownBoxBody, basepref) {
		try {
			// box
			var ownBoxId = 'ft-links-box';
			var div = doc.getElementById(ownBoxId).firstChild;
			Foxtrick.removeClass(div, 'ft-expander-expanded');
			Foxtrick.addClass(div, 'ft-expander-unexpanded');

			var foxtrickRemove = ownBoxBody.getElementsByClassName('foxtrickRemove');
			for (var i = 0; i < foxtrickRemove.length; ++i) {
				Foxtrick.toggleClass(foxtrickRemove[i], 'hidden');
			}

			var divED = doc.createElement('div');
			divED.id = 'divEDId';
			divED.className = 'ft-note';

			var table = doc.createElement('table');
			table.width = '120px';
			table.id = 'LinksCustomTableID';
			var tr0 = doc.createElement('tr');
			var th = doc.createElement('th');
			th.textContent = Foxtrick.L10n.getString('links.custom.addpersonallink');
			th.setAttribute('colspan', '4');
			tr0.appendChild(th);
			table.appendChild(tr0);

			// get custon links from pref
			var keys = {};
			var array = Foxtrick.Prefs.getAllKeysOfBranch(basepref);
			// format: module.LinksCustom.<module>.<random>.<title|href|img>
			for (var nl = 0; nl < array.length; nl++) {
				var key = array[nl].replace(basepref + '.', '');
				if (key.search(/\./) != -1) {
					key = key.replace(/\..+/, '');
					keys[key] = key;
				}
				else
					continue;
			}
			var key;
			for (key in keys) {
				var href = Foxtrick.Prefs.getString(basepref + '.' + key + '.href');
				var imgref = Foxtrick.Prefs.getString(basepref + '.' + key + '.img');
				var title = Foxtrick.Prefs.getString(basepref + '.' + key + '.title');
				if (href == null || imgref == null || title == null)
					continue;

				var a = doc.createElement('a');
				a.title = title;
				a.href = href;
				a.target = '_blank';
				var img = doc.createElement('img');
				img.className = 'ft-links-custom-icon-edit';
				img.src = imgref;
				img.alt = title;
				a.appendChild(img);

				var tr1 = doc.createElement('tr');
				var td1 = doc.createElement('td');
				var td2 = doc.createElement('td');
				td2.setAttribute('style', 'vertical-align:middle;');
				td2.width = '100%';
				var td3 = doc.createElement('td');
				td3.setAttribute('style', 'vertical-align:middle;');
				td3.width = '16px';
				var td4 = doc.createElement('td');
				td4.setAttribute('style', 'vertical-align:middle;');
				td4.width = '16px';
				var td5 = doc.createElement('td');

				td1.appendChild(a);
				td2.appendChild(doc.createTextNode(title.substr(0, 8)));
				td3.appendChild(Foxtrick.util.links.GetEditOldLink(doc, a, basepref + '.' + key));
				td4.appendChild(Foxtrick.util.links.GetDelLink(doc, a, basepref + '.' + key));
				tr1.appendChild(td1);
				tr1.appendChild(td2);
				tr1.appendChild(td3);
				tr1.appendChild(td4);
				table.appendChild(tr1);
			}

			divED.appendChild(table);

			// load image
			var div = doc.createElement('div');
			div.id = 'inputImgDivID';
			div.className = 'ft_icon foxtrickBrowse inner';
			var img = doc.createElement('img');
			img.src = '/Img/Icons/transparent.gif';
			img.height = '16';
			img.width = '16';
			var selectLabel = doc.createElement('span');
			selectLabel.textContent = ' ' + Foxtrick.L10n.getString('links.custom.selecticon');

			div.appendChild(img);
			divED.appendChild(div);
			divED.appendChild(selectLabel);

			var div = doc.createElement('div');
			div.id = 'inputDiv';
			divED.appendChild(div);
			Foxtrick.util.links.LoadDialog(doc, div);

			// titel edit field
			var table2 = doc.createElement('table');
			table2.id = 'LinksCustomTable2ID';
			var inputTitle = doc.createElement('input');
			inputTitle.setAttribute('name', 'inputTitle');
			inputTitle.id = 'inputTitleID';
			var inputTitleText = Foxtrick.L10n.getString('links.custom.title');
			inputTitle.value = inputTitleText;
			Foxtrick.listen(inputTitle, 'focus', function(ev) {
				if (ev.target.value == inputTitleText)
					ev.target.value = '';
			});
			inputTitle.type = 'text';
			inputTitle.setAttribute('maxlength', '100');
			inputTitle.setAttribute('style', 'width:100%;');
			var trn4 = doc.createElement('tr');
			var tdn4 = doc.createElement('td');
			tdn4.appendChild(inputTitle);
			tdn4.setAttribute('colspan', '2');
			trn4.appendChild(tdn4);
			table2.appendChild(trn4);

			// href edit field
			var inputHref = doc.createElement('input');
			inputHref.setAttribute('name', 'inputHref');
			inputHref.id = 'inputHrefID';
			var inputHrefUrl = Foxtrick.L10n.getString('links.custom.exampleUrl');
			inputHref.value = inputHrefUrl;
			Foxtrick.listen(inputHref, 'focus', function(ev) {
				if (ev.target.value == inputHrefUrl)
					ev.target.value = 'http://';
			});
			inputHref.type = 'text';
			inputHref.setAttribute('maxlength', '5000');
			inputHref.setAttribute('style', 'width:100%;');
			inputHref.className = 'inner';
			var trn3 = doc.createElement('tr');
			var tdn3 = doc.createElement('td');
			tdn3.appendChild(inputHref);
			tdn3.setAttribute('colspan', '2');
			trn3.appendChild(tdn3);
			table2.appendChild(trn3);

			// tag select list
			var selectbox = doc.createElement('select');
			selectbox.title = Foxtrick.L10n.getString('links.custom.addtag');
			selectbox.id = 'ft_ownselecttagboxID';
			selectbox.setAttribute('style', 'width:100%;');
			Foxtrick.listen(selectbox, 'change', Foxtrick.util.links.SelectBox_Select, false);
			var option = doc.createElement('option');
			option.value = '';
			option.textContent = Foxtrick.L10n.getString('links.custom.tags');
			selectbox.appendChild(option);

			var addTagToList = function(key) {
				var option = doc.createElement('option');
				option.value = key;
				option.textContent = '[' + key + ']';
				option.setAttribute('style', 'width:100%;');
				selectbox.appendChild(option);
			};
			var key;
			for (key in Foxtrick.util.links._info) {
				addTagToList(key);
			}
			for (key in Foxtrick.util.links._ownInfo) {
				addTagToList(key);
			}

			var trn2 = doc.createElement('tr');
			var tdn2 = doc.createElement('td');
			tdn2.appendChild(selectbox);
			tdn2.setAttribute('colspan', '2');
			trn2.appendChild(tdn2);
			table2.appendChild(trn2);


			// save link
			var saveLink = doc.createElement('a');
			Foxtrick.addClass(saveLink, 'ft-link')
			saveLink.setAttribute('name', 'savelinkname');
			saveLink.setAttribute('basepref', basepref);
			Foxtrick.onClick(saveLink, Foxtrick.util.links.saveMyLink);
			saveLink.textContent = Foxtrick.L10n.getString('links.custom.addlink');
			var trn5 = doc.createElement('tr');
			var tdn5 = doc.createElement('td');
			tdn5.appendChild(saveLink);

			var helplink = doc.createElement('a');
			helplink.className = 'ft_actionicon foxtrickHelp float_right';
			helplink.title = Foxtrick.L10n.getString('links.custom.help');
			Foxtrick.addClass(helplink, 'ft-link')
			Foxtrick.onClick(helplink, function(ev) {
				alert(Foxtrick.L10n.getString('links.custom.helptext'));
			});

			var tdn5b = doc.createElement('td');
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


	delStdLink: function(evt) {
		try {
			var doc = evt.target.ownerDocument;
			var par = evt.target.parentNode;
			var key = par.previousSibling.getAttribute('key');
			var module_name = par.previousSibling.getAttribute('module');
			var grandpar = par.parentNode;
			grandpar.removeChild(par.previousSibling);
			grandpar.removeChild(par);
			Foxtrick.Prefs.setBool('module.' + module_name + '.' + key + '.enabled', false);
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	delMyLink: function(evt) {
		try {
			var doc = evt.target.ownerDocument;
			var Check = doc.defaultView.confirm(Foxtrick.L10n
			                                    .getString('links.custom.confirmremove'));
			if (Check == false) return;

			var mylink = evt.target.mylink;
			var baseprefnl = evt.target.baseprefnl;
			Foxtrick.Prefs.deleteValue(baseprefnl + '.href');
			Foxtrick.Prefs.deleteValue(baseprefnl + '.title');
			Foxtrick.Prefs.deleteValue(baseprefnl + '.img');
			mylink.parentNode.parentNode.parentNode.removeChild(mylink.parentNode.parentNode);
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},


	editOldLink: function(evt) {
		try {
			var doc = evt.target.ownerDocument;
			var baseprefnl = evt.target.baseprefnl;
			doc.getElementById('inputHrefID').value = Foxtrick.Prefs.getString(baseprefnl + '.href');
			doc.getElementById('inputTitleID').value =
				Foxtrick.Prefs.getString(baseprefnl + '.title');
			var imgref = Foxtrick.Prefs.getString(baseprefnl + '.img');
			var img = doc.getElementById('inputImgDivID');
			img.style.backgroundImage = "url('" + imgref + "')";
			img.imgref = imgref;
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},


	saveMyLink: function(evt) {
		try {
			var doc = evt.target.ownerDocument;
			var uniquekey = (Math.random() + '').replace(/0\./, '');
			var ownBoxBody = doc.getElementById('foxtrick_links_content');
			var basepref = ownBoxBody.getAttribute('basepref');
			var baseprefnl = basepref + '.' + uniquekey;

			var href = doc.getElementById('inputHrefID').value;
			var title = doc.getElementById('inputTitleID').value;
			var imgref = String(doc.getElementById('inputImgDivID').imgref);

			Foxtrick.Prefs.setString(baseprefnl + '.href', href);
			Foxtrick.Prefs.setString(baseprefnl + '.title', title);
			Foxtrick.Prefs.setString(baseprefnl + '.img', imgref);

			var a = doc.createElement('a');
			a.title = title;
			a.href = href;
			a.target = '_blank';
			var img = doc.createElement('img');
			img.className = 'ft-links-custom-icon-edit';
			img.src = imgref;
			img.alt = title;
			a.appendChild(img);

			var tr1 = doc.createElement('tr');
			var td1 = doc.createElement('td');
			var td2 = doc.createElement('td');
			td2.setAttribute('style', 'vertical-align:middle;');
			var td3 = doc.createElement('td');
			td3.setAttribute('style', 'vertical-align:middle;');
			var td4 = doc.createElement('td');
			td4.setAttribute('style', 'vertical-align:middle; margin-right:10px;');

			td1.appendChild(a);
			td2.appendChild(doc.createTextNode(title.substr(0, 8)));
			td3.appendChild(Foxtrick.util.links.GetEditOldLink(doc, a, baseprefnl));
			td4.appendChild(Foxtrick.util.links.GetDelLink(doc, a, baseprefnl));

			tr1.appendChild(td1);
			tr1.appendChild(td2);
			tr1.appendChild(td3);
			tr1.appendChild(td4);

			var table = doc.getElementById('LinksCustomTableID');
			table.width = '100px';
			table.appendChild(tr1);
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	GetDelLink: function(doc, mylink, baseprefnl) {
		try {
			var delLink = doc.createElement('div');
			delLink.className = 'ft_actionicon foxtrickRemove';
			delLink.title = Foxtrick.L10n.getString('links.custom.remove');
			Foxtrick.onClick(delLink, Foxtrick.util.links.delMyLink);
			delLink.baseprefnl = baseprefnl;
			delLink.mylink = mylink;
			return delLink;
		}
		catch (e) {
			Foxtrick.log(e);
			return null;
		}
	},


	GetEditOldLink: function(doc, mylink, baseprefnl) {
		try {
			var editOld = doc.createElement('div');
			editOld.className = 'ft_actionicon foxtrickCopy float_right';
			editOld.title = Foxtrick.L10n.getString('links.custom.copy');
			Foxtrick.onClick(editOld, Foxtrick.util.links.editOldLink);
			editOld.baseprefnl = baseprefnl;
			editOld.mylink = mylink;
			return editOld;
		}
		catch (e) {
			Foxtrick.log(e);
			return null;
		}
	},

	LoadDialog: function(doc, divED) {		// load image select
		var form = Foxtrick.util.load.filePickerForDataUrl(doc,
		  function(url) {
			//if (url.length>5000) { Foxtrick.alert('Image too large.'); return; }
			var div = doc.getElementById('inputImgDivID');
			div.imgref = url;
			div.style.backgroundImage = "url('" + url + "')";
		});
		divED.appendChild(form);
	},

	SelectBox_Select: function(evt) {
		try {
			var doc = evt.target.ownerDocument;
			var urlInput = doc.getElementById('inputHrefID');
			var value = urlInput.value;
			if (value.search(/\?/) == -1)
				value += '?';
			else
				value += '&';
			value += evt.target.value + '=[' + evt.target.value + ']';
			urlInput.value = value;
		}
		catch (e) {
			Foxtrick.log(e);
		}
	}
};
