/**
 * forumgotopostbox.js
 * Foxtrick Go to post box module
 * @author bummerland
 */

////////////////////////////////////////////////////////////////////////////////
var FoxtrickGoToPostBox = {
	
    MODULE_NAME : "GoToPostBox",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	DEFAULT_ENABLED : true,

    init : function() {
            Foxtrick.registerPageHandler( 'forumViewThread',
                                          FoxtrickGoToPostBox );
    },

    run : function( page, doc ) {
			var selectBoxTop = doc.getElementById('ctl00_CPMain_ucThread_ucPagerTop_filterUser');
			var selectBoxBottom = doc.getElementById('ctl00_CPMain_ucThread_ucPagerBottom_filterUser');
			var aSelectBoxes = new Array();
			if (selectBoxTop)
				aSelectBoxes.push(selectBoxTop);
			if (selectBoxBottom)
				aSelectBoxes.push(selectBoxBottom);
			for (i=0; i<aSelectBoxes.length;i++){
				var boxId = 'foxtrick_forum_postbox_' + i;
				if (doc.getElementById(boxId))
					continue;
				var selectBox = aSelectBoxes[i];
				var inputBoxTop = doc.createElement('input');
				var goButton = doc.createElement('input');
				goButton.setAttribute('type', 'button');
				var sTmp = selectBox.getAttribute('onChange');
				var iTopicId = sTmp.match(/\d+/)[0];
				goButton.setAttribute('value', 'OK');
				goButton.setAttribute('onClick', 'location.href="/Forum/Read.aspx?t=' + iTopicId + '&n=" + document.getElementById("' + boxId + '").value + "&v=2#" + document.getElementById("' + boxId + '").value;');
				inputBoxTop.setAttribute('type', 'text');
				inputBoxTop.setAttribute('size', '3');
				inputBoxTop.setAttribute('id', boxId);
				selectBox.parentNode.appendChild(inputBoxTop);
				selectBox.parentNode.appendChild(goButton);
			}
			
		},
	
	change : function( page, doc ) {
	
	}
};