"use strict";
/**
* embed-media.js
* Foxtrick Embedding for links to media files.
* @author CatzHoek
*/

Foxtrick.util.module.register({
	MODULE_NAME : "EmbedMedia",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array("forumViewThread"),
	NICE : 1,
	//no funnyordie atm
	//OPTIONS : ['EmbedYoutubeVideos','EmbedVimeoVideos', 'EmbedFunnyOrDieVideos', 'EmbedDailymotionVideos', ['EmbedModeOEmebed', 'ReplaceLinksByTitlesLinksToTitles', 'EmbedFlickrImages', 'EmbedDeviantArtImages', 'EmbedSoundCloud']],
	OPTIONS : ['EmbedYoutubeVideos','EmbedVimeoVideos', 'EmbedDailymotionVideos', ['EmbedModeOEmebed', 'ReplaceLinksByTitles', 'EmbedFlickrImages', 'EmbedDeviantArtImages', 'EmbedSoundCloud']],
	CSS : Foxtrick.InternalPath + "resources/css/embed-media.css",

	run : function(doc) {
		var do_embed_media = FoxtrickPrefs.isModuleEnabled("EmbedMedia");
		var do_embed_youtube_videos = do_embed_media && FoxtrickPrefs.isModuleOptionEnabled("EmbedMedia", "EmbedYoutubeVideos");
		var do_embed_vimeo_videos = do_embed_media && FoxtrickPrefs.isModuleOptionEnabled("EmbedMedia", "EmbedVimeoVideos");
		//no funnyordie atm
		//var do_embed_funnyordie_videos = do_embed_media && FoxtrickPrefs.isModuleOptionEnabled("EmbedMedia", "EmbedFunnyOrDieVideos");
		var do_embed_funnyordie_videos = false;
		var do_embed_dailymotion_videos = do_embed_media && FoxtrickPrefs.isModuleOptionEnabled("EmbedMedia", "EmbedDailymotionVideos");
		
		var oembed_enabled = do_embed_media && FoxtrickPrefs.isModuleOptionEnabled("EmbedMedia", "EmbedModeOEmebed");
		var do_replaceLinksByTitles = do_embed_media && oembed_enabled && FoxtrickPrefs.isModuleOptionEnabled("EmbedMedia", "ReplaceLinksByTitles");
		var do_embed_soundcloud = do_embed_media && oembed_enabled && FoxtrickPrefs.isModuleOptionEnabled("EmbedMedia", "EmbedSoundCloud");
		var do_embed_flickr_images = do_embed_media && oembed_enabled && FoxtrickPrefs.isModuleOptionEnabled("EmbedMedia", "EmbedFlickrImages");
		var do_embed_deviantart_images = do_embed_media && oembed_enabled && FoxtrickPrefs.isModuleOptionEnabled("EmbedMedia", "EmbedDeviantArtImages");
				
		var siteEnabled = {
			"youtube" : do_embed_youtube_videos,
			"vimeo" : do_embed_vimeo_videos,
			"funnyordie" : do_embed_funnyordie_videos,
			"dailymotion" : do_embed_dailymotion_videos,
			"soundcloud" : do_embed_soundcloud,
			"flickr" : do_embed_flickr_images,
			"deviantart" : do_embed_deviantart_images
		};	
		// get an XmlHTMLRequest Response
		var oEmbedRequest = function( url ){
			try {
				var xmlHttp = null;
				xmlHttp = new XMLHttpRequest();
				xmlHttp.open( "GET", url, false );
				xmlHttp.send( null );
				} catch(e)
				{
					return null
				}
			return xmlHttp.responseText;
		}
		
		//Link validation regex, needs to supply videoid for iframe embedding, 
		//for oembed support it's sufficient to ensure the deivering network is correct, further details will be determined by oEmbed XmlHTMLRequest request.
		var filter_supported = {
			"deviantart":"^(http:\/\/)(.*)?(fav)\.me\/",
			"soundcloud":"^(http:\/\/)([a-zA-Z]{2,3}\.)?(soundcloud)\.com\/",
			"youtube":"^(http:\/\/)([a-zA-Z]{2,3}\.)?(youtube\.[a-zA-Z]{2,3}|youtu\.be)\/.*(v[=\/]([a-zA-Z0-9-_]{11}\\b)|\/([a-zA-Z0-9-_]{11}\\b))",
			"vimeo":"^(http:\/\/)([a-zA-Z]{2,3}\.)?(vimeo)\.com\/(\\d+)",
			"flickr":"^(http:\/\/)([a-zA-Z]{2,3}\.)?(flickr)\.com\/",
			"funnyordie":"^(http:\/\/)([a-zA-Z]{2,3}.)?(funnyordie)\.(com)\/videos\/([a-zA-Z0-9]*)\\b",
			"dailymotion":"^(http:\/\/)([a-zA-Z]{2,3}\.)?(dailymotion\.com)\/video\/([a-zA-Z0-9-]+)"
		};	
		
		//oEmbed supported sites need entries at this point
		var oembed_urls = {
			"vimeo":"https://vimeo.com/api/oembed.json?maxwidth=400&url=",
			"youtube":"https://www.youtube.com/oembed?format=json&maxwidth=400&url=",
			"funnyordie":"http://www.funnyordie.com/oembed.json?format=json&maxwidth=400&url=",
			"dailymotion":"https://www.dailymotion.com/services/oembed?format=json&maxwidth=400&url=",
			"flickr":"http://www.flickr.com/services/oembed/?format=json&url=",
			"deviantart":"http://backend.deviantart.com/oembed?format=json&url=",
			"soundcloud":"http://soundcloud.com/oembed?format=json&show_comments=false&url="
		};
		
		// native and fallback support, base urls to be used when the video ID has been extracted.
		var iframe_urls = {
			"vimeo":"http://player.vimeo.com/video/",
			"youtube":"http://www.youtube.com/embed/",
			"funnyordie":"http://www.funnyordie.com/embed/",
			"dailymotion":"http://www.dailymotion.com/embed/video/"
		};
		
		var do_iframe_embed = function( target ){
				var iframe = doc.createElement('iframe');
				iframe.setAttribute('width', "400");
				iframe.setAttribute('height', "334");
				iframe.setAttribute('src', target.nextSibling.firstChild.href );
				Foxtrick.log( target.nextSibling.firstChild.href );
				iframe.setAttribute('frameborder','0');
				//link.parentNode.replaceChild(iframe,link);
				target.nextSibling.replaceChild(iframe, target.nextSibling.firstChild);
							
		}
		// Oembed replacement, requires pre-prepartion (link needs to be converted to div and needs a first child to be altered)
		var do_oEmbed  = function(target, json){
			var author = json.author_name?json.author_name:"Unknown Author";
			if(do_replaceLinksByTitles)
				target.firstChild.innerText = '(' + json.title + ')';
			
			switch (json.type){
				 case "file":
				 case "photo":
					var img = doc.createElement('img');
					img.src = json.url
					img.alt = json.title
					img.style.width = "100%";
					img.title = json.provider_name + '\n' + json.title + '\nby ' + author
					target.nextSibling.replaceChild(img, target.nextSibling.firstChild);
					break;
				 case "video":
					target.nextSibling.innerHTML = json.html;
					break;
				 default:
					target.nextSibling.innerHTML = json.html;
					break;
			}
		}
		
		var extractVideoIdFromUrl = function( url, site ){
			var re = new RegExp( filter_supported[site] );
			var matches = re.exec( url )
			var videoid	= null;	
			if(site == "youtube"){
				var videoid = matches[5]?matches[5]:(matches[6]?matches[6]:null);
				if( url.match("user\/" + videoid) )
					videoid	= null;
			} else if (site == "vimeo"){
				videoid	= matches[4]?matches[4]:null;
			} else if (site == "funnyordie"){
				videoid	= matches[5]?matches[5]:null;
			} else if (site == "dailymotion"){
				videoid	= matches[4]?matches[4]:null;
			}
			return videoid;
		}
		
		//get's theoretically supported media links from node
		//syntax errors or any other malisious error is not yet handled
		var getSupportedMediaLinksWithDetails = function( node ){
			var media_links = [];
			var all_links = node.getElementsByTagName('a');	
			
			//iterate all links and see if any supported link is found
			Foxtrick.map( function(link){
				var linkDict = {"site":null, "link":link};
				for (var key in filter_supported)	
				{	
					var re = new RegExp( filter_supported[key] );
					var matches = re.exec(link)
					
					//link passed regex, add to supported links
					if( matches ){
						linkDict["site"] = key
						linkDict["videoid"] = extractVideoIdFromUrl(link.href, linkDict["site"])
						media_links.push( linkDict );
						break;
					}
				}
			}, all_links);
			
			return media_links;
		}
		
		var convertLinkToEmbeddingHeader = function( media_link ){
			var div = doc.createElement('div');
			var header_a = doc.createElement('a');
			header_a.textContent = media_link["link"].textContent;
			header_a.href = media_link["link"].href
			div.appendChild(header_a);
			Foxtrick.addClass(div, 'ft-media-expander-unexpanded ' + media_link["site"]); 
			Foxtrick.addClass(div, 'ft-media-site-' + media_link["site"]);
			media_link["link"].parentNode.insertBefore(div, media_link["link"]);
			var videocontainer = doc.createElement('div');
			Foxtrick.addClass(videocontainer, 'hidden ft-media-container')
			var a = doc.createElement('a');
			
			//already convert link to embedding url when using iframe method
			if(!oembed_enabled )
				a.href = iframe_urls[media_link["site"]] +  media_link["videoid"];
			else
				a.href = media_link["link"].href;
				
			videocontainer.appendChild(a);
			media_link["link"].parentNode.replaceChild(videocontainer, media_link["link"]);
			
			Foxtrick.listen(div, "click", function(ev){
				if(!Foxtrick.hasClass(ev.target.nextSibling,'ft-media-embedded')){
					embed(ev.target);
					Foxtrick.addClass(ev.target.nextSibling,'ft-media-embedded')
				}	
				Foxtrick.toggleClass(ev.target.nextSibling,'hidden');
				if(Foxtrick.hasClass(ev.target,'ft-media-expander-unexpanded')){
					Foxtrick.removeClass(ev.target,'ft-media-expander-unexpanded')
					Foxtrick.addClass(ev.target,'ft-media-expander-expanded')
				}else{
					Foxtrick.removeClass(ev.target,'ft-media-expander-expanded')
					Foxtrick.addClass(ev.target,'ft-media-expander-unexpanded')
					}
			}, false);
							
		}
		
		var embed = function( target ){
			
			if( oembed_enabled ){
				var oEmbedReq = null;
				for ( var key in oembed_urls )	
				{
					if( Foxtrick.hasClass( target, "ft-media-site-" +  key ) ){
						oEmbedReq = oEmbedRequest(oembed_urls[key] + target.firstChild.href)
						break;
					}
				}
				if( oEmbedReq ){
					//funnyordie is an asshole
					oEmbedReq = oEmbedReq.replace(/&quot;/g, '\"').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
					
					//
					try {
						var json = JSON.parse( oEmbedReq );
						do_oEmbed(target, json);
					}
					catch(e)
					{
						target.nextSibling.innerText = "Not a media item, host is down or has uncomprehensive response.";
						Foxtrick.log(e);
					}
				} 
			} else {
				for ( var key in iframe_urls )	
				{
					if( Foxtrick.hasClass( target, "ft-media-site-" +  key ) ){
						do_iframe_embed( target );
						break;
					}
				}
			}
		}
		
		//--------------------------------------------------------------------------------------------
		//actually work on the site
		var messages = doc.getElementsByClassName("message");
		
		Foxtrick.map( function( message ){
			var found_media_links = getSupportedMediaLinksWithDetails( message );
			Foxtrick.map( function( media_link ){
				if( siteEnabled[media_link.site] )
					convertLinkToEmbeddingHeader( media_link );
			}, found_media_links);
		
		}, messages);
	}
});
