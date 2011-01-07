var qc = 0;
var bc = 0;
var uc = 0;
var ic = 0;

function getSelection(ta) {
	if (ta) {
		ta.focus();

		var textAreaContents = {
			completeText: '',
			selectionStart: 0,
			selectionEnd: 0,
			selectionLength: 0,
			textBeforeSelection: '',
			selectedText: '',
			textAfterSelection: ''
		};

		if (ta.selectionStart || ta.selectionStart == '0') {
			textAreaContents.completeText = ta.value;
			textAreaContents.selectionStart = ta.selectionStart;

			if ((ta.selectionEnd - ta.selectionStart) !== 0) {
				while (ta.value.charAt(ta.selectionEnd - 1) == ' ') {
					ta.selectionEnd--;
				}
			}

			textAreaContents.selectionEnd = ta.selectionEnd;
			textAreaContents.selectionLength = ta.selectionEnd - ta.selectionStart;
			textAreaContents.textBeforeSelection = ta.value.substring(0, ta.selectionStart);

			var st = ta.value.substring(ta.selectionStart, ta.selectionEnd);

			textAreaContents.selectedText = st;
			textAreaContents.textAfterSelection = ta.value.substring(ta.selectionEnd, ta.value.length);
			return textAreaContents;
		}

		else if (document.selection) {
			var tr = document.selection.createRange();

			while (tr.text.charAt(tr.text.length - 1) == ' ') {
				tr.moveEnd('character', -1);
				tr.select();
				tr = document.selection.createRange();
			}

			textAreaContents.completeText = ta.value;
			textAreaContents.selectionStart = 0;
			textAreaContents.selectionEnd = 0;
			textAreaContents.selectionLength = tr.text.length;
			textAreaContents.textBeforeSelection = '';

			var st = tr.text;

			textAreaContents.selectedText = st;
			textAreaContents.textAfterSelection = '';
			return textAreaContents;
		}
	}
}

