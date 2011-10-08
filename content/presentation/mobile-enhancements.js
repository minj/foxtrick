"use strict";
/**
 * mobile-enhancements.js
 * Collection of enhancements using mobile device/fennec
 * @author convinced
 */

({
	MODULE_NAME : "MobileEnhancements",
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
		var pageactionsContainer = document.getElementById('pageactions-container');
		var pageActions = this.pageActions;

		for (var i in pageActions) {
			var action = document.createElement('pageaction');
			action.id = 'foxtrick-'+i;
			action.setAttribute("title", Foxtrickl10n.getString('pageAction.'+i));
			action.setAttribute("type", i);
			action.className = 'ft-pageaction';

			// page action click
			action.addEventListener('click',function(ev){
				var type = ev.target.getAttribute('type');
				FoxtrickPrefs.setString('module.MobileEnhancements.selection', type)
				var css = this.getStyle(type);
				sandboxed.extension.sendRequest({ req : "replace_css", css:css ,id:'foxtrick-pageaction-css', size: pageActions[type].size});
			},false);
			pageactionsContainer.insertBefore(action, pageactionsContainer.firstChild);

			// page action open
			PageActions.register('foxtrick-'+i, function(el) {
				try {
					var url = getBrowser().currentURI.spec;
					var type = el.getAttribute('type');
					return Foxtrick.isHtUrl(url) &&
						((url.search(new RegExp(pageActions[type].match.pattern,'i'))!==-1)
								===	pageActions[type].match.result);
				} catch(e){Foxtrick.log(e)}
			});
		}
	},

	run : function(doc) {
		var pageActions = this.pageActions;
		var getStyle = this.getStyle;
		var setStyle = this.setStyle;
		var setMetaViewport = this.setMetaViewport;

		// rescale to use all space
		if (doc.getElementById('ctl00_ctl00_CPContent_ucSubMenu_ucLogin_txtUserName')!==null) {
			var css = getStyle('all');
			setStyle(content.document,'foxtrick-pageaction-css', css, pageActions['all'].size);
		}
		else if (FoxtrickPrefs.getString('module.MobileEnhancements.selection')!=='all') {
			var css = getStyle('mainContent');
			setStyle(content.document,'foxtrick-pageaction-css', css, pageActions['mainContent'].size);
		}
		else
			setMetaViewport(doc, "device-width");

		// listener to viewport resizing
		sandboxed.extension.onRequest.addListener(function(request, sender, sendResponse) {
			if (request.req=='replace_css') {
				setStyle(content.document, request.id, request.css, request.size);
			}
		});
	},

	setMetaViewport : function (doc, width) {
		Foxtrick.log('setMetaViewport size: ',width)
		var html = doc.getElementsByTagName('html')[0];
		var old_viewport = doc.getElementById('foxtrick-viewport');
		if (old_viewport!==null) html.removeChild(old_viewport);

		var meta = doc.createElement('meta');
		meta.id = "foxtrick-viewport";
		meta.setAttribute('name',"viewport" );
		meta.setAttribute('content', "width = "+width );
		html.insertBefore(meta, doc.getElementsByTagName('html')[0].firstChild);
	},

	setStyle : function(doc, id, css, size) {
		var pageActions = this.pageActions;
		for (var i in pageActions) {
			Foxtrick.unload_css_permanent(Foxtrick.InternalPath + "resources/css/" + pageActions[i].css);
			Foxtrick.log('unload: ',Foxtrick.InternalPath + "resources/css/" + pageActions[i].css);
		}
		Foxtrick.load_css_permanent(Foxtrick.InternalPath + "resources/css/" + css);
		Foxtrick.log('load: ',Foxtrick.InternalPath + "resources/css/" + pageActions[i].css);
		var size = Foxtrick.util.layout.isRtl(doc) ? size.standard : size.simple;
		this.setMetaViewport(doc, size+'px');
	},

	getStyle : function(title) {
		return this.pageActions[title].css;
	}
});
