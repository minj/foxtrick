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
                     BookmarkAdjust,
                     FoxtrickHideManagerAvatar,
                     FoxtrickMoveLinks,
                     FoxtrickAlltidFlags,  // keep before FoxtrickHideManagerAvatarUserInfo
					 FoxtrickHideManagerAvatarUserInfo,
                     FoxtrickForumStaffMarker,
                     FoxtrickMedianTransferPrice,
                     FoxtrickYouthSkillNotes,
                     FoxtrickAddLeaveConfButton,
                     FoxtrickFlipSidesInMatchOrders,
                     FoxtrickStarsCounter,
                     FoxtrickFormationBoxInMatchOrders,
                     FoxtrickFlagCollectionToMap,
                     FoxtrickTransferListSearchFilters,
                     FoxtrickTeamPopupLinks,
                     AttVsDef, // AttVsDef should be placed before Ratings
					 Ratings,
                     FoxtrickAlert,
                     FoxtrickHideFaceTransferImages,
                     FoxtrickHideFaceInjuryImages,
					 FoxtrickHideFaceSuspendedImages,
					 FoxtrickColouredYouthFaces,
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
					 FoxtrickShowMessageButton,
					 FoxtrickTruncateLongNicks,
					 FoxtrickAddDefaultFaceCard,
					 FoxtrickConfirmPlayerBid,
					 FoxtrickEconomyDifference
                   ];
