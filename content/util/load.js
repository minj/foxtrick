'use strict';
/*
 * load.js
 * loading files
 */

if (!Foxtrick)
	var Foxtrick = {};

/**
 * Parse data as JSON.
 *
 * Logs bad input in case of errors and returns null instead.
 *
 * @param  {string} data
 * @return {object}
 */
Foxtrick.parseJSON = function(data) {
	var ret = null;
	try {
		ret = JSON.parse(data);

		if (typeof ret !== 'object') {
			Foxtrick.log(new TypeError('Bad JSON: non-object'), data);
			ret = null;
		}
	}
	catch (e) {
		Foxtrick.log('Bad JSON:', e, data);
	}
	return ret;
};

/**
 * Fetch a url.
 *
 * Returns a Promise that fulfills with a string on success
 * or rejects with {url, status, text, params}.
 *
 * params is optional, switches to POST.
 *
 * @param  {string}  url
 * @param  {object}  params {?object}
 * @return {Promise}
 */
Foxtrick.fetch = function(url, params) {
	const ERROR_XHR_FATAL = 'FATAL error in XHR:';

	url = Foxtrick.util.load._parseUrl(url);

	if (Foxtrick.context == 'content') {

		return new Promise(function(fulfill, reject) {
			Foxtrick.SB.ext.sendRequest({ req: 'fetch', url: url, params: params },
			  function(response) {
				if (typeof response === 'string') {
					fulfill(response);
				}
				else {
					Foxtrick.log('XHR failed:', response);
					reject(response);
				}
			});
		});

	}
	else {

		return new Promise(function(resolve) {
			var type = params ? 'POST' : 'GET';

			var req = new window.XMLHttpRequest();
			req.open(type, url, true);

			if (typeof req.overrideMimeType === 'function')
				req.overrideMimeType('text/plain');

			// Send the proper header information along with the request
			if (type == 'POST' && typeof req.setRequestHeader === 'function')
				req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

			req.onload = function() {
				// README: safari returns chrome resources with status=0
				if (this.status >= 200 && this.status < 300 ||
				    this.status === 0 && this.responseText) {

					resolve(this.responseText);

				}

				// always resolve at this point
				resolve({ url: url, status: this.status, text: this.responseText, params: params });
			};

			req.onerror = function() {
				// always resolve at this point
				resolve({ url: url, status: this.status, text: this.responseText, params: params });
			};

			req.onabort = function() {
				// always resolve at this point
				resolve({ url: url, status: -1, text: this.responseText, params: params });
			};

			req.send(params);
		})
		.catch(function(e) {
			// handle fatal errors in Promise constructor
			Foxtrick.log(ERROR_XHR_FATAL, e);
			return { url: url, status: -1, text: ERROR_XHR_FATAL + e.message, params: params };
		}).then(function(resp) {
			// handle non-fatal errors by rejecting
			if (typeof resp !== 'string')
				return Promise.reject(resp);

			return resp;
		});
	}
};

if (!Foxtrick.util)
	Foxtrick.util = {};

Foxtrick.util.load = {};

/**
 * Pre-process a URL to insert variables
 * @param  {string} url
 * @return {string}
 */
Foxtrick.util.load._parseUrl = function(url) {
	url = url.replace(/\/res\/%d\//, function() {
		// get a timestamp in the form 150324, i. e. $(date +'%y%m%d')
		// use HT date or -1 so as not to mess up due to wrong system time (in the future)
		// -1 refers to 691231 which was tagged for default cases
		var time = parseInt(Foxtrick.Prefs.getString('lastTime'), 10) || -1;
		var date = new Date(time).toISOString().slice(2, 10).replace(/\D/g, '');
		return '/res/' + date + '/';
	});
	return url;
};

/*
 * Load external URL asynchronously
 * @param url - URL
 * @param params - params != null makes it and used for a POST request
 * @param callback - function to be called when succeeded or failed
 * @callback_param String of text content if success or null if failure
 * @callback_param HTTP status code
 */
Foxtrick.util.load.async = function(url, callback, params) {
	url = this._parseUrl(url);
	if (Foxtrick.context == 'content') {
		// background script for xml requests
		Foxtrick.SB.ext.sendRequest({ req: 'getXml', url: url, params: params },
		  function(response) {
			try {
				callback(response.data, response.status);
			}
			catch (e) {
				Foxtrick.log('Uncaught callback error: - url: ', url, ': ', e);
			}
		});
	}
	else {
		var req = new window.XMLHttpRequest();
		var type = (params != null) ? 'POST' : 'GET';
		req.open(type, url, true);
		if (typeof(req.overrideMimeType) == 'function')
			req.overrideMimeType('text/plain');
		//Send the proper header information along with the request
		if (type == 'POST' && typeof(req.setRequestHeader) == 'function')
			req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

		req.onloadend = function() {
			try {
				callback(req.responseText, req.status);
			}
			catch (e) {
				Foxtrick.log('Uncaught callback error: - url: ' + url + ' params: ' + params, e);
			}
		};

		try {
			req.send(params);
		}
		catch (e) {
			// catch cross-domain errors
			Foxtrick.log(url + ' ' + params, e);
			callback(null, 0);
		}
	}
};

