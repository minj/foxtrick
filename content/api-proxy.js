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
	resourceUrl : "http://chpp.hattrick.org/chppxml.ashx",

	authorized : function() {
		return Foxtrick.ApiProxy.getAccessToken()
			&& Foxtrick.ApiProxy.getAccessTokenSecret();
	},

	authorize : function(doc) {
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
							Foxtrick.ApiProxy.setAccessToken(accessToken);
							Foxtrick.ApiProxy.setAccessTokenSecret(accessTokenSecret);
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
		Foxtrick.util.note.add(doc, null, "ft-api-proxy-auth", div, null,
			false, false, false);
	},

	retrieve : function(doc, parameters, callback) {
		if (!Foxtrick.ApiProxy.authorized()) {
			Foxtrick.ApiProxy.authorize(doc);
			callback(null);
			return;
		}
		var accessor = {
			consumerSecret : Foxtrick.ApiProxy.consumerSecret,
			tokenSecret : Foxtrick.ApiProxy.getAccessTokenSecret()
		};
		var msg = {
			action : Foxtrick.ApiProxy.resourceUrl,
			method : "get",
			parameters : parameters
		};
		OAuth.setParameters(msg, [
			["oauth_consumer_key", Foxtrick.ApiProxy.consumerKey],
			["oauth_token", Foxtrick.ApiProxy.getAccessToken()],
			["oauth_signature_method", Foxtrick.ApiProxy.signatureMethod],
			["oauth_signature", ""],
			["oauth_timestamp", ""],
			["oauth_nonce", ""],
		]);
		OAuth.setTimestampAndNonce(msg);
		OAuth.SignatureMethod.sign(msg, accessor);
		var url = OAuth.addToURL(Foxtrick.ApiProxy.resourceUrl, msg.parameters);
		Foxtrick.dump("URL: " + url + "\n");
		Foxtrick.LoadXML(url, function(x, status) {
			Foxtrick.dump("Status: " + status + "\n" + x + "\n");
			if (status == 200)
				callback(x);
			else
				Foxtrick.ApiProxy.authorize(doc);
		}, true);
	},

	getAccessToken : function() {
		const teamId = FoxtrickHelper.getOwnTeamId();
		return FoxtrickPrefs.getString("oauth." + teamId + ".accessToken");
	},

	setAccessToken : function(token) {
		const teamId = FoxtrickHelper.getOwnTeamId();
		FoxtrickPrefs.setString("oauth." + teamId + ".accessToken", token);
	},

	getAccessTokenSecret : function() {
		const teamId = FoxtrickHelper.getOwnTeamId();
		return FoxtrickPrefs.getString("oauth." + teamId + ".accessTokenSecret");
	},

	setAccessTokenSecret : function(secret) {
		const teamId = FoxtrickHelper.getOwnTeamId();
		FoxtrickPrefs.setString("oauth." + teamId + ".accessTokenSecret", secret);
	},
};
