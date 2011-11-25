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
	NICE : 50,
	OPTIONS : ['EmbedYoutubeVideos','EmbedVimeoVideos', 'EmbedFunnyOrDieVideos', 'EmbedDailymotionVideos'],
	CSS : Foxtrick.InternalPath + "resources/css/embed-media.css",

	run : function(doc) {
		var do_embed_media = FoxtrickPrefs.isModuleEnabled("EmbedMedia");
		var do_embed_youtube_videos = do_embed_media && FoxtrickPrefs.isModuleOptionEnabled("EmbedMedia", "EmbedYoutubeVideos");
		var do_embed_vimeo_videos = do_embed_media && FoxtrickPrefs.isModuleOptionEnabled("EmbedMedia", "EmbedVimeoVideos");
		var do_embed_funnyordie_videos = do_embed_media && FoxtrickPrefs.isModuleOptionEnabled("EmbedMedia", "EmbedFunnyOrDieVideos");
		var do_embed_dailymotion_videos = do_embed_media && FoxtrickPrefs.isModuleOptionEnabled("EmbedMedia", "EmbedDailymotionVideos");
			
		if(do_embed_youtube_videos 
		|| do_embed_vimeo_videos  
		|| do_embed_funnyordie_videos
		|| do_embed_dailymotion_videos)
		{
			try {
				var regex = {"vimeo":"^(http:\/\/)([a-zA-Z]{2,3}\.)?(vimeo)\.com\/(\\d+)",
							 "youtube":"^(http:\/\/)([a-zA-Z]{2,3}\.)?(youtube\.[a-zA-Z]{2,3}|youtu\.be)\/.*(v[=\/]([a-zA-Z0-9-_]{11}\\b)|\/([a-zA-Z0-9-_]{11}\\b))",
							 "funnyordie":"^(http:\/\/)([a-zA-Z]{2,3}.)?(funnyordie)\.(com)\/videos\/([a-zA-Z0-9]*)\\b",
							 "dailymotion":"^(http:\/\/)([a-zA-Z]{2,3}\.)?(dailymotion\.com)\/video\/([a-zA-Z0-9-]+)"
							};
				//mayb later: http://oembed.com/
				var embedurls = {"vimeo":"http://player.vimeo.com/video/",
							 "youtube":"http://www.youtube.com/embed/",
							 "funnyordie":"http://www.funnyordie.com/embed/",
							 "dailymotion":"http://www.dailymotion.com/embed/video/"
							};

				var messages = doc.getElementsByClassName("message");
			//	var signatures = doc.getElementsByClassName("signature");
			//	messages = Array.prototype.slice.call(messages);
			//	signatures = Array.prototype.slice.call(signatures);
			//	var messages = messages.concat(signatures);
				
				for(var i = 0; i < messages.length; ++i)
				{
					var media_links = [];
					var links = messages[i].getElementsByTagName('a');						
					for (var j = 0; j < links.length; ++j ) {

						var linkMap = {"site":null,"videoId":null, "link":links[j]};
						var matches,re,matches = null;
						
						if(do_embed_youtube_videos && !linkMap["site"]){
							re = new RegExp( regex["youtube"] );
							matches = re.exec(links[j].href)
							if(matches)
								linkMap["site"] = "youtube";
						}
						if(do_embed_vimeo_videos && !linkMap["site"]){
							re = new RegExp( regex["vimeo"] );
							matches = re.exec(links[j].href)
							if(matches)
								linkMap["site"] = "vimeo";
						}
						if(do_embed_funnyordie_videos && !linkMap["site"]){
							re = new RegExp( regex["funnyordie"] );
							matches = re.exec(links[j].href)
							if(matches)
								linkMap["site"] = "funnyordie";
						}
						if(do_embed_dailymotion_videos && !linkMap["site"]){
							re = new RegExp( regex["dailymotion"] );
							matches = re.exec(links[j].href)
							if(matches)
								linkMap["site"] = "dailymotion";
						}
						
						if(!linkMap["site"])
							continue;
							
						if(linkMap["site"] == "youtube"){
							linkMap["videoId"] = matches[5]?matches[5]:(matches[6]?matches[6]:null);
							if(linkMap["link"].href.match("user\/"+linkMap["videoId"]))
								linkMap["videoId"] = null;
						} else if (linkMap["site"] == "vimeo"){
							linkMap["videoId"] = matches[4]?matches[4]:null;
						} else if (linkMap["site"] == "funnyordie"){
							linkMap["videoId"] = matches[5]?matches[5]:null;
						} else if (linkMap["site"] == "dailymotion"){
							linkMap["videoId"] = matches[4]?matches[4]:null;
						}
						
						if(!linkMap["videoId"] || !linkMap["link"] || !linkMap["site"])
							continue;
							
						media_links.push(linkMap);
					}
					for (var j = 0; j < media_links.length; ++j ) {						
						var site = media_links[j]["site"];
						var videoId = media_links[j]["videoId"];
						var link = media_links[j]["link"];
						var src = null;
						if ( site == "youtube" && do_embed_youtube_videos) {
							src = embedurls["youtube"] + videoId;
						} else if( site == "vimeo" && do_embed_vimeo_videos) {
							src = embedurls["vimeo"] + videoId;
						} else if( site == "funnyordie" && do_embed_funnyordie_videos){
							src = embedurls["funnyordie"] + videoId;
						} else if( site == "dailymotion" && do_embed_dailymotion_videos){
							src = embedurls["dailymotion"] + videoId;
						} else 
							continue;
						
						if(!src)
							continue;
							
						try {
							var embed = function(src, link){
								var iframe = doc.createElement('iframe');
								iframe.setAttribute('width', "400");
								iframe.setAttribute('height', "334");
								iframe.setAttribute('src', src);
								iframe.setAttribute('frameborder','0');
								link.parentNode.replaceChild(iframe,link);
							}
							var div = doc.createElement('div');
							var header_a = doc.createElement('a');
							header_a.textContent = link.textContent;
							header_a.href=link.href
							div.appendChild(header_a)
							Foxtrick.addClass(div, 'ft-media-expander-unexpanded ' + site); 
							link.parentNode.insertBefore(div, link);
							var videocontainer = doc.createElement('div');
							Foxtrick.addClass(videocontainer, 'hidden ft-media-container')
							var a = doc.createElement('a');
							a.href = src
							videocontainer.appendChild(a);
							link.parentNode.replaceChild(videocontainer, link);
							Foxtrick.listen(div, "click", function(ev){
								if(!Foxtrick.hasClass(ev.target.nextSibling,'ft-media-embedded')){
									embed(ev.target.nextSibling.firstChild.href, ev.target.nextSibling.firstChild);
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
							continue;
						} 
						catch(e){
							Foxtrick.log("MEDIA REPLACE", e);
						}
					}
				}
			} catch(e){
				Foxtrick.log("MEDIA REPLACE", e);
			}
		}
	}
});
