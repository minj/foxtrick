//MatchAnalysis.js?v=12293
ht.views.SetupSectorRatingsOrg = ht.views.SetupSectorRatings;
ht.views.SetupPlayerRatingsOrg = ht.views.SetupPlayerRatings;
ht.views.SetupSectorRatings = function() {
	ht.views.SetupSectorRatingsOrg.apply(this, arguments);
	ht.eventManager.timeLineEventPanelClick(ht.$('.event' +
												 ht.matchAnalysis.currentEventPanel.toString()));
};
ht.views.SetupPlayerRatings = function() {
	ht.views.SetupPlayerRatingsOrg.apply(this, arguments);
	ht.eventManager.timeLineEventPanelClick(ht.$('.event' +
												 ht.matchAnalysis.currentEventPanel.toString()));
};
