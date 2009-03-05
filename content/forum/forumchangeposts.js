/**
* forumchangeposts.js
* Foxtrick Copies post id to clipboard
* @author convinced
*/
  
var FoxtrickForumChangePosts = {

	MODULE_NAME : "ForumChangePosts",
	//MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	DEFAULT_ENABLED : true,
	bDetailedHeader:false,
	
	init : function() {
		Foxtrick.registerPageHandler( 'forumViewThread',
			FoxtrickForumChangePosts );		
	},
	
	run : function( page, doc ) { 
	try{
	
		var do_copy_post_id = Foxtrick.isModuleEnabled(FoxtrickCopyPostID); 
		var do_add_copy_icon = do_copy_post_id && Foxtrick.isModuleFeatureEnabled( FoxtrickCopyPostID, "AddCopyIcon"); 
		var do_hide_user_info = Foxtrick.isModuleEnabled(FoxtrickHideManagerAvatarUserInfo);
		var do_hide_avatar = Foxtrick.isModuleEnabled(FoxtrickHideManagerAvatar);				
		var do_default_facecard = !do_hide_avatar && Foxtrick.isModuleEnabled(FoxtrickAddDefaultFaceCard);				
		var do_move_links = Foxtrick.isModuleEnabled(FoxtrickMoveLinks);
		var do_alter_header = Foxtrick.isModuleEnabled(FoxtrickForumAlterHeaderLine);
		var do_alltid_flags = Foxtrick.isModuleEnabled( FoxtrickAlltidFlags ); 
		var do_redir_to_team = Foxtrick.isModuleEnabled( FoxtrickForumRedirManagerToTeam ); 
		
		var do_single_header = do_alter_header && Foxtrick.isModuleFeatureEnabled( FoxtrickForumAlterHeaderLine, "SingleHeaderLine"); 
		var do_small_header_font = do_alter_header && Foxtrick.isModuleFeatureEnabled( FoxtrickForumAlterHeaderLine, "SmallHeaderFont"); 
		var do_single_header_allways = do_alter_header && do_single_header && !Foxtrick.isModuleFeatureEnabled( FoxtrickForumAlterHeaderLine, "CheckDesign"); 
		var do_truncate_nicks = do_alter_header && Foxtrick.isModuleFeatureEnabled( FoxtrickForumAlterHeaderLine, "TruncateLongNick"); 
		var do_truncate_leaguename = do_alter_header && Foxtrick.isModuleFeatureEnabled( FoxtrickForumAlterHeaderLine, "TruncateLeagueName"); 
		var do_short_postid = do_alter_header && Foxtrick.isModuleFeatureEnabled( FoxtrickForumAlterHeaderLine, "ShortPostId"); 
		var do_replace_supporter_star = do_alter_header && Foxtrick.isModuleFeatureEnabled( FoxtrickForumAlterHeaderLine, "ReplaceSupporterStar"); 
		
		this.bDetailedHeader = false;
		var hasScroll = Foxtrick.hasMainBodyScroll(doc);
		var isStandardLayout = Foxtrick.isStandardLayout ( doc ) ;
		// part of FoxtrickAlltidflags
		var flagspage = "http://flags.alltidhattrick.org/userflags/";
		var linkpage = "http://stats.alltidhattrick.org/team/";
		var style ="margin-right:3px; margin-bottom:3px; padding-left:3px; " + 
					"background-repeat:repeat-x; background-position: 0% 50%;";
		//var link_to_alltid = (FoxtrickPrefs.getInt("module.FoxtrickAlltidFlags.value") == 1);
		//var redir_to_team = (FoxtrickPrefs.getInt("module.FoxtrickAlltidFlags.value") == 0);
		Foxtrick.addStyleSheet(doc, "chrome://foxtrick/content/"+
							"resources/css/linkscustom.css");
			

		// part of copypostid
		var img = doc.createElement('img');
		img.setAttribute('src',"chrome://foxtrick/content/resources/img/copy_yellow_small.png");
		img.setAttribute('style',"vertical-align: middle; margin-right:3px;");
		//img.addEventListener( "click", FoxtrickForumChangePosts._copy_postid_to_clipboard, false );
						
		var copy_link1 = doc.createElement('a');
		copy_link1.setAttribute('href','javascript:void(0);');
		copy_link1.setAttribute('title',Foxtrickl10n.getString( 'foxtrick.CopyPostID' ));
		copy_link1.appendChild(img);					
	
	
		// part of alter header
		var trunclength = 10;
		if (isStandardLayout) trunclength = 14;
		
		
		var doubleHeaderStyle = 'height:30px !important; '; 
		var alt_supporter=doc.createElement('a');
		alt_supporter.href="/Help/Supporter/";
		alt_supporter.innerHTML='*';
		alt_supporter.setAttribute('title',"Hattrick Supporter");
		
		// loop through cfWrapper --------------------------------------------
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
				
				var header_left = null;
				var header_right = null;
				var header_right_inner = null;
				
				var k = 0, header_part; 
				while ( header_part = header.childNodes[k++]) {
					if (header_part.className.search(/float_left/)!=-1 ) header_left = header_part;
					if (header_part.className.search(/float_right/)!=-1 ) 
						if (header_right==null)header_right = header_part;
				}
				header_right_inner=header_right.getElementsByTagName('div')[0];
	
				/* add someting to test removal later			
				var forumprefs = doc.createElement('a');
				forumprefs.href = '/MyHattrick/Preferences/ForumSettings.aspx';
				forumprefs.innerHTML='<img src="chrome://foxtrick/content/resources/img/transparent_002.gif">';
				forumprefs.setAttribute('class','bookmarkMessage');
				if (header_right_inner) header_right_inner.appendChild(forumprefs);
				*/
				
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
				var league_link1 = null;
				var league_link2 = null;
				
				
				var k = 0, header_left_link; 
				if (header_left_links[0].href.search(/showMInd/)==-1 ) this.bDetailedHeader = true; 
				while ( header_left_link = header_left_links[k++]) {
					if (!poster_link1) { 
						if (header_left_link.href.search(/showMInd|Forum\/Read\.aspx/) != -1) post_link1 = header_left_link;
						else if (header_left_link.href.search(/Club\/Manager\/\?userId=/i) != -1) { 
							poster_link1 = header_left_link; 
							poster_id1 = poster_link1.href.match(/\d+$/);
							if (header_left_links[k] 
								&& header_left_links[k].href.search(/Supporter/i) != -1) {
									supporter_link1 = header_left_links[k];
							}
						}					
					} else { 
						if (header_left_link.href.search(/showMInd|Forum\/Read\.aspx/) != -1) post_link2 = header_left_link;
						else if (header_left_link.href.search(/Club\/Manager\/\?userId=/i) != -1) { 
							poster_link2 = header_left_link;
							poster_id2 = poster_link2.href.match(/\d+$/);
							if (header_left_links[k] 
								&& header_left_links[k].href.search(/Supporter/i) != -1) {
									supporter_link2 = header_left_links[k];
							}
						}												
					}					
					if (!isStandardLayout) {
						if (!league_link1 && header_left_link.href.search(/LeagueLevelUnitID/i) != -1) league_link1 = header_left_link;
						else if (header_left_link.href.search(/LeagueLevelUnitID/i) != -1) league_link2 = header_left_link;
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
				var leagueLinkUserInfo = null;
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
								leagueLinkUserInfo = user_info_link;
								leagueid = FoxtrickHelper.getLeagueLeveUnitIdFromUrl(user_info_link.href); 
						} 	
					}
				} // get user info
				
				
				// +++++++++++++ moduls +++++++++++++++++++++++++++++++++++
								
				// copy post id ---------------------------------------------
				if (do_copy_post_id) { 
					if (do_add_copy_icon) {					
						var copy_link=copy_link1.cloneNode(true);
						copy_link.firstChild.addEventListener( "click", FoxtrickForumChangePosts._copy_postid_to_clipboard, false );		
						header_left.insertBefore(copy_link, post_link1);
					}
				}  // end copy post id
				
							
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
				if ( do_move_links && countryLink && leagueLinkUserInfo && !do_alltid_flags) {
					var placenode;
					if (supporter_link1) placenode = supporter_link1.nextSibling;
					else placenode = poster_link1.nextSibling;
					var space = doc.createTextNode(" ");						
					header_left.insertBefore(space, placenode);
					header_left.insertBefore(leagueLinkUserInfo, space);
					header_left.insertBefore(countryLink, leagueLinkUserInfo);							
					var space = doc.createTextNode(" ");						
					header_left.insertBefore(space, countryLink);
					
				}// dump('end move links \n');
				
				
				// single header line ---------------------------------------
				if (do_truncate_nicks && do_single_header_allways) {
						var userName1 = poster_link1.innerHTML;
						if (userName1.length > trunclength) {
							poster_link1.setAttribute('longnick',poster_link1.innerHTML);
							poster_link1.innerHTML = userName1.substr(0,trunclength-2) +"..";
						}
						if (poster_link2) {
							var userName2 = poster_link2.innerHTML;
							if (userName2.length > trunclength) {
								poster_link2.setAttribute('longnick',poster_link2.innerHTML);
								poster_link2.innerHTML = userName2.substr(0,trunclength-2) +"..";
							}
						}
						if (league_link1) {
							var league_name1 = league_link1.innerHTML;
							if (league_name1.length > trunclength) {
								league_link1.innerHTML = league_name1.substr(0,trunclength-2) +"..";
							}
						}
						if (league_link2) {
							var league_name2 = league_link2.innerHTML;
							if (league_name2.length > trunclength) {
								league_link2.innerHTML = league_name2.substr(0,trunclength-2) +"..";
							}
						}						
				}
				
				if (do_truncate_leaguename) {
						if (league_link1) {
							league_link1.innerHTML = league_link1.innerHTML.replace(/\..+/,'');
							if (league_link1.innerHTML.length>3)  league_link1.innerHTML='I';
						}
						if (league_link2) {
							league_link2.innerHTML = league_link2.innerHTML.replace(/\..+/,'');
							if (league_link2.innerHTML.length>3)  league_link2.innerHTML='I';
						}
				}
				
				if (do_short_postid && this.bDetailedHeader) {
					var PostID_message = post_link1.title.replace(/\d+\./,'');
					if (!do_add_copy_icon) {
						var PostID_thread = post_link1.title.replace(/\.\d+/g,'');
						post_link1.href="javascript:showMInd('"+PostID_thread+"-"+PostID_message+"',%20'/Forum/Read.aspx?t="+PostID_thread+"&amp;n="+PostID_message+"&amp;v=2',%20'"+PostID_thread+"."+PostID_message+"');"
						post_link1.setAttribute('id',PostID_thread+"-"+PostID_message);
					}
					post_link1.innerHTML=String(PostID_message);
					post_link1.addEventListener( "DOMSubtreeModified", FoxtrickForumChangePosts._postid_adjust_height, false );
					if (poster_link2) {
						var PostID_message = post_link2.title.replace(/\d+\./,'');
						post_link2.innerHTML=String(PostID_message);
					}
					
				}
				if (do_replace_supporter_star) { 
					if (supporter_link1) {
						header_left.insertBefore(alt_supporter.cloneNode(true),poster_link1.nextSibling);
					}
					if (supporter_link2) {
						header_left.insertBefore(alt_supporter.cloneNode(true),poster_link2.nextSibling);
					}
				}
				
				if (do_single_header && this.bDetailedHeader && header_right_inner) { 
					var bookmark = header_right_inner.getElementsByTagName('a')[0];
					if (bookmark) { 
						bookmark = bookmark.parentNode.removeChild(bookmark);
						header_right.insertBefore(bookmark,header_right_inner);
						header_right.removeChild(header_right_inner);
					 }
				}
				
				if (do_single_header && !do_single_header_allways) {
				  if (header.className == "cfHeader doubleLine") {	//dump('d'+String(header.offsetTop-header_right.offsetTop)+'\n');		
					if (header.offsetTop-header_right.offsetTop < -3 ) {
					  if (do_truncate_nicks) {
						var userName1 = poster_link1.innerHTML;
						if (userName1.length > trunclength) {
							poster_link1.setAttribute('longnick',poster_link1.innerHTML);
							poster_link1.innerHTML = userName1.substr(0,trunclength-2) +"..";
						}
						if (poster_link2) {
							var userName2 = poster_link2.innerHTML;
							if (userName2.length > trunclength) {
								poster_link2.setAttribute('longnick',poster_link2.innerHTML);
								poster_link2.innerHTML = userName2.substr(0,trunclength-2) +"..";
							}
						}
						if (league_link1) {
							var league_name1 = league_link1.innerHTML;
							if (league_name1.length > trunclength) {
								league_link1.innerHTML = league_name1.substr(0,trunclength-2) +"..";
							}
						}
						if (league_link2) {
							var league_name2 = league_link2.innerHTML;
							if (league_name2.length > trunclength) {
								league_link2.innerHTML = league_name2.substr(0,trunclength-2) +"..";
							}
						}						
						if (header.offsetTop-header_right.offsetTop < -3 ) header.setAttribute.style+=doubleHeaderStyle;												
					  }
					  else header.setAttribute.style+=doubleHeaderStyle; 
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

	_copy_postid_to_clipboard : function(ev) { 
		var PostID = ""; 
		if (FoxtrickForumChangePosts.bDetailedHeader) PostID=ev.target.parentNode.nextSibling.title;
		else PostID= ev.target.parentNode.nextSibling.href.match(/\d+\.\d+/g)[0];
							
		Foxtrick.copyStringToClipboard(PostID);
    },	
		
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
