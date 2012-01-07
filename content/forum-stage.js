"use strict";
/**
* forumstage.js
* Foxtrick Copies post id to clipboard
* @author convinced
*/

Foxtrick.util.module.register({
	MODULE_NAME : "ForumStage",
	CORE_MODULE : true,
	PAGES : new Array('forumWritePost'),

	run : function(doc) {
		var forum = doc.getElementById('mainWrapper').getElementsByTagName("h2")[0].getElementsByTagName("a")[1].innerHTML;
		if (forum == 'Stage') {
			var textarea = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];
			var divalert = doc.createElement('div');
			divalert.className = 'alert ft-dummy';
			divalert.innerHTML = "Please <b>disable FoxTrick</b> and any other Hattrick extensions" + 
								" (Browser menu -> Tools -> Add-ons) before reporting a bug. "+
								" Repeated ignorance = Stage kick. Clicking on the <a href='#ft_versionInfo'>FoxTrick version info</a>" +
								" (down right with the stage build) highlights most of FoxTrick's features."; 
			textarea.parentNode.insertBefore(divalert, textarea.nextSibling);

			// checkbox
			var button_ok = doc.getElementById('ctl00_ctl00_CPContent_CPMain_btnOK');
			button_ok.setAttribute('disabled',true);

			var checkdiv = doc.createElement("div");
			var check = doc.createElement("input");
			check.id = "ft-stage-forum-post";
			check.setAttribute("type", "checkbox");
			check.setAttribute("tabindex", "10");
			checkdiv.appendChild(check);
			var desc = doc.createElement("label");
			desc.appendChild(doc.createTextNode('I know'));
			desc.setAttribute("for", "ft-stage-forum-post");
			checkdiv.appendChild(desc);
			divalert.appendChild(checkdiv);

			Foxtrick.listen(check, "click", function( ev ) {
				var doc = ev.target.ownerDocument;
				var checked = ev.target.checked;
				var button_ok = doc.getElementById('ctl00_ctl00_CPContent_CPMain_btnOK');
				if (checked) button_ok.removeAttribute('disabled');
				else button_ok.setAttribute('disabled', true);
			}, false );
		}
	}
});
