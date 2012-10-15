'use strict';

if (!Foxtrick)
    var Foxtrick = {};
if (!Foxtrick.api)
    Foxtrick.api = {};
if (!Foxtrick.api.hy)
    Foxtrick.api.hy = {};
if (!Foxtrick.api.hy.URL)
    Foxtrick.api.hy.URL = {};
/* user-id.js
 * Functions working the HY userId API supplied by HY.
 * @author LA-MJ, HY backend/API by MackShot
 *
 * @Interface:
 * 		Url: http://www.hattrick-youthclub.org/_data_provider/foxtrick/user/id
 * @params:
 * 		teamid
 * 			teamid
 * 		app
 * 			'foxtrick'
 * 		identifier
 * 			unique string each request
 * 		hash
 * 			'foxtrick_' + teamId + '_' + identifier;
 *
 * @response
 *		integer
 *			HY user ID or -1 if not a HY user
 */
Foxtrick.api.hy.URL['user-id'] = 'http://stage.hattrick-youthclub.org' +
	'/_data_provider/foxtrick/user/id';

Foxtrick.api.hy.runIfHYUser = function(callback) {
	var teamId = Foxtrick.modules['Core'].getSelfTeamInfo().teamId;
	//assemble param string
	var params = 'teamId=' + teamId;
	params = params + '&app=foxtrick';
	var d = new Date();
	var identifier = teamId + '_' + d.getTime();
	params = params + '&identifier=' + identifier;
	var hash = 'foxtrick_' + teamId + '_' + identifier;
	params = params + '&hash=' + Foxtrick.encodeBase64(hash);

	Foxtrick.log('HY_API: user-id', params);

	//load and callback
	Foxtrick.util.load.async(Foxtrick.api.hy.URL['user-id'],
	  function(response, status) {
		switch (status) {
			case 200:
				Foxtrick.log(response);
				break;
			default:
				Foxtrick.log('Unhandeled Error ' + status + ': ' + response);
				break;
		}
	}, params);

};
