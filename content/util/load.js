'use strict';
/*
 * load.js
 * loading files
 */

if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.util)
	Foxtrick.util = {};
if (!Foxtrick.util.load)
	Foxtrick.util.load = {};

/**
 * Using XMLHttpRequest by a promise, on which listeners on success and
 * failure status can be registered.
 *
 * Usage:
	Foxtrick.__load(url)('success', function(responseText) {
		...
	})('failure', function(statusCode) {
		...
	});
 *
 * @author ryanli
 */
Foxtrick.util.load.get = function(url, params) {
	// Low-level implementation of XMLHttpRequest:
	// @param params - params != null makes it and used for a POST request
	// Arguments passed to cb is an Object, with following members:
	// status: String, either 'success' or 'failure'
	// code: Integer, HTTP status code
	// text: String, response text
	var loadImpl;
	if (Foxtrick.chromeContext() == 'content') {
		loadImpl = function(cb) {
			Foxtrick.SB.ext.sendRequest({ req: 'getXml', url: url, params: params },
			  function(response) {
				try {
					cb({
						code: response.status,
						status: (response.status < 400) ? 'success' : 'failure',
						text: response.data
					});
				}
				catch (e) {
					Foxtrick.log('Error in callback for getXml', response, e);
				}
			});
		};
	}
	else {
		loadImpl = function(cb) {
			var req = new window.XMLHttpRequest();
			var type = (params != null) ? 'POST' : 'GET';
			req.open(type, url, true);

			if (typeof req.overrideMimeType === 'function')
				req.overrideMimeType('text/plain');
			//Send the proper header information along with the request
			if (type == 'POST' && typeof(req.setRequestHeader) == 'function')
				req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

			req.onloadend = function() {
				var status = (req.status < 400 && req.responseText !== '') ?
					'success' : 'failure';
				cb({
					code: req.status,
					status: status,
					text: req.responseText
				});
			};

			try {
				req.send(params);
			}
			catch (e) {
				// catch cross-domain errors, we return 499 as status code
				Foxtrick.log('Error fetching ' + url + ': ', e);
				cb({
					code: 499,
					status: 'failure',
					text: null
				});
			}
		};
	}

	var status;
	// handlers for each status used as FIFO queues
	var handlers = {};
	// arguments passed to callback functions for each status
	var args = {};

	var promise = function(when, cb) {
		// add inexistent array
		if (!handlers[when])
			handlers[when] = [];
		handlers[when].push(cb);
		trigger();

		return promise;
	};

	// calls callback functions according to status
	var trigger = function() {
		var handlerLst = handlers[status], argLst = args[status];
		if (!handlerLst)
			return;

		while (handlerLst.length) {
			try {
				handlerLst.shift().apply(null, argLst);
			}
			catch (e) {
				Foxtrick.log('Uncaught callback error ', e);
			}
		}
	};

	loadImpl(function(response) {
		if (response.status == 'success') {
			status = 'success';
			args['success'] = [response.text];
		}
		else if (response.status == 'failure') {
			status = 'failure';
			args['failure'] = [response.code];
		}
		trigger();
	});

	return promise;
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
	if (Foxtrick.chromeContext() == 'content') {
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
			Foxtrick.log(url + 'returned an html page. Server could be down. Assumed errorCode: '
			             + errorCode);
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
		var json = (text !== null) ? Foxtrick.YAML.parse(text) : null;
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
		var win = ev.view;
		var file = ev.target.files[0];
		var reader = new win.FileReader();
		reader.onerror = function(e) {
			win.alert('Error code: ' + e.target.error.code);
			callback(null);
		};
		reader.onload = function(evt) {
			var dataUrl = evt.target.result;
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
		var win = ev.target;
		var file = ev.target.files[0];
		var reader = new win.FileReader();
		reader.onerror = function(e) {
			win.alert('Error code: ' + e.target.error.code);
			callback(null);
		};
		reader.onload = function(evt) {
			var text = evt.target.result;
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
