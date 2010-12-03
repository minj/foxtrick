if (!Foxtrick) var Foxtrick = {};
Foxtrick.links = {};

Foxtrick.links.getLinkOptions = function(module, linktype, extra_options) {
	try {
		var options = [];
		var country_options = [];

		for (var key in Foxtrick.LinkCollection.stats) {
			var stat = Foxtrick.LinkCollection.stats[key];
			if (stat[linktype]!=null) {
				var title = stat["title"];

				var filters = stat[linktype]["filters"];
				var countries='';

				for (var i=0; i<filters.length; i++) {
					var filtertype = filters[i];
					if (filtertype == "countryid"
						&& stat["countryidranges"]
						&& stat["countryidranges"].length!=0) {

							var k=0,range;
							while (range = stat["countryidranges"][k++]) {
								var r0=String(range[0]);
								if (k==1) {
									if (r0.length==2) r0='0'+r0;
									else if (r0.length==1) r0='00'+r0;
								}
								if (String(range[0])!=String(range[1])) countries += '[' + r0+'-'+ range[1]+ ']';
								else countries += '[' + r0+']';
								if (stat["countryidranges"][k]) 	countries+=',';
							}
					}
				}
				for (var i=0; i<filters.length; i++) {
					var filtertype = filters[i];
					if (filtertype == "owncountryid"
						&& stat["owncountryidranges"]
						&& stat["owncountryidranges"].length!=0) {
						var k=0,range;
						while (range = stat["owncountryidranges"][k++]) {
							var r0=String(range[0]);
							if (k==1) {
								if (r0.length==2) r0='0'+r0;
								else if (r0.length==1) r0='00'+r0;
							}
							if (String(range[0])!=String(range[1])) countries += '[' + r0+'-'+ range[1]+ ']';
							else countries += '[' + r0+']';
							if (stat["owncountryidranges"][k]) 	countries+=',';
						}
					}
				}
				if (countries!='')
					country_options.push({"key":key,"title":countries+' : '+title});
				else
					options.push({"key":key,"title":title});
			}
		}
		var keysortfunction = function(a, b) {
			return a["title"].localeCompare(b["title"]);
		}
		options.sort(keysortfunction);
		country_options.sort(keysortfunction);
		var i=0,country_option;
		while (country_option = country_options[i++]) {
			options.push({
				"key":country_option.key,
				"title":country_option.title.replace(/^\[0+/,'[')
			});
		}
		for (var key in extra_options) {
			options.push({
				"key":key,
				"title":extra_options[key]
			});
		}
		return options;
	}
	catch (e) {
		Foxtrick.dumpError(e);
		return null;
	}
}

Foxtrick.links.getLinkOptionsArray = function(module, linktypes) {
	try {
		var options = [];
		var country_options = [];
		for (var linktype=0; linktype< linktypes.length; linktype++) {
			for (var key in Foxtrick.LinkCollection.stats) {
				var stat = Foxtrick.LinkCollection.stats[key];
				if (stat[linktypes[linktype]]!=null) {
					var title = stat["title"];
					var filters = stat[linktypes[linktype]]["filters"];
					var countries='';
					for (var i=0; i<filters.length; i++) {
						var filtertype = filters[i];
						if (filtertype == "nationality")
							if (stat["nationalityranges"] && stat["nationalityranges"].length!=0) {
								var k=0,range;
								while (range = stat["nationalityranges"][k++]) {
									var r0=String(range[0]);
									if (countries=='') {
										if (r0.length==2) r0='0'+r0;
										else if (r0.length==1) r0='00'+r0;
									}
									if (String(range[0])!=String(range[1])) countries += '[' + r0+'-'+ range[1]+ ']';
									else countries += '[' + r0+']';
									if (stat["nationalityranges"][k]) 	countries+=',';
								}
							}
						}
						if (filtertype == "countryid"
							&& stat["countryidranges"]
							&& stat["countryidranges"].length!=0) {
							var k=0,range;
							while (range = stat["countryidranges"][k++]) {
								var r0=String(range[0]);
								if (countries=='') {
									if (r0.length==2) r0='0'+r0;
									else if (r0.length==1) r0='00'+r0;
								}
								if (String(range[0])!=String(range[1])) countries += '[' + r0+'-'+ range[1]+ ']';
								else countries += '[' + r0+']';
								if (stat["countryidranges"][k]) 	countries+=',';
							}
						}
					var has_entry=false;
					for (var i = 0; i < options.length; i++)
						if (options[i]["key"]==key)
							has_entry=true;
					if (!has_entry) {
						if (countries!='')
							country_options.push({"key":key,"title":countries+' : '+title});
						else
							options.push({"key":key,"title":title});
					}
				}
			}
		}
		var keysortfunction = function(a, b) {
			return a["title"].localeCompare(b["title"]);
		}
		options.sort(keysortfunction);
		options.sort(keysortfunction);
		var i=0,country_option;
		while (country_option = country_options[i++]) {
			options.push({
				"key":country_option.key,
				"title":country_option.title.replace(/^\[0+/,'[')
			});
		}
		return options;
	}
	catch (e) {
		Foxtrick.dumpError(e);
		return null;
	}
}

Foxtrick.links.getOptionsHtml = function(doc, module, array, linkType, extraOptions) {
	var options = array ? Foxtrick.links.getLinkOptionsArray(module, linkType)
		: Foxtrick.links.getLinkOptions(module, linkType, extraOptions);
	var list = doc.createElement("ul");
	for (var i in options) {
		var item = doc.createElement("li");
		list.appendChild(item);

		var label = doc.createElement("label");
		item.appendChild(label);

		var check = doc.createElement("input");
		check.type = "checkbox";
		check.setAttribute("module", module.MODULE_NAME);
		check.setAttribute("option", options[i]["key"]);
		label.appendChild(check);
		label.appendChild(doc.createTextNode(options[i]["title"]));
	}
	return list;
}
