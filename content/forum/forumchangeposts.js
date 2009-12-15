/**
* forumchangeposts.js
* Foxtrick Copies post id to clipboard
* @author convinced
*/

var FoxtrickForumChangePosts = {

	MODULE_NAME : "ForumChangePosts",
	PAGES : new Array("forumViewThread"),
	DEFAULT_ENABLED : true,
	bDetailedHeader:false,
	CSS:"chrome://foxtrick/content/resources/css/changepost.css",

	init : function() {
	},

	run : function( page, doc ) {
	try{
		//if (Foxtrick.isModuleEnabled(FoxtrickSingleline2)) return;
		
		var do_copy_post_id = Foxtrick.isModuleEnabled(FoxtrickCopyPostID);
		var do_add_copy_icon = do_copy_post_id && Foxtrick.isModuleFeatureEnabled( FoxtrickCopyPostID, "AddCopyIcon");
		var do_copy_posting = Foxtrick.isModuleEnabled(FoxtrickCopyPosting);
		var do_hide_user_info = Foxtrick.isModuleEnabled(FoxtrickHideManagerAvatarUserInfo);
		var do_default_facecard = Foxtrick.isModuleEnabled(FoxtrickAddDefaultFaceCard);
        var do_format_text = Foxtrick.isModuleEnabled(FoxtrickFormatPostingText);
		var do_move_links = Foxtrick.isModuleEnabled(FoxtrickMoveLinks);
		var do_alter_header = Foxtrick.isModuleEnabled(FoxtrickForumAlterHeaderLine);
		var do_alltid_flags = Foxtrick.isModuleEnabled( FoxtrickAlltidFlags );
		var do_redir_to_team = Foxtrick.isModuleEnabled( FoxtrickForumRedirManagerToTeam );
		//var do_forum_search = Foxtrick.isModuleEnabled( FoxtrickForumSearch );

		var do_single_header = do_alter_header && Foxtrick.isModuleFeatureEnabled( FoxtrickForumAlterHeaderLine, "SingleHeaderLine");
		var do_small_header_font = do_alter_header && Foxtrick.isModuleFeatureEnabled( FoxtrickForumAlterHeaderLine, "SmallHeaderFont");
		var do_single_header_allways = do_alter_header && do_single_header && !Foxtrick.isModuleFeatureEnabled( FoxtrickForumAlterHeaderLine, "CheckDesign");
		var do_truncate_nicks = do_alter_header && Foxtrick.isModuleFeatureEnabled( FoxtrickForumAlterHeaderLine, "TruncateLongNick");
		var do_truncate_leaguename = do_alter_header && Foxtrick.isModuleFeatureEnabled( FoxtrickForumAlterHeaderLine, "TruncateLeagueName");
		var do_hide_old_time = do_alter_header && Foxtrick.isModuleFeatureEnabled( FoxtrickForumAlterHeaderLine, "HideOldTime");
 		var do_short_postid = do_alter_header && Foxtrick.isModuleFeatureEnabled( FoxtrickForumAlterHeaderLine, "ShortPostId");
		var do_replace_supporter_star = do_alter_header && Foxtrick.isModuleFeatureEnabled( FoxtrickForumAlterHeaderLine, "ReplaceSupporterStar");
		var do_HighlightThreadOpener = do_alter_header && Foxtrick.isModuleFeatureEnabled( FoxtrickForumAlterHeaderLine, "HighlightThreadOpener");
		// var do_linebreak = Foxtrick.isModuleFeatureEnabled( FoxtrickHeaderFix, "RemoveFlicker");

        
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

		
		// part of copypostid
		var img = doc.createElement('img');
		img.setAttribute('src',"chrome://foxtrick/content/resources/img/copy_yellow_small.png");
		img.setAttribute('style',"vertical-align: middle; margin-right:3px;");

		var copy_link1 = doc.createElement('a');
		copy_link1.setAttribute('href','javascript:void(0);');
		copy_link1.setAttribute('title',Foxtrickl10n.getString( 'foxtrick.CopyPostID' ));
		copy_link1.appendChild(img);

		// part of copy_posting_link
		var img2 = doc.createElement('img');
		img2.setAttribute('src',"chrome://foxtrick/content/resources/img/copy_yellow_small.png");
		img2.setAttribute('style',"vertical-align: middle; margin-left:3px;");

		var copy_posting_link = doc.createElement('a');
		copy_posting_link.setAttribute('href','javascript:void(0);');
		copy_posting_link.setAttribute('title',Foxtrickl10n.getString( 'foxtrick.CopyPosting' ));
		copy_posting_link.appendChild(img2);

		// part of alter header
		var trunclength = 10;
		if (isStandardLayout) trunclength = 14;
		
		var doubleHeaderStyle = 'height:30px !important; ';
		var alt_supporter=doc.createElement('a');
		alt_supporter.href="/Help/Supporter/";
		alt_supporter.innerHTML='*';
		alt_supporter.setAttribute('title',"Hattrick Supporter");

        // loop through postings
        /*
        if (do_linebreak) {
            var divs  = Foxtrick.getElementsByClass("message", doc );
            for (var i=0; i < divs.length; i++) {
                //divs[i].innerHTML = Foxtrick.linebreak(divs[i].innerHTML, 50);
            }
        }
        */
        
        
		if (do_HighlightThreadOpener) try {
            var Ftag = doc.getElementById('ctl00_ucGuestForum_ucGuestForum_updMain');
            if (!Ftag) {Ftag = doc.getElementById('myForums');}
            if (Ftag) {
                Ftag = Ftag.getElementsByTagName('strong')[0];
                var TName = Ftag.innerHTML;
                var TName_lng = Ftag.parentNode.title;
                TName_lng = TName_lng.replace(TName, "");
                TName_lng = TName_lng.split(" ")[2];
            } else var TName_lng = false;
        } catch(e_tag) {Foxtrick.dump('HTO ' + e_tag + '\n'); var TName_lng = false;}
        
        if (do_format_text) try {
            var org = new Array(/\[pre\](.*?)\[\/pre\]/gi);
            var rep = new Array("<pre>$1</pre>");
            var messages = Foxtrick.getElementsByClass("message", doc );
            for (var i = 0; i < messages.length; i++){
                var count_pre = Foxtrick.substr_count(messages[i].innerHTML, '[pre');
                // Foxtrick.dump('FORMAT TEXT ' + count_pre + '\n');
                for (var j = 0; j <= count_pre; j++) {
                    for ( var k = 0; k < org.length; k++) {
                        messages[i].innerHTML = messages[i].innerHTML.replace(org[k],rep[k]);
                    }
                }
            }
        } catch(e_format) {Foxtrick.dump('FORMAT TEXT ' + e_format + '\n');}
        
		// loop through cfWrapper --------------------------------------------
		var num_wrapper = 0;  // message counter
		var alldivs = doc.getElementById('threadContent').childNodes;
        var i = 0, wrapper;
		while ( wrapper = alldivs[++i] ) {
          if ( wrapper.className=="cfWrapper" || wrapper.className=="cfDim" ) {

          var allwrapperdivs = wrapper.childNodes;
		    var ii = 0, header;
		    while ( header = allwrapperdivs[++ii] ) {
                if (header.className=="cfDim") header = header.firstChild;
                if ( header.className && header.className.search(/cfHeader/)!=-1 ) {

                    // +++++++++++ gather info and nodes +++++++++++++++++++++++++

                    // get header, header_left, header_right
                    if (header.className == 'cfDeleted') continue;

                    var header_left = null;
                    var header_right = null;
                    //var header_right_inner = null;

                    var k = 0, header_part;
                    while ( header_part = header.childNodes[k++]) {
                        if (header_part.className.search(/float_left/)!=-1 ) header_left = header_part;
                        if (header_part.className.search(/float_right/)!=-1 )
                            if (header_right==null)header_right = header_part;
                    }
                    //header_right_inner=header_right.getElementsByTagName('div')[0];

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
                    if (header_left_links[0].href.search(/showMInd/)==-1 ) {this.bDetailedHeader = true; do_alltid_flags=false;}
                    while ( header_left_link = header_left_links[k++]) {
                        if (!poster_link1) {
                            if (header_left_link.href.search(/showMInd|Forum\/Read\.aspx/) != -1) post_link1 = header_left_link;
                            else if (header_left_link.href.search(/Club\/Manager\/\?userId=/i) != -1) {
                                poster_link1 = header_left_link;

                                poster_id1 = poster_link1.href.replace(/\&browseIds.+/, '').match(/\d+$/);

                                if (header_left_links[k]
                                    && header_left_links[k].href.search(/Supporter/i) != -1) {
                                        supporter_link1 = header_left_links[k];
                                }
                            }
                        } else if (!poster_link2 || !post_link2) {
                            if (header_left_link.href.search(/showMInd|Forum\/Read\.aspx/) != -1) post_link2 = header_left_link;
                            else if (header_left_link.href.search(/Club\/Manager\/\?userId=/i) != -1) {
                                poster_link2 = header_left_link;
                                poster_id2 = poster_link2.href.replace(/\&browseIds.+/, '').match(/\d+$/);
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

                    // save for search ---------------------------------------------
                    /*if (do_forum_search) {
                        var headstr = post_link1.title+': '+poster_link1.title+' » ';
                        if (poster_link2)  headstr+=post_link2.title+': '+poster_link2.title+'\n';
                        else headstr+='all\n';
                        headstr = Foxtrick.stripHTML(header_right.innerHTML)+"  "+headstr;

                        this._SaveForSearch();
                    } // save for search
                    */
                    // copy post id ---------------------------------------------
                    if (do_copy_post_id) {
                        if (do_add_copy_icon) {
                            var copy_link=copy_link1.cloneNode(true);
                            copy_link.firstChild.addEventListener( "click", FoxtrickForumChangePosts._copy_postid_to_clipboard, false );
                            header_left.insertBefore(copy_link, post_link1);
                        }
                    }  // end copy post id

                    if (do_hide_old_time) {  
						//Foxtrick.dump(header_right.innerHTML+'\n'+header_right.innerHTML.search(/ \d{1,4}\.\d{1,2}\.\d{1,4}\.? \d+:\d+/gi)+'\n');
						if (header_right.innerHTML.search(/ \d{1,4}.*?\d{1,2}.*?\d{1,4}.*? \d+:\d+/gi)!=-1) 
							header_right.innerHTML = header_right.innerHTML.replace(/ (\d{1,4}.*?\d{1,2}.*?\d{1,4}.*?)( \d+:\d+)/gi,"<span title='$2'>$1</span>");
					}

                    // copy posting ---------------------------------------------
                    if (do_copy_posting) {
                            var copy_link=copy_posting_link.cloneNode(true);
                            copy_link.firstChild.addEventListener( "click", FoxtrickForumChangePosts._copy_posting_to_clipboard, false );
                            header_right.appendChild(copy_link);
                    }  // end copy posting

                    // redir to team ------------------------------------------
                    if ( do_redir_to_team ) {
                        poster_link1.href += "&redir_to_team=true";
                        if (poster_link2) poster_link2.href += "&redir_to_team=true";
                    }

                    // Add Alltid flags -----------------------------------
                    if (do_alltid_flags) {
                            try {
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
                            } catch(eee) {Foxtrick.dump(eee+'\n')}
                        }	//Foxtrick.dump('Add Alltid flags \n');


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

                    }// Foxtrick.dump('end move links \n');


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
                            post_link1.href="javascript:showMInd('"+PostID_thread+"-"+PostID_message+"',%20'/Forum/Read.aspx?t="+PostID_thread+"&n="+PostID_message+"&v=2',%20'"+PostID_thread+"."+PostID_message+"');"
                            post_link1.setAttribute('id',PostID_thread+"-"+PostID_message);
                        }
                        post_link1.innerHTML=String(PostID_message);
                        post_link1.addEventListener( "DOMSubtreeModified", FoxtrickForumChangePosts._postid_adjust_height, false );
                        if (post_link2) {
                            var PostID_message = post_link2.title.replace(/\d+\./,'');
                            post_link2.innerHTML=String(PostID_message);
                        }

                    }
                    if (do_replace_supporter_star) {
                        if (supporter_link1) {
                            poster_link1.parentNode.insertBefore(alt_supporter.cloneNode(true),poster_link1.nextSibling);
                        }
                        if (supporter_link2) {
                            poster_link2.parentNode.insertBefore(alt_supporter.cloneNode(true),poster_link2.nextSibling);
                        }
                    }

                    if (do_HighlightThreadOpener && TName_lng) {
                        try{
                            if (poster_link1.innerHTML == TName_lng) {
                                poster_link1.previousSibling.previousSibling.setAttribute('class','ft_slH_PID_left');
                            }
                            else if (poster_link2.innerHTML == TName_lng) {
                                poster_link2.previousSibling.previousSibling.setAttribute('class','ft_slH_PID_right');
                            }
                        } catch(e_HTO) {
                            //Foxtrick.dump('do_HighlightThreadOpener :' + e_HTO + '\n');
                        }
                    }

                    /*not needed anymore?
					if (do_single_header && this.bDetailedHeader && header_right) {
                        try{
                            var bookmark = header_right.getElementsByTagName('a')[0];
                            if (bookmark) {
                                bookmark = bookmark.parentNode.removeChild(bookmark);
                                header_right.insertBefore(bookmark,header_right);
                                header_right.removeChild(header_right_inner);
                             }
                        }catch(e_bookmark) {Foxtrick.dump('Error SLH_Forum_Bookmark: ' + e_bookmark + '\n');}
                    }*/

                    if (do_single_header && !do_single_header_allways) {
                      if (header.className == "cfHeader doubleLine") {	
						//Foxtrick.dump('d'+String(header.offsetTop-header_right.offsetTop)+'\n');
                        // Foxtrick.dump(header.innerHTML);
                        
					//   if (header.offsetTop-header_right.offsetTop < -3 ) {
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
                            if (header.offsetTop-header_right.offsetTop < -3 )  {
                                header.setAttribute('class','cfHeader ftdoubleLine');
								Foxtrick.dump('do_truncate_nicks: adjust height back\n')
                                //header.setAttribute('style','height: 30px !important;'); doesn't work
                            }
                          }
                          /*else {
                            header.setAttribute('class','cfHeader ftdoubleLine');
                            //header.setAttribute('style','height: 30px !important;'); doesn't work
                          }
                        }*/
                    }

                    }  // end single header line

                    // check design broken
                    if (!this.bDetailedHeader && do_alltid_flags)
                    { 	if (header.offsetTop-header_right.offsetTop < -3 )  {
                            //header.setAttribute('style','height: 30px !important;');
                            header.setAttribute('class','cfHeader ftdoubleLine'); //doesn't work well
							Foxtrick.dump('do_alltid_flags: adjust height back\n')                            
                        }
                        post_link1.addEventListener( "DOMSubtreeModified", FoxtrickForumChangePosts._postid_adjust_height, false );
                        if (post_link2) post_link2.addEventListener( "DOMSubtreeModified", FoxtrickForumChangePosts._postid_adjust_height, false );
                    }


                    // add default facecard ----------------------------
                    if (do_default_facecard && user && !user_avatar) {
                            var user_avatar = doc.createElement("div");
                            user_avatar.className = "faceCard";
                            user_avatar.setAttribute("style","background-image:"
                                + " url(/Img/Avatar/silhouettes/sil1.png);");
                            user.insertBefore(user_avatar,user.firstChild);
                    } //Foxtrick.dump ('end add default facecard \n');


                    // hide user info --------------------------------
                    if ( do_hide_user_info && user_info ) {
                        user.removeChild( user_info );
                        user_info = null;
                        // all gone? make space for message
                        if ( user_avatar == null ) {
                            message.setAttribute('style','width:96%');
                            
                            try {
                                wrapper.removeChild(user)
                            } catch(error_user){Foxtrick.dump('ERROR userinforemove: ' + error_user + '\n')}
                            user = null;
                        }
                    }  //Foxtrick.dump ('end hide user info \n');
                    //Foxtrick.dump (num_wrapper+'\n');

                    ++num_wrapper;
                }
			}
		  }
		}
	} catch (e) { Foxtrick.dump('ForumChangePost '+e+'\n');}
	},

	change : function( page, doc ) {
	},

	_copy_postid_to_clipboard : function(ev) {
		var PostID = "";
		if (FoxtrickForumChangePosts.bDetailedHeader) PostID=ev.target.parentNode.nextSibling.title;
		else {
			try {PostID= ev.target.parentNode.nextSibling.href.match(/\d+\.\d+/g)[0];}
			catch(e){PostID=ev.target.parentNode.nextSibling.title;}
		}
		Foxtrick.copyStringToClipboard(PostID);
		if (FoxtrickPrefs.getBool( "copyfeedback" ))
			Foxtrick.alert(Foxtrickl10n.getString("foxtrick.tweaks.postidcopied"));
    },

	_copy_posting_to_clipboard : function(ev) {
		try{  //Foxtrick.dump('in ->_copy_posting_to_clipboard\n');
				var doc = ev.target.ownerDocument;
				var header=ev.target.parentNode.parentNode.parentNode;

				var header_left = null;
				var header_right = null;

				var k = 0, header_part;
				while ( header_part = header.childNodes[k++]) {
					if (header_part.className.search(/float_left/)!=-1 ) header_left = header_part;
					if (header_part.className.search(/float_right/)!=-1 ) {
						if (header_right==null) header_right = header_part;
					}
				}
				var header_right_inner =  Foxtrick.stripHTML(header_right.innerHTML);

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
				var post_id1 = null;
				var post_id2 = null;


				var k = 0, header_left_link;
				if (header_left_links[0].href.search(/showMInd/)==-1 ) this.bDetailedHeader = true;
				while ( header_left_link = header_left_links[k++]) {
					
					if (!poster_link1) {
						if (header_left_link.href.search(/showMInd/) != -1) {
							post_id1 = header_left_link.href.match(/(\d+\.\d+)/)[1];//header_left_link.href.match(/(\d+)-\d+/)[1]+'.'+header_left_link.href.match(/\d+-(\d+)/,'')[1];
							post_link1 = header_left_link;
						}
						else if (header_left_link.href.search(/Forum\/Read\.aspx/) != -1) {
							post_id1 = header_left_link.title;
							post_link1 = header_left_link;
						}
						else if (header_left_link.href.search(/Club\/Manager\/\?userId=/i) != -1) {
							poster_link1 = header_left_link;
							poster_id1 = poster_link1.href.match(/\d+$/);
							if (header_left_links[k]
								&& header_left_links[k].href.search(/Supporter/i) != -1) {
									supporter_link1 = header_left_links[k];
							}
						}
					} else if (!poster_link2 || !post_link2) {  
						if (header_left_link.href.search(/showMInd/) != -1) {
							post_id2 = header_left_link.href.match(/(\d+\.\d+)/)[1];//header_left_link.href.match(/(\d+)-\d+/)[1]+'.'+header_left_link.href.match(/\d+-(\d+)/,'')[1];
							post_link2 = header_left_link;
						}
						else if (header_left_link.href.search(/Forum\/Read\.aspx/) != -1) {
							post_id2 = header_left_link.title;
							post_link2 = header_left_link;
						}
						else if (post_link2 && header_left_link.href.search(/Club\/Manager\/\?userId=/i) != -1) {
							poster_link2 = header_left_link; 
							poster_id2 = poster_link2.href.match(/\d+$/);
							if (header_left_links[k]
								&& header_left_links[k].href.search(/Supporter/i) != -1) {
									supporter_link2 = header_left_links[k];
							}
						}
					}
					/*if (!isStandardLayout) {
						if (!league_link1 && header_left_link.href.search(/LeagueLevelUnitID/i) != -1) league_link1 = header_left_link;
						else if (header_left_link.href.search(/LeagueLevelUnitID/i) != -1) league_link2 = header_left_link;
					 }*/
				}

			var headstr = post_id1+': '+poster_link1.title+' » ';
			if (poster_link2 && post_link2)  headstr+=post_id2+': '+poster_link2.title+'\n';
			else headstr+='all\n';
			
			// get date+time
			var time = header_right_inner.replace(/^ /,'');
			if (time.search(/\d+:\d+/)==0) {
				var cur_time = doc.getElementById('time').innerHTML;
				var hi = cur_time.search(/\d+:\d+/);
				var date = cur_time.substring(0,hi);
				time = date + time;
			}
			else if (time.search(/\d+:\d+/)==-1) {
				time = time +header_right.getElementsByTagName('span')[0].title;				
			}
			headstr = time + "  \n" + headstr + '';

			var message_raw = header.nextSibling.firstChild.innerHTML;
			
			
			var spoilers = message_raw.split(/\<blockquote id="spoil/); 
			message_raw = spoilers[0];
			for (var i=1;i< spoilers.length;++i) {
				message_raw += '#&gt; <blockquote id="spoil'+spoilers[i].replace(/\<\/blockquote\>/i,' &lt;#\n');
			}
			
			var quotes = message_raw.split(/\<blockquote class="quote"/); 
			message_raw = quotes[0];
			var j=1;
			for (var i=1;i< quotes.length;++i) {
				message_raw += '\n'+j+'&gt; <blockquote class="quote"';
				++j;
				while(quotes[i].search(/\<\/blockquote\>/i)!=-1) {
					--j;
					quotes[i] = quotes[i].replace(/\<\/blockquote\>/i,' &lt;'+j+'\n');
				}
				message_raw += quotes[i];
			}
				
			message_raw=message_raw.replace(/\<hr\>/,'------------------------------------------\n');
			message_raw=message_raw.replace(/\<br\>|\<\/tr\>|\<\/div\>/g,'\n');
			message_raw=message_raw.replace(/\n\n/g,'\n');
			message_raw=message_raw.replace(/\<\/td\>|\<\/th\>/g,'\t');
			message_raw=message_raw.replace(/&nbsp;/g,' ');
			
			var message = (Foxtrick.stripHTML(message_raw)).replace(/&amp;/g,'&').replace(/&gt;/g,'>').replace(/&lt;/g,'<');

			Foxtrick.copyStringToClipboard(headstr+message);
			if (FoxtrickPrefs.getBool( "copyfeedback" ))
				Foxtrick.alert(Foxtrickl10n.getString("foxtrick.tweaks.postingcopied"));
		} catch(e){ Foxtrick.dump('_copy_posting_to_clipboard :'+e+'\n');}
    },

	_postid_adjust_height : function(ev) {
		var header = ev.target.parentNode.parentNode;
		if (header.offsetTop-header.lastChild.offsetTop < -3 ) {
			// just to be on the save side do both
			header.setAttribute('class','cfHeader ftdoubleLine');
			header.setAttribute('style','height: 30px !important;');
			Foxtrick.dump('_postid_adjust_height: adjust height back\n')                            
		}
		ev.target.RemoveEventListener( "click", FoxtrickForumChangePosts._postid_adjust_height, false );
	},

	_copy_postid_to_top : function(ev) {
		var PostID = ev.target.getAttribute("PostID"); //Foxtrick.dump (PostID+'\n'+'/Forum/Read.aspx?t='+PostID.replace(/\.\d+/,'')+'&n='+PostID.replace(/\d+\./,'')+'\n');
		ev.target.href='/Forum/Read.aspx?t='+PostID.replace(/\.\d+/,'')+'&n='+PostID.replace(/\d+\./,'');
	},

	_SaveForSearch : function (str) {
        try {
			var locpath="C:\\tmp\\sdf";//Foxtrick.selectFileSave(doc.defaultView);
			Foxtrick.dump(locpath+'\n');
			if (locpath==null) {return;}
			var File = Components.classes["@mozilla.org/file/local;1"].
                     createInstance(Components.interfaces.nsILocalFile);
			File.initWithPath(locpath);

			var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
                         createInstance(Components.interfaces.nsIFileOutputStream);
			foStream.init(File, 0x02 | 0x08 | 0x20 | 0x10, 0666, 0);
			var os = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                   .createInstance(Components.interfaces.nsIConverterOutputStream);
			os.init(foStream, "UTF-8", 0, 0x0000);
			os.writeString(str+'\c\n');
			os.close();
			foStream.close();
		}
		catch (e) {
			Foxtrick.alert(e);
        }
    return true;
	},

};
