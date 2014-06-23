'use strict';
/**
* embed-media.js
* Foxtrick Embedding for links to media files.
* @author CatzHoek
*/

Foxtrick.modules['EmbedMedia'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: ['forumViewThread'],
	NICE: 1,
	OPTIONS: [
		['EmbedGenericImages', 'EmbedGenericImagesClever', 'EmbedImageshack'],
		'EmbedYoutubeVideos', 'EmbedVimeoVideos', 'EmbedDailymotionVideos',
		['EmbedModeOEmebed', 'ReplaceLinksByTitles', 'EmbedFlickrImages', 'EmbedDeviantArtImages',
			'EmbedSoundCloud']
	],
	CSS: Foxtrick.InternalPath + 'resources/css/embed-media.css',

	run: function(doc) {

		var do_embed_youtube_videos = Foxtrick.Prefs.isModuleOptionEnabled('EmbedMedia',
		                                                                  'EmbedYoutubeVideos');
		var do_embed_vimeo_videos = Foxtrick.Prefs.isModuleOptionEnabled('EmbedMedia',
		                                                                'EmbedVimeoVideos');
		var do_embed_dailymotion_videos =
			Foxtrick.Prefs.isModuleOptionEnabled('EmbedMedia', 'EmbedDailymotionVideos');

		var oembed_enabled = Foxtrick.Prefs.isModuleOptionEnabled('EmbedMedia', 'EmbedModeOEmebed');
		var do_replaceLinksByTitles = oembed_enabled &&
			Foxtrick.Prefs.isModuleOptionEnabled('EmbedMedia', 'ReplaceLinksByTitles');
		var do_embed_soundcloud = oembed_enabled &&
			Foxtrick.Prefs.isModuleOptionEnabled('EmbedMedia', 'EmbedSoundCloud');
		var do_embed_flickr_images = oembed_enabled &&
			Foxtrick.Prefs.isModuleOptionEnabled('EmbedMedia', 'EmbedFlickrImages');
		var do_embed_deviantart_images = oembed_enabled &&
			Foxtrick.Prefs.isModuleOptionEnabled('EmbedMedia', 'EmbedDeviantArtImages');

		var do_embed_generic_images = Foxtrick.Prefs.isModuleOptionEnabled('EmbedMedia',
		                                                                  'EmbedGenericImages');
		var do_embed_generic_images_clever = do_embed_generic_images &&
			Foxtrick.Prefs.isModuleOptionEnabled('EmbedMedia', 'EmbedGenericImagesClever');

		var do_embed_imageshack = Foxtrick.Prefs.isModuleOptionEnabled('EmbedMedia',
		                                                               'EmbedImageshack');

		var siteEnabled = {
			'youtube': do_embed_youtube_videos,
			'vimeo': do_embed_vimeo_videos,
			'dailymotion': do_embed_dailymotion_videos,
			'soundcloud': do_embed_soundcloud,
			'flickr': do_embed_flickr_images,
			'deviantart': do_embed_deviantart_images,
			'genericImage': do_embed_generic_images,
			'imgur': do_embed_generic_images_clever,
			'imageshack': do_embed_imageshack
		};

		var oEmbedRequest = function(url, callback) {
			Foxtrick.util.load.async(url, callback);
		};

		//Link validation regex, check if the link is supported by any means
		//for oembed (only) supported sites it's sufficient to ensure the delivering network is
		//correct, otherwise the regex has to grab all relevant data so we can build a correct
		//link later
		var filter_supported = {
			'deviantart': '^(?:https?://)?(?:www\\.)?fav\\.me/',
			'soundcloud': '^(?:https?://)?(?:\\w{2,3}\\.)?soundcloud\\.com/',
			'youtube': '^(?:https?://)?(?:\\w{2,3}\\.)?' +
				'(?:youtu\\.be/|youtube\\.\\w{2,3}(?:/embed/|/v/|/watch\\?(?:.+?&)?v=))' +
				'([\\w\\d-]{11})(?:.*)$',
			'vimeo': '^(?:https?://)?(?:\\w{2,3}\\.)?vimeo\\.com/(\\d+)',
			'flickr': '^(?:https?://)?(?:\\w{2,3}\\.)?flickr\\.com/',
			'dailymotion': '^(?:https?://)?(?:\\w{2,3}\\.)?dailymotion\\.com/' +
				'video/([\\w\\d-]+)',
			'imgur': '^(?:https?://)?imgur.com/([\\w\\d]+)$',
			'imageshack': '^(?:https?://)?(?:www)?imageshack\\.us/[\\w\\d.%~/-]+/(\\d+)/(\\w+)' +
				'.(gif|jpg|jpeg|png|bmp)(?:/|$)',
			'genericImage': '^(?:https?:)?//[\\w\\d.%~/+-]+(?:gif|jpg|jpeg|png|bmp)$'
		};

		var genericExludes = [
			'^(?:https?://)?(?:www\\.)?imageshack\\.us/',
			'^(?:https?://)?(?:www\\.)?dropbox\\.com/',
			'^(?:https?://)?(?:www\\.)?fotos-hochladen\\.net/view/',
		];

		//oEmbed supported sites need entries at this point
		var oembed_urls = {
			'vimeo': 'https://vimeo.com/api/oembed.json?maxwidth=400&url=',
			'youtube': 'https://www.youtube.com/oembed?format=json&maxwidth=400&url=',
			'dailymotion': 'https://www.dailymotion.com/services/oembed?format=json' +
				'&maxwidth=400&url=',
			'flickr': 'https://secure.flickr.com/services/oembed/?format=json&url=',
			'deviantart': 'http://backend.deviantart.com/oembed?format=json&url=',
			'soundcloud': 'https://soundcloud.com/oembed?format=json&show_comments=false&url='
		};

		// native and fallback support, base urls to be used when the video ID has been extracted.
		var iframe_urls = {
			'vimeo': 'http://player.vimeo.com/video/',
			'youtube': 'http://www.youtube.com/embed/',
			'dailymotion': 'http://www.dailymotion.com/embed/video/'
		};

		var do_iframe_embed = function(target) {
				var iframe = doc.createElement('iframe');
				iframe.setAttribute('width', '400');
				iframe.setAttribute('height', '334');
				iframe.setAttribute('src', target.nextSibling.firstChild.href);
				iframe.setAttribute('frameborder', '0');
				//link.parentNode.replaceChild(iframe,link);
				target.nextSibling.replaceChild(iframe, target.nextSibling.firstChild);

		};
		// Oembed replacement, requires pre-prepartion (link needs to be converted to div and needs
		// a first child to be altered)
		// http://oembed.com/
		var do_oEmbed = function(target, json) {
			var author = json.author_name ? json.author_name : 'Unknown Author';
			if (do_replaceLinksByTitles)
				target.firstChild.textContent = '(' + json.title + ')';

			var sanitize_oEmbed_Iframe = function(html) {
				var empty = doc.createTextNode('');
				var m = html.match(/<iframe [^>]+><\/iframe>/i);
				if (!m)
					return empty;

				var iframe = m[0];
				// iframe must have a valid source
				m = iframe.match(/src="(.+?)"/i);
				if (!m)
					return empty;

				var src = m[1];
				// src must have a different origin
				// only allow http, https, and relative protocols
				if (Foxtrick.isHtUrl(src) || !src.match(/^(https?:)?\/\//))
					return empty;

				var h = iframe.match(/height="(\d+)"/i);
				var w = iframe.match(/width="(\d+)"/i);

				var el = doc.createElement('iframe');
				el.setAttribute('src', src);
				el.setAttribute('frameborder', '0');
				el.setAttribute('allowfullscreen', '');
				el.height = h ? h[1] : 0;
				el.width = w ? w[1] : 0;
				return el;
			};

			switch (json.type) {
				case 'file':
				case 'photo':
					var img = doc.createElement('img');
					img.src = json.url;
					img.alt = json.title;
					Foxtrick.addClass(img, 'ft-oembed-image');
					img.title = json.provider_name + '\n' + json.title + '\nby ' + author;
					target.nextSibling.replaceChild(img, target.nextSibling.firstChild);
					break;
				case 'video':
					target.nextSibling.replaceChild(sanitize_oEmbed_Iframe(json.html),
													target.nextSibling.firstChild);
					break;
				default:
					target.nextSibling.replaceChild(sanitize_oEmbed_Iframe(json.html),
													target.nextSibling.firstChild);
					break;
			}
		};

		var doEmbedActualImageUrl = function(target) {
			var title = Foxtrick.L10n.getString('EmbedMedia.EmbeddedImage');
			target.nextSibling.firstChild.setAttribute('target', '_blank');
			Foxtrick.addImage(doc, target.nextSibling.firstChild,
			                  { src: target.nextSibling.firstChild.href, title: title, alt: title,
			                  class: 'ft-embeded-image' });
		};

		var extractMediaIdFromUrl = function(url, site) {
			var re = new RegExp(filter_supported[site], 'i');
			var matches = re.exec(url);
			var videoid	= null;
			switch (site) {
				case 'youtube':
				case 'vimeo':
				case 'dailymotion':
				case 'imgur':
					videoid = matches[1] || null;
					break;
				case 'imageshack':
					videoid	= matches[2] ? matches[2] : null;
					videoid = videoid + ', ' + matches[1] + ', ' + matches[3];
					break;
			}
			return videoid;
		};

		//get's theoretically supported media links from node
		//syntax errors or any other malisious error is not yet handled
		var getSupportedMediaLinksWithDetails = function(node) {
			var media_links = [];
			var all_links = node.getElementsByTagName('a');

			//iterate all links and see if any supported link is found
			Foxtrick.map(function(link) {
				var linkDict = { 'site': null, 'link': link };

				if (link.href.indexOf('format=json') == -1) {
				//check very rare case, like when explaining what oembed does and posting example url
					var key;
					for (key in filter_supported) {
						var re = new RegExp(filter_supported[key]);
						var matches = re.exec(link);
						//link passed regex, add to supported links
						if (matches) {
							//ignore imageshack pseudo-links detected as generic
							if (key == 'genericImage') {
								var excluded = Foxtrick.any(function(re) {
									return link.href.match(re);
								}, genericExludes);

								if (excluded)
									continue;
							}

							//but convert to generic if the users already pasted an image link
							if (key == 'imageshack' && link.href.match(/img\d+/))
								key = 'genericImage';

							//Opera would need permision for that workarround, FF and Chrome
							//don't seem to require it tho
							//dunno about safari
							if (key == 'imageshack' && Foxtrick.platform == 'Safari')
								continue;

							linkDict['site'] = key;
							if (key != 'genericImage' && key != 'imageshack')
								linkDict['mediaId'] = extractMediaIdFromUrl(link.href,
								                                            linkDict['site']);
							else if (key == 'imageshack') {
								var imageshack = extractMediaIdFromUrl(link.href, linkDict['site']);
								var params = imageshack.split(', ');
								linkDict['params'] = imageshack.split(', ');
							}
							media_links.push(linkDict);
							break;
						}
					}
				}
			}, all_links);

			return media_links;
		};

		//prepare a link for embedding

		var prepareLinkForEmbedding = function(media_link) {
			var div = Foxtrick.createFeaturedElement(doc, Foxtrick.modules.EmbedMedia, 'div');
			var header_a = doc.createElement('a');
			header_a.textContent = media_link['link'].textContent;
			header_a.href = media_link['link'].href;
			header_a.setAttribute('target', '_blank');

			div.appendChild(header_a);
			Foxtrick.addClass(div, 'ft-media-expander-unexpanded');
			Foxtrick.addClass(div, 'ft-media-site-' + media_link['site']);
			media_link['link'].parentNode.insertBefore(div, media_link['link']);
			var mediaContainer = doc.createElement('div');
			Foxtrick.addClass(mediaContainer, 'hidden ft-media-container');
			var a = doc.createElement('a');

			//adjust to correct media url used later
			if (media_link['site'] == 'imageshack') {
				if (media_link['params'].length == 3)
					a.href = 'https://imageshack.us/shareable/?i=' + media_link['params'][0] + '.' +
						media_link['params'][2] + '&s=' + media_link['params'][1];
			}
			else if (media_link['site'] == 'imgur')
				a.href = 'http://i.imgur.com/' + media_link['mediaId'] + '.jpg';
			else if (media_link['site'] == 'genericImage')
				a.href = media_link['link'].href;
			else if (oembed_enabled)
				a.href = media_link['link'].href;
			else
				a.href = iframe_urls[media_link['site']] + media_link['mediaId'];

			mediaContainer.appendChild(a);
			media_link['link'].parentNode.replaceChild(mediaContainer, media_link['link']);

			//setup click listener to actually embed/toggle visibility on demand
			Foxtrick.onClick(div, function(ev) {
				if (!Foxtrick.hasClass(ev.target.nextSibling, 'ft-media-embedded')) {
					embed(ev.target);
					//mark as embedded, no repetitive embedding needed
					Foxtrick.addClass(ev.target.nextSibling, 'ft-media-embedded');
				}
				Foxtrick.toggleClass(ev.target.nextSibling, 'hidden');
				if (Foxtrick.hasClass(ev.target, 'ft-media-expander-unexpanded')) {
					Foxtrick.removeClass(ev.target, 'ft-media-expander-unexpanded');
					Foxtrick.addClass(ev.target, 'ft-media-expander-expanded');
				} else {
					Foxtrick.removeClass(ev.target, 'ft-media-expander-expanded');
					Foxtrick.addClass(ev.target, 'ft-media-expander-unexpanded');
				}
			});
		};

		var embed = function(target) {
			if (Foxtrick.hasClass(target, 'ft-media-site-genericImage')
			|| Foxtrick.hasClass(target, 'ft-media-site-imgur')) {
				doEmbedActualImageUrl(target);
				return;
			}

			if (Foxtrick.hasClass(target, 'ft-media-site-imageshack')) {
				oEmbedRequest(target.nextSibling.firstChild.href,
				  function(response, status) {
					target.nextSibling.firstChild.href = response.match(/\?"(.*)":/)[1];
					doEmbedActualImageUrl(target);
				});
				return;
			}

			//Sites where IFrame and OEmbed is the only way out
			var key;
			for (key in oembed_urls)
			{
				if (!Foxtrick.hasClass(target, 'ft-media-site-' + key))
					continue;

				//oEmbed
				if (oembed_enabled) {
					var oEmbedRequestURL = oembed_urls[key] + target.firstChild.href;
					//load json from providers async
					Foxtrick.util.load.get(oEmbedRequestURL)('success',
					  function(response) {
						try {
							var json = JSON.parse(response);
							do_oEmbed(target, json);
						}
						catch (e) {
							Foxtrick.log('oEmbed error:', e.toString());
						}
					})('failure', function(code) {
						Foxtrick.log('Error loading embed code: ', oembed_urls[key] +
									 target.firstChild.href);
						target.nextSibling.textContent =
							Foxtrick.L10n.getString('oembed.badresponse');
					});
				}
				//iFrame
				else
					do_iframe_embed(target);

				break;
			}
		};

		//---------------------------------------------------------------------------------------
		//actually work on the site
		var messages = doc.getElementsByClassName('message');

		Foxtrick.map(function(message) {
			var found_media_links = getSupportedMediaLinksWithDetails(message);
			Foxtrick.map(function(media_link) {
				if (siteEnabled[media_link.site]) {
					prepareLinkForEmbedding(media_link);
				}
			}, found_media_links);

		}, messages);
	}
};
