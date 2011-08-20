/**
 * mobile-enhancements.js
 * Collection of enhancements using mobile device/fennec
 * @author convinced
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickMobileEnhancements = {
	MODULE_NAME : "MobileEnhancements",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : ["all"],
	CSS : Foxtrick.ResourcePath + "resources/css/mobile-enhancements.css",

	ft_pageactions : {
		'rightSidebar':		{ match:{pattern:"Forum",result:false},	size:{'simple':190, standard:222},	css:'mobile-enhancements-right.css'},
		'mainContent':		{ match:{pattern:"."	,result:true},	size:{'simple':440, standard:580},	css:'mobile-enhancements-main.css'},
		'leftSidebar':		{ match:{pattern:"."	,result:true},	size:{'simple':125, standard:180},	css:'mobile-enhancements-left.css'},
		'all':				{ match:{pattern:"."	,result:true},	size:{'simple':770, standard:980},	css:''}
	},

	run : function(doc) {
		// rescale to use all space
		if (doc.getElementById('ctl00_ctl00_CPContent_ucSubMenu_ucLogin_txtUserName')!==null) {
			var css = this.getStyle('all');
			this.setStyle(content.document,'foxtrick-pageaction-css', css, this.ft_pageactions['all'].size);
		}
		else if (FoxtrickPrefs.getString('FoxtrickMobileEnhancements.selection')!=='all') {
			var css = this.getStyle('mainContent');
			this.setStyle(content.document,'foxtrick-pageaction-css', css, this.ft_pageactions['mainContent'].size);
		}
		else
			this.setMetaViewport(doc, "device-width");

		// listener to viewport resizing
		sandboxed.extension.onRequest.addListener(function(request, sender, sendResponse) {
			if (request.req=='replace_css') {
				FoxtrickMobileEnhancements.setStyle(content.document, request.id, request.css, request.size);
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
		for (var i in FoxtrickMobileEnhancements.ft_pageactions) {
			Foxtrick.unload_css_permanent(Foxtrick.ResourcePath + "resources/css/" + FoxtrickMobileEnhancements.ft_pageactions[i].css);
		Foxtrick.log('unload: ',Foxtrick.ResourcePath + "resources/css/" + FoxtrickMobileEnhancements.ft_pageactions[i].css)
		}
		Foxtrick.load_css_permanent(Foxtrick.ResourcePath + "resources/css/" + css);
		Foxtrick.log('load: ',Foxtrick.ResourcePath + "resources/css/" + FoxtrickMobileEnhancements.ft_pageactions[i].css)
		var size = Foxtrick.util.layout.isRtl(doc) ? size.standard : size.simple;
		FoxtrickMobileEnhancements.setMetaViewport(doc, size+'px');
	},

	getStyle : function(title) {
		return FoxtrickMobileEnhancements.ft_pageactions[title].css;
	},

	initPageAction : function() {
		var pageactionsContainer = document.getElementById('pageactions-container');

		for ( var i in FoxtrickMobileEnhancements.ft_pageactions ) {
			var action = document.createElement('pageaction');
			action.id = 'foxtrick-'+i;
			action.setAttribute("title", Foxtrickl10n.getString('pageAction.'+i));
			action.setAttribute("type", i);
			action.className = 'ft-pageaction';

			// page action click
			action.addEventListener('click',function(ev){
				var type = ev.target.getAttribute('type');
				FoxtrickPrefs.setString('FoxtrickMobileEnhancements.selection', type)
				var css = FoxtrickMobileEnhancements.getStyle(type);
				sandboxed.extension.sendRequest({ req : "replace_css", css:css ,id:'foxtrick-pageaction-css', size:FoxtrickMobileEnhancements.ft_pageactions[type].size});
			},false);
			pageactionsContainer.insertBefore(action, pageactionsContainer.firstChild);

			// page action open
			PageActions.register('foxtrick-'+i, function(el) {
				try {
					var url = getBrowser().currentURI.spec;
					var type = el.getAttribute('type');
					return Foxtrick.isHtUrl(url) &&
						((url.search(new RegExp(FoxtrickMobileEnhancements.ft_pageactions[type].match.pattern,'i'))!==-1)
								===	FoxtrickMobileEnhancements.ft_pageactions[type].match.result);
				} catch(e){Foxtrick.log(e)}
			});
		}
	},
};
//if (typeof(fennec)==='object')
//Foxtrick.util.module.register(FoxtrickMobileEnhancements);
