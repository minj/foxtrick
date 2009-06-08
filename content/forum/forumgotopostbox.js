/**
 * forumgotopostbox.js
 * Foxtrick Go to post box module
 * @author bummerland
 */

var FoxtrickGoToPostBox = {
	
    MODULE_NAME : "GoToPostBox",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array("forumViewThread"), 	
	DEFAULT_ENABLED : false,
	CSS: "chrome://foxtrick/content/resources/css/gotopostbox.css",
	
    init : function() {
    },

    run : function( page, doc ) {
            
            Foxtrick.addJavaScript(doc, "chrome://foxtrick/content/resources/js/GoToPostBox.js");
            
            //set up tab on left forums menu
            var tab = ''
            try {
                var forumtabs = Foxtrick.getElementsByClass( 'active', doc )[0];
                var reg = /^(.*?)\&v\=(\d+)(.*?)/;
                var ar = reg.exec(+' ' + forumtabs.href + ' ');
                if (ar[2] != null) {
                    tab = '&v=' + ar[2];
                }
            } catch(e) {}
            
			var HTGotoInput = doc.getElementById('ctl00_CPMain_ucThread_ucPagerTop_txtMessageNumber');
			var HTGotoButton = doc.getElementById('ctl00_CPMain_ucThread_ucPagerTop_btnViewMessage');
			var HTGotoInput2 = doc.getElementById('ctl00_CPMain_ucThread_ucPagerBottom_txtMessageNumber');
			var HTGotoButton2 = doc.getElementById('ctl00_CPMain_ucThread_ucPagerBottom_btnViewMessage');
			
			//if (HTGotoInput) HTGotoInput.parentNode.removeChild(HTGotoInput);
			//if (HTGotoButton) HTGotoButton.parentNode.removeChild(HTGotoButton);
			//if (HTGotoInput2) HTGotoInput2.parentNode.removeChild(HTGotoInput2);
			//if (HTGotoButton2) HTGotoButton2.parentNode.removeChild(HTGotoButton2);
			
			
            var selectBoxTop = doc.getElementById('ctl00_CPMain_ucThread_ucPagerTop_filterUser');
			var selectBoxBottom = doc.getElementById('ctl00_CPMain_ucThread_ucPagerBottom_filterUser');
			var aSelectBoxes = new Array();
			if (selectBoxTop)
				aSelectBoxes.push(selectBoxTop);
			if (selectBoxBottom)
				aSelectBoxes.push(selectBoxBottom);
			for (var i=0; i<aSelectBoxes.length;i++){
				var boxId = 'foxtrick_forum_postbox_postboxnum_' + i;
				if (doc.getElementById(boxId))
					continue;
				var selectBox = aSelectBoxes[i];
				var inputBoxTop = doc.createElement('input');
				inputBoxTop.setAttribute('type', 'text');
				inputBoxTop.setAttribute('size', '4');
                inputBoxTop.setAttribute('value', '(xxx.)yyy');
                inputBoxTop.setAttribute('class', 'quickViewBox viewInactive');
                inputBoxTop.setAttribute('onfocus', 'setActiveTextBox("' + boxId + '", "quickViewBox viewActive", "(xxx.)yyy")');
                inputBoxTop.setAttribute('onblur', 'setInactiveTextBox("' + boxId + '", "quickViewBox viewInactive", "(xxx.)yyy")');
                
				var goButton = doc.createElement('input');
				goButton.setAttribute('id', 'foxtrick_forum_postbox_okbutton_' + i);
				inputBoxTop.setAttribute('id', boxId);
				goButton.setAttribute('type', 'button');
				var sTmp = selectBox.getAttribute('onChange');
				var iTopicId = sTmp.match(/\d+/)[0];
				goButton.setAttribute('value', 'OK');
				goButton.setAttribute('onClick', 
					'var val=document.getElementById("' + boxId + '").value; ' + 
					'if (val.indexOf(".") > 0) {var aTemp = val.split("."); val = aTemp[0] + "&n=" + aTemp[1];} ' + 
					'else {val = "' + iTopicId + tab + '&n=" + val} ' + 
					'location.href="/Forum/Read.aspx?t=" + val + ""'
					);
				
   				var inputBoxLabel = doc.createElement('span');
                inputBoxLabel.innerHTML = '&nbsp;' + Foxtrickl10n.getString("foxtrick.GoToPostBox.label") + ':&nbsp;';
                selectBox.parentNode.appendChild(inputBoxLabel);

				selectBox.parentNode.appendChild(inputBoxTop);
   				
                var inputBoxLabel2 = doc.createElement('span');
                inputBoxLabel2.innerHTML = '&nbsp';
                selectBox.parentNode.appendChild(inputBoxLabel2);
                
				selectBox.parentNode.appendChild(goButton);
				inputBoxTop.addEventListener("keyup" , FoxtrickGoToPostBox._submit, false); 
			}
			
		},
	
	change : function( page, doc ) {
	
	},
	
	_submit : function(e){
		var doc = e.target.ownerDocument;
		var key = e.keyCode;
		if(key == 13){
            var goButtonID = e.target.getAttribute("id").replace(/postboxnum/, "okbutton");
            var goButton = doc.getElementById(goButtonID);
            if (goButton) goButton.click(); 
            return false; 
        };
	}
};