function clickHandler(ta, openingTag, closingTag, replaceText, counter, fieldCounter, maxLength) {
	if (ta) {
		// link tags
		if (replaceText) {
			var s = getSelection(ta);
			var newText = (s.selectionLength > 0) ? openingTag.replace(replaceText, s.selectedText) : openingTag;


			// Opera, Mozilla
			if (ta.selectionStart || ta.selectionStart == '0') {
				var st = ta.scrollTop;
				ta.value = s.textBeforeSelection + newText + s.textAfterSelection;
				ta.scrollTop = st;

				if ((openingTag.indexOf(' ') > 0) && (openingTag.indexOf(' ') < openingTag.length - 1)) {
					ta.selectionStart = s.selectionStart + openingTag.indexOf('=') + 1;
					ta.selectionEnd = ta.selectionStart + openingTag.indexOf(' ') - openingTag.indexOf('=') - 1;
				}

				// MessageID
				else {
					if (s.selectionLength === 0) {
						ta.selectionStart = s.selectionStart + openingTag.indexOf('=') + 1;
						ta.selectionEnd = ta.selectionStart + openingTag.indexOf(']') - openingTag.indexOf('=') - 1;
					}
					else {
						ta.selectionStart = s.selectionStart + newText.length;
						ta.selectionEnd = ta.selectionStart;
					}
				}

			}

			// IE
			else if (document.selection) {
				var IESel = document.selection.createRange();
				IESel.text = newText;

				if ((openingTag.indexOf(' ') > 0) && (openingTag.indexOf(' ') < openingTag.length - 1)) {
					IESel.moveStart('character', openingTag.indexOf('=') + 1 - newText.length);
					IESel.moveEnd('character', openingTag.indexOf(' ') - newText.length);
				}

				// MessageID
				else {
					if (s.selectionLength === 0) {
						IESel.moveStart('character', openingTag.indexOf('=') + 1 - newText.length);
						IESel.moveEnd('character', openingTag.indexOf(']') - newText.length);
					}
				}

				IESel.select();
			}

			// Others
			else {
				ta.value += newText;
			}
		}

		// start/end tags
		else if ((closingTag) && (counter >= 0)) {
			var s = getSelection(ta);
			var newText = (s.selectionLength > 0) ? openingTag + s.selectedText + closingTag : (counter % 2 == 1) ? openingTag : closingTag;

			// Opera, Mozilla
			if (ta.selectionStart || ta.selectionStart == '0') {
				var st = ta.scrollTop;
				ta.value = s.textBeforeSelection + newText + s.textAfterSelection;
				ta.scrollTop = st;

				ta.selectionStart = s.selectionStart + newText.length;
				ta.selectionEnd = ta.selectionStart;
			}

			// IE
			else if (document.selection) {
				var IESel = document.selection.createRange();
				IESel.text = newText;
				IESel.select();
			}

			// Others
			else {
				ta.value += newText;
			}
		}

		// Quote
		else if ((closingTag) && !(counter)) {
			ta.value = quoteText + '\n' + ta.value;
		}

		// HR
		else {
			var s = getSelection(ta);

			// Opera, Mozilla
			if (ta.selectionStart || ta.selectionStart == '0') {
				var st = ta.scrollTop;
				ta.value = s.textBeforeSelection + s.selectedText + openingTag + s.textAfterSelection;
				ta.scrollTop = st;

				ta.selectionStart = s.selectionEnd + openingTag.length;
				ta.selectionEnd = ta.selectionStart;
			}

			// IE
			else if (document.selection) {
				var IESel = document.selection.createRange();
				IESel.text = s.selectedText + openingTag;
				IESel.select();
			}

			// Others
			else {
				ta.value += newText;
			}
		}
	}
	textCounter(ta, fieldCounter, maxLength);
}
function insertQuoteAll(form, text, fieldCounter, maxLength) {
	clickHandler(form, text, null, null, null, fieldCounter, maxLength);
}
function insertQuote(form, fieldCounter, maxLength) {
	if (getSelection(form).selectionLength === 0) {
		qc++;
	}
	clickHandler(form, '[q]', '[/q]', null, qc, fieldCounter, maxLength);
}
function insertBold(form, fieldCounter, maxLength) {
	if (getSelection(form).selectionLength === 0) {
		bc++;
	}
	clickHandler(form, '[b]', '[/b]', null, bc, fieldCounter, maxLength);
}
function insertUnderline(form, fieldCounter, maxLength) {
	if (getSelection(form).selectionLength === 0) {
		uc++;
	}
	clickHandler(form, '[u]', '[/u]', null, uc, fieldCounter, maxLength);
}
function insertItalic(form, fieldCounter, maxLength) {
	if (getSelection(form).selectionLength === 0) {
		ic++;
	}
	clickHandler(form, '[i]', '[/i]', null, ic, fieldCounter, maxLength);
}
function insertNewline(form, fieldCounter, maxLength) {
	clickHandler(form, '[br]', null, null, null, fieldCounter, maxLength);
}
function insertRuler(form, fieldCounter, maxLength) {
	clickHandler(form, '[hr]', null, null, null, fieldCounter, maxLength);
}
function insertPlayerID(form, fieldCounter, maxLength) {
	clickHandler(form, '[playerid=xxx]', null, 'xxx', null, fieldCounter, maxLength);
}
function insertTeamID(form, fieldCounter, maxLength) {
	clickHandler(form, '[teamid=xxx]', null, 'xxx', null, fieldCounter, maxLength);
}
function insertMatchID(form, fieldCounter, maxLength) {
	clickHandler(form, '[matchid=xxx]', null, 'xxx', null, fieldCounter, maxLength);
}
function insertLeagueID(form, fieldCounter, maxLength) {
	clickHandler(form, '[leagueid=xxx]', null, 'xxx', null, fieldCounter, maxLength);
}
function insertFederationID(form, fieldCounter, maxLength) {
	clickHandler(form, '[federationid=xxx]', null, 'xxx', null, fieldCounter, maxLength);
}
function insertMessage(form, fieldCounter, maxLength) {
	clickHandler(form, '[post=xxx.yy]', null, 'xxx.yy', null, fieldCounter, maxLength);
}
function insertLink(form, fieldCounter, maxLength) {
	clickHandler(form, '[link=xxx]', null, 'xxx', null, fieldCounter, maxLength);
}

function showAT(elem) {
	document.getElementById(elem).style.display = 'block';
}

function hideAT(elem) {
	document.getElementById(elem).style.display = 'none';
}
