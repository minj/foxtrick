"use strict";
/**
 * forum-templates.js
 * Foxtrick forum template handling service
 * @author Mod-PaV, convincedd
 */

Foxtrick.modules["ForumTemplates"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : ['forumWritePost','messageWritePost','htPress','forumModWritePost'],
	OPTIONS : ["DefaultShow"],

	CSS : Foxtrick.InternalPath + "resources/css/forum-templates.css",

	run : function(doc) {
		var templatesDivId = "post_templates";
		var templatesPrefList = "post_templates";
		var newMsgWindow = "ctl00_ctl00_CPContent_CPMain_ucHattrickMLEditor_txtBody";
		if (Foxtrick.isPage("forumWritePost", doc)) {
			var templatesDivId = "post_templates";
			var templatesPrefList = "post_templates";
			var newMsgWindow = 'ctl00_ctl00_CPContent_CPMain_ucHattrickMLEditor_txtBody';
		}
		else if (Foxtrick.isPage("forumModWritePost", doc)) {
			var templatesDivId = "post_mod_templates";
			var templatesPrefList = "post_mod_templates";
			var newMsgWindow = 'ctl00_ctl00_CPContent_CPMain_ucHattrickMLEditor_txtBody';
		}
		else if (Foxtrick.isPage("messageWritePost", doc)) {
			var newMsgWindow = 'ctl00_ctl00_CPContent_CPMain_ucEditorMain_txtBody';
			var templatesDivId = "mail_templates";
			var templatesPrefList = "mail_templates";
		}
		else if (Foxtrick.isPage("htPress", doc)) {
			// For Staff! Users have another  MESSAGE_WINDOW ID !
			var newMsgWindow = 'ctl00_ctl00_CPContent_CPMain_txtComment';
			var templatesDivId = "htpress_templates";
			var templatesPrefList = "htpress_templates";
		}

		var addNewTemplate = function() {
			var msg_window = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];
			var text = Foxtrick.stripHTML(msg_window.value);
			var inputTitle = doc.getElementById("ForumTemplatesInputTitleId");

			var title = Foxtrick.stripHTML(inputTitle.value);

			if (title.search(/\[|\]/)!=-1)
				Foxtrick.alert(Foxtrickl10n.getString('ForumTemplates.templateTitle.error'));
			else if (FoxtrickPrefs.addPrefToList(templatesPrefList, '[title='+title+']'+text)) {
		   		appendTemplate('[title='+title+']'+text);
			}
			else
				Foxtrick.alert(Foxtrickl10n.getString('ForumTemplates.make.error'));

			var inputTitleDiv = doc.getElementById("ForumTemplatesinputTitleDivId");
			inputTitleDiv.parentNode.removeChild(inputTitleDiv);
		};

		 var addNewTitle = function() {
			 try {
				var msg_window = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];
				var text = Foxtrick.stripHTML(msg_window.value);
				if (text==""){ Foxtrick.alert(Foxtrickl10n.getString('ForumTemplates.make.error')); return;}
				var inputTitleDiv = doc.getElementById("ForumTemplatesinputTitleDivId");
				var inputTitle = doc.getElementById ("ForumTemplatesInputTitleId");
				if (!inputTitleDiv) {
					inputTitleDiv = doc.createElement ("div");
					inputTitleDiv.setAttribute("id", "ForumTemplatesinputTitleDivId");
					inputTitleDiv.setAttribute("style", "padding-top:5px;");

					var TitleDesc = doc.createTextNode(Foxtrickl10n.getString('ForumTemplates.templateTitle'));
					inputTitleDiv.appendChild(TitleDesc);

					inputTitle = doc.createElement ("input");
					inputTitle.setAttribute("id", "ForumTemplatesInputTitleId");
					inputTitle.setAttribute("value","");// text.substr(0,20));
					inputTitle.setAttribute("type", "text");
					inputTitle.setAttribute("maxlength", "200");
					inputTitle.setAttribute("size", "20");
					inputTitle.setAttribute("tabIndex", "3");
					inputTitle.setAttribute("style", "margin-left:5px;margin-right:5px;");
					inputTitleDiv.appendChild(inputTitle);
					inputTitle.focus();

					var button_ok = doc.createElement("input");
					button_ok.setAttribute("value", Foxtrickl10n.getString('button.ok'));
					button_ok.setAttribute("id",  "ForumTemplatesOKId");
					button_ok.setAttribute("type",  "button");
					button_ok.setAttribute("tabindex", "5");
					Foxtrick.onClick(button_ok, addNewTemplate);
					inputTitleDiv.appendChild(button_ok);

					var button_cancel = doc.createElement("input");
					button_cancel.setAttribute("value", Foxtrickl10n.getString('button.cancel'));
					button_cancel.setAttribute("id",  "ForumTemplatesCancelId");
					button_cancel.setAttribute("type",  "button");
					//button_cancel.setAttribute("tabindex", "");
					Foxtrick.onClick(button_cancel, CancelTitle);
					inputTitleDiv.appendChild(button_cancel);

					msg_window.parentNode.insertBefore(inputTitleDiv, msg_window);
				}
				inputTitle.setAttribute("value",text.substr(0,20));
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};
		var CancelTitle = function() {
			var inputTitleDiv = doc.getElementById("ForumTemplatesinputTitleDivId");
			inputTitleDiv.parentNode.removeChild(inputTitleDiv);
		};
		var ShowTemplates = function() {
			var div = doc.getElementById(templatesDivId);
			Foxtrick.toggleClass(div,'hidden')
			var div = doc.getElementById("showTemplateId");
			Foxtrick.toggleClass(div,'hidden'); 
			var div = doc.getElementById("hideTemplateId");
			Foxtrick.toggleClass(div,'hidden'); 
		};
		var HideTemplates = function() {
			var div = doc.getElementById(templatesDivId);
			Foxtrick.toggleClass(div,'hidden'); 
			var div = doc.getElementById("showTemplateId");
			Foxtrick.toggleClass(div,'hidden'); 
			var div = doc.getElementById("hideTemplateId");
			Foxtrick.toggleClass(div,'hidden'); 
		};
		var removeTemplate = function(ev) {
			if (Foxtrick.confirmDialog(Foxtrickl10n.getString('ForumTemplates.delete.ask'))) {
				FoxtrickPrefs.delListPref(templatesPrefList, ev.target.msg);
				ev.target.parentNode.parentNode.removeChild(ev.target.parentNode);
			}
		};
		var fillMsgWindow = function(ev) {
			var msg_window = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];
			Foxtrick.insertAtCursor(msg_window, ev.target.msg);
		};
		var appendTemplate = function(text, where) {
			if (arguments.length < 2) {
				var where = doc.getElementById(templatesDivId);
			}
			if (!where)
				return;

			var fulltext = text;
			var title = text.match(/\[title=([^\]]+)\]/);
			if (!title) title = text;
			else { title = title[1];
					text=text.replace(/\[title=[^\]]+\]/,'');
			}

			var container = doc.createElement("span");
			container.className = "ft-forum-template-container";
			where.appendChild(container);
			var remover = doc.createElement("span");
			remover.className = "ft-forum-template-remover ft_actionicon foxtrickRemove";
			remover.msg = fulltext;
			Foxtrick.onClick(remover, removeTemplate);
			container.appendChild(remover);
			var name = doc.createElement("a");
			name.className = "ft-link ft-forum-template-name";
			name.msg = text;
			name.title = name.textContent = title;
			Foxtrick.onClick(name, fillMsgWindow);
			container.appendChild(name);
		};

		var sControlsID = "foxtrick_forumtemplates_controls_div";
		if (doc.getElementById(sControlsID))
			return;
		// display templates above the message window
		//var msg_window = doc.getElementById(newMsgWindow);

		var msg_window = doc.getElementById('mainBody').getElementsByTagName('textarea')[0];


		if (!msg_window) return; // ie mailbox overview
		var templates_div = Foxtrick.createFeaturedElement(doc, this, "div");
		templates_div.setAttribute("class", "folderItem");
		templates_div.setAttribute('style','padding-top:5px;');
		templates_div.id = templatesDivId;

		msg_window.parentNode.insertBefore(templates_div, msg_window);

		var templates = FoxtrickPrefs.getList(templatesPrefList);

		for (var i=0; i<templates.length; ++i)
			appendTemplate(templates[i], templates_div);

		// display add new template button
		var controls_div = Foxtrick.createFeaturedElement(doc, this, "div");
		controls_div.id = sControlsID;
		controls_div.style.paddingTop = "5px";
		var new_button = doc.createElement("a");
		new_button.setAttribute("id", 'addTemplateId');
		new_button.setAttribute("href", "javascript:void(0)");
		new_button.setAttribute("style", "margin-right:10px;");
		new_button.setAttribute("tabIndex", "3");
		new_button.textContent = Foxtrickl10n.getString('ForumTemplates.make');
		Foxtrick.onClick(new_button, addNewTitle);
		controls_div.appendChild(new_button);

		if (!FoxtrickPrefs.isModuleOptionEnabled("ForumTemplates", "DefaultShow")) {
			Foxtrick.addClass(templates_div, 'hidden');
			
			var show_button = doc.createElement("a");
			show_button.setAttribute("id", 'showTemplateId');
			show_button.setAttribute("href", "javascript:void(0);");
			show_button.setAttribute("style", "margin-right:10px;");
			//show_button.setAttribute("tabIndex", "3");
			show_button.textContent = Foxtrickl10n.getString('ForumTemplates.show');
			Foxtrick.onClick(show_button, ShowTemplates);
			controls_div.appendChild(show_button);

			var hide_button = doc.createElement("a");
			hide_button.setAttribute("id", 'hideTemplateId');
			hide_button.setAttribute("href", "javascript:void(0);");
			hide_button.className='hidden'
			hide_button.setAttribute("style", "margin-right:10px;");
			//hide_button.setAttribute("tabIndex", "3");
			hide_button.textContent = Foxtrickl10n.getString('ForumTemplates.hide');
			Foxtrick.onClick(hide_button, HideTemplates);
			controls_div.appendChild(hide_button);
		}

	   	msg_window.parentNode.insertBefore(controls_div, msg_window);
	},

	change : function(doc) {
		this.run(doc);
	}
};
