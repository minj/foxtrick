/*
 * modules_list.js
 */
////////////////////////////////////////////////////////////////////////////////
 /** Modules that need to be initialized and register their page handlers
 * in the beginning.
 * Each should implement an init() method, which will be called only once.
 * Register your page handlers in it.
 */
Foxtrick.modules = [ FoxtrickForumTemplates,
                     FoxtrickForumPreview,
                     FoxtrickForumYouthIcons,
                     BookmarkAdjust,
                     FoxtrickHideManagerAvatar,
                     FoxtrickRedirManagerToTeam,
					 FoxtrickMoveLinks,
                     FoxtrickAlltidFlags,  // keep before FoxtrickHideManagerAvatarUserInfo
					 FoxtrickCopyPostID,  
					 FoxtrickHideManagerAvatarUserInfo,
                     FoxtrickForumStaffMarker,
                     FoxtrickGoToPostBox,
                     FoxtrickMedianTransferPrice,
                     FoxtrickYouthSkillNotes,
                     FoxtrickAddLeaveConfButton,
                     FoxtrickFlipSidesInMatchOrders,
                     FoxtrickStarsCounter,
                     FoxtrickAdvancedStarsCounter,
                     FoxtrickFormationBoxInMatchOrders,
                     FoxtrickFlagCollectionToMap,
                     FoxtrickTransferListSearchFilters,
                     FoxtrickTeamPopupLinks,
					 FoxtrickMatchPlayerColouring,
                     AttVsDef, // AttVsDef should be placed before Ratings
					 Ratings,
                     FoxtrickAlert,
                     FoxtrickHideFaceTransferImages,
                     FoxtrickHideFaceInjuryImages,
                     FoxtrickHideFaceSuspendedImages,
                     FoxtrickColouredYouthFaces,
                     FoxtrickLinksCustom,
                     FoxtrickLinksLeague,
                     FoxtrickLinksCountry,
                     FoxtrickLinksTeam,
                     FoxtrickLinksChallenges,
                     FoxtrickLinksEconomy,
                     FoxtrickLinksYouthOverview,
                     FoxtrickLinksArena,
                     FoxtrickLinksCoach,
                     FoxtrickLinksPlayerDetail,
                     FoxtrickLinksMatch,
                     FoxtrickLinksTraining,
                     FoxtrickAddManagerButtons,
                     FoxtrickTruncateLongNicks,
                     FoxtrickAddDefaultFaceCard,
                     FoxtrickConfirmPlayerBid,
					 FoxtrickConfirmTL,
                     FoxtrickEconomyDifference,
                     FoxtrickHideSignatures,
                     FoxtrickForumNextAndPrevious,
                     FoxtrickPersonalityImages,
                     FoxtrickSkillColoring,
                     //FoxtrickSkinPlugin,
                     FoxtrickHTThreadMarker,
					 FoxtrickHelper,
					 FTTeamStats,
					 FoxtrickLargeFlags,
					 FoxtrickTeamSelectBox
                   ];
