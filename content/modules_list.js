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
                     FoxtrickForumStaffMarker,
                     FoxtrickMedianTransferPrice,
                     FoxtrickTeamPopupLinks,
                     FoxtrickAddLeaveConfButton,
                     Matches ];
////////////////////////////////////////////////////////////////////////////////

