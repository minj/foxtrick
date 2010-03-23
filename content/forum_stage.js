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

			var textarea = doc.getElementById('mainBody').getElementsByTagName('textarea')[0]; 
			var divalert = doc.createElement('div');
			divalert.className = 'alert';
			divalert.innerHTML = "Please <b>disable FoxTrick</b> and any other Hattrick extensions (Firefox menu: Tools -> Add-ons) before reporting a bug. Repeated ignorance = Stage kick.<br/>"
			textarea.parentNode.insertBefore(divalert, textarea.nextSibling);
			
			// checkbox 
			var button_ok = doc.getElementById('ctl00_ctl00_CPContent_CPMain_btnOK');			
			button_ok.setAttribute('disabled',true);
						
			var checkdiv = doc.createElement("div");
			var check = doc.createElement("input");
			check.setAttribute("type", "checkbox");
			checkdiv.appendChild(check);
			var desc = doc.createElement("label");
			desc.appendChild(doc.createTextNode('I know'));
			checkdiv.appendChild(desc);
			divalert.appendChild(checkdiv);		
			
			check.addEventListener("click", function( ev ) {
				var doc = ev.target.ownerDocument;
				var checked = ev.target.checked;
				var button_ok = doc.getElementById('ctl00_ctl00_CPContent_CPMain_btnOK');			
				if (checked) button_ok.removeAttribute('disabled');			
				else button_ok.setAttribute('disabled', true);			
			}, false );
			
		}
	} catch(e) {Foxtrick.dump('FoxtrickForumStage '+e+'\n');}
	},
	
	change : function( page, doc ) {
	},
};
