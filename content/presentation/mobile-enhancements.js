"use strict";
/**
 * mobile-enhancements.js
 * Collection of enhancements using mobile device/fennec
 * @author convinced
 */

if(0) 
if (Foxtrick.platform == "Mobile" || Foxtrick.platform == "Android")
  Foxtrick.modules["MobileEnhancements"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : ["all"],
	CSS : Foxtrick.InternalPath + "resources/css/mobile-enhancements.css",

	pageActions : {
		'rightSidebar':		{ match:{pattern:"Forum",result:false},	size:{'simple':190, standard:222},	css:'mobile-enhancements-right.css'},
		'mainContent':		{ match:{pattern:"."	,result:true},	size:{'simple':440, standard:580},	css:'mobile-enhancements-main.css'},
		'leftSidebar':		{ match:{pattern:"."	,result:true},	size:{'simple':125, standard:180},	css:'mobile-enhancements-left.css'},
		'all':				{ match:{pattern:"."	,result:true},	size:{'simple':770, standard:980},	css:''}
	},

	onLoad : function() { 
	try {
		var pageactionsContainer = document.getElementById('pageactions-container');
		var pageActions = this.pageActions;

		for (var i in pageActions) {
			var action = document.createElement('pageaction');
			action.id = 'foxtrick-'+i;
			action.setAttribute("title", Foxtrickl10n.getString('pageAction.'+i));
			action.setAttribute("type", i);
			action.className = 'ft-pageaction';

			// page action click
			Foxtrick.onClick(action, function(ev){
				try {
					var type = ev.target.getAttribute('type');
					Foxtrick.sessionSet('MobileEnhancements.selection', type);
					var css = Foxtrick.modules.MobileEnhancements.getStyle(type);
					// background to content message
					Foxtrick.log('action click ', Foxtrick.modules.MobileEnhancements.pageActions[type].size);
					sandboxed.extension.sendRequest({ 
						req: "replaceCss", 
						css: css,
						id: 'foxtrick-pageaction-css', 
						size: Foxtrick.modules.MobileEnhancements.pageActions[type].size
					});
				} catch (e){
					Foxtrick.log(e);
				}
			});
			pageactionsContainer.insertBefore(action, pageactionsContainer.firstChild);

			// page action open
			PageActions.register('foxtrick-'+i, function(el) {
				try {
					var url = getBrowser().currentURI.spec;
					var type = el.getAttribute('type');
					return Foxtrick.isHtUrl(url) &&
						((url.search(new RegExp(pageActions[type].match.pattern,'i'))!==-1)
								===	pageActions[type].match.result);
				} catch(e){
					Foxtrick.log(e);
				}
			});
		}
	} catch(e){
		Foxtrick.log(e);
	}
	},

	run : function(doc) { 
		Foxtrick.sessionGet('MobileEnhancements.selection', function(selection) {
			// rescale to use all space
			if (doc.getElementById('ctl00_ctl00_CPContent_ucSubMenu_ucLogin_txtUserName')!==null) {
				var css = this.getStyle('all');
				this.setStyle(content.document,'foxtrick-pageaction-css', css, this.pageActions['all'].size);
			}
			else if (selection !== 'all') {
				var css = this.getStyle('mainContent');
				this.setStyle(content.document,'foxtrick-pageaction-css', css, this.pageActions['mainContent'].size);
			}
			else
				this.setMetaViewport(doc, "device-width");

			// listener to viewport resizing from background page action
			sandboxed.extension.onRequest.addListener( function(request, sender, sendResponse) {			
				if (request.req=='replaceCss') {
					Foxtrick.modules.MobileEnhancements.setStyle(content.document, request.id, request.css, request.size);
				}
			});
		});
	},

	setMetaViewport : function (doc, width) {
		Foxtrick.log('setMetaViewport size: ',width)
		var html = doc.getElementsByTagName('html')[0];
		var old_viewport = doc.getElementById('foxtrick-viewport');
		if (old_viewport !== null) 
			html.removeChild(old_viewport);

		var meta = doc.createElement('meta');
		meta.id = "foxtrick-viewport";
		meta.setAttribute('name',"viewport" );
		meta.setAttribute('content', "width = "+width );
		html.insertBefore(meta, doc.getElementsByTagName('html')[0].firstChild);
	},

	setStyle : function(doc, id, css, size) {
		for (var i in this.pageActions) {
			Foxtrick.unload_css_permanent(Foxtrick.InternalPath + "resources/css/" + this.pageActions[i].css);
			Foxtrick.log('unload: ',Foxtrick.InternalPath + "resources/css/" + this.pageActions[i].css);
		}
		Foxtrick.load_css_permanent(Foxtrick.InternalPath + "resources/css/" + css);
		Foxtrick.log('load: ',Foxtrick.InternalPath + "resources/css/" + this.pageActions[i].css);
		var size = Foxtrick.util.layout.isRtl(doc) ? size.standard : size.simple;
		this.setMetaViewport(doc, size+'px');
	},

	getStyle : function(title) { 
		return this.pageActions[title].css;
	}
};
