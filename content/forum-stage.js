'use strict';
/**
* forumstage.js
* Foxtrick Copies post id to clipboard
* @author convinced
*/

Foxtrick.modules['ForumStage'] = {
	CORE_MODULE: true,
	PAGES: ['forumWritePost'],

	run: function(doc) {
		var forum = doc.getElementsByClassName('main')[0]
						.getElementsByTagName('h2')[0]
						.getElementsByTagName('a')[1].textContent;
		if (forum == 'Stage') {
			var textarea = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];
			var divalert = doc.createElement('div');
			divalert.className = 'alert ft-dummy';
			divalert.appendChild(doc.createTextNode('Please '));
			var b = divalert.appendChild(doc.createElement('b'));
			b.appendChild(doc.createTextNode('disable FoxTrick'));
			divalert.appendChild(doc.createTextNode(' and any other Hattrick extensions' +
				' before reporting a bug (eg Browser menu -> Tools -> Add-ons). ' +
				' Repeated ignorance can lead to getting kicked from stage. ' +
				'FoxTrick bugs report '));
			var a = divalert.appendChild(doc.createElement('a'));
			a.appendChild(doc.createTextNode('here'));
			a.href = '/Forum/Overview.aspx?v=0&f=173635';
			divalert.appendChild(doc.createTextNode('.'));

			textarea.parentNode.insertBefore(divalert, textarea.nextSibling);

			// checkbox
			var button_ok = doc.getElementById('ctl00_ctl00_CPContent_CPMain_btnOK');
			button_ok.setAttribute('disabled', true);

			var checkdiv = doc.createElement('div');
			var check = doc.createElement('input');
			check.id = 'ft-stage-forum-post';
			check.setAttribute('type', 'checkbox');
			check.setAttribute('tabindex', '10');
			checkdiv.appendChild(check);
			var desc = doc.createElement('label');
			desc.appendChild(doc.createTextNode('I know'));
			desc.setAttribute('for', 'ft-stage-forum-post');
			checkdiv.appendChild(desc);
			divalert.appendChild(checkdiv);

			Foxtrick.onClick(check, function(ev) {
				var doc = ev.target.ownerDocument;
				var checked = ev.target.checked;
				var button_ok = doc.getElementById('ctl00_ctl00_CPContent_CPMain_btnOK');
				if (checked) button_ok.removeAttribute('disabled');
				else button_ok.setAttribute('disabled', true);
			});
		}
	}
};
