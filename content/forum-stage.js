'use strict';

/**
* forumstage.js
* Foxtrick Copies post id to clipboard
* @author convinced, LA-MJ
*/

Foxtrick.modules['ForumStage'] = {
	CORE_MODULE: true,
	PAGES: ['forumWritePost'],

	run: function(doc) {
		var crumbs = Foxtrick.Pages.All.getBreadCrumbs(doc);
		if (!crumbs)
			return;
		var forum = crumbs[1];
		if (!forum || forum.textContent.trim() !== 'Stage')
			return;

		var alertDiv = doc.createElement('div');
		alertDiv.className = 'alert ft-dummy';

		var disablePara = doc.createElement('p');
		disablePara.textContent = 'Please ';
		var disableFT = disablePara.appendChild(doc.createElement('strong'));
		disableFT.textContent = 'disable Foxtrick';
		var andOther = ' and any other Hattrick extensions before reporting Hattrick bugs.';
		var disable = doc.createTextNode(andOther);
		disablePara.appendChild(disable);
		alertDiv.appendChild(disablePara);

		var kickPara = doc.createElement('p');
		kickPara.textContent = 'Repeated ignorance can lead to getting kicked from Stage.';
		alertDiv.appendChild(kickPara);

		var ftBugPara = doc.createElement('p');
		ftBugPara.textContent = 'Use the link at the bottom of the page to report a Foxtrick bug.';
		alertDiv.appendChild(ftBugPara);

		// checkbox
		var checkDiv = doc.createElement('div');
		var check = doc.createElement('input');
		check.id = 'ft-stage-forum-post';
		check.type = 'checkbox';
		check.tabIndex = 10;
		checkDiv.appendChild(check);

		var desc = doc.createElement('label');
		desc.textContent = 'I understand and comply';
		desc.setAttribute('for', 'ft-stage-forum-post');
		checkDiv.appendChild(desc);
		alertDiv.appendChild(checkDiv);

		var textarea = doc.querySelector('#mainBody textarea');
		Foxtrick.insertAfter(alertDiv, textarea);

		var btnOK = Foxtrick.getButton(doc, 'OK');
		btnOK.disabled = true;

		Foxtrick.onClick(check, function(ev) {
			var doc = ev.target.ownerDocument;
			var btnOK = Foxtrick.getButton(doc, 'OK');
			btnOK.disabled = !ev.target.checked;
		});

	},
};
