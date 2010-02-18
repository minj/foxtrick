/**
* forumstage.js
* Foxtrick Copies post id to clipboard
* @author convinced
*/

var FoxtrickForumStage = {

	MODULE_NAME : "ForumStage",
	PAGES : new Array('forumWritePost'),
    DEFAULT_ENABLED : true,
	
	init : function() {
	},

	onclick : function( ev ) {
	try{  
		var doc = ev.target.ownerDocument;
		var textarea = doc.getElementById('mainBody').getElementsByTagName('textarea')[0]; 
		textarea.value += '[hr][i]FoxTrick enabled[/i]'; 
	} catch(e) {Foxtrick.dump('FoxtrickForumStage '+e+'\n');}
	},

	run : function( page, doc ) {
	try{		
		var forum = doc.getElementById('mainWrapper').getElementsByTagName("h2")[0].getElementsByTagName("a")[1].innerHTML; 
		if (forum == 'Stage') {		
			var button_ok = doc.getElementById('ctl00_ctl00_CPContent_CPMain_btnOK');			
			button_ok.addEventListener('click',this.onclick,true);

			var textarea = doc.getElementById('mainBody').getElementsByTagName('textarea')[0]; 
			var div = doc.createElement('div');
			div.className = 'alert';
			div.innerHTML = "<b>Disable FoxTrick</b> and other extensions before you report any kind of bug. Repeated ignorance = Stage kick." 
			textarea.parentNode.insertBefore(div, textarea);
		}
	} catch(e) {Foxtrick.dump('FoxtrickForumStage '+e+'\n');}
	},
	
	change : function( page, doc ) {
	},
};