/*
 * @desc load a resource synchronusly (Not to be used in content modules).
 * only to be used for internal resources
 */
Foxtrick.util.load.sync = function(url) {
	if (url.replace(/^\s+/, '').indexOf(Foxtrick.InternalPath) != 0) {
		Foxtrick.log('loadSync only for internal resources. ', url, "isn't , only ",
		             Foxtrick.InternalPath, ' is');
		return null;
	}
	// load
	var req = new window.XMLHttpRequest();

	req.open('GET', url, false); //sync load of a chrome resource
	if (typeof(req.overrideMimeType) == 'function')
		req.overrideMimeType('text/plain');

	try {
		req.send(null);
		return req.responseText;
	}
	catch (e) {
		// catch non-existing
		Foxtrick.log('loadSync: cannot find or load: ', url);
		return null;
	}
};

/*
 * @desc load and parse xml asynchronously.
 */
Foxtrick.util.load.xml = function(url, callback) {
	Foxtrick.util.load.async(url, function(text, status) {
		if (text.indexOf('!DOCTYPE html') !== -1) {
			// eg login page was returned. aka cpp server not reachable
			var errorCode = 503;
			if (text.search(/<title>\d+/i) !== -1)
				errorCode = text.match(/<title>(\d+)/i)[1];
			Foxtrick.log(url, '\nreturned an html page.',
			             'Server could be down. Assumed errorCode:', errorCode);
			callback(null, errorCode);
			return;
		}

		try {
			var xml = Foxtrick.parseXml(text);
		}
		catch (e) {
			// invalid XML
			Foxtrick.log('Cannot parse XML (', url, ')\n', text);
			xml = null;
		}
		callback(xml, status);
	});
};

/*
 * @desc load and parse xml synchronously. only to be used for internal repository
 */
Foxtrick.util.load.xmlSync = function(url) {
	var text = Foxtrick.util.load.sync(url);
	try {
		var xml = Foxtrick.parseXml(text);
	}
	catch (e) {
		// invalid XML
		Foxtrick.log('Cannot parse XML (', url, ')\n', text);
		xml = null;
	}
	return xml;
};


/*
 * @desc load and parse yaml synchronously. only to be used for internal repository
 */
Foxtrick.util.load.ymlSync = function(url) {

	try {
		var text = Foxtrick.util.load.sync(url);
		var json = (text !== null) ? Foxtrick.jsyaml.safeLoad(text) : null;
	}
	catch (e) {
		// invalid YML
		var InputDump = function(text) {
			this.text = text;
		};
		var yError = 'Please check to see if the text has tabs instead of spaces, ' +
			'unescaped quotes or other weird shit.\n';
		Foxtrick.log('Cannot parse YML (', url, ')\n', yError, e, new InputDump(text));
		json = null;
	}
	return json;
};

/*
 * @desc html5 filepicker for dataUrl. eg pictures and sounds
 */
Foxtrick.util.load.filePickerForDataUrl = function(doc, callback) {
	var input = doc.createElement('input');
	input.type = 'file';
	input.addEventListener('change', function(ev) {
		var win = this.ownerDocument.defaultView;
		var file = this.files[0];
		var reader = new win.FileReader();
		reader.onerror = function(e) {
			win.alert('Error code: ' + e.target.error.code);
			callback(null);
		};
		reader.onload = function(e) {
			var dataUrl = e.target.result;
			if (dataUrl.length > 164000) {
				win.alert('File too large');
				dataUrl = null;
			}
			callback(dataUrl);
		};
		reader.readAsDataURL(file);
	}, false);
	return input;
};

/*
 * @desc html5 filepicker for text
 */
Foxtrick.util.load.filePickerForText = function(doc, callback) {
	var input = doc.createElement('input');
	input.type = 'file';
	input.addEventListener('change', function(ev) {
		var win = this.ownerDocument.defaultView;
		var file = this.files[0];
		var reader = new win.FileReader();
		reader.onerror = function(e) {
			win.alert('Error code: ' + e.target.error.code);
			callback(null);
		};
		reader.onload = function(e) {
			var text = e.target.result;
			if (text.length > 64000) {
				win.alert('File too large');
				text = null;
			}
			callback(text);
		};
		reader.readAsText(file);
	}, false);
	return input;
};
