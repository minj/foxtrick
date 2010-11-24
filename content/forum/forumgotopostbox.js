/**
 * forumgotopostbox.js
 * Foxtrick Go to post box module
 * @author bummerland
 */

var FoxtrickGoToPostBox = {
    MODULE_NAME : "GoToPostBox",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array("forumViewThread"),
	CSS: Foxtrick.ResourcePath+"resources/css/gotopostbox.css",
	NEW_AFTER_VERSION: "0.5.0.5",
	LATEST_CHANGE:"Fix for latest forum change",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,

    run : function( page, doc ) {
        Foxtrick.addJavaScript(doc, Foxtrick.ResourcePath+"resources/js/GoToPostBox.js");

		if (Foxtrick.isStandardLayout(doc)) doc.getElementById('mainBody').getElementsByTagName('span')[0].setAttribute('style','margin-right:70px');

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



		var HTGotoInput = null;//doc.getElementById('ctl00_CPMain_ucThread_ucPagerTop_txtMessageNumber');
		var HTGotoButton = null;//doc.getElementById('ctl00_CPMain_ucThread_ucPagerTop_btnViewMessage');
		var HTGotoInput2 = null;//doc.getElementById('ctl00_CPMain_ucThread_ucPagerBottom_txtMessageNumber');
		var HTGotoButton2 = null;//doc.getElementById('ctl00_CPMain_ucThread_ucPagerBottom_btnViewMessage');

		var inputs = doc.getElementById('mainWrapper').getElementsByTagName('input');
		for (var i=0;i<inputs.length;++i) {
			if (inputs[i].type=='submit')
			{
				if (!HTGotoButton) {
					HTGotoButton = inputs[i];
					HTGotoInput = inputs[i-1];
				}
				else {
					HTGotoButton2 = inputs[i];
					HTGotoInput2 = inputs[i-1];
					break;
				}
			}
		}

		//if (HTGotoInput) HTGotoInput.parentNode.removeChild(HTGotoInput);
		//if (HTGotoButton) HTGotoButton.parentNode.removeChild(HTGotoButton);
		//if (HTGotoInput2) HTGotoInput2.parentNode.removeChild(HTGotoInput2);
		//if (HTGotoButton2) HTGotoButton2.parentNode.removeChild(HTGotoButton2);

        var selectBoxTop = null;//doc.getElementById('ctl00_CPMain_ucThread_ucPagerTop_filterUser');
		var selectBoxBottom = null;//doc.getElementById('ctl00_CPMain_ucThread_ucPagerBottom_filterUser');

		var selects = doc.getElementById('mainWrapper').getElementsByTagName('select');
		for (var i=0;i<selects.length;++i) {
		  if (selects[i].id.search(/filter/i)!=-1) {
			if (!selectBoxTop) {
				selectBoxTop = selects[i];
			}
			else {
				selectBoxBottom = selects[i];
				break;
			}
		  }
		}


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

			/*
			var tglButton = doc.createElement('input');
			tglButton.setAttribute('id', 'foxtrick_forum_postbox_tglbutton_' + i);
			tglButton.setAttribute('type', 'button');
			tglButton.setAttribute('value', 'i');
			tglButton.setAttribute('class', 'ft_gotobox ft_gotobox_btn');
			tglButton.setAttribute('onClick',
				'function show_tgl(elm) {var el_1 = document.getElementById(\"ctl00_ctl00_CPContent_CPMain_ucThread_ucPager\" + elm); if (el_1.style.display != \"inline\") {el_1.style.display = \"inline\";} else {el_1.style.display = \"none\";}} ' +
				'show_tgl(\"Top_txtMessageNumber\"); show_tgl(\"Top_btnGo\"); show_tgl(\"Top_ddlAction\"); show_tgl(\"Bottom_txtMessageNumber\"); show_tgl(\"Bottom_btnGo\"); show_tgl(\"Bottom_ddlAction\"); '

			);
			selectBox.parentNode.appendChild(tglButton);
			*/

			var inputBoxTop = doc.createElement('input');
			inputBoxTop.setAttribute('type', 'text');
			inputBoxTop.setAttribute('size', '4');
            inputBoxTop.setAttribute('value', '(xxx.)yyy');
            inputBoxTop.setAttribute('class', 'quickViewBox viewInactive ft_gotobox');
            inputBoxTop.setAttribute('onfocus', 'setActiveTextBox("' + boxId + '", "quickViewBox viewActive", "(xxx.)yyy")');
            inputBoxTop.setAttribute('onblur', 'setInactiveTextBox("' + boxId + '", "quickViewBox viewInactive", "(xxx.)yyy")');

			var goButton = doc.createElement('input');
			goButton.setAttribute('id', 'foxtrick_forum_postbox_okbutton_' + i);
			inputBoxTop.setAttribute('id', boxId);
			goButton.setAttribute('type', 'button');
			var sTmp = selectBox.getAttribute('onchange');
			var iTopicId = doc.location.search.match(/\d+/)[0];
			goButton.setAttribute('value', Foxtrickl10n.getString("foxtrick.GoToPostBox.label"));
			goButton.setAttribute('class', 'ft_gotobox ft_gotobox_btn');
			goButton.setAttribute('onclick',
				'var val=document.getElementById("' + boxId + '").value; ' +
				'if (val.indexOf(".") > 0) {var aTemp = val.split("."); val = aTemp[0] + "&n=" + aTemp[1];} ' +
				'else {val = "' + iTopicId + tab + '&n=" + val} ' +
				'location.href="/Forum/Read.aspx?t=" + val + ""'
				);

			var inputBoxLabel = doc.createElement('span');
            inputBoxLabel.innerHTML = '&nbsp;'/* + Foxtrickl10n.getString("foxtrick.GoToPostBox.label") + ':&nbsp;'*/;
            selectBox.parentNode.appendChild(inputBoxLabel);

			selectBox.parentNode.appendChild(inputBoxTop);

            var inputBoxLabel2 = doc.createElement('span');
            inputBoxLabel2.innerHTML = '&nbsp';
            selectBox.parentNode.appendChild(inputBoxLabel2);

			selectBox.parentNode.appendChild(goButton);
			inputBoxTop.addEventListener("keyup" , FoxtrickGoToPostBox._submit, false);
		}

	},

	_submit : function(e){
		var doc = e.target.ownerDocument;
		var key = e.keyCode;
		if(key == 13){
            var goButtonID = e.target.getAttribute("id").replace(/postboxnum/, "okbutton");
            var goButton = doc.getElementById(goButtonID);
            if (goButton) goButton.click();
            return false;
        }
	}
};
