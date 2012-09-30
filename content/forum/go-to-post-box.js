'use strict';
/**
 * go-to-post-box.js
 * Foxtrick Go to post box module
 * @author bummerland
 */

Foxtrick.modules['GoToPostBox'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: ['forumViewThread'],
	CSS: Foxtrick.InternalPath + 'resources/css/gotopostbox.css',

	run: function(doc) {


		//set up tab on left forums menu
		var tab = '';
		try {
			var forumtabs = doc.getElementsByClassName('active')[0];
			var reg = /^(.*?)\&v\=(\d+)(.*?)/;
			var ar = reg.exec(+ ' ' + forumtabs.href + ' ');
			if (ar[2] != null) {
				tab = '&v=' + ar[2];
			}
		} catch (e) {}



		var HTGotoInput = null;
		var HTGotoButton = null;
		var HTGotoInput2 = null;
		var HTGotoButton2 = null;

		var inputs = doc.getElementsByClassName('main')[0].getElementsByTagName('input');
		for (var i = 0; i < inputs.length; ++i) {
			if (inputs[i].type == 'submit') {
				if (!HTGotoButton) {
					HTGotoButton = inputs[i];
					HTGotoInput = inputs[i - 1];
				}
				else {
					HTGotoButton2 = inputs[i];
					HTGotoInput2 = inputs[i - 1];
					break;
				}
			}
		}

		var selectBoxTop = null;
		var selectBoxBottom = null;

		var selects = doc.getElementsByClassName('main')[0].getElementsByTagName('select');
		for (var i = 0; i < selects.length; ++i) {
		  if (selects[i].id.search(/filter/i) != -1) {
			if (!selectBoxTop) {
				selectBoxTop = selects[i];
			}
			else {
				selectBoxBottom = selects[i];
				break;
			}
		  }
		}


		var aSelectBoxes = [];
		if (selectBoxTop)
			aSelectBoxes.push(selectBoxTop);
		if (selectBoxBottom)
			aSelectBoxes.push(selectBoxBottom);
		for (var i = 0; i < aSelectBoxes.length; i++) {
			var boxId = 'foxtrick_forum_postbox_postboxnum_' + i;
			if (doc.getElementById(boxId))
				continue;
			var selectBox = aSelectBoxes[i];

			var inputBoxTop = Foxtrick.createFeaturedElement(doc, this, 'input');
			inputBoxTop.setAttribute('type', 'text');
			inputBoxTop.setAttribute('size', '4');
			inputBoxTop.setAttribute('value', '(xxx.)yyy');
			inputBoxTop.setAttribute('class', 'quickViewBox viewInactive ft_gotobox');
			inputBoxTop.addEventListener('focus', function(ev) {
					ev.target.className = 'quickViewBox viewActive ft_gotobox';
					if (ev.target.value == '(xxx.)yyy') {
						ev.target.value = '';
					}
			}, false);
			inputBoxTop.addEventListener('blur', function(ev) {
				if (ev.target.value.length === 0) {
					ev.target.className = 'quickViewBox viewInactive ft_gotobox';
					ev.target.value = '(xxx.)yyy';
				}
			}, false);

			var goButton = Foxtrick.createFeaturedElement(doc, this, 'input');
			goButton.setAttribute('id', 'foxtrick_forum_postbox_okbutton_' + i);
			inputBoxTop.setAttribute('id', boxId);
			goButton.setAttribute('type', 'button');
			var sTmp = selectBox.getAttribute('onchange');
			var iTopicId = doc.location.search.match(/\d+/)[0];
			goButton.setAttribute('value', Foxtrickl10n.getString('button.go'));
			goButton.setAttribute('class', 'ft_gotobox ft_gotobox_btn');
			var gotoFkt = function(ev) {
				var boxNum = ev.target.id.match(/\d/)[0];
				var val = doc.getElementById('foxtrick_forum_postbox_postboxnum_' + boxNum).value;
				if (val.indexOf('.') > 0) {
					var aTemp = val.split('.');
					val = aTemp[0] + '&n=' + aTemp[1];
				}
				else {
					val = '' + iTopicId + tab + '&n=' + val;
				}
				doc.location.href = '/Forum/Read.aspx?t=' + val;
			};
			Foxtrick.onClick(goButton, gotoFkt);

			var inputBoxLabel = doc.createElement('span');
			inputBoxLabel.textContent = '\u00a0';
			selectBox.parentNode.appendChild(inputBoxLabel);

			selectBox.parentNode.appendChild(inputBoxTop);

			var inputBoxLabel2 = doc.createElement('span');
			inputBoxLabel2.textContent = '\u00a0';
			selectBox.parentNode.appendChild(inputBoxLabel2);

			selectBox.parentNode.appendChild(goButton);
			Foxtrick.listen(inputBoxTop, 'keyup', function(ev) {
				var key = ev.keyCode;
				if (key == 13) {
					var goButtonID = ev.target.getAttribute('id').replace(/postboxnum/, 'okbutton');
					var goButton = doc.getElementById(goButtonID);
					if (goButton) goButton.click();
					return false;
				}
			}, false);
		}
	}
};
