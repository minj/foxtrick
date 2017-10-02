'use strict';
/**
 * auto-post-specs.js
 * Automatically adds specs about system. browser, stage, ht language etc. when writing posts in Foxtrick forums
 * @author CatzHoek
 */

Foxtrick.modules['AutoPostSpecs'] = {
	CORE_MODULE: true,
	PAGES: ['forumWritePost'],
	run: function(doc) {

		var setCaretPosition = function(ctrl, pos){
			if(ctrl.setSelectionRange)
			{
				ctrl.focus();
				ctrl.setSelectionRange(pos,pos);
			}
			else if (ctrl.createTextRange) {
				var range = ctrl.createTextRange();
				range.collapse(true);
				range.moveEnd('character', pos);
				range.moveStart('character', pos);
				range.select();
			}
		}

		var breadCrumbs = doc.querySelectorAll('#mainWrapper h2 > span');
		if(breadCrumbs && breadCrumbs[1]){
			var link = breadCrumbs[1].querySelector('a');
			if(!link)
				return;

			//only on Foxtrick Forums
			if(!link.href.match('f=173635'))
				return;

			var textarea = Foxtrick.getMBElement(doc, 'ucHattrickMLEditor_txtBody');
			var txt = textarea.value;

			//super simple check if the spoiler is already present, but seems sufficient
			//applies when editing forum msgs
			var reText = Foxtrick.strToRe('Foxtrick ' + Foxtrick.version);
			var RE = new RegExp(reText, 'i');
			if (RE.test(txt))
				return;

			var win = doc.defaultView;

			var navInfo = win.navigator.userAgent + ' - ' + win.navigator.platform;

			txt = txt + '\n[hr][spoiler]' + 'Foxtrick ' + Foxtrick.version + ' ' +
				Foxtrick.branch + ' - Stage: ' + Foxtrick.isStage(doc) + ' - Skin: ' +
				(Foxtrick.util.layout.isStandard(doc) ? 'normal' : 'simple') + ' - ' +
				Foxtrick.Prefs.getString('htLanguage') + ' - ' +
				(Foxtrick.util.layout.isRtl(doc) ? 'rtl' : 'ltr') + ' - ' +
				win.screen.availWidth + ' x ' + win.screen.availHeight + ' - ' +
				navInfo + '[/spoiler]';

			textarea.value = txt;
			setCaretPosition(textarea, 0);
		}
	}
};
