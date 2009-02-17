/**
* forumchangeposts.js
* Foxtrick Copies post id to clipboard
* @author convinced
*/
  
var FoxtrickForumChangePosts = {

	MODULE_NAME : "ForumChangePosts",
	//MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	DEFAULT_ENABLED : true,

	init : function() {
		Foxtrick.registerPageHandler( 'forumViewThread',
			FoxtrickForumChangePosts );
	},
	
	run : function( page, doc ) { 
	try{
	
		var do_add_anchor = Foxtrick.isModuleEnabled(FoxtrickForumAnchors);
		var do_copy_post_id = Foxtrick.isModuleEnabled(FoxtrickCopyPostID); 
		var do_add_copy_icon = do_copy_post_id && Foxtrick.isModuleFeatureEnabled( FoxtrickCopyPostID, "AddCopyIcon"); 
		var do_single_single_click_to_seond_postid = do_copy_post_id && Foxtrick.isModuleFeatureEnabled( FoxtrickCopyPostID, "SecondPostIdOneClickLink"); 
		var do_hide_user_info = Foxtrick.isModuleEnabled(FoxtrickHideManagerAvatarUserInfo);
		var do_hide_avatar = Foxtrick.isModuleEnabled(FoxtrickHideManagerAvatar);				
		var do_default_facecard = !do_hide_avatar && Foxtrick.isModuleEnabled(FoxtrickAddDefaultFaceCard);				
		var do_move_links = Foxtrick.isModuleEnabled(FoxtrickMoveLinks);
		var do_alter_header = Foxtrick.isModuleEnabled(FoxtrickForumAlterHeaderLine);
		var do_alltid_flags = Foxtrick.isModuleEnabled( FoxtrickAlltidFlags ); 
		var do_redir_to_team = Foxtrick.isModuleEnabled( FoxtrickForumRedirManagerToTeam ); 
		var do_collapse_bookmarks = Foxtrick.isModuleEnabled( FoxtrickCollapseBookmarks ); 
		
		var do_single_header = do_alter_header && Foxtrick.isModuleFeatureEnabled( FoxtrickForumAlterHeaderLine, "SingleHeaderLine"); 
		var do_small_header_font = do_alter_header && Foxtrick.isModuleFeatureEnabled( FoxtrickForumAlterHeaderLine, "SmallHeaderFont"); 
		var do_single_header_allways = do_alter_header && do_single_header && !Foxtrick.isModuleFeatureEnabled( FoxtrickForumAlterHeaderLine, "CheckDesign"); 
		var do_truncate_nicks = do_alter_header && Foxtrick.isModuleFeatureEnabled( FoxtrickForumAlterHeaderLine, "TruncateLongNick"); 
			
		var hasScroll = Foxtrick.hasMainBodyScroll(doc);
		
		// part of FoxtrickAlltidflags
		var flagspage = "http://flags.alltidhattrick.org/userflags/";
		var linkpage = "http://stats.alltidhattrick.org/team/";
		var style ="margin-right:3px; margin-bottom:3px; padding-left:3px; " + 
					"background-repeat:repeat-x; background-position: 0% 50%;";
		//var link_to_alltid = (FoxtrickPrefs.getInt("module.FoxtrickAlltidFlags.value") == 1);
		//var redir_to_team = (FoxtrickPrefs.getInt("module.FoxtrickAlltidFlags.value") == 0);
		Foxtrick.addStyleSheet(doc, "chrome://foxtrick/content/"+
							"resources/css/linkscustom.css");
			
		// part of FoxtrickForumAnchors
		var anchor = doc.createElement( "a" );
        if (!hasScroll) anchor.href = "javascript:goAnchor('');";
		else anchor.href = "javascript:goAnchor('mainBody');";
		anchor.title = "TOP";
        var img = doc.createElement("img");
        img.setAttribute('style','margin-left:3px;');
        img.alt = "anchor_top";
        img.title = "Goto Top";
        img.src = "chrome://foxtrick/content/resources/linkicons/anchor_top.png";
        anchor.appendChild(img);                        
	
		// part of alter header
		var trunclength = 10;
		if (Foxtrick.isStandardLayout ( doc ) ) trunclength = 14;
		if (do_small_header_font) {
			var css = "chrome://foxtrick/content/resources/css/fixes/Forum_Header_Smallsize.css";
			Foxtrick.addStyleSheet ( doc, css );
		}
		var singleHeaderStyle = 'height:16px; '; 
		
		var num_wrapper = 0;  // message counter
		
		var alldivs = doc.getElementById('mainBody').childNodes;
		var i = 0, wrapper;
		while ( wrapper = alldivs[++i] ) {  
		  if ( wrapper.className=="cfWrapper" ) {
		    var allwrapperdivs = wrapper.childNodes;
		    var ii = 0, header;
		    while ( header = allwrapperdivs[++ii] ) {
			  if ( header.className && header.className.search(/cfHeader/)!=-1 ) {
				
				// +++++++++++ gather info and nodes +++++++++++++++++++++++++
				
				// get header, header_left, header_right
				if (header.className == 'cfDeleted') continue;
				
				var header_left = header.childNodes[0];
				var header_right = header.childNodes[1];
				
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
				var bookmark_link = new Array();
				
				var k = 0, header_left_link; 
				while ( header_left_link = header_left_links[k++]) {
					if (!poster_link1) { 
						if (header_left_link.href.search(/showMInd/) != -1) post_link1 = header_left_link;
						else if (header_left_link.href.search(/Club\/Manager\/\?userId=/i) != -1) { 
							poster_link1 = header_left_link; 
							poster_id1 = poster_link1.href.match(/\d+$/);
							if (header_left_links[k] 
								&& header_left_links[k].href.search(/Supporter/i) != -1) {
									supporter_link1 = header_left_links[k];
							}
						}					
						
					} else { 
						if (header_left_link.href.search(/showMInd/) != -1) post_link2 = header_left_link;
						else if (header_left_link.href.search(/Club\/Manager\/\?userId=/i) != -1) { 
							poster_link2 = header_left_link;
							poster_id2 = poster_link2.href.match(/\d+$/);
							if (header_left_links[k] 
								&& header_left_links[k].href.search(/Supporter/i) != -1) {
									supporter_link2 = header_left_links[k];
							}
						}												
					}
					if (header_left_link.href.search(/Bookmarks/) != -1) {
					   bookmark_link.push(header_left_link);
					}
				}
				
				// get user, user_info, user_avater: all maybe = null !!!
				var user = null;
				var user_avatar = null;
				var user_info = null;
				var message = null;
				var footer = null;
				
				var divs = wrapper.getElementsByTagName('div');
				var k = 2, div;
				while ( div = divs[++k] ){
					if ( div.className == 'cfUser') user = div;
					else if ( div.className == 'cfUserInfo') user_info = div;
					else if ( div.className == 'faceCard') user_avatar = div;
					else if ( div.className == 'cfMessage') message = div;
					else if ( div.className == 'cfFooter') footer = div;
				}
				
				
				// get info & nodes from user_info
				var teamid = null;
				var teamname = null;
				var leagueid = null;
				var countryLink = null;
				var leagueLink = null;
				if (user_info) {
					var user_info_links = user_info.getElementsByTagName("a");
					var k = 0, user_info_link;
					while (user_info_link = user_info_links[++k] ) {	
						if ( user_info_link.href.search(/teamid=/i) != -1) {
							var teamid = user_info_link.href.match(/\d+$/);
							var teamname = user_info_link.innerHTML;
							// set some info used for teampopup
							poster_link1.setAttribute('teamid', teamid);
							poster_link1.setAttribute('teamname', teamname);							
						}
						if (user_info_link.href.search(/LeagueID=/i) != -1) {
								countryLink = user_info_link;								
						} else if (user_info_link.href.search(/LeagueLevelUnitID=/i) != -1) {
								leagueLink = user_info_link;
								leagueid = FoxtrickHelper.getLeagueLeveUnitIdFromUrl(user_info_link.href); 
						} 	
					}
				} // get user info
				
				
				// +++++++++++++ moduls +++++++++++++++++++++++++++++++++++
				
				// add forum anchor ----------------------------------------
				if (do_add_anchor) { 
					// dunno if that check is obsolete!? removed it for now (convinced)
					/*var time = header_right.innerHTML.match(/(\d{2})\:(\d{2})/); 
					if ( time!=null && time.length>1 && time[1] != null && time[2] != null ) */
					{                                                    
						header_right.appendChild( anchor.cloneNode(true) );
					}
				} // end add forum anchor
				
				
				// copy post id ---------------------------------------------
				if (do_copy_post_id) { 
					if (do_add_copy_icon) {
						var img = doc.createElement('img');
						img.setAttribute('src',"chrome://foxtrick/content/resources/img/copy_yellow_small.png");
						img.setAttribute('style',"vertical-align: middle; margin-right:3px;");
						img.addEventListener( "click", FoxtrickForumChangePosts._copy_postid_to_clipboard, false );
						img.setAttribute("PostID", post_link1.href.match(/\d+\.\d+/g)[0]);
					
						var copy_link1 = doc.createElement('a');
						copy_link1.setAttribute('href','javascript:void(0);');
						copy_link1.setAttribute('title',Foxtrickl10n.getString( 'foxtrick.CopyPostID' ));
						copy_link1.appendChild(img);					
						header_left.insertBefore(copy_link1, post_link1);
					}
					if (post_link1) post_link1.addEventListener( "DOMSubtreeModified", FoxtrickForumChangePosts._postid_adjust_height, false );
				
					if (do_single_single_click_to_seond_postid && post_link2) {
						var PostID = post_link2.href.match(/\d+\.\d+/g)[0];
						var dot_loc = PostID.indexOf('.');
						post_link2.href='/Forum/Read.aspx?t='+PostID.substr(0,dot_loc)+'&n='+PostID.substr(dot_loc+1);	
						post_link2.title="";										
					}
					else if (post_link2) post_link2.addEventListener( "DOMSubtreeModified", FoxtrickForumChangePosts._postid_adjust_height, false );
				}  // end copy post id
				
				
				// collapse bookmarks ------------------------------------------
				if ( do_collapse_bookmarks && bookmark_link.length>0 ) { 
					var img = doc.createElement('img');
					img.setAttribute('src',"chrome://foxtrick/content/resources/img/bookmark_forum_s.png");
					img.setAttribute('style',"vertical-align: middle; margin-right:3px;");
					img.addEventListener( "click", FoxtrickForumChangePosts._collapse_bookmark, false );
					img.setAttribute("hide", false);
					
					var collapse_link1 = doc.createElement('a');
					collapse_link1.setAttribute('href','javascript:void(0);');
					collapse_link1.setAttribute('title',Foxtrickl10n.getString( 'foxtrick.Collapse' ));
					collapse_link1.appendChild(img);					
					header_left.insertBefore(collapse_link1, header_left.firstChild);
					
					var k=0,bookmark;
					while (bookmark=bookmark_link[k++]) {
						bookmark.setAttribute('style','display:none;');
					}
				}
				
				
				// redir to team ------------------------------------------
				if ( do_redir_to_team ) {
					poster_link1.href += "&redir_to_team=true";
					if (poster_link2) poster_link2.href += "&redir_to_team=true";				
				}
				
				
				// Add Alltid flags -----------------------------------
				if (do_alltid_flags) {					
						var flaglink = doc.createElement('a');						
						flaglink.setAttribute('style','margin-left:3px !important;');
						if (!user_info) { //	link_to_alltid || 
							var target='_blank';
							var href;
							if (true) { //redir_to_team
								href = '/Club/Manager/?userId='  +poster_id1 + '&redir_to_league=true';
								target='_self';
							}
							else href = linkpage + poster_id1;
							flaglink.setAttribute( "target", target );
							flaglink.setAttribute('href', href);
							flaglink.innerHTML='<img  src="'+flagspage + poster_id1 + '.gif" />';
						}
						else {
							flaglink.setAttribute('href','/World/Series/Default.aspx?LeagueLevelUnitID=' + leagueid);
							flaglink.innerHTML = "<img title=" + countryLink.getElementsByTagName('img')[0].title 
												+ " src=" + flagspage + poster_id1 + ".gif border=0 height=12 />";
						}
						var placenode;
						if (supporter_link1) placenode = supporter_link1.nextSibling;
						else placenode = poster_link1.nextSibling;
						header_left.insertBefore(flaglink, placenode);						
						
						if (poster_link2) {	
							var target='_blank';
							var href;
							if (true ) { // redir_to_team
								href = '/Club/Manager/?userId=' + poster_id2 + '&redir_to_league=true';
								target='_self';
							}
							else href = linkpage + poster_id2;
							var flaglink = doc.createElement('a');
							flaglink.setAttribute( "target", target );
							flaglink.setAttribute('style','margin-left:3px !important;');
							flaglink.setAttribute('href', href);
							flaglink.innerHTML='<img style="vertical-align: middle;" src="' + flagspage + poster_id2 + '.gif" />';
							var placenode;
							if (supporter_link2) placenode = supporter_link2.nextSibling;
							else placenode = poster_link2.nextSibling;
							header_left.insertBefore(flaglink, placenode);						
						}
					}	//dump('Add Alltid flags \n');
				
				
				// move links -----------------------------------------
				if ( do_move_links && countryLink && leagueLink && !do_alltid_flags) {
					var placenode;
					if (supporter_link1) placenode = supporter_link1.nextSibling;
					else placenode = poster_link1.nextSibling;
					var space = doc.createTextNode(" ");						
					header_left.insertBefore(space, placenode);
					header_left.insertBefore(leagueLink, space);
					header_left.insertBefore(countryLink, leagueLink);							
					var space = doc.createTextNode(" ");						
					header_left.insertBefore(space, countryLink);
					
				}// dump('end move links \n');
				
				
				// single header line ---------------------------------------
				if (do_truncate_nicks) {
						var userName1 = poster_link1.innerHTML;
						if (userName1.length > trunclength) {
							poster_link1.innerHTML = userName1.substr(0,trunclength-2) +"..";
						}
						if (poster_link2) {
							var userName2 = poster_link2.innerHTML;
							if (userName2.length > trunclength) {
								poster_link2.innerHTML = userName2.substr(0,trunclength-2) +"..";
							}
						}
				}
					
				if (do_single_header) {
								var asAnswerTo0 = post_link1.nextSibling;// small_header_font
								var newText0 = doc.createTextNode(": ");
								header_left.replaceChild(newText0,asAnswerTo0);								
									
								if (poster_link2) {
									var asAnswerTo = post_link2.previousSibling; 
									var newText = doc.createTextNode("=> ");
									header_left.replaceChild(newText,asAnswerTo);
									var asAnswerTo2 = post_link2.nextSibling; 
									var newText2 = doc.createTextNode(": ");
									header_left.replaceChild(newText2,asAnswerTo2);
								}
								if (header.className == "cfHeader doubleLine") {			
									var br = header_left.getElementsByTagName('br')[0]; 
									if (br) header_left.removeChild(br); 
									if (do_single_header_allways || header.offsetTop-header_right.offsetTop >= -3 ) {
										header.setAttribute('style',singleHeaderStyle); 
									}
								}
								
				}  // end single header line

				
				// hide  avatar ----------------------------------
				if ( do_hide_avatar && user_avatar ) {
					user.removeChild( user_avatar );
					user_avatar = null;
				} // dump ('end avatar \n');
				
				
				// add default facecard ----------------------------
				if (do_default_facecard && user && !user_avatar) {
						var user_avatar = doc.createElement("div");
						user_avatar.className = "faceCard";
						user_avatar.setAttribute("style","background-image:"
							+ " url(/Img/Avatar/silhouettes/sil1.png);");
						user.insertBefore(user_avatar,user.firstChild);					
				} //dump ('end add default facecard \n');
				
				
				// hide user info --------------------------------
				if ( do_hide_user_info && user_info ) {
					user.removeChild( user_info );
					user_info = null;
					// all gone? make space for message
					if ( user_avatar == null ) { 
						message.setAttribute('style','width:96%'),
						wrapper.removeChild(user);	
						user = null;
					}
				}  //dump ('end hide user info \n');
			  //dump (num_wrapper+'\n');
			 	
			  ++num_wrapper;				
			  }
			}
		  }
		}
	} catch (e) { dump('forum '+e+'\n');} 
	},
	
	change : function( page, doc ) {
	},	

	
	_collapse_bookmark : function(ev) { 
		var hide = ev.target.getAttribute("hide");		
		var links = ev.target.parentNode.parentNode.getElementsByTagName('a');
		var i=0,bookmark;
		while (bookmark=links[i++]) { 
			if (bookmark.href.search(/Bookmarks/i) != -1) {
				if (hide=='true') {
					bookmark.setAttribute('style','display:none;');
				}
				else  {
					bookmark.setAttribute('style','display:inline;');					
				}
			}
		}
		// less space, adjust height
		header = ev.target.parentNode.parentNode.parentNode; 
		if (header.offsetTop-header.lastChild.offsetTop < -3 ) {
			header.setAttribute('style','height:30px');
		}	
		
		if (hide=='true') hide = false;
		else hide = true;		
				
		ev.target.setAttribute("hide",hide);
	},
	
	_copy_postid_to_clipboard : function(ev) { 
		var PostID = ev.target.getAttribute("PostID");		
		Foxtrick.copyStringToClipboard(PostID);
        /*ev.target.innerHTML = PostID; 
		header = ev.target.parentNode.parentNode;
		if (header.offsetTop-header.lastChild.offsetTop < -3 ) {
										header.setAttribute('style','height:30px');
									}		
		ev.target.addEventListener( "click", FoxtrickForumChangePosts._copy_postid_to_top, false );	
		ev.target.RemoveEventListener( "click", FoxtrickForumChangePosts._copy_postid_to_clipboard, false );	
	*/},	
		
	_postid_adjust_height : function(ev) { 
		header = ev.target.parentNode.parentNode; 
		if (header.offsetTop-header.lastChild.offsetTop < -3 ) {
			header.setAttribute('style','height:30px');
		}		
		ev.target.RemoveEventListener( "click", FoxtrickForumChangePosts._postid_adjust_height, false );	
	},
	
	_copy_postid_to_top : function(ev) {
		var PostID = ev.target.getAttribute("PostID");
		ev.target.href='/Forum/Read.aspx?t='+PostID.replace(/\.\d+/,'')+'&n='+PostID.replace(/\d+\./,'');	
	},	
};
