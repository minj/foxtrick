/**
 * api-proxy.js
 * Proxy for authorizing and retrieving XML data from Hattrick
 * @author ryanli
 */

if (!Foxtrick) var Foxtrick = {};

Foxtrick.ApiProxy = {
	MODULE_NAME : "ApiProxy",
	CORE_MODULE : true,
	PAGES : ["all"],

	consumerKey : "sKDixHQBSGgdJ3a9O6lRtL",
	consumerSecret : "DIZIDBTX64d0+-9fPq8GrYN5PNHtMxYhpS9ZKsbcPqf",

	signatureMethod : "HMAC-SHA1",
	requestTokenUrl : "https://chpp.hattrick.org/oauth/request_token.ashx",
	authorizeUrl : "https://chpp.hattrick.org/oauth/authorize.aspx",
	accessTokenUrl : "https://chpp.hattrick.org/oauth/access_token.ashx",

	run : function(page, doc) {
		var teamId = FoxtrickHelper.getOwnTeamId();
		if (teamId && !this.authorized(teamId)) {
			Foxtrick.util.note.add(doc, null, "ft-api-proxy",
				this.authorize(doc), null, null, false);
		}
	},

	authorized : function(teamId) {
		return FoxtrickPrefs.getString("oauth." + teamId + ".accessToken")
			&& FoxtrickPrefs.getString("oauth." + teamId + ".accessTokenSecret");
	},

	authorize : function(doc) {
		var teamId = FoxtrickHelper.getOwnTeamId();
		var div = doc.createElement("div");
		var accessor = {
			consumerSecret : Foxtrick.ApiProxy.consumerSecret,
			tokenSecret : null
		};
		var msg = {
			action : Foxtrick.ApiProxy.requestTokenUrl,
			method : "get",
			parameters : [
				["oauth_consumer_key", Foxtrick.ApiProxy.consumerKey],
				["oauth_signature_method", Foxtrick.ApiProxy.signatureMethod],
				["oauth_signature", ""],
				["oauth_timestamp", ""],
				["oauth_nonce", ""],
				["oauth_callback", "oob"] // no callback
			]
		};
		OAuth.setTimestampAndNonce(msg);
		OAuth.SignatureMethod.sign(msg, accessor);
		var requestTokenUrl = OAuth.addToURL(Foxtrick.ApiProxy.requestTokenUrl, msg.parameters);
		var link = doc.createElement("a");
		link.className = "ft-link";
		link.textContent = Foxtrickl10n.getString("oauth.authorize");
		link.addEventListener("click", function(ev) {
			showNotice();
			Foxtrick.load(requestTokenUrl, function(text) {
				var requestToken = text.split(/&/)[0].split(/=/)[1];
				var requestTokenSecret = text.split(/&/)[1].split(/=/)[1];
				var addInput = function() {
					var input = doc.createElement("input");
					div.appendChild(input);
					var button = doc.createElement("input");
					button.type = "button";
					button.value = Foxtrickl10n.getString("button.authorize");
					button.addEventListener("click", function(ev) {
						var accessor = {
							consumerSecret : Foxtrick.ApiProxy.consumerSecret,
							tokenSecret : requestTokenSecret
						};
						var msg = {
							action : Foxtrick.ApiProxy.accessTokenUrl,
							method : "get",
							parameters : [
								["oauth_consumer_key", Foxtrick.ApiProxy.consumerKey],
								["oauth_token", requestToken],
								["oauth_signature_method", Foxtrick.ApiProxy.signatureMethod],
								["oauth_signature", ""],
								["oauth_timestamp", ""],
								["oauth_nonce", ""],
								["oauth_verifier", input.value]
							]
						};
						OAuth.setTimestampAndNonce(msg);
						OAuth.SignatureMethod.sign(msg, accessor);
						var query = OAuth.formEncode(msg.parameters);
						var accessTokenUrl = Foxtrick.ApiProxy.accessTokenUrl + "?" + query;
						Foxtrick.load(accessTokenUrl, function(text) {
							var accessToken = text.split(/&/)[0].split(/=/)[1];
							var accessTokenSecret = text.split(/&/)[1].split(/=/)[1];
							FoxtrickPrefs.setString("oauth." + teamId + ".accessToken", accessToken);
							FoxtrickPrefs.setString("oauth." + teamId + ".accessTokenSecret", accessTokenSecret);
							showFinished();
						}, true);
					}, false);
					div.appendChild(button);
				};
				var authorizeTokenUrl = Foxtrick.ApiProxy.authorizeUrl + "?" + text;
				Foxtrick.newTab(authorizeTokenUrl);
				addInput();
			}, true); // cross-site
		}, false);
		div.appendChild(link);
		var showNotice = function() {
			div.removeChild(link);
			var notice = doc.createElement("p");
			notice.textContent = Foxtrickl10n.getString("oauth.instructions");
			div.appendChild(notice);
		};
		var showFinished = function() {
			div.textContent = Foxtrickl10n.getString("oauth.success");
		}
		return div;
	},

	retrieve : function(doc, file, parameters) {
	}
};
