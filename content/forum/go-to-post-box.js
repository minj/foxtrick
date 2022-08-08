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

		var module = this;

		// detect active tab on the left forum menu
		var tab = '';
		try {
			var activeTab = doc.querySelector('.forumTabs > .active');
			tab = '&v=' + Foxtrick.getUrlParam(activeTab.href, 'v');
		}
		catch (e) {}

		var topicId = Foxtrick.getUrlParam(doc.location.href, 't');

		var goToHandler = function() {
			var doc = this.ownerDocument;

			var boxNum = this.id.match(/\d/)[0];
			var input = doc.getElementById('foxtrick_forum_postbox_postboxnum_' + boxNum);
			var val = input.value;

			if (val.indexOf('.') > 0) {
				var aTemp = val.split('.');
				val = aTemp[0] + '&n=' + aTemp[1];
			}
			else {
				val = topicId + tab + '&n=' + val;
			}

			// doc.location='' resolves to XUL here
			var newURL = new URL('/Forum/Read.aspx?t=' + val, doc.location.origin);
			doc.location.assign(newURL);
		};

		let main = doc.getElementById('mainBody');
		if (!main)
			return;

		var parent = main.parentNode;
		var parents = parent.querySelectorAll('.threadPaging');

		Foxtrick.forEach(function(parent, b) {
			var boxId = 'foxtrick_forum_postbox_postboxnum_' + b;
			if (doc.getElementById(boxId))
				return;

			var inputBox = Foxtrick.createFeaturedElement(doc, module, 'input');
			inputBox.id = boxId;
			inputBox.type = 'text';
			inputBox.size = '4';
			inputBox.placeholder = '(xxx.)yyy';
			inputBox.className = 'quickViewBox ft_gotobox';

			Foxtrick.listen(inputBox, 'keypress', function(ev) {
				var key = ev.keyCode;
				if (key == 13) {
					var goButtonID = this.id.replace(/postboxnum/, 'okbutton');
					var goButton = doc.getElementById(goButtonID);
					if (goButton)
						goButton.click();

					return false;
				}
			});

			var inputBoxLabel = doc.createElement('span');
			inputBoxLabel.textContent = '\u00a0';
			parent.appendChild(inputBoxLabel);
			parent.appendChild(inputBox);
			parent.appendChild(Foxtrick.cloneElement(inputBoxLabel, true));

			var goButton = Foxtrick.createFeaturedElement(doc, module, 'button');
			goButton.id = 'foxtrick_forum_postbox_okbutton_' + b;
			goButton.type = 'button';
			goButton.className = 'ft_gotobox ft_gotobox_btn';
			goButton.textContent = Foxtrick.L10n.getString('button.go');
			Foxtrick.onClick(goButton, goToHandler);
			parent.appendChild(goButton);

		}, parents);

	},
};
