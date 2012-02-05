"use strict";
/**
* core.js
* Some core functions for FoxTrick
* @author ryanli
*/

Foxtrick.modules["Core"]={
	CORE_MODULE : true,
	PAGES : ["all"],
	NICE : -50, // before anything else
	CSS : [
		Foxtrick.InternalPath + "resources/css/foxtrick.css",
		Foxtrick.InternalPath + "resources/css/headercopyicons.css",
		Foxtrick.InternalPath + "resources/css/flags.css",
	],

	SELF_TEAM_INFO : {},

	run : function(doc) {
		this.parseSelfTeamInfo(doc);
		this.updateLastHost(doc);
		this.showVersion(doc);
		this.showChangeLog(doc);
	},

	updateLastHost : function(doc) {
		// update Foxtrick.lastHost, which is used when opening links
		// from browser chrome
		Foxtrick.setLastHost(doc.location.protocol + "//"
			+ doc.location.hostname);
		Foxtrick.setLastPage(doc.location.href);
	},

	showChangeLog : function(doc) {
		if (FoxtrickPrefs.getString("oldVersion") !== Foxtrick.version()) {
			if (FoxtrickPrefs.getBool("showReleaseNotes")) {
				if ( Foxtrick.platform != "Opera" )
					FoxtrickPrefs.show('#tab=changes');
				else { // opera inline version since we can't open options in opera
					var show = function(releaseNotes) {
						var changes = doc.createElement('div');
						changes.id = "pane-changes";
						var div = doc.createElement('div');
						changes.appendChild(div);
						var label = doc.createElement('h2');
						label.textContent = 'FoxTrick '+Foxtrick.version();
						div.appendChild(label);
						var label = doc.createElement('p');
						label.textContent = Foxtrickl10n.getString('foxtrick.versionReleaseNotes');
						div.appendChild(label);
						var select = doc.createElement('select');
						select.id = 'pref-version-release-notes';
						div.appendChild(select);
						var div = doc.createElement('div');
						div.id = 'pref-notepad';
						changes.appendChild(div);
						var ul = doc.createElement('ul');
						ul.id = 'pref-notepad-list';
						div.appendChild(ul);

						var note = Foxtrick.util.note.create(doc,changes, false,true)
						doc.getElementById('mainBody').insertBefore(note, doc.getElementById('mainBody').firstChild);

						function importContent(from, to)
						{
							for (var i = 0; i < from.childNodes.length; ++i) {
								var node = from.childNodes[i];
								if (node.nodeType == Foxtrick.NodeTypes.ELEMENT_NODE
									&& node.nodeName.toLowerCase() == "module") {
									var link = document.createElement("a");
									link.textContent = node.textContent;
									link.href = Foxtrick.InternalPath + "preferences.html#module=" + link.textContent;
									to.appendChild(link);
								}
								else {
									var importedNode = document.importNode(node, true);
									to.appendChild(importedNode);
								}
							}
						}

						var notes = {};

						var parseNotes = function(xml, dest) {
							if (!xml) {
								dest = {};
								return;
							}
							var noteElements = xml.getElementsByTagName("note");
							for (var i = 0; i < noteElements.length; ++i) {
								var version = noteElements[i].getAttribute("version");
								dest[version] = noteElements[i];
							}
						}
						parseNotes(releaseNotes, notes);

						var select = doc.getElementById("pref-version-release-notes");
						for (var i in notes) {
							// unique version name
							var version = notes[i].getAttribute("version");
							// localized version name
							// search by:
							// 1. localized-version in localized release notes
							// 2. localized-version in master release notes
							// 3. version as fall-back
							var localizedVersion = (notes[version] && notes[version].getAttribute("localized-version"))
								|| version;
							var item = document.createElement("option");
							item.textContent = localizedVersion;
							item.value = version;
							select.appendChild(item);
						}

						var updateNotepad = function() {
							var version = select.options[select.selectedIndex].value;
							var list = document.getElementById("pref-notepad-list");
							list.textContent = ""; // clear list
							var note = notes[version];
							if (!note)
								return;
							var items = note.getElementsByTagName("item");
							for (var i = 0; i < items.length; ++i) {
								var item = document.createElement("li");
								list.appendChild(item);
								importContent(items[i], item);
							}
						}

						var version = Foxtrick.version();
						for (var i = 0; i < select.options.length; ++i) {
							if (select.options[i].value == version) {
								select.selectedIndex = i;
								break;
							}
						}

						updateNotepad();
						Foxtrick.listen(select, 'change', updateNotepad, false);
					}
					Foxtrick.loadXml(Foxtrick.InternalPath + "release-notes.xml", show);
				}
			}
			FoxtrickPrefs.setString("oldVersion", Foxtrick.version());
		}
	},
	
	showVersion : function(doc) {
		var featureHighlight = function() {
			var css = 	"[class^='ft'], [id^='ft']," + // 'ft' at front
						"[class*=' ft'], [id*=' ft']," + // 'ft' at start word 
						"[class*='foxtrick'], [id*='foxtrick']" + // 'foxtrick' anywhere
						"{ background-color:#66ccff !important; color:black !important; border: 1px solid #66ccff !important;}";
			var featureCss = doc.getElementById("ft-feature-highlight-css");
			// remove old CSS if exists
			if (featureCss) {
				featureCss.parentNode.removeChild(featureCss);
				FoxtrickPrefs.setBool("featureHighlight", false);			
			}
			else {
				// inject CSS
				Foxtrick.util.inject.css(doc, css, "ft-feature-highlight-css");
				FoxtrickPrefs.setBool("featureHighlight", true);			
			}
		};
		
		// show version number on the bottom of the page
		var bottom = doc.getElementById("bottom");
		if (bottom) { // sometimes bottom is not loaded yet. just skip it in those cases
			var server = bottom.getElementsByClassName("currentServer")[0];
			var span = doc.createElement("span");			
			span.textContent += " / FoxTrick " + Foxtrick.version();
			span.title = Foxtrickl10n.getString('featureHighlight.title');
			span.id = "ft_versionInfo";
			Foxtrick.listen(span, "click", featureHighlight, false);
			server.appendChild(span);
			if (FoxtrickPrefs.getBool("featureHighlight"))
				featureHighlight();
		}
		else Foxtrick.log('bottom not loaded yet');
	},

	parseSelfTeamInfo : function(doc) {
		var teamLinks = doc.getElementById("teamLinks");
		if (teamLinks && teamLinks.getElementsByTagName("a").length > 0) {
			this.SELF_TEAM_INFO = {
				teamId : Foxtrick.util.id.findTeamId(teamLinks),
				leagueId : Foxtrick.util.id.findLeagueId(teamLinks),
				teamName : Foxtrick.util.id.extractTeamName(teamLinks)
			};
		}
		var subMenu = doc.getElementsByClassName("subMenu")[0];
		if (subMenu) {
			if (!this.SELF_TEAM_INFO.youthTeamId) {
				var leftMenuTeamId = Foxtrick.util.id.findTeamId(subMenu);
				if (this.SELF_TEAM_INFO.teamId == leftMenuTeamId)
					this.SELF_TEAM_INFO.youthTeamId = Foxtrick.util.id.findYouthTeamId(subMenu);
			}
		}
	},

	getSelfTeamInfo : function() {
		return this.SELF_TEAM_INFO;
	}
};
