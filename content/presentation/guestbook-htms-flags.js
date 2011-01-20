/**
* guestbookhtmsflags.js
* Foxtrick Show HTMS flags in guestbook posts module
* is an adaptation of old guestbookalltidflags.js module, removed since r4686
* @author taised
* @author convinced
*/

////////////////////////////////////////////////// //////////////////////////////
//---------------------------------------------------------------------------    

var FoxtrickGuestbookHTMSFlags = {

	MODULE_NAME : "GuestbookHTMSFlags",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('guestbook', 'teamPage', 'league'), 
	DEFAULT_ENABLED : true,
	LATEST_CHANGE:"Inserted as copy of Alltid flags",
	OPTIONS : new Array("AddHTMSFlags","HideAnswerToLinks", "AddHTMSFlagsToSupporters", "AddHTMSFlagsToVisitors"),
	
	init : function() {
	},

	run : function( page, doc ) {
	try{
		var AddHTMSFlags = Foxtrick.isModuleFeatureEnabled( this, "AddHTMSFlags");
		var HideAnswerToLinks = Foxtrick.isModuleFeatureEnabled( this, "HideAnswerToLinks");
		
		var lang = FoxtrickPrefs.getString("htLanguage");
		var flagspage = "http://www.fantamondi.it/HTMS/userstat.php?userid=";
		var linkpage = "http://www.fantamondi.it/HTMS/index.php?page=userstats&lang="+lang+"&userid=";
		var style ="vertical-align: middle; background-color:#849D84;";
		
		var outerdiv = doc.getElementById('mainWrapper');
		var count =0; 
		var linksArray = outerdiv.getElementsByTagName('a');
		var div = null;
		for (var j=0; j<linksArray.length; j++) {
			var link = linksArray[j];
			//Foxtrick.dump(link.href+'\n');
			div=null;
			if (AddHTMSFlags && link.href.search(/userId=/i) > -1 ) {
				//checking if the flag has to be added
				var toadd=false;
				var addSupporter=false;
				var addVisitor=false;
				
				if (page=='guestbook') {
					if (linksArray[j+1].href.search(/Supporter/i)!=-1) {
						toadd=true;
					}
				}
				else {
					//we have to check and skip the just added element
					if (link.getElementsByTagName('img').length==0) {
						var myparent=link.parentNode;
						while (myparent.nodeName!='DIV') {
							myparent=myparent.parentNode;
						}
						var parentClass=myparent.parentNode.className;
						//Foxtrick.dump('link '+link.innerHTML+' parentClass: '+parentClass+'\n');
						if (myparent.getElementsByTagName('table').length>0) {
							//there's a table inside the mainBox: it is the visitor list
							//Foxtrick.dump('link '+link.innerHTML+' visitor\n');
							if (Foxtrick.isModuleFeatureEnabled( this, "AddHTMSFlagsToVisitors")) {
								toadd=true;
								addVisitor=true;
							}
						}
						
						if (parentClass=='boxBody') {
							//could be guestbook or user, let's check
							if (myparent.className=='float_left teamInfo') {
								//nothing to do, it's the main box
							}
							if (myparent.className=='mainBox') {
								//yes, this is the guestbook, add it
								toadd=true;
							}
						}
						if (parentClass=='sidebarBox') {
							//last supporter
							if (Foxtrick.isModuleFeatureEnabled( this, "AddHTMSFlagsToSupporters")) {
								toadd=true;
								addSupporter=true;
							}
						}
						
					}
				}
				if (toadd) {
					div = link.parentNode.parentNode;
					// Add the HTMS flags
					var mySpan = doc.createElement('span');
					var spanId = "foxtrick_htmsspan_"+count;
					mySpan.setAttribute( "id", spanId );
					var userId = link.href.replace(/.+userId=/i, "").match(/^\d+/);
					mySpan.innerHTML = ' <a href="' + linkpage + userId +
						'"target="_blank"><img style="' + style + '" src="' + 
						flagspage + userId + '" border="0"' +
						'height="12" /></a>';
					var target = link.nextSibling;
					if (j+1!=linksArray.length && linksArray[j+1].href.lastIndexOf('Supporter') > -1) {
						target=linksArray[j+1].nextSibling;
					}
					if ( !doc.getElementById( spanId ) ) {
						if (addSupporter) {
							link.parentNode.insertBefore(mySpan, link.nextSibling);
						}
						else {
							if (addVisitor) {
								link.parentNode.appendChild(mySpan);
							}
							else {
								link.parentNode.insertBefore(mySpan, target);
							}
						}
						
					}
					count++;
				}
			}
			if ((page == "guestbook") && HideAnswerToLinks && link.href.search(/Guestbook.aspx/i)!=-1) {
				//if on team page the link to the guestbook mustn't be hidden
				link.style.display='none';
				link.parentNode.setAttribute('style',"margin-bottom:2px; margin-top:-15px; float: right; background-color:white;");
				if (div) div.style.padding='5px 5px 10px';
			}				
		}
		
		} catch (e) {Foxtrick.dump('FoxtrickGuestbookHTMSFlags->'+e+'\n');}
	},
	
	change : function( page, doc ) {
		var spanId = "foxtrick_htmsspan_0";  // id of first added flag
		if( !doc.getElementById ( spanId ) ) {
			this.run( page, doc );
		}
	},	
						
};