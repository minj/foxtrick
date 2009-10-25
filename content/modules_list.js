/*
 * modules_list.js
 */
////////////////////////////////////////////////////////////////////////////////
 /** Modules that need to be initialized and register their page handlers
 * in the beginning.
 * Each should implement an init() method, which will be called only once.
 * Register your page handlers in it.
 */
Foxtrick.modules = [ 
                    FoxtrickForumChangePosts,
                    FoxtrickShowForumPrefButton,
                    FoxtrickMovePlayerSelectbox,  // keep before others on playerdetails page
                    FoxtrickAddManagerButtons,   // keep before FoxtrickAddDefaultFaceCard
                    FoxtrickMovePlayerStatement,
                    FoxtrickFixcssProblems,
                    FoxtrickForumTemplates,
                    FoxtrickForumPreview,
                    FoxtrickForumYouthIcons,
                    Foxtrick.BookmarkAdjust,
                    //FoxtrickHideManagerAvatar,
                    FoxtrickAddDefaultFaceCard,
                    FoxtrickMoveLinks,   // keep before FoxtrickHideManagerAvatarUserInfo
                    FoxtrickAlltidFlags,  // keep before FoxtrickHideManagerAvatarUserInfo
                    FoxtrickForumAlterHeaderLine,
                    FoxtrickTeamPopupLinks,
                    FoxtrickTeamPopupLinksMore,
                    FoxtrickHideManagerAvatarUserInfo,
                    FoxtrickGoToPostBox,
                    FoxtrickContextMenueCopyId,
                    FoxtrickCopyTrainingReport,
                    FoxtrickCopyScoutReport,
                    FoxtrickCopyPlayerSource,
					FoxtrickCopyPostID,
                    FoxtrickStaffMarker,
                    FoxtrickHTThreadMarker,
                    FoxtrickMedianTransferPrice,
                    FoxtrickYouthSkillNotes,
                    FoxtrickAddLeaveConfButton,
                    FoxtrickFlipSidesInMatchOrders,
                    FoxtrickStarsCounter,
                    FoxtrickRepositionedPlayers,
                    FoxtrickAdvancedStarsCounter,
                    FoxtrickFormationBoxInMatchOrders,
                    FoxtrickFlagCollectionToMap,
                    FoxtrickTransferListSearchFilters,
                    FoxtrickTransferListDeadline,
                    FoxtrickExtendedPlayerDetails,
                    FoxtrickExtendedPlayerDetailsWage,
                    FoxtrickHTDateFormat,
                    FoxtrickMatchReportFormat,  // ** new **
                    FoxtrickMatchPlayerColouring,                     
                    Foxtrick.AttVsDef, // AttVsDef should be placed before Ratings
                    Foxtrick.Ratings,
					Foxtrick.htmsStatistics, // htmsStatistics should be placed after Ratings
                    Foxtrick.TeamStats,  // before FoxtrickLinksPlayers
                    FoxtrickAlert,
                    FoxtrickHideFaceTransferImages,
                    FoxtrickHideFaceInjuryImages,
                    FoxtrickHideFaceSuspendedImages,
                    FoxtrickColouredYouthFaces,
                    FoxtrickBackgroundFixed,
                    FoxtrickPlayerAdToClipboard,
                    FoxtrickCopyRatingsToClipboard,
                    FoxtrickLinksCustom,
                    FoxtrickLinksLeague,
                    FoxtrickLinksCountry,
                    FoxtrickLinksTeam,
                    FoxtrickLinksChallenges,
                    FoxtrickLinksEconomy,
                    FoxtrickLinksYouthOverview,
                    FoxtrickLinksYouthTraining,  // new but include
                    FoxtrickLinksYouthPlayerDetail, // new but include
                    FoxtrickLinksArena,
                    FoxtrickLinksCoach,
                    FoxtrickLinksPlayerDetail,
                    FoxtrickLinksMatch,
                    FoxtrickLinksTraining,
                    FoxtrickLinksAlliances,
                    FoxtrickLinksNational,
                    FoxtrickLinksManager,
                    FoxtrickLinksAchievements,
                    FoxtrickLinksPlayers,
                    FoxtrickLinksFans,
                    FoxtrickLinksStaff,
                    FoxtrickLinksTracker,
                    FoxtrickConfirmPlayerBid,
                    FoxtrickConfirmTL,
                    FoxtrickEconomyDifference,
                    FoxtrickHideSignatures,
                    FoxtrickForumNextAndPrevious,
                    FoxtrickPersonalityImages,
                    FoxtrickSkillColoring,
                    FoxtrickSkinPlugin,
                    FoxtrickMatchIncome,
                    FoxtrickHelper,
                    FoxtrickLargeFlags,
                    FoxtrickTeamSelectBox,
                    FoxtrickSeniorTeamShortCuts,
                    FoxtrickShortcutsStatistics,
                    FoxtrickCustomMedals,
                    FoxtrickForumRedirManagerToTeam,
                    FoxtrickRedirections,
                    FoxtrickGuestbookAlltidFlags,
                    FoxtrickCurrencyConverter,
                    FoxtrickTickerColoring,
                    FoxtrickSeasonStats,   // keep before FoxtrickCopyMatchID
                    FoxtrickCopyMatchID,
                    FoxtrickHeaderFix,
                    FoxtrickHeaderFixLeft,
                    FoxtrickNewMail,
                    FoxtrickNTConfirmAddRemove,
                    FoxtrickPlayerBirthday,
                    //FoxtrickAddHtLiveToOngoing,
                    FoxtrickReadHtPrefs,
                    FoxtrickMyHT,
                    FoxtrickPrefsDialogHTML,   
                    FoxtrickLeagueNewsFilter,
                    FoxtrickShortPAs,
                    FoxtrickCopyPosting,
                    FoxtrickMoveManagerOnline,
                    // FoxtrickForumSearch,  // new not finished
                    FoxtrickTables,
                    FoxtrickMatchTables,
                    FoxtrickCrossTable,
                    FoxtrickYouthSkillHideUnknown,
                    FoxtrickYouthSkillTable,
                    FoxtrickHighlightCupwins,
                    FoxtrickElectionTable,
                    FoxtrickSkillTranslation, // new 
                    FoxtrickOnPagePrefs,  // new
                    FoxtrickLineupShortcut, // new
                    //FoxtrickSingleline2,
                    FoxtrickYouthPromotes,   //new
                    FoxtrickCountyList, // new
                    FoxtrickMatchOrderColoring, // new
					
                    FoxtrickSmallerPages, // new not finished //after FoxtrickTransferListDeadline and probably also after all other player detail adjustment, so keep it in the end
					];

					