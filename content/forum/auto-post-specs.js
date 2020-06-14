/**
 * auto-post-specs.js
 * Automatically adds specs about system. browser, stage, ht language etc.
 * when writing posts in Foxtrick forums
 * @author CatzHoek, LA-MJ
 */

'use strict';

Foxtrick.modules['AutoPostSpecs'] = {
	CORE_MODULE: true,
	PAGES: ['forumWritePost'],
	run: function(doc) {
		var setCaretPosition = function(ctrl, pos) {
			if (ctrl.setSelectionRange) {
				ctrl.focus();
				ctrl.setSelectionRange(pos, pos);
			}
			else if (ctrl.createTextRange) {
				let range = ctrl.createTextRange();
				range.collapse(true);
				range.moveEnd('character', pos);
				range.moveStart('character', pos);
				range.select();
			}
		};

		let breadCrumbs = doc.querySelectorAll('#mainWrapper h2 > span');
		let [_, forumCrumb] = breadCrumbs; // lgtm[js/unused-local-variable]
		if (!forumCrumb)
			return;

		let forumLink = forumCrumb.querySelector('a');
		if (!forumLink)
			return;

		// only on Foxtrick Forums
		if (!forumLink.href.match('f=173635'))
			return;

		let textarea = Foxtrick.getMBElement(doc, 'ucHattrickMLEditor_txtBody');

		// super simple check if the spoiler is already present, but seems sufficient
		// applies when editing forum msgs
		let headerTag = `[spoiler]Foxtrick ${Foxtrick.version} ${Foxtrick.branch}`;
		let reText = Foxtrick.strToRe(headerTag);
		let RE = new RegExp(reText, 'i');
		if (RE.test(textarea.value))
			return;

		let win = doc.defaultView;
		let spoiler = `[hr]${headerTag}
			- Stage: ${Foxtrick.isStage(doc)}
			- Skin: ${Foxtrick.util.layout.isStandard(doc) ? 'normal' : 'simple'}
			- ${Foxtrick.Prefs.getString('htLanguage')}
			- ${Foxtrick.util.layout.isRtl(doc) ? 'rtl' : 'ltr'}
			- ${win.screen.availWidth} x ${win.screen.availHeight}
			- ${win.navigator.userAgent}
			- ${win.navigator.platform}[/spoiler]`;

		let curPos = textarea.value.length;
		textarea.value += '\n' + spoiler.replace(/\n\s*/g, ' ');
		setCaretPosition(textarea, curPos);
	},
};
