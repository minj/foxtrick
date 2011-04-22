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
		Foxtrick.OAuth.setTimestampAndNonce(msg);
		Foxtrick.OAuth.SignatureMethod.sign(msg, accessor);
		var requestTokenUrl = Foxtrick.OAuth.addToURL(Foxtrick.ApiProxy.requestTokenUrl, msg.parameters);
		var link = doc.createElement("a");
		link.className = "ft-link";
		link.textContent = Foxtrickl10n.getString("oauth.authorize");
		link.addEventListener("click", function(ev) {
			showNotice();
			var linkPar = doc.createElement("p");
			div.appendChild(linkPar);
			linkPar.appendChild(Foxtrick.util.note.createLoading(doc, true));
			Foxtrick.dump("Requesting token at: " + requestTokenUrl + "\n");
			Foxtrick.load(requestTokenUrl, function(text, status) {
				linkPar.textContent = ""; // clear linkPar first
				if (status != 200) {
					// failed to fetch link
					linkPar.textContent = Foxtrickl10n.getString("exception.error").replace(/%s/, status);
					return;
				}
				var requestToken = text.split(/&/)[0].split(/=/)[1];
				var requestTokenSecret = text.split(/&/)[1].split(/=/)[1];
				// link
				var link = doc.createElement("a");
				link.title = link.href = Foxtrick.ApiProxy.authorizeUrl + "?" + text;
				link.textContent = Foxtrickl10n.getString("oauth.link");
				link.target = "_blank";
				linkPar.appendChild(link);
				// input
				var inputPar = doc.createElement("p");
				div.appendChild(inputPar);
				var input = doc.createElement("input");
				inputPar.appendChild(input);
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
					Foxtrick.OAuth.setTimestampAndNonce(msg);
					Foxtrick.OAuth.SignatureMethod.sign(msg, accessor);
					var query = Foxtrick.OAuth.formEncode(msg.parameters);
					var accessTokenUrl = Foxtrick.ApiProxy.accessTokenUrl + "?" + query;
					Foxtrick.dump("Requesting access token at: " + accessTokenUrl + "\n");
					Foxtrick.load(accessTokenUrl, function(text) {
						var accessToken = text.split(/&/)[0].split(/=/)[1];
						var accessTokenSecret = text.split(/&/)[1].split(/=/)[1];
						Foxtrick.ApiProxy.setAccessToken(accessToken);
						Foxtrick.ApiProxy.setAccessTokenSecret(accessTokenSecret);
						showFinished();
					}, true); // save token and secret
				}, false); // after hitting "authorize" button
				inputPar.appendChild(button);
			}, true); // get authorize URL with Foxtrick.load()
		}, false); // initial authorize link event listener
		div.appendChild(link);
		var showNotice = function() {
			div.removeChild(link);
			var notice = doc.createElement("p");
			// in Firefox "\n" as literal is translated into line feed
			var paragraphs = Foxtrickl10n.getString("oauth.instructions").replace(/\n/g, "\\n").split(/\\n/);
			for (var i = 0; i < paragraphs.length; ++i) {
				notice.appendChild(doc.createTextNode(paragraphs[i]));
				if (i != paragraphs.length - 1)
					notice.appendChild(doc.createElement("br"));
			}
			div.appendChild(notice);
			// link to FAQ
			var more = doc.createElement("a");
			more.textContent = Foxtrickl10n.getString("oauth.why");
			more.href = Foxtrick.ResourcePath + "preferences.xhtml#faq=authorize";
			more.target = "_blank";
			div.appendChild(more);
		};
		var showFinished = function() {
			div.textContent = Foxtrickl10n.getString("oauth.success");
		}
		Foxtrick.util.note.add(doc, null, "ft-api-proxy-auth", div, null,
			false, false, false);
	},

	retrieve : function(doc, parameters, callback) {
		FoxtrickHelper.getOwnTeamInfo(doc); // retrieve team ID first
		Foxtrick.dump("ApiProxy: attempting to retrieve: " + parameters + "…\n");
		if (!Foxtrick.ApiProxy.authorized()) {
			Foxtrick.dump("ApiProxy: unauthorized.\n");
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
		Foxtrick.OAuth.setParameters(msg, [
			["oauth_consumer_key", Foxtrick.ApiProxy.consumerKey],
			["oauth_token", Foxtrick.ApiProxy.getAccessToken()],
			["oauth_signature_method", Foxtrick.ApiProxy.signatureMethod],
			["oauth_signature", ""],
			["oauth_timestamp", ""],
			["oauth_nonce", ""],
		]);
		Foxtrick.OAuth.setTimestampAndNonce(msg);
		Foxtrick.OAuth.SignatureMethod.sign(msg, accessor);
		var url = Foxtrick.OAuth.addToURL(Foxtrick.ApiProxy.resourceUrl, msg.parameters);
		Foxtrick.dump("Fetching XML data from " + url + "\n");
		Foxtrick.loadXml(url, function(x, status) {
			if (status == 200) {
				callback(x);
			}
			else if (status == 401) {
				Foxtrick.dump("ApiProxy: error 401, unauthorized. Arguments: " + parameters + ".\n");
				Foxtrick.ApiProxy.invalidateAccessToken(doc);
				Foxtrick.ApiProxy.authorize(doc);
				callback(null);
			}
			else {
				Foxtrick.dump("ApiProxy: error " + status + ". Arguments: " + parameters + "\n");
				callback(null);
			}
		}, true);
	},

	invalidateAccessToken : function() {
		Foxtrick.ApiProxy.setAccessToken("");
		Foxtrick.ApiProxy.setAccessTokenSecret("");
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
