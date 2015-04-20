'use strict';
/**
* forum-change-posts.js
* Foxtrick Copies post id to clipboard
* @author convinced
*/

Foxtrick.modules['ForumChangePosts'] = {
	CORE_MODULE: true,
	PAGES: ['forumViewThread'],
	CSS: Foxtrick.InternalPath + 'resources/css/forum-change-post.css',

	run: function(doc) {
		var addCopyPostId = function(idLink) {
			// part of copypostid
			var link = doc.createElement('a');
			link.className = 'ft-copy-small ft-link';
			link.title = Foxtrick.L10n.getString('copy.postid');
			link = Foxtrick.makeFeaturedElement(link, Foxtrick.modules.CopyPostID);
			var img = doc.createElement('img');
			img.src = '/Img/Icons/transparent.gif';
			link.appendChild(img);
			Foxtrick.onClick(img, function() {
				var idExpanded = (idLink.href.search(/MInd/i) >= 0);
				var postId = idExpanded ? idLink.href.match(/\d+\.\d+/g)[0] : idLink.title;
				Foxtrick.copyStringToClipboard('[post=Oops]'.replace('Oops', postId));
				var insertBefore = idLink;
				while (!Foxtrick.hasClass(insertBefore, 'cfWrapper') &&
				       !Foxtrick.hasClass(insertBefore, 'boxBody'))
					insertBefore = insertBefore.parentNode;

				var id = 'ft-post-id-copy-note-' + postId.replace(/\D/g, '-');
				var note = Foxtrick.L10n.getString('copy.postid.copied').replace('%s', postId);
				Foxtrick.util.note.add(doc, note, id, { at: insertBefore });
			});
			idLink.parentNode.insertBefore(link, idLink);
		};
		var copy_posting_to_clipboard = function(ev) {
			try {
				var doc = ev.target.ownerDocument;
				var copy_style = 'ht-ml';
				var header = null;

				// find header
				var is_archive_link = ev.target.getAttribute('is_archive_link') == 'true';
				if (!is_archive_link) {
					var post_nr = ev.target.getAttribute('post_nr');
					header = doc.getElementById('ft_copy_posting_link_id' + post_nr);
					while (header && !Foxtrick.hasClass(header, 'cfHeader')) {
						header = header.parentNode;
					}

					copy_style = ev.target.getAttribute('copy_style');
					if (copy_style == 'last')
						Foxtrick.Prefs.getString('CopyPostingStyle');
					else
						Foxtrick.Prefs.setString('CopyPostingStyle', copy_style);
				}
				else {
					var cfWrapper = ev.target;
					while (cfWrapper && !Foxtrick.hasClass(cfWrapper, 'cfWrapper')) {
						cfWrapper = cfWrapper.parentNode;
					}
					if (cfWrapper)
						header = cfWrapper.getElementsByClassName('cfHeader')[0];
				}
				if (!header) {
					Foxtrick.error('CopyPosting: post header not found');
					return;
				}

				// get message content
				var opts = {
					external: copy_style == 'wiki' || copy_style == 'md',
					format: copy_style != 'md' ? 'htMl' : 'md',
				};
				var msg = header.parentNode.getElementsByClassName('message')[0];
				var message = Foxtrick.util.htMl.getMarkupFromNode(msg, opts);

				// parse header
				var header_left = null;
				var header_right = null;
				var k = 0, header_part;
				while ((header_part = header.childNodes[k++])) {
					if (Foxtrick.hasClass(header_part, 'float_left'))
						header_left = header_part;
					if (!header_right && Foxtrick.hasClass(header_part, 'float_right')) {
						header_right = header_part;
					}
				}

				// the only text node of head_right, which contains date and time
				var header_right_text = '';
				var header_right_text_node = Foxtrick.nth(function(node) {
					return node.nodeType === Foxtrick.NodeTypes.TEXT_NODE;
				}, header_right.childNodes);
				if (header_right_text_node)
					header_right_text = header_right_text_node.textContent;

				// get datetime
				var date = header_right_text.replace(/^ /, '');
				var time = '';
				// time unaltered
				if (date.search(/\d+:\d+/) === 0) {
					var cur_time = doc.getElementById('time').textContent;
					var hi = cur_time.search(/\d+:\d+/);
					time = date;
					date = cur_time.substring(0, hi);
				}
				// date hidden by forumalterheaderline
				else if (!/\d+:\d+/.test(date)) {
					var span = header_right.getElementsByTagName('span')[0];
					if (span)
						time = span.title;
					else
						time = date;
				}
				var fulldate = date + time;

				var post_1 = {};
				var post_2 = {};
				var post = post_1;
				var author_1 = {};
				var author_2 = {};
				var author = author_1;

				// get post_links, poster_links, poster_id from header
				var header_left_links = header_left.getElementsByTagName('a');
				var k = 0, header_left_link;
				while ((header_left_link = header_left_links[k++])) {

					var isJsLink = /javascript/.test(header_left_link.href);
					var isShowMInd = /showMInd/.test(header_left_link.href);
					var isPostLink = /Forum\/Read\.aspx/.test(header_left_link.href);
					var isManagerLink = /Club\/Manager\/\?userId=/i.test(header_left_link.href);
					var isPopupLink = header_left_link.parentNode.tagName == 'LI';
					// test if next link is a supporter link
					var hasSupporter = header_left_links[k] &&
						/Supporter/i.test(header_left_links[k].href);

					if (isJsLink) {
						var post_id = isShowMInd ? header_left_link.href : header_left_link.title;
						post.id = post_id.match(/(\d+\.\d+)/)[1];
						post.link = header_left_link;
						post = post_2;
					}
					else if (isPostLink) {
						post.id = header_left_link.title;
						post.link = header_left_link;
						post = post_2;
					}
					else if (isManagerLink && !isPopupLink) {
						author.link = header_left_link;
						author.name = author.link.title;
						author.id = author.link.href.match(/\?userId=(\d+)/i)[1];
						if (hasSupporter) {
							author.sup = header_left_links[k];
						}
						author = author_2;
					}
				}
				if (!('name' in author_2))
					author_2.name = 'Everyone';
				if (!('id' in post_2))
					post_2.id = post_1.id;

				var template = '';
				var args = {};

				if (copy_style == 'raw') {
					template = '{}\n{}: {} » {}\n{}\n';
					args = [
						fulldate,
						post_1.id,
						author_1.name,
						author_2.name,
						message
					];
				}
				else if (copy_style == 'ht-ml') {
					template = '[q={}][post={}]\n{}\n[/q]\n';
					args = [author_1.name, post_1.id, message];
				}
				else if (copy_style == 'wiki') {
					template = '{{forum_message|\n| from = [ [ {poster1} ] ]\n| to = {poster2}\n' +
						'| msgid = {post_id1}\n| prevmsgid = {post_id2}\n' +
						'| datetime = {datetime}\n| keywords = \n| text =\n{message}\n}}\n';
					args = {
						poster1: author_1.name,
						post_id1: post_1.id,
						poster2: author_2.name,
						post_id2: post_2.id,
						datetime: fulldate,
						message: message
					};
				}
				else if (copy_style == 'md') {
					template = '**From:** {poster1}\n**PostID:** [{post_id1}]({post_url1})\n' +
						'**To:** {poster2}\n**Re:** [{post_id2}]({post_url2})\n' +
						'**Datetime:** {datetime}\n**Message:**\n\n{message}\n';
					args = {
						poster1: author_1.name,
						post_id1: post_1.id,
						post_url1: Foxtrick.getForumUrl(post_1.id),
						poster2: author_2.name,
						post_id2: post_2.id,
						post_url2: Foxtrick.getForumUrl(post_2.id),
						datetime: fulldate,
						message: message
					};
				}

				var copy = Foxtrick.format(template, args);
				Foxtrick.copyStringToClipboard(copy);

				var insertBefore = header.parentNode;
				var id = 'ft-posting-copy-note- ' + post_1.id.replace(/\D/, ' - ');
				var note = Foxtrick.L10n.getString('copy.posting.copied').replace('%s', post_1.id);
				Foxtrick.util.note.add(doc, note, id, { at: insertBefore });
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};



		var do_copy_post_id = Foxtrick.Prefs.isModuleEnabled('CopyPostID');
		var do_copy_posting = Foxtrick.Prefs.isModuleEnabled('CopyPosting');
		var do_default_facecard = Foxtrick.Prefs.isModuleEnabled('AddDefaultFaceCard');
		var do_format_text = Foxtrick.Prefs.isModuleEnabled('FormatPostingText');
		var do_move_links = Foxtrick.Prefs.isModuleEnabled('MoveLinks');
		var do_redir_to_team = Foxtrick.Prefs.isModuleEnabled('ForumRedirManagerToTeam');

		var do_alter_header = Foxtrick.Prefs.isModuleEnabled('ForumAlterHeaderLine');
			var do_single_header = do_alter_header &&
				Foxtrick.Prefs.isModuleOptionEnabled('ForumAlterHeaderLine', 'SingleHeaderLine');
			var do_small_header_font = do_alter_header &&
				Foxtrick.Prefs.isModuleOptionEnabled('ForumAlterHeaderLine', 'SmallHeaderFont');
			var do_single_header_allways = do_alter_header && do_single_header &&
				!Foxtrick.Prefs.isModuleOptionEnabled('ForumAlterHeaderLine', 'CheckDesign');
			var do_truncate_nicks = do_alter_header &&
				Foxtrick.Prefs.isModuleOptionEnabled('ForumAlterHeaderLine', 'TruncateLongNick');
			var do_truncate_seriesname = do_alter_header &&
				Foxtrick.Prefs.isModuleOptionEnabled('ForumAlterHeaderLine', 'TruncateLeagueName');
			var do_hide_old_time = do_alter_header &&
				Foxtrick.Prefs.isModuleOptionEnabled('ForumAlterHeaderLine', 'HideOldTime');
			var do_short_postid = do_alter_header &&
				Foxtrick.Prefs.isModuleOptionEnabled('ForumAlterHeaderLine', 'ShortPostId');
			var do_replace_supporter_star = do_alter_header &&
				Foxtrick.Prefs.isModuleOptionEnabled('ForumAlterHeaderLine', 'ReplaceSupporterStar');
			var do_HighlightThreadOpener = do_alter_header &&
				Foxtrick.Prefs.isModuleOptionEnabled('ForumAlterHeaderLine', 'HighlightThreadOpener');

		var hasScroll = Foxtrick.util.layout.mainBodyHasScroll(doc);
		var notif = Foxtrick.Pages.All.getNotes(doc);
		// archived threads will have this message: 'This thread is closed!'
		var isArchive = notif.getElementsByClassName('error').length > 0;

		// part of copy_posting_link
		var copy_posting_img = doc.createElement('img');
		copy_posting_img.src = '/Img/Icons/transparent.gif';
		copy_posting_img.title = Foxtrick.L10n.getString('copy.posting.title')
			.replace('%s', Foxtrick.L10n.getString('copy.posting.style.last'));
		copy_posting_img.setAttribute('copy_style', 'last');

		var copy_posting_div = Foxtrick.createFeaturedElement(doc, Foxtrick.modules.CopyPosting,
		                                                      'div');
		if (Foxtrick.util.layout.isSupporter(doc))
			copy_posting_div.className = 'ft-pop-up-container ft-copy';
		else
			copy_posting_div.className = 'ft-pop-up-container ft-copy-small';
		copy_posting_div.appendChild(copy_posting_img);

		var possibleStyles = ['ht-ml', 'wiki', 'raw', 'md'];
		var list = doc.createElement('ul');
		list.className = 'ft-pop right top';
		for (var i = 0; i < possibleStyles.length; ++i) {
			var item = doc.createElement('li');
			var link = doc.createElement('span');
			link.setAttribute('copy_style', possibleStyles[i]);
			var style = Foxtrick.L10n.getString('copy.posting.style.' + possibleStyles[i]);
			link.textContent = Foxtrick.L10n.getString('copy.posting').replace('%s', style);
			link.title = Foxtrick.L10n.getString('copy.posting.title').replace('%s', style);
			item.appendChild(link);
			list.appendChild(item);
		}
		copy_posting_div.appendChild(list);

		var copy_posting_link_archive = doc.createElement('a');
		copy_posting_link_archive.title = Foxtrick.L10n.getString('copy.posting.title')
			.replace('%s', Foxtrick.L10n.getString('copy.posting.style.ht-ml'));
		copy_posting_link_archive.setAttribute('is_archive_link', 'true');
		copy_posting_link_archive.textContent = Foxtrick.L10n.getString('button.copy');
		copy_posting_link_archive.setAttribute('class', 'foxtrick-copyfromarchive ft-link');
		copy_posting_link_archive = Foxtrick.makeFeaturedElement(copy_posting_link_archive,
		                                                         Foxtrick.modules.CopyPosting);
		Foxtrick.onClick(copy_posting_link_archive, copy_posting_to_clipboard);

		// part of alter header
		var trunclength = 14;

		var doubleHeaderStyle = 'height:30px !important; ';
		var alt_supporter = doc.createElement('a');
		alt_supporter.href = '/Help/Supporter/';
		alt_supporter.textContent = ' * ';
		alt_supporter.title = 'Hattrick Supporter';

		if (do_HighlightThreadOpener) try {
			var Ftag = doc.getElementById('ctl00_ucGuestForum_ucGuestForum_updMain');
			if (!Ftag)
				Ftag = doc.getElementById('myForums');
			if (Ftag) {
				Ftag = Ftag.getElementsByTagName('strong')[0];
				var TName = Ftag.textContent;
				var TName_lng = Ftag.parentNode.getAttribute('data-author');
			} else var TName_lng = false;
		} catch (e_tag) {
			Foxtrick.dump('HTO ' + e_tag + '\n'); var TName_lng = false;
		}

		if (do_format_text) {
			try {
				var HideLevel =
					Foxtrick.Prefs.getString('module.FormatPostingText.NestedQuotesAsSpoilers_text');
				var numSpoilerQuotes = 0;

				var getQuotes = function(node, level, spoilers) {
					if (level == HideLevel && node.getElementsByClassName('quote').length >= 0) {
						var spoiler_show = Foxtrick
							.createFeaturedElement(doc, Foxtrick.modules.FormatPostingText,
							                       'blockquote');
						spoiler_show.id = 'spoilshow_quoteNum' + (++numSpoilerQuotes);
						spoiler_show.className = 'spoiler ft-link';
						var open_link = doc.createElement('a');
						open_link.setAttribute('spoilerID', numSpoilerQuotes);
						open_link.textContent =
							Foxtrick.L10n.getString('FormatPostingText.ShowNestedQuotes');
						Foxtrick.onClick(open_link, function(ev) {
							var id = ev.target.getAttribute('spoilerID');
							Foxtrick.toggleClass(doc.getElementById('spoilhid_quoteNum' + id),
							                     'hidden');
							Foxtrick.toggleClass(doc.getElementById('spoilshow_quoteNum' + id),
							                     'hidden');
						});
						spoiler_show.appendChild(open_link);

						var spoiler_hidden = doc.createElement('blockquote');
						spoiler_hidden.id = 'spoilhid_quoteNum' + numSpoilerQuotes;
						spoiler_hidden.className = 'spoiler hidden';
						spoiler_hidden.appendChild(node.cloneNode(true));
						node.parentNode.insertBefore(spoiler_show, node.nestSibling);
						node.parentNode.removeChild(node);
						spoilers.push([spoiler_show, spoiler_hidden]);

					}
					else {
						var quoteNodes = node.getElementsByClassName('quote');
						for (var j = 0; j < quoteNodes.length; ++j)
							getQuotes(quoteNodes[j], level + 1, spoilers);
					}
				};

				var messages = doc.getElementsByClassName('message');
				Foxtrick.forEach(function(message) {
					Foxtrick.renderPre(message);

					if (Foxtrick.Prefs.isModuleOptionEnabled('FormatPostingText',
					    'NestedQuotesAsSpoilers')) {
						var spoilers = [];

						getQuotes(message, -1, spoilers);

						for (var j = 0; j < spoilers.length; ++j) {
							spoilers[j][0].parentNode.insertBefore(spoilers[j][1],
							                                       spoilers[j][0].nextSibling);
						}
					}
				}, messages);

			} catch (e) {
				Foxtrick.log('FORMAT TEXT ', e);
			}
		}

		// loop through cfWrapper --------------------------------------------
		var num_wrapper = 0;  // message counter
		var wrappers = doc.getElementsByClassName('cfWrapper');
		var i = 0, wrapper;
		while ((wrapper = wrappers[i++])) {
			if (wrapper.getElementsByClassName('cfDeleted').length > 0)
				continue; // post deleted, process next
			var header = wrapper.getElementsByClassName('cfHeader')[0];

			// +++++++++++ gather info and nodes +++++++++++++++++++++++++
			var header_left = header.getElementsByClassName('float_left')[0];
			var header_right = header.getElementsByClassName('float_right')[0];
			var header_right_inner = header_right.getElementsByTagName('div')[0] || header_right;

			// get post_links, poster_links, poster_id from header
			var header_left_links = header_left.getElementsByTagName('a');
			var post_link1 = null;
			var poster_link1 = null;
			var poster_id1 = null;
			var post_link2 = null;
			var poster_link2 = null;
			var poster_id2 = null;
			var supporter_link1 = null;
			var supporter_link2 = null;
			var series_link1 = null;
			var series_link2 = null;
			var is_ignored = false;
			if (do_single_header && header_right) {
				var header_right_links = header_right.getElementsByTagName('a');
				var k = 0, header_right_link;
				while (header_right_link = header_right_links[k++]) {
					var header_right_link_onclick = header_right_link.getAttribute('onclick');
					if (header_right_link_onclick &&
					    /jQuery\('#\d+'\).toggle\(\)/.test(header_right_link_onclick)) {
						is_ignored = true;
						header_right_link.parentNode.setAttribute('style', 'margin-left:3px;');
						break;
					}
				}
			}

			var k = 0, header_left_link;
			var bDetailedHeader = !/showMInd/.test(header_left_links[0].href);
			while (header_left_link = header_left_links[k++]) {
				if (!poster_link1) {
					if (header_left_link.href.search(/showMInd|Forum\/Read\.aspx/) != -1)
						post_link1 = header_left_link;
					else if (header_left_link.href.search(/Club\/Manager\/\?userId=/i) != -1
							 && header_left_link.parentNode.tagName != 'LI') { //skip popup-links
						poster_link1 = header_left_link;

						poster_id1 = poster_link1.href.replace(/\&browseIds.+/, '').match(/\d+$/);

						if (header_left_links[k]
							&& header_left_links[k].href.search(/Supporter/i) != -1) {
								supporter_link1 = header_left_links[k];
						}
					}
				}
				else if (!poster_link2 || !post_link2) {
					if (header_left_link.href.search(/showMInd|Forum\/Read\.aspx/) != -1)
						post_link2 = header_left_link;
					else if (header_left_link.href.search(/Club\/Manager\/\?userId=/i) != -1
							 && header_left_link.parentNode.tagName != 'LI') { //skip popup-links
						poster_link2 = header_left_link;
						poster_id2 = poster_link2.href.replace(/\&browseIds.+/, '').match(/\d+$/);
						if (header_left_links[k]
							&& header_left_links[k].href.search(/Supporter/i) != -1) {
							supporter_link2 = header_left_links[k];
						}
					}
				}
				if (!series_link1 && header_left_link.href.search(/LeagueLevelUnitID/i) != -1)
					series_link1 = header_left_link;
				else if (header_left_link.href.search(/LeagueLevelUnitID/i) != -1)
					series_link2 = header_left_link;
			}

			// get user, user_info, user_avater: all maybe = null !!!
			var user = null;
			var user_avatar = null;
			var user_info = null;
			var message = null;
			var footer = null;

			var divs = wrapper.getElementsByTagName('div');
			var k = 2, div;
			while (div = divs[++k]) {
				if (div.className == 'cfUser') user = div;
				else if (div.className == 'cfUserInfo') user_info = div;
				else if (div.className == 'faceCard') user_avatar = div;
				else if (div.className == 'cfMessage') message = div;
				else if (div.className == 'cfFooter') footer = div;
			}

			// get info & nodes from user_info
			var teamid = null;
			var teamname = null;
			var seriesId = null;
			var countryLink = null;
			var seriesLinkUserInfo = null;
			if (user_info) {
				var user_info_links = user_info.getElementsByTagName('a');
				var k = 0, user_info_link;
				while (user_info_link = user_info_links[++k]) {
					if (user_info_link.href.search(/teamid=/i) != -1) {
						var teamid = user_info_link.href.match(/\d+$/);
						var teamname = user_info_link.textContent;
						// set some info used for teampopup
						poster_link1.setAttribute('teamid', teamid);
						poster_link1.setAttribute('teamname', teamname);
					}
					if (user_info_link.href.search(/LeagueID=/i) != -1) {
							countryLink = user_info_link;
					} else if (user_info_link.href.search(/LeagueLevelUnitID=/i) != -1) {
							seriesLinkUserInfo = user_info_link;
							seriesId =
								Foxtrick.util.id.getLeagueLeveUnitIdFromUrl(user_info_link.href);
					}
				}
			} // get user info

			// +++++++++++++ modules +++++++++++++++++++++++++++++++++++

			// copy post id ---------------------------------------------
			if (do_copy_post_id) {
				addCopyPostId(post_link1);
			}  // end copy post id

			// copy posting ---------------------------------------------
			if (do_copy_posting) {
				var copy_div = copy_posting_div.cloneNode(true);
				var copy_img = copy_div.getElementsByTagName('img')[0];
				copy_img.id = 'ft_copy_posting_link_id' + num_wrapper;
				Foxtrick.onClick(copy_img, copy_posting_to_clipboard);
				copy_img.setAttribute('post_nr', num_wrapper);
				var copy_links = copy_div.getElementsByTagName('span');
				for (var cl = 0; cl < possibleStyles.length; ++cl) {
					Foxtrick.onClick(copy_links[cl], copy_posting_to_clipboard);
					copy_links[cl].setAttribute('post_nr', num_wrapper);
				}
				header_right_inner.appendChild(copy_div);

				if (isArchive) {
					var copy_link = copy_posting_link_archive.cloneNode(true);
					Foxtrick.onClick(copy_link, copy_posting_to_clipboard);
					var footer_left = footer.getElementsByTagName('div')[0];
					footer_left.insertBefore(copy_link, footer_left.firstChild);
				}
			}  // end copy posting

			if (do_hide_old_time) {
				var node = header_right.firstChild;
				while (node) {
					if (node.textContent && node.textContent
					    .search(/ \d{1,4}.*?\d{1,2}.*?\d{1,4}.*? \d+:\d+/gi) != -1) {
						var span = doc.createElement('span');
						span.textContent = node.textContent
							.replace(/ (\d{1,4}.*?\d{1,2}.*?\d{1,4}.*?)(\d+:\d+)/gi, '$1');
						span.title = node.textContent
							.replace(/ (\d{1,4}.*?\d{1,2}.*?\d{1,4}.*?)(\d+:\d+)/gi, '$2');
						node.parentNode.replaceChild(span, node);
						break;
					}
					node = node.nextSibling;
				}
			}

			// redir to team ------------------------------------------
			if (do_redir_to_team) {
				poster_link1.href += '&redir_to_team=true';
				if (poster_link2) poster_link2.href += '&redir_to_team=true';
			}

			// move links -----------------------------------------
			if (do_move_links && countryLink && seriesLinkUserInfo) {
				var placenode = supporter_link1 || poster_link1;
				// find the ancestor that is a direct child of header_left
				while (!Foxtrick.hasClass(placenode.parentNode, 'float_left'))
					placenode = placenode.parentNode;
				if (placenode.nodeName !== 'BDO') {
					// false: 'Show detailed post header' is activated; don't run
					var space = doc.createTextNode(' ');
					header_left.insertBefore(space, placenode.nextSibling);
					header_left.insertBefore(seriesLinkUserInfo, space);
					header_left.insertBefore(countryLink, seriesLinkUserInfo);
					header_left.insertBefore(space.cloneNode(false), countryLink);
				}

			}

			// single header line ---------------------------------------
			if (do_truncate_nicks) {
				var userName1 = poster_link1.textContent;
				if (userName1.length > trunclength) {
					poster_link1.setAttribute('title', userName1);
					poster_link1.textContent = userName1.substr(0, trunclength - 2) + '..';
				}
				if (poster_link2) {
					var userName2 = poster_link2.textContent;
					if (userName2.length > trunclength) {
						poster_link2.setAttribute('title', userName2);
						poster_link2.textContent = userName2.substr(0, trunclength - 2) + '..';
					}
				}
				if (series_link1) {
					var series_name1 = series_link1.textContent;
					if (series_name1.length > trunclength) {
						series_link1.setAttribute('title', series_name1);
						series_link1.textContent = series_name1.substr(0, trunclength - 2) + '..';
					}
				}
				if (series_link2) {
					var series_name2 = series_link2.textContent;
					if (series_name2.length > trunclength) {
						series_link2.setAttribute('title', series_name2);
						series_link2.textContent = series_name2.substr(0, trunclength - 2) + '..';
					}
				}
			}

			if (do_truncate_seriesname) {
				if (series_link1) {
					series_link1.textContent = series_link1.textContent.replace(/\..+/, '');
					if (series_link1.textContent.length > 3 && series_link1.textContent != 'VIII')
						series_link1.textContent = 'I';
				}
				if (series_link2) {
					series_link2.textContent = series_link2.textContent.replace(/\..+/, '');
					if (series_link2.textContent.length > 3 && series_link2.textContent != 'VIII')
						series_link2.textContent = 'I';
				}
			}

			if (do_short_postid && bDetailedHeader) {
				var PostID_message = post_link1.title.replace(/\d+\./, '');
				if (!do_copy_post_id && !post_link1.id) {
					var PostID_thread = post_link1.title.replace(/\.\d+/g, '');
					post_link1.removeAttribute('href');
					Foxtrick.addClass(post_link1, 'ft-link');
					Foxtrick.onClick(post_link1, function(ev) {
						var PostID_message = ev.target.id.replace(/\d+-/, '');
						var PostID_thread = ev.target.id.replace(/-\d+/, '');
						if (ev.target.textContent.indexOf(PostID_thread + '.' +
						    PostID_message) == -1)
							ev.preventDefault();
						ev.target.textContent = PostID_thread + '.' + PostID_message;
						ev.target.href = '/Forum/Read.aspx?t=' + PostID_thread + '&n=' +
							PostID_message;
					});
					post_link1.setAttribute('id', PostID_thread + ' - ' + PostID_message);
				}
				post_link1.textContent = String(PostID_message);

				if (post_link2) {
					var PostID_message = post_link2.title.replace(/\d+\./, '');
					post_link2.textContent = String(PostID_message);
				}

			}
			if (do_replace_supporter_star) {
				if (supporter_link1) {
					poster_link1.parentNode.insertBefore(alt_supporter.cloneNode(true),
					                                     poster_link1.nextSibling);
				}
				if (supporter_link2 && poster_link2) {
					poster_link2.parentNode.insertBefore(alt_supporter.cloneNode(true),
					                                     poster_link2.nextSibling);
				}
			}

			if (do_HighlightThreadOpener && TName_lng) {
				try {
					if (poster_link1.textContent == TName_lng) {
						post_link1.setAttribute('class', 'ft_slH_PID_left');
					}
					else if (poster_link2 && poster_link2.textContent == TName_lng) {
						post_link2.setAttribute('class', 'ft_slH_PID_right');
					}
				}
				catch (e) {
					Foxtrick.log(e);
				}
			}

			if (do_single_header && is_ignored && header.className == 'cfHeader doubleLine') {
				wrapper.setAttribute('style', 'margin-bottom: 20px !important;');
			}
			// end single header line

			// add default facecard ----------------------------
			if (do_default_facecard && user && !user_avatar) {
				var user_avatar = Foxtrick
					.createFeaturedElement(doc, Foxtrick.modules.AddDefaultFaceCard, 'div');
				user_avatar.className = 'faceCard';
				user_avatar.style.backgroundImage = "url('/Img/Avatar/silhouettes/sil1.png')";
				user.insertBefore(user_avatar, user.firstChild);
			}

			++num_wrapper;
		}
		Foxtrick.modules['ForumAlterHeaderLine'].ensureUnbrokenHeaders(doc);
	}
};
